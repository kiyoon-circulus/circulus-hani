import React from "react";

const SyllableView = ({ item }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center items-center space-x-4 text-5xl">
        <span className="p-4 rounded border">{item.consonant}</span>
        <span>+</span>
        <span className="p-4 rounded border">{item.vowel}</span>
        <span>=</span>
        <span className="p-4 text-7xl font-bold bg-green-100 rounded border">
          {item.result}
        </span>
      </div>
      <div className="text-lg">
        의미: {item.meaning} {item.image}
      </div>
      <p className="font-semibold">"{item.result}" 를 찾아보세요!</p>
    </div>
  );
};

export default SyllableView;
