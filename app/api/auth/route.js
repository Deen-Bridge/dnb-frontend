import axios from "axios";

export async function POST(req) {
  try {
    const{formData} = await req.json();
     
    return new Response(JSON.stringify(), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
