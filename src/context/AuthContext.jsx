/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
// src/context/AuthContext.jsx
import { useLocalStorage } from "@/hook/useLocalStorage";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children, user: userData }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [token, setToken] = useLocalStorage("token", null);
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialized = useRef(false);
  const hasLoggedOut = useRef(false);

  const isSeniorMode = () => {
    console.log("location.pathname = ", location.pathname);
    return location.pathname === "/senior" ? true : false;
  };

  const login = async ({ token: t, ...data }) => {
    console.log("로그인 처리:", {
      role: data.role,
      characterId: data.characterId,
    });
    setUser({ ...data });
    setToken(t);
    isInitialized.current = true;
    hasLoggedOut.current = false;
    const { role } = data;
    if (role === "student") {
      // NOTE: 시니어 모드 분기
      const targetPath = isSeniorMode()
        ? `/senior/learn/${data.characterId}`
        : `/learn/${data.characterId}`;
      console.log("학생 로그인 리다이렉트:", targetPath);
      navigate(targetPath);
    } else {
      console.log("교사 로그인 리다이렉트: /manage");
      navigate("/manage");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    isInitialized.current = false;
    hasLoggedOut.current = true;

    // 학습 세션 데이터만 정리
    localStorage.removeItem("hangul_learning_session");
    navigate("/", { replace: true });
  };

  const getRole = () => user?.role || null;
  const getId = () => user?._id || null;
  const getUserId = () => user?.userId || null;
  const getName = () => user?.name || null;
  const publicPaths = [
    "/",
    "/login",
    "/login/student",
    "/login/teacher",
    "/senior",
  ];

  // 1. 서버에서 받은 사용자 데이터로 초기화
  useEffect(() => {
    if (!userData || isInitialized.current || hasLoggedOut.current) {
      return;
    }

    const { token: newToken, ...rest } = userData;

    if (newToken && rest.role) {
      setToken(newToken);
      setUser(rest);
      isInitialized.current = true;

      // 로그인 페이지나 홈페이지에 있다면 적절한 페이지로 리다이렉트
      const currentPath = location.pathname;
      if (
        ["/", "/login", "/login/student", "/login/teacher"].includes(
          currentPath
        )
      ) {
        const targetPath =
          rest.role === "student" ? `/learn/${rest.characterId}` : "/manage";
        console.log("초기화 후 리다이렉트:", {
          from: currentPath,
          to: targetPath,
        });
        navigate(targetPath, { replace: true });
      }
    }
  }, [userData, navigate, setToken, setUser]);

  // 2. 로그인된 사용자가 로그인 페이지나 홈페이지에 접근하는 것을 방지
  useEffect(() => {
    if (!user) {
      return;
    }

    const currentPath = location.pathname;

    if (publicPaths.includes(currentPath)) {
      console.log("로그인된 사용자가 공개 페이지 접근, 리다이렉트:", {
        role: user.role,
        currentPath,
      });
      // NOTE: 시니어 모드 분기
      const targetPath = isSeniorMode()
        ? `/senior/learn/${user.characterId}`
        : user.role === "student"
        ? `/learn/${user.characterId}`
        : "/manage";

      navigate(targetPath, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // 3. 서버에서 사용자 데이터가 null이고 로컬에 사용자 데이터가 있는 경우 (토큰 만료 등)
  useEffect(() => {
    const currentPath = location.pathname;

    if (
      !publicPaths.includes(currentPath) &&
      userData === null &&
      !isInitialized.current
    ) {
      console.log("서버에서 사용자 데이터가 null, 로그아웃 처리");
      setUser(null);
      setToken(null);
      navigate("/", { replace: true });
    }
  }, [userData, user, navigate, setUser, setToken]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      getRole,
      getId,
      getName,
      getUserId,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
