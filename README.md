# chinese-self — Tự học tiếng Trung

Web app cá nhân để học tiếng Trung từ đầu, dành cho người Việt:
**Pinyin & thanh điệu → Từ vựng/ngữ pháp HSK → Ôn tập hằng ngày (FSRS)**. Thẻ từ nào cũng có âm **Hán Việt**.

- Không server: toàn bộ tiến độ lưu trong IndexedDB của trình duyệt. Có thể xuất/nhập file JSON để sao lưu.
- Cài được lên điện thoại (PWA) và dùng offline.
- Phát âm bằng giọng đọc có sẵn của máy (Web Speech API).
- Ôn tập 3 kỹ năng: nhận mặt chữ, nhớ nghĩa rồi gõ, nghe rồi gõ. Gõ được chữ Hán, `xue2sheng`, `xuésheng` hoặc `xuesheng`.

Kế hoạch chi tiết: [PLAN.md](PLAN.md)

## Chạy

```bash
npm install
npm run dev        # http://localhost:5173/chinese-self/
npm test           # unit test + kiểm tra dữ liệu từ vựng
npm run build && npm run preview   # bản production
npm run e2e        # smoke test bằng Playwright (cần preview đang chạy)
```

Push lên `main` sẽ tự deploy lên GitHub Pages (`.github/workflows/deploy.yml`).

## Cấu trúc

```
src/data/        dữ liệu: hsk1.ts (298 từ, 20 bài), pinyin.ts, sources/ (danh sách HSK gốc để đối chiếu)
src/lib/         pinyin (định dạng, chấm câu trả lời gõ), tts, shuffle
src/db/          Dexie schema + thao tác (hoàn thành bài, chấm thẻ, sao lưu)
src/srs/         bọc ts-fsrs (FSRS-6)
src/pages/       Home, PinyinPage, Lessons, LessonDetail, LessonLearn, Review, Dictionary, Settings
```

## Dữ liệu

HSK 1 bám theo danh sách HSK 3.0 bản 2025 (lấy từ [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary), giấy phép MIT); test kiểm tra đủ từ và pinyin khớp danh sách gốc.
Nghĩa tiếng Việt, âm Hán Việt và câu ví dụ do AI soạn. `src/data/data.test.ts` tự động kiểm tra
số âm tiết pinyin và số âm Hán Việt có khớp số chữ Hán không, mỗi âm tiết có đúng định dạng và tối đa một dấu thanh.
Thêm từ mới: thêm bài vào `RAW` trong file dữ liệu tương ứng, rồi chạy `npm test`.
