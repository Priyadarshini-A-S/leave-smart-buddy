import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, CheckCircle, ClipboardList, LogOut, XCircle } from "lucide-react";
import { toast } from "sonner";

interface DailyStats {
  totalStudents: number;
  present: number;
  absent: number;
  pendingLeaves: number;
}

export default function StaffDashboard() {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<DailyStats>({
    totalStudents: 0,
    present: 0,
    absent: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total students
        const { count: totalStudents } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const { data: todayAttendance } = await supabase
          .from('attendance')
          .select('status')
          .eq('date', today);

        const present = todayAttendance?.filter(
          (a) => a.status === 'present' || a.status === 'excused'
        ).length || 0;
        const absent = (todayAttendance?.length || 0) - present;

        // Fetch pending leave requests
        const { count: pendingLeaves } = await supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalStudents: totalStudents || 0,
          present,
          absent,
          pendingLeaves: pendingLeaves || 0,
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
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={ClipboardList}
          />
          <StatCard
            title="Present Today"
            value={stats.present}
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Absent Today"
            value={stats.absent}
            icon={XCircle}
            variant={stats.absent > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingLeaves}
            icon={Calendar}
            variant={stats.pendingLeaves > 0 ? "warning" : "default"}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                Record daily attendance for students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open Attendance Sheet</Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Leave Approvals</CardTitle>
              <CardDescription>
                Review and approve pending leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="secondary">
                View Pending Requests
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}