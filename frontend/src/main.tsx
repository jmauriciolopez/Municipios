import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <AuthProvider>
    <App />
    <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontSize: '0.875rem' } }} />
    <ConfirmDialog />
  </AuthProvider>,
);
