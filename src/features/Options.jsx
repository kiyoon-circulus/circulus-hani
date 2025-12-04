import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import colors from "tailwindcss/colors";

const Options = ({
  id,
  correctAnswer,
  options,
  onSelect,
  color,
  enabled,
  currentItemIndex,
}) => {
  const WRONG_STATE = "border-4 border-red-400 bg-red-50";
  const CORRECT_STATE = `bg-${color}-500 text-white`;
  const location = useLocation();

  const [selected, setSelected] = useState(null);
  const isSenior = location.pathname.includes("/senior") || false;
  const submitted = useRef(false);
  const handleClick = (choice) => {
    submitted.current = true;
    setSelected(choice);
    onSelect(choice);
  };

  useEffect(() => {
    submitted.current = false;
    setSelected(null);
  }, [options, currentItemIndex]);

  return (
    <div className="grid col-span-3 grid-rows-3 gap-4 h-full">
      {id &&
        options.length > 0 &&
        options.map((choice, idx) => (
          <button
            key={`${id}-${idx}`}
            onClick={() => handleClick(choice)}
            style={{
              "--hover-bg": colors[color]["200"],
              "--hover-border": colors[color]["500"],
            }}
            className={`bg-${color}-50 border-neutral-300 flex justify-center items-center p-2 w-full font-extrabold leading-none text-center rounded-lg border shadow-sm cursor-pointer ${
              selected === choice
                ? choice === correctAnswer
                  ? CORRECT_STATE
                  : WRONG_STATE
                : "disabled:saturate-0"
            } ${isSenior ? "text-5xl min-w-40" : "text-6xl min-w-64"}`}
            disabled={
              submitted.current || enabled === undefined
                ? selected !== null
                : !enabled
            }
          >
            {choice}
          </button>
        ))}
    </div>
  );
};

export default Options;
