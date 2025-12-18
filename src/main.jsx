// src/main.jsx
import "./styles/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
} from "react-router-dom";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import LearnLayout from "./layouts/LearnLayout";
import ProgressLayout from "./layouts/ProgressLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import LoginPage from "./pages/Login";
import Main from "./pages/dashboard";
import NotFound from "./pages/NotFound";
import Character from "./pages/Character";
import Target from "./pages/Target";
import Method from "./pages/Method";
import Learn from "./pages/Learn";

// Components
import { Dashboard } from "./components/dashboard/Dashboard";
import { LegacyDashboard } from "./components/dashboard/LegacyDashboard";
import { GroupManagement } from "./components/dashboard/GroupManagement";
import { StudentManagement } from "./components/dashboard/StudentManagement";
import { CharacterManagement } from "./components/dashboard/CharacterManagement";
import { LegacyStudentManagement } from "./components/dashboard/LegacyStudentManagement";
import CharacterCurriculumManagement from "./components/dashboard/CharacterCurriculumManagement";

// ETC
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import objectSupport from "dayjs/plugin/objectSupport";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ko";
import QueryProvider from "./providers/QueryProvider";
import { getUserData } from "./api";
import SeniorLayout from "./layouts/SeniorLayout";
import SeniorCharacter from "./pages/SeniorCharacter";
import SeniorTarget from "./pages/SeniorTarget";
import SeniorMethod from "./pages/SeniorMethod";
import SeniorLearn from "./pages/SeniorLearn";

dayjs.locale("ko");
dayjs.extend(objectSupport);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

async function loader() {
  let user = await getUserData();
  return { user };
}

// NOTE: 이전 경로를 통해 Senior 구분 로더
async function rootLoader() {
  const seniorDomain = import.meta.env.VITE_SENIOR_DOMAIN;
  const prevDomain = document.referrer;
  if (seniorDomain.trim() === prevDomain.trim()) {
    sessionStorage.setItem("isSeniorMode", true);
    return redirect("/senior");
  }
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthLayout />} loader={loader} errorElement={<NotFound />}>
      {/* 공개 페이지 */}
      <Route path="/" element={<Main />} loader={rootLoader} />
      <Route path="/login/teacher" element={<LoginPage target="teacher" />} />
      <Route path="/login/student" element={<LoginPage target="student" />} />

      {/* 교사 전용: /manage */}
      <Route path="manage" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="groups" element={<GroupManagement />} />
        <Route path="groups/:groupId" element={<CharacterManagement />} />
        <Route
          path="groups/:groupId/:characterId"
          element={<CharacterCurriculumManagement />}
        />
        <Route path="students" element={<StudentManagement />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="legacy" element={<LegacyDashboard />} />
      <Route path="legacy/students" element={<LegacyStudentManagement />} />

      {/* 학생 전용: /learn */}
      <Route path="learn" element={<LearnLayout />}>
        <Route index element={<Character />} />
        <Route path=":character" element={<ProgressLayout />}>
          <Route index element={<Target />} />
          <Route path=":chapter" element={<Method />} />
          <Route path=":chapter/:method" element={<Learn />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 시니어 전용: /senior */}
      <Route path="senior" element={<SeniorLayout />}>
        <Route index element={<SeniorCharacter />} />
        <Route path="/senior/learn/:character" element={<ProgressLayout />}>
          <Route index element={<SeniorTarget />} />
          <Route path=":chapter" element={<SeniorMethod />} />
          <Route path=":chapter/:method" element={<SeniorLearn />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      {/* 공통 에러/기타 */}
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </React.StrictMode>
);
