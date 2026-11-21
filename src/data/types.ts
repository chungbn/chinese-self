/** Câu ví dụ: [chữ Hán, pinyin, nghĩa tiếng Việt] */
export type Example = [zh: string, pinyin: string, vi: string];

export type Word = {
  /** id ổn định, dạng "hsk1-学生" */
  id: string;
  hanzi: string;
  /**
   * Pinyin có dấu thanh. Âm tiết trong cùng một từ nối bằng ".", các từ cách nhau bằng dấu cách.
   * Ví dụ: "xué.sheng", "dǎ diàn.huà", "nǚ.ér". Dùng formatPinyin() để hiển thị.
   */
  py: string;
  /** Âm Hán Việt, mỗi chữ Hán một âm, cách nhau bằng dấu cách */
  hv: string;
  /** Nghĩa tiếng Việt */
  vi: string;
  /** Từ loại */
  pos: string;
  ex?: Example;
  level: number;
  lessonId: string;
};

export type Lesson = {
  id: string;
  level: number;
  order: number;
  title: string;
  grammar: string[];
  wordIds: string[];
};
