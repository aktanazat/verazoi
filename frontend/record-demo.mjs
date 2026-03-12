import { chromium } from "playwright";
import { execSync } from "child_process";
import { mkdirSync, readdirSync, unlinkSync, rmdirSync } from "fs";
import { join } from "path";

const FRAMES_DIR = join(process.cwd(), "_frames");
const OUTPUT = join(process.cwd(), "demo.mp4");
const WIDTH = 390;
const HEIGHT = 844;
const FPS = 16;

// clean up old frames
try {
  readdirSync(FRAMES_DIR).forEach((f) => unlinkSync(join(FRAMES_DIR, f)));
  rmdirSync(FRAMES_DIR);
} catch {}
mkdirSync(FRAMES_DIR, { recursive: true });

let frame = 0;
const pad = (n) => String(n).padStart(5, "0");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

async function capture() {
  await page.screenshot({ path: join(FRAMES_DIR, `frame_${pad(frame++)}.png`) });
}

async function hold(seconds) {
  const count = Math.round(seconds * FPS);
  for (let i = 0; i < count; i++) await capture();
}

async function smoothScroll(targetY, stepPx = 8, pauseMs = 50) {
  let current = await page.evaluate(() => window.scrollY);
  const direction = targetY > current ? 1 : -1;
  while ((direction === 1 && current < targetY) || (direction === -1 && current > targetY)) {
    current = direction === 1
      ? Math.min(current + stepPx, targetY)
      : Math.max(current - stepPx, targetY);
    await page.evaluate((y) => window.scrollTo(0, y), current);
    await page.waitForTimeout(pauseMs);
    await capture();
  }
}

// --- 1. Landing page ---
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await hold(2);

// scroll down to phone mockup area
const landingScrollTarget = await page.evaluate(() => Math.min(document.body.scrollHeight - window.innerHeight, 800));
await smoothScroll(landingScrollTarget);
await hold(1.5);

// --- 2. Login page ---
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await hold(1);

// fill the form
await page.locator('input[type="email"]').click();
await page.waitForTimeout(200);
await page.locator('input[type="email"]').fill("alex@verazoi.com");
await capture();
await page.waitForTimeout(300);

await page.locator('input[type="password"]').click();
await page.waitForTimeout(200);
await page.locator('input[type="password"]').fill("password123");
await capture();
await hold(1);

// click sign in
await page.locator('button[type="submit"]').click();
await page.waitForTimeout(1500);
await hold(1);

// --- 3. Dashboard ---
await page.waitForTimeout(500);
await hold(2);

// scroll dashboard to see all content
const dashScrollMax = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
await smoothScroll(Math.min(dashScrollMax, 600));
await hold(2);
await smoothScroll(dashScrollMax);
await hold(2);

// --- 4. Meals tab ---
await page.locator('a[href="/app/meals"]').click();
await page.waitForTimeout(800);
await hold(1);

// select Lunch
await page.locator('button:text("Lunch")').click();
await page.waitForTimeout(300);
await capture();

// tap some food tags
for (const food of ["Chicken", "Rice", "Salad"]) {
  await page.locator(`button:text("${food}")`).click();
  await page.waitForTimeout(250);
  await capture();
}
await hold(2);

// --- 5. Activity tab ---
await page.locator('a[href="/app/activity"]').click();
await page.waitForTimeout(800);
await hold(1);

// select Running
await page.locator('button:text("Running")').click();
await page.waitForTimeout(300);
await capture();

// select Intense
await page.locator('button:text("Intense")').click();
await page.waitForTimeout(300);
await capture();
await hold(1.5);

// --- 6. Back to Dashboard ---
await page.locator('a[href="/app/dashboard"]').click();
await page.waitForTimeout(1000);
await hold(2);

await browser.close();

console.log(`Captured ${frame} frames. Converting to MP4...`);

execSync(
  `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%05d.png" ` +
    `-vf "scale=${WIDTH}:${HEIGHT}:flags=lanczos" ` +
    `-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p ` +
    `"${OUTPUT}"`,
  { stdio: "inherit" }
);

console.log(`Done! Video saved to: ${OUTPUT}`);

// clean up frames
readdirSync(FRAMES_DIR).forEach((f) => unlinkSync(join(FRAMES_DIR, f)));
rmdirSync(FRAMES_DIR);
