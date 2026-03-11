import { Link, Outlet, useLocation } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth, type User } from "../auth/AuthProvider";

type Role = User["role"];

export const NAV_ITEMS: Array<{ label: string; path: string; roles?: Role[] }> = [
  { label: "ダッシュボード", path: "/dashboard", roles: ["admin", "instructor", "student"] },
  { label: "学生管理", path: "/students", roles: ["admin", "instructor"] },
  { label: "コース管理", path: "/courses", roles: ["admin", "instructor"] },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const myRole: Role = user?.role || "student";

  const items = NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(myRole));

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <aside style={{
        width: 260,
        backgroundColor: "#fff",
        borderRight: "1px solid #e2e8f0",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 12px rgba(0,0,0,0.02)"
      }}>
        <div style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          color: "#4F46E5",
          fontFamily: "'Outfit', sans-serif",
          marginBottom: 32,
          paddingLeft: 12,
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          WAVE STUDIO
        </div>
        <nav style={{ display: "grid", gap: 6 }}>
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  transition: "all 0.2s ease-in-out",
                  display: "flex",
                  alignItems: "center",
                  background: active ? "linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)" : "transparent",
                  color: active ? "#ffffff" : "#64748b",
                  boxShadow: active ? "0 4px 12px rgba(79, 70, 229, 0.3)" : "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
          <button
            onClick={() => {
              if (window.confirm("ログアウトしますか？")) {
                logout();
              }
            }}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              backgroundColor: "transparent",
              color: "#ef4444",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              gap: 10,
              textAlign: "left"
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogoutIcon fontSize="small" />
            <span>ログアウト</span>
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}