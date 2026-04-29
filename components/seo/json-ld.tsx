import React from "react";

export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PicGen",
    description: "小红书文字图片生成器 - AI 智能生成小红书风格图文卡片，在线制作精美排版",
    url: baseUrl,
    applicationCategory: "Multimedia",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CNY",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
