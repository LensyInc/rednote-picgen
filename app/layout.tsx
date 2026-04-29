import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_SC } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { JsonLd } from "@/components/seo/json-ld";

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PicGen - 小红书文字图片生成器",
    template: "%s | PicGen",
  },
  description:
    "在线免费制作小红书风格图文卡片。AI 智能生成排版、多款精美主题配色、自定义文字与背景，快速产出高质量小红书图片。",
  keywords: [
    "小红书",
    "图片生成",
    "图文卡片",
    "小红书排版",
    "文字图片",
    "小红书封面",
    "AI 生成",
    "海报制作",
    "小红书配图",
  ],
  authors: [{ name: "PicGen" }],
  creator: "PicGen",
  publisher: "PicGen",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "PicGen",
    title: "PicGen - 小红书文字图片生成器",
    description:
      "在线免费制作小红书风格图文卡片。AI 智能生成排版、多款精美主题配色，快速产出高质量小红书图片。",
    images: [
      {
        url: "/og-image.png",
        width: 1731,
        height: 909,
        alt: "PicGen - 小红书文字图片生成器",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PicGen - 小红书文字图片生成器",
    description:
      "在线免费制作小红书风格图文卡片。AI 智能生成排版、多款精美主题配色。",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
  },
  other: {
    "baidu-site-verification": "codeva-f6oUn1Yq22",
    "msvalidate.01": "CDDD18667C787F316FF56528A6C633E0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSansSC.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col font-sans overflow-hidden">
        <AuthProvider>
          <JsonLd />
          {children}
        </AuthProvider>
        <Script
          id="baidu-auto-push"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
    var bp = document.createElement('script');
    var curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https') {
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';
    } else {
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    }
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(bp, s);
})();
`,
          }}
        />
      </body>
    </html>
  );
}
