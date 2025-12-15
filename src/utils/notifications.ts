import { requestNotificationPermission, checkNotificationPermission } from './permissions';

/**
 * @deprecated Use requestNotificationPermission from './permissions' instead
 * This function is kept for backward compatibility
 */
const RequestNotificationPermission = async () => {
    const result = await requestNotificationPermission();
    return result.status;
}

export default RequestNotificationPermission;

// Re-export the new functions for convenience
export { requestNotificationPermission, checkNotificationPermission };