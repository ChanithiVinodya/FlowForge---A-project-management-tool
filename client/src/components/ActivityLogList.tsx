import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import * as activitiesApi from '../api/activities.api';
import { 
  Rocket, 
  Settings, 
  UserPlus, 
  UserMinus, 
  Layout, 
  PlusCircle, 
  Edit3, 
  Move, 
  CheckCircle,
  MessageSquare,
  Paperclip,
  Trash2,
  Clock,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface ActivityLogListProps {
  projectId: string;
}

const ActivityLogList: React.FC<ActivityLogListProps> = ({ projectId }: ActivityLogListProps) => {
  const { data: activities, isLoading } = useQuery<activitiesApi.ActivityLog[]>({
    queryKey: ['activities', projectId],
    queryFn: () => activitiesApi.getProjectActivities(projectId),
  });

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'PROJECT_CREATED': return <Rocket size={14} className="text-blue-400" />;
      case 'PROJECT_UPDATED': return <Settings size={14} className="text-gray-400" />;
      case 'MEMBER_INVITED': return <UserPlus size={14} className="text-green-400" />;
      case 'MEMBER_REMOVED': return <UserMinus size={14} className="text-red-400" />;
      case 'TASK_CREATED': return <PlusCircle size={14} className="text-primary" />;
      case 'TASK_UPDATED': return <Edit3 size={14} className="text-orange-400" />;
      case 'TASK_MOVED': return <Move size={14} className="text-purple-400" />;
      case 'TASK_COMPLETED': return <CheckCircle size={14} className="text-emerald-400" />;
      case 'TASK_DELETED': return <Trash2 size={14} className="text-red-400" />;
      case 'COMMENT_ADDED': return <MessageSquare size={14} className="text-pink-400" />;
      case 'ATTACHMENT_ADDED': return <Paperclip size={14} className="text-cyan-400" />;
      default: return <Clock size={14} className="text-gray-400" />;
    }
  };

  const formatMetadata = (activity: activitiesApi.ActivityLog) => {
    const { action, metadata, task } = activity;
    const taskName = task ? <span className="font-bold text-foreground mx-1">"{task.title}"</span> : null;

    switch (action) {
      case 'TASK_CREATED':
        return <span>created task {taskName}</span>;
      case 'TASK_MOVED':
        return <span>moved task {taskName} to a new column</span>;
      case 'TASK_UPDATED':
        return <span>updated task {taskName}</span>;
      case 'TASK_COMPLETED':
        return <span>completed task {taskName}</span>;
      case 'MEMBER_INVITED':
        return <span>invited <span className="font-bold text-foreground">{metadata.email}</span> as {metadata.role}</span>;
      case 'PROJECT_CREATED':
        return <span>created the project</span>;
      default:
        return <span>performed an action: {action.toLowerCase().replace('_', ' ')}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities?.map((activity: activitiesApi.ActivityLog, idx: number) => (
        <div key={activity.id} className="relative flex gap-4">
          {/* Connector Line */}
          {idx !== activities.length - 1 && (
            <div className="absolute left-3.5 top-8 bottom-[-24px] w-0.5 bg-border/40" />
          )}
          
          <div className="relative z-10 w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shadow-sm shrink-0">
            {getLogIcon(activity.action)}
          </div>
          
          <div className="flex-1 min-w-0 pt-0.5 pb-2">
            <div className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground hover:underline cursor-pointer">
                {activity.actor.name}
              </span>
              {' '}
              {formatMetadata(activity)}
            </div>
            <div className="text-[10px] text-muted-foreground/50 mt-1 font-medium tracking-wide">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityLogList;
