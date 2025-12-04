import { useQuery } from "@tanstack/react-query";
import { get } from "@/api";

const useCurriculumQuery = (characterId) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["character", "curriculum", characterId],
    queryFn: async () => {
      const result = await get(`character/${characterId}/curriculum`);
      return result;
    },
    select: (response) => {
      if (response && response.data) {
        return response.data;
      }
      return [];
    },
    enabled: !!characterId,
    refetchOnMount: true, // 컴포넌트가 마운트될 때마다 refetch
    staleTime: 0, // 데이터를 항상 stale로 간주하여 refetch 허용
  });

  return {
    curriculumData: data,
    isCurriculumLoading: isPending,
    isCurriculumError: error,
    refetchCurriculum: refetch,
  };
};

export default useCurriculumQuery;
