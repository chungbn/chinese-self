// Kiểm thử chế độ tập trung: làm lần lượt các việc trong «Kế hoạch hôm nay».
// Chạy: npm run build && npm run preview (terminal khác) rồi node e2e/session.mjs
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:4173/chinese-self/";
const OUT = process.env.OUT ?? "e2e/.out";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const assert = (cond, msg) => {
  if (!cond) throw new Error("FAIL: " + msg);
  console.log("ok -", msg);
};
const planHeading = () => page.getByRole("heading", { name: "Kế hoạch hôm nay" });

// ---- Ngày 1: chủ đề pinyin → luyện nghe
await page.goto(BASE);
await planHeading().waitFor();
await page.getByRole("link", { name: /Học 4 thanh điệu/ }).click();
await page.getByRole("button", { name: "Đã học xong ✓" }).waitFor();
assert(page.url().includes("#/session/pinyin-topic"), "mở chế độ tập trung cho chủ đề pinyin");
assert(!(await page.getByRole("link", { name: "Bài học" }).isVisible()), "ẩn menu trong chế độ tập trung");
assert(!(await page.getByText("Thanh mẫu (phụ âm đầu)").isVisible()), "chỉ hiện nội dung 4 thanh");
await page.screenshot({ path: `${OUT}/s1-topic.png`, fullPage: true });
await page.getByRole("button", { name: "Đã học xong ✓" }).click();
await page.getByRole("link", { name: /Việc tiếp theo: Luyện nghe/ }).click();
await page.getByText("Nghe và chọn thanh điệu").waitFor();
assert(page.url().includes("#/session/pinyin-drill"), "chuyển sang việc luyện nghe");
assert(!(await page.getByRole("radio").first().isVisible().catch(() => false)), "không có nút đổi chế độ trong chế độ tập trung");
await page.screenshot({ path: `${OUT}/s2-drill.png`, fullPage: true });
for (let i = 0; i < 20; i++) {
  await page.locator("button.card").first().click();
  if (i < 19) await page.getByRole("button", { name: /Câu tiếp/ }).click();
}
await page.getByText(/Đủ 20 câu luyện nghe hôm nay/).waitFor();
assert(await page.getByText(/Đã xong mọi việc trong kế hoạch hôm nay/).isVisible(), "báo xong cả ngày sau việc cuối");
await page.screenshot({ path: `${OUT}/s3-drill-done.png`, fullPage: true });
await page.getByRole("link", { name: "Về kế hoạch hôm nay" }).last().click();
await planHeading().waitFor();
await page.waitForTimeout(500);
assert((await page.locator("text=/\\d+\\/\\d+ việc/").textContent()) === "2/2 việc", "trang chủ: 2/2 việc");

// ---- Giả lập ngày 3: có bài học
await page.evaluate(async () => {
  const db = await new Promise((res) => { const r = indexedDB.open("chinese-self"); r.onsuccess = () => res(r.result); });
  const tx = db.transaction("meta", "readwrite");
  const d = new Date(); d.setDate(d.getDate() - 2);
  tx.objectStore("meta").put({ key: "startedAt", value: d.toISOString() });
  await new Promise((r) => (tx.oncomplete = r));
});
await page.reload();
await planHeading().waitFor();
await page.getByRole("link", { name: /Học Bài 1/ }).click();
await page.getByRole("button", { name: "Học từ mới ›" }).waitFor();
assert(page.url().includes("#/session/lesson"), "mở bài học trong chế độ tập trung, bắt đầu bằng ngữ pháp");
await page.screenshot({ path: `${OUT}/s4-grammar.png`, fullPage: true });
await page.getByRole("button", { name: "Học từ mới ›" }).click();
for (let i = 0; i < 17; i++) await page.keyboard.press("ArrowRight");
let guard = 0;
while (!(await page.getByText("Hoàn thành bài học!").isVisible()) && guard++ < 200) {
  await page.locator("button.card").first().click();
  await page.getByRole("button", { name: /Tiếp tục/ }).click();
}
await page.getByText(/Đã thêm \d+ thẻ/).waitFor();
const next = page.getByRole("link", { name: /Việc tiếp theo:/ });
await next.waitFor({ timeout: 5000 }).catch(() => {});
await page.screenshot({ path: `${OUT}/s5-lesson-done.png`, fullPage: true });
assert(await next.isVisible(), "sau bài học có nút sang việc tiếp theo");
console.log("   next:", await next.innerText());
await page.screenshot({ path: `${OUT}/s5-lesson-done.png`, fullPage: true });
await next.click();
await page.waitForTimeout(500);
assert(/#\/session\/(review|pinyin-topic)/.test(page.url()), "nút đi tiếp mở đúng việc kế tiếp: " + page.url().split("#")[1]);
await page.screenshot({ path: `${OUT}/s6-next.png`, fullPage: true });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
if (errors.length) process.exit(1);
