/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { JOSA, TARGETS } from "@/utils/globals";
import Options from "@/features/Options";
import { Button } from "./ui/button";
import { getAsset } from "@/api";

const LearnByListen = ({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
  currentLearningCount,
}) => {
  const [options, setOptions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayed, setPlayed] = useState(false);

  // 오디오 엘리먼트 및 상태
  const audioRef = useRef(null);
  const repeatRef = useRef(0);
  const cancelledRef = useRef(false);

  const generateChoices = () => {
    const correct = item.letter;
    const pool = data.map((i) => i.letter);
    const choices = [correct];
    while (choices.length < 3) {
      const random = pool[Math.floor(Math.random() * pool.length)];
      if (!choices.includes(random)) choices.push(random);
    }
    const newOne = choices.sort(() => Math.random() - 0.5);
    setOptions(newOne);
  };

  const stopPlayback = () => {
    cancelledRef.current = true;
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setPlayed(true);
  };

  const handleSelect = (choice) => {
    document.dispatchEvent(new Event("stop-sound"));
    onAnswer(choice, item.letter);
  };

  const playSound = async () => {
    // 중복 클릭 방지
    if (isPlaying) return;

    setIsPlaying(true);
    setPlayed(false);
    repeatRef.current = 0;
    cancelledRef.current = false;

    // 정지 이벤트 리스너
    const stopHandler = () => {
      document.removeEventListener("stop-sound", stopHandler);
      stopPlayback();
    };
    document.addEventListener("stop-sound", stopHandler);

    // MP3 URL 확보
    let url;
    try {
      url = await getAsset({ content: item.letter, type: "sound" });
      if (!url) throw new Error("음원 URL을 가져오지 못했습니다.");
    } catch (err) {
      console.error(err);
      stopPlayback();
      return;
    }

    // 재생 함수
    const playOnce = () => {
      if (cancelledRef.current) return;
      const audio = new Audio(url);
      audioRef.current = audio;

      // iOS/모바일 대비: 자동 재생 실패 예외 처리
      audio.play().catch((e) => {
        console.error("오디오 재생 실패:", e);
        stopPlayback();
      });

      audio.onended = () => {
        repeatRef.current += 1;
        if (repeatRef.current < 3 && !cancelledRef.current) {
          // 반복 간 간격
          setTimeout(() => playOnce(), 500);
        } else {
          // 재생 종료
          stopPlayback();
          document.removeEventListener("stop-sound", stopHandler);
        }
      };
    };

    playOnce();
  };

  useEffect(() => {
    setPlayed(false);
    document.dispatchEvent(new Event("stop-sound"));
    generateChoices();
    // 언마운트/문항 변경 시 정리
    return () => {
      document.dispatchEvent(new Event("stop-sound"));
    };
  }, [currentItemIndex, target, currentRepeat, currentLearningCount]);

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-9 grid grid-rows-[auto_1fr] gap-4">
        <div className="w-full row-span-1 p-2 text-2xl font-bold text-center border rounded-lg shadow border-neutral-300 bg-teal-300/80">
          {`"소리 듣기"를 선택하여 들리는 소리와 같은 "${
            TARGETS[target]
          }"${JOSA().c(TARGETS[target], "을/를")} 선택하세요.`}
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
          <div className="flex flex-col items-center justify-center w-full h-full col-span-5 gap-2 bg-white border rounded-lg shadow">
            <Button
              onClick={playSound}
              disabled={isPlaying}
              size="lg"
              className={`flex flex-col gap-10 justify-center pt-12 pb-6 text-2xl font-bold hover:bg-teal-600 ${
                isPlaying
                  ? "text-teal-500 bg-teal-100 hover:bg-teal-200"
                  : "bg-teal-500 animate-focus hover:bg-teal-600"
              } h-fit`}
            >
              <p className="text-9xl">🔊</p>
              {isPlaying ? "소리 듣는 중..." : "소리 듣기"}
            </Button>
          </div>
        </div>
      </div>
      {/* 보기 영역 */}
      <Options
        id={`${currentItemIndex}-${currentLearningCount}-${currentRepeat}-${target}`}
        enabled={isPlayed}
        correctAnswer={item.letter}
        options={options}
        onSelect={handleSelect}
        color="teal"
        currentItemIndex={currentItemIndex}
      />
    </div>
  );
};

export default LearnByListen;
