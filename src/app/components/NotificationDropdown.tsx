"use client";

import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";

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
  onMarkAllAsRead?: () => void;
}

const NotificationDropdown = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: Props) => {
  return (
    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-black shadow-lg rounded-lg z-50">
      <div className="flex items-center justify-between p-2 border-b">
        <span>
          <BellIcon className="inline-block mr-1 h-5 w-5 text-foreground" />
          Notifications</span>
        <Button className="text-xs text-blue-600 hover:underline bg-transparent hover:bg-transparent"
        onClick={onMarkAllAsRead}>Mark All as Read</Button>
      </div>
      {notifications.length === 0 ? (
        <p className="p-4 text-gray-500">No notifications</p>
      ) : (
        notifications.map(n => (
          <div
            key={n._id}
            className={`p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
              n.read ? "" : "bg-gray-100 dark:bg-gray-800"
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

export default NotificationDropdown