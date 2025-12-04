/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Options from "@/features/Options";
import Letters from "@/components/Letters";
import { JOSA } from "@/utils/globals";
import { getAsset } from "@/api";

export default function SeniorLearnByRead({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
  currentLearningCount,
}) {
  const [options, setOptions] = useState([]);

  const generateChoices = () => {
    if (item) {
      const correct = item.letter;
      const pool = data.map((i) => i.letter);
      const choices = [correct];
      while (choices.length < 3) {
        const random = pool[Math.floor(Math.random() * pool.length)];
        if (!choices.includes(random)) choices.push(random);
      }
      const newOne = choices.sort(() => Math.random() - 0.5);
      setOptions(newOne);
    }
  };

  const handleSelect = (choice) => {
    onAnswer(choice, item.letter);
  };

  useEffect(() => {
    generateChoices();
  }, [currentItemIndex, target, currentRepeat, currentLearningCount]);

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-9 grid grid-rows-[auto_1fr] gap-4">
        <div className="w-full row-span-1 p-2 text-2xl font-bold text-center border rounded-lg shadow border-neutral-300 bg-amber-300/80">
          {`"${item.letter}"${JOSA().c(item.name, "을/를")} 찾아보세요.`}
        </div>
        <div className="grid w-full h-full grid-cols-9 row-span-2 gap-4">
          {/* 힌트 영역 */}
          <div className="flex items-center justify-center w-full h-full col-span-4 gap-4 bg-white border rounded-lg shadow">
            {target !== "letter" && (
              <div className="flex items-center justify-center col-span-2 p-4 font-extrabold text-9xl">
                <img
                  src={getAsset({ content: item.letter })}
                  alt={item.letter}
                  className={target === "word" ? "p-2 aspect-square" : ""}
                />
              </div>
            )}
            {target === "letter" && (
              <div className="flex items-center justify-center w-full pr-4 text-6xl font-extrabold">
                <img
                  src={getAsset({ content: item.components[0] })}
                  alt={item.components[0]}
                  className="flex-1 object-contain w-1/3 h-auto scale-75"
                />
                <span>+</span>
                <img
                  src={getAsset({ content: item.components[1] })}
                  alt={item.components[1]}
                  className="flex-1 object-contain w-1/3 h-auto"
                />
                <span>=</span>
              </div>
            )}
          </div>
          {/* 문제-보기 영역 */}
          <div className="flex items-center justify-center w-full h-full col-span-5 gap-2 bg-white border rounded-lg shadow">
            {target !== "word" && (
              <Letters
                n={1}
                letter={item.letter}
                className="col-span-1 p-2 font-extrabold"
                noBorder
              />
            )}
            {target === "word" && (
              <>
                {/** NOTE: n -> components.length + 1으로 변경 */}
                {item.components.map((c, i) => (
                  <Letters
                    n={item.components.length + 1}
                    letter={c}
                    key={`${c}-${i}`}
                    className="col-span-1 p-2 font-extrabold"
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      {/* 보기 영역 */}
      <Options
        id={`${currentItemIndex}-${currentLearningCount}-${currentRepeat}-${target}`}
        enabled
        correctAnswer={item.letter}
        options={options}
        onSelect={handleSelect}
        color="amber"
        currentItemIndex={currentItemIndex}
      />
    </div>
  );
}
