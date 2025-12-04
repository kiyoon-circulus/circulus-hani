import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";

export default function SeniorLayout() {
  const scaleFactor = 960 / 1024;
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      {/** 해상도 크기 고정 */}
      <div
        className="w-[1024px] h-[600px] max-w-[1024px] max-h-[600px] bg-white shadow-2xl h-[min(100vh,600px)] mx-auto overflow-auto relative"
        style={{
          transform: `scale(${scaleFactor})`,
          transformOrigin: "center",
        }}
      >
        <Outlet />
      </div>
      <Toaster
        toastOptions={{
          duration: 1500,
          style: {
            background: "transparent",
            marginTop: "calc(90vh/2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "none",
          },
        }}
      />
      <audio id="correct-audio" src="/sounds/correct.mp3" preload="auto" />
      <audio id="wrong-audio" src="/sounds/wrong.mp3" preload="auto" />
      <audio id="complete-audio" src="/sounds/completed.mp3" preload="auto" />
    </div>
  );
}
