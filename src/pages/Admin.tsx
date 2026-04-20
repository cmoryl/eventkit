import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Shield, FileText, Brain, 
  Settings, BarChart3, Palette, Type, Cog, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppNavHeader } from '@/components/layout/AppNavHeader';
import AdminPromptManager from '@/components/admin/AdminPromptManager';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminKnowledgeManager from '@/components/admin/AdminKnowledgeManager';
import AdminRenderEngines from '@/components/admin/AdminRenderEngines';
import { AdminBrandManager } from '@/components/admin/AdminBrandManager';
import { AdminHeroManager } from '@/components/admin/AdminHeroManager';
import AdminSiteSettings from '@/components/admin/AdminSiteSettings';
import AdminTemplateSync from '@/components/admin/AdminTemplateSync';
import { useAuth } from '@/hooks/useAuth';

const Admin: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'prompts');
  const navigate = useNavigate();

  // Check if already authenticated in session or pre-approved
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('admin_authenticated');
    if (adminAuth === 'true') {
      setIsAdminAuthenticated(true);
      return;
    }

    // Check if user is pre-approved admin
    const checkPreApproved = async () => {
      if (!user?.email) return;
      
      try {
        const { data, error } = await supabase.functions.invoke('verify-admin', {
          body: { email: user.email }
        });

        if (!error && data?.success && data?.preApproved) {
          setIsAdminAuthenticated(true);
          sessionStorage.setItem('admin_authenticated', 'true');
          toast.success('Welcome back, Admin');
        }
      } catch (error) {
        console.error('Pre-approval check failed:', error);
      }
    };

    checkPreApproved();
  }, [user?.email]);

  // Handle tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['prompts', 'templates', 'brands', 'hero', 'analytics', 'knowledge', 'engines', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-admin', {
        body: { password }
      });

      if (error) throw error;

      if (data?.success) {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        toast.success('Welcome to Admin Panel');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
    toast.info('Logged out of admin panel');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Require user authentication first
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              You must be logged in to access the admin panel.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
            <p className="text-muted-foreground text-center mb-6">
              Enter admin password to continue
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password}
              >
                {isLoading ? 'Verifying...' : 'Access Admin Panel'}
              </Button>
            </form>

            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="w-full mt-4"
            >
              ← Back to App
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const adminActions = (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Logout
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <AppNavHeader 
        subtitle="Admin Panel"
        actions={adminActions}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-8 w-full max-w-6xl mx-auto">
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Brands</span>
            </TabsTrigger>
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Knowledge</span>
            </TabsTrigger>
            <TabsTrigger value="engines" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Engines</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Cog className="w-4 h-4" />
              <span className="hidden sm:inline">Site</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="prompts" className="mt-0">
                <AdminPromptManager />
              </TabsContent>

              <TabsContent value="templates" className="mt-0">
                <AdminTemplateSync />
              </TabsContent>

              <TabsContent value="brands" className="mt-0">
                <AdminBrandManager />
              </TabsContent>

              <TabsContent value="hero" className="mt-0">
                <AdminHeroManager />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <AdminAnalytics />
              </TabsContent>

              <TabsContent value="knowledge" className="mt-0">
                <AdminKnowledgeManager />
              </TabsContent>

              <TabsContent value="engines" className="mt-0">
                <AdminRenderEngines />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <AdminSiteSettings />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
