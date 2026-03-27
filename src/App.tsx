import { i18nInitialize } from '@/locale/config';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { queryClientAtom } from 'jotai-tanstack-query';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/routes';
import { useAxiosInterceptor } from '@/hooks/auth/useAxiosInterceptor';
import { useFetchInterceptor } from '@/hooks/auth/useFetchInterceptor';
import { RouterProvider } from 'react-router-dom';

i18nInitialize();

// jotai-tanstack-query가 QueryClientProvider와 동일한 queryClient를 쓰도록 store에 주입
const jotaiStore = createStore();
jotaiStore.set(queryClientAtom, queryClient);

const AppInner = () => {
  useAxiosInterceptor();
  useFetchInterceptor();

  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <JotaiProvider store={jotaiStore}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </JotaiProvider>
  );
};

export default App;
