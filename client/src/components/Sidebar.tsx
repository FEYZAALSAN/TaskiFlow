import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Inbox, Circle, ChevronRight, Search, PenLine, LayoutGrid, Users,
  Eye, MoreHorizontal, Plus, HelpCircle, Layers, Tag, FileText,
  Zap, Bot, MessageSquare, Shield, Link, CreditCard, Download,
  Activity, Cpu, GitBranch, ArrowLeft, LogOut,
  CheckSquare, Map, BarChart2, Bell, Settings, Trash2, X,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Inbox, Circle, ChevronRight, Search, Pen: PenLine, Grid: LayoutGrid,
  Users, Eye, More: MoreHorizontal, Plus, Help: HelpCircle, Layers,
  Tag, File: FileText, Zap, Bot, Msg: MessageSquare, Shield, Link,
  Card: CreditCard, Download, Activity, Cpu, Git: GitBranch,
  Check: CheckSquare, Map, BarChart: BarChart2, Bell, Settings,
};

interface GroupItem {
  icon: string;
  label: string;
  to?: string;
  badge?: number;
}
interface Group {
  label: string;
  key: string;
  items: GroupItem[];
}
interface Team {
  id: string;
  name: string;
}

const workspaceGroups: Group[] = [
  {
    label: "Workspace", key: "workspace",
    items: [
      { icon: "Grid",     label: "Genel Bakış",  to: "/dashboard" },
      { icon: "Grid",     label: "Projeler",      to: "/test-projelerim" },
      { icon: "Users",    label: "Teams",         to: "/team" },
      { icon: "Users",    label: "Members",       to: "/members" },
      { icon: "BarChart", label: "Raporlar",      to: "/reports" },
      { icon: "Tag",      label: "Ayarlar",       to: "/settings" },
    ],
  },
];

const tryGroup: Group = {
  label: "Try", key: "try",
  items: [
    { icon: "Activity", label: "Pulse", to: "/pulse" },
    // AI menüsü geçici kapalı — açmak için yorumu kaldır
    // { icon: "Cpu",      label: "AI",    to: "/ai" },
  ],
};

const settingsGroups: Group[] = [
  {
    label: "", key: "account",
    items: [
     // { icon: "Tag",    label: "Preferences",        to: "/settings/preferences" },
     { icon: "Users",  label: "Profile",             to: "/settings/profile" },
      //{ icon: "Inbox",  label: "Notifications",       to: "/settings/notifications", badge: 3 },
      { icon: "Shield", label: "Security & access",   to: "/settings/security" },
      { icon: "Link",   label: "Connected accounts",  to: "/settings/connections" },
    ],
  },
  {
    label: "Issues", key: "issues_s",
    items: [
      //{ icon: "Tag",  label: "Labels",    to: "/settings/labels" },
      { icon: "File", label: "Templates", to: "/settings/templates" },
      //{ icon: "Zap",  label: "SLAs",      to: "/settings/slas" },
    ],
  },
  {
    label: "Features", key: "features",
    items: [
      //{ icon: "Layers", label: "Initiatives",      to: "/settings/initiatives" },
      { icon: "File",   label: "Documents",         to: "/settings/documents" },
      //{ icon: "Msg",    label: "Customer requests", to: "/settings/requests" },
      //{ icon: "Zap",    label: "Pulse",             to: "/settings/pulse" },
      //{ icon: "Cpu",    label: "AI",                to: "/settings/ai" },
      //{ icon: "Bot",    label: "Agents",            to: "/settings/agents" },
    ],
  },
  {
    label: "Administration", key: "admin",
    items: [
      //{ icon: "Grid",     label: "Workspace",       to: "/settings/workspace" },
      //{ icon: "Users",    label: "Teams",           to: "/settings/teams" },
      //{ icon: "Users",    label: "Members",         to: "/settings/members" },
      //{ icon: "Shield",   label: "Security",        to: "/settings/security-admin" },
      // { icon: "Git",      label: "API",             to: "/settings/api" },
      //{ icon: "Link",     label: "Applications",    to: "/settings/applications" },
      { icon: "Card",     label: "Billing",         to: "/settings/billing" },
      { icon: "Download", label: "Export", to: "/settings/import" },
    ],
  },
];

