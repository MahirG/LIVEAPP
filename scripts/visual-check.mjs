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

const streamResponse = await desktopPage.request.post(`${baseUrl}/api/streams`, {
  data: { title: "Browser verification live", topic: "Technology", language: "English" },
});
const streamResult = await streamResponse.json();
const healthResponse = await desktopPage.request.get(`${baseUrl}/api/health`);
const healthResult = await healthResponse.json();
const expectedMode = healthResult.mode;
if (
  healthResponse.status() !== 200
  || healthResult.status !== "ok"
  || !["demo", "connected"].includes(expectedMode)
  || healthResult.services?.application !== "healthy"
) {
  failures.push("health endpoint: readiness check failed");
}
if (expectedMode === "demo") {
  if (streamResponse.status() !== 201 || streamResult.mode !== "demo" || !streamResult.stream?.id) {
    failures.push("stream lifecycle: demo preflight API failed");
  }
} else if (streamResponse.status() !== 401 || !streamResult.error) {
  failures.push("stream lifecycle: connected API did not protect anonymous creation");
}

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
await desktopPage.goto(`${baseUrl}/auth`, { waitUntil: "domcontentloaded" });
await desktopPage.getByRole("heading", { name: "Show up as yourself. Stay in control." }).waitFor();
if (expectedMode === "connected") {
  await desktopPage.getByLabel("Email address").waitFor();
  if (!(await desktopPage.getByRole("button", { name: "Email me a secure link" }).isVisible())) {
    failures.push("auth: connected passwordless form missing");
  }
} else if (!(await desktopPage.getByText("Backend connection ready").isVisible())) {
  failures.push("auth: unconfigured setup state missing");
}
await desktopPage.screenshot({
  path: resolve(artifacts, "auth-desktop.png"),
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
  mode: expectedMode,
  checks: ["desktop home", "health endpoint", "stream preflight API", "desktop live room", "like interaction", "chat interaction", "auth setup", "mobile home", "mobile studio"],
  screenshots: ["artifacts/home-desktop.png", "artifacts/live-room-desktop.png", "artifacts/auth-desktop.png", "artifacts/home-mobile.png", "artifacts/studio-mobile.png"],
}, null, 2));
