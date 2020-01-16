import Axios from "axios";

const api = Axios.create({
    baseURL:'http://192.168.0.182:3333',
});

export default api;