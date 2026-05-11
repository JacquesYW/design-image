import { RouterProvider } from 'react-router-dom';
import { router } from './router';
// import { theme } from '@design-platform/shared';
// import { ConfigProvider } from 'antd';

const App = () => {
  return (
    // <ConfigProvider theme={theme}>
    <RouterProvider router={router} />
    // </ConfigProvider>
  );
};

export default App;
