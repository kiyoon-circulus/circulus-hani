import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Eye,
  MessageSquare,
  User,
  Brain,
  TrendingUp,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { mockLearningOverview, mockStudentStats } from "./mock-learning-stats";
import { LegacyIEPReport } from "./LegacyIEPReport";

export function LegacyStudentManagement() {
  const [students] = useState(mockStudentStats);
  const [selectedStudent, setSelectedStudent] = useState(mockStudentStats[0]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isIEPOpen, setIsIEPOpen] = useState(false);

  console.log(students);
  console.log(mockLearningOverview);
  const gradeColors = {
    우수: "bg-success text-white",
    보통: "bg-warning text-white",
    개선필요: "bg-error text-white",
  };

  const getGradeFromAccuracy = (accuracy) => {
    if (accuracy >= 85) return "우수";
    if (accuracy >= 70) return "보통";
    return "개선필요";
  };
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleViewIEP = (student) => {
    setSelectedStudent(student);
    setIsIEPOpen(true);
  };

  // 그룹별 통계 계산
  const groupStats = students.reduce((acc, student) => {
    const groupName = `그룹 ${student.groupId}`;
    if (!acc[groupName]) {
      acc[groupName] = {
        count: 0,
        totalAccuracy: 0,
        totalQuestions: 0,
        avgAccuracy: 0,
        totalStudyTime: 0,
      };
    }
    acc[groupName].count += 1;
    acc[groupName].totalAccuracy += student.averageAccuracy;
    acc[groupName].totalQuestions += student.totalQuestionsAttempted;
    acc[groupName].totalStudyTime += student.totalStudyTimeMinutes;
    acc[groupName].avgAccuracy = Math.round(
      acc[groupName].totalAccuracy / acc[groupName].count
    );
    return acc;
  }, {});

  // 성취도 분포 계산
  const gradeDistribution = students.reduce((acc, student) => {
    const grade = getGradeFromAccuracy(student.averageAccuracy);
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  // 집중력 문제가 있는 학생들
  const concentrationIssues = students
    .filter((student) => student.totalConcentrationIssues > 20)
    .sort((a, b) => b.totalConcentrationIssues - a.totalConcentrationIssues)
    .slice(0, 5);

  // 선택된 학생의 상세 차트 데이터
  const studentWeeklyData = selectedStudent?.weeklyProgress || [];
  const studentActivityData = selectedStudent?.activityBreakdown || [];
  const studentContentData = selectedStudent?.contentTypeProgress || [];

  // 최근 활동 기록 (최근 10개)
  const recentActivities =
    selectedStudent?.questionRecords
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">학습 현황 관리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            익명화된 학습자들의 진도와 성취도를 확인합니다. 개인정보는 보호되며
            학습 데이터만 추적됩니다.
          </p>
        </div>
      </div>

      {/* 전체 현황 요약 - 성취도 분포 통합 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex gap-2 items-center text-sm">
              <User className="w-4 h-4" />총 학습자
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">
              {mockLearningOverview.totalActiveStudents}명
            </div>
            <p className="text-sm text-muted-foreground">활동 중인 학습자</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex gap-2 items-center text-sm">
              <TrendingUp className="w-4 h-4" />
              평균 정답률
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-green-600">
              {mockLearningOverview.averageAccuracy.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground">전체 성취도</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">성취도 분포</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{grade}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium">{count}명</span>
                    <div className="w-12 h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${
                          grade === "우수"
                            ? "bg-success"
                            : grade === "보통"
                            ? "bg-warning"
                            : "bg-error"
                        }`}
                        style={{
                          width: `${
                            (count / mockLearningOverview.totalActiveStudents) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 그룹별 통계 - 가로 스크롤 컴팩트 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">그룹별 학습 현황</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex overflow-x-auto gap-3 pb-2">
            {Object.entries(groupStats).map(([groupName, stats]) => (
              <div
                key={groupName}
                className="flex-shrink-0 p-4 w-48 rounded-lg border"
              >
                <h3 className="mb-2 text-sm font-extrabold">{groupName}</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">학습자 수</span>
                    <span className="font-medium">{stats.count}명</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">평균 정답률</span>
                    <span className="font-medium">{stats.avgAccuracy}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">총 문제수</span>
                    <span className="font-medium">
                      {stats.totalQuestions.toLocaleString()}개
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">총 학습시간</span>
                    <span className="font-medium">
                      {Math.round(stats.totalStudyTime / 60)}시간
                    </span>
                  </div>
                  <div className="py-1">
                    <Progress value={stats.avgAccuracy} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 집중력 주의 학생 - 단독 섹션 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex gap-2 items-center text-base">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            집중력 주의 학생
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex overflow-x-auto gap-3 pb-2">
            {concentrationIssues.map((student) => (
              <div
                key={student.studentId}
                className="flex-shrink-0 p-3 w-48 rounded-lg border"
              >
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-extrabold">
                      {student.studentName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      그룹 {student.groupId}
                    </div>
                  </div>
                  <div className="p-2 text-center bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-600">
                      {student.totalConcentrationIssues}회
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 학습자 목록 - 컴팩트 테이블 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">학습자 목록</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="h-9">
                <TableHead className="py-2 text-sm">학습자 ID</TableHead>
                <TableHead className="py-2 text-sm">소속 그룹</TableHead>
                <TableHead className="py-2 text-sm">총 문제수</TableHead>
                <TableHead className="py-2 text-sm">정답률</TableHead>
                <TableHead className="py-2 text-sm">연속 정답</TableHead>
                <TableHead className="py-2 text-sm">학습 시간</TableHead>
                <TableHead className="py-2 text-sm">성취도</TableHead>
                <TableHead className="py-2 text-sm">최근 활동</TableHead>
                <TableHead className="py-2 text-sm">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.slice(0, 10).map((student) => {
                const grade = getGradeFromAccuracy(student.averageAccuracy);
                const hoursAgo = Math.floor(
                  (Date.now() - new Date(student.lastActivity).getTime()) /
                    (1000 * 60 * 60)
                );

                return (
                  <TableRow key={student.studentId} className="h-12">
                    <TableCell className="py-2">
                      <div className="flex gap-2 items-center">
                        <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted">
                          <User className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <span className="font-mono text-sm">
                          {student.studentName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-sm">
                      그룹 {student.groupId}
                    </TableCell>
                    <TableCell className="py-2 text-sm">
                      {student.totalQuestionsAttempted.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2">
                      <span
                        className={`text-sm font-medium ${
                          student.averageAccuracy >= 85
                            ? "text-success"
                            : student.averageAccuracy >= 70
                            ? "text-warning"
                            : "text-error"
                        }`}
                      >
                        {student.averageAccuracy.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {student.currentConsecutiveCorrect}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          최고: {student.maxConsecutiveCorrect}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-sm">
                      {Math.round(student.totalStudyTimeMinutes / 60)}시간
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge
                        className={`px-2 py-1 text-xs ${gradeColors[grade]}`}
                      >
                        {grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-sm text-muted-foreground">
                        {hoursAgo === 0 ? "방금 전" : `${hoursAgo}시간 전`}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 h-8 text-sm"
                          onClick={() => handleViewDetails(student)}
                        >
                          <Eye className="mr-1 w-3 h-3" />
                          상세
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 h-8 text-sm"
                          onClick={() => handleViewIEP(student)}
                        >
                          <FileText className="mr-1 w-3 h-3" />
                          IEP
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 학생 상세 정보 다이얼로그 - 컴팩트 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex gap-3 items-center text-lg">
              <div className="flex justify-center items-center w-8 h-8 rounded-full bg-muted">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              {selectedStudent?.studentName} 학습 상세 현황
            </DialogTitle>
            <DialogDescription className="text-sm">
              학습자의 진도, 활동 로그, 성취도를 확인하고 피드백을 작성할 수
              있습니다.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <Tabs
              defaultValue="overview"
              className="flex flex-col flex-1 w-full min-h-0"
            >
              <TabsList className="grid flex-shrink-0 grid-cols-5 w-full h-9">
                <TabsTrigger value="overview" className="text-sm">
                  전체 현황
                </TabsTrigger>
                <TabsTrigger value="progress" className="text-sm">
                  학습 진도
                </TabsTrigger>
                <TabsTrigger value="activities" className="text-sm">
                  활동 로그
                </TabsTrigger>
                <TabsTrigger value="feedback" className="text-sm">
                  피드백
                </TabsTrigger>
                <TabsTrigger value="iep" className="text-sm">
                  IEP 보고서
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="overview"
                className="overflow-y-auto flex-1 min-h-0"
              >
                <div className="pr-2 space-y-3">
                  {/* 기본 정보와 콘텐츠별 진도 - 2:3 레이아웃 */}
                  <div className="grid grid-cols-5 gap-3">
                    {/* 기본 정보 - 2컬럼 */}
                    <div className="flex flex-col col-span-2 gap-3">
                      <div className="flex flex-col gap-3">
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-sm text-muted-foreground">
                              총 응시 문제
                            </div>
                            <div className="text-lg font-bold">
                              {selectedStudent.totalQuestionsAttempted}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-sm text-muted-foreground">
                              정답률
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              {selectedStudent.averageAccuracy.toFixed(1)}%
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-sm text-muted-foreground">
                              연속 정답
                            </div>
                            <div className="text-lg font-bold">
                              {selectedStudent.currentConsecutiveCorrect}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              최고: {selectedStudent.maxConsecutiveCorrect}
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-3">
                            <div className="text-sm text-muted-foreground">
                              총 학습 시간
                            </div>
                            <div className="text-lg font-bold">
                              {Math.round(
                                selectedStudent.totalStudyTimeMinutes / 60
                              )}
                              시간
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* 콘텐츠별 진도 - 3컬럼 */}
                    <div className="col-span-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            콘텐츠별 진도
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {studentContentData.map((content) => (
                              <div
                                key={content.contentType}
                                className="space-y-1"
                              >
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">
                                    {content.contentType}
                                  </span>
                                  <span>
                                    {content.completionRate.toFixed(1)}%
                                  </span>
                                </div>
                                <Progress
                                  value={content.completionRate}
                                  className="h-1"
                                />
                                <div className="text-sm text-muted-foreground">
                                  {content.questionsAttempted}문제 응시 · 정답률{" "}
                                  {content.accuracy.toFixed(1)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* 주간 학습 진도 차트 - 컴팩트 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        주간 학습 추이
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={studentWeeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="정답률"
                          />
                          <Line
                            type="monotone"
                            dataKey="questionsAttempted"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="문제수"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* 활동별 성과 - 단독 카드 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">활동별 성과</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={studentActivityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="activityType"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "accuracy" ? `${value}%` : value,
                              name === "accuracy" ? "정답률" : "응시 문제수",
                            ]}
                          />
                          <Bar dataKey="accuracy" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="progress"
                className="overflow-y-auto flex-1 min-h-0"
              >
                <div className="pr-2 space-y-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        콘텐츠 타입별 상세 진도
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {studentContentData.map((content) => (
                          <div
                            key={content.contentType}
                            className="p-3 rounded-lg border"
                          >
                            <h3 className="mb-3 text-sm font-medium">
                              {content.contentType}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  진도율
                                </span>
                                <span className="font-medium">
                                  {content.completionRate.toFixed(1)}%
                                </span>
                              </div>
                              <Progress
                                value={content.completionRate}
                                className="h-2"
                              />
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    응시 문제:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {content.questionsAttempted}개
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    정답률:
                                  </span>
                                  <span className="ml-1 font-medium">
                                    {content.accuracy.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="activities"
                className="overflow-y-auto flex-1 min-h-0"
              >
                <div className="pr-2 space-y-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        최근 학습 활동 (최근 10개)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="h-9">
                            <TableHead className="py-2 text-sm">
                              날짜/시간
                            </TableHead>
                            <TableHead className="py-2 text-sm">
                              콘텐츠
                            </TableHead>
                            <TableHead className="py-2 text-sm">활동</TableHead>
                            <TableHead className="py-2 text-sm">
                              소요시간
                            </TableHead>
                            <TableHead className="py-2 text-sm">
                              정답여부
                            </TableHead>
                            <TableHead className="py-2 text-sm">
                              반복횟수
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentActivities.map((activity, index) => (
                            <TableRow key={index} className="h-10">
                              <TableCell className="py-1">
                                <div className="text-sm">
                                  {new Date(
                                    activity.timestamp
                                  ).toLocaleDateString("ko-KR")}
                                  <br />
                                  <span className="text-muted-foreground">
                                    {new Date(
                                      activity.timestamp
                                    ).toLocaleTimeString("ko-KR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-1">
                                <Badge
                                  variant="outline"
                                  className="px-2 py-1 text-sm"
                                >
                                  {activity.questionType}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-1">
                                <Badge
                                  variant="outline"
                                  className="px-2 py-1 text-sm"
                                >
                                  {activity.activityType}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-1 text-sm">
                                {activity.solvingTime}초
                              </TableCell>
                              <TableCell className="py-1">
                                <Badge
                                  className={`text-sm px-2 py-1 ${
                                    activity.isCorrect
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {activity.isCorrect ? "정답" : "오답"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-1 text-sm">
                                {activity.repetitionCount}회
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="feedback"
                className="overflow-y-auto flex-1 min-h-0"
              >
                <div className="pr-2 space-y-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex gap-2 items-center text-base">
                        <MessageSquare className="w-4 h-4" />
                        학습 피드백 작성
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="feedback" className="text-sm">
                          선생님 피드백
                        </Label>
                        <Textarea
                          id="feedback"
                          placeholder="학습자에 대한 피드백을 작성해주세요. 개인식별정보는 포함하지 마세요."
                          rows={3}
                          className="text-sm"
                        />
                      </div>
                      <Button size="sm" className="text-sm">
                        피드백 저장
                      </Button>
                    </CardContent>
                  </Card>

                  {/* 집중력 이슈 분석 - 컴팩트 */}
                  {selectedStudent.totalConcentrationIssues > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex gap-2 items-center text-base">
                          <Brain className="w-4 h-4 text-orange-500" />
                          집중력 분석
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">총 집중력 이탈 횟수</span>
                            <Badge
                              variant="outline"
                              className="px-2 py-1 text-sm text-orange-600"
                            >
                              {selectedStudent.totalConcentrationIssues}회
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            학습 중 집중력이 떨어진 것으로 감지된 횟수입니다.
                            추가적인 관심과 지도가 필요할 수 있습니다.
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="iep"
                className="overflow-y-auto flex-1 min-h-0"
              >
                <div className="pr-2">
                  <LegacyIEPReport student={selectedStudent} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* 독립적인 IEP 보고서 다이얼로그 - 최대 화면 크기 최적화 */}
      <Dialog open={isIEPOpen} onOpenChange={setIsIEPOpen}>
        <DialogContent
          className="max-w-[1200px] w-[90vw] h-[95vh] flex flex-col p-0"
          style={{ minWidth: "1000px" }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedStudent?.studentName} 개별화 교육 프로그램 보고서
            </DialogTitle>
            <DialogDescription>
              학습자의 개별화 교육 프로그램 보고서를 확인하고 인쇄하거나
              다운로드할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            {selectedStudent && (
              <LegacyIEPReport
                student={selectedStudent}
                onClose={() => setIsIEPOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
