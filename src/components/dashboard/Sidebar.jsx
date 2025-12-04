// src/components/dashboard/Sidebar.jsx
import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useNavigation } from "@/context/NavigationContext";

export function Sidebar() {
  const {
    breadcrumb,
    go,
    groupsById,
    charactersByGroup,
    current, // ✅ 여기서 현재 컨텍스트 사용
  } = useNavigation();
  // 활성 섹션: current.section 을 그대로 사용
  const section = current.section || "dashboard";

  // 상단 컨텍스트 카드: current.* 를 바로 사용
  const contextInfo = current.status
    ? {
        title: current.title,
        subtitle: current.subtitle,
        status: current.status, // "editing" | "managing" | "viewing"
      }
    : null;

  const [groupPanelOpen, setGroupPanelOpen] = useState(true);

  const menuItems = [
    {
      id: "dashboard",
      label: "홈",
      icon: Home,
      desc: "전체 현황 보기",
      to: "/manage",
    },
    {
      id: "groups",
      label: "그룹 관리",
      icon: Users,
      desc: "학습 그룹 및 캐릭터 관리",
      to: "/manage/groups",
    },
    {
      id: "students",
      label: "학습 현황",
      icon: GraduationCap,
      desc: "학생 진도 및 성과 확인",
      to: "/manage/students",
    },
  ];

  // 그룹 퀵 링크: current.groupId / current.characterId 기준
  /* const groupQuickLinks = useMemo(() => {
    if (!current.groupId) return [];
    const items = [{ key: "overview", label: "그룹 개요", icon: Users, to: `/manage/groups/${current.groupId}` }];
    if (current.characterId) {
      items.push(
        { key: "character", label: "캐릭터", icon: Layers, to: `/manage/groups/${current.groupId}/characters/${current.characterId}` },
        { key: "curriculum", label: "커리큘럼", icon: BookOpen, to: `/manage/groups/${current.groupId}/characters/${current.characterId}/curriculum` }
      );
    }
    return items;
  }, [current.groupId, current.characterId]); */

  const inGroupDetail = Boolean(current.groupId);
  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* 상단 컨텍스트 카드 */}
        {contextInfo && (
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-sidebar-accent border-sidebar-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sidebar-foreground">
                  {contextInfo.title}
                </h3>
                <Badge
                  variant={
                    contextInfo.status === "editing" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {contextInfo.status === "editing"
                    ? "편집중"
                    : contextInfo.status === "managing"
                    ? "관리중"
                    : "보기"}
                </Badge>
              </div>
              <p className="text-sm text-sidebar-foreground/70">
                {contextInfo.subtitle}
              </p>
            </div>

            {/* 브레드크럼 (NavigationContext의 breadcrumb 그대로) */}
            {breadcrumb.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 text-sm text-sidebar-foreground/70">
                {breadcrumb.map((item, idx) => (
                  <div key={item.id} className="inline-flex items-center gap-1">
                    <button
                      className={`px-0 hover:text-primary transition-colors ${
                        idx === breadcrumb.length - 1
                          ? "text-sidebar-primary font-semibold"
                          : "font-light"
                      }`}
                      onClick={() =>
                        go(
                          // crumb → path 변환
                          item.section === "dashboard"
                            ? "/manage"
                            : item.section === "students"
                            ? "/manage/students"
                            : item.curriculumEditing &&
                              item.groupId &&
                              item.characterId
                            ? `/manage/groups/${item.groupId}/characters/${item.characterId}/curriculum`
                            : item.characterId && item.groupId
                            ? `/manage/groups/${item.groupId}/characters/${item.characterId}`
                            : item.groupId
                            ? `/manage/groups/${item.groupId}`
                            : "/manage/groups",
                          breadcrumb.slice(0, idx + 1)
                        )
                      }
                    >
                      {item.label}
                    </button>
                    {idx < breadcrumb.length - 1 && (
                      <ChevronRight className="inline-block -mt-0.5 w-3 h-3 opacity-60" />
                    )}
                  </div>
                ))}
              </div>
            )}

            <Separator />
          </div>
        )}

        {/* 메인 메뉴 */}
        <div className="space-y-1">
          <h3 className="px-2 mb-3 text-xs font-medium tracking-wider uppercase text-sidebar-foreground/50">
            메뉴
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-auto py-3 px-3 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() =>
                    go(
                      item.to,
                      item.id === "dashboard"
                        ? [
                            {
                              id: "dashboard",
                              label: "홈",
                              section: "dashboard",
                            },
                          ]
                        : item.id === "groups"
                        ? [
                            {
                              id: "dashboard",
                              label: "홈",
                              section: "dashboard",
                            },
                            {
                              id: "groups",
                              label: "그룹 관리",
                              section: "groups",
                            },
                          ]
                        : [
                            {
                              id: "dashboard",
                              label: "홈",
                              section: "dashboard",
                            },
                            {
                              id: "students",
                              label: "학습 현황",
                              section: "students",
                            },
                          ]
                    )
                  }
                >
                  <Icon className="flex-shrink-0 w-4 h-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{item.label}</div>
                    <div
                      className={`text-xs ${
                        isActive
                          ? "text-sidebar-primary-foreground/80"
                          : "text-sidebar-foreground/60"
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* 이 그룹 바로가기 (current 기반) */}
        {inGroupDetail && (
          <div className="space-y-2">
            <Separator />
            <button
              className="flex items-center justify-between w-full px-2 py-2 text-xs font-medium tracking-wider uppercase rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70"
              onClick={() => setGroupPanelOpen((v) => !v)}
            >
              <span>이 그룹 바로가기</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  groupPanelOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>

            {groupPanelOpen && (
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full h-8 gap-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() =>
                    go(`/manage/groups/${current.groupId}`, [
                      { id: "dashboard", label: "홈", section: "dashboard" },
                      { id: "groups", label: "그룹 관리", section: "groups" },
                      {
                        id: `group-${current.groupId}`,
                        label:
                          groupsById[current.groupId]?.name ??
                          `그룹 ${current.groupId}`,
                        section: "groups",
                        groupId: current.groupId,
                      },
                    ])
                  }
                >
                  <Users className="w-3 h-3" />
                  그룹 개요
                </Button>

                {current.characterId && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start w-full h-8 gap-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      onClick={() =>
                        go(
                          `/manage/groups/${current.groupId}/characters/${current.characterId}`,
                          [
                            {
                              id: "dashboard",
                              label: "홈",
                              section: "dashboard",
                            },
                            {
                              id: "groups",
                              label: "그룹 관리",
                              section: "groups",
                            },
                            {
                              id: `group-${current.groupId}`,
                              label:
                                groupsById[current.groupId]?.name ??
                                `그룹 ${current.groupId}`,
                              section: "groups",
                              groupId: current.groupId,
                            },
                            {
                              id: `char-${current.characterId}`,
                              label:
                                charactersByGroup[current.groupId]?.[
                                  current.characterId
                                ]?.name ?? `캐릭터 ${current.characterId}`,
                              section: "groups",
                              groupId: current.groupId,
                              characterId: current.characterId,
                            },
                          ]
                        )
                      }
                    >
                      <Layers className="w-3 h-3" />
                      캐릭터
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start w-full h-8 gap-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      onClick={() =>
                        go(
                          `/manage/groups/${current.groupId}/characters/${current.characterId}/curriculum`,
                          [
                            {
                              id: "dashboard",
                              label: "홈",
                              section: "dashboard",
                            },
                            {
                              id: "groups",
                              label: "그룹 관리",
                              section: "groups",
                            },
                            {
                              id: `group-${current.groupId}`,
                              label:
                                groupsById[current.groupId]?.name ??
                                `그룹 ${current.groupId}`,
                              section: "groups",
                              groupId: current.groupId,
                            },
                            {
                              id: `char-${current.characterId}`,
                              label:
                                charactersByGroup[current.groupId]?.[
                                  current.characterId
                                ]?.name ?? `캐릭터 ${current.characterId}`,
                              section: "groups",
                              groupId: current.groupId,
                              characterId: current.characterId,
                              curriculumEditing: true,
                            },
                          ]
                        )
                      }
                    >
                      <BookOpen className="w-3 h-3" />
                      커리큘럼
                    </Button>
                  </>
                )}

                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start w-full h-8 gap-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() =>
                      go("/manage/groups", [
                        { id: "dashboard", label: "홈", section: "dashboard" },
                        { id: "groups", label: "그룹 관리", section: "groups" },
                      ])
                    }
                  >
                    <Layers className="w-3 h-3" />
                    전체 그룹 목록
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
