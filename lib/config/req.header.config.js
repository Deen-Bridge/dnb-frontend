import Cookies from "js-cookie";

const token = Cookies.get("authToken");
console.log("Token from cookies:", token);
if (!token) {
  console.error("No auth token found in cookies");
}
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

export default config;
