import { createBrowserRouter, Outlet } from 'react-router-dom'

import ChatLayout from '@/components/layout/ChatLayout'
import Chat from '@/components/features/chat/Chat'
import ProtectedRoute from '@/routes/ProtectedRoute'
import NotFoundPage from '@/pages/NotFoundPage'
import ForbiddenPage from '@/pages/ForbiddenPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ChatLayout>
          <Outlet />
        </ChatLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Chat /> },
      { path: 'chat', element: <Chat /> },
      { path: 'chat/:chatId', element: <Chat /> },
    ],
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
])

export default router
