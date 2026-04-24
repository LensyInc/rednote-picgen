export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">页面不存在</p>
      <a href="/" className="text-primary underline">
        返回首页
      </a>
    </div>
  );
}
