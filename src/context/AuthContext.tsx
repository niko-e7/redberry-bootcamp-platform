import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  age: number | null;
  profileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  modalState: "login" | "register" | null;
  openSidebar: () => void;
  showSidebar: boolean;
  closeSidebar: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [modalState, setModalState] = useState<"login" | "register" | null>(
    null,
  );
  const [showSidebar, setShowSidebar] = useState(false);

  // Attach token to all requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Restore session on app load
  useEffect(() => {
    if (token) {
      api
        .get("/me")
        .then((res) => setUser(res.data.data.user))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/login", { email, password });
    const { user, token } = res.data.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    closeModal();
  };

  const register = async (formData: FormData) => {
    const res = await api.post("/register", formData);
    const { user, token } = res.data.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    closeModal();
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const updateUser = (updatedUser: User) => setUser(updatedUser);
  const openLogin = () => setModalState("login");
  const openRegister = () => setModalState("register");
  const closeModal = () => setModalState(null);
  const openSidebar = () => setShowSidebar(true);
  const closeSidebar = () => setShowSidebar(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        openLogin,
        openRegister,
        closeModal,
        modalState,
        openSidebar,
        showSidebar,
        closeSidebar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
