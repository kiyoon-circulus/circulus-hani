/* eslint-disable react-hooks/exhaustive-deps */
// 시간 기반 + 카메라 기반 집중도 감지
import { useState, useEffect, useRef } from "react";
import { FACE_BASE, getCameraCtor, getFaceMeshCtor } from "@/utils/mediapipe";

// 비활성 기록 발생 기준(실측): 현재는 2분. 주석/코멘트와 일치 필요.
export const FAST_ANSWER_SECONDS = 2; // 2초 미만 = 너무 빠름
export const SLOW_ANSWER_SECONDS = 60; // 60초 초과 = 너무 느림(현재 issues엔 미반영)
export const RECENT_RESP_WINDOW = 10; // 최근 10문항으로 판정
export const FAST_RECENT_TOLERANCE = 2; // 최근 창에서 2개까지는 허용
export const SLOW_RECENT_TOLERANCE = 2;
export const SLOW_ANSWER_WEIGHT = 0.5;

export const FAST_ANSWER_WEIGHT = 0.5; // 빠른 응답 1건당 가산
export const INACTIVITY_WEIGHT = 0.5; // 비활성 1건당 가산
export const FACE_ABSENCE_PENALTY = 2; // 얼굴 미감지 페널티

export const FOCUS_WINDOW_FRAMES = 20; // 최근 20프레임으로 집계
export const FOCUS_LOW_THRESHOLD = 0.6; // 0.6 미만이면 이슈 가산(0~1 스케일)
export const FOCUS_SEVERE_THRESHOLD = 0.3; // 0.3 미만이면 절대 경고(absoluteWarnings)

export const MAX_ISSUES_CAP = 8; // 이슈 상한
export const LEVEL_LOW_MIN = 5; // totalIssues > 4 → low
export const LEVEL_MEDIUM_MIN = 2; // 2~4 → medium, 0~1 → high

// 비활성 기록 발생 기준(실측): 현재는 2분. 주석/코멘트와 일치 필요.
export const INACTIVITY_MS_THRESHOLD = 120000; // 2분

export const FOCUS_PENALTY_MULTIPLIER = 5;

export const SPEECH_LONG_PAUSE_WEIGHT = 0.5;

// 최근 N문항에서 fast/slow 개수를 계산
export function computeRecentResponseStats(
  times = [],
  windowSize,
  fastSec,
  slowSec
) {
  const recent = times.slice(-windowSize);
  const fast = recent.filter((t) => t < fastSec).length;
  const slow = recent.filter((t) => t > slowSec).length;
  return { fast, slow };
}

