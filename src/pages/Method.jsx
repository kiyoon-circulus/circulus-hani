/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { COLORS, TARGETS, METHODS, getPrevPath } from "../utils/globals";
import StepDialog from "@/components/StepDialog";
import MenuCard from "@/components/MenuCard";
import { ChevronLeft } from "lucide-react";
import { useSessionContext } from "@/context/SessionContext";

function Method() {
  const { curriculumData, getMethodData } = useSessionContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { character, chapter } = useParams();
  const [searchParams] = useSearchParams();
  const target = searchParams.get("target");
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [methodData, setMethodData] = useState(null);

  const onCardClick = (item) => {
    setSelected(item.name);
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    navigate(`/learn/${character}/${chapter}/${selected}`);
  };

  const handleCancel = () => {
    setSelected(null);
    setOpen(false);
  };

  const handlePrev = () => {
    navigate(`${getPrevPath(location.pathname)}`);
  };

  useEffect(() => {
    if (curriculumData) {
      const data = getMethodData(chapter);
      setMethodData(data);
    }
  }, [curriculumData, chapter]);

  return (
    <>
      <div className="grid grid-rows-[auto_auto_1fr] md:gap-4 w-full h-full">
        <header className="col-span-full px-6 pt-4 text-2xl font-extrabold md:text-5xl text-start">
          <button
            className="p-1 mr-1 w-12 h-12 bg-transparent rounded-full hover:bg-black/10"
            onClick={handlePrev}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          {`🎯 ${TARGETS[target]}`}
          {target === "letter" ? "를" : "을"} 어떻게 배울까요?
        </header>
        <p className="col-span-full px-8 text-xl font-semibold md:text-4xl">
          재미있게 배울 방법을 선택해주세요.
        </p>
        {curriculumData && methodData && (
          <div className="flex overflow-auto flex-row col-span-full w-full whitespace-nowrap">
            <div
              className={`flex h-full space-x-1 px-6 pb-4 ${
                methodData.length > 4 ? "w-max" : "w-full"
              }`}
            >
              {methodData &&
                methodData.map((item, i) => (
                  <MenuCard
                    key={`method-${i}`}
                    total={methodData.length}
                    index={i}
                    item={item}
                    className={
                      selected === item.name
                        ? `shadow-2xl border bg-${COLORS[item.name]}-400`
                        : `hover:shadow-2xl bg-${
                            COLORS[item.name]
                          }-100 shadow-inner border-4 border-${
                            COLORS[item.name]
                          }-400`
                    }
                    textcolor={`text-${COLORS[item.name]}-500`}
                    onCardClick={onCardClick}
                    selected={selected}
                    disabled={item?.session?.status === "ended" || false}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
      <StepDialog
        open={open}
        setOpen={setOpen}
        title={`${TARGETS[target]} ${METHODS[selected]} 학습을 시작해 볼까요?`}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
}
export default Method;
