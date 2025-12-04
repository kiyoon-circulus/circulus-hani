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

export function LoginForm({ className, ...props }) {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const signInMutation = useMutation({
    mutationKey: [
      "signin",
      "teacher",
      form.getValues("userId"),
      form.getValues("password"),
    ],
    mutationFn: userSignIn,
    onSuccess: async (result) => {
      form.clearErrors("signin");
      await login(result);
    },
    onError: (error) => {
      form.setValue("password", "");
      setError(error.message);
    },
    retry: false,
  });

  const onSubmit = (data) => {
    setError("");
    signInMutation.mutate(data);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <img src="/logo.png" alt="또박한글" className=" max-w-96" />
          {/* <div className="text-sm text-center">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div> */}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  rules={{ required: "아이디를 입력하세요." }}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>아이디</FormLabel>
                      <FormControl>
                        <Input
                          id="userId"
                          type="text"
                          placeholder="아이디를 입력하세요."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>{form?.errors?.userId?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  rules={{ required: "비밀번호를 입력하세요." }}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          type="password"
                          placeholder="비밀번호를 입력하세요."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>
                        {form?.errors?.password?.message}
                      </FormMessage>
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
                로그인
              </Button>
            </div>
          </form>
        </Form>
        <div className="relative text-sm text-center after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"></div>
        <div className="grid gap-4">
          <Button variant="outline" type="button" className="w-full">
            회원가입
          </Button>
        </div>
      </div>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        선생님 계정만 가입이 가능합니다.
      </div>
    </div>
  );
}
