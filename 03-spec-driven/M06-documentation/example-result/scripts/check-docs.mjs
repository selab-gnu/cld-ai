// 문서가 코드와 어긋나지 않았는지 검사한다. 외부 라이브러리 없이 동작한다.
//   1. 요구사항 추적: 구현된 요구사항(REQ-xxx)마다 테스트가 있는가
//   2. API 문서: 서버의 경로와 openapi.yaml의 경로가 같은가
//   3. ADR: 필수 섹션이 모두 있는가
//   4. 링크: 마크다운 문서 안의 상대 경로 링크가 실제 파일을 가리키는가
// 아직 만들지 않은 문서는 경고만 하고 넘어간다. 오류가 하나라도 있으면 종료 코드 1.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { routes } from "../src/app.js";

let errors = 0;
let warnings = 0;
const ok = (message) => console.log(`  · ${message}`);
const fail = (message) => {
  console.log(`  ✗ ${message}`);
  errors++;
};
const warn = (message) => {
  console.log(`  ! ${message}`);
  warnings++;
};

function listFiles(dir, predicate) {
  if (!existsSync(dir)) {
    return [];
  }
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === "node_modules" || name.startsWith(".") ? [] : listFiles(path, predicate);
    }
    return predicate(path) ? [path] : [];
  });
}

// 1. 요구사항 추적 -------------------------------------------------------
console.log("[1] 요구사항 추적 (docs/requirements.md ↔ test/)");
const REQ_FILE = "docs/requirements.md";
if (!existsSync(REQ_FILE)) {
  warn(`${REQ_FILE} 파일이 아직 없습니다. (2단계에서 만듭니다)`);
} else {
  // 표의 행: | REQ-001 | 요구사항 | 우선순위 | 상태 | ... |
  const rows = readFileSync(REQ_FILE, "utf8")
    .split("\n")
    .filter((line) => /^\|\s*REQ-\d{3}\s*\|/.test(line))
    .map((line) => line.split("|").map((cell) => cell.trim()));
  const testText = listFiles("test", (path) => path.endsWith(".js"))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
  const reqIds = new Set(rows.map((cells) => cells[1]));
  const testedIds = new Set(testText.match(/REQ-\d{3}/g) ?? []);

  for (const cells of rows) {
    const [, id, , , status] = cells;
    if (status === "구현됨" && !testedIds.has(id)) {
      fail(`${id} — 상태가 '구현됨'인데 검증하는 테스트가 없습니다.`);
    }
  }
  for (const id of testedIds) {
    if (!reqIds.has(id)) {
      fail(`${id} — 테스트에서 참조하지만 ${REQ_FILE}에 없는 ID입니다.`);
    }
  }
  const implemented = rows.filter((cells) => cells[4] === "구현됨").length;
  ok(`요구사항 ${rows.length}개 (구현됨 ${implemented}개), 테스트에서 참조 ${testedIds.size}개`);
}

// 2. API 문서 -------------------------------------------------------------
console.log("[2] API 문서 (src/app.js routes ↔ docs/api/openapi.yaml)");
const API_FILE = "docs/api/openapi.yaml";
if (!existsSync(API_FILE)) {
  warn(`${API_FILE} 파일이 아직 없습니다. (4단계에서 만듭니다)`);
} else {
  // paths: 아래의 "  /경로:"와 그 아래 "    get:" 같은 줄만 읽는 간단한 해석기
  const documented = new Set();
  let inPaths = false;
  let currentPath = null;
  for (const line of readFileSync(API_FILE, "utf8").split("\n")) {
    if (/^\S/.test(line)) {
      inPaths = line.startsWith("paths:");
      continue;
    }
    if (!inPaths) {
      continue;
    }
    const pathMatch = line.match(/^ {2}(\/\S*?):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      continue;
    }
    const methodMatch = line.match(/^ {4}(get|post|put|patch|delete):\s*$/);
    if (methodMatch && currentPath) {
      documented.add(`${methodMatch[1].toUpperCase()} ${currentPath}`);
    }
  }
  const implementedRoutes = new Set(routes.map((route) => `${route.method} ${route.path}`));
  for (const route of implementedRoutes) {
    if (!documented.has(route)) {
      fail(`${route} — 서버에는 있는데 API 문서에 없습니다.`);
    }
  }
  for (const route of documented) {
    if (!implementedRoutes.has(route)) {
      fail(`${route} — API 문서에는 있는데 서버에 없습니다.`);
    }
  }
  ok(`서버 경로 ${implementedRoutes.size}개, 문서 경로 ${documented.size}개`);
}

// 3. ADR ------------------------------------------------------------------
console.log("[3] 설계 결정 기록 (docs/adr/)");
const adrFiles = listFiles("docs/adr", (path) => /\/\d{4}-.+\.md$/.test(path));
if (adrFiles.length === 0) {
  warn("docs/adr/ 폴더에 ADR이 아직 없습니다. (3단계에서 만듭니다)");
} else {
  for (const path of adrFiles) {
    const text = readFileSync(path, "utf8");
    for (const section of ["## 상태", "## 배경", "## 결정", "## 결과"]) {
      if (!text.includes(section)) {
        fail(`${path} — '${section}' 섹션이 없습니다.`);
      }
    }
  }
  ok(`ADR ${adrFiles.length}개`);
}

// 4. 링크 -----------------------------------------------------------------
console.log("[4] 문서 링크");
const markdownFiles = [
  ...["README.md", "CHANGELOG.md"].filter((path) => existsSync(path)),
  ...listFiles("docs", (path) => path.endsWith(".md")),
];
let linkCount = 0;
for (const file of markdownFiles) {
  const text = readFileSync(file, "utf8");
  for (const [, target] of text.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
    if (/^[a-z]+:/i.test(target)) {
      continue; // http:, https:, mailto: 등 외부 링크는 검사하지 않는다
    }
    linkCount++;
    const resolved = join(dirname(file), decodeURIComponent(target));
    if (!existsSync(resolved)) {
      fail(`${file} → ${target} (파일 없음: ${relative(".", resolved)})`);
    }
  }
}
ok(`마크다운 ${markdownFiles.length}개, 상대 링크 ${linkCount}개`);

// 결과 --------------------------------------------------------------------
console.log(`\n오류 ${errors}개, 경고 ${warnings}개`);
process.exitCode = errors > 0 ? 1 : 0;
