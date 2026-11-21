# Kế hoạch xây dựng web học tiếng Trung (chinese-self)

Trang web tự học tiếng Trung cho người Việt, đi theo lộ trình:
**Pinyin & thanh điệu → Bộ thủ & chữ Hán → Từ vựng/ngữ pháp theo HSK → Ôn tập hằng ngày**,
tận dụng âm **Hán Việt** làm điểm khác biệt chính.

---

## 1. Mục tiêu & phạm vi

- Người dùng chính: bản thân (self-learning), có thể mở rộng cho người khác sau.
- Học được hoàn toàn trên trình duyệt, dùng tốt trên điện thoại (PWA, offline).
- Không cần backend ở giai đoạn đầu: dữ liệu học là file JSON tĩnh, tiến độ lưu ở IndexedDB.
- Mỗi ngày mở web → biết ngay hôm nay cần ôn gì, học gì (≈ 30–60 phút).

## 2. Công nghệ đề xuất

| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| Framework | Vite + React + TypeScript | Nhẹ, build tĩnh, dễ deploy |
| Styling | Tailwind CSS | Nhanh, responsive dễ |
| Routing | React Router | |
| Lưu tiến độ | IndexedDB (qua Dexie.js) | Offline, dung lượng lớn |
| Lặp lại ngắt quãng | `ts-fsrs` (thuật toán FSRS) | Hiện đại hơn SM-2 của Anki cũ |
| Phát âm | Web Speech API (`zh-CN`) giai đoạn đầu; sau đó file audio | Miễn phí, không cần server |
| Ghi âm / so giọng | MediaRecorder + phân tích pitch (giai đoạn sau) | Luyện thanh điệu |
| PWA | `vite-plugin-pwa` | Cài lên điện thoại, dùng offline |
| Test | Vitest + Playwright | |
| Deploy | GitHub Pages (GitHub Actions) | Miễn phí, repo đã có sẵn |

## 3. Nguồn dữ liệu (cần kiểm tra license trước khi dùng)

- **Danh sách từ HSK 3.0**: repo mã nguồn mở `complete-hsk-vocabulary` (có pinyin, nghĩa tiếng Anh).
- **Từ điển**: CC-CEDICT (CC BY-SA 4.0) → ghi nguồn rõ ràng.
- **Âm Hán Việt**: cần tìm nguồn có license phù hợp (ví dụ các bảng Hán Việt mở trên GitHub);
  nếu không có thì tự bổ sung dần cho từ HSK 1–3.
- **Nghĩa tiếng Việt, Hán Việt, câu ví dụ**: AI soạn, có test tự động kiểm tra tính nhất quán.
- **Bộ thủ**: dữ liệu Make Me a Hanzi (phân tích thành phần chữ).
- **Câu ví dụ**: Tatoeba (CC BY 2.0 FR) hoặc tự viết.

Script trong `scripts/` sẽ tải, gộp và chuẩn hoá các nguồn thành `src/data/*.json`.

## 4. Mô hình dữ liệu (rút gọn)

```ts
type Word = {
  id: string;            // "hsk1-0001"
  hanzi: string;         // "学生"
  pinyin: string;        // "xuéshēng"
  hanViet?: string;      // "học sinh"
  meaningVi: string;     // "học sinh"
  hskLevel: 1 | 2 | 3 | 4 | 5 | 6;
  radicals?: string[];
  examples?: { zh: string; pinyin: string; vi: string }[];
};

type Lesson = {
  id: string;
  stage: "pinyin" | "hanzi" | "hsk";
  title: string;
  wordIds: string[];
  grammarPoints?: string[];
};

type CardState = { wordId: string; skill: "recognize" | "recall" | "listen" | "write"; fsrs: FSRSCard };
```

## 5. Tính năng theo module (bám lộ trình)

### Module 1 — Pinyin & thanh điệu
- Bảng pinyin tương tác: bấm vào thanh mẫu + vận mẫu → nghe phát âm.
- Bài 4 thanh + thanh nhẹ, quy tắc biến điệu (3+3, 不, 一).
- Bài tập nghe chọn thanh, nghe chọn âm (zh/z, ch/c, sh/s, j/q/x, ü).
- Mục "Lỗi người Việt hay mắc".
- (Sau) Ghi âm giọng mình, vẽ đường pitch cạnh mẫu.

### Module 2 — Bộ thủ & chữ Hán
- 50 bộ thủ phổ biến: nghĩa, âm Hán Việt, chữ ví dụ.
- Phân tích chữ thành bộ thủ để dễ nhớ mặt chữ (không luyện viết tay).

