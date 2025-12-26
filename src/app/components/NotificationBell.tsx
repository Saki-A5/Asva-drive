"use client";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import axios from "axios";
import NotificationDropdown from "./NotificationDropdown";

interface Notification {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const NotificationBell = async () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications () {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: Notification) => !n.read).length);
    }
    fetchNotifications();
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen((prev) => !prev)} className="relative">
        <Bell className="h-6 w-6 mt-2 text-foreground cursor-pointer" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && <NotificationDropdown />}
    </div>
  );
}

export default NotificationBell;