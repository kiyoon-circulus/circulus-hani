import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";

export default function SeniorLayout() {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      {/** 해상도 크기 고정 */}
      <div
        className="bg-white shadow-2xl overflow-auto"
        style={{
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
