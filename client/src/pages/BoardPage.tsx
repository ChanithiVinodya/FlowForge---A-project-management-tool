import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import * as projectsApi from '../api/projects.api';
import * as tasksApi from '../api/tasks.api';
import client from '../api/client';
import { useSocket } from '../hooks/useSocket';
import KanbanColumn from '../components/KanbanColumn';
import KanbanCard from '../components/KanbanCard';
import { 
  ChevronLeft, 
  Settings, 
  Users, 
  Share2, 
  Plus, 
  Loader2,
  Filter,
  Search,
  Layout,
  X,
  History,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import ActivityLogList from '../components/ActivityLogList';
import TaskDetailModal from '../components/TaskDetailModal';
import { clsx } from 'clsx';

const BoardPage = () => {
  const { projectId, boardId } = useParams<{ projectId: string; boardId: string }>();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<any>(null);
  const [activeColumn, setActiveColumn] = useState<any>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { on } = useSocket(projectId);

  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['board', boardId] });

    const offTaskCreated = on('taskCreated', invalidate);
    const offTaskUpdated = on('taskUpdated', invalidate);
    const offTaskDeleted = on('taskDeleted', invalidate);
    const offTaskMoved = on('taskMoved', invalidate);
    const offListCreated = on('listCreated', invalidate);
    const offListUpdated = on('listUpdated', invalidate);
    const offListDeleted = on('listDeleted', invalidate);
    const offListReordered = on('listReordered', invalidate);

    return () => {
      offTaskCreated();
      offTaskUpdated();
      offTaskDeleted();
      offTaskMoved();
      offListCreated();
      offListUpdated();
      offListDeleted();
      offListReordered();
    };
  }, [boardId, on, queryClient]);

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => projectsApi.getBoard(projectId!, boardId!),
    enabled: !!projectId && !!boardId,
  });

  const addTaskMutation = useMutation({
    mutationFn: (data: { listId: string; title: string }) => 
      tasksApi.createTask(projectId!, data.listId, { title: data.title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: (data: { taskId: string; listId: string; position: number }) =>
      tasksApi.moveTask(projectId!, data.taskId, { listId: data.listId, position: data.position }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: any) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.list);
      return;
    }
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;
    const isActiveTask = active.data.current?.type === 'Task';
    if (!isActiveTask) return;
  };

  const onDragEnd = (event: any) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    
    if (isActiveTask) {
      const activeTask = active.data.current.task;
      const overType = over.data.current?.type;
      
      let newListId = activeTask.listId;
      let newPosition = 0;

      if (overType === 'Column') {
        newListId = overId;
        newPosition = (over.data.current.list.tasks.length || 0);
      } else if (overType === 'Task') {
        newListId = over.data.current.task.listId;
        newPosition = over.data.current.task.position;
      }

      moveTaskMutation.mutate({
        taskId: activeId,
        listId: newListId,
        position: newPosition,
      });

      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    }
  };

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const createListMutation = useMutation({
    mutationFn: (name: string) => 
      client.post(`/projects/${projectId}/boards/${boardId}/lists`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setIsAddingList(false);
      setNewListName('');
    },
  });

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createListMutation.mutate(newListName);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin" />
          <p className="text-sm font-bold text-muted-foreground animate-pulse">Initializing Board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden animate-fade-in">
       {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* Board Header */}
      <header className="px-8 py-6 border-b border-border bg-card/20 backdrop-blur-xl relative z-10 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Link to={`/projects/${projectId}`} className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-xl transition-all border border-border group">
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-black tracking-tight">{board?.name || 'Loading Board...'}</h1>
                 <button className="p-1 hover:bg-secondary rounded-md text-muted-foreground transition-colors">
                    <ChevronDown size={16} />
                 </button>
              </div>
              <div className="flex items-center gap-3">
                 <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground opacity-60">
                    <Layout size={12} />
                    Project Workspace
                 </span>
                 <div className="w-1 h-1 rounded-full bg-border" />
                 <span className="text-[10px] uppercase font-black tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10">Active</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowActivity(!showActivity)}
              className={clsx(
                "w-10 h-10 flex items-center justify-center rounded-xl transition-all border shrink-0",
                showActivity 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "hover:bg-secondary border-border text-muted-foreground shadow-sm"
              )}
              title="Project Activity"
            >
              <History size={20} />
            </button>
            
            <div className="flex -space-x-2.5 mx-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-card bg-secondary/80 backdrop-blur-sm flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-sm">
                  {['JD', 'AS', 'RK'][i-1]}
                </div>
              ))}
              <button className="w-9 h-9 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary hover:bg-primary/20 transition-all shadow-sm">
                +8
              </button>
            </div>

            <button className="flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95">
              <Share2 size={16} />
              Share
            </button>
            
            <button className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-xl transition-all border border-border bg-card/50 text-muted-foreground">
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Search board tasks..." 
                className="bg-secondary/30 border border-border rounded-xl pl-10 pr-4 h-10 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-72 transition-all placeholder:font-medium placeholder:opacity-50"
              />
            </div>
            <button className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all border border-border/10">
              <Filter size={16} />
              Filters
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 bg-secondary/30 p-1.5 rounded-2xl border border-border/50">
            <button className="p-2 rounded-xl bg-card text-primary shadow-lg border border-border/50"><Layout size={18} /></button>
            <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-all"><Layout size={18} className="rotate-90" /></button>
          </div>
        </div>
      </header>

      {/* Board Content */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-10 flex items-start gap-8 scrollbar-hide">
          <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-8 h-full min-w-max pr-8">
            {board?.lists?.map((list: any) => (
              <KanbanColumn 
                key={list.id} 
                list={list} 
                projectId={projectId!} 
                onAddTask={(listId, title) => addTaskMutation.mutate({ listId, title })}
                onTaskClick={setSelectedTask}
              />
            ))}
            
            <div className="w-[320px] shrink-0">
              {isAddingList ? (
                <div className="bg-card/50 backdrop-blur-xl border border-primary/30 rounded-3xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
                  <form onSubmit={handleAddList} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">List Title</label>
                       <input
                        autoFocus
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="e.g. Code Review"
                        className="w-full bg-background border border-border rounded-xl px-4 h-12 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:opacity-30"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!newListName.trim() || createListMutation.isPending}
                        className="flex-1 bg-primary text-white text-xs font-black h-10 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                      >
                        {createListMutation.isPending ? 'Initialize...' : 'Add List'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingList(false)}
                        className="w-10 h-10 flex items-center justify-center border border-border hover:bg-secondary rounded-xl transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingList(true)}
                  className="w-full h-16 border-2 border-dashed border-border/50 bg-secondary/5 hover:bg-secondary px-6 rounded-3xl transition-all flex items-center justify-center gap-3 text-muted-foreground group"
                >
                  <Plus size={22} className="group-hover:text-primary group-hover:scale-110 transition-all" />
                  <span className="font-black text-sm tracking-tight group-hover:text-foreground">Append New List</span>
                </button>
              )}
            </div>
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeColumn && (
              <KanbanColumn 
                list={activeColumn} 
                projectId={projectId!} 
                onAddTask={() => {}}
              />
            )}
            {activeTask && (
              <KanbanCard task={activeTask} projectId={projectId!} />
            )}
          </DragOverlay>
          </DndContext>
        </div>

        {/* Activity Sidebar Drawer */}
        <aside 
          className={clsx(
            "h-full bg-card/30 backdrop-blur-2xl border-l border-border transition-all duration-500 ease-in-out overflow-hidden flex flex-col shadow-2xl relative z-20",
            showActivity ? "w-96" : "w-0 border-l-0"
          )}
        >
          <div className="p-8 border-b border-border flex items-center justify-between shrink-0">
            <div className="space-y-1">
               <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <History size={20} className="text-primary" />
                Live Feed
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Board Activity</p>
            </div>
            <button 
              onClick={() => setShowActivity(false)}
              className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-xl transition-all text-muted-foreground"
            >
              <X size={22} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ActivityLogList projectId={projectId!} />
          </div>
        </aside>
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          projectId={projectId!}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default BoardPage;
