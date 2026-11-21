import type { Example, Lesson, Word } from "./types";

type RawWord = [hanzi: string, py: string, hv: string, vi: string, pos: string, ex?: Example];
type RawLesson = { title: string; grammar: string[]; words: RawWord[] };

/**
 * HSK 1 — 150 từ cốt lõi, chia 10 bài theo chủ đề.
 * Quy ước pinyin: xem Word.py trong types.ts.
 * Pinyin trong câu ví dụ đã áp dụng biến điệu của 一 / 不.
 */
const RAW: RawLesson[] = [
  {
    title: "Chào hỏi & đại từ",
    grammar: [
      "Câu chữ 是: A 是 B (A là B). Phủ định: A 不是 B. Ví dụ: 我是学生。我不是老师。",
      "Câu hỏi có/không: thêm 吗 vào cuối câu trần thuật. 你是学生。→ 你是学生吗？",
      "呢 dùng để hỏi lại «còn … thì sao?»: 我很好，你呢？",
      "Biến điệu của 不: bình thường đọc bù, đứng trước thanh 4 đọc thành bú (不是 bú shì, 不客气 bú kèqi).",
    ],
    words: [
      ["你", "nǐ", "nhĩ", "bạn, anh, chị (ngôi thứ hai)", "đại từ", ["你好！", "Nǐ hǎo!", "Xin chào!"]],
      ["我", "wǒ", "ngã", "tôi", "đại từ", ["我是学生。", "Wǒ shì xuésheng.", "Tôi là học sinh."]],
      ["他", "tā", "tha", "anh ấy, ông ấy (nam)", "đại từ", ["他是老师。", "Tā shì lǎoshī.", "Anh ấy là giáo viên."]],
      ["她", "tā", "tha", "cô ấy, bà ấy (nữ)", "đại từ", ["她是我妈妈。", "Tā shì wǒ māma.", "Bà ấy là mẹ tôi."]],
      ["我们", "wǒ.men", "ngã môn", "chúng tôi, chúng ta", "đại từ", ["我们是朋友。", "Wǒmen shì péngyou.", "Chúng tôi là bạn bè."]],
      ["好", "hǎo", "hảo", "tốt, khỏe, hay", "tính từ", ["你好吗？", "Nǐ hǎo ma?", "Bạn khỏe không?"]],
      ["谢谢", "xiè.xie", "tạ tạ", "cảm ơn", "động từ", ["谢谢你！", "Xièxie nǐ!", "Cảm ơn bạn!"]],
      ["不客气", "bú kè.qi", "bất khách khí", "không có gì, đừng khách sáo", "cụm từ", ["谢谢！——不客气。", "Xièxie! — Bú kèqi.", "Cảm ơn! — Không có gì."]],
      ["对不起", "duì.bu.qǐ", "đối bất khởi", "xin lỗi", "động từ", ["对不起，我不会说汉语。", "Duìbuqǐ, wǒ bú huì shuō Hànyǔ.", "Xin lỗi, tôi không biết nói tiếng Trung."]],
      ["没关系", "méi guān.xi", "một quan hệ", "không sao, không có gì", "cụm từ", ["对不起！——没关系。", "Duìbuqǐ! — Méi guānxi.", "Xin lỗi! — Không sao."]],
      ["再见", "zài.jiàn", "tái kiến", "tạm biệt", "động từ", ["老师，再见！", "Lǎoshī, zàijiàn!", "Tạm biệt thầy/cô!"]],
      ["请", "qǐng", "thỉnh", "mời; xin, vui lòng", "động từ", ["请坐。", "Qǐng zuò.", "Mời ngồi."]],
      ["喂", "wèi", "uy", "a lô (khi nghe điện thoại)", "thán từ", ["喂，你好！", "Wèi, nǐ hǎo!", "A lô, xin chào!"]],
      ["是", "shì", "thị", "là", "động từ", ["他是中国人。", "Tā shì Zhōngguó rén.", "Anh ấy là người Trung Quốc."]],
      ["不", "bù", "bất", "không", "phó từ", ["我不是老师。", "Wǒ bú shì lǎoshī.", "Tôi không phải là giáo viên."]],
      ["吗", "ma", "ma", "(trợ từ nghi vấn cuối câu) … không?", "trợ từ", ["你是学生吗？", "Nǐ shì xuésheng ma?", "Bạn là học sinh phải không?"]],
      ["呢", "ne", "ni", "(trợ từ) còn … thì sao?", "trợ từ", ["我很好，你呢？", "Wǒ hěn hǎo, nǐ ne?", "Tôi khỏe, còn bạn?"]],
    ],
  },
  {
    title: "Số đếm & lượng từ",
    grammar: [
      "Số từ + lượng từ + danh từ: 三个人 (ba người), 八本书 (tám quyển sách). Giữa số và danh từ phải có lượng từ.",
      "几 hỏi số lượng nhỏ (thường dưới 10): 你家有几个人？ 多少 hỏi số lượng bất kỳ: 多少钱？",
      "Biến điệu của 一: đứng một mình hoặc trong số đếm đọc yī; trước thanh 4 (và 个) đọc yí (一个 yí ge); trước thanh 1, 2, 3 đọc yì (一本 yì běn).",
    ],
    words: [
      ["一", "yī", "nhất", "một", "số từ", ["我有一个儿子。", "Wǒ yǒu yí ge érzi.", "Tôi có một con trai."]],
      ["二", "èr", "nhị", "hai (dùng khi đếm số)", "số từ", ["今天是二月二号。", "Jīntiān shì èr yuè èr hào.", "Hôm nay là ngày 2 tháng 2."]],
      ["三", "sān", "tam", "ba", "số từ", ["我家有三个人。", "Wǒ jiā yǒu sān ge rén.", "Nhà tôi có ba người."]],
      ["四", "sì", "tứ", "bốn", "số từ", ["我女儿四岁。", "Wǒ nǚ'ér sì suì.", "Con gái tôi bốn tuổi."]],
      ["五", "wǔ", "ngũ", "năm (số 5)", "số từ", ["五个苹果。", "Wǔ ge píngguǒ.", "Năm quả táo."]],
      ["六", "liù", "lục", "sáu", "số từ", ["现在六点。", "Xiànzài liù diǎn.", "Bây giờ là sáu giờ."]],
      ["七", "qī", "thất", "bảy", "số từ", ["一个星期有七天。", "Yí ge xīngqī yǒu qī tiān.", "Một tuần có bảy ngày."]],
      ["八", "bā", "bát", "tám", "số từ", ["八本书。", "Bā běn shū.", "Tám quyển sách."]],
      ["九", "jiǔ", "cửu", "chín", "số từ", ["我九月去北京。", "Wǒ jiǔ yuè qù Běijīng.", "Tháng chín tôi đi Bắc Kinh."]],
      ["十", "shí", "thập", "mười", "số từ", ["十块钱。", "Shí kuài qián.", "Mười đồng."]],
      ["几", "jǐ", "kỷ", "mấy (hỏi số lượng nhỏ)", "đại từ", ["你家有几个人？", "Nǐ jiā yǒu jǐ ge rén?", "Nhà bạn có mấy người?"]],
      ["多少", "duō.shao", "đa thiểu", "bao nhiêu", "đại từ", ["这个多少钱？", "Zhège duōshao qián?", "Cái này bao nhiêu tiền?"]],
      ["个", "gè", "cá", "cái, chiếc, người (lượng từ chung)", "lượng từ", ["这个苹果很大。", "Zhège píngguǒ hěn dà.", "Quả táo này rất to."]],
      ["岁", "suì", "tuế", "tuổi", "lượng từ", ["你几岁？", "Nǐ jǐ suì?", "Em mấy tuổi?"]],
      ["本", "běn", "bản", "quyển, cuốn (lượng từ cho sách)", "lượng từ", ["我买了三本书。", "Wǒ mǎi le sān běn shū.", "Tôi đã mua ba quyển sách."]],
      ["些", "xiē", "ta", "một số, vài, những", "lượng từ", ["这些是我的书。", "Zhèxiē shì wǒ de shū.", "Những cái này là sách của tôi."]],
      ["块", "kuài", "khối", "đồng (đơn vị tiền, khẩu ngữ); miếng", "lượng từ", ["这个杯子八块钱。", "Zhège bēizi bā kuài qián.", "Cái cốc này tám đồng."]],
    ],
  },
  {
    title: "Gia đình & con người",
    grammar: [
      "的 chỉ sở hữu: 我的书 (sách của tôi). Định ngữ đứng TRƯỚC danh từ, ngược với tiếng Việt.",
      "Với người thân, bạn bè có thể bỏ 的: 我妈妈, 我朋友.",
      "Hỏi tên: 你叫什么名字？ — 我叫…",
    ],
    words: [
      ["爸爸", "bà.ba", "ba ba", "bố, ba", "danh từ", ["我爸爸是医生。", "Wǒ bàba shì yīshēng.", "Bố tôi là bác sĩ."]],
      ["妈妈", "mā.ma", "ma ma", "mẹ, má", "danh từ", ["我妈妈很漂亮。", "Wǒ māma hěn piàoliang.", "Mẹ tôi rất đẹp."]],
      ["儿子", "ér.zi", "nhi tử", "con trai", "danh từ", ["他儿子是学生。", "Tā érzi shì xuésheng.", "Con trai anh ấy là học sinh."]],
      ["女儿", "nǚ.ér", "nữ nhi", "con gái", "danh từ", ["她女儿很漂亮。", "Tā nǚ'ér hěn piàoliang.", "Con gái chị ấy rất xinh."]],
      ["家", "jiā", "gia", "nhà, gia đình", "danh từ", ["我家在北京。", "Wǒ jiā zài Běijīng.", "Nhà tôi ở Bắc Kinh."]],
      ["人", "rén", "nhân", "người", "danh từ", ["你是哪国人？", "Nǐ shì nǎ guó rén?", "Bạn là người nước nào?"]],
      ["朋友", "péng.you", "bằng hữu", "bạn bè", "danh từ", ["他是我的好朋友。", "Tā shì wǒ de hǎo péngyou.", "Anh ấy là bạn tốt của tôi."]],
      ["同学", "tóng.xué", "đồng học", "bạn học", "danh từ", ["他们是我的同学。", "Tāmen shì wǒ de tóngxué.", "Họ là bạn học của tôi."]],
      ["老师", "lǎo.shī", "lão sư", "thầy giáo, cô giáo", "danh từ", ["我们的汉语老师是中国人。", "Wǒmen de Hànyǔ lǎoshī shì Zhōngguó rén.", "Giáo viên tiếng Trung của chúng tôi là người Trung Quốc."]],
      ["学生", "xué.sheng", "học sinh", "học sinh, sinh viên", "danh từ", ["她是我的学生。", "Tā shì wǒ de xuésheng.", "Cô ấy là học trò của tôi."]],
      ["医生", "yī.shēng", "y sinh", "bác sĩ", "danh từ", ["她是医院的医生。", "Tā shì yīyuàn de yīshēng.", "Cô ấy là bác sĩ của bệnh viện."]],
      ["先生", "xiān.sheng", "tiên sinh", "ông, ngài; chồng", "danh từ", ["王先生，你好！", "Wáng xiānsheng, nǐ hǎo!", "Chào ông Vương!"]],
      ["小姐", "xiǎo.jiě", "tiểu thư", "cô (gọi phụ nữ trẻ)", "danh từ", ["李小姐是我的同学。", "Lǐ xiǎojiě shì wǒ de tóngxué.", "Cô Lý là bạn học của tôi."]],
      ["谁", "shéi", "thùy", "ai", "đại từ", ["他是谁？", "Tā shì shéi?", "Anh ấy là ai?"]],
      ["叫", "jiào", "khiếu", "gọi; tên là", "động từ", ["你叫什么名字？", "Nǐ jiào shénme míngzi?", "Bạn tên là gì?"]],
      ["名字", "míng.zi", "danh tự", "tên", "danh từ", ["我的名字叫李明。", "Wǒ de míngzi jiào Lǐ Míng.", "Tên tôi là Lý Minh."]],
      ["认识", "rèn.shi", "nhận thức", "quen biết", "động từ", ["认识你很高兴。", "Rènshi nǐ hěn gāoxìng.", "Rất vui được làm quen với bạn."]],
    ],
  },
  {
    title: "Thời gian",
    grammar: [
      "Thời gian nói từ lớn đến nhỏ: năm → tháng → ngày → thứ → buổi → giờ (ngược tiếng Việt). Ví dụ: 2026年11月21号 星期六 上午 八点.",
      "Trạng ngữ thời gian đặt TRƯỚC động từ (trước hoặc sau chủ ngữ): 我明天去学校 / 明天我去学校.",
      "Hỏi giờ: 现在几点？ Hỏi ngày: 今天几号？ Hỏi thứ: 今天星期几？",
    ],
    words: [
      ["今天", "jīn.tiān", "kim thiên", "hôm nay", "danh từ", ["今天星期几？", "Jīntiān xīngqī jǐ?", "Hôm nay thứ mấy?"]],
      ["明天", "míng.tiān", "minh thiên", "ngày mai", "danh từ", ["明天我去学校。", "Míngtiān wǒ qù xuéxiào.", "Ngày mai tôi đến trường."]],
      ["昨天", "zuó.tiān", "tạc thiên", "hôm qua", "danh từ", ["昨天很冷。", "Zuótiān hěn lěng.", "Hôm qua rất lạnh."]],
      ["年", "nián", "niên", "năm", "danh từ", ["我今年二十岁。", "Wǒ jīnnián èrshí suì.", "Năm nay tôi hai mươi tuổi."]],
      ["月", "yuè", "nguyệt", "tháng; mặt trăng", "danh từ", ["现在是十一月。", "Xiànzài shì shíyī yuè.", "Bây giờ là tháng mười một."]],
      ["号", "hào", "hiệu", "ngày (trong tháng); số", "danh từ", ["今天几号？", "Jīntiān jǐ hào?", "Hôm nay ngày mấy?"]],
      ["星期", "xīng.qī", "tinh kỳ", "tuần; thứ (星期一 = thứ Hai)", "danh từ", ["今天星期一。", "Jīntiān xīngqī yī.", "Hôm nay thứ Hai."]],
      ["上午", "shàng.wǔ", "thượng ngọ", "buổi sáng", "danh từ", ["我上午工作。", "Wǒ shàngwǔ gōngzuò.", "Buổi sáng tôi làm việc."]],
      ["中午", "zhōng.wǔ", "trung ngọ", "buổi trưa", "danh từ", ["中午我们去饭店吃饭。", "Zhōngwǔ wǒmen qù fàndiàn chī fàn.", "Buổi trưa chúng tôi đi nhà hàng ăn cơm."]],
      ["下午", "xià.wǔ", "hạ ngọ", "buổi chiều", "danh từ", ["我下午三点回家。", "Wǒ xiàwǔ sān diǎn huí jiā.", "Ba giờ chiều tôi về nhà."]],
      ["现在", "xiàn.zài", "hiện tại", "bây giờ", "danh từ", ["现在几点？", "Xiànzài jǐ diǎn?", "Bây giờ là mấy giờ?"]],
      ["时候", "shí.hou", "thời hậu", "lúc, khi", "danh từ", ["你什么时候回家？", "Nǐ shénme shíhou huí jiā?", "Khi nào bạn về nhà?"]],
      ["点", "diǎn", "điểm", "giờ; điểm, chấm", "lượng từ", ["我七点吃饭。", "Wǒ qī diǎn chī fàn.", "Tôi ăn cơm lúc bảy giờ."]],
      ["分钟", "fēn.zhōng", "phân chung", "phút", "danh từ", ["坐出租车十分钟。", "Zuò chūzūchē shí fēnzhōng.", "Đi taxi mất mười phút."]],
    ],
  },
  {
    title: "Ăn uống & sở thích",
    grammar: [
      "想 + động từ: muốn làm gì. 我想喝茶。 (Tôi muốn uống trà.)",
      "喜欢 + danh từ / động từ: thích cái gì / thích làm gì. 我喜欢猫。我喜欢看电影。",
      "Danh từ bổ nghĩa đứng trước: 中国菜 = món Trung Quốc, 汉语老师 = giáo viên tiếng Trung.",
    ],
    words: [
      ["吃", "chī", "ngật", "ăn", "động từ", ["我们去吃饭吧。", "Wǒmen qù chī fàn ba.", "Chúng ta đi ăn cơm nhé."]],
      ["喝", "hē", "hát", "uống", "động từ", ["我想喝茶。", "Wǒ xiǎng hē chá.", "Tôi muốn uống trà."]],
      ["菜", "cài", "thái", "món ăn; rau", "danh từ", ["中国菜很好吃。", "Zhōngguó cài hěn hǎochī.", "Món Trung Quốc rất ngon."]],
      ["茶", "chá", "trà", "trà, chè", "danh từ", ["请喝茶。", "Qǐng hē chá.", "Mời uống trà."]],
      ["水", "shuǐ", "thủy", "nước", "danh từ", ["我喝了一杯水。", "Wǒ hē le yì bēi shuǐ.", "Tôi đã uống một cốc nước."]],
      ["米饭", "mǐ.fàn", "mễ phạn", "cơm", "danh từ", ["我喜欢吃米饭。", "Wǒ xǐhuan chī mǐfàn.", "Tôi thích ăn cơm."]],
      ["水果", "shuǐ.guǒ", "thủy quả", "hoa quả, trái cây", "danh từ", ["你喜欢吃什么水果？", "Nǐ xǐhuan chī shénme shuǐguǒ?", "Bạn thích ăn trái cây gì?"]],
      ["苹果", "píng.guǒ", "bình quả", "quả táo", "danh từ", ["我买了一些苹果。", "Wǒ mǎi le yìxiē píngguǒ.", "Tôi đã mua một ít táo."]],
      ["杯子", "bēi.zi", "bôi tử", "cái cốc, cái chén", "danh từ", ["这是谁的杯子？", "Zhè shì shéi de bēizi?", "Đây là cốc của ai?"]],
      ["饭店", "fàn.diàn", "phạn điếm", "nhà hàng; khách sạn", "danh từ", ["这个饭店的菜很好吃。", "Zhège fàndiàn de cài hěn hǎochī.", "Món ăn ở nhà hàng này rất ngon."]],
      ["喜欢", "xǐ.huan", "hỷ hoan", "thích", "động từ", ["我喜欢看电影。", "Wǒ xǐhuan kàn diànyǐng.", "Tôi thích xem phim."]],
      ["想", "xiǎng", "tưởng", "muốn; nghĩ; nhớ", "trợ động từ", ["我想去中国。", "Wǒ xiǎng qù Zhōngguó.", "Tôi muốn đi Trung Quốc."]],
      ["爱", "ài", "ái", "yêu", "động từ", ["我爱我的家。", "Wǒ ài wǒ de jiā.", "Tôi yêu gia đình tôi."]],
    ],
  },
  {
    title: "Nơi chốn & phương hướng",
    grammar: [
      "Ai/cái gì ở đâu: Chủ ngữ + 在 + nơi chốn. 我在家。书在桌子上。",
      "Ở đâu có gì: Nơi chốn + 有 + vật. 杯子里有水。 (Trong cốc có nước.)",
      "Từ phương vị đứng SAU danh từ, ngược tiếng Việt: 桌子上 = trên bàn, 医院后面 = phía sau bệnh viện.",
    ],
    words: [
      ["中国", "Zhōng.guó", "Trung Quốc", "Trung Quốc", "danh từ", ["我在中国学习汉语。", "Wǒ zài Zhōngguó xuéxí Hànyǔ.", "Tôi học tiếng Trung ở Trung Quốc."]],
      ["北京", "Běi.jīng", "Bắc Kinh", "Bắc Kinh", "danh từ", ["北京很大。", "Běijīng hěn dà.", "Bắc Kinh rất rộng lớn."]],
      ["学校", "xué.xiào", "học hiệu", "trường học", "danh từ", ["我们的学校很漂亮。", "Wǒmen de xuéxiào hěn piàoliang.", "Trường của chúng tôi rất đẹp."]],
      ["医院", "yī.yuàn", "y viện", "bệnh viện", "danh từ", ["医院在哪儿？", "Yīyuàn zài nǎr?", "Bệnh viện ở đâu?"]],
      ["商店", "shāng.diàn", "thương điếm", "cửa hàng", "danh từ", ["我去商店买东西。", "Wǒ qù shāngdiàn mǎi dōngxi.", "Tôi đến cửa hàng mua đồ."]],
      ["在", "zài", "tại", "ở, tại; đang", "động từ, giới từ", ["我在家。", "Wǒ zài jiā.", "Tôi ở nhà."]],
      ["哪", "nǎ", "na", "nào", "đại từ", ["你喜欢哪个？", "Nǐ xǐhuan nǎge?", "Bạn thích cái nào?"]],
      ["哪儿", "nǎr", "na nhi", "ở đâu, chỗ nào", "đại từ", ["你去哪儿？", "Nǐ qù nǎr?", "Bạn đi đâu?"]],
      ["这", "zhè", "giá", "này, đây", "đại từ", ["这是我的朋友。", "Zhè shì wǒ de péngyou.", "Đây là bạn của tôi."]],
      ["那", "nà", "na", "kia, đó", "đại từ", ["那是我的书。", "Nà shì wǒ de shū.", "Kia là sách của tôi."]],
      ["里", "lǐ", "lý", "trong, bên trong", "danh từ", ["杯子里有水。", "Bēizi lǐ yǒu shuǐ.", "Trong cốc có nước."]],
      ["上", "shàng", "thượng", "trên; lên", "danh từ", ["书在桌子上。", "Shū zài zhuōzi shang.", "Sách ở trên bàn."]],
      ["下", "xià", "hạ", "dưới; xuống", "danh từ", ["猫在桌子下面。", "Māo zài zhuōzi xiàmiàn.", "Con mèo ở dưới gầm bàn."]],
      ["前面", "qián.miàn", "tiền diện", "phía trước", "danh từ", ["前面是我们学校。", "Qiánmiàn shì wǒmen xuéxiào.", "Phía trước là trường chúng tôi."]],
      ["后面", "hòu.miàn", "hậu diện", "phía sau", "danh từ", ["商店在医院后面。", "Shāngdiàn zài yīyuàn hòumiàn.", "Cửa hàng ở phía sau bệnh viện."]],
      ["住", "zhù", "trú", "sống, ở (cư trú)", "động từ", ["你住在哪儿？", "Nǐ zhù zài nǎr?", "Bạn sống ở đâu?"]],
    ],
  },
  {
    title: "Hoạt động hằng ngày",
    grammar: [
      "Trạng ngữ nơi chốn đặt TRƯỚC động từ: 我在学校学习。 (Tôi học ở trường.) — không nói 我学习在学校.",
      "Đi lại bằng phương tiện: 坐 + phương tiện + 去 + nơi chốn. 我坐飞机去北京。",
      "在 + động từ: đang làm gì. 你在做什么？",
    ],
    words: [
      ["去", "qù", "khứ", "đi (đến đâu)", "động từ", ["明天我们去北京。", "Míngtiān wǒmen qù Běijīng.", "Ngày mai chúng tôi đi Bắc Kinh."]],
      ["来", "lái", "lai", "đến, tới", "động từ", ["你什么时候来？", "Nǐ shénme shíhou lái?", "Khi nào bạn đến?"]],
      ["回", "huí", "hồi", "về, trở về", "động từ", ["我回家了。", "Wǒ huí jiā le.", "Tôi về nhà rồi."]],
      ["坐", "zuò", "tọa", "ngồi; đi (xe, máy bay…)", "động từ", ["我坐飞机去北京。", "Wǒ zuò fēijī qù Běijīng.", "Tôi đi máy bay đến Bắc Kinh."]],
      ["做", "zuò", "tố", "làm", "động từ", ["你在做什么？", "Nǐ zài zuò shénme?", "Bạn đang làm gì?"]],
      ["工作", "gōng.zuò", "công tác", "làm việc; công việc", "động từ, danh từ", ["你在哪儿工作？", "Nǐ zài nǎr gōngzuò?", "Bạn làm việc ở đâu?"]],
      ["学习", "xué.xí", "học tập", "học", "động từ", ["我学习汉语。", "Wǒ xuéxí Hànyǔ.", "Tôi học tiếng Trung."]],
      ["读", "dú", "độc", "đọc", "động từ", ["请读这个字。", "Qǐng dú zhège zì.", "Hãy đọc chữ này."]],
      ["写", "xiě", "tả", "viết", "động từ", ["你会写汉字吗？", "Nǐ huì xiě Hànzì ma?", "Bạn có biết viết chữ Hán không?"]],
      ["看", "kàn", "khán", "xem, nhìn; đọc (sách)", "động từ", ["我喜欢看书。", "Wǒ xǐhuan kàn shū.", "Tôi thích đọc sách."]],
      ["看见", "kàn.jiàn", "khán kiến", "nhìn thấy", "động từ", ["你看见我的猫了吗？", "Nǐ kànjiàn wǒ de māo le ma?", "Bạn có thấy con mèo của tôi không?"]],
      ["听", "tīng", "thính", "nghe", "động từ", ["请听我说。", "Qǐng tīng wǒ shuō.", "Hãy nghe tôi nói."]],
      ["说", "shuō", "thuyết", "nói", "động từ", ["他会说汉语。", "Tā huì shuō Hànyǔ.", "Anh ấy biết nói tiếng Trung."]],
      ["睡觉", "shuì.jiào", "thụy giác", "ngủ, đi ngủ", "động từ", ["我十一点睡觉。", "Wǒ shíyī diǎn shuìjiào.", "Tôi đi ngủ lúc mười một giờ."]],
      ["打电话", "dǎ diàn.huà", "đả điện thoại", "gọi điện thoại", "cụm từ", ["我给妈妈打电话。", "Wǒ gěi māma dǎ diànhuà.", "Tôi gọi điện cho mẹ."]],
      ["开", "kāi", "khai", "mở; lái (xe)", "động từ", ["他会开车。", "Tā huì kāi chē.", "Anh ấy biết lái xe."]],
    ],
  },
  {
    title: "Mua sắm & đồ vật",
    grammar: [
      "这/那 + lượng từ + danh từ: 这本书 (quyển sách này), 那个人 (người kia).",
      "Hỏi giá: … 多少钱？ Trả lời: … 块（钱）. 这个杯子多少钱？——八块。",
    ],
    words: [
      ["买", "mǎi", "mãi", "mua", "động từ", ["你想买什么？", "Nǐ xiǎng mǎi shénme?", "Bạn muốn mua gì?"]],
      ["钱", "qián", "tiền", "tiền", "danh từ", ["我没有钱。", "Wǒ méiyǒu qián.", "Tôi không có tiền."]],
      ["东西", "dōng.xi", "đông tây", "đồ, đồ vật", "danh từ", ["这个东西叫什么？", "Zhège dōngxi jiào shénme?", "Đồ này gọi là gì?"]],
      ["衣服", "yī.fu", "y phục", "quần áo", "danh từ", ["这件衣服很漂亮。", "Zhè jiàn yīfu hěn piàoliang.", "Bộ quần áo này rất đẹp."]],
      ["桌子", "zhuō.zi", "trác tử", "cái bàn", "danh từ", ["桌子上有一本书。", "Zhuōzi shang yǒu yì běn shū.", "Trên bàn có một quyển sách."]],
      ["椅子", "yǐ.zi", "ỷ tử", "cái ghế", "danh từ", ["这个椅子很小。", "Zhège yǐzi hěn xiǎo.", "Cái ghế này rất nhỏ."]],
      ["电脑", "diàn.nǎo", "điện não", "máy tính", "danh từ", ["这是我的电脑。", "Zhè shì wǒ de diànnǎo.", "Đây là máy tính của tôi."]],
      ["电视", "diàn.shì", "điện thị", "ti vi", "danh từ", ["爸爸在看电视。", "Bàba zài kàn diànshì.", "Bố đang xem ti vi."]],
      ["电影", "diàn.yǐng", "điện ảnh", "phim, điện ảnh", "danh từ", ["明天我们去看电影吧。", "Míngtiān wǒmen qù kàn diànyǐng ba.", "Ngày mai chúng ta đi xem phim nhé."]],
      ["书", "shū", "thư", "sách", "danh từ", ["这本书是谁的？", "Zhè běn shū shì shéi de?", "Quyển sách này là của ai?"]],
      ["字", "zì", "tự", "chữ", "danh từ", ["这个字怎么读？", "Zhège zì zěnme dú?", "Chữ này đọc thế nào?"]],
      ["汉语", "Hàn.yǔ", "Hán ngữ", "tiếng Hán, tiếng Trung", "danh từ", ["你的汉语很好。", "Nǐ de Hànyǔ hěn hǎo.", "Tiếng Trung của bạn rất tốt."]],
      ["出租车", "chū.zū.chē", "xuất tô xa", "xe taxi", "danh từ", ["我们坐出租车去吧。", "Wǒmen zuò chūzūchē qù ba.", "Chúng ta đi taxi nhé."]],
      ["飞机", "fēi.jī", "phi cơ", "máy bay", "danh từ", ["我坐飞机去中国。", "Wǒ zuò fēijī qù Zhōngguó.", "Tôi đi máy bay sang Trung Quốc."]],
    ],
  },
  {
    title: "Thời tiết & tính chất",
    grammar: [
      "Tính từ làm vị ngữ trực tiếp, KHÔNG dùng 是: 我很高兴 (không nói 我是高兴). 很 ở đây thường không mang nghĩa «rất» mạnh.",
      "太 + tính từ + 了: quá … 太好了！太热了！",
      "Hỏi ý kiến / tình hình: … 怎么样？ 今天天气怎么样？",
    ],
    words: [
      ["天气", "tiān.qì", "thiên khí", "thời tiết", "danh từ", ["今天天气怎么样？", "Jīntiān tiānqì zěnmeyàng?", "Thời tiết hôm nay thế nào?"]],
      ["下雨", "xià yǔ", "hạ vũ", "mưa (trời mưa)", "động từ", ["明天会下雨。", "Míngtiān huì xià yǔ.", "Ngày mai trời sẽ mưa."]],
      ["冷", "lěng", "lãnh", "lạnh", "tính từ", ["北京很冷。", "Běijīng hěn lěng.", "Bắc Kinh rất lạnh."]],
      ["热", "rè", "nhiệt", "nóng", "tính từ", ["今天太热了！", "Jīntiān tài rè le!", "Hôm nay nóng quá!"]],
      ["大", "dà", "đại", "to, lớn", "tính từ", ["你的家很大。", "Nǐ de jiā hěn dà.", "Nhà bạn rất rộng."]],
      ["小", "xiǎo", "tiểu", "nhỏ, bé", "tính từ", ["这个杯子太小了。", "Zhège bēizi tài xiǎo le.", "Cái cốc này nhỏ quá."]],
      ["多", "duō", "đa", "nhiều", "tính từ", ["商店里人很多。", "Shāngdiàn lǐ rén hěn duō.", "Trong cửa hàng rất đông người."]],
      ["少", "shǎo", "thiểu", "ít", "tính từ", ["学校里人很少。", "Xuéxiào lǐ rén hěn shǎo.", "Trong trường rất ít người."]],
      ["很", "hěn", "ngận", "rất", "phó từ", ["我很高兴。", "Wǒ hěn gāoxìng.", "Tôi rất vui."]],
      ["太", "tài", "thái", "quá", "phó từ", ["太好了！", "Tài hǎo le!", "Tốt quá!"]],
      ["漂亮", "piào.liang", "phiêu lượng", "đẹp, xinh", "tính từ", ["你的衣服很漂亮。", "Nǐ de yīfu hěn piàoliang.", "Quần áo của bạn rất đẹp."]],
      ["高兴", "gāo.xìng", "cao hứng", "vui vẻ, vui mừng", "tính từ", ["今天我很高兴。", "Jīntiān wǒ hěn gāoxìng.", "Hôm nay tôi rất vui."]],
      ["猫", "māo", "miêu", "con mèo", "danh từ", ["我喜欢猫。", "Wǒ xǐhuan māo.", "Tôi thích mèo."]],
      ["狗", "gǒu", "cẩu", "con chó", "danh từ", ["我爱我的狗。", "Wǒ ài wǒ de gǒu.", "Tôi yêu con chó của tôi."]],
    ],
  },
  {
    title: "Từ chức năng & câu hỏi",
    grammar: [
      "了 cuối câu / sau động từ: việc đã xảy ra hoặc có thay đổi. Phủ định việc đã qua dùng 没（有）, KHÔNG dùng 不: 我没吃饭。",
      "会: biết làm (kỹ năng học được) / sẽ. 能: có khả năng, được phép. 我会说汉语。我能坐这儿吗？",
      "都 đứng sau chủ ngữ, trước động từ: 我们都是学生。 (Chúng tôi đều là học sinh.)",
      "Câu hỏi có đại từ nghi vấn (什么, 谁, 哪儿, 怎么…) KHÔNG thêm 吗; đại từ đứng đúng vị trí của thông tin cần hỏi.",
    ],
    words: [
      ["的", "de", "đích", "(trợ từ) của; (nối định ngữ)", "trợ từ", ["她是我的老师。", "Tā shì wǒ de lǎoshī.", "Cô ấy là giáo viên của tôi."]],
      ["了", "le", "liễu", "(trợ từ) đã; rồi", "trợ từ", ["我吃饭了。", "Wǒ chī fàn le.", "Tôi ăn cơm rồi."]],
      ["和", "hé", "hòa", "và, với", "liên từ", ["我和我朋友去商店。", "Wǒ hé wǒ péngyou qù shāngdiàn.", "Tôi và bạn tôi đi cửa hàng."]],
      ["都", "dōu", "đô", "đều, tất cả", "phó từ", ["我们都是学生。", "Wǒmen dōu shì xuésheng.", "Chúng tôi đều là học sinh."]],
      ["有", "yǒu", "hữu", "có", "động từ", ["我有一个女儿。", "Wǒ yǒu yí ge nǚ'ér.", "Tôi có một con gái."]],
      ["没有", "méi.yǒu", "một hữu", "không có; chưa", "động từ, phó từ", ["我没有电脑。", "Wǒ méiyǒu diànnǎo.", "Tôi không có máy tính."]],
      ["会", "huì", "hội", "biết (làm gì); sẽ", "trợ động từ", ["你会说汉语吗？", "Nǐ huì shuō Hànyǔ ma?", "Bạn có biết nói tiếng Trung không?"]],
      ["能", "néng", "năng", "có thể, được", "trợ động từ", ["我能坐这儿吗？", "Wǒ néng zuò zhèr ma?", "Tôi ngồi đây được không?"]],
      ["什么", "shén.me", "thập ma", "cái gì, gì", "đại từ", ["你想吃什么？", "Nǐ xiǎng chī shénme?", "Bạn muốn ăn gì?"]],
      ["怎么", "zěn.me", "chẩm ma", "thế nào, làm sao, sao", "đại từ", ["你怎么去学校？", "Nǐ zěnme qù xuéxiào?", "Bạn đến trường bằng cách nào?"]],
      ["怎么样", "zěn.me.yàng", "chẩm ma dạng", "thế nào, ra sao", "đại từ", ["这个饭店怎么样？", "Zhège fàndiàn zěnmeyàng?", "Nhà hàng này thế nào?"]],
      ["一点儿", "yì.diǎnr", "nhất điểm nhi", "một chút, một ít", "lượng từ", ["我会说一点儿汉语。", "Wǒ huì shuō yìdiǎnr Hànyǔ.", "Tôi biết nói một chút tiếng Trung."]],
    ],
  },
];

export const HSK1_LESSONS: Lesson[] = [];
export const HSK1_WORDS: Word[] = [];

RAW.forEach((l, i) => {
  const lessonId = `hsk1-${String(i + 1).padStart(2, "0")}`;
  const wordIds: string[] = [];
  for (const [hanzi, py, hv, vi, pos, ex] of l.words) {
    const id = `hsk1-${hanzi}`;
    wordIds.push(id);
    HSK1_WORDS.push({ id, hanzi, py, hv, vi, pos, ex, level: 1, lessonId });
  }
  HSK1_LESSONS.push({ id: lessonId, level: 1, order: i + 1, title: l.title, grammar: l.grammar, wordIds });
});
