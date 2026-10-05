import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5500";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const healthApi = {
    check: async () => {
        const response = await api.get("/api/health");

        return response.data;
    },
};

export default api;