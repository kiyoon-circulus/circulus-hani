// src/index.jsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-6 justify-center items-center min-h-screen">
      <Card className="shadow-2xl transition-all group bg-white/80 hover:bg-white">
        <CardHeader>
          <img
            src="/teacher.png"
            className="w-60 h-60 group-hover:scale-105"
          ></img>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            <p className="mb-1 text-xl font-bold">선생님</p>
            <p>학습그룹과 학습 현황을 관리합니다.</p>
          </CardDescription>
        </CardContent>
        <CardFooter className="inline-flex justify-center w-full">
          <Button className="w-full" onClick={() => navigate("/login/teacher")}>
            학습 관리 페이지로 이동
            <ChevronRight />
          </Button>
        </CardFooter>
      </Card>
      <Card className="shadow-2xl transition-all group bg-white/80 hover:bg-white">
        <CardHeader>
          <img
            src="/student.png"
            className="w-60 h-60 group-hover:scale-105"
          ></img>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center">
            <p className="mb-1 text-xl font-bold">학생</p>
            <p>한글 학습을 시작합니다.</p>
          </CardDescription>
        </CardContent>
        <CardFooter className="inline-flex justify-center w-full">
          <Button className="w-full" onClick={() => navigate("/login/student")}>
            학습 페이지로 이동
            <ChevronRight />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
