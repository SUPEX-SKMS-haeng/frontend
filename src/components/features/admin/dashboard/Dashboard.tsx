import {
  LayoutDashboard,
  Users,
  Boxes,
  Zap,
  FileText,
  MessageSquare,
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: '전체 사용자',
      value: '1,234',
      change: '+12.5%',
      icon: <Users className='w-6 h-6' />,
      color: 'bg-blue-500',
    },
    {
      title: '활성 그룹',
      value: '45',
      change: '+3',
      icon: <Boxes className='w-6 h-6' />,
      color: 'bg-green-500',
    },
    {
      title: '등록된 모델',
      value: '12',
      change: '+2',
      icon: <Zap className='w-6 h-6' />,
      color: 'bg-purple-500',
    },
    {
      title: '프롬프트 템플릿',
      value: '89',
      change: '+5',
      icon: <FileText className='w-6 h-6' />,
      color: 'bg-orange-500',
    },
    {
      title: '오늘 채팅 수',
      value: '5,678',
      change: '+23.1%',
      icon: <MessageSquare className='w-6 h-6' />,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className='h-full bg-neutral-50'>
      {/* 헤더 */}
      <div className='bg-white border-b border-neutral-200 px-8 py-6'>
        <div className='flex items-center gap-3'>
          <LayoutDashboard className='w-6 h-6 text-neutral-700' />
          <h1 className='text-2xl font-bold text-neutral-900'>대시보드</h1>
        </div>
        <p className='mt-2 text-sm text-neutral-600'>
          LLM Gateway 관리 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className='p-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className='bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <p className='text-sm font-medium text-neutral-600 mb-1'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-neutral-900 mb-2'>
                    {stat.value}
                  </p>
                  <p className='text-xs font-medium text-green-600'>
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 차트 영역 (추후 구현) */}
        <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white rounded-xl border border-neutral-200 p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
              사용량 추이
            </h2>
            <div className='h-64 flex items-center justify-center text-neutral-400'>
              차트 영역 (추후 구현)
            </div>
          </div>
          <div className='bg-white rounded-xl border border-neutral-200 p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
              모델별 사용량
            </h2>
            <div className='h-64 flex items-center justify-center text-neutral-400'>
              차트 영역 (추후 구현)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
