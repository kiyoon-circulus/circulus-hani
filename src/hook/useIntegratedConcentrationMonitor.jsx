/* eslint-disable react-hooks/exhaustive-deps */
// 모든 집중도 데이터 통합 관리
import { useState, useEffect, useRef } from "react";
import {
  computeRecentResponseStats,
  FACE_ABSENCE_PENALTY,
  FAST_ANSWER_SECONDS,
  FAST_ANSWER_WEIGHT,
  FAST_RECENT_TOLERANCE,
  FOCUS_LOW_THRESHOLD,
  FOCUS_PENALTY_MULTIPLIER,
  FOCUS_SEVERE_THRESHOLD,
  FOCUS_WINDOW_FRAMES,
  INACTIVITY_WEIGHT,
  MAX_ISSUES_CAP,
  RECENT_RESP_WINDOW,
  SLOW_ANSWER_SECONDS,
  SLOW_ANSWER_WEIGHT,
  SLOW_RECENT_TOLERANCE,
  SPEECH_LONG_PAUSE_WEIGHT,
  useConcentrationMonitor,
} from "./useConcentrationMonitor";
import { useSpeechRecognitionMonitor } from "./useSpeechRecognitionMonitor";

export const useIntegratedConcentrationMonitor = (
  sessionId,
  studentId,
  activityType
) => {
  const [integratedData, setIntegratedData] = useState({
    totalIssues: 0,
    concentrationLevel: "medium", // 초기값을 'medium'으로 변경
    recommendations: [],
    sessionQuality: 0,
  });

  // 로그 출력 제어를 위한 ref
  const lastLogTime = useRef(0);

  // 각 모니터링 훅 초기화
  const concentrationMonitor = useConcentrationMonitor(sessionId, studentId);
  const speechMonitor = useSpeechRecognitionMonitor();

  // 최종 집중도 점수 계산 (개선된 버전)
  const calculateIntegratedScore = () => {
    const concentrationData = concentrationMonitor.concentrationData;
    const speechData = speechMonitor.speechData;

    let issues = 0;
    let absoluteWarnings = []; // 절대적 경고 메시지

    // 1. 비정상적으로 빠른 응답 (가중치 감소)
    const { fast: recentFast, slow: recentSlow } = computeRecentResponseStats(
      concentrationData.questionSolvingTimes || [],
      RECENT_RESP_WINDOW,
      FAST_ANSWER_SECONDS,
      SLOW_ANSWER_SECONDS
    );

    // 초과분만 페널티 (허용치 FAST_RECENT_TOLERANCE 초과한 개수 × 가중치)
    const fastOver = Math.max(0, recentFast - FAST_RECENT_TOLERANCE);
    issues += fastOver * FAST_ANSWER_WEIGHT;

    // (선택) 느린 응답도 점수에 반영하려면 아래 주석 해제
    const slowOver = Math.max(0, recentSlow - SLOW_RECENT_TOLERANCE);
    issues += slowOver * SLOW_ANSWER_WEIGHT;

    // 2. 연속 오답 패턴 (임계값 완화)
    if (concentrationData.maxConsecutiveWrong > MAX_ISSUES_CAP) {
      issues += Math.floor(concentrationData.maxConsecutiveWrong / 5);
    }

    // 3. 비활성 시간 (3분 이상으로 완화)
    const inactivityIssues =
      concentrationData.inactivityPeriods.length * INACTIVITY_WEIGHT;
    issues += inactivityIssues;

    // 4. 긴 휴식 (말하기 활동에서만)
    if (activityType === "speak") {
      const lp = speechData?.speechPatterns?.longPauses || 0;
      issues += lp * SPEECH_LONG_PAUSE_WEIGHT;
    }

    // 5. 카메라 기반 집중도 이슈 (더 엄격한 기준)
    const focusData = concentrationData.focusData;
    if (focusData.focusLog.length >= FOCUS_WINDOW_FRAMES) {
      // 30초에서 20초로 단축
      const recent = focusData.focusLog.slice(-1 * FOCUS_WINDOW_FRAMES);
      const focusRate = recent.filter(Boolean).length / FOCUS_WINDOW_FRAMES;
      if (focusRate < FOCUS_LOW_THRESHOLD) {
        issues += Math.floor(
          (FOCUS_LOW_THRESHOLD - focusRate) * FOCUS_PENALTY_MULTIPLIER
        );
      }
      if (focusRate < FOCUS_SEVERE_THRESHOLD) {
        if (!absoluteWarnings.includes("화면을 제대로 보고 있지 않습니다")) {
          absoluteWarnings.push("화면을 제대로 보고 있지 않습니다");
        }
      }
    }

    // 절대적 기준 체크
    if (focusData.faceDetected === false) {
      absoluteWarnings.push("카메라 앞에 앉아주세요");
    }

    if (concentrationData.inactivityPeriods.length > 0) {
      absoluteWarnings.push("오랫동안 활동이 없습니다");
    }

    if (
      recentFast >= 3 &&
      !absoluteWarnings.includes("너무 빠른 응답이 많습니다")
    ) {
      absoluteWarnings.push("너무 빠른 응답이 많습니다");
    }

    // (선택) 느린 응답 경고도 원하면
    if (
      recentSlow >= 3 &&
      !absoluteWarnings.includes("너무 느린 응답이 많습니다")
    ) {
      absoluteWarnings.push("너무 느린 응답이 많습니다");
    }

    if (concentrationData.maxConsecutiveWrong > 5) {
      absoluteWarnings.push("연속으로 틀리는 문제가 많습니다");
    }

    // ↑ 위와 내용이 겹치는 하드코딩 블록은 삭제 (중복 경고 방지)

    if (!focusData.faceDetected) {
      issues += FACE_ABSENCE_PENALTY; // 얼굴 미감지 시 더 큰 페널티
    }

    const totalIssues = Math.min(issues, MAX_ISSUES_CAP); // 최대 8점으로 감소

    // 집중도 레벨 결정 (더 엄격한 기준으로 조정)
    let concentrationLevel = "high";
    if (totalIssues > 4) {
      // 6에서 4로 엄격하게 조정
      concentrationLevel = "low";
    } else if (totalIssues > 1) {
      // 3에서 1로 엄격하게 조정
      concentrationLevel = "medium";
    }

    // 권장사항 생성
    const recommendations = generateRecommendations({
      totalIssues,
      concentrationLevel,
      focusData,
    });

    // 세션 품질 점수 (0-100)
    const sessionQuality = Math.max(100 - totalIssues * 10, 0);

    const result = {
      totalIssues,
      concentrationLevel,
      recommendations,
      sessionQuality,
      absoluteWarnings,
    };

    // 최종 집중도 점수 로그 출력
    const now = Date.now();
    if (now - lastLogTime.current > 5000) {
      console.log("🎯 최종 집중도 점수:", {
        totalIssues,
        concentrationLevel,
        sessionQuality,
        absoluteWarnings,
        details: {
          fastAnswers: concentrationData.suspiciouslyFastAnswers,
          consecutiveWrong: concentrationData.maxConsecutiveWrong,
          inactivityPeriods: concentrationData.inactivityPeriods.length,
          faceDetected: focusData.faceDetected,
          focusRate: focusData.focusRate?.toFixed(1) + "%",
        },
      });
      lastLogTime.current = now;
    }

    return result;
  };

  // 권장사항 생성 (단순화된 버전)
  const generateRecommendations = (data) => {
    const recommendations = [];

    if (data.totalIssues > 6) {
      recommendations.push("휴식을 취하고 다시 시작해보세요.");
    }

    if (data.concentrationLevel === "low") {
      recommendations.push("학습 환경을 조용하게 만들어보세요.");
    }

    // if (!data.focusData.faceDetected) {
    //   recommendations.push("카메라 앞에 앉아주세요.");
    // }

    return recommendations;
  };

  // 통합 데이터 업데이트
  useEffect(() => {
    const integratedScore = calculateIntegratedScore();
    setIntegratedData(integratedScore);
  }, [concentrationMonitor.concentrationData, speechMonitor.speechData]);

  // 사용자 활동 감지 시 집중도 상태 즉시 업데이트
  useEffect(() => {
    const handleUserActivity = () => {
      // 사용자 활동 시 집중도 상태를 즉시 개선
      setTimeout(() => {
        const currentScore = calculateIntegratedScore();

        const filtered = (currentScore.absoluteWarnings || []).filter(
          (w) => w !== "오랫동안 활동이 없습니다"
        );
        if (
          filtered.length !== currentScore.absoluteWarnings.length ||
          (currentScore.totalIssues <= 1 &&
            currentScore.concentrationLevel !== "high")
        ) {
          setIntegratedData({
            ...currentScore,
            concentrationLevel:
              currentScore.totalIssues <= 1
                ? "high"
                : currentScore.concentrationLevel,
            totalIssues:
              currentScore.totalIssues <= 1
                ? Math.max(0, currentScore.totalIssues - 1)
                : currentScore.totalIssues,
            absoluteWarnings: filtered,
          });
        }
      }, 500);
    };

    // 사용자 활동 이벤트 리스너
    const events = [
      "mousemove",
      "click",
      "keydown",
      "scroll",
      "touchstart",
      "touchmove",
    ];
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, []);

  // 문제 시작 시 호출
  const startQuestion = () => {
    concentrationMonitor.startQuestionTimer();
    if (activityType === "speak") {
      speechMonitor.startRecognition();
    }
  };

  // 답변 제출 시 호출
  const submitAnswer = (userAnswer, correctAnswer) => {
    const isCorrect =
      activityType === "speak" || activityType === "write"
        ? (userAnswer || []).includes(correctAnswer)
        : userAnswer === correctAnswer;
    // 1️⃣ 먼저 문제 풀이 시간 계산 (endQuestionTimer에서 반환)
    const solvingTime = concentrationMonitor.endQuestionTimer(isCorrect);
    // 한 번만 계산
    const integratedScore = calculateIntegratedScore();

    // ① 실측 스냅샷 (한 번만!)
    const fd = concentrationMonitor.concentrationData?.focusData ?? {};
    console.log("**fd**", fd);
    const focusLog = Array.isArray(fd.focusLog) ? fd.focusLog : [];
    const recent = focusLog.slice(-20);
    const snapshotRate = recent.length
      ? (recent.filter(Boolean).length / recent.length) * 100
      : null;
    const focusRate =
      Number.isFinite(fd.focusRate) && fd.focusRate > 0
        ? fd.focusRate
        : snapshotRate ?? 0;
    const attentionScore = Number.isFinite(fd.attentionScore)
      ? fd.attentionScore
      : Number.isFinite(focusRate)
      ? Math.min(1, Math.max(0, focusRate / 100))
      : 0;

    const concentrationData = {
      solvingTime,
      attentionScore, // 0~1
      focusStatus: attentionScore > 0.5,
      faceDetected: !!fd.faceDetected,
      concentrationLevel: integratedScore.concentrationLevel,
      focusRate, // 0~100
      isCorrect,
    };

    if (activityType === "speak") {
      if (isCorrect) {
        speechMonitor.recordSuccessfulRecognition(userAnswer, 0.8);
      } else {
        speechMonitor.recordFailedRecognition({ error: "incorrect-answer" });
      }
    }

    // 답변 제출 시 즉시 집중도 상태 업데이트 (절대적 경고 제거)
    setTimeout(() => {
      const improvedScore = {
        ...integratedScore,
        absoluteWarnings: [], // 답변 제출 시 절대적 경고 즉시 제거
      };
      setIntegratedData(improvedScore);
      // console.log("📝 답변 제출 - 경고 메시지 제거:", {
      //   timestamp: new Date().toLocaleTimeString(),
      //   userAnswer,
      //   isCorrect,
      //   warningsRemoved: integratedScore.absoluteWarnings.length > 0,
      //   inactivityPeriods:
      //     concentrationMonitor.concentrationData.inactivityPeriods.length,
      // });
    }, 100);

    // 집중도 데이터 즉시 반환
    return concentrationData;
  };

  // 세션 종료 시 데이터 수집
  const getSessionSummary = () => {
    return {
      sessionId,
      studentId,
      activityType,
      duration: concentrationMonitor.getSessionData().duration,
      concentrationData: {
        timeBased: concentrationMonitor.concentrationData,
        speechData: speechMonitor.speechData,
        focusData: concentrationMonitor.concentrationData.focusData,
      },
      integratedScore: integratedData,
      recommendations: integratedData.recommendations,
    };
  };

  // 실시간 집중도 상태
  const getConcentrationStatus = () => {
    return {
      level: integratedData.concentrationLevel,
      score: integratedData.sessionQuality,
      issues: integratedData.totalIssues,
      recommendations: integratedData.recommendations,
      absoluteWarnings: integratedData.absoluteWarnings || [],
      focusRate: concentrationMonitor.concentrationData.focusData.focusRate,
      faceDetected:
        concentrationMonitor.concentrationData.focusData.faceDetected,
    };
  };

  return {
    // 모니터링 시작/종료
    startQuestion,
    submitAnswer,
    getSessionSummary,

    // 실시간 상태
    getConcentrationStatus,

    // 개별 모니터링 데이터
    concentrationData: concentrationMonitor.concentrationData,
    speechData: speechMonitor.speechData,
    focusData: concentrationMonitor.concentrationData.focusData,

    // 통합 데이터
    integratedData,

    // 비디오 요소 참조
    videoRef: concentrationMonitor.videoRef,

    // 음성 인식 관련 함수들
    recordSpeechFailure: speechMonitor.recordFailedRecognition,
    recordSpeechSuccess: speechMonitor.recordSuccessfulRecognition,
    recordCorrectionAttempt: speechMonitor.recordCorrectionAttempt,
  };
};
