import { uploadEventFlier, uploadFile } from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import { adminAuth } from "@/lib/firebaseAdmin";
import EventModel from "@/models/events";
import FileModel from "@/models/files";
import User from "@/models/users";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { file } from "zod";

export const runtime = 'nodejs';

export const POST = async (req: Request) => {
    try {
        await dbConnect();

        //  Get session cookie
        const cookies = req.headers.get('cookie') || '';
        const match = cookies.match(/token=([^;]+)/);
        const sessionCookie = match ? match[1] : null;
        if (!sessionCookie) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Verify session cookie
        const decodedToken = await adminAuth.verifySessionCookie(
            sessionCookie,
            true
        );
        const userEmail = decodedToken.email;
        const user = await User.findOne({ email: userEmail });

        if (user.role !== "admin") return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const eventName = formData.get("eventName") as string || "";
        const eventStartDate = formData.get("eventStartDate") as string || "";
        const eventEndDate = formData.get("eventEndDate") as string || "";
        const flier = formData.get("eventFlier") as File || null;

        // Validate date strings
        const startDateParsed = new Date(eventStartDate);
        const endDateParsed = new Date(eventEndDate);
        if (isNaN(startDateParsed.getTime()) || isNaN(endDateParsed.getTime())) {
            return NextResponse.json({ error: "date strings are not valid" }, { status: 400 });
        }
        if (!eventName || !eventStartDate || !eventEndDate) return NextResponse.json({ error: "Form Data is not complete" }, { status: 400 });
        
        let flierId: Types.ObjectId | null = null;
        if (flier) {
            const flierArrayBuffer = await flier.arrayBuffer();
            const flierBuffer = Buffer.from(flierArrayBuffer);
            const result = await uploadEventFlier(flier.name, flierBuffer, user.collegeId);

            const file = await FileModel.create({
                filename: flier.name, 
                cloudinaryUrl: result?.public_id, 
                ownerId: user.collegeId, 
                uploadedBy: user._id, 
                resourceType: result?.resource_type, 
                mimeType: flier.type, 
                sizeBytes: flier.size
            });
            flierId = file._id;
        }

        // create event
        const event = await EventModel.create({
            name: eventName, 
            collegeId: user.collegeId, 
            ...(flierId && { flierFile: flierId }),
            eventStart: startDateParsed,
            eventEnd: endDateParsed,
        });

        return NextResponse.json({message: "Event has been successfully created", event});

    }
    catch (err: any) {
        console.log(err);
        return NextResponse.json({ error: err.message || 'An Error Occurred' }, { status: 500 });
    }
}