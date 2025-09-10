"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Exam {
  id: string
  name: string
  full_name: string
  category: string
  conducting_body: string
  exam_date: string | null
  application_start_date: string | null
  application_end_date: string | null
}

interface ExamRegistrationDialogProps {
  exam?: Exam
  trigger?: React.ReactNode
  onSuccess?: () => void
  allExams?: Exam[]
  preSelectedCategory?: string | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExamRegistrationDialog({
  exam,
  trigger,
  onSuccess,
  allExams,
  preSelectedCategory,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: ExamRegistrationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedExamId, setSelectedExamId] = useState(exam?.id || "")
  const [availableExams, setAvailableExams] = useState<Exam[]>([])
  const [formData, setFormData] = useState({
    registrationNumber: "",
    applicationStatus: "planning",
    targetRank: "",
    targetPercentile: "",
    preparationStatus: "started",
    notes: "",
    isPriority: false,
  })

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  const filteredExams = preSelectedCategory
    ? availableExams.filter((exam) => exam.category === preSelectedCategory)
    : availableExams

  useEffect(() => {
    if (allExams) {
      setAvailableExams(allExams)
    }
  }, [allExams])

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && !exam && !allExams) {
      const { data } = await supabase.from("exams").select("*").eq("is_active", true).order("name")
      setAvailableExams(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedExamId) {
      toast({
        title: "Error",
        description: "Please select an exam to register for.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to register for exams.",
          variant: "destructive",
        })
        return
      }

      const { data: existing } = await supabase
        .from("user_exams")
        .select("id")
        .eq("user_id", user.id)
        .eq("exam_id", selectedExamId)
        .single()

      if (existing) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this exam.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("user_exams").insert({
        user_id: user.id,
        exam_id: selectedExamId,
        registration_number: formData.registrationNumber || null,
        application_status: formData.applicationStatus,
        target_rank: formData.targetRank ? Number.parseInt(formData.targetRank) : null,
        target_percentile: formData.targetPercentile ? Number.parseFloat(formData.targetPercentile) : null,
        preparation_status: formData.preparationStatus,
        notes: formData.notes || null,
        is_priority: formData.isPriority,
      })

      if (error) throw error

      toast({
        title: "Success!",
        description: "Successfully registered for the exam.",
      })

      setOpen(false)
      setFormData({
        registrationNumber: "",
        applicationStatus: "planning",
        targetRank: "",
        targetPercentile: "",
        preparationStatus: "started",
        notes: "",
        isPriority: false,
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to register for exam. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="bg-blue-600 hover:bg-blue-700">
      <Plus className="w-4 h-4 mr-2" />
      {exam ? "Register" : "Add Exam"}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{exam ? `Register for ${exam.name}` : "Register for Exam"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!exam && (
            <div className="space-y-2">
              <Label htmlFor="exam">Select Exam *</Label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  {filteredExams.map((examOption) => (
                    <SelectItem key={examOption.id} value={examOption.id}>
                      <div>
                        <div className="font-medium">{examOption.name}</div>
                        <div className="text-sm text-gray-500">{examOption.conducting_body}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationStatus">Application Status</Label>
              <Select
                value={formData.applicationStatus}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, applicationStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="appeared">Appeared</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparationStatus">Preparation Status</Label>
              <Select
                value={formData.preparationStatus}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, preparationStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number (Optional)</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
              placeholder="Enter your registration number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetRank">Target Rank (Optional)</Label>
              <Input
                id="targetRank"
                type="number"
                value={formData.targetRank}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetRank: e.target.value }))}
                placeholder="e.g., 1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPercentile">Target Percentile (Optional)</Label>
              <Input
                id="targetPercentile"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.targetPercentile}
                onChange={(e) => setFormData((prev) => ({ ...prev, targetPercentile: e.target.value }))}
                placeholder="e.g., 95.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about your preparation or goals..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPriority"
              checked={formData.isPriority}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPriority: checked }))}
            />
            <Label htmlFor="isPriority">Mark as priority exam</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
