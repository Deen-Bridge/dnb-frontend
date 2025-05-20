import Cookies from "js-cookie";

const token = Cookies.get("authToken");

const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

export default config;
