import Cookies from "js-cookie";
const token = Cookies.getItem('authToken');

const config = {
    headers: {
        Authorization: `Bearer ${token}`
    }
}
export default config;