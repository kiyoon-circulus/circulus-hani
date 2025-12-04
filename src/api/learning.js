import { API_URL, VAPI_URL } from ".";

export const fetchLearningDataByTarget = async (type) => {
  try {
    const response = await fetch(`${API_URL()}/content?type=${type}`);

    if (!response.ok) {
      throw new Error("학습 데이터를 불러오는 데 실패했습니다.");
    }
    const res = await response.json();
    if (res?.result) {
      return res.data;
    }
    throw Error("학습 데이터를 불러오는 데 실패했습니다.");
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const fetchWriteOCR = async (isWord, body) => {
  try {
    const resp = await fetch(VAPI_URL(isWord), {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body,
    });
    const res = await resp.json();
    console.log("res", res);
    if (res.result && res.data.length) {
      return res.data[0];
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};
