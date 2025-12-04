import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";

const useStudentManageQuery = ({ teacherId }) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["student", "management", teacherId],
    queryFn: async () => {
      const result = await get("analytics/learning", { teacherId });
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
      return { characters: [], total: 0, overallStats: null };
    },
    enabled: !!teacherId, // groupId가 null이어도 전체 캐릭터 조회 허용
    refetchOnMount: true, // 컴포넌트가 마운트될 때마다 refetch
    staleTime: 0, // 데이터를 항상 stale로 간주하여 refetch 허용
  });
  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

export default useStudentManageQuery;
