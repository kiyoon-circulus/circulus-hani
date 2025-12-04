import { useEffect, useRef, useState } from "react";

const ConcentrationAlert = ({
  level,
  absoluteWarnings,
  recommendations,
  faceDetected,
}) => {
  const [visible, setVisible] = useState(false);
  const timeout = useRef(null);
  useEffect(() => {
    if (absoluteWarnings.length > 0) {
      if (timeout.current) clearTimeout(timeout.current);
      setVisible(true);
      timeout.current = setTimeout(() => {
        setVisible(false);
      }, 500);
    } else {
      setVisible(false);
    }
  }, [absoluteWarnings, level, recommendations, faceDetected]);
  return (
    <div
      className={`fixed bottom-4 left-4 p-3 rounded-lg shadow-lg z-50 transition-all duration-1000 ${
        level === "low"
          ? "bg-red-100 border border-red-300 text-red-800"
          : "bg-yellow-100 border border-yellow-300 text-yellow-800"
      } ${visible ? "animate-in visible" : "animate-out invisible"}`}
    >
      <div className="font-semibold">
        집중도: {level === "low" ? "낮음" : "보통"}
      </div>

      {/* 절대적 경고 메시지 우선 표시 */}
      {absoluteWarnings.length > 0 && (
        <div className="mt-1">
          {absoluteWarnings.map((warning, index) => (
            <div key={index} className="text-sm font-medium text-red-600">
              ⚠️ {warning}
            </div>
          ))}
        </div>
      )}

      {/* 일반 정보 표시 */}
      {/* {focusRate !== undefined && (
      <div className="text-sm">
        시선 집중도: {focusRate.toFixed(1)}%
      </div>
    )} */}
      {faceDetected === false && absoluteWarnings.length === 0 && (
        <div className="text-sm text-red-600">⚠️ 카메라 앞에 앉아주세요</div>
      )}
      {recommendations.length > 0 && absoluteWarnings.length === 0 && (
        <div className="mt-1 text-sm">💡 {recommendations[0]}</div>
      )}
      <div className="mt-1 text-xs text-gray-500">
        💡 문제에 답하거나 화면을 터치하면 집중도가 개선됩니다
      </div>
    </div>
  );
};

export default ConcentrationAlert;
