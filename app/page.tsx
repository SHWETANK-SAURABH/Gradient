import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ExamDashboard } from "@/components/exam-dashboard"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's registered exams
  const { data: userExams } = await supabase
    .from("user_exams")
    .select(`
      *,
      exams (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch all available exams
  const { data: allExams } = await supabase
    .from("exams")
    .select("*")
    .eq("is_active", true)
    .order("exam_date", { ascending: true })

  // Fetch upcoming reminders
  const { data: upcomingReminders } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_sent", false)
    .gte("reminder_date", new Date().toISOString())
    .order("reminder_date", { ascending: true })
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <ExamDashboard
          userExams={userExams || []}
          allExams={allExams || []}
          upcomingReminders={upcomingReminders || []}
        />
      </main>
    </div>
  )
}
