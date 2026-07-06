import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Zap, Users, Globe, CheckCircle2, Star, Shield, Cpu, ZapOff } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Layers className="w-6 h-6 text-white" />
            </motion.div>
            <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              FlowForge
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 mr-auto ml-12">
            <a href="#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Features</a>
            <a href="#benefits" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Benefits</a>
            <a href="#pricing" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold px-4 py-2 hover:bg-secondary rounded-lg transition-colors">Log in</Link>
            <Link to="/register" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 uppercase tracking-wider">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 px-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/10 blur-[150px] -z-10 rounded-full opacity-30" />
          
          <motion.div 
            initial="initial"
            animate="animate"
            variants={stagger}
            className="max-w-7xl mx-auto text-center space-y-10"
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary"
            >
              <Zap className="w-4 h-4 fill-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next Gen: AI Workflow Engine</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-6xl md:text-[5.5rem] font-black tracking-tight leading-[0.95] max-w-5xl mx-auto"
            >
              Precision tools for <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary/80 italic">ambitious teams.</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed"
            >
              The definitive project management workspace. Orchestrate tasks, sync team velocity, and deploy with confidence.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Link to="/register" className="w-full sm:w-auto bg-primary text-white px-12 py-5 rounded-2xl text-lg font-black hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 flex items-center justify-center gap-3 group">
                Launch Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-12 py-5 rounded-2xl text-lg font-black border border-border bg-white/5 backdrop-blur-md hover:bg-secondary transition-all">
                Project Tour
              </button>
            </motion.div>

            {/* Trusted By */}
            <motion.div variants={fadeInUp} className="pt-16 flex flex-col items-center gap-6 opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Engineering teams at</p>
              <div className="flex flex-wrap justify-center gap-10 md:gap-20 grayscale brightness-200">
                <span className="text-xl font-black italic tracking-tighter">VOLT.IO</span>
                <span className="text-xl font-bold tracking-widest">AETHER</span>
                <span className="text-xl font-black tracking-tighter uppercase">Nexus</span>
                <span className="text-xl font-black flex items-center gap-1 tracking-tighter">CORE</span>
              </div>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div 
              variants={fadeInUp}
              className="mt-28 relative max-w-6xl mx-auto"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-indigo-500/30 rounded-[3rem] blur-3xl opacity-20 animate-pulse-slow" />
              <div className="relative rounded-[2.5rem] border border-border/50 overflow-hidden bg-card/50 backdrop-blur-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 left-0 right-0 h-14 bg-secondary/80 flex items-center px-8 gap-3 border-b border-border/50 z-10 backdrop-blur-md">
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500/40" />
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500/40" />
                    <div className="w-3.5 h-3.5 rounded-full bg-green-500/40" />
                  </div>
                  <div className="mx-auto bg-background/80 rounded-lg px-8 md:px-24 py-1.5 text-[11px] font-bold text-muted-foreground/50 border border-border/50 flex items-center gap-2">
                    <Shield size={10} /> secure.flowforge.io/workspace/alpha
                  </div>
                </div>
                <div className="pt-14 bg-gradient-to-b from-transparent to-black/20">
                  <img 
                    src="/dashboard-mockup.png" 
                    alt="FlowForge High Performance Dashboard" 
                    className="w-full h-auto transition-all duration-1000 group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-40 px-6 bg-secondary/20 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-6">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight">Engineered for speed.</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                We've obsessed over every millisecond to ensure your workflow remains uninterrupted and fluid.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                { 
                  icon: <Zap className="w-8 h-8 text-primary" />, 
                  title: 'Instant Sync', 
                  desc: 'Zero-latency state management ensures every team member sees the latest data in real-time.',
                  benefit: '240ms Average Latency' 
                },
                { 
                  icon: <Cpu className="w-8 h-8 text-primary" />, 
                  title: 'AI Automation', 
                  desc: 'Automate repetitive tasks with our context-aware engine. Focus on high-value engineering.',
                  benefit: '12h Saved per week'
                },
                { 
                  icon: <Globe className="w-8 h-8 text-primary" />, 
                  title: 'Global Scale', 
                  desc: 'Distributed architecture ensures FlowForge performs optimally whether you are in SF or Tokyo.',
                  benefit: '99.99% Guaranteed Uptime'
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="p-12 rounded-[2.5rem] border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/40 transition-all group relative overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/10 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-5 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed font-medium">{feature.desc}</p>
                  <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {feature.benefit}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Performance Stats */}
        <section className="py-28 px-6 border-y border-border/50">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { val: '750k+', label: 'Engineers' },
              { val: '5.2M', label: 'Issues Shipped' },
              { val: '<100ms', label: 'Avg API Response' },
              { val: '24/7', label: 'Global Monitoring' }
            ].map((stat, i) => (
              <div key={stat.label}>
                <p className="text-5xl font-black mb-3 text-white tracking-tighter">{stat.val}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-60">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-40 px-6">
          <div className="max-w-5xl mx-auto rounded-[4rem] bg-gradient-to-br from-[#121217] to-primary/20 px-8 md:px-24 py-24 text-center relative overflow-hidden shadow-[0_48px_96px_-24px_rgba(0,0,0,0.8)] border border-white/5">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] translate-y-1/2 -translate-x-1/2 rounded-full" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 space-y-10"
            >
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.95]">
                Stop waiting. <br/> Start shipping.
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed">
                Join the next generation of high-growth companies building on FlowForge. Initial set-up takes 30 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/register" className="w-full sm:w-auto bg-white text-black px-12 py-6 rounded-[2rem] text-lg font-black hover:bg-white/90 transition-all shadow-xl hover:scale-105 active:scale-95">
                  Get Started Free
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-12 py-6 rounded-[2rem] text-lg font-black text-white border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
                  Contact Sales
                </Link>
              </div>
              <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.2em]">
                Enterprise ready / SOC2 Type II Compliant / 99.99% Uptime
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-24 px-6 border-t border-border/50 bg-secondary/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-20">
          <div className="space-y-6 col-span-1 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter">FlowForge</span>
            </div>
            <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
              We're on a mission to build the most efficient collaboration platform on the planet. Built by engineers, for engineers.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white">Product</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Changelog</a>
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary transition-colors">Integrations</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white">Company</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About Us</a>
              <a href="#" className="hover:text-primary transition-colors">Careers</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-bold text-muted-foreground opacity-50">
            © 2026 FlowForge Technologies Inc. Made with passion in Silicon Valley.
          </p>
          <div className="flex gap-8 text-muted-foreground opacity-50">
            <Globe size={18} className="hover:text-primary cursor-pointer transition-colors" />
            <Shield size={18} className="hover:text-primary cursor-pointer transition-colors" />
            <Star size={18} className="hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

