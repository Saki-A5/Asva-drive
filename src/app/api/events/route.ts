import { getAssetDeliveryUrl, uploadEventFlier } from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import { collegeIdToName } from "@/lib/collegeLabels";
import { adminAuth } from "@/lib/firebaseAdmin";
import EventModel from "@/models/events";
import FileModel, { FileInterface } from "@/models/files";
import User from "@/models/users";
import { HydratedDocument, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { getCloudinaryResourceType } from "../upload/route";
import { softDeletePastEvents } from "@/lib/eventCleanup";

export const runtime = "nodejs";

const SORT_FIELDS = ["eventStart", "eventEnd", "name"] as const;

export const POST = async (req: Request) => {
  try {
    await dbConnect();

    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/token=([^;]+)/);
    const sessionCookie = match ? match[1] : null;
    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const userEmail = decodedToken.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const eventName = (formData.get("eventName") as string) || "";
    const eventDescription =
      ((formData.get("eventDescription") as string) ||
        (formData.get("description") as string) ||
        "").trim();
    const eventStartDate = (formData.get("eventStartDate") as string) || "";
    const eventEndDate = (formData.get("eventEndDate") as string) || "";
    const flier = formData.get("eventFlier") as File | null;

    const startDateParsed = new Date(eventStartDate);
    const endDateParsed = new Date(eventEndDate);
    if (isNaN(startDateParsed.getTime()) || isNaN(endDateParsed.getTime())) {
      return NextResponse.json(
        { error: "date strings are not valid" },
        { status: 400 },
      );
    }
    if (!eventName || !eventDescription || !eventStartDate || !eventEndDate) {
      return NextResponse.json(
        { error: "Form Data is not complete" },
        { status: 400 },
      );
    }

    let flierId: Types.ObjectId | null = null;
    if (flier && flier.size > 0) {
      const flierArrayBuffer = await flier.arrayBuffer();
      const flierBuffer = Buffer.from(flierArrayBuffer);
      const resourceType = getCloudinaryResourceType(flier.type);
      const result = await uploadEventFlier(
        flier.name,
        flierBuffer,
        user.collegeId,
        resourceType,
      );

      const created = await FileModel.create({
        filename: flier.name,
        cloudinaryUrl: result?.public_id,
        ownerId: user.collegeId,
        uploadedBy: user._id,
        resourceType: result?.resource_type,
        mimeType: flier.type,
        sizeBytes: flier.size,
      });
      flierId = created._id;
    }

    const event = await EventModel.create({
      name: eventName,
      description: eventDescription,
      collegeId: user.collegeId,
      createdBy: user._id,
      ...(flierId && { flierFile: flierId }),
      eventStart: startDateParsed,
      eventEnd: endDateParsed,
      isDeleted: false,
      deletedAt: null,
    });

    // Ensure fields exist even if dev server has an old in-memory schema.
    await EventModel.collection.updateOne(
      { _id: event._id as Types.ObjectId },
      { $set: { description: eventDescription, createdBy: user._id } },
    );

    return NextResponse.json({
      message: "Event has been successfully created",
      event,
    });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { error: err.message || "An Error Occurred" },
      { status: 500 },
    );
  }
};

export const GET = async (req: NextRequest) => {
  try {
    await dbConnect();

    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/token=([^;]+)/);
    const sessionCookie = match ? match[1] : null;
    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await softDeletePastEvents();

    const { searchParams } = req.nextUrl;
    const collegeIdParam = searchParams.get("collegeId");
    const sortParam = searchParams.get("sortBy") || "eventStart";
    const orderParam = searchParams.get("order") === "desc" ? -1 : 1;

    const sortBy = SORT_FIELDS.includes(sortParam as (typeof SORT_FIELDS)[number])
      ? sortParam
      : "eventStart";

    const query: Record<string, unknown> = { isDeleted: { $ne: true } };

    if (collegeIdParam && collegeIdParam !== "all") {
      query.collegeId = collegeIdParam;
    } else if (!collegeIdParam && user.role !== "admin") {
      query.collegeId = user.collegeId;
    }

    const events = await EventModel.find(query)
      .sort({ [sortBy]: orderParam })
      .populate<{ flierFile: HydratedDocument<FileInterface> }>("flierFile")
      .lean();

    const eventIds = events.map((e) => e._id as Types.ObjectId);
    const rawDescriptions = await EventModel.collection
      .find(
        { _id: { $in: eventIds } },
        { projection: { _id: 1, description: 1 } },
      )
      .toArray();
    const descriptionMap = new Map(
      rawDescriptions.map((d) => [String(d._id), String(d.description ?? "")]),
    );

    const withLabels = events.map((e) => {
      let flierPreviewUrl: string | null = null;
      const ff = e.flierFile as {
        cloudinaryUrl?: string;
        resourceType?: string;
        mimeType?: string;
      } | null;
      if (ff?.cloudinaryUrl) {
        try {
          flierPreviewUrl = getAssetDeliveryUrl(ff.cloudinaryUrl, {
            resource_type: ff.resourceType ?? "image",
            type: "authenticated",
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
          });
        } catch {
          try {
            flierPreviewUrl = getAssetDeliveryUrl(ff.cloudinaryUrl, {
              resource_type: "image",
              type: "authenticated",
              sign_url: true,
              secure: true,
              expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
            });
          } catch {
            flierPreviewUrl = null;
          }
        }
      }
      return {
        ...e,
        description:
          descriptionMap.get(String(e._id)) ??
          String((e as { description?: string }).description ?? ""),
        collegeName: collegeIdToName(e.collegeId as string),
        flierPreviewUrl,
        flierMimeType: ff?.mimeType ?? null,
        canEdit:
          user.role === "admin" &&
          (String(e.createdBy ?? "") === String(user._id) ||
            (!e.createdBy && String(e.collegeId) === String(user.collegeId))),
        canDelete:
          user.role === "admin" &&
          (String(e.createdBy ?? "") === String(user._id) ||
            (!e.createdBy && String(e.collegeId) === String(user.collegeId))),
      };
    });

    return NextResponse.json({
      message: "Events fetched successfully",
      events: withLabels,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "An Error Occurred" },
      { status: 500 },
    );
  }
};