### Module 3 — Từ vựng & ngữ pháp HSK
- Danh sách bài học theo HSK 1 → 4, mỗi bài 10–15 từ.
- Thẻ từ: chữ Hán, pinyin, **Hán Việt**, nghĩa, câu ví dụ, nút nghe.
- Điểm ngữ pháp kèm so sánh với tiếng Việt (định ngữ, trạng ngữ, 了, 把, 被, bổ ngữ…).
- Bài tập: chọn nghĩa, chọn chữ, nghe chọn từ, sắp xếp câu, gõ pinyin.

### Module 4 — Ôn tập hằng ngày (trái tim của app)
- Dashboard "Hôm nay": số thẻ cần ôn + bài mới gợi ý.
- Ôn bằng FSRS với 3 kỹ năng: nhận diện (chữ → nghĩa), nhớ lại (nghĩa → gõ chữ/pinyin), nghe (nghe → gõ).
- Streak, heatmap số ngày học, thống kê số từ đã thuộc theo cấp HSK.

### Tiện ích
- Tra cứu từ (chữ Hán / pinyin / Hán Việt / tiếng Việt).
- Xuất/nhập tiến độ ra file JSON (backup, chuyển máy).
- Chế độ tối.

## 6. Cấu trúc thư mục dự kiến

```
chinese-self/
├── scripts/            # tải & chuẩn hoá dữ liệu
├── public/             # icon, audio (sau)
├── src/
│   ├── data/           # words.json, lessons.json, radicals.json, grammar/
│   ├── db/             # Dexie schema, lưu tiến độ
│   ├── srs/            # bọc ts-fsrs
│   ├── features/
│   │   ├── pinyin/
│   │   ├── hanzi/
│   │   ├── lessons/
│   │   ├── review/
│   │   └── dictionary/
│   ├── components/     # UI dùng chung (WordCard, AudioButton, Quiz…)
│   └── App.tsx
└── .github/workflows/deploy.yml
```

## 7. Lộ trình triển khai

| Giai đoạn | Nội dung | Kết quả |
|---|---|---|
| **0. Khởi tạo** (1–2 ngày) | Vite + React + TS + Tailwind, ESLint, Vitest, deploy GitHub Pages | Trang trống chạy online |
| **1. Dữ liệu** (3–5 ngày) | Script import HSK 1–2, CC-CEDICT, Hán Việt; schema JSON; nghĩa Việt cho HSK 1 | `words.json` HSK 1 hoàn chỉnh |
| **2. MVP – Pinyin** (1 tuần) | Bảng pinyin, bài thanh điệu, quiz nghe | Học xong được giai đoạn 1 của lộ trình |
| **3. MVP – Từ vựng + SRS** (1–2 tuần) | Bài học HSK 1, thẻ từ, quiz, FSRS, dashboard "Hôm nay", lưu IndexedDB | **Dùng hằng ngày được** |
| **4. Chữ Hán** (1 tuần) | Bộ thủ, phân tích chữ | |
| **5. Ngữ pháp & mở rộng** (2 tuần) | Điểm ngữ pháp HSK 1–2, bài sắp xếp câu, HSK 2 | |
| **6. PWA & tiện ích** (1 tuần) | Offline, cài app, tra từ, backup, thống kê | |
| **7. Nâng cao** (tuỳ) | Ghi âm so pitch, HSK 3–4, đọc truyện phân cấp,  | |

**Mốc quan trọng:** hết giai đoạn 3 (~3–4 tuần) đã có app học HSK 1 dùng mỗi ngày;
các giai đoạn sau vừa học vừa làm.

## 8. Quyết định đã chốt (21/11/2026)

1. **Chỉ dùng cho bản thân** → không tài khoản, không đồng bộ cloud.
2. **Không server, lưu local** → IndexedDB + xuất/nhập file JSON để backup. Stack: Vite + React + TS.
3. **Nội dung do AI soạn** (nghĩa Việt, Hán Việt, câu ví dụ) → kèm test tự động kiểm tra
   số âm tiết pinyin / số âm Hán Việt khớp số chữ Hán, định dạng thanh điệu hợp lệ.
4. **Chỉ nhận mặt chữ + gõ phím** → bỏ luyện viết tay / hanzi-writer.
   Bài tập gõ chấp nhận: chữ Hán (bộ gõ hệ thống), pinyin có số thanh (`xue2sheng`),
   pinyin có dấu, hoặc pinyin không dấu (khi đó không chấm thanh điệu).
