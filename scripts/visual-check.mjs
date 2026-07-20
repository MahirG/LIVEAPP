import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import Chromium from "@sparticuz/chromium";
import { chromium } from "playwright-core";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const executablePath = process.env.CHROMIUM_PATH ?? await Chromium.executablePath();

const artifacts = resolve("artifacts");
await mkdir(artifacts, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: [...Chromium.args, "--disable-dev-shm-usage"],
});

const failures = [];

async function inspectPage(page, label) {
  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(8000);
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "What's live now" }).waitFor();
  if (!(await page.getByRole("heading", { name: "What's live now" }).isVisible())) {
    failures.push(`${label}: home heading did not render`);
  }
  if (await page.locator("[data-nextjs-dialog]").count()) {
    failures.push(`${label}: Next.js error overlay detected`);
  }
  if (consoleErrors.length) failures.push(`${label}: ${consoleErrors.join(" | ")}`);
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const desktopPage = await desktop.newPage();
await inspectPage(desktopPage, "desktop");
await desktopPage.screenshot({
  path: resolve(artifacts, "home-desktop.png"),
  fullPage: true,
  animations: "disabled",
  timeout: 15000,
});

await Promise.all([
  desktopPage.waitForURL("**/live/addis-after-dark"),
  desktopPage.locator('a[href="/live/addis-after-dark"]').first().click(),
]);
await desktopPage.getByLabel("Chat message").waitFor({ timeout: 15000 });
if (!(await desktopPage.locator("aside").isVisible())) failures.push("live room: chat panel missing");

const likeButton = desktopPage.getByRole("button", { name: "Like stream" });
await likeButton.click();
if ((await likeButton.getAttribute("aria-pressed")) !== "true") failures.push("live room: like interaction failed");

await desktopPage.getByLabel("Chat message").fill("The first milestone looks great!");
await desktopPage.getByRole("button", { name: "Send message" }).click();
if (!(await desktopPage.getByText("The first milestone looks great!").isVisible())) failures.push("live room: chat send failed");
await desktopPage.screenshot({
  path: resolve(artifacts, "live-room-desktop.png"),
  animations: "disabled",
  timeout: 15000,
});

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const mobilePage = await mobile.newPage();
await inspectPage(mobilePage, "mobile");
if (!(await mobilePage.getByLabel("Go live").isVisible())) failures.push("mobile: primary navigation missing");
await mobilePage.screenshot({
  path: resolve(artifacts, "home-mobile.png"),
  fullPage: true,
  animations: "disabled",
  timeout: 15000,
});
await mobilePage.goto(`${baseUrl}/studio`, { waitUntil: "domcontentloaded" });
await mobilePage.getByRole("heading", { name: "Ready when you are." }).waitFor();
if (!(await mobilePage.getByRole("heading", { name: "Ready when you are." }).isVisible())) failures.push("studio: heading missing");
await mobilePage.screenshot({
  path: resolve(artifacts, "studio-mobile.png"),
  fullPage: true,
  animations: "disabled",
  timeout: 15000,
});
if (browser.isConnected()) await browser.close();

if (failures.length) {
  console.error(JSON.stringify({ status: "failed", failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "passed",
  checks: ["desktop home", "desktop live room", "like interaction", "chat interaction", "mobile home", "mobile studio"],
  screenshots: ["artifacts/home-desktop.png", "artifacts/live-room-desktop.png", "artifacts/home-mobile.png", "artifacts/studio-mobile.png"],
}, null, 2));
