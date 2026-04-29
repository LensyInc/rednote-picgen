import React from "react";

export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PicGen",
    description:
      "小红书文字图片生成器 - AI 智能生成小红书风格图文卡片，在线制作精美排版",
    url: baseUrl,
    applicationCategory: "Multimedia",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    author: {
      "@type": "Organization",
      name: "PicGen",
    },
    datePublished: "2025-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CNY",
      description: "免费使用，AI 功能需消耗点数",
    },
    screenshot: {
      "@type": "ImageObject",
      url: `${baseUrl}/og-image.png`,
    },
    featureList: [
      "AI 智能生成小红书图文卡片",
      "13 种卡片类型：封面、图文、对比、步骤、FAQ 等",
      "8 套精美主题配色",
      "4 种背景样式：纯色、渐变、波点、横线",
      "自定义文字对齐与字号缩放",
      "一键导出高清 PNG 图片",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
