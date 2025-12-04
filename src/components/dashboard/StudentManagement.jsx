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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Eye,
  MessageSquare,
  User,
  Brain,
  TrendingUp,
  AlertTriangle,
  FileText,
  Loader2,
  X,
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
import { IEPReport } from "./IEPReport";
import { useStudentAnalytics } from "@/hook/useStudentAnalytics";
import useStudentManageQuery from "@/hook/useStudentManageQuery";
import { useAuth } from "@/context/AuthContext";
import { getTimeText } from "@/utils/globals";

export function StudentManagement() {
  const { getId } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isIEPOpen, setIsIEPOpen] = useState(false);
  // 전체 캐릭터 데이터 조회 (그룹 선택 없이)
  const { data: charactersData, isPending: charactersLoading } =
    useStudentManageQuery({ teacherId: getId() });

  // 선택된 학생의 분석 데이터 조회
  const { data: studentAnalytics, isPending: analyticsLoading } =
    useStudentAnalytics(selectedStudent?._id, {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    });

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleIEPOpen = () => {
    setIsIEPOpen(true);
  };

  const getConcentrationLevel = (issues) => {
    if (issues === null)
      return { level: "미측정", color: "bg-gray-100 text-gray-800" };
    if (issues < 10)
      return { level: "우수", color: "bg-green-100 text-green-800" };
    if (issues < 20)
      return { level: "양호", color: "bg-blue-100 text-blue-800" };
    return { level: "관심필요", color: "bg-yellow-100 text-yellow-800" };
  };

  // 성취도 분포 계산
  const getGradeFromAccuracy = (accuracy) => {
    if (accuracy >= 85) return "우수";
    if (accuracy >= 70) return "보통";
    return "개선필요";
  };

  // 실제 데이터가 없는 경우
  if (!charactersData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-medium">학습 데이터가 없습니다</h3>
          <p className="text-sm">
            학생들이 학습을 시작하면 여기에 통계가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  // 전체 평균 정답률을 기반으로 성취도 분포 계산 - 항상 세 가지 항목 표시
  const gradeDistribution = charactersData?.characters?.reduce(
    (ac, cu) => {
      const currentGrade = getGradeFromAccuracy(cu.averageAccuracy);
      ac[currentGrade] += 1;
      return ac;
    },
    { 우수: 0, 보통: 0, 개선필요: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">학습 현황 관리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            익명화된 학습자들의 진도와 성취도를 확인합니다. 개인정보는 보호되며
            학습 데이터만 추적됩니다.
          </p>
        </div>
      </div>
      {/* 전체 현황 요약 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4" />총 학습자
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold">
              {charactersData?.characters?.length || 0}명
            </div>
            <p className="text-sm text-muted-foreground">활동 중인 학습자</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              평균 정답률
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl font-bold text-green-600">
              {charactersData?.overallStats?.averageAccuracy?.toFixed(1) || 0}%
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
                <div key={grade} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{grade}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{count}명</span>
                    <div className="w-12 h-2 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${
                          grade === "우수"
                            ? "bg-green-500"
                            : grade === "보통"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${
                            charactersData?.characters?.length > 0
                              ? (count / charactersData.characters.length) * 100
                              : 0
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
      {/* 학생 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {charactersLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">학생 데이터를 불러오는 중...</span>
            </div>
          ) : charactersData?.characters?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="h-9">
                  <TableHead className="py-2 text-sm">학습자 ID</TableHead>
                  <TableHead className="py-2 text-sm">캐릭터</TableHead>
                  <TableHead className="py-2 text-sm">총 문제수</TableHead>
                  <TableHead className="py-2 text-sm">학습 시간</TableHead>
                  <TableHead className="py-2 text-sm">정답률</TableHead>
                  <TableHead className="py-2 text-sm">집중도</TableHead>
                  <TableHead className="py-2 text-sm">상태</TableHead>
                  <TableHead className="py-2 text-sm">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charactersData?.characters?.slice(0, 10).map((character) => {
                  {
                    /* const grade = getGradeFromAccuracy(
                    charactersData?.overallStats?.averageAccuracy || 0
                  ); */
                  }
                  const concentration = getConcentrationLevel(
                    character.totalStudyTimeMinutes
                      ? character.totalConcentrationIssues || 0
                      : null
                  );

                  return (
                    <TableRow key={character._id}>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full">
                            <p className="text-2xl rounded-full">
                              {character.icon && !isNaN(character.icon)
                                ? String.fromCodePoint(character.icon)
                                : "👤"}
                            </p>
                          </div>
                          <span className="font-mono text-sm">
                            {character.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{character.nickname}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {character.totalQuestionsAttempted || 0}개
                        </span>
                      </TableCell>
                      <TableCell>
                        {getTimeText(character.totalStudyTimeMinutes)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={character.averageAccuracy || 0}
                            className="w-16 h-2"
                          />
                          <span className="text-sm">
                            {Math.round(character.averageAccuracy || 0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={concentration.color}>
                          {concentration.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={character.use ? "default" : "secondary"}
                        >
                          {character.use ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStudentSelect(character)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStudent(character);
                              handleIEPOpen();
                            }}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="mb-4 text-6xl">👥</div>
                <h3 className="mb-2 text-lg font-medium">
                  아직 등록된 학생이 없거나 학습기록이 없습니다.
                </h3>
                <p className="text-sm">
                  아직 등록된 학생이 없거나 학습기록이 없습니다.
                </p>
                <p className="text-sm">학생을 추가하고 학습을 시작해주세요.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* 학생 상세 정보 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>
                  {selectedStudent?.nickname} 학습 상세 분석
                </DialogTitle>
                <DialogDescription>
                  실시간 학습 데이터를 기반으로 한 상세 분석 결과입니다.
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailOpen(false)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedStudent && studentAnalytics && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="analytics">상세 분석</TabsTrigger>
                <TabsTrigger value="iep">IEP 보고서</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* 기본 정보 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        기본 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid justify-between grid-cols-2">
                        <div className="flex items-center justify-center">
                          <p className="p-3 mr-2 text-6xl border rounded-full">
                            {selectedStudent.icon &&
                            !isNaN(selectedStudent.icon)
                              ? String.fromCodePoint(selectedStudent.icon)
                              : "👤"}
                          </p>
                        </div>
                        <div className="flex flex-col justify-between space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">이름:</span>
                            <span className="font-medium">
                              {selectedStudent.nickname}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">메모:</span>
                            <span className="font-medium">
                              {selectedStudent.memo || "없음"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">상태:</span>
                            <Badge
                              variant={
                                selectedStudent.use ? "default" : "secondary"
                              }
                            >
                              {selectedStudent.use ? "활성" : "비활성"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 학습 통계 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        학습 통계
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">총 문제 수:</span>
                        <span className="font-medium">
                          {selectedStudent?.totalQuestionsAttempted || 0}개
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">정답 수:</span>
                        <span className="font-medium text-green-600">
                          {selectedStudent?.totalCorrectAnswers || 0}개
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">학습 시간:</span>
                        <span className="font-medium">
                          {getTimeText(selectedStudent?.totalStudyTimeMinutes)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">최대 연속 정답:</span>
                        <span className="font-medium">
                          {studentAnalytics?.maxConsecutiveCorrect || 0}개
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="ml-2">분석 데이터를 불러오는 중...</span>
                  </div>
                ) : studentAnalytics &&
                  (studentAnalytics.totalQuestionsAttempted > 0 ||
                    studentAnalytics.weeklyProgress?.length > 0) ? (
                  <div className="space-y-4">
                    {/* 주간 진행률 차트 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>주간 학습 진행률</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                          <LineChart data={studentAnalytics.weeklyProgress}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <Tooltip
                              formatter={(value, name) => {
                                const nameMap = {
                                  accuracy: "정답률",
                                  questionsAttempted: "문제 수",
                                };
                                return [value, nameMap[name] || name];
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="accuracy"
                              name="정답률"
                              stroke="#8884d8"
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="questionsAttempted"
                              name="문제 수"
                              stroke="#82ca9d"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* 활동별 성과 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>활동별 학습 성과</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart
                            data={(() => {
                              // 활동 타입을 고정된 순서로 정의
                              const activityTypes = [
                                { activityType: "read", label: "읽기" },
                                { activityType: "listen", label: "듣기" },
                                { activityType: "speak", label: "말하기" },
                                { activityType: "write", label: "쓰기" },
                              ];

                              // API 데이터에서 각 활동 타입의 정답률을 찾아서 매핑
                              return activityTypes.map((type) => {
                                const apiData =
                                  studentAnalytics.activityBreakdown?.find(
                                    (item) =>
                                      item.activityType === type.activityType
                                  );
                                return {
                                  activityType: type.label,
                                  accuracy: apiData?.accuracy || 0,
                                };
                              });
                            })()}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="activityType" />
                            <YAxis />
                            <Tooltip
                              formatter={(value, name) => {
                                const nameMap = {
                                  accuracy: "정답률",
                                };
                                return [value, nameMap[name] || name];
                              }}
                            />
                            <Bar
                              dataKey="accuracy"
                              name="정답률"
                              fill="#8884d8"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">📊</div>
                      <h3 className="mb-2 text-lg font-medium">
                        학습 기록이 없습니다
                      </h3>
                      <p className="text-sm">
                        {selectedStudent?.nickname}님의 학습 데이터가 아직
                        없습니다.
                      </p>
                      <p className="text-sm">
                        학습을 시작하면 상세한 분석 결과를 확인할 수 있습니다.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="iep">
                {selectedStudent && (
                  <IEPReport
                    student={selectedStudent}
                    onClose={() => setIsDetailOpen(false)}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      {/* 독립적인 IEP 보고서 다이얼로그 */}
      <Dialog open={isIEPOpen} onOpenChange={setIsIEPOpen}>
        <DialogContent className="max-w-[1200px] w-[90vw] h-[95vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>
                  {selectedStudent?.nickname} 개별화 교육 프로그램 보고서
                </DialogTitle>
                <DialogDescription>
                  학습자의 개별화 교육 프로그램 보고서를 확인하고 인쇄하거나
                  다운로드할 수 있습니다.
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsIEPOpen(false)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {selectedStudent && (
              <IEPReport
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
