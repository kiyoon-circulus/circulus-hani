import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Scatter,
  LabelList,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  ZAxis,
} from "recharts";
import {
  Users,
  GraduationCap,
  TrendingUp,
  Clock,
  Target,
  Brain,
  Loader2,
} from "lucide-react";
import { useLearningOverview } from "@/hook/useStudentAnalytics";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTimeText } from "@/utils/globals";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: overview,
    isPending,
    isError,
  } = useLearningOverview(user?._id, {});

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">학습 데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <span>학습 데이터를 불러올 수 없습니다.</span>
      </div>
    );
  }

  // 실제 데이터가 없는 경우
  if (!overview) {
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

  const normHours = overview.stat?.hours;
  const normMins = overview.stat?.minutes % 60;
  const summaryData = [
    {
      title: "활동 학생",
      value: overview.stat.student.toString(),
      subtitle: "전체 학습자",
      color: "bg-blue-500",
      icon: GraduationCap,
      action: () => navigate("/manage/students"),
    },
    {
      title: "응시 문제",
      value: overview.stat.questions.toString(),
      subtitle: "누적 학습량",
      color: "bg-green-500",
      icon: Target,
      action: () => navigate("/manage/students"),
    },
    {
      title: "평균 정답률",
      value: `${overview.stat.averageAccuracy.toFixed(1)}%`,
      subtitle: "전체 성취도",
      color: "bg-purple-500",
      icon: TrendingUp,
      action: () => navigate("/manage/students"),
    },
    {
      title: "총 학습 시간",
      value: getTimeText(overview.stat.minutes),
      subtitle: "누적 학습량",
      color: "bg-orange-500",
      icon: Clock,
      action: () => navigate("/manage/students"),
    },
  ];

  // 최근 7일 지표
  const act = overview.recentActivityData ?? [];
  // 활동일(문제수>0)
  const activeDays = act.filter((d) => (d.questions ?? 0) > 0).length;
  // 최고 활동일
  const peak = act.reduce(
    (p, c) => ((c.questions ?? 0) > (p?.questions ?? 0) ? c : p),
    null
  );

  // 연속 활동(최장/현재)
  const sorted = [...act].sort(
    (a, b) => new Date(a.dateRaw).valueOf() - new Date(b.dateRaw).valueOf()
  );
  let longest = 0,
    current = 0;
  for (let i = 0; i < sorted.length; i++) {
    const q = sorted[i].questions ?? 0;
    if (q > 0) {
      if (i > 0) {
        const prev = new Date(sorted[i - 1].dateRaw).valueOf();
        const cur = new Date(sorted[i].dateRaw).valueOf();
        const diffDays = Math.round((cur - prev) / (1000 * 60 * 60 * 24));
        current = diffDays === 1 ? current + 1 : 1;
      } else current = 1;
      longest = Math.max(longest, current);
    } else {
      // 현재 스트릭은 마지막 날부터 역방향으로만 유효
      if (i === sorted.length - 1) current = 0;
    }
  }

  // 1인당 평균 문제수
  const perStudent =
    (overview.stat?.student ?? 0) > 0
      ? Math.round((overview.stat.questions ?? 0) / overview.stat.student)
      : 0;

  // 활동 방식 인사이트(읽기/듣기/말하기/쓰기)
  const methods = overview.methodsAccuracyData ?? [];
  const bestMethod = methods.reduce(
    (p, c) => ((c.average ?? 0) > (p?.average ?? 0) ? c : p),
    null
  );
  const mostAttemptMethod = methods.reduce(
    (p, c) => ((c.attempted ?? 0) > (p?.attempted ?? 0) ? c : p),
    null
  );
  const LOW_SAMPLE = 20;
  const lowSamples = methods
    .filter((m) => (m.attempted ?? 0) > 0 && m.attempted < LOW_SAMPLE)
    .map((m) => m.type);

  // 콘텐츠 인사이트(모음/자음/글자/낱말)
  const contents = overview.contentTypeData ?? [];
  const totalQ = overview.stat?.questions ?? 0;
  const contentWithRatio = contents.map((c) => ({
    ...c,
    ratio: totalQ > 0 ? Math.round((c.attempted / totalQ) * 1000) / 10 : 0, // 소수1자리
  }));
  const bestContent = contents
    .filter((c) => (c.attempted ?? 0) > 0)
    .reduce((p, c) => ((c.average ?? 0) > (p?.average ?? 0) ? c : p), null);
  const notEntered = contents
    .filter((c) => (c.attempted ?? 0) === 0)
    .map((c) => c.type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">한글 학습 관리 시스템</h1>
          <p className="text-muted-foreground">
            특수교육 대상 학생들을 위한 통합 학습 관리 플랫폼
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/manage/groups")}
            className="gap-2"
            size="lg"
          >
            <Users className="w-4 h-4" />
            그룹 관리 시작
          </Button>
          <Button
            onClick={() => navigate("/manage/students")}
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
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
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
        {/* 활동 타입별 성과 */}
        <Card>
          <CardHeader>
            <CardTitle>학습 방식별 평균 정답률</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={overview.methodsAccuracyData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" axisLineType="circle" />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  angle={135}
                  orientation="middle"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(v, n, p) => [
                    `${p.payload.average}%`,
                    "평균 정답률",
                  ]}
                />
                <Radar
                  name="평균 정답률"
                  dataKey="average"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.35}
                />
              </RadarChart>
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
              <RadarChart data={overview.contentTypeData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="type" axisLineType="circle" />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  angle={135}
                  orientation="middle"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(v, n, p) => [
                    `${p.payload.average}%`,
                    "평균 정답률",
                  ]}
                />
                <Radar
                  name="평균 정답률"
                  dataKey="average"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 최근 일주일 학습 활동 (막대=문제수 / 선=정답률 / 라벨=활동학생) */}
        <Card>
          <CardHeader>
            <CardTitle>최근 일주일 학습 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={overview.recentActivityData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                {/* 날짜축: 시간 스케일 */}
                <XAxis dataKey="dateLabel" padding="no-gap" />

                {/* 좌측축: 문제수 */}
                <YAxis yAxisId="left" />

                {/* 우측축: 정답률 */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v || 0}%`}
                />

                <Tooltip
                  formatter={(value, name) => {
                    if (name === "accuracy") return [`${value}%`, "정답률"];
                    if (name === "questions") return [value, "응시 문제"];
                    if (name === "activeStudents")
                      return [value, "활동 학생 수"];
                    return [value, name];
                  }}
                />

                {/* 막대: 문제수 (파랑) */}
                <Bar
                  yAxisId="left"
                  dataKey="questions"
                  name="questions"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList
                    dataKey="activeStudents"
                    name="activeStudents"
                    position="top"
                    formatter={(v) => (v != null ? `👥 ${v}` : "")}
                  />
                </Bar>

                {/* 선: 정답률 (초록) */}
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  name="accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
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
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" type="category" />
                <YAxis
                  dataKey="average"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <ZAxis dataKey="attempted" range={[80, 800]} />
                {/* 버블 크기 범위 */}
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "average") return [`${value}%`, "정답률"];
                    if (name === "attempted") return [value, "응시 문제"];
                    if (name === "type") return [value, "난이도"];
                    return [value, name];
                  }}
                />
                <Scatter
                  data={overview.diffycultyData}
                  name="난이도별 성과"
                  fill="#8b5cf6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 주요 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            주요 학습 통계 요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* 1) 핵심 인사이트 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                핵심 인사이트
              </h4>
              <div className="px-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">활동일</span>
                  <span className="font-medium">{activeDays}일 / 최근 7일</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">최고 활동일</span>
                  <span className="font-medium">
                    {peak ? `${peak.dateLabel} · ${peak.questions}문제` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">연속 활동(최장/현재)</span>
                  <span className="font-medium">
                    {longest}일 / {current}일
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">1인당 평균 문제</span>
                  <span className="font-medium">{perStudent}문제</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">총 학습 시간</span>
                  <span className="font-medium">
                    {normHours}시간 {normMins}분
                  </span>
                </div>
              </div>
            </div>

            {/* 2) 학습 방식 인사이트 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                학습 방식 인사이트
              </h4>
              <div className="px-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">최고 정답률</span>
                  <span className="font-medium">
                    {bestMethod
                      ? `${bestMethod.type} ${bestMethod.average}% (${bestMethod.attempted}문제)`
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">최다 학습</span>
                  <span className="font-medium">
                    {mostAttemptMethod
                      ? `${mostAttemptMethod.type} ${mostAttemptMethod.attempted}문제`
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">학습 부족 항목</span>
                  <span className="font-medium">
                    {lowSamples.length > 0 ? (
                      <span className="inline-flex flex-wrap gap-1">
                        {lowSamples.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700"
                          >
                            {s}
                          </span>
                        ))}
                      </span>
                    ) : (
                      "없음"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 3) 콘텐츠 인사이트 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                콘텐츠 인사이트
              </h4>
              <div className="px-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">미진입 영역</span>
                  <span className="font-medium">
                    {notEntered.length > 0 ? notEntered.join(", ") : "없음"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">최고 정답률</span>
                  <span className="font-medium">
                    {bestContent
                      ? `${bestContent.type} ${bestContent.average}% (${bestContent.attempted}문제)`
                      : "-"}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">학습 분포</div>
                  <div className="px-1 space-y-1">
                    {contentWithRatio.map((c) => (
                      <div
                        key={c.type}
                        className="flex justify-between text-sm"
                      >
                        <span>{c.type}</span>
                        <span className="font-medium">{c.ratio}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
