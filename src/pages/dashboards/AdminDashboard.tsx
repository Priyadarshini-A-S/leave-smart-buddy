import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, LogOut, Shield, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalStaff: number;
  totalParents: number;
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalStaff: 0,
    totalParents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch user role counts
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role');

        const totalStudents = roles?.filter((r) => r.role === 'student').length || 0;
        const totalStaff = roles?.filter((r) => r.role === 'staff').length || 0;
        const totalParents = roles?.filter((r) => r.role === 'parent').length || 0;

        setStats({
          totalUsers: roles?.length || 0,
          totalStudents,
          totalStaff,
          totalParents,
        });
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Staff Members"
            value={stats.totalStaff}
            icon={Shield}
          />
          <StatCard
            title="Parents"
            value={stats.totalParents}
            icon={Calendar}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Users</Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure leave limits and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                System Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Generate attendance and leave reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Generate Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}