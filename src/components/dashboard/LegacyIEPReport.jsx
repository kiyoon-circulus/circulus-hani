import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import {
  FileText,
  Download,
  Printer,
  User,
  Target,
  BookOpen,
  CheckCircle,
  Settings,
} from "lucide-react";

export function LegacyIEPReport({ student }) {
  const currentDate = new Date().toLocaleDateString("ko-KR");
  const reportPeriod = "2025-03-01 ~ 2025-08-01";

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

  const concentrationLevel =
    student.totalConcentrationIssues < 10
      ? "Excellent"
      : student.totalConcentrationIssues < 20
      ? "Good"
      : "Needs Improvement";

  // 목표 설정 로직
  // const generateGoals = (student) => {
  //   const currentAccuracy = student.averageAccuracy;
  //   const targetAccuracy = Math.min(95, currentAccuracy + 10);

  //   return {
  //     annual: `Achieve ${targetAccuracy}% accuracy in comprehensive reading skills.`,
  //     shortTerm1: `Improve overall accuracy from ${currentAccuracy}% to ${Math.min(100, currentAccuracy + 5)}% in 3 months.`,
  //     shortTerm2: `Increase consecutive correct answers from ${student.currentConsecutiveCorrect} to ${student.currentConsecutiveCorrect + 3} in 3 months.`
  //   };
  // };

  // const goals = generateGoals(student);
  const performanceLevel = getPerformanceLevel(student.averageAccuracy);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // PDF 다운로드 로직 (실제 구현에서는 PDF 라이브러리 사용)
    alert("IEP 보고서 다운로드 기능입니다. (실제 환경에서는 PDF 생성)");
  };

  return (
    <div className="w-[210mm] max-w-[210mm] min-h-[297mm] mx-auto bg-white p-6 space-y-4 print:shadow-none shadow-lg print:p-4 print:space-y-3">
      {/* 액션 버튼 (인쇄 시 숨김) */}
      <div className="flex justify-between items-center print:hidden">
        <div className="space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 w-4 h-4" />
            인쇄
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 w-4 h-4" />
            PDF 다운로드
          </Button>
        </div>
      </div>
      {/* 헤더 */}
      <div className="pb-4 text-center border-b-2 border-gray-200">
        <h1 className="text-xl font-bold">개별화 교육 프로그램 보고서</h1>
      </div>

      {/* 학생 기본 정보 */}
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex gap-2 items-center">
            <User className="w-5 h-5" />
            학생 기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div>
                <span className="font-medium">이름:</span>
                <span className="ml-2">{student.studentName}</span>
              </div>
              <div>
                <span className="font-medium">학년/반:</span>
                <span className="ml-2">그룹 {student.groupId}</span>
              </div>
              <div>
                <span className="font-medium">장애 유형:</span>
                <span className="ml-2">학습장애</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">보고서 기간:</span>
                <span className="ml-2">{reportPeriod}</span>
              </div>
              <div>
                <span className="font-medium">담당 교사:</span>
                <span className="ml-2">이혜진</span>
              </div>
              <div>
                <span className="font-medium">작성일:</span>
                <span className="ml-2">{currentDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 현재 성취 수준 */}
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex gap-2 items-center">
            <Target className="w-5 h-5" />
            현재 성취 수준
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">자음 인식:</span>
                  <Badge className={performanceLevel.color}>
                    {Math.max(75, student.averageAccuracy - 5)}%
                  </Badge>
                </div>
                <Progress
                  value={Math.max(75, student.averageAccuracy - 5)}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">모음 인식:</span>
                  <Badge className={performanceLevel.color}>
                    {Math.min(100, student.averageAccuracy + 5)}%
                  </Badge>
                </div>
                <Progress
                  value={Math.min(100, student.averageAccuracy + 5)}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">단어 읽기 정확도:</span>
                  <Badge className={performanceLevel.color}>
                    {student.averageAccuracy}%
                  </Badge>
                </div>
                <Progress value={student.averageAccuracy} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">발음 정확도:</span>
                  <Badge className={performanceLevel.color}>
                    {Math.max(70, student.averageAccuracy - 3)}%
                  </Badge>
                </div>
                <Progress
                  value={Math.max(70, student.averageAccuracy - 3)}
                  className="h-2"
                />
              </div>

              <div>
                <span className="font-medium">집중력 수준:</span>
                <div className="mt-2">
                  <Badge
                    className={
                      concentrationLevel === "Excellent"
                        ? "bg-green-100 text-green-800"
                        : concentrationLevel === "Good"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {concentrationLevel === "Excellent"
                      ? "우수"
                      : concentrationLevel === "Good"
                      ? "양호"
                      : "보통"}{" "}
                    (평균{" "}
                    {Math.max(
                      10,
                      25 - Math.floor(student.totalConcentrationIssues / 4)
                    )}
                    분 집중)
                  </Badge>
                </div>
              </div>

              <div>
                <span className="font-medium">총 학습 시간:</span>
                <span className="ml-2 font-bold text-blue-600">
                  {Math.round(student.totalStudyTimeMinutes / 60)}시간
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 목표 설정 */}
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex gap-2 items-center">
            <Target className="w-5 h-5" />
            교육 목표
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 space-y-3">
          <div>
            <h4 className="mb-2 font-medium text-blue-600">연간 목표:</h4>
            <p className="p-2 text-sm bg-blue-50 rounded">
              종합적인 읽기 능력에서{" "}
              {Math.min(95, student.averageAccuracy + 10)}% 정확도를 달성합니다.
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-green-600">단기 목표 1:</h4>
            <p className="p-2 text-sm bg-green-50 rounded">
              전체 정확도를 {student.averageAccuracy}%에서{" "}
              {Math.min(100, student.averageAccuracy + 5)}%로 3개월 내에
              향상시킵니다.
            </p>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-green-600">단기 목표 2:</h4>
            <p className="p-2 text-sm bg-green-50 rounded">
              연속 정답 수를 {student.currentConsecutiveCorrect}개에서{" "}
              {student.currentConsecutiveCorrect + 3}개로 3개월 내에
              증가시킵니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 교수-학습 방법 */}
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex gap-2 items-center">
            <BookOpen className="w-5 h-5" />
            교수-학습 방법
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-2">
            <div className="flex gap-3 items-start">
              <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
              <p>이미지-단어 매칭 게임을 활용한 어휘력 강화</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
              <p>어려운 단어에 대한 음성 지원을 통한 읽기 연습</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
              <p>음성 인식 피드백을 활용한 일일 15분 발음 연습</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-500" />
              <p>개별 학습 속도에 맞춘 반복 학습 프로그램</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 평가 방법 및 기준 */}
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex gap-2 items-center">
            <CheckCircle className="w-5 h-5" />
            평가 방법 및 기준
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="p-3 bg-green-50 rounded">
              <h4 className="mb-1 text-sm font-medium text-green-700">
                승급 기준
              </h4>
              <p className="text-xs">정확도 ≥ 80%</p>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <h4 className="mb-1 text-sm font-medium text-red-700">
                재학습 필요
              </h4>
              <p className="text-xs">정확도 &lt; 60%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <h4 className="mb-1 text-sm font-medium text-blue-700">
                진도 추적
              </h4>
              <p className="text-xs">월별 미니 테스트</p>
            </div>
          </div>

          <div className="p-3 mt-3 bg-gray-50 rounded">
            <h4 className="mb-2 text-sm font-medium">현재 평가 결과:</h4>
            <div className="flex gap-3 items-center">
              <Badge className={performanceLevel.color} variant="outline">
                {performanceLevel.korean}
              </Badge>
              <span className="text-xs text-gray-600">
                평균 정확도: {student.averageAccuracy}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 지원 서비스 */}
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex gap-2 items-center">
            <Settings className="w-5 h-5" />
            지원 서비스
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-2">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-2 w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">음성 인식 소프트웨어가 탑재된 태블릿</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-2 w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">
                오답률이 높은 단어를 위한 맞춤형 플래시카드
              </p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-2 w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">가정 학습을 위한 학부모 지도 매뉴얼</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-2 w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">주 2회 개별 학습 지원 세션</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-2 w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm">집중력 향상을 위한 단계별 학습 활동</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 서명 섹션 */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 h-10 border-b border-gray-300"></div>
              <p className="text-xs font-medium">담당교사 서명</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-10 border-b border-gray-300"></div>
              <p className="text-xs font-medium">특수교육코디네이터</p>
            </div>
            <div className="text-center">
              <div className="mb-2 h-10 border-b border-gray-300"></div>
              <p className="text-xs font-medium">학교장</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
