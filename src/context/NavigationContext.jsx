/* eslint-disable react-refresh/only-export-components */
// src/context/NavigationContext.jsx
import { get } from "@/api";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NavigationContext = createContext(null);

// 경로 → 섹션 (동기)
function sectionFromPathname(p) {
  if (p.startsWith("/manage/students")) return "students";
  if (p.startsWith("/manage/groups")) return "groups";
  return "dashboard";
}

export function NavigationProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 이름/라벨 보강 완료 여부
  const [currentReady, setCurrentReady] = useState(false);
  // 전역 breadcrumb
  const [breadcrumb, setBreadcrumb] = useState([
    { id: "dashboard", label: "홈", section: "dashboard" },
  ]);
  const activeSection = useMemo(
    () => sectionFromPathname(location.pathname),
    [location.pathname]
  );

  // 🔹 캐시는 ref로 관리(의존성 변화를 막기 위함)
  const groupsRef = useRef({}); // { [groupId]: group }
  const charsRef = useRef({}); // { [groupId]: { [charId]: character } }

  // 🔹 렌더에 쓰는 읽기 전용 미러(선택적): 캐시 업데이트 시 화면만 갱신
  const [groupsSnap, setGroupsSnap] = useState({});
  const [charsSnap, setCharsSnap] = useState({});

  // 🔹 takeLatest 토큰
  const inflight = useRef({ group: {}, char: {} });

  // ✅ API 유틸
  const getGroup = useCallback(async (groupId, { signal } = {}) => {
    const hit = groupsRef.current[groupId];
    if (hit) return hit;

    const token = Symbol(groupId);
    inflight.current.group[groupId] = token;
    const data = await get(`group/${groupId}`, null, {}, signal);

    if (data?.result) {
      // 최신 요청만 반영
      if (inflight.current.group[groupId] !== token) {
        return groupsRef.current[groupId] ?? null;
      }

      groupsRef.current[groupId] = data.data;
      // 미러 갱신(렌더 반영용)
      setGroupsSnap((prev) => ({ ...prev, [groupId]: data.data }));
      return data.data;
    }
  }, []); // ❗️의존성 없음

  const getCharacter = useCallback(
    async (groupId, characterId, { signal } = {}) => {
      const bucket = charsRef.current[groupId] || {};
      const hit = bucket[characterId];
      if (hit) return hit;

      const tokenKey = `${groupId}:${characterId}`;
      const token = Symbol(tokenKey);
      inflight.current.char[tokenKey] = token;
      // 엔드포인트는 실제 백엔드 규칙에 맞게 조정하세요
      if (characterId) {
        const data = await get(`character/${characterId}`, null, {}, signal);

        if (inflight.current.char[tokenKey] !== token) {
          return (charsRef.current[groupId] || {})[characterId] ?? null;
        }

        if (data?.result) {
          // 캐시 저장
          const nextGroupChars = {
            ...(charsRef.current[groupId] || {}),
            [characterId]: data.data,
          };
          charsRef.current[groupId] = nextGroupChars;
          setCharsSnap((prev) => ({ ...prev, [groupId]: nextGroupChars }));
          return data.data;
        }
      }
    },
    []
  ); // ❗️의존성 없음

  // ✅ 경로 → breadcrumb 동기화 (끝에 ready=true)
  useEffect(() => {
    setCurrentReady(false);
    const ctrl = new AbortController();
    const myPath = location.pathname;

    (async () => {
      const base = [{ id: "dashboard", label: "홈", section: "dashboard" }];

      if (myPath === "/manage") {
        setBreadcrumb(base);
        setCurrentReady(true);
        return;
      }
      if (myPath.startsWith("/manage/students")) {
        setBreadcrumb([
          ...base,
          { id: "students", label: "학습 현황", section: "students" },
        ]);
        setCurrentReady(true);
        return;
      }

      const m = location.pathname.match(
        /^\/manage\/groups\/([^/]+)(?:\/([^/]+))?\/?$/
      );
      if (!m) {
        setBreadcrumb(base);
        setCurrentReady(true);
        return;
      }
      const [, groupId, characterId] = m;
      const crumbs = [
        ...base,
        { id: "groups", label: "그룹 관리", section: "groups" },
      ];

      try {
        if (groupId) {
          const g = await getGroup(groupId, { signal: ctrl.signal }).catch(
            () => null
          );
          crumbs.push({
            id: `group-${groupId}`,
            label: g?.name || `그룹 ${groupId}`,
            section: "groups",
            groupId,
          });
        }
        if (characterId && groupId) {
          const c = await getCharacter(groupId, characterId, {
            signal: ctrl.signal,
          }).catch(() => null);
          // crumbs.push({
          //   id: `char-${characterId}`,
          //   label: c?.name ?? `캐릭터 ${characterId}`,
          //   section: "groups",
          //   groupId,
          //   characterId,
          // });
          crumbs.push({
            id: "curriculum",
            label: c?.nickname ?? `캐릭터 ${c?.nickname} - 커리큘럼`,
            section: "groups",
            groupId,
            characterId,
            curriculumEditing: true,
          });
        }
        // if (isCurri && groupId && characterId) {
        //   crumbs.push({
        //     id: "curriculum",
        //     label: "커리큘럼",
        //     section: "groups",
        //     groupId,
        //     characterId,
        //     curriculumEditing: true,
        //   });
        // }
      } finally {
        if (location.pathname === myPath) {
          setBreadcrumb(crumbs);
          setCurrentReady(true); // ✅ 보강 완료
        }
      }
    })();

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // 현재 화면 문맥을 계산합니다. (경로 파싱 불필요)
  const current = useMemo(() => {
    const last = breadcrumb[breadcrumb.length - 1];
    const section = activeSection ?? last?.section; //last?.section ?? activeSection;

    const rev = [...breadcrumb].reverse();
    const groupCrumb = rev.find((c) => c.groupId);
    const charCrumb = rev.find((c) => c.characterId);
    const curriCrumb = rev.find((c) => c.curriculumEditing);

    const groupId = groupCrumb?.groupId || null;
    const characterId = charCrumb?.characterId || null;
    const isCurriculum = Boolean(curriCrumb);

    const status = isCurriculum
      ? "editing"
      : characterId
      ? "managing"
      : groupId
      ? "viewing"
      : null;

    // subtitle은 캐시 데이터 유무와 무관
    return {
      section,
      groupId,
      characterId,
      isCurriculum,
      status,
      title:
        status === "editing"
          ? "커리큘럼 관리"
          : status === "managing"
          ? "캐릭터 관리"
          : status === "viewing"
          ? "그룹 상세"
          : null,
      subtitle: null, // (원하면 캐시로 보강해도 됨)
    };
  }, [breadcrumb, activeSection]);

  const value = useMemo(
    () => ({
      breadcrumb,
      setBreadcrumb,
      go: (path, bc) => {
        if (bc) setBreadcrumb(bc);
        navigate(path);
      },
      pathname: location.pathname,

      // 캐시 스냅샷(이름 라벨 등에 사용)
      groupsById: groupsSnap,
      charactersByGroup: charsSnap,

      // 로더
      getGroup,
      getCharacter,

      // 섹션/상태
      activeSection, // ⬅️ 동기 섹션
      current, // ⬅️ 비동기 보강 포함된 컨텍스트
      currentReady, // ⬅️ 보강 완료 여부
    }),
    [
      breadcrumb,
      navigate,
      location.pathname,
      groupsSnap,
      charsSnap,
      getGroup,
      getCharacter,
      activeSection,
      current,
      currentReady,
    ]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx)
    throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
