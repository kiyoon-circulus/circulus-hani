import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";

const LearnLayout = () => {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div
        className={`flex flex-col flex-grow justify-center items-center w-full h-full shadow-2xl backdrop-blur-sm tb-lg:rounded-3xl bg-white/90 tb-lg:h-[800px] tb-lg:max-w-[1200px]`}
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
};

export default LearnLayout;
