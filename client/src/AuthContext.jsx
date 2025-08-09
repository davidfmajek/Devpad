import { createContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("devpad_token") || ""
  );

  useEffect(() => {
    if (token) localStorage.setItem("devpad_token", token);
    else localStorage.removeItem("devpad_token");
  }, [token]);

  const logout = () => setToken("");

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
