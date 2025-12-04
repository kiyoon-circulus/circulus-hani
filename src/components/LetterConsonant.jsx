const LetterConsonant = ({ letter, className }) => {
  return (
    <div
      className={`font-extrabold text-center rounded-lg border-2 nanum-gothic-extrabold border-consonant ${className}`}
    >
      {letter}
    </div>
  );
};

export default LetterConsonant;
