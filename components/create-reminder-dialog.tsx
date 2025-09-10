"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Exam {
  id: string
  name: string
  full_name: string
  exam_date: string | null
  application_end_date: string | null
  result_date: string | null
}

interface UserExam {
  id: string
  exam_id: string
  exams: Exam
}

interface CreateReminderDialogProps {
  userExams: UserExam[]
}

export function CreateReminderDialog({ userExams }: CreateReminderDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [reminderType, setReminderType] = useState("custom")
  const [selectedExam, setSelectedExam] = useState("")
  const [priority, setPriority] = useState("medium")
  const [reminderDate, setReminderDate] = useState<Date>()
  const [reminderTime, setReminderTime] = useState("09:00")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !reminderDate) return

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      // Combine date and time
      const [hours, minutes] = reminderTime.split(":").map(Number)
      const finalDate = new Date(reminderDate)
      finalDate.setHours(hours, minutes, 0, 0)

      const { error } = await supabase.from("reminders").insert({
        user_id: user.id,
        exam_id: selectedExam || null,
        title,
        description: description || null,
        reminder_type: reminderType,
        reminder_date: finalDate.toISOString(),
        priority,
        is_sent: false,
        is_read: false,
      })

      if (error) throw error

      // Reset form
      setTitle("")
      setDescription("")
      setReminderType("custom")
      setSelectedExam("")
      setPriority("medium")
      setReminderDate(undefined)
      setReminderTime("09:00")
      setOpen(false)

      // Refresh the page to show new reminder
      router.refresh()
    } catch (error) {
      console.error("Error creating reminder:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateAutoReminders = async () => {
    if (!selectedExam) return

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const exam = userExams.find((ue) => ue.exam_id === selectedExam)?.exams
      if (!exam) return

      const remindersToCreate = []

      // Application deadline reminder (7 days before)
      if (exam.application_end_date) {
        const appDeadline = new Date(exam.application_end_date)
        const appReminder = new Date(appDeadline)
        appReminder.setDate(appReminder.getDate() - 7)
        appReminder.setHours(9, 0, 0, 0)

        if (appReminder > new Date()) {
          remindersToCreate.push({
            user_id: user.id,
            exam_id: selectedExam,
            title: `Application Deadline Approaching - ${exam.name}`,
            description: `Application deadline for ${exam.name} is in 7 days. Make sure to complete your application.`,
            reminder_type: "application_deadline",
            reminder_date: appReminder.toISOString(),
            priority: "high",
            is_sent: false,
            is_read: false,
          })
        }
      }

      // Exam date reminder (3 days before)
      if (exam.exam_date) {
        const examDate = new Date(exam.exam_date)
        const examReminder = new Date(examDate)
        examReminder.setDate(examReminder.getDate() - 3)
        examReminder.setHours(9, 0, 0, 0)

        if (examReminder > new Date()) {
          remindersToCreate.push({
            user_id: user.id,
            exam_id: selectedExam,
            title: `Exam in 3 Days - ${exam.name}`,
            description: `Your ${exam.name} exam is scheduled in 3 days. Final preparations time!`,
            reminder_type: "exam_date",
            reminder_date: examReminder.toISOString(),
            priority: "urgent",
            is_sent: false,
            is_read: false,
          })
        }
      }

      // Result date reminder (1 day before expected result)
      if (exam.result_date) {
        const resultDate = new Date(exam.result_date)
        const resultReminder = new Date(resultDate)
        resultReminder.setDate(resultReminder.getDate() - 1)
        resultReminder.setHours(9, 0, 0, 0)

        if (resultReminder > new Date()) {
          remindersToCreate.push({
            user_id: user.id,
            exam_id: selectedExam,
            title: `Results Expected Tomorrow - ${exam.name}`,
            description: `Results for ${exam.name} are expected to be announced tomorrow.`,
            reminder_type: "result_date",
            reminder_date: resultReminder.toISOString(),
            priority: "medium",
            is_sent: false,
            is_read: false,
          })
        }
      }

      if (remindersToCreate.length > 0) {
        const { error } = await supabase.from("reminders").insert(remindersToCreate)
        if (error) throw error

        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating auto reminders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Reminder</DialogTitle>
          <DialogDescription>Set up a reminder to stay on track with your exam preparation.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Reminder title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="application_deadline">Application Deadline</SelectItem>
                  <SelectItem value="exam_date">Exam Date</SelectItem>
                  <SelectItem value="result_date">Result Date</SelectItem>
                  <SelectItem value="counseling">Counseling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {userExams.length > 0 && (
            <div className="space-y-2">
              <Label>Related Exam (Optional)</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {userExams.map((userExam) => (
                    <SelectItem key={userExam.exam_id} value={userExam.exam_id}>
                      {userExam.exams.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reminderDate ? format(reminderDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={reminderDate} onSelect={setReminderDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading || !title || !reminderDate} className="flex-1">
              {isLoading ? "Creating..." : "Create Reminder"}
            </Button>
            {selectedExam && (
              <Button type="button" variant="outline" onClick={generateAutoReminders} disabled={isLoading}>
                Auto Setup
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
