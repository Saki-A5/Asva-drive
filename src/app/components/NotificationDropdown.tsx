"use client";

interface Notification {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

export default function NotificationDropdown({
  notifications,
  onMarkAsRead,
}: Props) {
  return (
    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg z-50">
      {notifications.length === 0 ? (
        <p className="p-4 text-gray-500">No notifications</p>
      ) : (
        notifications.map(n => (
          <div
            key={n._id}
            className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
              n.read ? "" : "bg-gray-50"
            }`}
            onClick={() => onMarkAsRead(n._id)}
          >
            <p className="font-semibold">{n.title}</p>
            <p className="text-sm text-gray-600">{n.body}</p>
            <p className="text-xs text-gray-400">
              {new Date(n.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
