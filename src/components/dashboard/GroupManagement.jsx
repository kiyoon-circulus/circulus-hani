import { useState } from "react";
import dayjs from "dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Users, ChevronRight, Trash2 } from "lucide-react";
import useGroupsQuery from "@/hook/useGroupsQuery";
import GroupAddDialog from "@/features/dashboard/GroupAddDialog";
import GroupDeleteDialog from "@/features/dashboard/GroupDeleteDialog";
import { useNavigation } from "@/context/NavigationContext";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "../Loading";

export function GroupManagement() {
  const { getId } = useAuth();
  const { breadcrumb, go } = useNavigation();
  const [addDialogOpen, setAddDialog] = useState(false);
  const [delDialogOpen, setDeleteDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupToDelete, setSelectedGroupToDelete] = useState(null);
  const [page] = useState(1);
  const [q] = useState("");
  const { data, refetch, isError, isPending } = useGroupsQuery({
    teacherId: getId(),
    page,
    q,
  });

  const statusColors = {
    활성: "bg-green-100 text-green-800",
    비활성: "bg-gray-100 text-gray-800",
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setAddDialog(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setAddDialog(true);
  };

  const handleCloseDialog = () => {
    setAddDialog(false);
    setDeleteDialog(false);
    setSelectedGroupToDelete(null);
    refetch();
  };

  const handleGroupClick = (group) => {
    go(`/manage/groups/${group._id}`, [
      ...breadcrumb,
      { id: `group-${group._id}`, label: "캐릭터 관리", section: "groups" },
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">학습 그룹 관리</h2>
          <p className="mt-1 text-muted-foreground">
            학습 그룹을 생성하고 관리합니다. 각 그룹에는 캐릭터와 학습 챕터가
            포함됩니다.
          </p>
        </div>
        <GroupAddDialog
          open={addDialogOpen}
          group={editingGroup}
          onOpenChange={setAddDialog}
          onAction={handleCreateGroup}
          onClose={handleCloseDialog}
        />
      </div>
      {/* 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>그룹 현황 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="p-4 text-center rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600">
                {data?.total || 0}
              </div>
              <div className="text-sm text-blue-700">총 그룹 수</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600">
                {data?.groups.filter((g) => g.status === "활성").length || 0}
              </div>
              <div className="text-sm text-green-700">활성 그룹</div>
            </div>
            <div className="p-4 text-center rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600">
                {data?.groups.reduce(
                  (total, group) => total + group.volume,
                  0
                ) || 0}
              </div>
              <div className="text-sm text-purple-700">총 학생 수</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 그룹 카드 목록 */}
      {isPending && <Loading />}
      {isError && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Unable to process your payment.</AlertTitle>
          <AlertDescription>
            <p>Please verify your billing information and try again.</p>
            <ul className="text-sm list-disc list-inside">
              <li>Check your card details</li>
              <li>Ensure sufficient funds</li>
              <li>Verify billing address</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {!isPending && !isError && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.groups.map((group) => (
            <Card
              key={group._id}
              className="transition-shadow cursor-pointer hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <Badge className={statusColors[group.status]}>
                    {group.status}
                  </Badge>
                </div>
                <p className="overflow-hidden text-sm whitespace-nowrap text-muted-foreground text-ellipsis">
                  {group.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{group.volume}명</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    등록일: {dayjs(group.createdAt).format("LLL")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    수정일: {dayjs(group.updatedAt).format("LLL")}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleGroupClick(group)}
                  >
                    캐릭터 관리
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditGroup(group);
                      setAddDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGroupToDelete(group);
                      setDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <GroupDeleteDialog
        open={delDialogOpen}
        group={selectedGroupToDelete}
        onOpenChange={setDeleteDialog}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
