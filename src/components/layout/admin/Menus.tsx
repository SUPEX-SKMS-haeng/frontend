import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Boxes,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: <LayoutDashboard className='w-4 h-4' />,
    path: '/dashboard',
  },
  {
    id: 'organizations',
    label: '그룹 관리',
    icon: <Boxes className='w-4 h-4' />,
    path: '/organizations',
  },
  {
    id: 'users',
    label: '사용자 관리',
    icon: <Users className='w-4 h-4' />,
    path: '/users',
  },
  {
    id: 'deployments',
    label: '모델 관리',
    icon: <Zap className='w-4 h-4' />,
    path: '/deployments',
  },
  {
    id: 'chats',
    label: '채팅 관리',
    icon: <MessageSquare className='w-4 h-4' />,
    path: '/chats',
  },
];

const Menus = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className='flex-1 overflow-y-auto px-5'>
      <ul className='space-y-1'>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <li key={item.id}>
              <button
                type='button'
                onClick={() => navigate(item.path)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-all',
                  active
                    ? 'text-neutral-900 bg-neutral-100 font-medium'
                    : 'text-neutral-800 bg-neutral-100/50 hover:bg-neutral-200/50 hover:text-neutral-900'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Menus;
