import { Suspense } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/components/features/dashboard/Dashboard';
import UsersPage from '@/components/features/users/Users';
import OrganizationsPage from '@/components/features/organizations/Organizations';
import DeploymentsPage from '@/components/features/deployments/Deployments';
import { ProtectedRoute } from '@/components/auth';
import Login from '@/pages/Login';

// 라우터는 모듈 레벨에서 한 번만 생성 — 컴포넌트 내부에 두면 렌더링 시마다 재생성됨
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/login' element={<Login />} />
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to='/dashboard' replace />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='organizations' element={<OrganizationsPage />} />
        <Route path='users' element={<UsersPage />} />
        <Route path='deployments' element={<DeploymentsPage />} />
        <Route
          path='chats'
          element={<div className='p-8'>채팅 관리 페이지 (추후 구현)</div>}
        />
      </Route>
    </>
  )
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRoutes;
