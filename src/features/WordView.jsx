import React from "react";

const WordView = ({ item }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center items-center space-x-2 text-5xl">
        {item.syllables.map((syllable, idx) => (
          <span key={idx} className="p-4 rounded border">
            {syllable}
          </span>
        ))}
      </div>
      <div className="text-6xl">{item.image}</div>
      <div className="text-lg">
        낱말: {item.word} - {item.meaning}
      </div>
      <p className="font-semibold">"{item.word}" 을 찾아보세요!</p>
    </div>
  );
};

export default WordView;
