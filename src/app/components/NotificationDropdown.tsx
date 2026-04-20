"use client";

import { Button } from "@/components/ui/button";
import { BellIcon, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

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
  onClose?: () => void;
}

const NotificationDropdown = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: Props) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: "auto", right: "auto", left: "auto" });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="fixed md:absolute right-0 md:right-0 top-auto md:top-auto mt-0 md:mt-2 w-screen md:w-96 md:max-w-md h-screen md:h-auto md:max-h-96 md:rounded-lg bg-white dark:bg-slate-900 shadow-lg md:shadow-xl z-50 md:border md:border-gray-200 dark:md:border-slate-700"
      style={{ bottom: 0, top: "auto" }}
    >
      {/* Mobile Close Button */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
        <span className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-foreground" />
          <span className="font-semibold">Notifications</span>
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900">
        <span className="flex items-center gap-2">
          <BellIcon className="h-5 w-5 text-foreground" />
          <span className="font-semibold">Notifications</span>
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 h-auto py-1 px-2"
          onClick={onMarkAllAsRead}
        >
          Mark All as Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto h-[calc(100vh-120px)] md:h-[calc(384px-60px)] flex flex-col">
        {notifications.length === 0 ? (
          <p className="p-4 text-gray-500 dark:text-gray-400 text-center">
            No notifications
          </p>
        ) : (
          notifications.map(n => (
            <div
              key={n._id}
              className={`p-4 md:p-3 cursor-pointer transition border-b border-gray-100 dark:border-slate-800 active:bg-gray-100 md:hover:bg-gray-100 dark:md:hover:bg-slate-800 ${
                n.read
                  ? ""
                  : "bg-blue-50 dark:bg-slate-800"
              }`}
              onClick={() => {
                onMarkAsRead(n._id);
                onClose?.();
              }}
            >
              <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-gray-100">
                {n.title}
              </p>
              <p className="text-sm md:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {n.body}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Mobile Mark All as Read - Footer */}
      {notifications.length > 0 && (
        <div className="md:hidden sticky bottom-0 p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <Button
            size="sm"
            variant="default"
            className="w-full text-sm"
            onClick={onMarkAllAsRead}
          >
            Mark All as Read
          </Button>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown