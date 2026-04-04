import axios from "axios";

const api = axios.create({
  baseURL: "https://api.redclass.redberryinternship.ge/api",
});

export default api;