import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "../features/auth/AuthProvider";
import { router } from "./router";

const App = () => (
  <>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    <Toaster
      dir="rtl"
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--surface)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-elevated)",
          color: "var(--ink)",
          direction: "rtl",
          fontFamily: "inherit",
          textAlign: "right",
        },
      }}
    />
  </>
);

export default App;
