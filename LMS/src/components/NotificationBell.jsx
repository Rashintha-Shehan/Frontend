import React, { useEffect, useState, useRef } from 'react';
import { FaBell, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../component/api';

function getTypeIcon(type) {
  switch (type) {
    case 'success': return <FaCheckCircle color="#4caf50" style={{ marginRight: 6 }} />;
    case 'warning': return <FaExclamationTriangle color="#ff9800" style={{ marginRight: 6 }} />;
    case 'info':
    default: return <FaInfoCircle color="#2196f3" style={{ marginRight: 6 }} />;
  }
}

function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const bellRef = useRef();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications =>
        notifications.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {}
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => handleMarkAsRead(n.id)));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={bellRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={handleBellClick} style={{ background: 'none', border: 'none', position: 'relative' }}>
        <FaBell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: 12,
          }}>{unreadCount}</span>
        )}
      </button>
      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '120%',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          borderRadius: 8,
          minWidth: 300,
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 600 }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} style={{ fontSize: 12, color: '#2196f3', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all as read</button>
            )}
          </div>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, color: '#888', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                No notifications
              </div>
            ) : notifications.map(n => (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: n.read ? 'white' : '#e3f0ff',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  fontWeight: n.read ? 'normal' : 600,
                  position: 'relative',
                }}
                onClick={() => !n.read && handleMarkAsRead(n.id)}
              >
                {getTypeIcon(n.type)}
                <div style={{ flex: 1 }}>
                  <div>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{timeAgo(n.timestamp)}</div>
                </div>
                {!n.read && <span style={{ width: 8, height: 8, background: '#2196f3', borderRadius: '50%', display: 'inline-block', marginLeft: 8 }}></span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 