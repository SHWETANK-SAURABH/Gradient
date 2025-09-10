import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { RemindersManager } from "@/components/reminders-manager"
import { CreateReminderDialog } from "@/components/create-reminder-dialog"

export default async function RemindersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's reminders
  const { data: reminders } = await supabase
    .from("reminders")
    .select(`
      *,
      exams (name, exam_date, application_end_date, result_date)
    `)
    .eq("user_id", user.id)
    .order("reminder_date", { ascending: true })

  // Fetch user's registered exams for creating reminders
  const { data: userExams } = await supabase
    .from("user_exams")
    .select(`
      *,
      exams (*)
    `)
    .eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Reminders</h1>
            <p className="text-gray-600">
              Stay on top of your exam deadlines and study goals with intelligent notifications.
            </p>
          </div>
          <CreateReminderDialog userExams={userExams || []} />
        </div>

        <RemindersManager reminders={reminders || []} />
      </main>
    </div>
  )
}
