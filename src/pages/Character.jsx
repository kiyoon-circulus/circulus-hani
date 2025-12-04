/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepDialog from "@/components/StepDialog";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Card } from "@/components/ui/card";
import { useSessionStore } from "@/hook/useSessionStore";

const Character = () => {
  const navigate = useNavigate();
  const { getDefaultProgress } = useSessionStore();
  const [selectedCard, setSelectedCard] = useState(null);
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    navigate(`${selectedCard?.name}`);
  };

  const handleCancel = () => {
    setSelectedCard(null);
    setOpen(false);
  };

  const onCardClick = (item) => {
    setSelectedCard(item);
    setOpen(true);
  };

  useEffect(() => {
    localStorage.removeItem("learningStats");
    const resume = getDefaultProgress();
    if (resume?.character) return navigate(`/learn/${resume.character}`);
  }, []);

  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] md:gap-4 px-6 py-4 w-full h-full">
        <header className="text-2xl font-extrabold col-span-full md:text-5xl text-start">
          👦🏻👧🏻 나는 누구일까요?
        </header>
        <p className="text-xl font-semibold col-span-full md:text-4xl">
          나와 가장 비슷한 친구를 선택해주세요! 🤗
        </p>
        <div className="flex flex-wrap items-center justify-center flex-auto gap-2 p-2 h-fit lg:gap-4 tl6:gap-4 tl6:p-4">
          {[
            {
              name: "뚜디",
              icon: "🐻",
            },
            {
              name: "루루",
              icon: "🐰",
            },
            {
              name: "포니",
              icon: "🦊",
            },
            {
              name: "밀리",
              icon: "🐶",
            },
            {
              name: "네코",
              icon: "🐱",
            },
            {
              name: "쿠쿠",
              icon: "🐢",
            },
            {
              name: "핑핑",
              icon: "🐧",
            },
            {
              name: "찌니",
              icon: "🐦",
            },
            {
              name: "옥토",
              icon: "🐙",
            },
          ].map((item, i) => (
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
      </div>
      <StepDialog
        open={open}
        setOpen={setOpen}
        title={`${selectedCard?.icon} ${selectedCard?.name}로 학습을 시작해볼까요?`}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
};
export default Character;
