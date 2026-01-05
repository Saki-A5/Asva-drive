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

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // 🔹 Fetch notifications once
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get<Notification[]>("/api/notifications", {
          withCredentials: true, // 🔐 important
        });

        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  // 🔹 Mark single notification as read
  const markAsRead = async (id: string) => {
    try {
      await axios.patch(
        `/api/notifications/${id}`,
        {},
        { withCredentials: true }
      );

      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, read: true } : n
        )
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative"
      >
        <Bell className="h-6 w-6 mt-2 text-foreground cursor-pointer" />

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={markAsRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
