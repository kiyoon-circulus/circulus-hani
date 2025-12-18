/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";

// Components
import Letters from "@/components/Letters";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ETC
import { JOSA, TARGETS } from "@/utils/globals";
import { AlertCircle, AudioLines, Square } from "lucide-react";
import { getAsset } from "@/api";

const getSR = () => window.SpeechRecognition || window.webkitSpeechRecognition;

const SeniorLearnBySpeak = ({
  data,
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
  currentLearningCount,
}) => {
  const [[type, message], setAlert] = useState(["", ""]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayed, setPlayed] = useState(false);

  // ★ 낙관적 시작 로딩 + UI용 상태
  const [starting, setStarting] = useState(false); // 클릭→onstart 사이
  const [listening, setListening] = useState(false); // UI 표시용
  const [transcript, setTranscript] = useState("");

  // 기존 상태 유지하며 추가/변경
  const [gumStream, setGumStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]); // 녹음 데이터 조각 저장
  const forceStopRef = useRef(false); // 사용자가 정지/제출 눌렀는지

  // 오디오 엘리먼트 및 상태
  const audioRef = useRef(null);
  const repeatRef = useRef(0);
  const cancelledRef = useRef(false);

  // 안내 메시지 (원래 로직 유지 + 네이티브로 대체)
  useEffect(() => {
    setAlert(["", ""]);
    if (listening && !transcript) {
      setAlert([
        "destructive",
        `마이크를 통해 ${TARGETS[target]}${JOSA().c(
          TARGETS[target],
          "을/를"
        )} 소리내어 말해주세요.`,
      ]);
      return;
    }
    if (listening && transcript) {
      setAlert([
        "primary",
        `인식된 ${TARGETS[target]}${JOSA().c(
          TARGETS[target],
          "이/가"
        )}있습니다. "제출하기" 버튼을 눌러주세요.`,
      ]);
      return;
    }
  }, [listening, transcript, target]);

  // 네이티브 인식 시작
  const handleMicButton = async () => {
    console.log('네이티브 시작')
    setAlert(["", ""]);
    try {
      setStarting(true); // ★ 클릭 즉시 로딩 UI
      window.speechSynthesis?.cancel?.();

      // 1. 마이크 스트림 확보
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true, // 에코 제거
        noiseSuppression: true,  // 노이즈 억제
        autoGainControl: true    // 자동 게인 조절
      }
});
      setGumStream(stream);

      // 2. MediaRecorder 설정
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      forceStopRef.current = false;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      }

      // 3. 녹음 중지 시 서버 STT 호출
      recorder.onstop = async () => {
        if (forceStopRef.current) return; // 강제 취소 시 중단

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "voice.webm");

        setAlert(["primary", "발음을 분석하고 있습니다..."]);

        try {
          // 1. 내부망 STT 서버로 전송
          const url = 'http://127.0.0.1:59532/v1'
          const res = await fetch(`${url}/stt?lang=ko&isPlay=0`, {
            method: "POST",
            body: formData,
          });

          const result = await res.json();
          const recognizedText = (result.text || result.data || "").trim();
          
          // 2. 텍스트 전처리 (공백 제거 등)
          const cleanedText = recognizedText.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, "").trim();

          if (cleanedText) {
            setTranscript(cleanedText);
            
            // 3. 즉시 판단 및 결과 전송 (onAnswer 호출)
            // 여기서 item.name(정답)과 cleanedText(인식결과)를 비교하는 로직이 onAnswer 내부에서 실행됩니다.
            onAnswer(cleanedText, item.name); 
            
            // 4. 리소스 정리
            stopMicButton(); 
          } else {
            setAlert(["destructive", "소리가 잘 들리지 않습니다. 다시 말씀해주세요."]);
            setListening(false);
          }
        } catch (error) {
          setAlert(["destructive", "오프라인 서버 연결을 확인해주세요."]);
          setListening(false);
        }
      };

    recorder.start();
    setStarting(false);
    setListening(true);
  } catch (error) {
    setAlert(["destructive", "마이크 연결 실패"]);
    setStarting(false);
    setListening(false);
  }
  };

  // 네이티브 인식 정지
  const stopRecognition = ({ uiOnly = false } = {}) => {
    // 1. 레코더 중단 (이게 onstop을 트리거함)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    // 2. 스트림 종료는 약간의 유예를 두거나 uiOnly가 아닐 때만 수행
    if (!uiOnly && gumStream) {
      gumStream.getAudioTracks().forEach((track) => track.stop());
      setGumStream(null);
      setListening(false);
      setStarting(false);
    }
  };

 const stopMicButton = () => {
  console.log("사용자 취소: API 호출 안함");
  forceStopRef.current = true; // ★ fetch 방지
  stopRecognition({ uiOnly: false });
  setTranscript("");
  setAlert(["", ""]);
};

  const checkPronunciation = () => {
    console.log("제출 시도: 녹음 중지 및 STT 요청");
    forceStopRef.current = false; // ★ 반드시 false여야 fetch가 실행됨
    stopRecognition({ uiOnly: false }); // 분석을 시작하므로 UI를 정리함
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

  // 발음 예시 TTS (원본 유지)
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

  // 전환/반복/언마운트 시 정리 (원본 의도 유지)
  useEffect(() => {
    setPlayed(false);
    document.dispatchEvent(new Event("stop-sound"));
    forceStopRef.current = true;
    stopRecognition({ uiOnly: false });
    setTranscript("");
    setAlert(["", ""]);
    // 언마운트/문항 변경 시 정리
    return () => {
      document.dispatchEvent(new Event("stop-sound"));
    };
  }, [currentItemIndex, target, currentRepeat, currentLearningCount]);

  useEffect(() => {
    return () => {
      forceStopRef.current = true;
      stopRecognition({ uiOnly: false });
      document.dispatchEvent(new Event("stop-sound"));
    };
  }, []);

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      <div className="col-span-9 grid grid-rows-[auto_1fr] gap-4">
        <div className="w-full row-span-1 p-2 text-2xl font-bold text-center border rounded-lg shadow border-neutral-300 bg-blue-300/80">
          {`"말하기"를 선택하고 "${item.letter}"${JOSA().c(
            item.name,
            "을/를"
          )} 소리내어 말해보세요.`}
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
            <div className="flex gap-2">
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

            <Button
              onClick={playSound}
              disabled={isPlaying}
              size="lg"
              className={`flex flex-col gap-10 justify-center text-2xl font-bold hover:bg-blue-600/50 ${
                isPlaying
                  ? "text-blue-500 bg-blue-100 hover:bg-blue-200"
                  : "bg-blue-400 hover:bg-blue-200/"
              } h-fit`}
            >
              {isPlaying ? "🔊 소리 듣는 중..." : "🔊 소리 듣기"}
            </Button>
          </div>
        </div>
      </div>

      {/* 우측 컨트롤: starting/ listening 상태 표시 */}
      <div className="flex flex-col items-center justify-center w-full h-full col-span-3 grid-rows-3 gap-10 p-8 text-center bg-white border rounded-lg shadow-sm">
        {!listening && !starting && (
          <Button
            onClick={handleMicButton}
            size="lg"
            className="flex flex-col justify-center gap-10 pt-12 pb-6 text-2xl font-bold bg-blue-500 animate-focus hover:bg-blue-600 h-fit max-w-48"
          >
            <p className="text-9xl">🎙️</p>
            <p className="max-w-fit text-wrap">말하기</p>
          </Button>
        )}

        {!listening && starting && (
          <div className="flex flex-col items-center gap-4 text-blue-600">
            <div className="w-10 h-10 border-4 border-blue-300 rounded-full animate-spin border-t-transparent" />
            <p className="text-xl font-bold">마이크 여는 중…</p>
            <p className="text-sm text-neutral-500">
              브라우저 권한/장치 연결을 확인하는 중
            </p>
          </div>
        )}

        {listening && (
          <div className="flex flex-col items-center justify-center gap-6 text-2xl text-blue-500">
            <p className="text-2xl font-extrabold text-center max-w-fit text-wrap animate-focus">
              듣는 중...
            </p>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                className="flex justify-center text-2xl font-bold h-fit"
                variant="destructive"
                onClick={stopMicButton}
              >
                <Square /> 정지
              </Button>
              <Button
                size="lg"
                className="flex justify-center text-2xl font-bold h-fit"
                onClick={checkPronunciation}
                disabled={!listening}
              >
                <AudioLines />
                제출하기
              </Button>
            </div>
          </div>
        )}

        {message && (
          <Alert variant={type} className="items-center">
            <AlertDescription className="flex items-center gap-2">
              <AlertCircle />
              {message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default SeniorLearnBySpeak;
