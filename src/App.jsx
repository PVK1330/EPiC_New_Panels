import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import AppRouter from "./routes/AppRouter";
import ScrollToTop from "./components/ScrollToTop";
import SessionTimeout from "./components/common/SessionTimeout";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <SessionTimeout>
            <AppRouter />
          </SessionTimeout>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4500,
              style: { fontWeight: 700, borderRadius: "12px" },
            }}
          />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;