/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./auth/stores/AuthProvider.tsx";

const root = document.getElementById("root");

render(
  () => (
    <AuthProvider>
      <App />
    </AuthProvider>
  ),
  root!,
);
