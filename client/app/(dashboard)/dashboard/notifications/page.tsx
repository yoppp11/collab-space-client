'use client';

import { motion } from 'framer-motion';
import { Bell, Check, FileText, Users, MessageSquare, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useUnreadNotificationCount,
} from '@/lib/api/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Notification, NotificationType } from '@/lib/types/notification';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

const getNotificationIcon = (type: NotificationType) => {
  const icons: Record<NotificationType, React.ReactNode> = {
    workspace_invite: <Users className="h-5 w-5 text-blue-500" />,
    document_shared: <FileText className="h-5 w-5 text-green-500" />,
    document_mention: <MessageSquare className="h-5 w-5 text-purple-500" />,
    comment_added: <MessageSquare className="h-5 w-5 text-orange-500" />,
    comment_reply: <MessageSquare className="h-5 w-5 text-orange-500" />,
    task_assigned: <CheckSquare className="h-5 w-5 text-yellow-500" />,
    task_completed: <CheckSquare className="h-5 w-5 text-green-500" />,
    workspace_updated: <Users className="h-5 w-5 text-indigo-500" />,
    board_updated: <FileText className="h-5 w-5 text-teal-500" />,
    member_joined: <Users className="h-5 w-5 text-emerald-500" />,
    member_left: <Users className="h-5 w-5 text-red-500" />,
  };
  return icons[type] || <Bell className="h-5 w-5 text-gray-500" />;
};

// NotificationList component moved outside to avoid React anti-pattern
function NotificationList({ 
  notifications, 
  loading,
  markAsRead,
  onNotificationClick,
}: { 
  notifications?: Notification[]; 
  loading: boolean;
  markAsRead: ReturnType<typeof useMarkAsRead>;
  onNotificationClick: (notification: Notification) => void;
}) {
  const { t } = useTranslation('common');
  
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="rounded-full bg-primary/10 p-6 mb-6">
          <Bell className="h-16 w-16 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">{t('notification.no_notifications')}</h3>
        <p className="text-muted-foreground max-w-md">
          You&apos;re all caught up! No new notifications to display.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
      {notifications.map((notification) => (
        <motion.div key={notification.id} variants={item}>
          <Card
            className={`group cursor-pointer hover:shadow-md transition-all duration-300 ${
              !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
            }`}
            onClick={() => onNotificationClick(notification)}
          >
            <CardHeader className="p-4">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border-2">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      {notification.title}
                    </CardTitle>
                    {!notification.is_read && (
                      <Badge variant="default" className="shrink-0">
                        New
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1 line-clamp-2">
                    {notification.message}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {notification.actor && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          {notification.actor.first_name || notification.actor.username}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead.mutateAsync(notification.id);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function NotificationsPage() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const { data: allNotifications, isLoading: loadingAll } = useNotifications();
  const { data: unreadNotifications, isLoading: loadingUnread } = useNotifications({ unread: true });
  const { data: unreadCount } = useUnreadNotificationCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead.mutateAsync(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('notification.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Stay up to date with your team&apos;s activity
          </p>
        </div>
        {unreadCount && unreadCount > 0 ? (
          <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
            <Check className="h-4 w-4" />
            {t('notification.mark_all_read')}
          </Button>
        ) : null}
      </motion.div>

      {/* Notifications Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Bell className="h-4 w-4" />
              All Notifications
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              Unread
              {unreadCount && unreadCount > 0 ? (
                <Badge variant="destructive" className="ml-1">
                  {unreadCount}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <NotificationList 
              notifications={allNotifications} 
              loading={loadingAll}
              markAsRead={markAsRead}
              onNotificationClick={handleNotificationClick}
            />
          </TabsContent>

          <TabsContent value="unread">
            <NotificationList 
              notifications={unreadNotifications} 
              loading={loadingUnread}
              markAsRead={markAsRead}
              onNotificationClick={handleNotificationClick}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
