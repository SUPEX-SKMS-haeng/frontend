import { Suspense } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { ChatLayout } from '@/components/layout';
import Chat from '@/components/chat/Chat';

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className='flex items-center justify-center h-screen w-screen bg-surface'>
    <div className='flex flex-col items-center gap-3'>
      <div className='w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin' />
      <span className='text-14 text-text-secondary'>Loading...</span>
    </div>
  </div>
);

const AppRoutes = () => {
  const routes = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path='/'
          element={
            <ChatLayout>
              <Outlet />
            </ChatLayout>
          }
        >
          <Route index element={<Chat />} />
          <Route path='chat' element={<Chat />} />
          <Route path='chat/:chatId' element={<Chat />} />
        </Route>
      </>
    )
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={routes} />
    </Suspense>
  );
};

export default AppRoutes;
