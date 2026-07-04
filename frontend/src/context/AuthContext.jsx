import { createContext, useContext, useState, useEffect } from "react";
import { getMeApi, loginApi, logoutApi, registerApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await getMeApi();
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, mat_khau) => {
    const res = await loginApi({ email, mat_khau });
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (ho_ten, email, mat_khau) => {
    await registerApi({ ho_ten, email, mat_khau });
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
