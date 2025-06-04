import axiosInstance from "@/lib/config/axios.config";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    console.log("Forwarding login request to backend:", { email, password }); // Debugging

    const res = await axiosInstance.post(
      "https://dnb-backend-api.onrender.com/api/auth/login",
      {
        email,
        password,
      }
    );

    console.log("Backend response:", res.data); // Debugging
    return new Response(JSON.stringify(res.data), {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in login API route:", error.message); // Debugging
    console.error("Error details:", error.response?.data || error); // Debugging

    return new Response(
      JSON.stringify({
        message: "Internal Server Error",
        details: error.response?.data || error.message,
      }),
      {
        status: error.response?.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
