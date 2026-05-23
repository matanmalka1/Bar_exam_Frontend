import { RouterProvider } from "react-router-dom";
import AppToaster from "../components/AppToaster";
import { AuthProvider } from "../features/auth/AuthProvider";
import { router } from "./router";

const App = () => (
  <>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    <AppToaster />
  </>
);

export default App;
