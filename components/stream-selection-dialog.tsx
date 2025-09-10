"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Scale, Briefcase, Palette, Building } from "lucide-react"
import { ExamRegistrationDialog } from "@/components/exam-registration-dialog"

interface StreamSelectionDialogProps {
  trigger?: React.ReactNode
  allExams: any[]
}

const streams = [
  {
    id: "engineering",
    name: "Engineering",
    description: "JEE Main, JEE Advanced, BITSAT, VITEEE",
    icon: Building,
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  {
    id: "medical",
    name: "Medical",
    description: "NEET UG, NEET PG, AIIMS, JIPMER",
    icon: Heart,
    color: "bg-red-100 text-red-600 border-red-200",
  },
  {
    id: "law",
    name: "Law",
    description: "CLAT, AILET, LSAT India, SLAT",
    icon: Scale,
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  {
    id: "management",
    name: "Management",
    description: "CAT, XAT, SNAP, NMAT, MAT",
    icon: Briefcase,
    color: "bg-green-100 text-green-600 border-green-200",
  },
  {
    id: "architecture",
    name: "Architecture & Design",
    description: "NATA, JEE B.Arch, CEED, NID DAT",
    icon: Palette,
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
]

export function StreamSelectionDialog({ trigger, allExams }: StreamSelectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStream, setSelectedStream] = useState<string | null>(null)
  const [showExamRegistration, setShowExamRegistration] = useState(false)

  const handleStreamSelect = (streamId: string) => {
    setSelectedStream(streamId)
    setOpen(false)
    setShowExamRegistration(true)
  }

  const filteredExams = selectedStream ? allExams.filter((exam) => exam.category === selectedStream) : allExams

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-2">Choose Your Stream</DialogTitle>
            <p className="text-gray-600 text-center">Select the field you want to pursue to see relevant exams</p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {streams.map((stream) => {
              const IconComponent = stream.icon
              return (
                <Card
                  key={stream.id}
                  className={`cursor-pointer hover:shadow-md transition-all duration-200 border-2 ${stream.color} hover:scale-105`}
                  onClick={() => handleStreamSelect(stream.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stream.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{stream.name}</h3>
                    <p className="text-sm text-gray-600">{stream.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {showExamRegistration && (
        <ExamRegistrationDialog
          allExams={filteredExams}
          preSelectedCategory={selectedStream}
          trigger={<div />}
          open={showExamRegistration}
          onOpenChange={setShowExamRegistration}
        />
      )}
    </>
  )
}
