import { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "./api/axios.api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      setUser(res.data.user);
      setIsAuth(true);
    } catch (err) {
      console.error("Error in checking auth", err);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      setIsAuth(false);
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuth(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuth, loading, checkAuth, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};