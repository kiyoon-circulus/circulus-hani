export const COLORS = {
  vowel: "lime",
  consonant: "rose",
  letter: "blue",
  word: "slate",
  read: "amber",
  listen: "teal",
  speak: "blue",
  write: "rose",
};

export const TARGETS = {
  vowel: "모음",
  consonant: "자음",
  letter: "글자",
  word: "낱말",
};

export const METHODS = {
  read: "읽기",
  listen: "듣기",
  speak: "말하기",
  write: "쓰기",
};

export const JOSA = () => {
  const _f = [
      function (string) {
        //을/를 구분
        return _hasJong(string) ? "을" : "를";
      },
      function (string) {
        //은/는 구분
        return _hasJong(string) ? "은" : "는";
      },
      function (string) {
        //이/가 구분
        return _hasJong(string) ? "이" : "가";
      },
    ],
    _formats = {
      "을/를": _f[0],
      을: _f[0],
      를: _f[0],
      을를: _f[0],
      "은/는": _f[1],
      은: _f[1],
      는: _f[1],
      은는: _f[1],
      "이/가": _f[2],
      이: _f[2],
      가: _f[2],
      이가: _f[2],
    };

  function _hasJong(string) {
    //string의 마지막 글자가 받침을 가지는지 확인
    if (!string) return false;
    string = string.charCodeAt(string.length - 1);
    return (string - 0xac00) % 28 > 0;
  }

  function c(word, format) {
    if (typeof _formats[format] === "undefined") throw "Invalid format!";
    return _formats[format](word);
  }

  return {
    c,
    r: function (word, format) {
      return word + c(word, format);
    },
  };
};

export const getPrevPath = (pathname, prev = -1) => {
  const segments = pathname.split("/").filter(Boolean);
  const parentSegments = segments.slice(0, prev);
  return "/" + parentSegments.join("/");
};

export const getTimeText = (m) => {
  const minutes = Number(m);
  const hours = Math.round(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  const formattedMinutes =
    remainingMinutes > 9
      ? remainingMinutes.toString().padStart(2, "0")
      : remainingMinutes;
  return hours ? `${hours}시간 ${formattedMinutes}분` : `${formattedMinutes}분`;
};
