/**
 * デモHTMLアニメーションを録画して videos/*.mp4 + ポスター画像を生成する。
 *
 * 使い方:  cd assets-src && node record-demos.mjs
 *
 * - Playwright の recordVideo で webm を録画
 * - ffmpeg-static で H.264 mp4 に変換 (+ poster jpg 抽出)
 * - Chromium はコンテナ同梱の /opt/pw-browsers/chromium-1194 を使用
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, renameSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ffmpegPath from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "videos");
const tmpDir = join(__dirname, ".video-tmp");

const CHROMIUM =
  process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const allDemos = [
  {
    file: "demo-knowledge-agent.html",
    name: "demo-knowledge-agent",
    durationMs: 17500,
    posterAtSec: 15,
  },
  {
    file: "demo-backoffice-automation.html",
    name: "demo-backoffice-automation",
    durationMs: 16500,
    posterAtSec: 14.5,
  },
  {
    file: "demo-ai-driven-dev.html",
    name: "demo-ai-driven-dev",
    durationMs: 16500,
    posterAtSec: 14.5,
  },
  {
    file: "demo-seo-article.html",
    name: "demo-seo-article",
    durationMs: 18500,
    posterAtSec: 17,
  },
  {
    file: "demo-mail-triage.html",
    name: "demo-mail-triage",
    durationMs: 18500,
    posterAtSec: 16.5,
  },
  {
    file: "demo-weekly-report.html",
    name: "demo-weekly-report",
    durationMs: 15500,
    posterAtSec: 14,
  },
];

// 引数でデモ名を渡すとそれだけ録画する:  node record-demos.mjs demo-mail-triage ...
const targets = process.argv.slice(2);
const demos = targets.length > 0 ? allDemos.filter((d) => targets.includes(d.name)) : allDemos;

mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROMIUM,
  args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"],
});

for (const demo of demos) {
  console.log(`\n▶ recording ${demo.name} (${demo.durationMs}ms)`);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: tmpDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  await page.goto(`file://${join(__dirname, demo.file)}`);
  await page.waitForTimeout(demo.durationMs);
  const video = page.video();
  await context.close();

  const webmPath = await video.path();
  const rawWebm = join(tmpDir, `${demo.name}.webm`);
  renameSync(webmPath, rawWebm);

  const mp4Path = join(outDir, `${demo.name}.mp4`);
  const posterPath = join(outDir, `${demo.name}-poster.jpg`);

  // webm (vp8) → H.264 mp4。UIアニメはほぼ静止画なので CRF 高めでも十分綺麗
  execFileSync(ffmpegPath, [
    "-y", "-i", rawWebm,
    "-c:v", "libx264", "-preset", "slow", "-crf", "28",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-an",
    mp4Path,
  ], { stdio: "pipe" });

  // ポスター画像 (再生前のサムネイル)
  execFileSync(ffmpegPath, [
    "-y", "-ss", String(demo.posterAtSec), "-i", mp4Path,
    "-frames:v", "1", "-q:v", "4",
    posterPath,
  ], { stdio: "pipe" });

  const mp4Kb = Math.round(statSync(mp4Path).size / 1024);
  const posterKb = Math.round(statSync(posterPath).size / 1024);
  console.log(`  ✓ ${mp4Path} (${mp4Kb} KB)`);
  console.log(`  ✓ ${posterPath} (${posterKb} KB)`);
}

await browser.close();
rmSync(tmpDir, { recursive: true, force: true });
console.log("\nDone.");
