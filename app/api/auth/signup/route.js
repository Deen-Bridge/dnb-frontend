import axios from "axios";

export async function POST(req) {
    const { name, email, password, role } = await req.json();
    console.log("Received data:", { name, email, password, role });
    try {
        const response = await axios.post(
        "https://dnb-backend-api.onrender.com/api/auth/register",
        {
            name,
            email,
            password,
            role,
        }
        );
        return new Response(JSON.stringify(response.data), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
        });
    } catch (error) {
        return new Response(JSON.stringify(error.response.data), {
        status: error.response.status,
        headers: {
            "Content-Type": "application/json",
        },
        });
    }
    }


