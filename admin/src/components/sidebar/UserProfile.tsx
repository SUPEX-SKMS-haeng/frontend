import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth, useCurrentUser } from '@shared/hooks/useAuth';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useCurrentUser();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return '';
  };

  const getUserName = () => {
    return user?.username || '';
  };

  const getUserCompany = () => {
    return user?.company || '';
  };

  const userRole = isSuperAdmin ? 'SuperAdmin' : 'Admin';

  return (
    <div className='flex-shrink-0 px-5 py-5 relative' ref={menuRef}>
      <div className='flex items-center gap-3.5'>
        {/* 아바타 */}
        <button
          type='button'
          aria-label='프로필 메뉴 열기'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='w-11 h-11 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-[15px] font-semibold text-neutral-700 shadow-sm hover:from-neutral-300 hover:to-neutral-400 transition-all'
        >
          {getInitial()}
        </button>

        {/* 이름 정보 */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <span className='text-[15px] font-semibold text-neutral-900 truncate'>
              {getUserName()}
            </span>
            {userRole && (
              <span className='text-[11px] font-medium text-neutral-600 bg-neutral-200 px-2 py-0.5 rounded-md'>
                {userRole}
              </span>
            )}
          </div>
          <div className='text-[13px] text-neutral-500 truncate mt-1'>
            {getUserCompany()}
          </div>
        </div>
      </div>

      {/* 드롭다운 메뉴 */}
      {isMenuOpen && (
        <div className='absolute bottom-full left-5 mb-2 w-48 py-1 rounded-xl bg-white border border-neutral-200 shadow-lg z-50'>
          <button
            type='button'
            onClick={handleLogout}
            className='w-full flex items-center gap-3 px-4 py-2.5 text-left text-[14px] text-neutral-700 hover:bg-neutral-50 transition-colors'
          >
            <LogOut className='w-4 h-4 text-neutral-500' />
            <span>로그아웃</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
