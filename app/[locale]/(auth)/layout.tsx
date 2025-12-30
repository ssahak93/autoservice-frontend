// Auth layout - no header/footer for login/register pages
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
