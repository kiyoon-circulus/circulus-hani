import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { userSignIn } from "@/api";
import { useState } from "react";

export function StudentForm({ className, ...props }) {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      code: "",
    },
  });

  const signInMutation = useMutation({
    mutationKey: ["signin", "student", form.getValues("code")],
    mutationFn: userSignIn,
    onSuccess: async (result) => {
      form.clearErrors("signin");
      await login(result);
    },
    onError: (error) => {
      form.setValue("code", "");
      setError(error.message);
    },
    retry: false,
  });

  const onSubmit = (data) => {
    setError("");
    signInMutation.mutate({ userId: data.code, password: data.code });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <img src="/logo.png" alt="또박한글" className=" max-w-96" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  rules={{ required: "학습 코드를 입력하세요." }}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>학습 코드 입력</FormLabel>
                      <FormControl>
                        <Input
                          id="code"
                          type="text"
                          placeholder="학습 코드를 입력하세요."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>{form?.errors?.code?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                학습하기
              </Button>
            </div>
          </form>
        </Form>
        <div className="relative text-sm text-center after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
      </div>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        선생님이 알려준 학습 코드를 입력하고 학습을 시작하세요.
      </div>
    </div>
  );
}
