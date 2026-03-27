import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
} from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import Login from '@/pages/Login';
import NotFoundPage from '@/pages/NotFoundPage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import ChatLayout from '@/components/layout/chat/ChatLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import Chat from '@/components/features/chat/Chat';
import Dashboard from '@/components/features/admin/dashboard/Dashboard';
import Organizations from '@/components/features/admin/organizations/Organizations';
import Users from '@/components/features/admin/users/Users';
import Deployments from '@/components/features/admin/deployments/Deployments';

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/login' element={<Login />} />

      {/* Chat routes */}
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <ChatLayout>
              <Outlet />
            </ChatLayout>
          </ProtectedRoute>
        }
      >
        <Route index element={<Chat />} />
        <Route path='chat' element={<Chat />} />
        <Route path='chat/:chatId' element={<Chat />} />
      </Route>

      {/* Admin routes */}
      <Route
        path='/admin'
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to='/admin/dashboard' replace />} />
        <Route path='dashboard' element={<Dashboard />} />
        <Route path='organizations' element={<Organizations />} />
        <Route path='users' element={<Users />} />
        <Route path='deployments' element={<Deployments />} />
      </Route>

      <Route path='/403' element={<ForbiddenPage />} />
      <Route path='*' element={<NotFoundPage />} />
    </>
  )
);
