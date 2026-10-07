import axios from "axios";
import { APP_CONFIG } from "../config/app";

const api = axios.create({
    baseURL: APP_CONFIG.API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 15000
});


/*
|--------------------------------------------------------------------------
| Availability API
|--------------------------------------------------------------------------
*/

export const availabilityApi = {

    get: async (startDate, endDate) => {

        const response =
            await api.get(
                "/api/availability",
                {
                    params: {
                        start_date: startDate,
                        end_date: endDate
                    }
                }
            );

        return response.data;
    }

};


/*
|--------------------------------------------------------------------------
| Booking API
|--------------------------------------------------------------------------
*/

export const bookingApi = {

    create: async (bookingData) => {

        const response =
            await api.post(
                "/api/bookings",
                bookingData
            );

        return response.data;
    }

};


/*
|--------------------------------------------------------------------------
| Services API
|--------------------------------------------------------------------------
*/

export const servicesApi = {

    get: async () => {

        const response =
            await api.get(
                "/api/services"
            );

        return response.data;
    }

};


/*
|--------------------------------------------------------------------------
| Admin Availability API
|--------------------------------------------------------------------------
*/

export const adminAvailabilityApi = {

    getBlockedDates: async (
        token
    ) => {

        const response =
            await api.get(
                "/api/admin/availability/blocked",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    },

    blockDate: async (
        token,
        date,
        reason = null
    ) => {

        const response =
            await api.post(
                "/api/admin/availability/block",
                {
                    date,
                    reason
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    },

    unblockDate: async (
        token,
        date
    ) => {

        const response =
            await api.delete(
                `/api/admin/availability/block/${date}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    },

    updateSlotAvailability: async (
        token,
        slotId,
        isAvailable
    ) => {

        const response =
            await api.patch(
                `/api/admin/availability/slots/${slotId}`,
                {
                    is_available: isAvailable
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    }

};


/*
|--------------------------------------------------------------------------
| Admin Booking API
|--------------------------------------------------------------------------
*/

export const adminBookingApi = {

    createManualBooking: async (
        token,
        bookingData
    ) => {

        const response =
            await api.post(
                "/api/admin/bookings/manual",
                bookingData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    }

};

export const adminServicesApi = {
    getAll: async (token) => {
        const response =
            await api.get(
                "/api/services/admin",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    },

    create: async (
        token,
        serviceData
    ) => {
        const response =
            await api.post(
                "/api/services/admin",
                serviceData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    },

    update: async (
        token,
        serviceId,
        serviceData
    ) => {
        const response =
            await api.patch(
                `/api/services/admin/${serviceId}`,
                serviceData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    }
};

export const portfolioApi = {

    get: async () => {
        const response =
            await api.get(
                "/api/portfolio"
            );

        return response.data;
    },

    getCategories: async () => {
        const response =
            await api.get(
                "/api/portfolio/categories"
            );

        return response.data;
    }
};


export const adminPortfolioApi = {

    getAll: async (token) => {
        const response =
            await api.get(
                "/api/portfolio/admin",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    },

    create: async (
        token,
        portfolioData
    ) => {
        const response =
            await api.post(
                "/api/portfolio/admin",
                portfolioData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    },

    update: async (
        token,
        portfolioId,
        portfolioData
    ) => {
        const response =
            await api.patch(
                `/api/portfolio/admin/${portfolioId}`,
                portfolioData,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    },

    uploadImage: async (token, file) => {
        const formData = new FormData();

        formData.append("image", file);

        const response = await api.post(
            "/api/portfolio/admin/upload",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": undefined
                }
            }
        );

        return response.data;
    },
};

export default api;