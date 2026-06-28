import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Compass, Megaphone, PiggyBank, FileText, BarChart3, Settings, LogOut, Sparkles, MessageSquare,
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import { LOGO_URL } from "../../data/landing";

const NAV = [
  { to: "/workspace", label: "AI Workspace", icon: MessageSquare, end: true },
  { to: "/workspace/dashboard", label: "BI Dashboard", icon: LayoutDashboard },
  { to: "/workspace/projects", label: "Projects", icon: FolderKanban },
  { to: "/workspace/strategy", label: "Strategy", icon: Compass },
  { to: "/workspace/marketing", label: "Marketing", icon: Megaphone },
  { to: "/workspace/funding", label: "Funding", icon: PiggyBank },
  { to: "/workspace/documents", label: "Documents", icon: FileText },
  { to: "/workspace/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/workspace/settings", label: "Settings", icon: Settings },
];

export default function WorkspaceShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-gray-900" data-testid="workspace-shell">
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-30">
        <button onClick={() => navigate("/")} className="px-5 py-5 flex items-center gap-2 border-b border-gray-100" data-testid="workspace-home">
          <img src={LOGO_URL} alt="STUDLYF" className="h-9 w-9 object-contain rounded-lg" />
          <span className="font-display font-semibold tracking-tight text-base">
            STUDLYF <span className="brand-gradient-text">AI</span>
          </span>
        </button>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={`nav-${it.label.toLowerCase()}`}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-[#F4F1FF] to-[#FFE9F2] text-gray-900 border border-[#6C63FF]/20"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <it.icon className={`w-4 h-4 ${isActive ? "text-[#6C63FF]" : ""}`} />
                  {it.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <div className="rounded-2xl p-3 bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white relative overflow-hidden mb-3">
            <Sparkles className="w-4 h-4" />
            <p className="mt-2 text-sm font-semibold leading-tight">You&apos;re on the Pro trial</p>
            <p className="text-[11px] opacity-90 mt-0.5">14 days left</p>
          </div>

          {user && (
            <div className="flex items-center gap-2.5">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF4D94] text-white flex items-center justify-center font-semibold text-sm">
                  {(user.name || user.email).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" data-testid="workspace-username">{user.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" data-testid="workspace-logout" aria-label="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="pl-64">
        <div className="max-w-[1200px] mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
