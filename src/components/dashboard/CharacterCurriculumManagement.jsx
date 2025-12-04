import {
  ArrowLeft,
  X,
  BookOpen,
  Calendar,
  GripVertical,
  Mic,
  PenTool,
  Plus,
  Users,
  Volume2,
  Eye,
  SaveAll,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Badge } from "../ui/badge";
import { useDraggableInPortal } from "@/hook/useDraggableInPortal";
import { useNavigation } from "@/context/NavigationContext";
import { useEffect, useRef, useState } from "react";
import reorder from "@/utils/reorder";
import { del, put } from "@/api";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Label } from "../ui/label";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { METHODS, TARGETS } from "@/utils/globals";
import useCharacterQuery from "@/hook/useCharacterQuery";

const ACTIVITY_ICONS = {
  read: Eye,
  listen: Volume2,
  speak: Mic,
  write: PenTool,
};
const CharacterCurriculumManagement = () => {
  const { current, groupsById, go, breadcrumb } = useNavigation();
  const groupId = current?.groupId || "";
  const characterId = current?.characterId || "";
  const currentGroup = groupsById[groupId]?.name || "";

  const {
    data: selectedCharacter,
    error,
    isPending,
  } = useCharacterQuery({ characterId });
  const {
    mutate: upsertCurriculum,
    isPending: isSaving,
    isError: saveError,
  } = useMutation({
    mutationKey: [
      "learning",
      "groups",
      "character",
      "curriculum",
      selectedCharacter?.curriculum?.length ? "update" : "add",
      characterId,
    ],
    mutationFn: async (data) => {
      const res = await put(
        `character/${characterId}/curriculum/configs`,
        data
      );
      if (res?.error) throw Error(res.error);
      return res.result;
    },
    onSettled: (data, error) => {
      console.log("upsert onSettled", data, error);
    },
  });
  const { mutate: deleteCurriculum } = useMutation({
    mutationKey: [
      "learning",
      "groups",
      "character",
      "curriculum",
      "delete",
      characterId,
    ],
    mutationFn: async (id) => {
      const res = await del(`curriculum/${id}`);
      if (res?.error) throw Error(res.error);
      return res.result;
    },
    onSettled: (data, error) => {
      console.log("delete onSettled", data, error);
    },
  });
  const renderInPortal = useDraggableInPortal();
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [chapterConfigs, setChapterConfigs] = useState({});
  const saveTimer = useRef(null);

  useEffect(
    () => () => saveTimer.current && clearTimeout(saveTimer.current),
    []
  );

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // 같은 영역 내 정렬
    if (
      source.droppableId === "selected" &&
      source.droppableId === destination.droppableId
    ) {
      setSelectedOrder((prev) =>
        reorder(prev, source.index, destination.index)
      );
      return;
    }
  };

  const buildPayload = (nextConfigs) => {
    Object.entries(nextConfigs).forEach(([id, config]) => {
      const index = selectedOrder.findIndex((item) => item.id === id);
      if (index > -1) config.index = index;
    });
    return nextConfigs;
  };

  const handleSave = () => {
    upsertCurriculum(buildPayload(chapterConfigs));
  };

  const handleAddNewChapter = (event) => {
    // 이벤트 전파 방지
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const id = `chapter-${Date.now()}`;

    // 새로운 빈 챕터 생성
    const newChapter = {
      id,
      characterId,
      level: 0,
      method: Object.keys(METHODS),
      repeat: 3,
      target: "vowel",
      name: "새 챕터",
    };

    // 하단 커리큘럼에 바로 추가
    setSelectedOrder((prev) => [...prev, newChapter]);
  };

  const onRemove = (id) => {
    if (!selectedOrder) return;

    const removeIndex = selectedOrder.findIndex((item) => item.id === id);
    if (removeIndex < 0) return;

    const newSelectedOrder = [...selectedOrder];
    newSelectedOrder.splice(removeIndex, 1);
    setSelectedOrder(newSelectedOrder);
    if (id.indexOf("chapter") < 0) {
      deleteCurriculum(id);
    }
  };

  const getChapterConfig = (chapterId) => {
    if (chapterConfigs && chapterConfigs[chapterId])
      return chapterConfigs[chapterId];
    return {
      target: "vowel",
      method: Object.keys(METHODS),
      repeat: 3,
      level: 0,
    };
  };

  const updateChapterConfig = (chapterId, config) => {
    setSelectedOrder((prev) =>
      prev.map((item) =>
        item.id === chapterId
          ? {
              ...item,
              ...config,
              level: config?.target === "word" ? 0 : config?.level || 0,
            }
          : item
      )
    );
  };

  const handleBackToCharacterList = () => {
    go(`/manage/groups/${groupId}`, breadcrumb.slice(0, breadcrumb.length - 1));
  };

  useEffect(() => {
    if (selectedCharacter && selectedCharacter?.curriculum) {
      const curriculum = selectedCharacter?.curriculum || [];
      setSelectedOrder(
        curriculum.map(({ chapterId, ...rest }) => ({
          id: chapterId,
          ...rest,
        }))
      );
    }
  }, [selectedCharacter]);

  useEffect(() => {
    const newConfigs = selectedOrder.reduce((ac, cu, index) => {
      const { id, level, method, repeat, target } = cu;
      return { ...ac, [id]: { index, level, method, repeat, target } };
    }, {});
    setChapterConfigs(newConfigs);
  }, [selectedOrder]);

  return (
    <>
      {selectedCharacter && !isPending && !error && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToCharacterList}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                캐릭터 목록으로
              </Button>
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCharacter?.nickname} - 커리큘럼 관리
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {selectedCharacter?.nickname} 캐릭터의 학습 커리큘럼을
                  관리합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 캐릭터 정보 카드 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <p className="mr-2 text-6xl rounded-full">
                  {selectedCharacter.icon && !isNaN(selectedCharacter.icon)
                    ? String.fromCodePoint(selectedCharacter.icon)
                    : "👤"}
                </p>
                <div>
                  <CardTitle>{selectedCharacter?.nickname}</CardTitle>
                  <p className="mt-1 text-muted-foreground">
                    {selectedCharacter?.memo} 캐릭터
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{currentGroup}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{selectedOrder?.length || 0}개 챕터</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        등록일:{" "}
                        {dayjs(selectedCharacter?.createdAt).format("LLL")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        수정일:{" "}
                        {dayjs(selectedCharacter?.updatedAt).format("LLL")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* 배정된 챕터 목록 */}
          {/* 현재 커리큘럼 */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">현재 커리큘럼</h3>
                  <Badge variant="secondary" className="text-xs">
                    {selectedOrder?.length || 0}개
                  </Badge>
                  {isSaving && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (저장중…)
                    </span>
                  )}
                  {saveError && (
                    <span className="ml-2 text-sm text-destructive">
                      (저장 실패)
                    </span>
                  )}
                </div>
                <div className="inline-flex gap-2">
                  <Button
                    onClick={(e) => handleAddNewChapter(e)}
                    className="gap-2 mb-2"
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </Button>
                  <Button onClick={handleSave} className="gap-2 mb-2">
                    <SaveAll className="w-4 h-4" />
                    저장
                  </Button>
                </div>
              </div>
              <Droppable
                droppableId="selected"
                type="CARD"
                direction="horizontal"
              >
                {(dropProvided, dropSnapshot) => (
                  <div
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    className={`flex gap-3 min-h-32 p-4 border rounded-lg transition-colors overflow-auto ${
                      dropSnapshot.isDraggingOver
                        ? "bg-primary/5 border-primary"
                        : "bg-background"
                    }`}
                  >
                    {(!selectedOrder || selectedOrder.length === 0) && (
                      <div className="flex items-center justify-center w-full text-muted-foreground">
                        위의 챕터를 드래그하여 커리큘럼에 추가하세요.
                      </div>
                    )}
                    {selectedOrder?.map((curriculumChapter, index) => (
                      <Draggable
                        key={curriculumChapter.id}
                        draggableId={curriculumChapter.id}
                        index={index}
                      >
                        {renderInPortal((dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`${
                              dragSnapshot.isDragging
                                ? "opacity-70 rotate-3 scale-105"
                                : ""
                            }`}
                          >
                            <Card className="relative w-64 transition-shadow cursor-grab hover:shadow-md">
                              <CardHeader className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge
                                        variant="outline"
                                        className="font-mono text-xs"
                                      >
                                        # {index + 1}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemove(curriculumChapter.id);
                                    }}
                                    className="w-6 h-6 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>

                                {/* 학습 설정 영역 */}
                                <div className="pt-2 space-y-2">
                                  <div>
                                    <Label className="text-xs font-bold">
                                      학습 대상
                                    </Label>
                                    <ToggleGroup
                                      type="single"
                                      value={
                                        getChapterConfig(curriculumChapter.id)
                                          .target
                                      }
                                      onValueChange={(value) =>
                                        updateChapterConfig(
                                          curriculumChapter.id,
                                          {
                                            target: value,
                                          }
                                        )
                                      }
                                      className="justify-start p-1 rounded-md bg-slate-100"
                                    >
                                      {Object.entries(TARGETS).map(
                                        ([key, value]) => (
                                          <ToggleGroupItem
                                            key={key}
                                            value={key}
                                            size="sm"
                                            className="px-2 py-1 h-8 flex-1 gap-1 flex flex-col text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                          >
                                            <span>{value}</span>
                                          </ToggleGroupItem>
                                        )
                                      )}
                                    </ToggleGroup>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-bold">
                                      학습 유형
                                    </Label>
                                    <ToggleGroup
                                      type="multiple"
                                      value={
                                        getChapterConfig(curriculumChapter.id)
                                          .method
                                      }
                                      onValueChange={(value) =>
                                        updateChapterConfig(
                                          curriculumChapter.id,
                                          {
                                            method: value.sort(
                                              (a, b) =>
                                                Object.keys(METHODS).indexOf(
                                                  a
                                                ) -
                                                Object.keys(METHODS).indexOf(b)
                                            ),
                                          }
                                        )
                                      }
                                      className="justify-start p-1 rounded-md bg-slate-100"
                                    >
                                      {Object.entries(METHODS).map(
                                        ([key, value]) => {
                                          const Icon = ACTIVITY_ICONS[key];
                                          return (
                                            <ToggleGroupItem
                                              key={key}
                                              value={key}
                                              size="sm"
                                              className="px-2 py-1 h-12 flex-1 gap-1 flex flex-col text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                            >
                                              <Icon className="w-3 h-3" />
                                              <span>{value}</span>
                                            </ToggleGroupItem>
                                          );
                                        }
                                      )}
                                    </ToggleGroup>
                                  </div>

                                  {/* 반복 횟수 */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1 space-y-2">
                                      <Label className="text-xs font-bold">
                                        반복 횟수
                                      </Label>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={
                                          getChapterConfig(curriculumChapter.id)
                                            .repeat
                                        }
                                        onChange={(e) =>
                                          updateChapterConfig(
                                            curriculumChapter.id,
                                            {
                                              repeat:
                                                parseInt(e.target.value) || 3,
                                            }
                                          )
                                        }
                                        className="w-full h-8 text-xs"
                                      />
                                    </div>
                                    {chapterConfigs[
                                      curriculumChapter.id
                                    ]?.target?.includes("word") && (
                                      <div className="col-span-1 space-y-2">
                                        <Label className="text-xs font-bold">
                                          낱말 난이도
                                        </Label>
                                        <Select
                                          className="w-full h-8 text-xs"
                                          defaultValue={
                                            getChapterConfig(
                                              curriculumChapter.id
                                            )?.level || 0
                                          }
                                          onValueChange={(value) =>
                                            updateChapterConfig(
                                              curriculumChapter.id,
                                              { level: value }
                                            )
                                          }
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value={0}>
                                              쉬움
                                            </SelectItem>
                                            <SelectItem value={1}>
                                              보통
                                            </SelectItem>
                                            <SelectItem value={2}>
                                              어려움
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </Card>
                          </div>
                        ))}
                      </Draggable>
                    ))}
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </div>
      )}
    </>
  );
};

export default CharacterCurriculumManagement;
