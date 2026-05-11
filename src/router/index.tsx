import { createBrowserRouter /* redirect */ } from 'react-router-dom';
// import { isLogin } from '@design-platform/shared';
import ImageDesign from '../pages/design';

export const router = createBrowserRouter(
  [
    {
      path: '/image-design',
      element: <ImageDesign />,
      // loader: async () => {
      //   const logged = isLogin();
      //   if (!logged) return redirect('/login');
      //   return true;
      // },
    },
    {
      path: '/',
      element: <ImageDesign />,
    },
  ],
  {
    basename: BASENAME,
  },
);
