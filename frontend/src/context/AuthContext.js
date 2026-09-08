import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, registerApi, googleAuthApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("billing_token") || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("billing_user");
        const storedToken = localStorage.getItem("billing_token");

        if (storedToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (err) {
                console.error("Error parsing stored user", err);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (usernameOrEmail, password) => {
        const data = await loginApi({ usernameOrEmail, password });
        if (data.token) {
            localStorage.setItem("billing_token", data.token);
            localStorage.setItem("billing_user", JSON.stringify(data));
            setToken(data.token);
            setUser(data);
        }
        return data;
    };

    const register = async (registerData) => {
        const data = await registerApi(registerData);
        if (data.token) {
            localStorage.setItem("billing_token", data.token);
            localStorage.setItem("billing_user", JSON.stringify(data));
            setToken(data.token);
            setUser(data);
        }
        return data;
    };

    const loginWithGoogle = async (googleData) => {
        const data = await googleAuthApi(googleData);
        if (data.token) {
            localStorage.setItem("billing_token", data.token);
            localStorage.setItem("billing_user", JSON.stringify(data));
            setToken(data.token);
            setUser(data);
        }
        return data;
    };

    const logout = () => {
        localStorage.removeItem("billing_token");
        localStorage.removeItem("billing_user");
        localStorage.removeItem("active_business_id");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                loading,
                login,
                register,
                loginWithGoogle,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
