import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  X,
  GripVertical,
  BookOpen,
  Target,
  ArrowLeft,
  Plus,
  Volume2,
  Mic,
  PenTool,
} from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useDraggableInPortal } from "@/hook/useDraggableInPortal";
import reorder from "@/utils/reorder";

const CurriculumEditorWithLibrary = ({
  groupId,
  characterId,
  onNavigate,
  chapters,
  onAddChapter,
}) => {
  const renderInPortal = useDraggableInPortal();

  // Mock 캐릭터 데이터 - 실제로는 API에서 가져올 것
  const [character, setCharacter] = useState(null);
  const [chapterList, setChapterList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 챕터별 학습 설정 상태
  const [chapterConfigs, setChapterConfigs] = useState({
    learningTarget: "",
    learningTypes: [],
    repetitions: 0,
  });

  const activityIcons = {
    읽기: BookOpen,
    듣기: Volume2,
    말하기: Mic,
    쓰기: PenTool,
  };

  const learningTargets = ["모음", "자음", "글자", "낱말"];
  const activityTypes = ["읽기", "듣기", "말하기", "쓰기"];

  // Mock 캐릭터 데이터 로드
  useEffect(() => {
    // 실제로는 API 호출
    const mockCharacter = {
      id: characterId,
      name: "한글이",
      nickname: "친근한 한글이",
      curriculum: [
        { chapterId: "chapter-1", order: 0 },
        { chapterId: "chapter-2", order: 1 },
      ],
    };
    setCharacter(mockCharacter);
  }, [characterId]);

  useEffect(() => {
    if (character && chapters) {
      // 캐릭터의 커리큘럼에 포함되지 않은 챕터들만 라이브러리에 표시
      setChapterList(
        chapters.filter(
          (chapter) =>
            !character.curriculum.find(
              (curriculumItem) => curriculumItem.chapterId === chapter.id
            )
        )
      );
      // 캐릭터의 커리큘럼에 포함된 챕터들을 순서대로 표시
      const orderedChapters = character.curriculum
        .sort((a, b) => a.order - b.order)
        .map((curriculumItem) =>
          chapters.find((chapter) => chapter.id === curriculumItem.chapterId)
        )
        .filter((chapter) => chapter !== undefined);
      setSelectedOrder(orderedChapters);
    }
  }, [character, chapters]);

  const currentGroup =
    {
      1: "기초 한글반",
      2: "중급 한글반",
      3: "고급 한글반",
    }[groupId] || "전체";

  const handleBackToCharacter = () => {
    onNavigate({
      section: "groups",
      groupId: groupId,
      characterId: characterId,
      curriculumEditing: false,
      breadcrumb: [
        {
          id: "dashboard",
          label: "Dashboard",
          section: "dashboard",
        },
        {
          id: "groups",
          label: "학습 그룹 관리",
          section: "groups",
        },
        {
          id: `group-${groupId}`,
          label: currentGroup,
          section: "groups",
          groupId: groupId,
        },
        {
          id: `character-${characterId}`,
          label: character?.nickname || "캐릭터",
          section: "groups",
          groupId: groupId,
          characterId: characterId,
        },
      ],
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "쉬움":
        return "bg-green-100 text-green-800 border-green-200";
      case "보통":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "어려움":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "모음":
        return "bg-blue-100 text-blue-800";
      case "자음":
        return "bg-purple-100 text-purple-800";
      case "글자":
        return "bg-orange-100 text-orange-800";
      case "낱말":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
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

    // 상단 → 하단 (이동)
    if (
      source.droppableId === "list" &&
      destination.droppableId === "selected"
    ) {
      const chapter = chapterList.find((c) => c.id === draggableId);
      if (!chapter) return;

      const newChapterList = [...chapterList];
      const [moveItem] = newChapterList.splice(source.index, 1);
      const newSelectedOrder = [...selectedOrder];
      newSelectedOrder.splice(destination.index, 0, moveItem);

      setSelectedOrder(newSelectedOrder);
      setChapterList(newChapterList);
      return;
    }
  };

  const onRemove = (id) => {
    const removeIndex = selectedOrder.findIndex((item) => item.id === id);
    if (removeIndex < 0) return;

    const newSelectedOrder = [...selectedOrder];
    const [removeItem] = newSelectedOrder.splice(removeIndex, 1);
    const newChapterList = [removeItem, ...chapterList];

    setChapterList(newChapterList);
    setSelectedOrder(newSelectedOrder);
  };

  const updateChapterConfig = (chapterId, config) => {
    setChapterConfigs((prev) => ({
      ...prev,
      [chapterId]: {
        learningTarget: "모음",
        learningTypes: [],
        repetitions: 3,
        ...prev[chapterId],
        ...config,
      },
    }));
  };

  const getChapterConfig = (chapterId) => {
    return (
      chapterConfigs[chapterId] || {
        learningTarget: "모음",
        learningTypes: [],
        repetitions: 3,
      }
    );
  };

  const handleCreateChapter = () => {
    const newChapter = {
      id: `chapter-${Date.now()}`,
      name: "새 챕터",
      difficulty: "보통",
      description: "학습 내용을 설정해주세요.",
      learningContents: [], // 빈 배열로 시작
      createdDate: new Date().toISOString().split("T")[0],
      isPublished: true,
    };

    onAddChapter(newChapter);
    setChapterList((prev) => [...prev, newChapter]);

    setIsCreateDialogOpen(false);
  };

  const handleSaveCurriculum = () => {
    if (character) {
      // selectedOrder를 기반으로 커리큘럼 업데이트
      const updatedCurriculum = selectedOrder.map((chapter, index) => ({
        chapterId: chapter.id,
        order: index,
      }));

      const updatedCharacter = {
        ...character,
        curriculum: updatedCurriculum,
      };

      // 실제로는 API 호출로 저장
      console.log("커리큘럼 저장:", updatedCharacter);

      // 캐릭터 상세 페이지로 돌아가기
      handleBackToCharacter();
    }
  };

  if (!character) {
    return <div>로딩중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToCharacter}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            캐릭터로 돌아가기
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {character.nickname} - 커리큘럼 편집
            </h2>
            <p className="mt-1 text-muted-foreground">
              챕터를 드래그하여 커리큘럼을 구성하세요. 새로운 챕터를 생성할 수도
              있습니다.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 챕터 추가</DialogTitle>
                <DialogDescription>
                  새로운 빈 챕터를 생성합니다. 생성 후 챕터 카드에서 학습 대상,
                  학습 유형, 반복 횟수를 설정할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <div className="flex w-full gap-2">
                  <Button className="flex-1" onClick={handleCreateChapter}>
                    새 챕터 추가
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    취소
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleSaveCurriculum}>커리큘럼 저장</Button>
        </div>
      </div>

      {/* 커리큘럼 편집 영역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            커리큘럼 편집
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-8">
              {/* 챕터 라이브러리 */}
              <div>
                <div className="flex justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium">사용 가능한 챕터</h3>
                    <Badge variant="secondary" className="text-xs">
                      {chapterList.length}개
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />새 챕터 생성
                  </Button>
                </div>
                <Droppable
                  droppableId="list"
                  type="CARD"
                  direction="horizontal"
                >
                  {(dropProvided, dropSnapshot) => (
                    <div
                      ref={dropProvided.innerRef}
                      {...dropProvided.droppableProps}
                      className={`flex gap-3 min-h-32 p-4 border rounded-lg transition-colors overflow-auto ${
                        dropSnapshot.isDraggingOver
                          ? "bg-muted/50 border-primary"
                          : "bg-muted/20"
                      }`}
                    >
                      {chapterList.length === 0 && (
                        <div className="flex items-center justify-center w-full text-muted-foreground">
                          사용 가능한 챕터가 없습니다. 새 챕터를 생성하거나
                          커리큘럼에서 챕터를 제거해보세요.
                        </div>
                      )}
                      {chapterList.map((chapter, index) => (
                        <Draggable
                          key={chapter.id}
                          draggableId={chapter.id}
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
                              <Card className="w-64 transition-shadow cursor-grab hover:shadow-md">
                                <CardHeader className="p-4">
                                  <CardTitle className="text-sm">
                                    {chapter.name}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {chapter.description}
                                  </p>
                                  <div className="flex gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getDifficultyColor(
                                        chapter.difficulty
                                      )}`}
                                    >
                                      {chapter.difficulty}
                                    </Badge>
                                    {chapter.learningContents
                                      .slice(0, 2)
                                      .map((content, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className={`text-xs ${getContentTypeColor(
                                            content.type
                                          )}`}
                                        >
                                          {content.type}
                                        </Badge>
                                      ))}
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

              {/* 현재 커리큘럼 */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium">현재 커리큘럼</h3>
                  <Badge variant="secondary" className="text-xs">
                    {selectedOrder.length}개
                  </Badge>
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
                      {selectedOrder.length === 0 && (
                        <div className="flex items-center justify-center w-full text-muted-foreground">
                          위의 챕터를 드래그하여 커리큘럼에 추가하세요.
                        </div>
                      )}
                      {selectedOrder.map((curriculumChapter, index) => (
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
                                          #{index + 1}
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
                                  <div className="pt-3 space-y-3">
                                    <div>
                                      <Label className="text-xs font-medium">
                                        학습 대상
                                      </Label>
                                      <Select
                                        value={
                                          getChapterConfig(curriculumChapter.id)
                                            .learningTarget
                                        }
                                        onValueChange={(value) =>
                                          updateChapterConfig(
                                            curriculumChapter.id,
                                            { learningTarget: value }
                                          )
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {learningTargets.map((target) => (
                                            <SelectItem
                                              key={target}
                                              value={target}
                                            >
                                              {target}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium">
                                        학습 유형
                                      </Label>
                                      <ToggleGroup
                                        type="multiple"
                                        value={
                                          getChapterConfig(curriculumChapter.id)
                                            .learningTypes
                                        }
                                        onValueChange={(value) =>
                                          updateChapterConfig(
                                            curriculumChapter.id,
                                            { learningTypes: value }
                                          )
                                        }
                                        className="flex-wrap justify-start gap-1"
                                      >
                                        {activityTypes.map((type) => {
                                          const Icon = activityIcons[type];
                                          return (
                                            <ToggleGroupItem
                                              key={type}
                                              value={type}
                                              size="sm"
                                              className="px-2 py-1 h-8 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                            >
                                              <Icon className="w-3 h-3 mr-1" />
                                              {type}
                                            </ToggleGroupItem>
                                          );
                                        })}
                                      </ToggleGroup>
                                    </div>

                                    {/* 반복 횟수 */}
                                    <div className="space-y-2">
                                      <Label className="text-xs font-medium">
                                        반복 횟수
                                      </Label>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={
                                          getChapterConfig(curriculumChapter.id)
                                            .repetitions
                                        }
                                        onChange={(e) =>
                                          updateChapterConfig(
                                            curriculumChapter.id,
                                            {
                                              repetitions:
                                                parseInt(e.target.value) || 3,
                                            }
                                          )
                                        }
                                        className="w-20 h-8 text-xs"
                                      />
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
            </div>
          </DragDropContext>
          <div className="my-2 text-sm text-muted-foreground">
            총 {selectedOrder.length}개 챕터가 커리큘럼에 포함됩니다.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurriculumEditorWithLibrary;
