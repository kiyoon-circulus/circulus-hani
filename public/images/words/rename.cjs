#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const startDir = args.find((a) => a !== "--dry-run") || ".";

// 이미 퍼센트 인코딩된 문자열(%AB) 있는지 체크
const alreadyEncoded = (name) => /%[0-9A-Fa-f]{2}/.test(name);

// 같은 디렉토리에 중복 이름 있으면 -1, -2 ... 붙이기
function uniqueTarget(dir, base) {
  let ext = path.extname(base);
  let stem = path.basename(base, ext);
  let candidate = base;
  let n = 1;
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${stem}-${n}${ext}`;
    n++;
  }
  return candidate;
}

// 디렉토리를 깊이 우선 탐색하면서 이름 변경
function walkAndRename(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // 먼저 파일/폴더 안쪽부터 처리
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndRename(fullPath);
    }
  }

  // 이제 이 디렉토리 안 파일/폴더 이름 변경
  for (const entry of entries) {
    const oldPath = path.join(dir, entry.name);
    if (!fs.existsSync(oldPath)) continue; // 이미 rename된 경우

    if (alreadyEncoded(entry.name)) {
      console.log(`SKIP  : ${oldPath} (이미 퍼센트 인코딩 포함)`);
      continue;
    }

    const newBase = encodeURI(entry.name).replace(/^%/g, "");
    if (newBase === entry.name) continue; // 바뀔 필요 없음

    const targetBase = uniqueTarget(dir, newBase);
    const newPath = path.join(dir, targetBase);

    if (DRY_RUN) {
      console.log(`RENAME: ${oldPath}\n   --> ${newPath}`);
    } else {
      fs.renameSync(oldPath, newPath);
      console.log(`RENAMED: ${oldPath} -> ${newPath}`);
    }
  }
}

walkAndRename(startDir);
