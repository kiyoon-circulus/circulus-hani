import { useEffect, useState } from "react";

const Letters = ({ letter, n, className, noBorder }) => {
  const [textSize, setTextSize] = useState("text-len1");
  useEffect(() => {
    switch (n) {
      case 3:
        setTextSize("text-9xl");
        break;
      case 4:
        setTextSize("text-8xl");
        break;
      case 5:
        setTextSize("text-7xl");
        break;
      case 6:
        setTextSize("text-5xl");
        break;
      default:
        setTextSize("text-len1");
        break;
    }
  }, [n]);
  return (
    <div
      className={`font-extrabold text-center rounded-lg nanum-gothic-extrabold ${
        !noBorder && "border-2 border-letter"
      } ${className} ${textSize}`}
    >
      {letter}
    </div>
  );
};

export default Letters;
