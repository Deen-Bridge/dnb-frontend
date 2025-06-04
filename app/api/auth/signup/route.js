import axiosInstance from "@/lib/config/axios.config";

export async function POST(req) {
  const { name, email, password, role } = await req.json();
  console.log("Received data:", { name, email, password, role });
  try {
    const response = await axiosInstance.post(
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
    console.error("Signup error:", error.response?.data || error.message);
    return new Response(
      JSON.stringify(error.response?.data || { message: "Signup failed" }),
      {
        status: error.response?.status || 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
