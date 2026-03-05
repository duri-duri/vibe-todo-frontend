/**
 * Vercel/CI 환경변수(API_BASE)로 브라우저용 dist/config.js 생성
 * 실행: node generate-config.js
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "dist");
const outPath = path.join(distDir, "config.js");

// Vercel에서는 .env 파일이 아니라 process.env를 사용
const API_BASE = process.env.API_BASE || "http://localhost:5000";

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const env = { API_BASE };
const js =
  "// 자동 생성됨 (node generate-config.js)\n" +
  "window.__ENV = " +
  JSON.stringify(env, null, 2) +
  ";\n";

fs.writeFileSync(outPath, js, "utf8");
console.log("dist/config.js created. API_BASE =", API_BASE);