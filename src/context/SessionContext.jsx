/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Toast } from "@/components/Toast";
import { METHODS, TARGETS } from "@/utils/globals";
import useContentQuery from "@/hook/useContentQuery";
import useCurriculumQuery from "@/hook/useCurriculumQuery";
import {
  getActiveSession,
  patchProgress,
  postAttempt,
  startSession,
} from "@/api/session";
import useCurriculumListQuery from "@/hook/useCurriculumListQuery";
// 1. 컨텍스트 생성
const LearningSessionContext = createContext(null);

// 2. Provider 컴포넌트
export const SessionProvider = ({ children }) => {
  // URL 파라미터 관리
  const { character, chapter, method } = useParams(); // charater: charaterId, chapter: chapterId, method: read/listen/speak/write
  // console.log("character, chapter, method = ", character, chapter, method);
  const navigate = useNavigate();
  // 데이터 쿼리
  const {
    data,
    isLoading: isDataLoading,
    isError,
    refetch: refetchData,
  } = useContentQuery(character, chapter, method);
  const learningDataForTarget = data?.contents;

  const [openContentList, setOpenContentList] = useState(false); // 콘텐츠 리스트 상태
  const { curriculumData, isCurriculumLoading, isCurriculumError } =
    useCurriculumQuery(character); // Curriculum API 호출
  const { listData } = useCurriculumListQuery(character);
  const [repeatSettings, setRepeatSettings] = useState({
    correct: data?.repeat || 1,
    incorrect: Math.round(data?.repeat * 1.5) || 2,
  });
  const [curriculumIndex, setCurriculumIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0); // 현재 학습 중인 콘텐츠(문자/단어)의 인덱스 (0부터 시작)
  const [currentQuestionNo, setCurrentQuestion] = useState(1); // 현재 콘텐츠에 대한 반복 학습 횟수 (1부터 시작, repeatSettings.correct까지)
  const [currentLearningCount, setCurrentLearningCount] = useState(1); // 현재 콘텐츠를 학습한 총 횟수 (정답/오답 모두 포함)
  const [timer, setTimer] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [tutorMessage, setTutorMessage] = useState("학습을 시작해 주세요.");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(sessionId ? false : true);
  const [curriculum, setCurriculum] = useState(null);

  // 세션 초기화 중복 실행 방지
  const isInitializing = useRef(false);
  const timerRef = useRef(null);

  // data나 method가 변경될 때마다 saved를 업데이트하고 상태 초기화
  useEffect(() => {
    if (isInitializing.current) return; // 이미 실행 중이면 무시

    (async () => {
      if (chapter && method && data && !sessionId) {
        isInitializing.current = true; // 실행 시작 표시

        try {
          // sessionId가 없을 때만 실행
          const found = await getActiveSession({
            characterId: character,
            chapterId: chapter,
            method: method,
            target: data.target,
          });
          if (found.active) {
            const s = found.session;
            setSessionId(s._id);
            setCurrentItemIndex(s.currentItemIndex);
            setCurrentQuestion(s.currentQuestionNo);
            setCurrentLearningCount(s.currentLearningCount);
          } else {
            const device = {
              userAgent: navigator.userAgentData, // 브라우저, OS 등
              locale: navigator.language,
              platform: navigator.platform,
              screen: {
                width: screen.width,
                height: screen.height,
              },
            };
            const res = await fetch("https://ipapi.co/json/");
            const location = await res.json();
            device.ip = location.ip;
            const { city, region, country } = location;
            device.geo = { city, region, country };

            const started = await startSession({
              characterId: character,
              chapterId: chapter,
              method,
              target: data.target,
              repeatSettings: {
                correct: data?.repeat || 1,
                incorrect: Math.round((data?.repeat || 1) * 1.5) || 2,
              },
              device,
            });
            setSessionId(started.sessionId);
          }
        } finally {
          isInitializing.current = false; // 실행 완료 표시
        }
      }
    })();
  }, [chapter, method, data?.target, data?.repeat, sessionId]);

  const item = learningDataForTarget?.[currentItemIndex];

  // Curriculum 데이터를 기반으로 동적으로 NEXT_STEP 생성
  const getNextStep = () => {
    if (!listData || !data?.target) return null;

    let currentListItemIndex = listData.findIndex(
      ({ target: t, method: m, chapterId }) =>
        chapterId === chapter && t === data.target && m === method
    );
    let nextListItem = listData[currentListItemIndex + 1];
    while (
      nextListItem &&
      nextListItem.session &&
      nextListItem.session.status === "ended"
    ) {
      currentListItemIndex += 1;
      nextListItem = listData[currentListItemIndex + 1];
    }
    let next = `/learn/${character}`;
    let title = `축하합니다!`;
    let description = [
      `${TARGETS[data?.target || "unknown"]} ${
        METHODS[method]
      } 학습을 완료했습니다!`,
    ];
    if (nextListItem) {
      next = `/learn/${nextListItem.characterId}/${nextListItem.chapterId}/${nextListItem.method}`;
      description.push(
        `다음으로 ${TARGETS[nextListItem.target]} ${
          METHODS[nextListItem.method]
        } 학습을 시작합니다.`
      );
    } else {
      title = "축하합니다🎉🎉🎉";
      description.push(`모든 학습을 완료했습니다!`);
    }
    return { title, description, next };
  };

  // Method 페이지에서 사용할 methodData 반환 함수
  const getMethodData = (targetChapter) => {
    if (!curriculumData) return null;

    const chapterData = curriculumData.find(
      (item) => item.chapterId === targetChapter
    );
    return chapterData?.methods || null;
  };

  // 콘텐츠 리스트 핸들러
  const handleContentListToggle = () => {
    setOpenContentList(!openContentList);
  };

  const handleContentListClose = () => {
    setOpenContentList(false);
  };

  const handleContentSelect = (index) => {
    // setCurrentItemIndex(index);
    saveProgressOnly({
      sessionId,
      item: learningDataForTarget?.[index],
      method,
    });
    handleContentListClose();
  };

  const playFeedbackSound = (isCorrect) => {
    const sound = document.getElementById(
      isCorrect ? "correct-audio" : "wrong-audio"
    );
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  };

  const handleNextStep = () => {
    setLoading(true);
    const nextStep = getNextStep();

    if (!nextStep) {
      // nextSteps 없는 경우 기본 동작
      setLoading(false);
      return;
    }

    const { title, description, next } = nextStep;
    const sound = document.getElementById("complete-audio");
    sound.currentTime = 0;
    sound.play();
    toast.custom(
      () => <Toast title={title} description={description} type="info" />,
      {
        position: "top-center",
        duration: 5000,
        onAutoClose: () => {
          clearInterval(timerRef.current);
          setCurrentItemIndex(0);
          // setCurrentQuestion(1);
          // setCurrentLearningCount(1);
          setTimer(0);
          setTutorMessage("학습을 시작해 주세요.");
          setProgress(0);
          navigate(next);
          setLoading(false);
        },
      }
    );
  };

  const handleAnswer = async (answer) => {
    if (!sessionId) return;
    // setLoading(true);
    const payload = {
      characterId: character,
      chapterId: chapter,
      sessionId,
      method,
      target: data.target,
      isCorrect: answer?.isCorrect,
      solvingTimeSec: answer?.responseTime || 0,
      submittedAnswer: answer?.user,
      correctAnswer: answer?.correct,
      currentLetter: answer?.correct,
      currentItemIndex,
      currentQuestionNo,
      currentLearningCount,
      totalItemsCount: data?.contents?.length,
      concentration: answer?.concentration,
    };
    const { session } = await postAttempt(payload);
    const onAutoClose = () => {
      if (session.status === "ended") {
        handleNextStep();
      } else {
        setCurrentItemIndex(session.currentItemIndex);
        setCurrentQuestion(session.currentQuestionNo);
        setCurrentLearningCount(session.currentLearningCount);
      }
    };
    playFeedbackSound(answer?.isCorrect);

    if (answer?.isCorrect) {
      toast.custom(
        () => (
          <Toast title="정답입니다!" description="잘했어요." type="success" />
        ),
        {
          position: "top-center",
          duration: 1500,
          onAutoClose,
        }
      );
    } else {
      toast.custom(
        () => (
          <Toast
            title="틀렸어요."
            description="다시 시도해 보세요."
            type="error"
          />
        ),
        {
          position: "top-center",
          duration: 1500,
          onAutoClose,
        }
      );
    }
  };

  // 수동 이동: 콘텐츠 리스트에서 항목 클릭(점프), “건너뛰기”, “이전/다음” 버튼으로 응답 없이 이동
  // 자동 이동(비응답): 학습 단계 스킵/튜토리얼 완료 등에서 정답 제출 없이 다음 콘텐츠로 이동
  // 재진입/복원 후 포인터 교정: 서버 세션과 로컬 뷰가 어긋났을 때(새로고침·뒤로가기) Attempt 없이 포인터만 맞춤
  const saveProgressOnly = useCallback(
    async (params) => {
      if (!params?.sessionId) return;
      const { session } = await patchProgress(params);
      setCurrentItemIndex(session.currentItemIndex);
      setCurrentQuestion(session.currentQuestionNo);
      setCurrentLearningCount(session.currentLearningCount);
    },
    [sessionId]
  );

  useEffect(() => {
    if (data) {
      // data가 존재할 때만 실행
      setRepeatSettings({
        correct: data?.repeat || 1,
        incorrect: Math.round((data?.repeat || 1) * 1.5) || 2,
      });
      setCurriculumIndex(data?.index || 0);
    }
  }, [data]);

  useEffect(() => {
    setLoading(sessionId ? false : true);
  }, [sessionId]);

  // 2) 진행률은 별도 effect로 (레퍼런스 말고 길이만)
  const total = learningDataForTarget?.length ?? 0;
  useEffect(() => {
    refetchData();
    setProgress(
      total
        ? Number(Math.round(((currentItemIndex + 1) / total) * 100).toFixed(0))
        : 0
    );
  }, [currentItemIndex, total]);

  const value = useMemo(
    () => ({
      character,
      chapter,
      method,
      target: data?.target,

      // 콘텐츠 리스트 관련
      openContentList,
      handleContentListToggle,
      handleContentListClose,
      handleContentSelect,

      // 데이터 관련
      data,
      isDataLoading,
      isError,
      learningDataForTarget,

      // 커리큘럼 관련
      curriculumIndex,
      curriculum,
      setCurriculum,
      curriculumData,
      isCurriculumLoading,
      isCurriculumError,
      getMethodData,

      // 학습 세션 관련
      currentItemIndex,
      currentLearningCount,
      currentRepeat: currentQuestionNo,
      repeatSettings,
      timer,
      tutorMessage,
      progress,
      loading,
      item,
      onAnswer: handleAnswer,
      setTutorMessage,
      setCurrentItemIndex,
      saveProgressOnly,
    }),
    [
      character,
      chapter,
      method,
      data?.target,
      openContentList,
      data,
      isDataLoading,
      isError,
      learningDataForTarget,
      curriculumIndex,
      curriculum,
      curriculumData,
      isCurriculumLoading,
      isCurriculumError,
      currentItemIndex,
      currentQuestionNo,
      currentLearningCount,
      repeatSettings,
      timer,
      tutorMessage,
      progress,
      loading,
      item,
    ]
  );
  return (
    <LearningSessionContext.Provider value={value}>
      {children}
    </LearningSessionContext.Provider>
  );
};

// 3. 컨텍스트용 커스텀 훅
export const useSessionContext = () => {
  const ctx = useContext(LearningSessionContext);
  if (!ctx) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return ctx;
};
