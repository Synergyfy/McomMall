// app/dashboard/agent/components/SideMenu.tsx
import { FC } from 'react';
import Link from 'next/link';
import {
  Home,
  Briefcase,
  CheckCircle,
  ClipboardList,
  DollarSign,
  BookOpen,
  User,
  Settings,
  HelpCircle,
} from 'lucide-react';

const UserProfile = () => (
  <div className="text-center p-4 border-b">
    <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-2"></div>
    <p className="font-semibold">Agent Name</p>
    <p className="text-sm text-gray-500">Certified Agent</p>
  </div>
);

const NavLink: FC<{ href: string; icon: JSX.Element; label: string }> = ({
  href,
  icon,
  label,
}) => (
  <Link
    href={href}
    className="flex items-center p-3 text-gray-600 hover:bg-gray-100 rounded-md"
  >
    {icon}
    <span className="ml-3">{label}</span>
  </Link>
);

const SideMenu: FC = () => {
  return (
    <aside className="w-64 bg-white shadow-md">
      <UserProfile />
      <nav className="p-4">
        <ul>
          <li>
            <NavLink
              href="/dashboard/agent"
              icon={<Home className="w-5 h-5" />}
              label="Home"
            />
          </li>
          <li>
            <NavLink
              href="/dashboard/agent/available-tasks"
              icon={<Briefcase className="w-5 h-5" />}
              label="Available Tasks"
            />
          </li>
          <li>
            <NavLink
              href="/dashboard/agent/active-tasks"
              icon={<CheckCircle className="w-5 h-5" />}
              label="Active Tasks"
            />
          </li>
          <li>
            <NavLink
              href="/dashboard/agent/completed-tasks"
              icon={<ClipboardList className="w-5 h-5" />}
              label="Completed Tasks"
            />
          </li>
          <li>
            <NavLink
              href="/dashboard/agent/earnings"
              icon={<DollarSign className="w-5 h-5" />}
              label="Earnings & Payouts"
            />
          </li>
          <li>
            <NavLink
              href="/dashboard/agent/training"
              icon={<BookOpen className="w-5 h-5" />}
              label="Training"
            />
          </li>
          <li>
            <NavLink
              href="/dashboard/agent/profile"
              icon={<User className="w-5 h-5" />}
              label="Profile"
            />
          </li>
          <li>
            <NavLink
              href="/dashboard/agent/settings"
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
            />
          </li>
          <li>
            <NavLink
              href="/dashboard/agent/support"
              icon={<HelpCircle className="w-5 h-5" />}
              label="Help & Support"
            />
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SideMenu;
