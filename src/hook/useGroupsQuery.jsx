import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";

const useGroupsQuery = ({ page: p, q, teacherId }) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["learning", "groups", p],
    queryFn: async () => {
      const page = p || 1;
      const result = await get("groups", { teacherId, page, q: q || "" });
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        const list = response.data.items.map(({ status, ...rest }) => ({
          ...rest,
          status: status ? "활성" : "비활성",
        }));
        return { groups: list, total: response.data.total };
      }
    },
    enabled: !!teacherId,
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

export default useGroupsQuery;
