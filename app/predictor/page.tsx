import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { RankPredictor } from "@/components/rank-predictor"
import { CutoffPredictor } from "@/components/cutoff-predictor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function PredictorPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's registered exams for predictor
  const { data: userExams } = await supabase
    .from("user_exams")
    .select(`
      *,
      exams (*)
    `)
    .eq("user_id", user.id)

  // Fetch all active exams
  const { data: allExams } = await supabase.from("exams").select("*").eq("is_active", true).order("name")

  // Fetch prediction data
  const { data: predictions } = await supabase.from("predictions").select("*").order("exam_id")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rank & Cutoff Predictor</h1>
          <p className="text-gray-600">
            Predict your rank and explore college cutoffs based on your expected scores and historical data.
          </p>
        </div>

        <Tabs defaultValue="rank-predictor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="rank-predictor">Rank Predictor</TabsTrigger>
            <TabsTrigger value="cutoff-predictor">Cutoff Predictor</TabsTrigger>
          </TabsList>

          <TabsContent value="rank-predictor">
            <RankPredictor userExams={userExams || []} allExams={allExams || []} predictions={predictions || []} />
          </TabsContent>

          <TabsContent value="cutoff-predictor">
            <CutoffPredictor allExams={allExams || []} predictions={predictions || []} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
