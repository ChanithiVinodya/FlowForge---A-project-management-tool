import * as React from 'react';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from '../api/notifications.api';
import { useSocket } from '../hooks/useSocket';
import { 
  Bell, 
  CheckCheck, 
  MessageSquare, 
  UserPlus, 
  ArrowRight, 
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { on } = useSocket();

  const { data: notifications, isLoading } = useQuery<notificationsApi.Notification[]>({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    const off = on('notificationCreated', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => { off(); };
  }, [on, queryClient]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED': return <UserPlus size={18} className="text-blue-400" />;
      case 'COMMENT_ADDED': return <MessageSquare size={18} className="text-purple-400" />;
      case 'PROJECT_INVITATION': return <ArrowRight size={18} className="text-orange-400" />;
      case 'TASK_DUE_SOON': return <Clock size={18} className="text-yellow-400" />;
      case 'TASK_COMPLETED': return <CheckCircle2 size={18} className="text-green-400" />;
      default: return <Bell size={18} className="text-gray-400" />;
    }
  };

  const getMessage = (notification: notificationsApi.Notification) => {
    const { payload, type } = notification;
    switch (type) {
      case 'TASK_ASSIGNED': return (
        <p>You have been assigned to task <span className="font-bold text-foreground">"{payload.title}"</span></p>
      );
      case 'TASK_COMPLETED': return (
        <p>Task <span className="font-bold text-foreground">"{payload.title}"</span> has been completed</p>
      );
      case 'PROJECT_INVITATION': return (
        <p>You've been invited to join <span className="font-bold text-foreground">"{payload.projectName}"</span> as a <span className="capitalize">{payload.role.toLowerCase()}</span></p>
      );
      case 'COMMENT_ADDED': return (
        <p>New comment on task <span className="font-bold text-foreground">"{payload.taskTitle}"</span></p>
      );
      default: return <p>Global update from the system</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications?.filter((n: notificationsApi.Notification) => !n.isRead).length || 0;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Notifications</h1>
          <p className="text-muted-foreground">Keep track of your project updates and mentions.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-bold border border-primary/20"
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications?.length === 0 ? (
          <div className="text-center py-20 bg-card/20 rounded-3xl border-2 border-dashed border-border">
            <Bell size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-muted-foreground/50">All caught up!</h3>
            <p className="text-muted-foreground/30">You have no new notifications.</p>
          </div>
        ) : (
          notifications?.map((notification: notificationsApi.Notification) => (
            <div 
              key={notification.id}
              className={clsx(
                "group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300",
                notification.isRead 
                  ? "bg-transparent border-transparent opacity-60 hover:opacity-100" 
                  : "bg-card border-border shadow-lg shadow-primary/5 hover:border-primary/30"
              )}
            >
              <div className={clsx(
                "mt-1 p-2.5 rounded-xl",
                notification.isRead ? "bg-secondary/30" : "bg-primary/10"
              )}>
                {getIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    {getMessage(notification)}
                  </div>
                  <span className="text-[10px] whitespace-nowrap text-muted-foreground/50 font-medium tracking-wider uppercase">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground">
                      <Calendar size={12} />
                      {notification.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              
              {!notification.isRead && (
                <button 
                  onClick={() => markReadMutation.mutate(notification.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-primary/10 rounded-lg text-primary transition-all"
                  title="Mark as read"
                >
                  <CheckCheck size={18} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
