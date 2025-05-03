import axios from "axios";

export async function POST(req){
    const {username, password} = await req.json();
    const res = await axios.post("https://dnb-backend-api.onrender.com/api/auth/login", {
        username,
        password
    });
    return new Response(JSON.stringify(res.data), {
        status: res.status,
        headers: {
            "Content-Type": "application/json"
        }
    });
}