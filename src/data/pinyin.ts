/** Dữ liệu cho module Pinyin & thanh điệu. Mỗi âm kèm một chữ Hán để máy đọc (TTS) phát âm đúng thanh. */

export type ToneSet = { syllable: string; chars: [string, string, string, string]; py: [string, string, string, string] };

/** Bộ 4 thanh của cùng một âm tiết — mỗi chữ đều là cách đọc phổ biến nhất của nó. */
export const TONE_SETS: ToneSet[] = [
  { syllable: "ma", chars: ["妈", "麻", "马", "骂"], py: ["mā", "má", "mǎ", "mà"] },
  { syllable: "ba", chars: ["八", "拔", "把", "爸"], py: ["bā", "bá", "bǎ", "bà"] },
  { syllable: "yi", chars: ["一", "姨", "椅", "意"], py: ["yī", "yí", "yǐ", "yì"] },
  { syllable: "wu", chars: ["屋", "无", "五", "雾"], py: ["wū", "wú", "wǔ", "wù"] },
  { syllable: "shi", chars: ["诗", "十", "使", "是"], py: ["shī", "shí", "shǐ", "shì"] },
  { syllable: "tang", chars: ["汤", "糖", "躺", "烫"], py: ["tāng", "táng", "tǎng", "tàng"] },
  { syllable: "guo", chars: ["锅", "国", "果", "过"], py: ["guō", "guó", "guǒ", "guò"] },
  { syllable: "tu", chars: ["突", "图", "土", "兔"], py: ["tū", "tú", "tǔ", "tù"] },
  { syllable: "fei", chars: ["飞", "肥", "匪", "费"], py: ["fēi", "féi", "fěi", "fèi"] },
  { syllable: "ji", chars: ["鸡", "急", "挤", "记"], py: ["jī", "jí", "jǐ", "jì"] },
  { syllable: "qi", chars: ["七", "骑", "起", "气"], py: ["qī", "qí", "qǐ", "qì"] },
  { syllable: "xi", chars: ["西", "习", "洗", "细"], py: ["xī", "xí", "xǐ", "xì"] },
  { syllable: "da", chars: ["搭", "达", "打", "大"], py: ["dā", "dá", "dǎ", "dà"] },
  { syllable: "shu", chars: ["书", "熟", "鼠", "树"], py: ["shū", "shú", "shǔ", "shù"] },
  { syllable: "mao", chars: ["猫", "毛", "卯", "帽"], py: ["māo", "máo", "mǎo", "mào"] },
];

export const TONES = [
  { n: 1, mark: "ā", name: "Thanh 1", desc: "Cao và bằng, giữ giọng ở mức cao, kéo dài. Giống thanh ngang (không dấu) nhưng cao hơn hẳn.", contour: "55" },
  { n: 2, mark: "á", name: "Thanh 2", desc: "Đi lên từ trung bình lên cao, như khi hỏi lại «hả?». Gần giống dấu sắc nhưng dài, không gấp.", contour: "35" },
  { n: 3, mark: "ǎ", name: "Thanh 3", desc: "Xuống thấp rồi vòng lên. Gần dấu hỏi. Khi đứng trước thanh khác thường chỉ đọc nửa đầu (xuống thấp, không lên).", contour: "214" },
  { n: 4, mark: "à", name: "Thanh 4", desc: "Từ cao rơi mạnh xuống thấp, dứt khoát như ra lệnh. Không phải dấu huyền: dấu huyền bắt đầu thấp, thanh 4 bắt đầu rất cao.", contour: "51" },
  { n: 0, mark: "a", name: "Thanh nhẹ", desc: "Đọc ngắn và nhẹ, không nhấn. Không đánh dấu. Ví dụ: 吗 ma, 的 de, 妈妈 māma.", contour: "" },
] as const;

export type SoundItem = { label: string; char: string; py: string; note?: string };

