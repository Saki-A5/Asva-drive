const RequestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        throw new Error("This browser does not support desktop notification");
        return null
    }
    const permission = await Notification.requestPermission();
    return permission;
}

export default RequestNotificationPermission;