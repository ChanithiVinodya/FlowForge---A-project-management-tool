import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import * as projectsApi from '../api/projects.api';
import { 
  Plus, 
  Folder, 
  Users, 
  Calendar, 
  MoreVertical,
  Loader2,
  LayoutGrid,
  List as ListIcon,
  X,
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const SkeletonCard = () => (
  <div className="bg-card/20 border border-border/50 rounded-[2.5rem] p-8 animate-pulse">
    <div className="w-14 h-14 rounded-2xl bg-white/5 mb-8" />
    <div className="h-8 bg-white/5 rounded-lg w-3/4 mb-4" />
    <div className="h-4 bg-white/5 rounded-lg w-full mb-2" />
    <div className="h-4 bg-white/5 rounded-lg w-2/3 mb-10" />
    <div className="pt-6 border-t border-border/30 flex justify-between">
      <div className="h-4 bg-white/5 rounded-lg w-24" />
      <div className="w-8 h-8 rounded-full bg-white/5" />
    </div>
  </div>
);

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setProjectName('');
      setProjectDesc('');
      toast.success(`Project "${data.name}" initialized successfully!`, {
        description: 'You can now start adding tasks and members.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create project', {
        description: error.response?.data?.message || 'Please check your connection and try again.',
      });
    }
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    createMutation.mutate({ name: projectName, description: projectDesc });
  };

  if (isLoading) {
    return (
      <div className="p-10 max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="h-4 bg-white/5 rounded-full w-20" />
            <div className="h-10 bg-white/5 rounded-xl w-64" />
          </div>
          <div className="h-12 bg-white/5 rounded-2xl w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 selection:bg-primary/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Workspace Overview</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Your Projects</h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            Managing {projects?.total || 0} active workstreams
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 h-14 rounded-2xl font-black hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 uppercase tracking-wider text-sm"
        >
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </motion.div>

      {!projects?.items || projects.items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-40 border border-border border-dashed rounded-[4rem] bg-secondary/5 backdrop-blur-sm relative overflow-hidden group shadow-inner"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="w-24 h-24 rounded-[2rem] bg-card border border-border flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
            <Trophy className="text-primary/40" size={48} />
          </div>
          <h3 className="text-3xl font-black tracking-tight">The canvas is empty</h3>
          <p className="text-muted-foreground mt-4 max-w-sm text-center font-bold text-lg leading-relaxed opacity-70">
            Great things start with a single project. Initialize your first workspace to begin.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-12 bg-white text-black px-10 py-5 rounded-2xl font-black hover:bg-white/90 transition-all flex items-center gap-3 group shadow-xl"
          >
            Create first project <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {projects.items.map((project: any, index: number) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={project.id}
            >
              <Link 
                to={`/projects/${project.id}`}
                className="group bg-card/30 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 hover:border-primary/40 transition-all hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] cursor-pointer flex flex-col h-full relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex items-start justify-between mb-10">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                    <Folder size={28} />
                  </div>
                  <button className="p-2.5 hover:bg-secondary/80 rounded-xl text-muted-foreground transition-all active:scale-90">
                    <MoreVertical size={20} />
                  </button>
                </div>
                
                <div className="space-y-4 flex-1">
                  <h3 className="text-2xl font-black group-hover:text-primary transition-colors leading-tight tracking-tight">{project.name}</h3>
                  <p className="text-sm text-muted-foreground font-bold line-clamp-3 leading-relaxed opacity-60">
                    {project.description || 'Elevate your team productivity with this workspace. Organize tasks and ship faster.'}
                  </p>
                </div>
                
                <div className="mt-10 pt-6 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-black uppercase text-primary shadow-sm">
                          {project.name[i % project.name.length]}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{project.membersCount || 1} Experts</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                     <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
          
          {/* Add New Card Silhouette */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-border/50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-secondary/20 hover:border-primary/30 transition-all group min-h-[320px] bg-secondary/5"
          >
            <div className="w-16 h-16 rounded-full bg-secondary border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-primary/30 transition-all shadow-sm">
              <Plus size={36} />
            </div>
            <p className="font-black text-xl tracking-tight">Initialize Workspace</p>
            <p className="text-xs font-bold mt-2 opacity-50 uppercase tracking-widest tracking-widest">Expansion Pack Available</p>
          </motion.button>
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6" 
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card border border-border/50 w-full max-w-xl rounded-[3rem] p-12 shadow-[0_64px_128px_-32px_rgba(0,0,0,0.8)]" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tight">New Project</h2>
                  <p className="text-sm text-muted-foreground font-bold opacity-60">The start of something revolutionary.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-3 hover:bg-secondary rounded-2xl transition-all active:scale-90 border border-border/50"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateProject} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black ml-1 uppercase tracking-[0.3em] opacity-40">Project Identifier</label>
                  <input 
                    autoFocus
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. Project Genesis"
                    className="flex h-16 w-full rounded-2xl border border-border/50 bg-background/50 px-6 py-2 text-lg font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:opacity-20"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black ml-1 uppercase tracking-[0.3em] opacity-40">Strategic Brief</label>
                  <textarea 
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                    placeholder="Describe the mission objectives..."
                    rows={4}
                    className="flex w-full rounded-2xl border border-border/50 bg-background/50 px-6 py-5 text-lg font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:opacity-20 resize-none"
                  />
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-16 rounded-2xl border border-border/50 hover:bg-secondary transition-all font-black text-sm uppercase tracking-widest"
                  >
                    Hold
                  </button>
                  <button 
                    type="submit"
                    disabled={!projectName.trim() || createMutation.isPending}
                    className="flex-1 bg-primary text-white h-16 rounded-2xl font-black hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 uppercase tracking-widest text-sm"
                  >
                    {createMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : <span>Deploy</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;

