"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, TrendingUp, Building, GraduationCap } from "lucide-react"

interface Exam {
  id: string
  name: string
  full_name: string
  category: string
}

interface Prediction {
  id: string
  exam_id: string
  prediction_type: string
  category: string
  college_name: string | null
  branch_name: string | null
  predicted_cutoff: number | null
  previous_year_cutoff: number | null
  confidence_score: number | null
  round_number: number | null
  seat_type: string | null
}

interface CutoffPredictorProps {
  allExams: Exam[]
  predictions: Prediction[]
}

// Mock cutoff data - in a real app, this would come from the database
const mockCutoffData = [
  {
    college: "IIT Delhi",
    branch: "Computer Science Engineering",
    category: "general",
    cutoff2023: 144,
    cutoff2022: 152,
    predicted2024: 140,
    seats: 97,
    round: 1,
  },
  {
    college: "IIT Bombay",
    branch: "Computer Science Engineering",
    category: "general",
    cutoff2023: 67,
    cutoff2022: 72,
    predicted2024: 65,
    seats: 119,
    round: 1,
  },
  {
    college: "IIT Madras",
    branch: "Computer Science Engineering",
    category: "general",
    cutoff2023: 89,
    cutoff2022: 94,
    predicted2024: 85,
    seats: 110,
    round: 1,
  },
  {
    college: "IIT Kanpur",
    branch: "Computer Science Engineering",
    category: "general",
    cutoff2023: 201,
    cutoff2022: 208,
    predicted2024: 195,
    seats: 83,
    round: 1,
  },
  {
    college: "IIT Kharagpur",
    branch: "Computer Science Engineering",
    category: "general",
    cutoff2023: 354,
    cutoff2022: 361,
    predicted2024: 350,
    seats: 142,
    round: 1,
  },
  {
    college: "AIIMS Delhi",
    branch: "MBBS",
    category: "general",
    cutoff2023: 50,
    cutoff2022: 44,
    predicted2024: 48,
    seats: 125,
    round: 1,
  },
  {
    college: "AIIMS Jodhpur",
    branch: "MBBS",
    category: "general",
    cutoff2023: 196,
    cutoff2022: 203,
    predicted2024: 190,
    seats: 125,
    round: 1,
  },
  {
    college: "JIPMER Puducherry",
    branch: "MBBS",
    category: "general",
    cutoff2023: 89,
    cutoff2022: 95,
    predicted2024: 85,
    seats: 200,
    round: 1,
  },
]

export function CutoffPredictor({ allExams }: CutoffPredictorProps) {
  const [selectedExam, setSelectedExam] = useState<string>("defaultExamId")
  const [selectedCategory, setSelectedCategory] = useState<string>("general")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedBranch, setSelectedBranch] = useState<string>("all")

  const selectedExamData = allExams.find((e) => e.id === selectedExam)

  // Filter cutoff data based on exam type and search
  const getFilteredCutoffs = () => {
    let filtered = mockCutoffData

    // Filter by exam type
    if (selectedExamData) {
      if (selectedExamData.category === "engineering") {
        filtered = filtered.filter((item) => item.college.includes("IIT") || item.branch.includes("Engineering"))
      } else if (selectedExamData.category === "medical") {
        filtered = filtered.filter((item) => item.college.includes("AIIMS") || item.branch.includes("MBBS"))
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.branch.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by branch
    if (selectedBranch && selectedBranch !== "all") {
      filtered = filtered.filter((item) => item.branch.toLowerCase().includes(selectedBranch.toLowerCase()))
    }

    return filtered
  }

  const filteredCutoffs = getFilteredCutoffs()

  const getUniqueBranches = () => {
    const branches = new Set(mockCutoffData.map((item) => item.branch))
    return Array.from(branches)
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current < previous) {
      return <TrendingUp className="w-4 h-4 text-green-500 rotate-180" />
    } else if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-red-500" />
    }
    return <div className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            Cutoff Predictor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Select Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exam" />
                </SelectTrigger>
                <SelectContent>
                  {allExams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC-NCL</SelectItem>
                  <SelectItem value="sc">SC</SelectItem>
                  <SelectItem value="st">ST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All branches</SelectItem>
                  {getUniqueBranches().map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search colleges or branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Cutoff Predictions ({filteredCutoffs.length} results)
            </span>
            {selectedExamData && <Badge variant="secondary">{selectedExamData.name}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCutoffs.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No cutoff data found for the selected criteria</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredCutoffs.map((cutoff, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cutoff.college}</h3>
                      <p className="text-sm text-gray-600">{cutoff.branch}</p>
                      <p className="text-xs text-gray-500 mt-1">{cutoff.seats} seats available</p>
                    </div>
                    <Badge variant="outline">Round {cutoff.round}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Predicted 2024</p>
                      <p className="text-lg font-bold text-blue-600">{cutoff.predicted2024}</p>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">2023 Cutoff</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-lg font-bold text-gray-900">{cutoff.cutoff2023}</p>
                        {getTrendIcon(cutoff.predicted2024, cutoff.cutoff2023)}
                      </div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">2022 Cutoff</p>
                      <p className="text-lg font-bold text-gray-900">{cutoff.cutoff2022}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Trend:{" "}
                        {cutoff.predicted2024 < cutoff.cutoff2023 ? (
                          <span className="text-green-600 font-medium">Decreasing</span>
                        ) : cutoff.predicted2024 > cutoff.cutoff2023 ? (
                          <span className="text-red-600 font-medium">Increasing</span>
                        ) : (
                          <span className="text-gray-600 font-medium">Stable</span>
                        )}
                      </span>
                      <span className="text-gray-600">
                        Change: {cutoff.predicted2024 - cutoff.cutoff2023 > 0 ? "+" : ""}
                        {cutoff.predicted2024 - cutoff.cutoff2023}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
