import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, ClipboardList, LogOut, Percent, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface StudentData {
  id: string;
  roll_number: string;
  class_name: string;
  section: string;
}

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export default function StudentDashboard() {
  const { signOut, user } = useAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch student data
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (studentError) throw studentError;
        setStudent(studentData);

        // Fetch attendance stats
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', studentData.id);

        if (attendanceError) throw attendanceError;

        const total = attendanceData.length;
        const present = attendanceData.filter(
          (a) => a.status === 'present' || a.status === 'excused'
        ).length;
        const absent = total - present;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

        setStats({ total, present, absent, percentage });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            {student && (
              <p className="text-sm text-muted-foreground">
                Roll: {student.roll_number} | Class: {student.class_name}
                {student.section && ` - ${student.section}`}
              </p>
            )}
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
            title="Attendance Percentage"
            value={`${stats.percentage}%`}
            icon={Percent}
            variant={stats.percentage >= 75 ? "success" : "warning"}
          />
          <StatCard
            title="Total Days"
            value={stats.total}
            icon={Calendar}
          />
          <StatCard
            title="Present Days"
            value={stats.present}
            icon={ClipboardList}
            variant="success"
          />
          <StatCard
            title="Absent Days"
            value={stats.absent}
            icon={TrendingDown}
            variant={stats.absent > 0 ? "warning" : "default"}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Request Leave</CardTitle>
              <CardDescription>
                Submit a leave request for approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Submit Leave Request</Button>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>
                Your attendance history for the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Attendance records will appear here
              </p>
            </CardContent>
          </Card>
        </div>

        {stats.percentage < 75 && (
          <Card className="mt-6 border-warning shadow-card">
            <CardHeader>
              <CardTitle className="text-warning">Attendance Alert</CardTitle>
              <CardDescription>
                Your attendance is below the required threshold of 75%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Please ensure regular attendance to maintain the minimum requirement.
                Contact your class teacher if you have any concerns.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}