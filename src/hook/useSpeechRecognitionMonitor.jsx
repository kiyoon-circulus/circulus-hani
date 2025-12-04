// 음성 인식 기반 집중도 감지
import { useState, useRef } from "react";

export const useSpeechRecognitionMonitor = () => {
  const [speechData, setSpeechData] = useState({
    recognitionSuccessRate: 0,
    failedRecognitions: 0,
    totalAttempts: 0,
    speechQuality: {
      volumeLevel: 0,
      clarity: 0,
      consistency: 0,
    },
    speechPatterns: {
      hesitationCount: 0,
      longPauses: 0,
      repetitionCount: 0,
      correctionAttempts: 0,
    },
    failureReasons: {
      noSpeech: 0,
      audioCapture: 0,
      notAllowed: 0,
      networkError: 0,
    },
  });

  const recognitionStartTime = useRef(null);
  const lastSpeechTime = useRef(null);

  // 음성 인식 시작
  const startRecognition = () => {
    recognitionStartTime.current = Date.now();
    lastSpeechTime.current = Date.now();
  };

  // 음성 인식 성공
  const recordSuccessfulRecognition = (transcript, confidence) => {
    const currentTime = Date.now();
    const recognitionTime = currentTime - recognitionStartTime.current;

    setSpeechData((prev) => {
      const newTotalAttempts = prev.totalAttempts + 1;
      const newSuccessRate =
        ((newTotalAttempts - prev.failedRecognitions) / newTotalAttempts) * 100;

      // 음성 품질 평가
      const newVolumeLevel = Math.min(confidence * 100, 100);
      const newClarity = calculateClarity(transcript);
      const newConsistency = calculateConsistency(transcript);

      // 음성 패턴 분석
      const newHesitationCount = detectHesitation(transcript);
      const newLongPauses = detectLongPauses(recognitionTime);
      const newRepetitionCount = detectRepetition(transcript);

      return {
        ...prev,
        recognitionSuccessRate: newSuccessRate,
        totalAttempts: newTotalAttempts,
        speechQuality: {
          volumeLevel: newVolumeLevel,
          clarity: newClarity,
          consistency: newConsistency,
        },
        speechPatterns: {
          ...prev.speechPatterns,
          hesitationCount:
            prev.speechPatterns.hesitationCount + newHesitationCount,
          longPauses: prev.speechPatterns.longPauses + newLongPauses,
          repetitionCount:
            prev.speechPatterns.repetitionCount + newRepetitionCount,
        },
      };
    });

    lastSpeechTime.current = currentTime;
  };

  // 음성 인식 실패
  const recordFailedRecognition = (error) => {
    setSpeechData((prev) => {
      const newTotalAttempts = prev.totalAttempts + 1;
      const newFailedRecognitions = prev.failedRecognitions + 1;
      const newSuccessRate =
        ((newTotalAttempts - newFailedRecognitions) / newTotalAttempts) * 100;

      // 실패 원인 분류
      let newFailureReasons = { ...prev.failureReasons };
      const failureReason = classifyFailureReason(error);
      if (failureReason) {
        newFailureReasons[failureReason] += 1;
      }

      return {
        ...prev,
        recognitionSuccessRate: newSuccessRate,
        totalAttempts: newTotalAttempts,
        failedRecognitions: newFailedRecognitions,
        failureReasons: newFailureReasons,
      };
    });
  };

  // 실패 원인 분류
  const classifyFailureReason = (error) => {
    if (error.error === "no-speech") {
      return "noSpeech";
    } else if (error.error === "audio-capture") {
      return "audioCapture";
    } else if (error.error === "not-allowed") {
      return "notAllowed";
    } else if (error.error === "network") {
      return "networkError";
    }
    return null;
  };

  // 명확도 계산
  const calculateClarity = (transcript) => {
    if (!transcript) return 0;

    // 한글 자음/모음 정확도 체크
    const koreanPattern = /[ㄱ-ㅎㅏ-ㅣ가-힣]/g;
    const koreanMatches = transcript.match(koreanPattern) || [];
    const clarity = (koreanMatches.length / transcript.length) * 100;

    return Math.min(clarity, 100);
  };

  // 일관성 계산
  const calculateConsistency = (transcript) => {
    if (!transcript) return 0;

    // 반복되는 패턴 감지
    const words = transcript.split(" ");
    const uniqueWords = new Set(words);
    const consistency = (uniqueWords.size / words.length) * 100;

    return Math.min(consistency, 100);
  };

  // 망설임 감지
  const detectHesitation = (transcript) => {
    if (!transcript) return 0;

    // 망설임 표현 패턴
    const hesitationPatterns = [
      /어/,
      /음/,
      /그/,
      /저/,
      /이/,
      /그게/,
      /저게/,
      /뭐지/,
    ];

    let hesitationCount = 0;
    hesitationPatterns.forEach((pattern) => {
      const matches = transcript.match(pattern);
      if (matches) {
        hesitationCount += matches.length;
      }
    });

    return hesitationCount;
  };

  // 긴 휴식 감지
  const detectLongPauses = (recognitionTime) => {
    if (recognitionTime > 5000) {
      // 5초 이상
      return 1;
    }
    return 0;
  };

  // 반복 감지
  const detectRepetition = (transcript) => {
    if (!transcript) return 0;

    const words = transcript.split(" ");
    const wordCount = {};

    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const repetitions = Object.values(wordCount).filter((count) => count > 1);
    return repetitions.length;
  };

  // 수정 시도 기록
  const recordCorrectionAttempt = () => {
    setSpeechData((prev) => ({
      ...prev,
      speechPatterns: {
        ...prev.speechPatterns,
        correctionAttempts: prev.speechPatterns.correctionAttempts + 1,
      },
    }));
  };

  // 집중도 이슈 점수 계산 (단순화된 버전)
  const getConcentrationIssues = () => {
    let issues = 0;

    // 긴 휴식만 유지 (다른 항목들은 제외)
    issues += speechData.speechPatterns.longPauses;

    return Math.min(issues, 5);
  };

  // 음성 품질 점수
  const getSpeechQualityScore = () => {
    const { volumeLevel, clarity, consistency } = speechData.speechQuality;
    return (volumeLevel + clarity + consistency) / 3;
  };

  return {
    startRecognition,
    recordSuccessfulRecognition,
    recordFailedRecognition,
    recordCorrectionAttempt,
    speechData,
    getConcentrationIssues,
    getSpeechQualityScore,
  };
};
