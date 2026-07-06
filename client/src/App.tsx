import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" closeButton richColors />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
