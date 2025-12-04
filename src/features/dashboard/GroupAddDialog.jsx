/* eslint-disable react-hooks/exhaustive-deps */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircleIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { patch, post } from "@/api";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";

const GroupAddDialog = ({ open, group, onOpenChange, onAction, onClose }) => {
  const { getId } = useAuth();
  const [upsertError, setError] = useState(false);
  const form = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
      status: group?.status || null,
    },
  });

  const { mutate: upsertGroup } = useMutation({
    mutationKey: ["learning", "group", group ? "update" : "add", group?._id],
    mutationFn: async (data) => {
      setError(false);
      const res = group
        ? await patch(`groups/${group?._id}`, data)
        : await post(`groups`, data);
      if (res?.error) throw Error(res.error);
      return res.result;
    },
    onSettled: (data, error) => {
      if (error) {
        setError(true);
      } else {
        onClose();
      }
    },
  });

  const onSubmit = (data) => {
    upsertGroup({ ...data, teacherId: getId() });
  };

  useEffect(() => {
    form.clearErrors();
    form.reset({
      name: group?.name || "",
      description: group?.description || "",
      status: group?.status || 1,
    });
  }, [open, group]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          그룹 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{group ? "그룹 수정" : "새 그룹 생성"}</DialogTitle>
              <DialogDescription>
                {group
                  ? "기존 학습 그룹의 정보를 수정할 수 있습니다."
                  : "새로운 학습 그룹을 생성하고 학생들을 배정해보세요."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  rules={{
                    required: "필수 입력 사항입니다.",
                    maxLength: {
                      value: 50,
                      message: "최대 50글자 입력이 가능합니다.",
                    },
                    minLength: {
                      value: 3,
                      message: "최소 3글자 이상 입력해야 합니다.",
                    },
                    pattern: {
                      value:
                        /^[가-힣a-zA-Z][가-힣a-zA-Z0-9\s.,!?'"“”‘’\-():;·…]*$/g,
                      message: "입력 양식에 적합하지 않습니다.",
                    },
                  }}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>그룹명</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="학습 그룹명을 입력하세요"
                          defaultValue={group?.name || ""}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>{form?.errors?.name?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  rules={{
                    maxLength: {
                      value: 300,
                      message: "최대 300글자 입력이 가능합니다.",
                    },
                    pattern: {
                      value:
                        /^[가-힣a-zA-Z][가-힣a-zA-Z0-9\s.,!?'"“”‘’\-():;·…]*$/g,
                      message: "입력 양식에 적합하지 않습니다.",
                    },
                  }}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>설명</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          className="resize-none"
                          placeholder="학습 그룹 설명을 입력하세요"
                          defaultValue={group?.description || ""}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>
                        {form?.errors?.description?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              {group && (
                <div>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex justify-between items-center space-y-2 w-full">
                        <FormLabel>{field.value ? "활성" : "비활성"}</FormLabel>
                        <FormControl>
                          <div className="block">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {upsertError && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertTitle>
                    학습그룹 {group ? "수정" : "생성"} 실패
                  </AlertTitle>
                  <AlertDescription>
                    학습그룹 {group ? "수정" : "생성"} 중 문제가 발생했습니다.
                    다시 시도해주세요.
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button className="flex-1" type="submit">
                  {group ? "수정" : "생성"}
                </Button>
                <Button variant="outline" type="button" onClick={onClose}>
                  취소
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupAddDialog;
