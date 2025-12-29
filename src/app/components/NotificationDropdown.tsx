"use client";


import { useEffect, useState } from "react";
import axios from "axios";

interface Notification {
  _id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await axios.get<Notification[]>("/api/notifications", {
          headers: {
            "x-user-id": typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "",
          },
        });
        setNotifications(res.data);
      } catch (err) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const onMarkAsRead = async (id: string) => {
    try {
      await axios.patch(`/api/notifications/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      // Optionally handle error
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white shadow-lg rounded-lg z-50">
      {loading ? (
        <p className="p-4 text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="p-4 text-gray-500">No notifications</p>
      ) : (
        notifications.map((n) => (
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
