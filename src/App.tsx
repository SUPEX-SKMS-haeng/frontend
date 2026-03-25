import { Provider as JotaiProvider } from 'jotai'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import queryClient from '@/lib/queryClient'
import router from '@/routes'

const App = () => {
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </JotaiProvider>
  )
}

export default App
