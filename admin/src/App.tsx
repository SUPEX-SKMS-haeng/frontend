import { i18nInitialize } from '@/locale/config';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { queryClientAtom } from 'jotai-tanstack-query';
import { queryClient } from '@shared/lib/queryClient';
import AppRoutes from './routes/AppRoutes';
import { useAxiosInterceptor } from '@shared/hooks/useAxiosInterceptor';
import { useFetchInterceptor } from '@shared/hooks/useFetchInterceptor';

i18nInitialize();

// jotai-tanstack-query가 QueryClientProvider와 동일한 queryClient를 쓰도록 store에 주입
const jotaiStore = createStore();
jotaiStore.set(queryClientAtom, queryClient);

const App = () => {
  useAxiosInterceptor();
  useFetchInterceptor();

  return (
    <JotaiProvider store={jotaiStore}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </JotaiProvider>
  );
};

export default App;
