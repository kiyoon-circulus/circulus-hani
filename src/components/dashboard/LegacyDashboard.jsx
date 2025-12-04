import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Clock,
  Target,
  Brain,
} from "lucide-react";
import { mockLearningOverview } from "./mock-learning-stats";

export function LegacyDashboard({ onNavigate }) {
  const overview = mockLearningOverview;

  const summaryData = [
    {
      title: "활동 학생",
      value: overview.totalActiveStudents.toString(),
      subtitle: "전체 학습자",
      color: "bg-blue-500",
      icon: GraduationCap,
      action: () =>
        onNavigate({
          section: "students",
          breadcrumb: [
            { id: "dashboard", label: "홈", section: "dashboard" },
            { id: "students", label: "학습 현황", section: "students" },
          ],
        }),
    },
    {
      title: "응시 문제",
      value: overview.totalQuestionsAttempted.toLocaleString(),
      subtitle: "누적 학습량",
      color: "bg-green-500",
      icon: Target,
      action: () =>
        onNavigate({
          section: "students",
          breadcrumb: [
            { id: "dashboard", label: "홈", section: "dashboard" },
            { id: "students", label: "학습 현황", section: "students" },
          ],
        }),
    },
    {
      title: "평균 정답률",
      value: `${overview.averageAccuracy.toFixed(1)}%`,
      subtitle: "전체 성취도",
      color: "bg-purple-500",
      icon: TrendingUp,
      action: () =>
        onNavigate({
          section: "students",
          breadcrumb: [
            { id: "dashboard", label: "홈", section: "dashboard" },
            { id: "students", label: "학습 현황", section: "students" },
          ],
        }),
    },
    {
      title: "총 학습 시간",
      value: `${overview.totalStudyHours}시간`,
      subtitle: "누적 학습량",
      color: "bg-orange-500",
      icon: Clock,
      action: () =>
        onNavigate({
          section: "students",
          breadcrumb: [
            { id: "dashboard", label: "홈", section: "dashboard" },
            { id: "students", label: "학습 현황", section: "students" },
          ],
        }),
    },
  ];

  // 최근 2주간 일일 활동 데이터
  const recentActivityData = overview.dailyActivity.slice(-7).map((day) => ({
    날짜: new Date(day.date).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    }),
    활동학생: day.activeStudents,
    문제수: Math.round(day.questionsAttempted / 10), // 차트에서 보기 좋게 스케일 조정
    정답률: Math.round(day.averageAccuracy),
  }));

  // 콘텐츠 타입별 정답률 데이터
  const contentAccuracyData = overview.contentTypeDistribution.map((item) => ({
    타입: item.contentType,
    정답률: Math.round(item.averageAccuracy),
    문제수: Math.round(item.questionsAttempted / 100), // 스케일 조정
  }));

  // 활동 타입별 데이터
  const activityTypeData = overview.activityTypeDistribution.map((item) => ({
    name: item.activityType,
    value: Math.round(item.averageAccuracy),
    questions: item.questionsAttempted,
    color:
      item.activityType === "읽기"
        ? "#3b82f6"
        : item.activityType === "듣기"
        ? "#10b981"
        : item.activityType === "말하기"
        ? "#f59e0b"
        : "#ef4444",
  }));

  // 난이도별 성과 데이터
  const difficultyData = overview.difficultyDistribution.map((item) => ({
    난이도: item.difficulty,
    정답률: Math.round(item.accuracy),
    문제수: Math.round(item.questionsAttempted / 100),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="mb-2 text-3xl font-bold">한글 학습 관리 시스템</h1>
          <p className="text-muted-foreground">
            특수교육 대상 학생들을 위한 통합 학습 관리 플랫폼
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() =>
              onNavigate({
                section: "groups",
                breadcrumb: [
                  { id: "dashboard", label: "홈", section: "dashboard" },
                  { id: "groups", label: "그룹 관리", section: "groups" },
                ],
              })
            }
            className="gap-2"
            size="lg"
          >
            <Users className="w-4 h-4" />
            그룹 관리 시작
          </Button>
          <Button
            onClick={() =>
              onNavigate({
                section: "students",
                breadcrumb: [
                  { id: "dashboard", label: "홈", section: "dashboard" },
                  { id: "students", label: "학습 현황", section: "students" },
                ],
              })
            }
            variant="outline"
            className="gap-2"
            size="lg"
          >
            <GraduationCap className="w-4 h-4" />
            학습 현황 보기
          </Button>
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryData.map((item, index) => {
          const Icon = item.icon;
          return (
            <Card
              key={index}
              className="transition-shadow cursor-pointer hover:shadow-md"
              onClick={item.action}
            >
              <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="mb-1 text-2xl font-bold">{item.value}</div>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 최근 일주일 학습 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 일주일 학습 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={recentActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="날짜" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "정답률" ? `${value}%` : value,
                    name === "활동학생"
                      ? "활동 학생 수"
                      : name === "문제수"
                      ? "응시 문제 (×10)"
                      : name,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="활동학생"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="정답률"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 활동 타입별 성과 */}
        <Card>
          <CardHeader>
            <CardTitle>활동 타입별 평균 정답률</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "평균 정답률"]} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 콘텐츠 타입별 학습 성과 */}
        <Card>
          <CardHeader>
            <CardTitle>콘텐츠 타입별 학습 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentAccuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="타입" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "정답률" ? `${value}%` : `${value * 100}개`,
                    name === "정답률" ? "평균 정답률" : "응시 문제 수",
                  ]}
                />
                <Bar dataKey="정답률" fill="#10b981" />
                <Bar dataKey="문제수" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 난이도별 성과 분석 */}
        <Card>
          <CardHeader>
            <CardTitle>난이도별 성과 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="난이도" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "정답률" ? `${value}%` : `${value * 100}개`,
                    name === "정답률" ? "평균 정답률" : "응시 문제 수",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="정답률"
                  stroke="#ef4444"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="문제수"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 주요 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Brain className="w-5 h-5" />
            주요 학습 통계 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                전체 성과
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">총 응시 문제</span>
                  <span className="font-medium">
                    {overview.totalQuestionsAttempted.toLocaleString()}개
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">평균 정답률</span>
                  <span className="font-medium text-green-600">
                    {overview.averageAccuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">총 학습 시간</span>
                  <span className="font-medium">
                    {overview.totalStudyHours}시간
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                활동별 최고 성과
              </h4>
              <div className="space-y-2">
                {activityTypeData
                  .sort((a, b) => b.value - a.value)
                  .map((activity, index) => (
                    <div key={activity.name} className="flex justify-between">
                      <span className="text-sm">{activity.name}</span>
                      <span
                        className={`font-medium ${
                          index === 0 ? "text-green-600" : ""
                        }`}
                      >
                        {activity.value}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                콘텐츠별 진도
              </h4>
              <div className="space-y-2">
                {contentAccuracyData
                  .sort((a, b) => b.정답률 - a.정답률)
                  .map((content, index) => (
                    <div key={content.타입} className="flex justify-between">
                      <span className="text-sm">{content.타입}</span>
                      <span
                        className={`font-medium ${
                          index === 0 ? "text-green-600" : ""
                        }`}
                      >
                        {content.정답률}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
