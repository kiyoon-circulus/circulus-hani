import { del } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { useEffect, useState } from "react";
const GroupDeleteDialog = ({ open, group, onOpenChange, onClose }) => {
  const [type, setType] = useState(null);
  const { mutate: deleteGroup } = useMutation({
    mutationKey: ["learning", "group", "delete", group?._id],
    mutationFn: async () => {
      const res = await del(`groups/${group?._id}`);
      if (res?.error) throw Error(res.error);
      return res.result;
    },
    onSettled: (data, error) => {
      if (error) {
        setType("destructive");
      } else {
        setType("success");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    },
  });

  useEffect(() => {
    setType(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>그룹 삭제</DialogTitle>
          <DialogDescription className="py-2 text-base">
            {`${group?.name} 그룹을 삭제하시겠습니까?`}
          </DialogDescription>
        </DialogHeader>
        {type && (
          <Alert variant={type}>
            {type === "destructive" ? (
              <AlertCircleIcon />
            ) : (
              <CheckCircle2Icon />
            )}
            <AlertTitle>
              {type === "destructive"
                ? "학습그룹 삭제 실패"
                : "학습그룹 삭제 성공"}
            </AlertTitle>
            <AlertDescription>
              {`${group?.name}그룹 ${
                type === "destructive"
                  ? "삭제에 실패했습니다."
                  : "이 삭제되었습니다."
              }`}
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
          </DialogClose>
          {(type === null || type === "destructive") && (
            <Button variant="destructive" onClick={deleteGroup}>
              삭제
            </Button>
          )}
          {type === "success" && (
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDeleteDialog;
