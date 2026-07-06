import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  BarChart2, 
  MessageSquare, 
  Paperclip, 
  Calendar,
  Clock,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string | null;
  commentsCount?: number;
  attachmentsCount?: number;
}

interface KanbanCardProps {
  task: Task;
  projectId: string;
  onClick?: (task: Task) => void;
}

const KanbanCard = ({ task, projectId, onClick }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityMeta = {
    LOW: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' },
    MEDIUM: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500' },
    HIGH: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', dot: 'bg-orange-500' },
    URGENT: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', dot: 'bg-rose-500' },
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-full bg-primary/5 border-2 border-primary/20 rounded-2xl h-24"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className="group bg-background/50 border border-border/50 rounded-2xl p-4 cursor-pointer hover:border-primary/50 hover:bg-background transition-all duration-200 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98] relative overflow-hidden"
    >
      {/* Indicator Line */}
      <div className={clsx(
        "absolute left-0 top-0 bottom-0 w-1 rounded-r-full",
        priorityMeta[task.priority].dot
      )} />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className={clsx(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest",
            priorityMeta[task.priority].color
          )}>
            <div className={clsx("w-1 h-1 rounded-full", priorityMeta[task.priority].dot)} />
            {task.priority}
          </div>
          <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={14} />
          </button>
        </div>
        
        <div className="space-y-1">
          <h4 className="font-bold text-[13px] leading-snug group-hover:text-primary transition-colors">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed opacity-60">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80">
                <Calendar size={12} className="opacity-50" />
                <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
            {(task.commentsCount || 0) > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/80">
                <MessageSquare size={12} className="opacity-50" />
                <span>{task.commentsCount}</span>
              </div>
            )}
          </div>
          
          <div className="flex -space-x-1.5">
            {[1, 2].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[8px] font-black uppercase shadow-sm">
                {['JD', 'AS'][i-1]}
              </div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[7px] font-black text-primary shadow-sm">
               <ChevronRight size={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;

