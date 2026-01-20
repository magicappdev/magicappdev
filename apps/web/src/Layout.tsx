import { AppShell } from "./components/ui/AppShell";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
