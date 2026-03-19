export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm">{children}</div>
      </body>
    </html>
  );
}