export const INITIALS: SoundItem[] = [
  { label: "b", char: "爸", py: "bà", note: "như «p» tiếng Việt, không bật hơi" },
  { label: "p", char: "怕", py: "pà", note: "«p» bật hơi mạnh" },
  { label: "m", char: "妈", py: "mā" },
  { label: "f", char: "发", py: "fā", note: "như «ph»" },
  { label: "d", char: "大", py: "dà", note: "như «t» tiếng Việt, không bật hơi" },
  { label: "t", char: "他", py: "tā", note: "như «th» (bật hơi)" },
  { label: "n", char: "你", py: "nǐ" },
  { label: "l", char: "来", py: "lái" },
  { label: "g", char: "哥", py: "gē", note: "như «c/k», không bật hơi" },
  { label: "k", char: "看", py: "kàn", note: "«kh» bật hơi" },
  { label: "h", char: "好", py: "hǎo", note: "gần «h», hơi khàn ở cuống họng" },
  { label: "j", char: "鸡", py: "jī", note: "gần «ch», mặt lưỡi áp vòm, không bật hơi" },
  { label: "q", char: "七", py: "qī", note: "như j nhưng bật hơi" },
  { label: "x", char: "西", py: "xī", note: "gần «x» nhưng mặt lưỡi, miệng dẹt" },
  { label: "zh", char: "中", py: "zhōng", note: "uốn lưỡi, gần «tr»" },
  { label: "ch", char: "吃", py: "chī", note: "uốn lưỡi, như zh nhưng bật hơi" },
  { label: "sh", char: "是", py: "shì", note: "uốn lưỡi, gần «s» nặng" },
  { label: "r", char: "人", py: "rén", note: "uốn lưỡi, gần «r» nhẹ / «gi»" },
  { label: "z", char: "字", py: "zì", note: "đầu lưỡi, «ch» kèm «x» (ts), không bật hơi" },
  { label: "c", char: "菜", py: "cài", note: "như z nhưng bật hơi (ts‘)" },
  { label: "s", char: "三", py: "sān", note: "như «x» tiếng Việt" },
  { label: "y", char: "一", py: "yī" },
  { label: "w", char: "我", py: "wǒ" },
];

export const FINALS: SoundItem[] = [
  { label: "a", char: "八", py: "bā" },
  { label: "o", char: "波", py: "bō", note: "gần «ua» khép" },
  { label: "e", char: "饿", py: "è", note: "gần «ơ» kéo về «ưa»" },
  { label: "i", char: "衣", py: "yī", note: "sau z/c/s/zh/ch/sh/r đọc gần «ư»" },
  { label: "u", char: "五", py: "wǔ" },
  { label: "ü", char: "鱼", py: "yú", note: "chu môi như «u», lưỡi đọc «i». Sau j/q/x/y viết thành u" },
  { label: "ai", char: "爱", py: "ài" },
  { label: "ei", char: "飞", py: "fēi", note: "như «ây»" },
  { label: "ao", char: "好", py: "hǎo", note: "như «ao»" },
  { label: "ou", char: "狗", py: "gǒu", note: "như «âu»" },
  { label: "an", char: "三", py: "sān" },
  { label: "en", char: "门", py: "mén", note: "như «ân»" },
  { label: "ang", char: "忙", py: "máng" },
  { label: "eng", char: "冷", py: "lěng", note: "như «âng»" },
  { label: "ong", char: "中", py: "zhōng", note: "như «ung»" },
  { label: "er", char: "二", py: "èr", note: "uốn lưỡi" },
  { label: "ia", char: "家", py: "jiā" },
  { label: "ie", char: "谢", py: "xiè", note: "như «iê»" },
  { label: "iao", char: "小", py: "xiǎo", note: "như «eo» / «iêu»" },
  { label: "iu", char: "九", py: "jiǔ", note: "đầy đủ là iou, như «iêu»" },
  { label: "ian", char: "天", py: "tiān", note: "đọc như «iên», KHÔNG phải «ian»" },
  { label: "in", char: "今", py: "jīn" },
  { label: "iang", char: "想", py: "xiǎng" },
  { label: "ing", char: "星", py: "xīng" },
  { label: "iong", char: "熊", py: "xióng" },
  { label: "ua", char: "花", py: "huā", note: "như «oa»" },
  { label: "uo", char: "国", py: "guó", note: "như «ua»" },
  { label: "uai", char: "快", py: "kuài", note: "như «oai»" },
  { label: "ui", char: "对", py: "duì", note: "đầy đủ là uei, như «uây»" },
  { label: "uan", char: "关", py: "guān", note: "như «oan»" },
  { label: "un", char: "春", py: "chūn", note: "đầy đủ là uen, như «uân»" },
  { label: "uang", char: "黄", py: "huáng", note: "như «oang»" },
  { label: "üe", char: "月", py: "yuè", note: "như «uyê»" },
  { label: "üan", char: "远", py: "yuǎn", note: "như «uyên»" },
  { label: "ün", char: "云", py: "yún", note: "như «uyn»" },
];

