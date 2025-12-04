/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from "react";
import { useParams } from "react-router-dom";

const STORAGE_KEY = "hangul_learning_session";

export const useSessionStore = () => {
  const { character } = useParams();

  const getSessionData = () => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version === "1.0") return saved;

    return {
      character: character || null,
      version: "1.0",
      updatedAt: new Date().toISOString(),
      sessions: {},
      stats: {
        totalQuestions: 0,
        totalCorrects: 0,
        totalIncorrects: 0,
        totalFocusLack: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalTime: 0,
        attempts: [],
        sessionStart: Date.now(),
      },
    };
  };

  const saveToStorage = useCallback((data) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...data,
        updatedAt: new Date().toISOString(),
      })
    );
  }, []);

  const loadProgress = useCallback((chapterId, method) => {
    const data = getSessionData();
    console.log("Loading progress for:", { chapterId, method, data });

    // 저장된 데이터 구조에 맞춰서 로드
    // chapterId를 키로 사용하고, method를 하위 키로 사용
    const session = data.sessions?.[chapterId]?.[method] || null;

    if (session) {
      console.log("Found session:", session);
      return session;
    }

    console.log("No session found for:", { chapterId, method });
    return null;
  }, []);

  const saveProgress = useCallback(
    (chapterId, method, index, letter, question, learningCount, target) => {
      const data = getSessionData();

      // 저장된 데이터 구조에 맞춰서 저장
      // chapterId를 키로 사용하고, method를 하위 키로 사용
      if (!data.sessions[chapterId]) data.sessions[chapterId] = {};
      data.sessions[chapterId][method] = {
        chapterId,
        target, // 'consonant', 'vowel', 'letter', 'word' 중 하나
        method,
        index,
        question,
        learningCount,
        letter,
        updatedAt: new Date().toISOString(),
      };

      console.log("Saving progress:", {
        chapterId,
        target,
        method,
        index,
        letter,
        question,
        learningCount,
        sessions: data.sessions,
      });

      saveToStorage(data);
    },
    [saveToStorage]
  );

  const loadStats = useCallback(() => {
    const data = getSessionData();
    return data.stats;
  }, []);

  const saveStats = useCallback(
    (stats) => {
      const data = getSessionData();
      data.stats = stats;
      saveToStorage(data);
    },
    [saveToStorage]
  );

  const hasSavedProgress = useCallback(() => {
    const data = getSessionData();
    const sessions = data.sessions || {};
    return Object.keys(sessions).length > 0;
  }, []);

  const getAllProgress = useCallback(() => {
    const data = getSessionData();
    const sessions = data.sessions || {};
    const result = [];

    Object.entries(sessions).forEach(([chapterId, methods]) => {
      Object.entries(methods).forEach(([method, session]) => {
        result.push({
          character: data.character,
          chapterId,
          target: session.target, // 'consonant', 'vowel', 'letter', 'word' 중 하나
          method,
          index: session.index,
          question: session.question,
          learningCount: session.learningCount,
          updatedAt: session.updatedAt,
          letter: session.letter,
        });
      });
    });

    const sorted = result.length
      ? result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      : [];
    return sorted;
  }, []);

  const getDefaultProgress = useCallback(() => {
    const data = getAllProgress();
    if (data.length) return data[0];
    return null;
  }, []);

  const clearSessionFor = useCallback(
    (chapterId, method) => {
      const data = getSessionData();
      if (data.sessions?.[chapterId]?.[method]) {
        delete data.sessions[chapterId][method];

        // chapterId 객체가 비면 통째로 삭제
        if (Object.keys(data.sessions[chapterId]).length === 0) {
          delete data.sessions[chapterId];
        }
        saveToStorage(data);
      }
    },
    [saveToStorage]
  );

  return {
    loadProgress,
    saveProgress,
    loadStats,
    saveStats,
    hasSavedProgress,
    getAllProgress,
    getDefaultProgress,
    clearSessionFor,
  };
};