interface NavButtonProps {
  iconKey: string;
  label: string;
  badge?: number;
  to?: string;
  indent?: boolean;
}

function NavButton({ iconKey, label, badge, to, indent = false }: NavButtonProps) {
  const Icon = iconMap[iconKey];
  const baseStyle = `w-full flex items-center gap-2 rounded-md border-none cursor-pointer text-left text-[12.5px] transition-colors duration-100 ${indent ? "pl-5 pr-2 py-1.5" : "px-2 py-1.5"}`;
  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `${baseStyle} ${isActive
            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
            : "text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 font-normal"}`
        }
      >
        <span className="flex items-center opacity-70">
          {Icon && <Icon size={15} />}
        </span>
        <span className="flex-1">{label}</span>
        {badge && badge > 0 && (
          <span className="bg-blue-500 text-white rounded-full px-1.5 py-0 text-[11px] font-semibold">
            {badge}
          </span>
        )}
      </NavLink>
    );
  }
  return (
    <button className={`${baseStyle} text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700`}>
      <span className="flex items-center opacity-70">
        {Icon && <Icon size={15} />}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"main" | "settings">("main");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [addingTeam, setAddingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamsCollapsed, setTeamsCollapsed] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch (error) { console.error("Kullanıcı verisi ayrıştırılamadı:", error); }
    }
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.myOrganizations) {
          setTeams(data.myOrganizations.map((org: any) => ({ id: org.id, name: org.name })));
        }
      } catch (err) { console.error("Takımlar yüklenemedi:", err); }
    };
    fetchTeams();
    const handler = () => fetchTeams();
    window.addEventListener("teams-updated", handler);
    return () => window.removeEventListener("teams-updated", handler);
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeOrgId");
    navigate("/login");
  };

  const toggle = (key: string) => setCollapsed(p => ({ ...p, [key]: !p[key] }));
  const groups = mode === "main" ? workspaceGroups : settingsGroups;

  const handleAddTeam = () => {
    const trimmed = newTeamName.trim();
    if (!trimmed) return;
    setTeams(prev => [...prev, { id: Date.now().toString(), name: trimmed }]);
    setNewTeamName("");
    setAddingTeam(false);
  };

  const handleDeleteTeam = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddTeam();
    if (e.key === "Escape") { setAddingTeam(false); setNewTeamName(""); }
  };

  return (
    // FIXED SIDEBAR: konum sabit, tüm ekran yüksekliği, kendi içinde kaydırma
    <div className="fixed top-0 left-0 w-[220px] h-screen bg-[#f1f5fd] dark:bg-gray-900 border-r border-[#d1deff] dark:border-gray-700 flex flex-col overflow-y-auto z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-2.5 pt-2.5 pb-1">
        <button
          onClick={() => setMode(mode === "main" ? "settings" : "main")}
          className="flex items-center gap-1.5 px-1.5 py-1 rounded-md border-none bg-transparent cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
            {user ? getInitials(user.name) : "T"}
          </span>
          <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
            {user ? user.name.split(" ")[0] : "TaskiFlow"}
          </span>
          <ChevronRight size={13} className="text-slate-400" />
        </button>
        <div className="flex gap-0.5">
          {[Search, PenLine].map((Icon, i) => (
            <button key={i} className="bg-transparent border-none cursor-pointer p-1 rounded-md text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors flex items-center">
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Back to app */}
      {mode === "settings" && (
        <button
          onClick={() => setMode("main")}
          className="flex items-center gap-1.5 px-3.5 py-2 border-none bg-transparent cursor-pointer text-blue-600 text-xs border-b border-[#d1deff] dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft size={13} />
          Back to app
        </button>
      )}

      {/* Main shortcuts */}
      {mode === "main" && (
        <div className="px-2.5 pt-1.5 pb-0.5">
          <NavButton iconKey="Inbox" label="Inbox" badge={3} to="/inbox" />
          <NavButton iconKey="Circle" label="My issues" to="/tasks" />
        </div>
      )}

      {/* Groups */}
      <div className="px-2.5 pb-2.5 flex-1">
        {groups.map((group) => (
          <div key={group.key}>
            {group.label ? (
              <button
                onClick={() => toggle(group.key)}
                className="flex items-center gap-1 w-full px-1.5 py-1 mt-2 border-none bg-transparent cursor-pointer rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight
                  size={12}
                  className="text-slate-400 transition-transform duration-150"
                  style={{ transform: collapsed[group.key] ? "rotate(0deg)" : "rotate(90deg)" }}
                />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  {group.label}
                </span>
              </button>
            ) : (
              <div className="mt-2" />
            )}
            {!collapsed[group.key] && group.items.map(({ icon, label, badge, to }) => (
              <NavButton
                key={label + group.key}
                iconKey={icon}
                label={label}
                badge={badge}
                to={to}
                indent={!!group.label && mode === "main"}
              />
            ))}
          </div>
        ))}

        {/* YOUR TEAMS */}
        {mode === "main" && (
          <div>
            <div className="flex items-center w-full mt-2">
              <button
                onClick={() => setTeamsCollapsed(p => !p)}
                className="flex items-center gap-1 flex-1 px-1.5 py-1 border-none bg-transparent cursor-pointer rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight
                  size={12}
                  className="text-slate-400 transition-transform duration-150"
                  style={{ transform: teamsCollapsed ? "rotate(0deg)" : "rotate(90deg)" }}
                />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Your teams
                </span>
              </button>
              <button
                onClick={() => { setAddingTeam(true); setTeamsCollapsed(false); }}
                className="p-1 mr-1 rounded-md border-none bg-transparent cursor-pointer text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                title="Yeni takım ekle"
              >
                <Plus size={13} />
              </button>
            </div>
            {!teamsCollapsed && (
              <>
                {teams.map((team) => (
                  <div key={team.id} className="group flex items-center">
                    <NavLink
                      to={`/teams/${team.id}`}
                      className={({ isActive }) =>
                        `flex-1 flex items-center gap-2 pl-5 pr-2 py-1.5 rounded-md text-[12.5px] transition-colors duration-100 ${
                          isActive
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
                            : "text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-700 font-normal"
                        }`
                      }
                    >
                      <span className="flex items-center opacity-70"><Circle size={15} /></span>
                      <span className="flex-1 truncate">{team.name}</span>
                    </NavLink>
                    <button
                      onClick={(e) => handleDeleteTeam(e, team.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 mr-1 rounded-md border-none bg-transparent cursor-pointer text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                      title="Takımı sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {addingTeam && (
                  <div className="flex items-center gap-1 pl-5 pr-1 py-1">
                    <input
                      autoFocus
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Takım adı..."
                      className="flex-1 text-[12px] bg-white dark:bg-gray-700 border border-blue-300 dark:border-gray-600 rounded-md px-2 py-1 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                    />
                    <button
                      onClick={() => { setAddingTeam(false); setNewTeamName(""); }}
                      className="p-1 rounded-md border-none bg-transparent cursor-pointer text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {teams.length === 0 && !addingTeam && (
                  <p className="pl-6 py-1 text-[11px] text-slate-400 italic">Henüz takım yok</p>
                )}
              </>
            )}
          </div>
        )}

        {/* TRY */}
        {mode === "main" && (
          <div>
            <button
              onClick={() => toggle(tryGroup.key)}
              className="flex items-center gap-1 w-full px-1.5 py-1 mt-2 border-none bg-transparent cursor-pointer rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight
                size={12}
                className="text-slate-400 transition-transform duration-150"
                style={{ transform: collapsed[tryGroup.key] ? "rotate(0deg)" : "rotate(90deg)" }}
              />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {tryGroup.label}
              </span>
            </button>
            {!collapsed[tryGroup.key] && tryGroup.items.map(({ icon, label, to }) => (
              <NavButton key={label} iconKey={icon} label={label} to={to} indent />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#d1deff] dark:border-gray-700 px-2.5 py-2">
        <div className="group flex items-center gap-2 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
              {user ? getInitials(user.name) : "??"}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">
              {user ? user.name : "Yükleniyor..."}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user ? user.email : "..."}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 text-slate-400 hover:text-red-500"
            title="Çıkış Yap"
          >
            <LogOut size={14} />
          </button>
        </div>
        <NavButton iconKey="Help" label="Help & feedback" to="/help" />
      </div>
    </div>
  );
}