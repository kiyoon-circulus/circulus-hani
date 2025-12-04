import React from "react";

const LearnByBase = ({
  title,
  progress,
  currentItemIndex,
  totalItems,
  currentRepeat,
  repeatGoal,
  timer,
  tutorMessage,
  children, // 방식별 주요 UI
  bottom, // 방식별 하단 UI(버튼 등)
}) => (
  <div className="p-6 mx-auto max-w-xl text-center">
    <h2 className="mb-2 text-2xl font-bold">{title}</h2>
    {progress !== undefined && (
      <div className="flex justify-center items-center mx-auto mb-2 w-24 h-24 text-lg font-bold rounded-full border-4 border-blue-500">
        {Math.round(progress)}%
      </div>
    )}
    <p className="mb-2 text-gray-600">
      문제 {currentItemIndex + 1}/{totalItems} | 반복 {currentRepeat}/
      {repeatGoal}
    </p>
    <p className="mb-4 text-gray-600">{timer}초 경과</p>
    <p className="mb-4 font-semibold text-blue-600">{tutorMessage}</p>
    {children}
    {bottom}
  </div>
);

export default LearnByBase;
