/* eslint-disable react-hooks/exhaustive-deps */
import { patch, post } from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// 미리 정의된 캐릭터 데이터
const presetCharacters = [
  {
    name: "뚜디",
    icon: "128059", // "🐻",
  },
  {
    name: "루루",
    icon: "128048", //"🐰",
  },
  {
    name: "포니",
    icon: "129418", //"🦊",
  },
  {
    name: "밀리",
    icon: "128054", //"🐶",
  },
  {
    name: "네코",
    icon: "128049", // "🐱",
  },
  {
    name: "쿠쿠",
    icon: "128034", //"🐢",
  },
  {
    name: "핑핑",
    icon: "128039", //"🐧",
  },
  {
    name: "찌니",
    icon: "128038", //"🐦",
  },
  {
    name: "옥토",
    icon: "128025", //"🐙",
  },
  {
    name: "알리",
    icon: "128040", //🐨
  },
];

const CharacterAddDialog = ({
  open,
  groupId,
  character,
  onOpenChange,
  onAction,
  onClose,
}) => {
  const [upsertError, setError] = useState(false);
  const form = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      nickname: character?.nickname,
      icon: character?.icon,
      memo: character?.memo,
    },
  });
  const icon = form.watch("icon");

  const { mutate: upsertCharacter } = useMutation({
    mutationKey: [
      "learning",
      "group",
      "character",
      character ? "update" : "add",
      character?._id,
    ],
    mutationFn: async (data) => {
      setError(false);
      const res = character
        ? await patch(`character/${character?._id}`, data)
        : await post(`character`, data);
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
    upsertCharacter({ ...data, groupId });
  };
  const handleIcon = (field, value) => () => {
    field.onChange(value);
    const item = presetCharacters.find(({ icon }) => icon === value);
    form.setValue("nickname", item.name);
  };

  useEffect(() => {
    form.clearErrors();
    form.reset({
      nickname: character?.nickname,
      icon: character?.icon,
      memo: character?.memo || "",
    });
  }, [open, character]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          캐릭터 추가
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {character ? "캐릭터 수정" : "새 캐릭터 생성"}
              </DialogTitle>
              <DialogDescription>
                {character
                  ? "캐릭터의 닉네임을 수정할 수 있습니다."
                  : "학생들의 학습을 도와줄 캐릭터를 선택하고 닉네임을 설정해주세요."}
              </DialogDescription>
            </DialogHeader>

            {/* 생성 모드 */}
            {!character ? (
              <div className="space-y-6">
                {/* 캐릭터 선택 */}
                <FormField
                  control={form.control}
                  rules={{ required: "캐릭터를 선택하세요." }}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>캐릭터 선택</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                          {presetCharacters.map((preset) => {
                            const selected = field.value === preset.icon;
                            return (
                              <button
                                type="button"
                                key={preset.icon}
                                className={`cursor-pointer border-2 rounded-lg p-3 text-center transition-all ${
                                  selected
                                    ? "border-primary bg-primary/5 scale-105"
                                    : "border-border hover:border-primary/50"
                                }`}
                                onClick={handleIcon(field, preset.icon)}
                              >
                                <div className="relative">
                                  <p className="mx-auto mb-2 text-5xl rounded-full">
                                    {String.fromCodePoint(preset.icon)}
                                  </p>
                                  {selected && (
                                    <div className="absolute flex items-center justify-center w-6 h-6 rounded-full -top-1 -right-1 bg-primary">
                                      <Check className="w-4 h-4 text-primary-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm font-medium">
                                  {preset.name}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 캐릭터 닉네임 설정 (선택 완료 시 노출) */}
                {icon && (
                  <>
                    <FormField
                      control={form.control}
                      rules={{
                        maxLength: {
                          value: 10,
                          message: "최대 10글자 입력이 가능합니다.",
                        },
                        minLength: {
                          value: 2,
                          message: "최소 2글자 이상 입력해야 합니다.",
                        },
                        pattern: {
                          value:
                            /^[가-힣a-zA-Z][가-힣a-zA-Z0-9\s.,!?'"“”‘’\-():;·…]*$/g,
                          message: "입력 양식에 적합하지 않습니다.",
                        },
                      }}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="characterNickname">
                            캐릭터 닉네임
                          </FormLabel>
                          <FormControl>
                            <Input id="characterNickname" {...field} />
                          </FormControl>
                          <FormMessage>
                            {form?.errors?.nickname?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      rules={{
                        maxLength: {
                          value: 100,
                          message: "최대 100글자 입력이 가능합니다.",
                        },
                      }}
                      name="memo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="characterMemo">비고</FormLabel>
                          <FormControl>
                            <Textarea
                              id="characterMemo"
                              className="resize-none"
                              placeholder="부가적인 정보가 필요할 경우 입력하세요."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {form?.errors?.memo?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            ) : (
              // 수정 모드: 닉네임만
              <div className="space-y-4">
                <div className="grid items-end grid-cols-2 gap-4 py-4">
                  <div>
                    <div className="flex items-center gap-3 rounded-lg">
                      <p className="mx-auto text-6xl rounded-full">
                        {String.fromCodePoint(character.icon)}
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="characterNickname">
                            캐릭터 닉네임
                          </FormLabel>
                          <FormControl>
                            <Input
                              id="characterNickname"
                              placeholder="캐릭터의 닉네임을 입력하세요"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {form?.errors?.nickname?.message}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    rules={{
                      maxLength: {
                        value: 100,
                        message: "최대 100글자 입력이 가능합니다.",
                      },
                    }}
                    name="memo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="characterMemo">비고</FormLabel>
                        <FormControl>
                          <Textarea
                            id="characterMemo"
                            className="resize-none"
                            placeholder="부가적인 정보가 필요할 경우 입력하세요."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage>{form?.errors?.memo?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {upsertError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>
                  캐릭터 {character ? "수정" : "생성"} 실패
                </AlertTitle>
                <AlertDescription>
                  캐릭터 {character ? "수정" : "생성"} 중 문제가 발생했습니다.
                  다시 시도해주세요.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="mt-4">
              <div className="flex w-full gap-2">
                <Button type="submit" className="flex-1">
                  {character ? "수정" : "생성"}
                </Button>
                <Button variant="outline" type="button" onClick={onClose}>
                  취소
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default CharacterAddDialog;
