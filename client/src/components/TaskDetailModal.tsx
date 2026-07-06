import * as React from 'react';
import { useState, useEffect } from 'react';
import { X, Tag, Calendar, User, Flag, ExternalLink, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import CommentThread from './CommentThread';
import AttachmentsList from './AttachmentsList';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  listId: string;
  assigneeId?: string;
  createdAt: string;
  assignee?: { id: string; name: string; email: string; avatarUrl?: string };
  labels?: { id: string; name: string; color: string }[];
}

interface TaskDetailModalProps {
  task: Task | null;
  projectId: string;
  onClose: () => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_STYLES: Record<string, string> = {
  TODO: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  IN_REVIEW: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  DONE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

type Tab = 'comments' | 'attachments';

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, projectId, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('comments');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!task) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold leading-tight mb-3">{task.title}</h2>
            <div className="flex flex-wrap gap-2">
              <span className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border',
                PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM,
              )}>
                <Flag size={11} />
                {task.priority}
              </span>
              <span className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border',
                STATUS_STYLES[task.status] || STATUS_STYLES.TODO,
              )}>
                {task.status.replace('_', ' ')}
              </span>
              {task.labels?.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border"
                  style={{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                    borderColor: `${label.color}30`,
                  }}
                >
                  <Tag size={10} />
                  {label.name}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Meta info */}
        <div className="px-6 py-4 border-b border-border bg-secondary/20 grid grid-cols-2 gap-3 shrink-0">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">Assigned to</p>
                <p className="text-sm font-medium">{task.assignee.name}</p>
              </div>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">Due date</p>
                <p className="text-sm font-medium">{format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">Created</p>
              <p className="text-sm font-medium">{format(new Date(task.createdAt), 'MMM d, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="px-6 py-4 border-b border-border shrink-0">
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border px-6 shrink-0">
          {(['comments', 'attachments'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'comments' ? (
            <CommentThread projectId={projectId} taskId={task.id} />
          ) : (
            <AttachmentsList projectId={projectId} taskId={task.id} />
          )}
        </div>
      </div>
    </>
  );
};

export default TaskDetailModal;
