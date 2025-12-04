import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";

const useCharacterQuery = ({ characterId }) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["learning", "groups", "character", "curriculum", characterId],
    queryFn: async () => {
      const result = await get(`character/${characterId}`);
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
    },
    enabled: !!characterId,
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

export { useCharacterQuery };
export default useCharacterQuery;
