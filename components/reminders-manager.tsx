"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Calendar, Clock, AlertCircle, CheckCircle, Trash2, Edit } from "lucide-react"
import { formatDistanceToNow, format, isAfter, isBefore, addDays } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Reminder {
  id: string
  title: string
  description: string | null
  reminder_type: string
  reminder_date: string
  is_sent: boolean
  is_read: boolean
  priority: string
  exams?: {
    name: string
    exam_date: string | null
    application_end_date: string | null
    result_date: string | null
  } | null
}

interface RemindersManagerProps {
  reminders: Reminder[]
}

export function RemindersManager({ reminders: initialReminders }: RemindersManagerProps) {
  const [reminders, setReminders] = useState(initialReminders)
  const router = useRouter()
  const supabase = createClient()

  const now = new Date()

  // Categorize reminders
  const upcomingReminders = reminders.filter(
    (r) =>
      !r.is_sent && isAfter(new Date(r.reminder_date), now) && isBefore(new Date(r.reminder_date), addDays(now, 7)),
  )

  const todayReminders = reminders.filter((r) => {
    const reminderDate = new Date(r.reminder_date)
    return (
      reminderDate.toDateString() === now.toDateString() ||
      (isAfter(reminderDate, now) && isBefore(reminderDate, addDays(now, 1)))
    )
  })

  const futureReminders = reminders.filter((r) => isAfter(new Date(r.reminder_date), addDays(now, 7)))

  const pastReminders = reminders.filter((r) => isBefore(new Date(r.reminder_date), now))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "application_deadline":
        return <Calendar className="w-4 h-4" />
      case "exam_date":
        return <Clock className="w-4 h-4" />
      case "result_date":
        return <CheckCircle className="w-4 h-4" />
      case "counseling":
        return <Bell className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const markAsRead = async (reminderId: string) => {
    try {
      const { error } = await supabase.from("reminders").update({ is_read: true }).eq("id", reminderId)

      if (error) throw error

      setReminders((prev) => prev.map((r) => (r.id === reminderId ? { ...r, is_read: true } : r)))
    } catch (error) {
      console.error("Error marking reminder as read:", error)
    }
  }

  const deleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase.from("reminders").delete().eq("id", reminderId)

      if (error) throw error

      setReminders((prev) => prev.filter((r) => r.id !== reminderId))
    } catch (error) {
      console.error("Error deleting reminder:", error)
    }
  }

  const ReminderCard = ({ reminder, showActions = true }: { reminder: Reminder; showActions?: boolean }) => (
    <div
      className={`border rounded-lg p-4 transition-all hover:shadow-md ${
        !reminder.is_read ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getPriorityColor(reminder.priority)}`}>
            {getTypeIcon(reminder.reminder_type)}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${!reminder.is_read ? "text-blue-900" : "text-gray-900"}`}>
              {reminder.title}
            </h3>
            {reminder.description && <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>}
            {reminder.exams && <p className="text-xs text-gray-500 mt-1">Related to: {reminder.exams.name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
          {!reminder.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(reminder.reminder_date), "MMM dd, yyyy")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(reminder.reminder_date), "HH:mm")}
          </span>
          <span className="text-xs">{formatDistanceToNow(new Date(reminder.reminder_date), { addSuffix: true })}</span>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {!reminder.is_read && (
              <Button variant="ghost" size="sm" onClick={() => markAsRead(reminder.id)}>
                Mark Read
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Edit className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteReminder(reminder.id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{todayReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Future</p>
                <p className="text-2xl font-bold text-gray-900">{futureReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{reminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders Tabs */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="today">Today ({todayReminders.length})</TabsTrigger>
          <TabsTrigger value="upcoming">This Week ({upcomingReminders.length})</TabsTrigger>
          <TabsTrigger value="future">Future ({futureReminders.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastReminders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Today's Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayReminders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reminders for today</p>
                  <p className="text-sm text-gray-500 mt-2">You're all caught up!</p>
                </div>
              ) : (
                todayReminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                This Week's Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingReminders.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming reminders this week</p>
                </div>
              ) : (
                upcomingReminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="future">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Future Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {futureReminders.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No future reminders set</p>
                </div>
              ) : (
                futureReminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Past Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pastReminders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No past reminders</p>
                </div>
              ) : (
                pastReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} showActions={false} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
