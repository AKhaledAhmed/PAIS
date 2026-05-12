import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://pais-production.up.railway.app/api/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) setNotifications(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(
        `https://pais-production.up.railway.app/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  }

  async function markAllAsRead() {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markAsRead(n._id)));
  }

  function formatTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm text-cyan-700 font-medium hover:underline"
          >
            <CheckCheck size={16}/> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Bell size={48} className="mb-4 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`flex items-start gap-4 px-6 py-4 border-b last:border-0 cursor-pointer hover:bg-gray-50 transition ${
                !n.isRead ? 'bg-cyan-50' : ''
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${
                !n.isRead ? 'bg-cyan-500' : 'bg-gray-200'
              }`} />
              <div className="flex-1">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                  {n.content}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">{formatTime(n.createdAt)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    n.type === 'STATUS_CHANGE' ? 'bg-green-100 text-green-700' :
                    n.type === 'LOW_STOCK' || n.type === 'STOCK_ALERT' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {n.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}