/** Các cặp âm người Việt hay nhầm. */
export const CONFUSABLE_PAIRS: { a: SoundItem; b: SoundItem; hint: string }[] = [
  { a: { label: "zh", char: "知", py: "zhī" }, b: { label: "z", char: "资", py: "zī" }, hint: "zh uốn lưỡi; z để đầu lưỡi sau răng" },
  { a: { label: "ch", char: "出", py: "chū" }, b: { label: "c", char: "粗", py: "cū" }, hint: "ch uốn lưỡi; c đầu lưỡi, bật hơi" },
  { a: { label: "sh", char: "山", py: "shān" }, b: { label: "s", char: "三", py: "sān" }, hint: "sh uốn lưỡi; s như «x» tiếng Việt" },
  { a: { label: "j", char: "鸡", py: "jī" }, b: { label: "q", char: "七", py: "qī" }, hint: "j không bật hơi; q bật hơi" },
  { a: { label: "b", char: "八", py: "bā" }, b: { label: "p", char: "趴", py: "pā" }, hint: "b không bật hơi; p bật hơi" },
  { a: { label: "d", char: "大", py: "dà" }, b: { label: "t", char: "踏", py: "tà" }, hint: "d như «t» Việt; t như «th» Việt" },
  { a: { label: "u", char: "路", py: "lù" }, b: { label: "ü", char: "绿", py: "lǜ" }, hint: "ü chu môi nhưng lưỡi đọc «i»" },
  { a: { label: "an", char: "盘", py: "pán" }, b: { label: "ang", char: "旁", py: "páng" }, hint: "an kết thúc ở đầu lưỡi; ang ở cuống lưỡi" },
];

export const SANDHI_RULES: { title: string; body: string; examples: { zh: string; py: string; vi: string }[] }[] = [
  {
    title: "Hai thanh 3 đi liền nhau",
    body: "Thanh 3 đứng trước một thanh 3 khác thì đọc thành thanh 2. Dấu viết vẫn giữ nguyên là thanh 3.",
    examples: [
      { zh: "你好", py: "nǐ hǎo → ní hǎo", vi: "xin chào" },
      { zh: "很好", py: "hěn hǎo → hén hǎo", vi: "rất tốt" },
    ],
  },
  {
    title: "Thanh 3 nửa",
    body: "Thanh 3 đứng trước thanh 1, 2, 4 hoặc thanh nhẹ chỉ đọc nửa đầu: xuống thấp rồi dừng, không vòng lên.",
    examples: [
      { zh: "老师", py: "lǎoshī", vi: "giáo viên" },
      { zh: "我们", py: "wǒmen", vi: "chúng tôi" },
    ],
  },
  {
    title: "Biến điệu của 不 (bù)",
    body: "不 đứng trước thanh 4 thì đọc thành bú. Các trường hợp khác giữ nguyên bù.",
    examples: [
      { zh: "不是", py: "bú shì", vi: "không phải" },
      { zh: "不客气", py: "bú kèqi", vi: "không có gì" },
      { zh: "不好", py: "bù hǎo", vi: "không tốt" },
    ],
  },
  {
    title: "Biến điệu của 一 (yī)",
    body: "Đọc yī khi đứng một mình, khi đếm số, khi chỉ số thứ tự. Trước thanh 4 đọc yí. Trước thanh 1, 2, 3 đọc yì.",
    examples: [
      { zh: "一个", py: "yí ge", vi: "một cái" },
      { zh: "一本", py: "yì běn", vi: "một quyển" },
      { zh: "第一", py: "dì yī", vi: "thứ nhất" },
    ],
  },
];

export const VIETNAMESE_PITFALLS: string[] = [
  "Đọc thanh 4 thành dấu huyền. Thanh 4 phải bắt đầu rất cao rồi rơi xuống.",
  "Đọc thanh 1 quá thấp, giống thanh ngang. Thanh 1 phải cao, gần mức cao nhất của giọng.",
  "Không phân biệt được âm bật hơi và không bật hơi (b/p, d/t, g/k, j/q, z/c, zh/ch). Đặt tờ giấy trước miệng: âm bật hơi sẽ làm giấy rung.",
  "Đọc zh/ch/sh/r như tr/ch/s tiếng Việt. Cần cong đầu lưỡi lên chạm gần vòm miệng.",
  "Đọc ian thành «an». Phải đọc gần như «iên»: 天 tiān nghe như «thiên».",
  "Đọc ü thành «u» hoặc «uy». Giữ môi tròn, lưỡi đặt như khi đọc «i».",
  "Thêm âm tắc cuối (như -c, -t, -p của tiếng Việt). Tiếng Phổ thông chỉ có âm cuối -n và -ng.",
  "Đọc pinyin theo cách đánh vần tiếng Việt. Pinyin là bảng phiên âm riêng: x, q, c, zh… không đọc như chữ Việt.",
];
