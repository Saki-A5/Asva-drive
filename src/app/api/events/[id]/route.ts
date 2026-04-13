import EventModel from "@/models/events";
import FileModel, { FileInterface } from "@/models/files";
import { HydratedDocument, Types } from "mongoose";
import { deleteAsset, getAssetDeliveryUrl, uploadEventFlier } from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";
import { adminAuth } from "@/lib/firebaseAdmin";
import { getCloudinaryResourceType } from "../../upload/route";
import { softDeletePastEvents } from "@/lib/eventCleanup";

export const runtime = 'nodejs';

export const GET = async (req: Request, { params }: any) => {
    try {
        await dbConnect();

        const sessionCookie = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
        if (!sessionCookie) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const viewer = await User.findOne({ email: decodedToken.email });
        if (!viewer) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        await softDeletePastEvents();

        const { id } = await params;
        const event = await EventModel.findOne({
            _id: id,
            isDeleted: { $ne: true },
        }).populate<{ flierFile: HydratedDocument<FileInterface> }>("flierFile");
        if (!event) return NextResponse.json({ error: "There is no Event with that ID" }, { status: 404 });

        const rawEvent = await EventModel.collection.findOne(
            { _id: event._id as Types.ObjectId },
            { projection: { description: 1 } },
        );
        const rawDescription =
            typeof rawEvent?.description === "string" ? rawEvent.description : "";

        let url: string | null = null;
        if (event.flierFile?.cloudinaryUrl) {
            try {
                url = getAssetDeliveryUrl(event.flierFile.cloudinaryUrl, {
                    resource_type: event.flierFile.resourceType ?? "image",
                    type: 'authenticated',
                    sign_url: true,
                    secure: true,
                    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
                });
            } catch {
                url = getAssetDeliveryUrl(event.flierFile.cloudinaryUrl, {
                    resource_type: "image",
                    type: 'authenticated',
                    sign_url: true,
                    secure: true,
                    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
                });
            }
        }

        return NextResponse.json({
            event: {
                ...event.toObject(),
                description: rawDescription || String((event as any).description ?? ""),
            },
            url,
            flierMimeType: event.flierFile?.mimeType ?? null,
            canEdit:
                viewer.role === "admin" &&
                (String(event.createdBy ?? "") === String(viewer._id) ||
                    (!event.createdBy &&
                        String(event.collegeId) === String(viewer.collegeId))),
            canDelete:
                viewer.role === "admin" &&
                (String(event.createdBy ?? "") === String(viewer._id) ||
                    (!event.createdBy &&
                        String(event.collegeId) === String(viewer.collegeId))),
        });
    }
    catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
    }
}


export const PATCH = async (req: Request, { params }: any) => {
    try {
        await dbConnect();

        const sessionCookie = req.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
        if (!sessionCookie) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const user = await User.findOne({ email: decodedToken.email });
        if (user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: eventId } = await params;
        if (!eventId) return NextResponse.json({ error: "event ID is compulsory" }, { status: 400 });

        const event = await EventModel.findOne({
            _id: eventId,
            isDeleted: { $ne: true },
        }).populate<{ flierFile: HydratedDocument<FileInterface> }>("flierFile");
        if (!event) return NextResponse.json({ error: "Event was not found" }, { status: 404 });

        // Backward-compat: allow editing legacy events missing required fields.
        if (!(event as any).description) {
            const raw = await EventModel.collection.findOne(
                { _id: event._id as Types.ObjectId },
                { projection: { description: 1 } },
            );
            (event as any).description =
                typeof raw?.description === "string" ? raw.description : "";
        }


        const formData = await req.formData();
        const eventName = formData.get("eventName") as string;
        const eventDescription = formData.get("eventDescription") as string;
        const eventStartDate = formData.get("eventStartDate") as string;
        const eventEndDate = formData.get("eventEndDate") as string;
        const flier = formData.get("eventFlier") as File | null;


        if (eventName) event.name = eventName;
        if (eventDescription) event.description = eventDescription;

        if (eventStartDate) {
            const startDate = new Date(eventStartDate);
            if (isNaN(startDate.getTime())) {
                return NextResponse.json({ error: "Start Date is not correct" }, { status: 400 });
            }
            event.eventStart = startDate;
        }

        if (eventEndDate) {
            const endDate = new Date(eventEndDate);
            if (isNaN(endDate.getTime())) {
                return NextResponse.json({ error: "end date is not correct" }, { status: 400 });
            }
            event.eventEnd = endDate;
        }


        if (flier) {
            const flierBuffer = Buffer.from(await flier.arrayBuffer());
            const resourceType = await getCloudinaryResourceType(flier.type);
            const result = await uploadEventFlier(flier.name, flierBuffer, user.collegeId, resourceType);

            // Delete old flier if exists
            if (event.flierFile) {
                await Promise.all([
                    deleteAsset(event.flierFile.cloudinaryUrl, event.flierFile.resourceType),
                    FileModel.findByIdAndDelete(event.flierFile._id)
                ]);
            }

            // Create new flier
            const newFile = await FileModel.create({
                filename: flier.name,
                cloudinaryUrl: result?.public_id,
                ownerId: user.collegeId,
                uploadedBy: user._id,
                resourceType: result?.resource_type,
                mimeType: flier.type,
                sizeBytes: flier.size
            });

            event.flierFile = newFile;
        }

        await event.save({ validateBeforeSave: false });
        if (eventDescription) {
            await EventModel.collection.updateOne(
                { _id: event._id as Types.ObjectId },
                { $set: { description: eventDescription } },
            );
        }

        return NextResponse.json({ message: "Event has been Successfully Updated", event });

    }
    catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}

export const DELETE = async (req: Request, { params }: any) => {
    try {
        await dbConnect();

        const sessionCookie = req.headers.get("cookie")?.match(/token=([^;]+)/)?.[1];
        if (!sessionCookie) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const user = await User.findOne({ email: decodedToken.email });
        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: eventId } = await params;
        if (!eventId) {
            return NextResponse.json({ error: "event ID is compulsory" }, { status: 400 });
        }

        const event = await EventModel.findOne({
            _id: eventId,
            isDeleted: { $ne: true },
        }).populate<{ flierFile: HydratedDocument<FileInterface> }>("flierFile");

        if (!event) {
            return NextResponse.json({ error: "Event was not found" }, { status: 404 });
        }

        const canDelete =
            String(event.createdBy ?? "") === String(user._id) ||
            (!event.createdBy &&
                String(event.collegeId) === String(user.collegeId));

        if (!canDelete) {
            return NextResponse.json(
                { error: "You can only delete events you created" },
                { status: 403 },
            );
        }

        if (event.flierFile?.cloudinaryUrl) {
            await Promise.all([
                deleteAsset(event.flierFile.cloudinaryUrl, event.flierFile.resourceType),
                FileModel.findByIdAndDelete(event.flierFile._id),
            ]);
        }

        const now = new Date();
        await EventModel.collection.updateOne(
            { _id: event._id as Types.ObjectId },
            { $set: { isDeleted: true, deletedAt: now } },
        );

        return NextResponse.json({ message: "Event deleted successfully" });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
};