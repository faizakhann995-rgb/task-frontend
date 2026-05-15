import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const token =
    localStorage.getItem("token");

  return (
    <>
      {/* TOAST */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
      />

      {/* ROUTES */}
      <Routes>

        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/dashboard" />
            ) : (
              <Register />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            token ? (
              <Dashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

      </Routes>
    </>
  );
}

export default App;