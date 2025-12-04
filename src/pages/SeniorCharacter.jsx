// React
import { useEffect, useState } from "react";
import { useSessionStore } from "@/hook/useSessionStore";

// Components
import { Card } from "@/components/ui/card";
import StepDialog from "@/components/StepDialog";
import { BlurFade } from "@/components/magicui/blur-fade";

// Contexts
import { useAuth } from "@/context/AuthContext";

// ETC
import { userSignIn } from "@/api";
import { useMutation } from "@tanstack/react-query";
import characterSelection from "@/assets/dummy/characterSelection";
import { useNavigate } from "react-router-dom";
import { ArrowBigLeft } from "lucide-react";

export default function SeniorCharacter() {
  const navigate = useNavigate();
  // 캐릭터 데이터
  const data = characterSelection;
  const [selectedCard, setSelectedCard] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { getDefaultProgress } = useSessionStore();
  // Student SignIn
  const { login } = useAuth();
  const signInMutation = useMutation({
    mutationKey: ["signin", "student", "kdi61078"],
    mutationFn: userSignIn,
    onSuccess: async (result) => {
      await login(result);
    },
    onError: (error) => {
      console.log(`signInMutaion Error: ${error}`);
    },
  });

  // EventHandler
  const handleConfirm = () => {
    setOpenDialog(false);
    signInMutation.mutate({ userId: "kdi61078", password: "kdi61078" });
  };
  const handleCancel = () => {
    // NOTE: 닫기 이전에 undefined로 되어있는 Dialog 현상 방지
    setTimeout(() => {
      setSelectedCard(null);
    }, 100);
    setOpenDialog(false);
  };
  const onCardClick = (item) => {
    setSelectedCard(item);
    setOpenDialog(true);
  };

  useEffect(() => {
    localStorage.removeItem("learningStats");
    const resume = getDefaultProgress();
    if (resume?.character) return navigate(`/senior/learn/${resume.character}`);
  }, []);
  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] md:gap-4 px-6 py-4 w-full h-full max-w-[1024px] max-h-[600px] ">
        <header className="text-2xl font-extrabold col-span-full md:text-5xl text-start flex items-center">
          <a href="http://localhost:3000">
            <ArrowBigLeft className="w-14 h-14 mr-2" />
          </a>
          <p>👦🏻👧🏻 나는 누구일까요?</p>
        </header>
        <p className="text-xl font-semibold col-span-full md:text-4xl">
          나와 가장 비슷한 친구를 선택해주세요! 🤗
        </p>
        <div className="flex flex-wrap items-center justify-center flex-auto gap-2 p-2 h-fit lg:gap-4 tl6:gap-4 tl6:p-4">
          {data.map((item, i) => (
            <BlurFade
              delay={0.25 * i}
              key={i}
              inView
              className="w-1/6 tp:w-1/4"
            >
              <Card
                className={`flex flex-col flex-grow gap-2 justify-center items-center p-4 cursor-pointer md:p-6 tl6:p-8 ${
                  selectedCard?.name === item.name
                    ? "bg-gradient-to-t from-sky-100 to-white shadow-2xl"
                    : "hover:shadow-xl"
                }`}
                onClick={() => onCardClick(item)}
              >
                <div className="text-7xl">{item.icon}</div>
                <div className="text-3xl font-extrabold text-center md:text-4xl tl6:text-5xl">
                  {item.name}
                </div>
              </Card>
            </BlurFade>
          ))}
        </div>
        <StepDialog
          open={openDialog}
          setOpen={setOpenDialog}
          title={`${selectedCard?.icon} ${selectedCard?.name}로 학습을 시작해볼까요?`}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      </div>
    </>
  );
}
