import { useEffect } from 'react';
import { useAppStore } from '@store/appStore';
import { TopBar } from '@components/TopBar';
import { FeedView } from '@components/FeedView';
import { DetailView } from '@components/DetailView';
import { CategoriesView } from '@components/CategoriesView';
import { BottomBar } from '@components/BottomBar';
import { checkServices } from '@lib/healthCheck';

export default function App() {
  const view = useAppStore((s) => s.view);
  const setServiceStatus = useAppStore((s) => s.setServiceStatus);

  useEffect(() => {
    checkServices().then(({ ollama, flask }) => {
      setServiceStatus(ollama, flask);
    });
  }, [setServiceStatus]);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      <TopBar />

      <div className="relative flex-1 min-h-0 overflow-hidden">
        {view === 'feed' ? (
          <FeedView />
        ) : view === 'categories' || view === 'category_detail' ? (
          <CategoriesView />
        ) : (
          <DetailView />
        )}
      </div>

      {view !== 'feed' && <BottomBar />}
    </div>
  );
}
