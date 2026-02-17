import { createContext, useContext, useEffect, useState } from "react";
import { initialState, type ActivityEntry, type Credentials, type FoodEntry, type User } from '../types';
import { useNavigate } from "react-router-dom";
import api from "../configs/api";
import toast from "react-hot-toast";

const AppContext = createContext(initialState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {

    // External Functions Imported & Self-Made Functions
    const navigate = useNavigate();

    // States
    const [user, setUser] = useState<User>(null);
    const [isUserFetched, setIsUserFetched] = useState(false);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
    const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);

    const signup = async (credentials: Credentials) => {
        try {
            const { data } = await api.post("/api/auth/local/register", credentials);

            setUser({ ...data.user, token: data.jwt });

            if (data?.user?.age && data?.user?.weight && data?.user?.goal) {
                setOnboardingCompleted(true);
            }

            localStorage.setItem("token", data.jwt);
            api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;

            toast.success("Account Created Successfully");
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || "Signup failed");
        }
    };

    const login = async (credentials: Credentials) => {
        try {
            const { data } = await api.post("/api/auth/local",
                { identifier: credentials.email, password: credentials.password }
            );

            setUser({ ...data.user, token: data.jwt });

            if (data?.user?.age && data?.user?.weight && data?.user?.goal) {
                setOnboardingCompleted(true);
            }

            localStorage.setItem("token", data.jwt);
            api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;

            toast.success("Logged in successfully");
        } catch (error: any) {
            console.log(error?.response?.data);
            toast.error(error?.response?.data?.error?.message || "Login failed");
        }
    };

    const fetchUser = async (token: string) => {
        try {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            const { data } = await api.get("/api/users/me");

            setUser({ ...data, token });

            if (data?.age && data?.weight && data?.goal) {
                setOnboardingCompleted(true);
            }

            setIsUserFetched(true);
        } catch (error: any) {
            console.log(error?.response?.data);
            toast.error(error?.response?.data?.error?.message || "Failed To Fetch user");
        } finally {
            setIsUserFetched(true);
        }
    };

    const fetchFoodLogs = async () => {
        try {
            const res = await api.get("/api/food-logs");

            const logs = Array.isArray(res.data) ? res.data : res.data.data;

            setAllFoodLogs(logs || []);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch food logs");
        }
    };

    const fetchActivityLogs = async () => {
        try {
            const res = await api.get("/api/activity-logs");

            const logs = Array.isArray(res.data) ? res.data : res.data.data;

            setAllActivityLogs(logs || []);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch activity logs");
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setOnboardingCompleted(false);
        api.defaults.headers.common['Authorization'] = '';
        navigate('/');
    }

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            (async () => {
                await fetchUser(token);
            })();
        } else {
            setIsUserFetched(true);
        }
    }, []);

    useEffect(() => {
        if (!user?.token) return;

        fetchFoodLogs();
        fetchActivityLogs();
    }, [user?.token]);

    const value = {
        user, setUser, isUserFetched, fetchUser,
        signup, login, logout, onboardingCompleted,
        setOnboardingCompleted, allFoodLogs, setAllFoodLogs, allActivityLogs,
        setAllActivityLogs
    }

    return <>
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    </>
};

export const useAppContext = () => useContext(AppContext);