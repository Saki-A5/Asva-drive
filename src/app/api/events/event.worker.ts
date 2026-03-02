import EventModel from "@/models/events";

const upcomingEvents = () => {
    /* Finds events that are coming up within the next 2 days */
}

const currentEvents = async (): Promise<boolean>  => {
    /* Finds Event that are currently going on  */
    const now = new Date();
    const events = await EventModel.find({
        eventStart: { $lte: now },
        eventEnd: { $gte: now }
    });
    if(!events) return true;

    const ids = events.map(event => event._id);
    await EventModel.updateMany({_id: {$in: ids}}, {$set: {status: 'ONGOING'}});

    const eventsByCollege = events.reduce((acc, event) => {
        const collegeId = event.collegeId;
        if (!acc[collegeId]) {
            acc[collegeId] = [];
        }
        acc[collegeId].push(event);
        return acc;
    }, {} as Record<string, typeof events>);

    

    /*
    * Map all events per college
    * Get all the users and map them per college
    * Send notifications of events to different users
    */

    return true;
}

const pastEvents = () => {
    /* Finds events that have passed and sets them to COMPLETED */
}