import React, { useRef, useState, useEffect } from "react";
// Components
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/Toast";

// API
import { getAsset } from "@/api";
import { fetchWriteOCR } from "@/api/learning";

// ETC
import * as tf from "@tensorflow/tfjs";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { JOSA } from "@/utils/globals";

const TM_INPUT_SIZE = 224;
const USE_TF_FOR = new Set(["vowel", "consonant"]);

const SeniorLearnByWrite = ({
  item,
  target,
  onAnswer,
  currentRepeat,
  currentItemIndex,
  currentLearningCount,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [hint, setHint] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);

  // TM 모델 상태
  const [tmModel, setTmModel] = useState(null);
  const [tmLabels, setTmLabels] = useState([]);
  const [tmReady, setTmReady] = useState(false);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const parentRef = useRef(null);

  // ===== 서버 OCR (word/letter 등) =====
  const { mutate: checkAnswer, isPending } = useMutation({
    mutationFn: async (blob) => {
      const formData = new FormData();
      formData.append("uploadFile", blob, "test.png");
      try {
        const data = await fetchWriteOCR(target === "word", formData);
        if (data) return [data.text, item.letter];
      } catch (error) {
        console.error("채점 요청 오류:", error);
      }
      return false;
    },
    onSuccess: ([userAnswer, correctAnswer]) =>
      onAnswer(userAnswer, correctAnswer),
    onError: () => {
      toast.custom(() => (
        <Toast
          description="채점 중 오류가 발생했습니다. 다시 시도해 주세요."
          type="error"
        />
      ));
      clearCanvas();
    },
  });

  // ===== 드로잉 =====
  const startDraw = (e) => {
    if (isPending || isPredicting) return;
    const x =
      e.nativeEvent?.offsetX ??
      e.touches?.[0].clientX - e.target.getBoundingClientRect().left;
    const y =
      e.nativeEvent?.offsetY ??
      e.touches?.[0].clientY - e.target.getBoundingClientRect().top;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || isPending || isPredicting) return;
    const x =
      e.nativeEvent?.offsetX ??
      e.touches?.[0].clientX - e.target.getBoundingClientRect().left;
    const y =
      e.nativeEvent?.offsetY ??
      e.touches?.[0].clientY - e.target.getBoundingClientRect().top;
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const endDraw = () => {
    if (isPending || isPredicting) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  // 화면용 캔버스는 투명 유지 (힌트 보존)
  const clearCanvas = (notify) => {
    const c = canvasRef.current;
    ctxRef.current.clearRect(0, 0, c.width, c.height); // 투명 클리어
    if (notify)
      toast.custom(() => (
        <Toast description="캔버스를 초기화했습니다. 다시 시도해보세요." />
      ));
  };

  // ===== 전처리: 투명 → 흰 배경으로 오프스크린 합성 후 처리 =====
  const getProcessedCanvas = () => {
    const src = canvasRef.current;
    const sw = src.width,
      sh = src.height;

    // 1) 투명 배경을 흰색으로 플래튼
    const flat = document.createElement("canvas");
    flat.width = sw;
    flat.height = sh;
    const fctx = flat.getContext("2d");
    fctx.fillStyle = "#ffffff";
    fctx.fillRect(0, 0, sw, sh);
    fctx.drawImage(src, 0, 0); // 투명 위에 그리기 → 흰색 합성

    // 2) 이진화용 픽셀 읽기
    const id = fctx.getImageData(0, 0, sw, sh);

    // 3) 흑백 이진화(배경 흰색 가정)
    const bin = new Uint8ClampedArray(sw * sh);
    for (let i = 0, j = 0; i < id.data.length; i += 4, j++) {
      const g =
        0.299 * id.data[i] + 0.587 * id.data[i + 1] + 0.114 * id.data[i + 2];
      bin[j] = g > 200 ? 255 : 0; // 글자=검정(0)
    }

    // 4) 바운딩박스 계산
    let minX = sw,
      minY = sh,
      maxX = 0,
      maxY = 0,
      found = false;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        if (bin[y * sw + x] === 0) {
          found = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const cw = found ? maxX - minX + 1 : sw;
    const ch = found ? maxY - minY + 1 : sh;

    // 5) 정사각 패딩 후 리사이즈
    const pad = 32;
    const side = Math.max(cw, ch) + pad * 2;

    const box = document.createElement("canvas");
    box.width = side;
    box.height = side;
    const bctx = box.getContext("2d");
    bctx.fillStyle = "#ffffff";
    bctx.fillRect(0, 0, side, side);

    const crop = fctx.getImageData(found ? minX : 0, found ? minY : 0, cw, ch);
    const tmp = document.createElement("canvas");
    tmp.width = cw;
    tmp.height = ch;
    tmp.getContext("2d").putImageData(crop, 0, 0);
    bctx.drawImage(tmp, (side - cw) / 2, (side - ch) / 2);

    const out = document.createElement("canvas");
    out.width = TM_INPUT_SIZE;
    out.height = TM_INPUT_SIZE;
    out.getContext("2d").drawImage(box, 0, 0, TM_INPUT_SIZE, TM_INPUT_SIZE);
    return out; // 흰 배경으로 정규화된 입력
  };

  // ===== Teachable Machine 모델 로드 (자모일 때만) =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!USE_TF_FOR.has(target)) {
        setTmReady(false);
        return;
      }
      try {
        await tf.ready();
        await tf.setBackend("webgl");
        const base = target === "vowel" ? "/tm-vowel" : "/tm-cons";
        const m = await tf.loadLayersModel(`${base}/model.json`);
        const meta = await fetch(`${base}/metadata.json`).then((r) => r.json());
        if (!mounted) return;
        setTmModel(m);
        setTmLabels(meta.labels || []);
        setTmReady(true);
      } catch (e) {
        console.error("TM 모델 로드 실패:", e);
        setTmReady(false);
        toast.custom(() => (
          <Toast
            description="자모 인식 모델을 불러오지 못했습니다."
            type="error"
          />
        ));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [target]);

  // ===== 제출: 자모 → TM 로컬, 그 외 → 서버 OCR =====
  const handleSubmit = async () => {
    if (USE_TF_FOR.has(target)) {
      if (!tmReady || !tmModel || tmLabels.length === 0) {
        toast.custom(() => (
          <Toast
            description="모델 로딩 중입니다. 잠시 후 다시 시도해 주세요."
            type="error"
          />
        ));
        return;
      }
      try {
        setIsPredicting(true);
        const proc = getProcessedCanvas(); // 흰 배경 합성된 캔버스

        const probs = tf.tidy(() => {
          let img = tf.browser.fromPixels(proc);
          if (img.shape[2] === 4)
            img = img.slice([0, 0, 0], [img.shape[0], img.shape[1], 3]);
          img = img.toFloat().div(255).expandDims(0); // [1,224,224,3]
          const logits = tmModel.predict(img);
          const soft = logits.softmax();
          return soft.dataSync();
        });

        // 2) Top-K 추출
        const ranked = Array.from(probs).map((p, i) => ({ i, p }));
        ranked.sort((a, b) => b.p - a.p);
        const top = ranked
          .slice(0, 3)
          .map(({ i }) => tmLabels[i] ?? `class_${i}`);

        // (디버그) 콘솔에서 Top-K 확인
        console.log("Write Answer:", top, top.includes(item.letter));
        onAnswer(top, item.letter);
      } catch (e) {
        console.error("로컬 자모 예측 실패:", e);
        toast.custom(() => (
          <Toast
            description="인식 중 오류가 발생했습니다. 다시 시도해 주세요."
            type="error"
          />
        ));
      } finally {
        setIsPredicting(false);
      }
      return;
    }

    // 서버 OCR: 전송 직전에만 흰 배경으로 합성
    const temp = document.createElement("canvas");
    temp.width = canvasRef.current.width;
    temp.height = canvasRef.current.height;
    const tctx = temp.getContext("2d");
    tctx.fillStyle = "#ffffff";
    tctx.fillRect(0, 0, temp.width, temp.height);
    tctx.drawImage(canvasRef.current, 0, 0);

    const blob = await new Promise((resolve) => {
      temp.toBlob((b) => resolve(b), "image/png");
    });
    checkAnswer(blob);
  };

  // ===== 문제/반복 바뀔 때 투명 초기화 =====
  useEffect(() => {
    if (ctxRef && ctxRef.current) {
      clearCanvas(false);
      setHint(true);
    }
  }, [currentItemIndex, target, currentRepeat, currentLearningCount]);

  // NOTE: 글자 수에 따른 캔버스 굵기 조절
  const [canvasLineWidth, setCanvasLineWidth] = useState(26);
  useEffect(() => {
    // console.log("item = ", item);
    const len = item.letter.length;
    switch (len) {
      case 5:
        return setCanvasLineWidth(10);
      case 4:
        return setCanvasLineWidth(14);
      case 3:
        return setCanvasLineWidth(20);
      case 2:
        return setCanvasLineWidth(22);

      default:
        return setCanvasLineWidth(28);
    }
  }, [item]);
  // ===== 캔버스 준비 (투명) =====
  useEffect(() => {
    // console.log("canvasLineWidth = ", canvasLineWidth);
    const canvas = canvasRef.current;
    canvas.width = parentRef?.current?.clientWidth;
    canvas.height = parentRef?.current?.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = canvasLineWidth;
    ctxRef.current = ctx;
    clearCanvas(false);
  }, [canvasLineWidth]);

  const busy = isPending || isPredicting;

  return (
    <div className="grid h-full grid-cols-12 gap-4">
      {/* 힌트 영역 */}
      <div className="grid-cols-2 col-span-4 gap-4">
        <div className="flex items-center justify-center h-full p-4 font-extrabold bg-white border rounded-lg shadow-sm text-9xl">
          {target !== "letter" && (
            <div className="flex items-center justify-center col-span-2 p-4 font-extrabold text-9xl">
              {/* NOTE: 현재 쓰기 이미지는 DB에 파일이 없기 때문에 불러오지 못해 type 파라미터를 제거한 상태*/}
              {/*        src={getAsset({ content: `${item.letter}`, type: "write" })}*/}
              <img
                src={getAsset({ content: `${item.letter}` })}
                alt={item.letter}
                className={target === "word" ? "p-2 aspect-square" : ""}
              />
            </div>
          )}
          {target === "letter" && (
            <div className="flex items-center justify-center w-full pr-4 text-xl font-extrabold">
              <img
                src={getAsset({
                  content: `${item.components[0]}`,
                  type: "write",
                })}
                alt={item.components[0]}
                className="flex-1 object-contain w-1/2 h-40"
              />
              <span>+</span>
              <img
                src={getAsset({
                  content: `${item.components[1]}`,
                  type: "write",
                })}
                alt={item.components[1]}
                className="flex-1 object-contain w-1/2 h-40"
              />
              <span>=</span>
            </div>
          )}
        </div>
      </div>

      {/* 문제-보기 영역 */}
      <div className="col-span-8 grid grid-rows-[auto_1fr] gap-4">
        <div className="w-full row-span-1 p-2 text-2xl font-bold text-center border rounded-lg shadow border-neutral-300 bg-rose-300/80">
          {`"${item.letter}"${JOSA().c(item.letter, "을/를")} 직접 써보세요.`}
        </div>

        <div className="flex flex-col items-center justify-center w-full gap-10 p-2 text-center bg-white border rounded-lg shadow-sm">
          <div className="grid grid-cols-[1fr_auto] gap-2 w-full h-full">
            <div className="relative w-full h-full col-span-1" ref={parentRef}>
              {hint && (
                <div
                  className="absolute inset-0 z-0 w-full h-full font-extrabold cursor-default bg-black/10 text-black/20"
                  style={{ userSelect: "none" }}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {/** 글자길이에 따른 크기 변경 write-letter 클래스 */}
                  <p
                    className={`flex items-center justify-center h-full select-none text-xl nanum-gothic-extrabold write-letter-${target}-${item.letter.length}`}
                  >
                    {item.letter}
                  </p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="absolute z-50 w-full h-full"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>

            <div className="grid grid-rows-[1fr_1fr_1fr] col-span-1 gap-2">
              <Button
                size="lg"
                className={`p-4 h-full text-6xl bg-white hover:bg-warning/20 disabled:bg-black/20 ${
                  hint && "grayscale"
                }`}
                disabled={busy}
                onClick={() => setHint(!hint)}
              >
                💡
              </Button>
              <Button
                size="lg"
                className="h-full p-4 text-6xl bg-white hover:bg-error/20 disabled:grayscale disabled:bg-black/20"
                disabled={busy}
                onClick={() => clearCanvas(true)}
              >
                ❌
              </Button>
              <Button
                size="lg"
                className="h-full p-4 text-6xl bg-white hover:bg-success/20 disabled:bg-black/20"
                disabled={busy}
                onClick={handleSubmit}
              >
                {busy ? (
                  <Loader2Icon className="!w-10 !h-10 text-rose-500/50 animate-spin" />
                ) : (
                  "✅"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeniorLearnByWrite;
