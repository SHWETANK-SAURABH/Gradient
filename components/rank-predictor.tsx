"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, Target, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Exam {
  id: string
  name: string
  full_name: string
  category: string
}

interface UserExam {
  id: string
  exam_id: string
  exams: Exam
}

interface Prediction {
  id: string
  exam_id: string
  prediction_type: string
  category: string
  predicted_rank: number | null
  predicted_cutoff: number | null
  confidence_score: number | null
}

interface RankPredictorProps {
  userExams: UserExam[]
  allExams: Exam[]
  predictions: Prediction[]
}

export function RankPredictor({ userExams, allExams, predictions }: RankPredictorProps) {
  const [selectedExam, setSelectedExam] = useState<string>("")
  const [expectedScore, setExpectedScore] = useState<string>("")
  const [category, setCategory] = useState<string>("general")
  const [predictedRank, setPredictedRank] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const examOptions = userExams.length > 0 ? userExams.map((ue) => ue.exams) : allExams

  const calculateRank = async () => {
    if (!selectedExam || !expectedScore) return

    setIsCalculating(true)

    // Simulate rank calculation based on score and historical data
    // In a real app, this would call an API with ML models
    setTimeout(() => {
      const score = Number.parseFloat(expectedScore)
      const exam = examOptions.find((e) => e.id === selectedExam)

      if (!exam) return

      let baseRank: number
      let confidenceScore: number

      // Different calculation logic for different exams
      switch (exam.name) {
        case "JEE Main":
          // JEE Main: Score out of 300, ranks from 1 to ~1,200,000
          baseRank = Math.max(1, Math.round(1200000 * Math.pow((300 - score) / 300, 2)))
          confidenceScore = score > 250 ? 0.9 : score > 200 ? 0.8 : score > 150 ? 0.7 : 0.6
          break
        case "JEE Advanced":
          // JEE Advanced: Score out of 360, ranks from 1 to ~250,000
          baseRank = Math.max(1, Math.round(250000 * Math.pow((360 - score) / 360, 1.8)))
          confidenceScore = score > 300 ? 0.95 : score > 250 ? 0.85 : score > 200 ? 0.75 : 0.65
          break
        case "NEET UG":
          // NEET: Score out of 720, ranks from 1 to ~1,800,000
          baseRank = Math.max(1, Math.round(1800000 * Math.pow((720 - score) / 720, 2.2)))
          confidenceScore = score > 650 ? 0.92 : score > 600 ? 0.82 : score > 550 ? 0.72 : 0.62
          break
        default:
          baseRank = Math.max(1, Math.round(100000 * Math.pow((100 - score / 10) / 100, 2)))
          confidenceScore = 0.7
      }

      // Adjust for category
      const categoryMultiplier =
        {
          general: 1.0,
          obc: 0.85,
          sc: 0.7,
          st: 0.65,
        }[category] || 1.0

      const finalRank = Math.round(baseRank * categoryMultiplier)

      setPredictedRank(finalRank)
      setConfidence(confidenceScore)
      setIsCalculating(false)
    }, 1500)
  }

  const getScoreRange = (examName: string) => {
    switch (examName) {
      case "JEE Main":
        return "0-300"
      case "JEE Advanced":
        return "0-360"
      case "NEET UG":
        return "0-720"
      case "CLAT":
        return "0-150"
      case "CAT":
        return "0-300"
      default:
        return "0-100"
    }
  }

  const selectedExamData = examOptions.find((e) => e.id === selectedExam)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Rank Predictor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exam">Select Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {examOptions.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        <div className="flex items-center gap-2">
                          <span>{exam.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {exam.category}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="score">Expected Score</Label>
              <div className="flex gap-2">
                <Input
                  id="score"
                  type="number"
                  placeholder="Enter your expected score"
                  value={expectedScore}
                  onChange={(e) => setExpectedScore(e.target.value)}
                  className="flex-1"
                />
                {selectedExamData && (
                  <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-600">
                    Max: {getScoreRange(selectedExamData.name).split("-")[1]}
                  </div>
                )}
              </div>
              {selectedExamData && (
                <p className="text-xs text-gray-500">
                  Score range for {selectedExamData.name}: {getScoreRange(selectedExamData.name)}
                </p>
              )}
            </div>

            <Button
              onClick={calculateRank}
              disabled={!selectedExam || !expectedScore || isCalculating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isCalculating ? "Calculating..." : "Predict My Rank"}
            </Button>

            {predictedRank && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Predictions are based on historical data and statistical models. Actual results may vary based on exam
                  difficulty, number of candidates, and other factors.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {predictedRank && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Predicted Rank
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{predictedRank.toLocaleString()}</div>
                <p className="text-sm text-gray-600">Expected Rank</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Confidence Level</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${(confidence || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{Math.round((confidence || 0) * 100)}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-2">Rank Range (±20%)</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Best: {Math.round(predictedRank * 0.8).toLocaleString()}</span>
                    <span className="text-red-600">Worst: {Math.round(predictedRank * 1.2).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">Improve Your Rank:</p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• Focus on high-weightage topics</li>
                <li>• Practice previous year papers</li>
                <li>• Take regular mock tests</li>
                <li>• Analyze your weak areas</li>
                <li>• Maintain consistent study schedule</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