export const useConcentrationMonitor = (sessionId, studentId) => {
  const videoRef = useRef(null);

  const [concentrationData, setConcentrationData] = useState({
    questionSolvingTimes: [],
    suspiciouslyFastAnswers: 0,
    suspiciouslySlowAnswers: 0,
    consecutiveWrongAnswers: 0,
    maxConsecutiveWrong: 0,
    inactivityPeriods: [],
    concentrationIssues: 1, // 초기값을 1로 설정 (medium 상태 시작)
    // 카메라 기반 집중도 데이터 추가
    focusData: {
      focusLog: [],
      focusRate: 0,
      faceDetected: null,
      eyeTrackingData: [],
      headPoseData: [],
      attentionScore: 0,
    },
  });

  const sessionStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const questionStartTime = useRef(null);
  const inactivityTimer = useRef(null);

  // 카메라 관련 refs (videoRef는 외부에서 받음)
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const focusLogRef = useRef([]);
  const noFaceFrameCount = useRef(0);
  const LOW = 60; // 낮음 트리거 임계 (%)
  const HIGH = 75; // 정상 해제 임계 (%)
  const CONSEC = 2; // 같은 방향 연속 횟수
  const MIN_HOLD = 1500; // 전환 후 최소 유지(ms)

  const belowStreakRef = useRef(0);
  const aboveStreakRef = useRef(0);
  const alertRef = useRef("normal"); // "normal" | "low"
  const lastFlipAtRef = useRef(0);

  // 비활성 시간 감지
  const detectInactivity = () => {
    const currentTime = Date.now();
    const inactiveTime = currentTime - lastActivityTime.current;

    if (inactiveTime > INACTIVITY_MS_THRESHOLD) {
      // 2분 이상 비활성 (태블릿 환경 고려)
      setConcentrationData((prev) => ({
        ...prev,
        inactivityPeriods: [...prev.inactivityPeriods, inactiveTime],
        concentrationIssues: prev.concentrationIssues + 1,
      }));
    }
  };

  // 문제 시작 시 호출
  const startQuestionTimer = () => {
    questionStartTime.current = Date.now();
    lastActivityTime.current = Date.now();
  };

  // 문제 완료 시 호출 - 문제 풀이 시간 계산 및 집중도 통계 업데이트
  const endQuestionTimer = (isCorrect) => {
    if (!questionStartTime.current) return 0;

    const solvingTime = (Date.now() - questionStartTime.current) / 1000; // 초 단위 - 문제 시작부터 답안 제출까지의 시간

    setConcentrationData((prev) => {
      // 문제 풀이 시간 배열에 추가 (집중도 분석용)
      const newSolvingTimes = [...prev.questionSolvingTimes, solvingTime];

      // 집중도 이슈 감지: 비정상적으로 빠른/느린 응답 패턴 분석
      let newSuspiciouslyFast = prev.suspiciouslyFastAnswers;
      let newSuspiciouslySlow = prev.suspiciouslySlowAnswers;

      // 2초 미만 응답 - 집중도 부족 의심 / 60초 초과 응답 - 집중도 부족 의심
      const isFast = solvingTime < FAST_ANSWER_SECONDS;
      const isSlow = solvingTime > SLOW_ANSWER_SECONDS;
      if (isFast) {
        newSuspiciouslyFast += 1;
      }
      if (isSlow) {
        newSuspiciouslySlow += 1;
      }

      // 연속 오답 패턴 분석 - 학습 집중도 저하 지표
      let newConsecutiveWrong = isCorrect
        ? 0
        : prev.consecutiveWrongAnswers + 1;
      let newMaxConsecutiveWrong = Math.max(
        prev.maxConsecutiveWrong,
        newConsecutiveWrong
      );

      if (!isCorrect && newConsecutiveWrong > 3) {
        console.log("❌ 연속 오답:", newConsecutiveWrong + "회");
      }

      return {
        ...prev,
        questionSolvingTimes: newSolvingTimes, // 문제별 풀이 시간 기록
        suspiciouslyFastAnswers: newSuspiciouslyFast, // 빠른 응답 횟수
        suspiciouslySlowAnswers: newSuspiciouslySlow, // 느린 응답 횟수
        consecutiveWrongAnswers: newConsecutiveWrong, // 연속 오답 횟수
        maxConsecutiveWrong: newMaxConsecutiveWrong, // 최대 연속 오답 기록
        inactivityPeriods: [], // 답변 제출 시 비활성 시간 기록 초기화
      };
    });

    lastActivityTime.current = Date.now();

    // ✅ 문제 풀이 시간 반환
    return solvingTime;
  };

  // 사용자 활동 감지
  const updateActivity = () => {
    lastActivityTime.current = Date.now();

    // 사용자 활동 시 집중도 이슈 즉시 감소 및 비활성 시간 초기화
    setConcentrationData((prev) => ({
      ...prev,
      concentrationIssues: Math.max(0, prev.concentrationIssues - 0.3),
      inactivityPeriods: [], // 사용자 활동 시 비활성 시간 기록 초기화
    }));
  };

  // FaceMesh 결과 처리
  const onFaceMeshResults = (results) => {
    if (results.multiFaceLandmarks?.length > 0) {
      const lm = results.multiFaceLandmarks[0]; // 랜드마크 478개

      // 1) iris 센터 (478 모델일 때 각 눈 5점: 좌 468~472, 우 473~477)
      const irisCenter = (idxs) => {
        let x = 0,
          y = 0;
        idxs.forEach((i) => {
          x += lm[i].x;
          y += lm[i].y;
        });
        return { x: x / idxs.length, y: y / idxs.length };
      };
      const leftIris = irisCenter([468, 469, 470, 471, 472]);
      const rightIris = irisCenter([473, 474, 475, 476, 477]);

      // 2) 눈 코너 (좌: 33,133 / 우: 362,263). 눈 중심과 눈 폭(정규화 기준) 계산
      const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
      const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

      const leftCornerA = lm[33],
        leftCornerB = lm[133];
      const rightCornerA = lm[362],
        rightCornerB = lm[263];

      const leftEyeCenter = mid(leftCornerA, leftCornerB);
      const rightEyeCenter = mid(rightCornerA, rightCornerB);
      const leftEyeWidth = Math.max(1e-6, dist(leftCornerA, leftCornerB));
      const rightEyeWidth = Math.max(1e-6, dist(rightCornerA, rightCornerB));

      // 3) iris 편차를 ‘눈 폭’으로 정규화 (양 눈 평균)
      const leftOffset = dist(leftIris, leftEyeCenter) / leftEyeWidth; // 0 ~ 1+
      const rightOffset = dist(rightIris, rightEyeCenter) / rightEyeWidth;
      const gazeOffset = (leftOffset + rightOffset) / 2;

      // 4) 임계치로 판정 (처음엔 0.35~0.45로 시작해 튜닝)
      const isFocused = gazeOffset < 0.4;

      // 5) focusLog & focusRate 갱신 (매 프레임)
      setConcentrationData((prev) => {
        const nextLog = [...prev.focusData.focusLog.slice(-19), isFocused];
        const frRaw = (nextLog.filter(Boolean).length / nextLog.length) * 100;
        const prevSmooth = prev.focusData.smoothedFocusRate ?? frRaw;
        const EMA_ALPHA = 0.25; // 반응성↔안정성 트레이드오프 (0.2~0.35 추천)
        const frSmooth = EMA_ALPHA * frRaw + (1 - EMA_ALPHA) * prevSmooth;
        return {
          ...prev,
          focusData: {
            ...prev.focusData,
            faceDetected: true,
            focusLog: nextLog,
            focusRate: frRaw, // 원시값은 참고용으로 유지
            smoothedFocusRate: frSmooth, // ★ 판정/표시에 사용
          },
        };
      });

      focusLogRef.current = [...focusLogRef.current.slice(-89), isFocused];
      noFaceFrameCount.current = 0;
    } else {
      // 얼굴이 감지되지 않음 - 5초마다 한 번씩만 로그 출력

      noFaceFrameCount.current += 1;
      if (noFaceFrameCount.current >= 6) {
        // 약 200ms 후 미감지 확정
        setConcentrationData((prev) => {
          const nextLog = [...prev.focusData.focusLog.slice(-19), false];
          const frRaw = (nextLog.filter(Boolean).length / nextLog.length) * 100;
          const prevSmooth = prev.focusData.smoothedFocusRate ?? frRaw;
          const EMA_ALPHA = 0.25;
          const frSmooth = EMA_ALPHA * frRaw + (1 - EMA_ALPHA) * prevSmooth;
          return {
            ...prev,
            focusData: {
              ...prev.focusData,
              faceDetected: false,
              focusLog: nextLog,
              attentionScore: 0,
              focusRate: frRaw,
              smoothedFocusRate: frSmooth,
            },
          };
        });
      }

      focusLogRef.current = [...focusLogRef.current.slice(-89), false];
    }
  };

  // 카메라 초기화
  const initializeCamera = async () => {
    if (!videoRef?.current) {
      console.error("❌ videoRef가 없습니다");
      return;
    }

    try {
      // 기존 카메라 정리
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (faceMeshRef.current) {
        faceMeshRef.current = null;
      }

      // FaceMesh 초기화
      const FaceMeshCtor = await getFaceMeshCtor();
      const faceMesh = new FaceMeshCtor({
        locateFile: (file) => FACE_BASE + file, // wasm/data 경로 고정
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.3, // 감지 임계값 낮춤
        minTrackingConfidence: 0.3, // 추적 임계값 낮춤
      });

      faceMesh.onResults(onFaceMeshResults);
      faceMeshRef.current = faceMesh;
      console.log("✅ FaceMesh 초기화 완료");

      // 카메라 초기화
      const CameraCtor = await getCameraCtor();
      const camera = new CameraCtor(videoRef.current, {
        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      await camera.start();
      cameraRef.current = camera;
      console.log("✅ 카메라 시작 완료");

      // 카메라 권한 확인
      if (videoRef.current && videoRef.current.readyState >= 2) {
        console.log("✅ 비디오 스트림 활성화됨");
      } else {
        console.log("❌ 비디오 스트림이 활성화되지 않음");
      }
    } catch (error) {
      console.error("❌ 카메라 초기화 실패:", error);
    }
  };

  // 집중도 점수 계산 (개선된 버전)
  const calculateConcentrationScore = () => {
    const {
      // suspiciouslyFastAnswers = 0,
      maxConsecutiveWrong = 0,
      inactivityPeriods = [],
      focusData = {},
    } = concentrationData;

    let issues = 0;

    // 1) 빠른 응답 (한 번만)
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

    // 2) 연속 오답
    if (maxConsecutiveWrong > 8) {
      issues += Math.floor(maxConsecutiveWrong / 5);
    }

    // 3) 비활성
    issues += inactivityPeriods.length * INACTIVITY_WEIGHT;

    // 4) 포커스
    if ((focusData.focusLog?.length || 0) >= FOCUS_WINDOW_FRAMES) {
      const recent = focusData.focusLog.slice(-1 * FOCUS_WINDOW_FRAMES);
      const focusRate = recent.filter(Boolean).length / FOCUS_WINDOW_FRAMES;
      if (focusRate < FOCUS_LOW_THRESHOLD) {
        issues += Math.floor(
          (FOCUS_LOW_THRESHOLD - focusRate) * FOCUS_PENALTY_MULTIPLIER
        );
      }
    }

    // 5) 얼굴 미감지
    if (!focusData.faceDetected) issues += FACE_ABSENCE_PENALTY;

    return Math.min(issues, MAX_ISSUES_CAP);
  };

  // 실시간 집중도 체크
  const checkFocusLevel = () => {
    if (focusLogRef.current.length < 20) return;
    const fr = concentrationData.focusData.focusRate ?? 0; // 0~100
    const now = Date.now();

    // 연속 판정 카운팅
    if (fr < LOW) {
      belowStreakRef.current += 1;
      aboveStreakRef.current = 0;
    } else if (fr > HIGH) {
      aboveStreakRef.current += 1;
      belowStreakRef.current = 0;
    } else {
      // 중간 밴드에서는 리셋
      belowStreakRef.current = 0;
      aboveStreakRef.current = 0;
    }

    const canFlip = now - (lastFlipAtRef.current || 0) > MIN_HOLD;

    // 상태 전환(알림 on/off) — 한 번의 setState로 원자적으로
    setConcentrationData((prev) => {
      let issues = prev.concentrationIssues;
      let flipped = false;

      if (
        alertRef.current === "normal" &&
        belowStreakRef.current >= CONSEC &&
        canFlip
      ) {
        alertRef.current = "low";
        lastFlipAtRef.current = now;
        issues = issues + 1; // 정책에 맞게 조정
        flipped = true;
      } else if (
        alertRef.current === "low" &&
        aboveStreakRef.current >= CONSEC &&
        canFlip
      ) {
        alertRef.current = "normal";
        lastFlipAtRef.current = now;
        issues = Math.max(0, issues - 0.3);
        flipped = true;
      }

      return flipped ? { ...prev, concentrationIssues: issues } : prev;
    });
  };

  // 세션 종료 시 데이터 반환
  const getSessionData = () => {
    return {
      sessionId,
      studentId,
      duration: (Date.now() - sessionStartTime.current) / 1000,
      concentrationData,
      concentrationScore: calculateConcentrationScore(),
    };
  };

  useEffect(() => {
    // 30초마다 비활성 체크
    inactivityTimer.current = setInterval(detectInactivity, 30000);

    // 사용자 활동 이벤트 리스너 (태블릿 환경 고려)
    const events = [
      "mousemove",
      "click",
      "keydown",
      "scroll",
      "touchstart",
      "touchmove",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity);
    });

    // 카메라 권한 요청 및 초기화
    const requestCameraPermission = async () => {
      try {
        console.log("📹 카메라 권한 요청 중...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user", // 전면 카메라 사용
          },
        });
        console.log("✅ 카메라 권한 획득");
        stream.getTracks().forEach((track) => track.stop()); // 임시 스트림 정리

        // 권한 획득 후 카메라 초기화
        setTimeout(() => {
          initializeCamera();
        }, 500);
      } catch (error) {
        console.error("❌ 카메라 권한 거부:", error);
        // console.log("💡 브라우저 설정에서 카메라 권한을 허용해주세요");
      }
    };

    requestCameraPermission();

    // 1초마다 집중도 체크 (더 빠른 반응)
    const focusCheckInterval = setInterval(checkFocusLevel, 1000);

    return () => {
      if (inactivityTimer.current) {
        clearInterval(inactivityTimer.current);
      }
      if (focusCheckInterval) {
        clearInterval(focusCheckInterval);
      }
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });

      // 카메라 정리
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    initializeCamera();
  }, [videoRef]);

  return {
    startQuestionTimer,
    endQuestionTimer,
    updateActivity,
    getSessionData,
    concentrationData,
    videoRef, // 비디오 요소 참조 반환
  };
};
