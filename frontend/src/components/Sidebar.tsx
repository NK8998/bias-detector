import { useState } from "react";
import useWindowPopstate from "../hooks/useWindowPopstate";
import {
  LayoutDashboard,
  GitMerge,
  Scale,
  BarChart3,
  UserCheck,
  Menu,
  X,
} from "lucide-react";

const sections = [
  { id: "global", name: "Global Metrics", icon: LayoutDashboard },
  { id: "logic", name: "Decision Breakdown", icon: GitMerge },
  { id: "fairness", name: "Fairness Check", icon: Scale },
  { id: "shap", name: "SHAP Plot", icon: BarChart3 },
  { id: "applicant", name: "Test Applicant", icon: UserCheck },
];

export const Sidebar = () => {
  const url = useWindowPopstate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`
        sticky top-0 h-screen border-r border-gray-300 bg-white text-black 
        transition-all duration-200 ease-in-out hidden lg:flex flex-col
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Top section */}
      <div className='flex items-center justify-between p-6 border-b border-gray-300'>
        {!collapsed && (
          <h2 className='text-xl font-bold tracking-tight whitespace-nowrap'>
            XAI Dashboard
          </h2>
        )}

        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className='p-2 rounded-md border border-gray-300 hover:bg-gray-100'
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-1'>
        {sections.map(({ id, name, icon: Icon }) => {
          const active = url.includes(`#${id}`);

          return (
            <a
              key={id}
              href={`#${id}`}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md transition-all
                border border-transparent whitespace-nowrap
                ${
                  active
                    ? "bg-gray-100 text-black font-semibold border-gray-300"
                    : "text-gray-700 hover:bg-gray-100"
                }
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? name : undefined}
            >
              <Icon size={18} />

              {!collapsed && <span>{name}</span>}
            </a>
          );
        })}
      </nav>
    </div>
  );
};
