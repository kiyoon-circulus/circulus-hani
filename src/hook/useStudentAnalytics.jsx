import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";

// 학생별 상세 학습 분석 데이터를 가져오는 훅
const useStudentAnalytics = (characterId, dateRange = {}) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["analytics", "student", characterId, dateRange],
    queryFn: async () => {
      const params = {
        characterId,
        ...dateRange,
      };
      const result = await get("analytics/student", params);
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        return response.data;
      }
      return null;
    },
    enabled: !!characterId,
    refetchOnMount: true,
    staleTime: 0,
  });

  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

// 전체 학습 통계 데이터를 가져오는 훅
const useLearningOverview = (teacherId, dateRange = {}) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["analytics", "overview", teacherId, dateRange],
    queryFn: async () => {
      const params = {
        teacherId,
        ...dateRange,
      };
      const result = await get("analytics/overview", params);
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        // API 응답 데이터를 그대로 반환 (Dashboard에서 transformOverview 사용)
        return response.data;
      }
      return null;
    },
    enabled: !!teacherId,
    refetchOnMount: true,
    staleTime: 0,
  });

  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

// 학생별 세션 데이터를 가져오는 훅
const useStudentSessions = (characterId, dateRange = {}) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["analytics", "sessions", characterId, dateRange],
    queryFn: async () => {
      const params = {
        characterId,
        ...dateRange,
      };
      const result = await get("analytics/sessions", params);
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        return response.data;
      }
      return null;
    },
    enabled: !!characterId,
    refetchOnMount: true,
    staleTime: 0,
  });

  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

// 학생별 시도 데이터를 가져오는 훅
const useStudentAttempts = (characterId, dateRange = {}) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["analytics", "attempts", characterId, dateRange],
    queryFn: async () => {
      const params = {
        characterId,
        ...dateRange,
      };
      const result = await get("analytics/attempts", params);
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        return response.data;
      }
      return null;
    },
    enabled: !!characterId,
    refetchOnMount: true,
    staleTime: 0,
  });

  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

export {
  useStudentAnalytics,
  useLearningOverview,
  useStudentSessions,
  useStudentAttempts,
};
