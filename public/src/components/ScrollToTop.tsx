import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // الانتقال لأعلى الصفحة عند تغيير المسار
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
