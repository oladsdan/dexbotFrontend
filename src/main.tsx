import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { StatusProvider } from './context/statusContext.tsx';

createRoot(document.getElementById("root")!).render(
<StatusProvider>
    <App />
</StatusProvider>

);
