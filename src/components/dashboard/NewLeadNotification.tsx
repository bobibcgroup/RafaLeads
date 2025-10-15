'use client';

import { useState, useEffect } from 'react';
import { X, Bell, User, Phone, MessageCircle } from 'lucide-react';
import { NotificationData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function NewLeadNotification() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // TODO: Implement real-time notifications via WebSocket or polling
    // For now, this is a placeholder component
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="glassmorphism-card p-4 rounded-xl shadow-2xl shadow-indigo-500/20 border-l-4 border-indigo-500 animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                <Badge variant="outline" className="text-xs bg-indigo-500/20 text-indigo-400 border-indigo-500/50">
                  New
                </Badge>
              </div>
              
              <p className="text-sm text-slate-300 mb-2">{notification.message}</p>
              
              {notification.lead && (
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{notification.lead.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{notification.lead.phone}</span>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeNotification(notification.id)}
              className="opacity-70 hover:opacity-100 p-1 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
