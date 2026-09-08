import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getBusinesses } from "../services/api";
import { useAuth } from "./AuthContext";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [activeCompany, setActiveCompany] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadCompanies = useCallback(async () => {
        if (!isAuthenticated) {
            setCompanies([]);
            setActiveCompany(null);
            return;
        }

        setLoading(true);
        try {
            const data = await getBusinesses();
            setCompanies(data);

            if (data && data.length > 0) {
                const savedId = localStorage.getItem("active_business_id");
                const matched = data.find(c => String(c.id) === String(savedId));
                const current = matched || data[0];
                setActiveCompany(current);
                localStorage.setItem("active_business_id", current.id);
            } else {
                setActiveCompany(null);
            }
        } catch (err) {
            console.error("Error loading businesses:", err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadCompanies();
    }, [loadCompanies]);

    const selectCompany = (company) => {
        setActiveCompany(company);
        if (company) {
            localStorage.setItem("active_business_id", company.id);
        }
    };

    return (
        <CompanyContext.Provider
            value={{
                companies,
                activeCompany,
                setActiveCompany: selectCompany,
                refreshCompanies: loadCompanies,
                loading
            }}
        >
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => useContext(CompanyContext);
