import axios from "axios"


const axiosinstance = axios.create({
    baseURL: "/",
    withCredentials:true
})
export default axiosinstance;