import { get } from "@/api";
import { useQuery } from "@tanstack/react-query";

const useContentQuery = (characterId, chapterId, method) => {
  const { data, error, isPending, refetch } = useQuery({
    queryKey: ["learning", "content", characterId, chapterId, method],
    queryFn: async () => {
      const result = await get(`content`, { characterId, chapterId, method });
      return result;
    },
    select: (response) => {
      if (
        response &&
        "result" in response &&
        response.result &&
        response.data
      ) {
        // "index" : 0, "level" : 0, "repeat" : 3, "target" : "vowel", "difficulty" : "1", "contents"
        return response.data;
      } else {
        return [];
      }
    },
    enabled: !!(characterId && chapterId && method), // target이 있을 때만 쿼리를 실행합니다.
    refetchOnMount: true, // 컴포넌트가 마운트될 때마다 refetch
    staleTime: 0, // 데이터를 항상 stale로 간주하여 refetch 허용
    // initialData: {
    //   target: "vowel",
    //   contents: [],
    // },
  });
  return {
    data,
    isPending,
    isError: error,
    refetch,
  };
};

export default useContentQuery;
