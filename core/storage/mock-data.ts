import { NoteDocument, noteDocumentSchema } from "@/core/schema/note.schema";

export const mockNoteDocument: NoteDocument = {
  taskId: "mock-task-001",
  version: 1,
  createdAt: "2025-01-15T10:00:00.000Z",
  meta: {
    topic: "上班族高效早餐指南",
    audience: "25-35岁都市白领",
    tone: "gentle",
    noteType: "listicle",
    pageCount: 4,
  },
  theme: {
    family: "classic",
    themeId: "template-a",
    primaryColor: "#FF2442",
    secondaryColor: "#FFF5F7",
    backgroundType: "solid",
    fontScale: "medium",
  },
  slides: [
    {
      id: "slide-1",
      type: "cover",
      title: "上班族高效早餐指南",
      subtitle: "10分钟搞定，营养不打折",
      bullets: [],
      highlight: undefined,
      use_real_image: false,
      image_query: undefined,
      image: null,
    },
    {
      id: "slide-2",
      type: "content",
      title: "为什么早餐不能省？",
      subtitle: "科学数据告诉你",
      bullets: [
        "空腹工作注意力下降40%",
        "长期不吃早餐代谢降低",
        "上午血糖波动影响情绪",
        "简单早餐就能改善状态",
      ],
      highlight: "哪怕只有5分钟，也要吃",
      use_real_image: true,
      image_query: "healthy breakfast",
      image: {
        source: "pexels",
        previewUrl:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800",
        fullUrl:
          "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
        pageUrl: "https://www.pexels.com/photo/1640774/",
        author: "ella olsson",
      },
    },
    {
      id: "slide-3",
      type: "content",
      title: "3个快手早餐方案",
      subtitle: "备餐+制作不超过10分钟",
      bullets: [
        "隔夜燕麦+坚果+蓝莓",
        "全麦吐司+煎蛋+牛油果",
        "希腊酸奶+麦片+香蕉片",
      ],
      highlight: "周日花30分钟备齐一周食材",
      use_real_image: false,
      image_query: undefined,
      image: null,
    },
    {
      id: "slide-4",
      type: "cta",
      title: "明天就开始吧",
      subtitle: "好习惯从一顿早餐开始",
      bullets: ["欢迎留言你的早餐搭配", "也可以分享给身边的人"],
      highlight: "坚持两周，再回来看自己的状态",
      use_real_image: false,
      image_query: undefined,
      image: null,
    },
  ],
};

if (process.env.NODE_ENV === "development") {
  noteDocumentSchema.parse(mockNoteDocument);
}
