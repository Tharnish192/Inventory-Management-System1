import DashboardLayout from "../components/DashboardLayout";

export default function ViewerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout role="viewer">{children}</DashboardLayout>;
}
