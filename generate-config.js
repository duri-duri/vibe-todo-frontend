/**
 * .env 파일을 읽어 브라우저용 config.js 생성
 * 실행: node generate-config.js
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const outPath = path.join(__dirname, 'config.js');

const defaultEnv = {
  API_BASE: 'http://localhost:5000',
};

let env = { ...defaultEnv };

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(function (line) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (key) env[key] = value;
      }
    }
  });
}

const js = '// 자동 생성됨 (node generate-config.js)\nwindow.__ENV = ' + JSON.stringify(env, null, 2) + ';\n';
fs.writeFileSync(outPath, js, 'utf8');
console.log('config.js created. API_BASE =', env.API_BASE);
