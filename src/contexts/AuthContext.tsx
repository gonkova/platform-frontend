"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import Cookies from "js-cookie";
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/me");
      setUser(response.data.user);
    } catch (error) {
      Cookies.remove("auth_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });
      const { user, token } = response.data;

      Cookies.set("auth_token", token, { expires: 7 });
      setUser(user);
      router.push("/dashboard");
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Грешка при вход");
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("auth_token");
      setUser(null);
      router.push("/login");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
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
