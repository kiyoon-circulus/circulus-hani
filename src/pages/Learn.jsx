/* eslint-disable react-hooks/exhaustive-deps */
import { Link } from "react-router-dom";
import LearnByRead from "@/components/LearnByRead";
import LearnBySpeak from "@/components/LearnBySpeak";
import LearnByWrite from "@/components/LearnByWrite";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { TARGETS, METHODS, COLORS } from "@/utils/globals";
import Stepper from "@/components/ui/stepper";
import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";
import colors from "tailwindcss/colors";
import LearnByListen from "@/components/LearnByListen";
import TopContentList from "@/features/TopContentList";
import { Loading } from "@/components/Loading";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useIntegratedConcentrationMonitor } from "@/hook/useIntegratedConcentrationMonitor";
import { useSessionContext } from "@/context/SessionContext";
import ConcentrationAlert from "@/features/ConcentrationAlert";

const Learn = () => {
  const {
    // URL 파라미터
    chapter,
    character,
    method,
    target,

    // 콘텐츠 리스트 관련
    openContentList,
    handleContentListToggle,
    handleContentListClose,
    handleContentSelect,

    // 데이터 관련
    data,
    isDataLoading,
    loading,
    isError,

    // 학습 세션 관련
    currentItemIndex,
    currentRepeat,
    currentLearningCount,
    repeatSettings,
    onAnswer,
    item,
  } = useSessionContext();
  const [videoClass, setVideo] = useState(
    "w-[1px] h-[1px] opacity-0 fixed -left-[9999px] -top-[9999px] pointer-events-none"
  );
  // 집중도 모니터링 초기화 (Learn.jsx에서 관리)
  const sessionId = `${character}-${chapter}-${method}`;
  const studentId = "student_1"; // 실제로는 사용자 ID를 사용해야 함
  const { videoRef, getConcentrationStatus, submitAnswer, startQuestion } =
    useIntegratedConcentrationMonitor(sessionId, studentId, method);
  // 실시간 집중도 상태 확인
  const concentrationStatus = getConcentrationStatus();

  const handleAnswer = (userAnswer, correctAnswer) => {
    // 집중도 데이터 수집 (카메라 기반 시선 추적, 얼굴 감지, 문제 풀이 시간 등)
    const concentrationData = submitAnswer(userAnswer, correctAnswer);

    // 집중도 데이터를 포함한 attempt 객체 생성
    const attempt = {
      responseTime: concentrationData.solvingTime, // 문제 풀이 시간 (초)
      isCorrect: concentrationData.isCorrect, // 정답 여부
      correct: correctAnswer, // 정답
      user: userAnswer, // 사용자 답안
      repeat: currentRepeat, // 반복 횟수
      // 집중도 관련 데이터
      concentration: {
        level: concentrationData.concentrationLevel ?? null,
        focusRate:
          typeof concentrationData?.focusRate === "number"
            ? Math.max(0, Math.min(100, Number(concentrationData.focusRate)))
            : null,
        faceDetected: !!concentrationData?.faceDetected,
        attentionScore:
          typeof concentrationData?.attentionScore === "number"
            ? Math.max(
                0,
                Math.min(100, Number(concentrationData.attentionScore))
              )
            : null,
      },
    };

    // 학습 세션에 전달 (백엔드로 Attempt 데이터 전송)
    onAnswer(attempt);
  };

  // 문제 변경 시 집중도 모니터링 시작
  useEffect(() => {
    if (item) {
      startQuestion();
    }
  }, [currentItemIndex, currentLearningCount, item]);

  if (isError)
    return (
      <div className="flex justify-center items-center h-full">
        데이터를 불러오는 중 에러가 발생했습니다.
      </div>
    );

  // data가 로딩 중이거나 없을 때 로딩 표시
  if (isDataLoading || loading || !data) return <Loading />;

  return (
    <>
      <div className="grid grid-rows-[auto_1fr] md:gap-4 px-6 py-4 w-full h-full relative rounded-t-3xl overflow-hidden">
        {/* 숨겨진 비디오 요소 - 모든 학습 컴포넌트에서 공유 */}
        <video
          ref={videoRef}
          // className="w-[1px] h-[1px] opacity-0 fixed -left-[9999px] -top-[9999px] pointer-events-none"
          className={videoClass}
          onLoadedMetadata={() => console.log("✅ 비디오 메타데이터 로드됨")}
          onError={(e) => console.error("❌ 비디오 에러:", e)}
          autoPlay
          muted
          playsInline
          onClick={() =>
            setVideo(
              "w-[1px] h-[1px] opacity-0 fixed -left-[9999px] -top-[9999px] pointer-events-none"
            )
          }
        />

        {/* 집중도 상태 표시 */}
        <ConcentrationAlert {...concentrationStatus} />

        <TopContentList
          open={openContentList}
          color={COLORS[method]}
          currentIndex={currentItemIndex}
          data={data?.contents}
          onSelect={handleContentSelect}
          onClose={handleContentListClose}
        />
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center">
            <Link
              className="p-1 mr-1 w-12 h-12 bg-transparent rounded-full opacity-65 hover:opacity-100 hover:bg-white/50"
              to={`/learn/${character}/${chapter}?target=${target}`}
            >
              <ChevronLeft className="w-10 h-10" />
            </Link>
            <Breadcrumb>
              <BreadcrumbList className="font-bold text-[2.5rem]">
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className={`font-extrabold text-${target}`}
                  >
                    <Link to={`/learn/${character}`}>{TARGETS[target]}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    asChild
                    className={`font-extrabold text-${COLORS[method]}-500`}
                  >
                    <Link
                      to={`/learn/${character}/${chapter}?target=${target}`}
                    >
                      {METHODS[method]}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {item && (
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      asChild
                      className="font-extrabold text-black"
                    >
                      <div>
                        <button
                          className="px-1 py-0 font-extrabold bg-transparent btn"
                          onClick={handleContentListToggle}
                        >
                          "{item.letter}"
                        </button>
                        학습
                      </div>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-8 items-center">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-bold">반복</span>
              <Stepper
                currentStep={currentRepeat}
                totalSteps={repeatSettings.correct}
                activeColor={`bg-${COLORS[method]}-500`}
                style={{ minWidth: `${repeatSettings.correct * 2.5}rem` }}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span
                className="text-sm font-bold"
                onClick={() =>
                  setVideo("w-[200px] h-[200px] fixed right-0 top-0 z-[9999]")
                }
              >
                진행
              </span>
              <AnimatedCircularProgressBar
                className="w-12 h-12"
                max={data?.contents?.length || 0}
                min={1}
                value={currentItemIndex + 1}
                gaugePrimaryColor={
                  COLORS[method] ? colors[COLORS[method]][500] : "#f59e42"
                }
                gaugeSecondaryColor={colors.gray["200"]}
              />
            </div>
          </div>
        </div>
        {item && (
          <>
            {method === "read" && (
              <LearnByRead
                {...{
                  item,
                  target,
                  onAnswer: handleAnswer,
                  currentRepeat,
                  currentItemIndex,
                  currentLearningCount,
                  data: data?.contents,
                }}
              />
            )}
            {method === "listen" && (
              <LearnByListen
                {...{
                  item,
                  target,
                  onAnswer: handleAnswer,
                  currentRepeat,
                  currentItemIndex,
                  currentLearningCount,
                  data: data?.contents,
                }}
              />
            )}
            {method === "speak" && (
              <LearnBySpeak
                {...{
                  item,
                  target,
                  onAnswer: handleAnswer,
                  currentRepeat,
                  currentItemIndex,
                  currentLearningCount,
                }}
              />
            )}
            {method === "write" && (
              <LearnByWrite
                {...{
                  item,
                  target,
                  onAnswer: handleAnswer,
                  currentRepeat,
                  currentItemIndex,
                  currentLearningCount,
                }}
              />
            )}
          </>
        )}
      </div>
      {isDataLoading || loading || !data}
    </>
  );
};

export default Learn;
