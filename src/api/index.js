import AUTH_DUMMY from "@/assets/dummy/AuthDummy";

console.log(
  import.meta.env.MODE,
  import.meta.env.VITE_APP_ENV,
  import.meta.env.VITE_API_URL
);

export const API_URL = () => import.meta.env.VITE_API_URL;
export const VAPI_URL = () => import.meta.env.VITE_VAPI_URL;
const FILE_URL = import.meta.env.VITE_FILE_URL;

export const encodeGetParams = (p) =>
  Object.entries(p)
    .map((kv) => kv.map(encodeURIComponent).join("="))
    .join("&");
// src/api/index.js
// ✅ localStorage 토큰 + 자동 refresh + 시그니처 유지(get/post/put/patch/delete)

export const post = async (route, data, headers = {}) => {
  const res = await fetch(`${API_URL()}/${route}`, {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    // HTTP 에러는 reject
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || res.statusText);
  }
  const json = await res.json();
  return json;
};

export const del = async (route, data = {}, headers = {}) => {
  try {
    const res = await fetch(`${API_URL()}/${route}`, {
      method: "DELETE",
      headers: {
        ...headers,
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { result: false, error };
  }
};

export const put = async (route, data, headers = {}) => {
  try {
    const res = await fetch(`${API_URL()}/${route}`, {
      method: "PUT",
      headers: {
        ...headers,
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { result: false, error };
  }
};

export const patch = async (route, data, headers = {}) => {
  try {
    const res = await fetch(`${API_URL()}/${route}`, {
      method: "PATCH",
      headers: {
        ...headers,
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json;
  } catch (error) {
    return { result: false, error };
  }
};

export const get = async (route, params, headers = {}, signal = false) => {
  try {
    const url = `${API_URL()}/${route}?${
      params ? encodeGetParams(params) : ""
    }`;
    // console.log(url);
    const res = await fetch(
      url,
      signal
        ? {
            method: "GET",
            headers: {
              ...headers,
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
            signal,
          }
        : {
            method: "GET",
            headers: {
              ...headers,
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
          }
    );
    const json = await res.json();
    return json;
  } catch (error) {
    return { result: false, error };
  }
};

async function auth({ token }) {
  try {
    const headers = {
      method: "GET",
      mode: "cors",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await fetch(`${API_URL()}/auth/check`, headers);
    const result = await res.json();
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getUserData = () =>
  new Promise((resolve) => {
    if (window.location.pathname === "/sign/out") return resolve(null);
    let token = window.localStorage.getItem("token");
    token = token ? JSON.parse(token) : null;
    if (!token) return resolve(null);
    const seniormode = window.localStorage.getItem('isSeniorMode');
    if(seniormode) {
      resolve(AUTH_DUMMY)
    } else {
      auth({ token }).then(({ result, data }) => {
        result ? resolve(data) : resolve(null);
      });
    }
  });

export const userSignIn = async (logindata) => {
  const result = await post("signin", logindata);
  if (result.result) return result.data;
  throw Error(result.error);
};

export const getAsset = ({ type, content }) => {
  return type && content
    ? `${FILE_URL}/asset?${encodeGetParams({ type, content })}`
    : `${FILE_URL}/asset?${encodeGetParams({ content })}`;
};
