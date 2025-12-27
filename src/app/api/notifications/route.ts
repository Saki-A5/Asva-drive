import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/notificationSchema";

export const GET = async (req: Request) => {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await dbConnect();

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 });

  return Response.json(notifications);
}