"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Plus, Target, TrendingUp, AlertCircle } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ExamRegistrationDialog } from "@/components/exam-registration-dialog"
import { StreamSelectionDialog } from "@/components/stream-selection-dialog"

interface Exam {
  id: string
  name: string
  full_name: string
  category: string
  conducting_body: string
  exam_date: string | null
  application_start_date: string | null
  application_end_date: string | null
  result_date: string | null
  official_website: string | null
  description: string | null
}

interface UserExam {
  id: string
  exam_id: string
  registration_number: string | null
  application_status: string
  target_rank: number | null
  target_percentile: number | null
  preparation_status: string
  is_priority: boolean
  exams: Exam
}

interface Reminder {
  id: string
  title: string
  description: string | null
  reminder_type: string
  reminder_date: string
  priority: string
}

interface ExamDashboardProps {
  userExams: UserExam[]
  allExams: Exam[]
  upcomingReminders: Reminder[]
}

export function ExamDashboard({ userExams, allExams, upcomingReminders }: ExamDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "appeared":
        return "bg-purple-100 text-purple-800"
      case "qualified":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "engineering":
        return "bg-blue-100 text-blue-800"
      case "medical":
        return "bg-red-100 text-red-800"
      case "law":
        return "bg-yellow-100 text-yellow-800"
      case "management":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyLevel = (date: string | null) => {
    if (!date) return "normal"
    const examDate = new Date(date)
    const now = new Date()
    const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil <= 7) return "urgent"
    if (daysUntil <= 30) return "warning"
    return "normal"
  }

  const urgentExams = userExams.filter((ue) => {
    const urgency = getUrgencyLevel(ue.exams.exam_date)
    return urgency === "urgent" || urgency === "warning"
  })

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Exam Dashboard</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track your competitive exam journey, manage deadlines, and stay ahead with smart predictions and reminders.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Registered Exams</p>
                <p className="text-2xl font-bold text-gray-900">{userExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgent Deadlines</p>
                <p className="text-2xl font-bold text-gray-900">{urgentExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Reminders</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Exams</p>
                <p className="text-2xl font-bold text-gray-900">{allExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Exams */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold">My Registered Exams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userExams.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No exams registered yet</p>
                  <StreamSelectionDialog
                    allExams={allExams}
                    trigger={
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Register for Your First Exam
                      </Button>
                    }
                  />
                </div>
              ) : (
                userExams.map((userExam) => (
                  <div
                    key={userExam.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{userExam.exams.name}</h3>
                        <p className="text-sm text-gray-600">{userExam.exams.full_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(userExam.exams.category)}>{userExam.exams.category}</Badge>
                        <Badge className={getStatusColor(userExam.application_status)}>
                          {userExam.application_status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      {userExam.exams.exam_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {format(new Date(userExam.exams.exam_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                      )}

                      {userExam.target_rank && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Target Rank: {userExam.target_rank}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {userExam.exams.exam_date
                            ? formatDistanceToNow(new Date(userExam.exams.exam_date), { addSuffix: true })
                            : "Date TBA"}
                        </span>
                      </div>
                    </div>

                    {userExam.preparation_status && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Preparation Progress</span>
                          <span className="text-gray-600">
                            {userExam.preparation_status === "completed"
                              ? "100%"
                              : userExam.preparation_status === "ongoing"
                                ? "60%"
                                : userExam.preparation_status === "started"
                                  ? "30%"
                                  : "0%"}
                          </span>
                        </div>
                        <Progress
                          value={
                            userExam.preparation_status === "completed"
                              ? 100
                              : userExam.preparation_status === "ongoing"
                                ? 60
                                : userExam.preparation_status === "started"
                                  ? 30
                                  : 0
                          }
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingReminders.length === 0 ? (
                <p className="text-gray-600 text-sm">No upcoming reminders</p>
              ) : (
                upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        reminder.priority === "urgent"
                          ? "bg-red-500"
                          : reminder.priority === "high"
                            ? "bg-orange-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{reminder.title}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDistanceToNow(new Date(reminder.reminder_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Available Exams */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Available Exams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {allExams.slice(0, 5).map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">{exam.name}</p>
                    <p className="text-xs text-gray-600">{exam.conducting_body}</p>
                  </div>
                  <ExamRegistrationDialog
                    exam={exam}
                    trigger={
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
