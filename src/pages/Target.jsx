import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TARGETS } from "../utils/globals";
import StepDialog from "@/components/StepDialog";
import MenuCard from "@/components/MenuCard";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSessionContext } from "@/context/SessionContext";

function Target() {
  const { character } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selected, setSelectedCard] = useState(null);
  const [open, setOpen] = useState(false);

  // useCurriculumQuery에서 curriculumData 가져오기
  const { curriculumData, isCurriculumLoading, isCurriculumError } =
    useSessionContext();

  // curriculumData를 Target 페이지에 맞게 변환
  const targetData =
    curriculumData?.map((item) => ({
      ...item.target,
      status: item.status,
      chapterId: item.chapterId,
    })) || [];

  const onCardClick = (name) => {
    setSelectedCard(name);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    navigate(
      `/learn/${character}/${selected.chapterId}?target=${selected.name}`
    );
  };

  const handleCancel = () => {
    setSelectedCard(null);
    setOpen(false);
  };

  const handlePrev = () => {
    logout();
  };

  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] overflow-hidden md:gap-4 w-full h-full">
        <header className="col-span-full px-6 pt-4 text-2xl font-extrabold md:text-5xl text-start">
          <button
            className="p-1 mr-1 w-12 h-12 bg-transparent rounded-full hover:bg-black/10"
            onClick={handlePrev}
          >
            <LogOut className="w-8 h-8 -scale-x-100" />
          </button>
          📚 무엇을 배울까요?
        </header>
        <p className="col-span-full px-8 text-xl font-semibold md:text-4xl">
          배우고 싶은 한글을 선택해주세요.
        </p>
        {!isCurriculumLoading && !isCurriculumError && (
          <div className="flex overflow-auto flex-row col-span-full w-full whitespace-nowrap">
            <div
              className={`flex h-full space-x-1 px-6 pb-4 ${
                targetData.length > 4 ? "w-max" : "w-full"
              }`}
            >
              {targetData &&
                targetData.map((item, i) => (
                  <MenuCard
                    key={`target-${i}`}
                    total={targetData.length}
                    index={i}
                    item={item}
                    className={
                      selected?.name === item.name
                        ? `shadow-2xl border bg-${item.name}`
                        : `hover:shadow-2xl bg-${item.name}/50 shadow-inner border-4 border-${item.name}`
                    }
                    textcolor={`mix-blend-difference text-${item.name}/95`}
                    onCardClick={onCardClick}
                    selected={selected}
                    disabled={item.status}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
      <StepDialog
        open={open}
        setOpen={setOpen}
        title={`${TARGETS[selected?.name]}을(를) 학습해 볼까요?`}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}
export default Target;
