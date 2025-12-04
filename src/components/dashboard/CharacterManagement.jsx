import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

import {
  Plus,
  Edit,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Trash2,
} from "lucide-react";
import { useNavigation } from "@/context/NavigationContext";
import CharacterAddDialog from "@/features/dashboard/CharacterAddDialog";
import useCharactersQuery from "@/hook/useCharactersQuery";
import dayjs from "dayjs";
import CharacterDeleteDialog from "@/features/dashboard/CharacterDeleteDialog";

export function CharacterManagement() {
  const { current, groupsById, go, breadcrumb } = useNavigation();
  const groupId = current?.groupId || "";
  const currentGroup = groupsById[groupId]?.name || "";
  const { data, refetch, isError, isPending } = useCharactersQuery({ groupId });

  // 데이터가 없을 때 기본값 설정
  const characters = data?.characters || [];
  const total = data?.total || 0;

  // 페이지 진입 시 데이터 refetch
  useEffect(() => {
    refetch();
  }, [groupId, refetch]);

  const [addDialogOpen, setAddDialog] = useState(false);
  const [delDialogOpen, setDeleteDialog] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [selectedCharacterToDelete, setSelectedCharacterToDelete] =
    useState(null);

  const handleCreateCharacter = () => {
    setEditingCharacter(null);
    setAddDialog(true);
  };

  // 삭제 다이얼로그 오픈은 카드의 삭제 버튼에서 직접 처리합니다.
  const handleCloseDialog = () => {
    setAddDialog(false);
    setDeleteDialog(false);
    setSelectedCharacterToDelete(null);
    refetch();
  };

  const handleEditCharacter = (character) => {
    setEditingCharacter(character);
    setAddDialog(true);
  };

  const handleBackToGroups = () => {
    go("/manage/groups", breadcrumb.slice(0, breadcrumb.length - 1));
  };

  const handleCurriculumClick = (characterId) => {
    go(`/manage/groups/${groupId}/${characterId}`, [
      ...breadcrumb,
      { id: characterId, name: "커리큘럼 관리" },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {groupId && (
            <Button variant="outline" size="sm" onClick={handleBackToGroups}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              그룹 목록으로
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {groupId ? `${currentGroup} - 캐릭터 관리` : "전체 캐릭터 관리"}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {groupId
                ? `${currentGroup}에 속한 캐릭터들을 관리하고 각 캐릭터의 학습 커리큘럼을 설정합니다.`
                : "모든 그룹의 캐릭터들을 관리합니다."}
            </p>
          </div>
        </div>
        <CharacterAddDialog
          open={addDialogOpen}
          groupId={groupId}
          character={editingCharacter}
          onOpenChange={setAddDialog}
          onAction={handleCreateCharacter}
          onClose={handleCloseDialog}
        />
      </div>

      {/* 로딩 상태 */}
      {isPending && (
        <div className="py-8 text-center">
          <p>캐릭터 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {isError && (
        <div className="py-8 text-center">
          <p className="text-red-500">캐릭터 목록을 불러오는데 실패했습니다.</p>
          <Button onClick={() => refetch()} className="mt-2">
            다시 시도
          </Button>
        </div>
      )}
      {/* 캐릭터 카드 목록 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {!isPending &&
          !isError &&
          characters.map((character) => {
            return (
              <Card
                key={character._id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <p className="mx-auto text-5xl rounded-full">
                      {character.icon && !isNaN(character.icon)
                        ? String.fromCodePoint(character.icon)
                        : "👤"}
                    </p>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {`${character.nickname} (${character.studentName})`}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {character.memo}
                      </p>
                      {!groupId && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {currentGroup}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {character?.curriculum?.length || 0}개 챕터 배정됨
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">
                      등록일:{" "}
                      {character.createdAt
                        ? dayjs(character.createdAt).format("LLL")
                        : "알 수 없음"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      수정일:{" "}
                      {character.updatedAt
                        ? dayjs(character.updatedAt).format("LLL")
                        : "알 수 없음"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => handleCurriculumClick(character._id)}
                    >
                      커리큘럼 관리
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCharacter(character)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCharacterToDelete(character);
                        setDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      <CharacterDeleteDialog
        open={delDialogOpen}
        character={selectedCharacterToDelete}
        onOpenChange={setDeleteDialog}
        onClose={handleCloseDialog}
      />

      {total === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {groupId
                ? `${currentGroup}에 등록된 캐릭터가 없습니다.`
                : "등록된 캐릭터가 없습니다."}
            </p>
            <Button className="mt-4" onClick={handleCreateCharacter}>
              <Plus className="w-4 h-4 mr-2" />첫 번째 캐릭터 추가
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
