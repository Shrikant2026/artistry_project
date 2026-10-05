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

        const response = await api.get(
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

        const response = await api.post(
            "/api/bookings",
            bookingData
        );

        return response.data;
    }

};


export const servicesApi = {
    get: async () => {
        const response = await api.get(
            "/api/services"
        );

        return response.data;
    }
};

export default api;