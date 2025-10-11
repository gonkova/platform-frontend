"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Role {
  name: string;
  display_name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  two_factor_enabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/me");
      setUser(response.data.user);
      setToken(storedToken);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });

      // Провери дали изисква 2FA
      if (response.data.requires_2fa) {
        // Login page ще handle 2FA flow
        throw {
          requires_2fa: true,
          temp_token: response.data.temp_token,
        };
      }

      // Ако няма 2FA, директен login
      const { user: userData, token: userToken } = response.data;

      localStorage.setItem("token", userToken);
      setToken(userToken);
      setUser(userData);
      router.push("/dashboard");
    } catch (error: any) {
      // Ако е 2FA error, пробвай го нагоре
      if (error.requires_2fa) {
        throw error;
      }
      throw new Error(error.response?.data?.message || "Грешка при вход");
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      router.push("/login");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        checkAuth,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
