import { COLLEGE_IDS } from "@/models/colleges";
import EventModel, { EventInterface } from "@/models/events";
import User from "@/models/users";
import { FlattenMaps, Types } from "mongoose";
import Notification from "@/models/notificationSchema";
import { Worker, Job } from "bullmq";

// --- Redis Connection (Upstash) ---
const redisConnection = {
  host: process.env.UPSTASH_REDIS_HOST,
  port: Number(process.env.UPSTASH_REDIS_PORT),
  password: process.env.UPSTASH_REDIS_PASSWORD,
  tls: {},
};

const bulkSendNotifications = async (ids: any[], events: (FlattenMaps<EventInterface> & { _id: Types.ObjectId })[]) => {
    const operations = events.flatMap(event =>
        ids.map(id => ({
            insertOne: {
                document: {
                    userId: id,
                    title: `The event ${event.name} is ongoing today`,
                    body: `The event takes place at the hall...` // this will be changed later
                }
            }
        }))
    );

    await Notification.bulkWrite(operations, {ordered: false});
}

const handleCollegeEventNotification = async (collegeId: COLLEGE_IDS, events: (FlattenMaps<EventInterface> & { _id: Types.ObjectId })[]) => {
    const BATCH_SIZE = 1000; // this can be changed later
    const userCursor = User.find({ collegeId }).select({ _id: 1 }).lean().cursor({ batchSize: BATCH_SIZE });

    let userIds = [];

    for (let user = await userCursor.next(); user != null; user = await userCursor.next()) {
        userIds.push(user._id);

        if (userIds.length === BATCH_SIZE) {
            await bulkSendNotifications(userIds, events);
            userIds = [];
        }
    }

    // handle the remaining users
    if(userIds.length){
        await bulkSendNotifications(userIds, events);
    }
}

const currentEvents = async (): Promise<boolean> => {
    /* Finds Event that are currently going on  */
    const now = new Date();
    const events = await EventModel.find({
        eventStart: { $lte: now },
        eventEnd: { $gte: now }
    }).lean();

    if (!events) return true;

    const ids = events.map(event => event._id);
    await EventModel.updateMany({ _id: { $in: ids } }, { $set: { status: 'ONGOING' } });

    const eventsByCollege = events.reduce((acc, event) => {
        const collegeId = event.collegeId;
        if (!acc[collegeId]) {
            acc[collegeId] = [];
        }
        acc[collegeId].push(event);
        return acc;
    }, {} as Record<COLLEGE_IDS, typeof events>);


    /*
    * Map all events per college
    * Get all the users and map them per college
    * Send notifications of events to different users
    */
    for (const [collegeId, events] of Object.entries(eventsByCollege)){
        console.log(`Starting handling event notification for college ${collegeId}`);
        try{
            await handleCollegeEventNotification(collegeId as COLLEGE_IDS, events);
        }
        catch(e){
            console.log(`Couldn't handle event notification for ${collegeId}`)
        }
    }

    return true;
}

const pastEvents = async () => {
    /* Finds events that have passed and sets them to COMPLETED */
    const now = new Date();
    const events = await EventModel.updateMany({
        eventEnd: {$lte: now}
    }, {$set: {status: "COMPLETED"}});
}

const eventWorker = new Worker(
    "events", 
    async (job: Job) => {
        try{
            switch(job.name){
                case 'ongoing-events': 
                    await currentEvents();
                case 'past-events':
                    await pastEvents();
            }
        }
        catch(err){
            console.log(`[Event Worker] Job Failed: ${job.id}`, err);
        }
    }
)