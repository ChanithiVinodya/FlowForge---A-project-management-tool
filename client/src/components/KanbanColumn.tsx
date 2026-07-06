import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import KanbanCard from './KanbanCard';
import { MoreHorizontal, Plus, X, ListPlus, GripHorizontal } from 'lucide-react';
import { clsx } from 'clsx';

interface List {
  id: string;
  name: string;
  tasks: any[];
}

interface KanbanColumnProps {
  list: List;
  projectId: string;
  onAddTask: (listId: string, title: string) => void;
  onTaskClick?: (task: any) => void;
}

const KanbanColumn = ({ list, projectId, onAddTask, onTaskClick }: KanbanColumnProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: {
      type: 'Column',
      list,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const handleAdd = () => {
    if (!taskTitle.trim()) return;
    onAddTask(list.id, taskTitle);
    setTaskTitle('');
    setIsAdding(false);
  };

  const taskIds = list.tasks.map(t => t.id);

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-[320px] shrink-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-[2rem] flex flex-col h-full min-h-[500px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "w-[320px] shrink-0 flex flex-col h-full bg-card/40 backdrop-blur-xl border border-border rounded-[2rem] p-5 shadow-xl transition-all duration-300",
        "hover:shadow-2xl hover:border-border/80"
      )}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-between mb-6 cursor-grab active:cursor-grabbing group/header"
      >
        <div className="flex items-center gap-3">
          <GripHorizontal size={18} className="text-muted-foreground opacity-0 group-hover/header:opacity-100 transition-opacity" />
          <h3 className="font-black text-sm tracking-tight uppercase opacity-80">{list.name}</h3>
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-secondary/50 text-[10px] font-black border border-border">
            {list.tasks.length}
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center hover:bg-secondary rounded-lg text-muted-foreground transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {list.tasks.map((task) => (
            <KanbanCard key={task.id} task={task} projectId={projectId} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>

      <div className="mt-6 shrink-0">
        {isAdding ? (
          <div className="bg-background border border-primary/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
            <textarea
              autoFocus
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Record a task..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold resize-none mb-4 p-0 placeholder:opacity-30 leading-relaxed"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAdd();
                }
                if (e.key === 'Escape') setIsAdding(false);
              }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest h-9 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Allocate Task
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-secondary rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all w-full h-12 rounded-2xl bg-secondary/20 border border-border/5 group"
          >
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <Plus size={14} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">New Entry</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;

