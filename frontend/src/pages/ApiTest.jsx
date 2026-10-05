import { useEffect, useState } from "react";
import { availabilityApi } from "../services/api";

export default function ApiTest() {

    const [status, setStatus] = useState("Testing...");
    const [data, setData] = useState(null);

    useEffect(() => {

        const testApi = async () => {

            try {

                const response =
                    await availabilityApi.get(
                        "2026-10-01",
                        "2026-10-31"
                    );

                setData(response);

                setStatus(
                    response.success
                        ? "API connection successful"
                        : "API returned an error"
                );

            } catch (error) {

                console.error(error);

                setStatus(
                    "Unable to connect to backend"
                );
            }
        };

        testApi();

    }, []);

    return (
        <div
            style={{
                padding: "40px",
                fontFamily: "sans-serif"
            }}
        >

            <h1>{status}</h1>

            <pre>
                {JSON.stringify(
                    data,
                    null,
                    2
                )}
            </pre>

        </div>
    );
}