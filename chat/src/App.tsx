import { i18nInitialize } from '@/locale/config';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@shared/lib/queryClient';
import AppRoutes from './routes/AppRoutes';
import { useAxiosInterceptor } from '@shared/hooks/useAxiosInterceptor';
import { useFetchInterceptor } from '@shared/hooks/useFetchInterceptor';

i18nInitialize();

const App = () => {
  useAxiosInterceptor();
  useFetchInterceptor();
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
};

export default App;
