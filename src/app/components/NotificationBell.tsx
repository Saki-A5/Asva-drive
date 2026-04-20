"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import axios from "axios";
import useCurrentUser from "@/hooks/useCurrentUser";
import NotificationDropdown from "./NotificationDropdown";

interface Notification {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

interface NotificationResponse {
  data: Notification[]
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { user } = useCurrentUser();
  const bellRef = useRef<HTMLDivElement>(null);

  // Fetch notifications once
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get<NotificationResponse>("/api/notifications", {
          withCredentials: true, // important
        });

        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.read).length);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Mark single notification as read
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

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        "/api/notifications/read-all",
        { userId: user?._id },
        { withCredentials: true }
      );

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div ref={bellRef} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition md:p-0 md:hover:bg-transparent md:dark:hover:bg-transparent"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-foreground cursor-pointer" />

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 md:top-1 md:right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full min-w-5 h-5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default NotificationBell;
