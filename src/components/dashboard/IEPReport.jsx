import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  FileText,
  Target,
  BookOpen,
  Loader2,
  ChartBar,
  NotepadText,
  ScanEye,
  Route,
} from "lucide-react";
import { useStudentAnalytics } from "@/hook/useStudentAnalytics";
import { useState } from "react";
import { getTimeText, METHODS, TARGETS } from "@/utils/globals";
import { IEPReportHeader } from "./IEPReportHeader";
import { StudentInfoCard } from "./StudentInfoCard";
import { Button } from "../ui/button";

export function IEPReport({
  student: { _id: characterId, nickname: studentName, icon },
  onClose,
}) {
  const [dateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const {
    data: analyticsData,
    isPending,
    isError,
  } = useStudentAnalytics(characterId, dateRange);

  const currentDate = new Date().toLocaleDateString("ko-KR");
  const reportPeriod = `${dateRange.startDate} ~ ${dateRange.endDate}`;

  // 성취도별 색상 및 레벨 매핑
  const getPerformanceLevel = (accuracy) => {
    if (accuracy >= 90)
      return {
        level: "Excellent",
        color: "bg-green-100 text-green-800",
        korean: "우수",
      };
    if (accuracy >= 80)
      return {
        level: "Good",
        color: "bg-blue-100 text-blue-800",
        korean: "양호",
      };
    if (accuracy >= 70)
      return {
        level: "Fair",
        color: "bg-yellow-100 text-yellow-800",
        korean: "보통",
      };
    return {
      level: "Needs Improvement",
      color: "bg-red-100 text-red-800",
      korean: "개선필요",
    };
  };

  const handlePrint = () => {
    alert("IEP 보고서 프린트 기능을 추후 제공 예정입니다.");
    // window.print();
  };

  const handleDownload = () => {
    // PDF 다운로드 로직 (실제 구현에서는 PDF 라이브러리 사용)
    alert("IEP 보고서 pdf 다운로드 기능을 추후 제공 예정입니다.");
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">학습 데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (isError || !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 m-auto">
        <p className="text-5xl font-extrabold">⚠️ Error</p>
        <p>학습 데이터 로드 중 오류가 발생했습니다.</p>
        <Button variant="outline" className="my-4" onClick={onClose}>
          닫기
        </Button>
      </div>
    );
  }

  // 학습 기록이 없는 경우 체크
  const hasLearningData =
    analyticsData.totalQuestionsAttempted > 0 ||
    analyticsData.weeklyProgress?.length > 0 ||
    analyticsData.activityBreakdown?.length > 0;

  if (!hasLearningData) {
    return (
      <div className="w-[210mm] max-w-[210mm] min-h-[297mm] mx-auto bg-white p-6 space-y-4 print:border-none border border-gray-200 print:p-4 print:space-y-3">
        <IEPReportHeader
          studentName={studentName}
          reportPeriod={reportPeriod}
          onPrint={handlePrint}
          onDownload={handleDownload}
        />

        {/* 학생 기본 정보 */}
        <Card>
          <CardHeader className="p-4 bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              학생 기본 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">이름:</span>
                  <span className="ml-2">{studentName}</span>
                </div>
                <div>
                  <span className="font-medium">학습 기간:</span>
                  <span className="ml-2">{reportPeriod}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 학습 기록 없음 메시지 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="mb-4 text-6xl">📋</div>
                <h3 className="mb-2 text-lg font-medium">
                  학습 기록이 없습니다
                </h3>
                <p className="text-sm">
                  {studentName}님의 학습 데이터가 아직 없습니다.
                </p>
                <p className="text-sm">
                  학습을 시작하면 상세한 IEP 보고서를 생성할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 변환된 데이터 구조에서 필요한 정보 추출
  const {
    totalQuestionsAttempted,
    totalCorrectAnswers,
    totalIncorrectAnswers,
    averageAccuracy,
    totalStudyTimeMinutes,
    totalConcentrationIssues,
    currentConsecutiveCorrect,
    maxConsecutiveCorrect,
    weeklyProgress,
    activityBreakdown,
    contentTypeProgress,
    concentration,
    reportDirection,
  } = analyticsData;
  const performanceLevel = getPerformanceLevel(averageAccuracy);

  const concentrationLevel =
    totalConcentrationIssues < 10
      ? "우수"
      : totalConcentrationIssues < 20
      ? "양호"
      : "보통";

  return (
    <div className="w-[210mm] max-w-[210mm] min-h-[297mm] mx-auto bg-white p-6 space-y-4 border rounded print:p-4 print:space-y-3">
      <IEPReportHeader
        studentName={studentName}
        reportPeriod={reportPeriod}
        onPrint={handlePrint}
        onDownload={handleDownload}
      />

      {/* 학생 기본 정보 */}
      <StudentInfoCard
        studentName={studentName}
        icon={icon}
        reportPeriod={reportPeriod}
        currentDate={currentDate}
      />

      {/* 현재 성취 수준 */}
      <Card>
        <CardHeader className="p-4 bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5" />
            현재 성취 수준
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {/* 콘텐츠별 성취도 - 고정된 항목들 */}
              {Object.entries(TARGETS).map(([key, label]) => {
                const contentData = contentTypeProgress?.find(
                  (content) => content.contentType === key
                );
                const accuracy = contentData?.accuracy || 0;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{label} 정답률:</span>
                      <Badge className={performanceLevel.color}>
                        {accuracy}%
                      </Badge>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              {/* 활동별 성취도 - 고정된 항목들 */}
              {Object.entries(METHODS).map(([key, label]) => {
                const activityData = activityBreakdown?.find(
                  (activity) => activity.activityType === key
                );
                const accuracy = activityData?.accuracy || 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{label} 정답률:</span>
                      <Badge className={performanceLevel.color}>
                        {accuracy}%
                      </Badge>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학습 통계 요약 */}
      <Card>
        <CardHeader className="p-4 bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <NotepadText className="w-5 h-5" />
            학습 통계 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">총 응시 문제:</span>
                <span className="font-medium">{totalQuestionsAttempted}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">총 정답 수:</span>
                <span className="font-medium text-green-600">
                  {totalCorrectAnswers}개
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">총 오답 수:</span>
                <span className="font-medium text-red-600">
                  {totalIncorrectAnswers}개
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">총 학습 시간:</span>
                <span className="font-medium text-blue-600">
                  {getTimeText(totalStudyTimeMinutes)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">평균 정답률:</span>
                <span className="font-medium text-blue-600">
                  {averageAccuracy}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">집중력 수준:</span>
                <Badge
                  className={
                    concentrationLevel === "우수"
                      ? "bg-green-100 text-green-800"
                      : concentrationLevel === "양호"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {concentrationLevel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">최대 연속 정답:</span>
                <span className="font-medium">{maxConsecutiveCorrect}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">현재 연속 정답:</span>
                <span className="font-medium">
                  {currentConsecutiveCorrect}개
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 집중도 분석 */}
      <Card>
        <CardHeader className="p-4 bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <ScanEye className="w-5 h-5" />
            집중도 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">평균 시선 집중도:</span>
                <span className="font-medium">
                  {concentration.avgFocusRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">얼굴 미감지 횟수:</span>
                <span className="font-medium">
                  {concentration.faceLostCount}회
                </span>
              </div>
              <div className="flex justify-between">
                {/*<span className="text-sm">평균 주의력 점수:</span>
                <span className="font-medium">
                  {concentration.avgAttentionScore}
                </span>*/}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">낮은 집중도:</span>
                <span className="font-medium text-red-600">
                  {concentration.lowLevelCount}회
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">보통 집중도:</span>
                <span className="font-medium text-yellow-600">
                  {concentration.mediumLevelCount}회
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">높은 집중도:</span>
                <span className="font-medium text-green-600">
                  {concentration.highLevelCount}회
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 주간 진행률 */}
      <Card>
        <CardHeader className="p-4 bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            주간 학습 진행률
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-2">
            {weeklyProgress.slice(-4).map((week, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded bg-gray-50"
              >
                <span className="text-sm font-medium">{week.week}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    문제: {week.questionsAttempted}개
                  </span>
                  <span className="text-sm">정답률: {week.accuracy}%</span>
                  <span className="text-sm">
                    학습시간: {getTimeText(week.studyTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5" />
            종합 의견 및 지도 방향
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-3">
          {reportDirection?.map(
            (line, i) => line && <p key={`line-${characterId}-${i}`}>{line}</p>
          )}
        </CardContent>
      </Card>

      {/* 목표 설정
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              교육 목표
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <div>
              <h4 className="mb-2 font-medium text-blue-600">연간 목표:</h4>
              <p className="p-2 text-sm rounded bg-blue-50">
                종합적인 읽기 능력에서 {Math.min(95, averageAccuracy + 10)}%
                정확도를 달성합니다.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-green-600">단기 목표 1:</h4>
              <p className="p-2 text-sm rounded bg-green-50">
                전체 정확도를 {averageAccuracy}%에서{" "}
                {Math.min(100, averageAccuracy + 5)}%로 3개월 내에 향상시킵니다.
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-green-600">단기 목표 2:</h4>
              <p className="p-2 text-sm rounded bg-green-50">
                연속 정답 수를 {currentConsecutiveCorrect}개에서{" "}
                {currentConsecutiveCorrect + 3}개로 3개월 내에 증가시킵니다.
              </p>
            </div>
          </CardContent>
        </Card>
      */}

      {/* 교수-학습 방법
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              교수-학습 방법
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
                <p>이미지-단어 매칭 게임을 활용한 어휘력 강화</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
                <p>어려운 단어에 대한 음성 지원을 통한 읽기 연습</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
                <p>음성 인식 피드백을 활용한 일일 15분 발음 연습</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
                <p>개별 학습 속도에 맞춘 반복 학습 프로그램</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
                <p>집중도 모니터링을 통한 맞춤형 학습 조정</p>
              </div>
            </div>
          </CardContent>
        </Card>
      */}

      {/* 평가 방법 및 기준
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              평가 방법 및 기준
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="p-3 rounded bg-green-50">
                <h4 className="mb-1 text-sm font-medium text-green-700">
                  승급 기준
                </h4>
                <p className="text-xs">정확도 ≥ 80%</p>
              </div>
              <div className="p-3 rounded bg-red-50">
                <h4 className="mb-1 text-sm font-medium text-red-700">
                  재학습 필요
                </h4>
                <p className="text-xs">정확도 &lt; 60%</p>
              </div>
              <div className="p-3 rounded bg-blue-50">
                <h4 className="mb-1 text-sm font-medium text-blue-700">
                  진도 추적
                </h4>
                <p className="text-xs">실시간 데이터 분석</p>
              </div>
            </div>

            <div className="p-3 mt-3 rounded bg-gray-50">
              <h4 className="mb-2 text-sm font-medium">현재 평가 결과:</h4>
              <div className="flex items-center gap-3">
                <Badge className={performanceLevel.color} variant="outline">
                  {performanceLevel.korean}
                </Badge>
                <span className="text-xs text-gray-600">
                  평균 정확도: {averageAccuracy}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      */}

      {/* 지원 서비스
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              지원 서비스
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">음성 인식 소프트웨어가 탑재된 태블릿</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">
                  오답률이 높은 단어를 위한 맞춤형 플래시카드
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">가정 학습을 위한 학부모 지도 매뉴얼</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">주 2회 개별 학습 지원 세션</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">집중력 향상을 위한 단계별 학습 활동</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">실시간 집중도 모니터링 및 피드백</p>
              </div>
            </div>
          </CardContent>
        </Card>
      */}

      {/* 서명 섹션
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="h-10 mb-2 border-b border-gray-300"></div>
                <p className="text-xs font-medium">담당교사 서명</p>
              </div>
              <div className="text-center">
                <div className="h-10 mb-2 border-b border-gray-300"></div>
                <p className="text-xs font-medium">특수교육코디네이터</p>
              </div>
              <div className="text-center">
                <div className="h-10 mb-2 border-b border-gray-300"></div>
                <p className="text-xs font-medium">학교장</p>
              </div>
            </div>
          </CardContent>
        </Card>
      */}
    </div>
  );
}
