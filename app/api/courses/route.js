import axios from 'axios';

export async function GET(req, res) {
    const response = await axios.get(
      "https://dnb-backend-api.onrender.com/api/courses"
    );
return new Response(JSON.stringify(response.data), {
  status: res.status,
  headers: {
    "Content-Type": "application/json",
  },
});
}