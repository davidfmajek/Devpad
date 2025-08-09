// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "./AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor"; // <- NEW

export default function App() {
  const { token } = useContext(AuthContext);

  const requireAuth = (el) => (token ? el : <Navigate to="/login" replace />);

  return (
    <Routes>
      {/* index route at “/” */}
      <Route
        index
        element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* public */}
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* app */}
      <Route path="dashboard" element={requireAuth(<Dashboard />)} />
      <Route path="notes">
        <Route path="new" element={requireAuth(<Editor mode="new" />)} />
        <Route path=":id" element={requireAuth(<Editor />)} />
      </Route>

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
