// Kiểm thử nhanh luồng chính: học bài 1 → làm quiz → ôn tập có gõ phím.
// Chạy: npm run build && npm run preview (terminal khác) rồi npm run e2e
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:4173/chinese-self/";
const OUT = process.env.OUT ?? "e2e/.out";
await import("node:fs").then((fs) => fs.mkdirSync(OUT, { recursive: true }));
const browser = await chromium.launch({ channel: "chrome" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(BASE);
await page.getByText("Hôm nay học gì?").waitFor();
await page.screenshot({ path: `${OUT}/01-home.png`, fullPage: true });

await page.goto(BASE + "#/roadmap");
await page.getByText("Bạn đang ở", { exact: true }).waitFor();
await page.screenshot({ path: `${OUT}/01b-roadmap.png`, fullPage: true });

await page.goto(BASE + "#/pinyin");
await page.getByText("Nghe 4 thanh của cùng một âm").waitFor();
await page.screenshot({ path: `${OUT}/02-pinyin.png`, fullPage: true });

await page.goto(BASE + "#/lessons/hsk1-01");
await page.screenshot({ path: `${OUT}/03-lesson.png`, fullPage: true });
await page.getByRole("link", { name: "Bắt đầu học" }).click();
for (let i = 0; i < 17; i++) await page.keyboard.press("ArrowRight");
await page.screenshot({ path: `${OUT}/04-quiz.png`, fullPage: true });

// Làm quiz: luôn chọn đáp án đúng bằng cách đọc câu hỏi
let guard = 0;
while (!(await page.getByText("Hoàn thành bài học!").isVisible()) && guard++ < 200) {
  await page.locator("button.card").first().click();
  await page.getByRole("button", { name: /Tiếp tục/ }).click();
}
await page.getByText(/Đã thêm \d+ thẻ/).waitFor();
console.log("lesson done:", await page.getByText(/Đã thêm \d+ thẻ/).textContent());

await page.getByRole("link", { name: "Ôn tập ngay" }).click();
await page.getByText(/Còn lại/).waitFor();
await page.screenshot({ path: `${OUT}/05-review.png`, fullPage: true });

// Ôn 6 thẻ: thẻ gõ thì gõ sai rồi chấm theo gợi ý, thẻ nhận diện thì lật và chấm Nhớ
for (let i = 0; i < 6; i++) {
  const input = page.locator("input[placeholder^='vd:']");
  if (await input.isVisible()) {
    await input.fill("xue2sheng");
    await input.press("Enter");
  } else {
    await page.getByRole("button", { name: /Hiện đáp án/ }).click();
  }
  if (i === 0) await page.screenshot({ path: `${OUT}/06-answer.png`, fullPage: true });
  await page.getByRole("button", { name: /^Nhớ/ }).click();
  await page.waitForTimeout(150);
}
console.log("review status:", await page.getByText(/Đã ôn:/).textContent(), await page.getByText(/Còn lại/).textContent());

await page.goto(BASE + "#/dict");
await page.locator("input").fill("hoc sinh");
await page.screenshot({ path: `${OUT}/07-dict.png`, fullPage: true });
console.log("dict results:", await page.getByText(/kết quả/).textContent());

await page.goto(BASE);
await page.getByText("Hôm nay học gì?").waitFor();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/08-home-after.png`, fullPage: true });

await page.goto(BASE + "#/roadmap");
await page.getByText("Bạn đang ở", { exact: true }).waitFor();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/08b-roadmap-after.png`, fullPage: true });
await page.goto(BASE);
await page.getByRole("button", { name: "Xem lịch hoàn thành" }).click();
await page.getByText("Chuỗi ngày hoàn thành").waitFor();
await page.screenshot({ path: `${OUT}/10-calendar.png` });
await page.keyboard.press("Escape");

await page.setViewportSize({ width: 1200, height: 900 });
await page.emulateMedia({ colorScheme: "dark" });
await page.screenshot({ path: `${OUT}/09-home-desktop-dark.png`, fullPage: true });

console.log("errors:", errors.length ? errors : "none");
await browser.close();
