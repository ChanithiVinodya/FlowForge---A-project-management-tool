import * as React from 'react';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import * as searchApi from '../api/search.api';
import { 
  Search as SearchIcon, 
  Filter, 
  X, 
  Calendar, 
  Flag, 
  Layers, 
  ExternalLink,
  Loader2,
  Inbox
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import TaskDetailModal from '../components/TaskDetailModal';

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-emerald-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400',
  URGENT: 'text-red-400',
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(queryParam);
  const [selectedTask, setSelectedTask] = useState<searchApi.SearchTask | null>(null);

  // Filters
  const statusFilter = searchParams.get('status') || '';
  const priorityFilter = searchParams.get('priority') || '';

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['search', queryParam, statusFilter, priorityFilter],
    queryFn: () => searchApi.searchTasks({ 
      q: queryParam, 
      status: statusFilter || undefined,
      priority: priorityFilter || undefined 
    }),
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => {
      prev.set('q', localQuery);
      return prev;
    });
  };

  const updateFilter = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value);
      else prev.delete(key);
      return prev;
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col gap-8">
        {/* Header & Search Bar */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-6">Global Search</h1>
          <form onSubmit={handleSearch} className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-lg shadow-primary/5 transition-all text-lg"
            />
            {localQuery && (
              <button 
                type="button"
                onClick={() => { setLocalQuery(''); updateFilter('q', ''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded-full"
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
              <Filter size={14} />
              Filters
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => updateFilter('status', e.target.value)}
                  className="w-full bg-secondary border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block">Priority</label>
                <select 
                  value={priorityFilter}
                  onChange={(e) => updateFilter('priority', e.target.value)}
                  className="w-full bg-secondary border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Searching across your projects...</p>
              </div>
            ) : tasks?.length === 0 ? (
              <div className="text-center py-20 bg-card/20 rounded-3xl border-2 border-dashed border-border">
                <Inbox size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold text-muted-foreground/50">No tasks found</h3>
                <p className="text-muted-foreground/30">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks?.map((task: searchApi.SearchTask) => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="group flex flex-col gap-3 p-5 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">
                            {task.list.board.project.name} / {task.list.board.name}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                          {task.title}
                        </h3>
                      </div>
                      <span className={clsx(
                        "p-1.5 rounded-lg bg-secondary/50",
                        PRIORITY_COLORS[task.priority]
                      )}>
                        <Flag size={16} />
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers size={14} />
                        {task.list.name}
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar size={14} />
                          {format(new Date(task.dueDate), 'MMM d')}
                        </div>
                      )}
                      {task.assignee && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {task.assignee.name[0].toUpperCase()}
                          </div>
                          {task.assignee.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask as any}
          projectId={selectedTask.list.board.project.id}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default SearchPage;
