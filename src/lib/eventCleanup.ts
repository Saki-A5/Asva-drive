import EventModel from "@/models/events";

/**
 * Soft-delete events whose end time has passed.
 * Uses the collection API so it is not blocked by Mongoose validation on legacy docs.
 *
 * Note: A BullMQ job "past-events" in event.worker.ts was intended to run this on a schedule,
 * but nothing enqueues that job in this app—calling this from GET /api/events keeps the list accurate.
 */
export async function softDeletePastEvents(): Promise<void> {
  const now = new Date();
  await EventModel.collection.updateMany(
    {
      eventEnd: { $lte: now },
      isDeleted: { $ne: true },
    },
    {
      $set: {
        status: "COMPLETED",
        isDeleted: true,
        deletedAt: now,
      },
    },
  );
}
