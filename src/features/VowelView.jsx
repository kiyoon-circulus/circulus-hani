import React from "react";

const VowelView = ({ item }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="inline-block p-6 text-7xl font-bold rounded border">
        {item.letter}
      </div>
      <div className="text-lg">이름: {item.name}</div>
      <div className="text-lg">소리: {item.sound}</div>
      <div className="text-lg">
        예시: {item.example} {item.image}
      </div>
      <p className="font-semibold">"{item.letter}" 을 찾아보세요!</p>
    </div>
  );
};

export default VowelView;
