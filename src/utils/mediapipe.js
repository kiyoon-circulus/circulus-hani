// ---- mediapipe-umd-loader (compact) ----
const ensureScript = (id, src) =>
  new Promise((res, rej) => {
    let s = document.getElementById(id);
    if (s) {
      if (s.dataset.loaded === "1") return res();
      s.addEventListener("load", res, { once: true });
      s.addEventListener("error", rej, { once: true });
      return;
    }
    s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => {
      s.dataset.loaded = "1";
      res();
    };
    s.onerror = rej;
    document.head.appendChild(s);
  });

export const FACE_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/";
const CAM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/";
let faceCtorP, camCtorP;

export async function getFaceMeshCtor() {
  if (faceCtorP) return faceCtorP;
  faceCtorP = (async () => {
    await ensureScript("mp-face-mesh", FACE_BASE + "face_mesh.js"); // ← 파일명까지!
    const Ctor =
      window.FaceMesh && (window.FaceMesh.FaceMesh || window.FaceMesh);
    if (typeof Ctor !== "function") throw new Error("FaceMesh ctor not found");
    return Ctor;
  })();
  return faceCtorP;
}

export async function getCameraCtor() {
  if (camCtorP) return camCtorP;
  camCtorP = (async () => {
    await ensureScript("mp-camera-utils", CAM_BASE + "camera_utils.js");
    const Ctor =
      window.Camera || window.cameraUtils?.Camera || window.CameraUtils?.Camera;
    if (typeof Ctor !== "function") throw new Error("Camera ctor not found");
    return Ctor;
  })();
  return camCtorP;
}
