import Cookies from "js-cookie";

const token = Cookies.get("authToken");
console.log("Token from cookies:", token);

if (!token || typeof token !== 'string') {
  console.error("No valid auth token found in cookies");
  // Optionally, you could throw an error or return null/undefined here
}else {
  console.log("Valid auth token found", token);
}

const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

export default config;
