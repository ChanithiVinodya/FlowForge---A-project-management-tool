import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Settings, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Layers,
  ChevronRight,
  Plus,
  Search,
  ChevronLeft,
  Folder,
  Command
} from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../hooks/useSocket';
import * as notificationsApi from '../api/notifications.api';
import * as projectsApi from '../api/projects.api';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  badge?: number | string;
}

const SidebarItem = ({ to, icon, label, collapsed, badge }: SidebarItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => clsx(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative mx-2",
      isActive 
        ? "bg-primary text-white shadow-lg shadow-primary/25" 
        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
    )}
  >
    <div className={clsx(
      "shrink-0 transition-transform duration-300",
      "group-hover:scale-110 active:scale-95"
    )}>
      {icon}
    </div>
    {!collapsed && <span className="font-semibold text-sm whitespace-nowrap">{label}</span>}
    {badge !== undefined && (
      <span className={clsx(
        "absolute right-2 flex items-center justify-center min-w-[20px] h-[20px] text-[10px] font-black rounded-full border-2 border-card shadow-sm",
        collapsed ? "top-1 -right-1" : "relative right-0",
        "bg-primary text-white"
      )}>
        {badge}
      </span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-popover text-popover-foreground text-xs font-bold rounded-lg opacity-0 translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all z-50 border border-border shadow-2xl">
        {label}
      </div>
    )}
  </NavLink>
);

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
    refetchInterval: 60000,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  });

  const { on } = useSocket();

  useEffect(() => {
    const off = on('notificationCreated', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => { off(); };
  }, [on, queryClient]);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className={clsx(
        "hidden md:flex flex-col border-r border-border bg-card/20 backdrop-blur-3xl transition-all duration-500 ease-in-out relative z-50 shadow-2xl",
        collapsed ? "w-20" : "w-72"
      )}>
        <div className="h-20 flex items-center px-6 border-b border-border/50 overflow-hidden">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <Layers className="w-6 h-6 text-white" />
            </motion.div>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
              >
                FlowForge
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex-1 py-6 space-y-1 overflow-y-auto no-scrollbar">
          <div className="px-4 mb-2">
            {!collapsed && <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 mb-2 opacity-50">Menu</p>}
            <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" collapsed={collapsed} />
            <SidebarItem to="/notifications" icon={<Bell size={20} />} label="Notifications" collapsed={collapsed} badge={unreadCount > 0 ? unreadCount : undefined} />
            <SidebarItem to="/search" icon={<Search size={20} />} label="Universal Search" collapsed={collapsed} />
          </div>
          
          <div className="pt-4 px-4">
            {!collapsed && (
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Projects</p>
                <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-primary/10 rounded-md text-primary transition-colors">
                   <Plus size={12} />
                </button>
              </div>
            )}
            
            <div className="space-y-1">
              {projects?.items?.slice(0, 5).map((project: any) => (
                <SidebarItem 
                  key={project.id} 
                  to={`/projects/${project.id}`} 
                  icon={<Folder size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />} 
                  label={project.name} 
                  collapsed={collapsed} 
                />
              ))}
              
              {!collapsed && projects?.items && projects.items.length > 5 && (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronRight size={14} />
                  See all projects
                </button>
              )}

              {(!projects?.items || projects.items.length === 0) && !collapsed && (
                <div className="px-4 py-2">
                   <p className="text-[10px] text-muted-foreground font-medium italic opacity-50">No projects yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 px-4">
            {!collapsed && <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 mb-2 opacity-50">Account</p>}
            <SidebarItem to="/profile" icon={<User size={20} />} label="Profile Settings" collapsed={collapsed} />
            <SidebarItem to="/settings" icon={<Settings size={20} />} label="Workspace Config" collapsed={collapsed} />
          </div>
        </div>

        <div className="p-4 border-t border-border/50 bg-secondary/10 overflow-hidden">
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-4 mb-4 rounded-2xl bg-card/50 backdrop-blur-md border border-border/50 shadow-sm group cursor-pointer hover:border-primary/30 transition-all"
              onClick={() => navigate('/profile')}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary font-black text-sm border border-primary/20 group-hover:border-primary/50 transition-colors">
                {user?.name?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate font-medium opacity-70">{user?.email}</p>
              </div>
            </motion.div>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all font-bold group"
          >
            <LogOut size={20} className="group-hover:-rotate-12 transition-transform" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
        
        {/* Toggle Collapse Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-border text-foreground flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-lg border border-background z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        <header className="h-20 flex items-center justify-between px-8 border-b border-border bg-background/50 backdrop-blur-xl z-40 sticky top-0">
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2.5 hover:bg-secondary rounded-xl transition-all active:scale-90 shadow-sm border border-border">
              <Menu size={22} />
            </button>
            
            <div className="max-w-xl w-full hidden sm:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  placeholder="Universal search tasks, docs, projects..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/search?q=${(e.target as HTMLInputElement).value}`);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="w-full bg-secondary/30 border border-border rounded-xl pl-11 pr-4 h-11 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all placeholder:font-medium placeholder:opacity-50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md border border-border bg-background text-[10px] font-bold text-muted-foreground opacity-50 flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                  <Command size={10} /> K
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-1.5 bg-secondary/30 border border-border rounded-xl">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-background transition-all hover:shadow-sm relative" 
                onClick={() => navigate('/notifications')}
              >
                <Bell size={18} className="text-muted-foreground" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-background animate-pulse" />}
              </motion.button>
              <div className="h-4 w-[1px] bg-border mx-0.5" />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-background transition-all hover:shadow-sm" 
                onClick={() => navigate('/settings')}
              >
                <Settings size={18} className="text-muted-foreground" />
              </motion.button>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-background border border-border p-1 cursor-pointer hover:border-primary/50 transition-all shadow-sm" 
              onClick={() => navigate('/profile')}
            >
              <div className="w-full h-full rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase overflow-hidden">
                {user?.name?.[0]}
              </div>
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background selection:bg-primary/20 custom-scrollbar">
          <div className={clsx(
            "min-h-full transition-opacity duration-500",
            location.pathname !== location.pathname ? "opacity-0" : "opacity-100"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] md:hidden" 
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border p-8 shadow-2xl flex flex-col space-y-8" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Layers className="text-white w-6 h-6" />
                  </div>
                  <span className="font-black text-2xl tracking-tighter">Pulse</span>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)} 
                  className="p-2 hover:bg-secondary rounded-lg transition-colors border border-border/50"
                >
                  <X size={24} />
                </button>
              </div>
              
              <nav className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 opacity-50">Main Menu</p>
                <SidebarItem to="/dashboard" icon={<LayoutDashboard size={24} />} label="Dashboard" collapsed={false} />
                <SidebarItem 
                  to="/notifications" 
                  icon={<Bell size={24} />} 
                  label="Notifications" 
                  collapsed={false} 
                  badge={unreadCount > 0 ? unreadCount : undefined}
                />
                
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 pt-6 opacity-50">Account</p>
                <SidebarItem to="/profile" icon={<User size={24} />} label="Profile" collapsed={false} />
                <SidebarItem to="/settings" icon={<Settings size={24} />} label="Settings" collapsed={false} />
              </nav>
              
              <div className="pt-8 border-t border-border">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-destructive bg-destructive/10 font-black tracking-tight"
                >
                  <LogOut size={24} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;

