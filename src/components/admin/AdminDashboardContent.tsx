"use client";

import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Users, UserPlus, CheckCircle, Clock, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  totalUsers: number;
  newUsersLast7Days: number;
  onboardingCompletionRate: number;
}

interface RecentUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
  avatar_url: string | null;
}

const StatCard = ({ icon: Icon, title, value, description, color }: { icon: React.ElementType, title: string, value: string, description: string, color: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export function AdminDashboardContent() {
  const { supabase } = useAuth();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = React.useState<RecentUser[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // Fetch total users count
      const { count: totalUsers, error: totalUsersError } = await supabase
        .from("profiles")
        .select('*', { count: 'exact', head: true });

      // Fetch new users in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newUsersLast7Days, error: newUsersError } = await supabase
        .from("profiles")
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo);

      // Fetch onboarding completion rate
      const { count: completedOnboarding, error: completedError } = await supabase
        .from("profiles")
        .select('*', { count: 'exact', head: true })
        .eq('onboarding_completed', true);

      // Fetch recent users
      const { data: recentUsersData, error: recentUsersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, created_at, avatar_url")
        .order("created_at", { ascending: false })
        .limit(5);

      if (totalUsersError || newUsersError || completedError || recentUsersError) {
        toast.error("Erro ao carregar dados do dashboard.", {
          description: totalUsersError?.message || newUsersError?.message || completedError?.message || recentUsersError?.message,
        });
      } else {
        setStats({
          totalUsers: totalUsers || 0,
          newUsersLast7Days: newUsersLast7Days || 0,
          onboardingCompletionRate: totalUsers ? ((completedOnboarding || 0) / totalUsers) * 100 : 0,
        });
        setRecentUsers(recentUsersData as any || []);
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          title="Total de Usuários"
          value={stats?.totalUsers.toString() || '0'}
          description="Usuários cadastrados na plataforma."
          color="text-blue-500"
        />
        <StatCard
          icon={UserPlus}
          title="Novos Usuários (7d)"
          value={stats?.newUsersLast7Days.toString() || '0'}
          description="Cadastros na última semana."
          color="text-green-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Taxa de Onboarding"
          value={`${stats?.onboardingCompletionRate.toFixed(1) || '0'}%`}
          description="Usuários que completaram o perfil."
          color="text-violet-500"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuários Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.first_name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.first_name || 'Usuário'} {user.last_name || ''}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(user.created_at), { addSuffix: true, locale: ptBR })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}