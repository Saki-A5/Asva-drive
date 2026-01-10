
import EventModel from "@/models/events";
import FileModel, { FileInterface } from "@/models/files";
import { HydratedDocument } from "mongoose";
import { deleteAsset, getAssetDeliveryUrl, uploadEventFlier } from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";
import { adminAuth } from "@/lib/firebaseAdmin";

export const runtime = 'nodejs';

export const GET = async (req: Request, { params }: any) => {
    try {
        const { id } = await params;
        const event = await EventModel.findById(id).populate<{ flierFile: HydratedDocument<FileInterface> }>("flierFile");
        if (!event) return NextResponse.json({ error: "There is no Event with that ID" }, { status: 404 });

        // get the url for the event flyer 
        const url = getAssetDeliveryUrl(event.flierFile.cloudinaryUrl, {
            resource_type: event.flierFile.resourceType,
            type: 'authenticated',
            sign_url: true,
            secure: true,
        });

        return NextResponse.json({ event, url });
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

        const event = await EventModel.findById(eventId).populate<{ flierFile: HydratedDocument<FileInterface> }>("flierFile");
        if (!event) return NextResponse.json({ error: "Event was not found" }, { status: 404 });


        const formData = await req.formData();
        const eventName = formData.get("eventName") as string;
        const eventStartDate = formData.get("eventStartDate") as string;
        const eventEndDate = formData.get("eventEndDate") as string;
        const flier = formData.get("eventFlier") as File | null;


        if (eventName) event.name = eventName;

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
            const result = await uploadEventFlier(flier.name, flierBuffer, user.collegeId);

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

        await event.save();

        return NextResponse.json({ message: "Event has been Successfully Updated", event });

    }
    catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}