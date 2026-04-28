import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ShieldCheck, ShieldOff, RefreshCw, Crown, ImageIcon as ImgIcon, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  profile: { name: string | null; avatar_url: string | null } | null;
  project_count: number;
  generation_count: number;
}

const AdminUsersManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'list' },
      });
      if (error) throw error;
      setUsers(data?.users || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.profile?.name || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalAdmins = users.filter((u) => u.roles.includes('admin')).length;

  const toggleAdmin = async (u: AdminUser) => {
    const isAdmin = u.roles.includes('admin');
    setBusyId(u.id);
    try {
      const { error } = await supabase.functions.invoke('admin-users', {
        body: {
          action: isAdmin ? 'revoke_admin' : 'grant_admin',
          targetUserId: u.id,
          role: 'admin',
        },
      });
      if (error) throw error;
      toast.success(isAdmin ? 'Admin role revoked' : 'Admin role granted');
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id
            ? { ...x, roles: isAdmin ? x.roles.filter((r) => r !== 'admin') : [...x.roles, 'admin'] }
            : x
        )
      );
    } catch (e) {
      console.error(e);
      toast.error('Action failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Users & Roles
          </h2>
          <p className="text-sm text-muted-foreground">
            {users.length} total users · {totalAdmins} admins
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-1.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filtered.length} matching</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">No users found.</p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((u, i) => {
                const isAdmin = u.roles.includes('admin');
                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.4) }}
                    className="flex items-center gap-3 p-3 hover:bg-muted/30"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={u.profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {(u.profile?.name || u.email || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {u.profile?.name || u.email || 'Unknown user'}
                        </p>
                        {isAdmin && (
                          <Badge className="gap-1 bg-amber-500/15 text-amber-600 hover:bg-amber-500/20 border-amber-500/30">
                            <Crown className="w-3 h-3" /> Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title="Projects">
                        <FolderKanban className="w-3.5 h-3.5" /> {u.project_count}
                      </span>
                      <span className="flex items-center gap-1" title="Generations">
                        <ImgIcon className="w-3.5 h-3.5" /> {u.generation_count}
                      </span>
                      <span title="Last sign-in">
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'never'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={isAdmin ? 'outline' : 'default'}
                      onClick={() => toggleAdmin(u)}
                      disabled={busyId === u.id}
                    >
                      {isAdmin ? (
                        <><ShieldOff className="w-4 h-4 mr-1.5" /> Revoke</>
                      ) : (
                        <><ShieldCheck className="w-4 h-4 mr-1.5" /> Make admin</>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersManager;
