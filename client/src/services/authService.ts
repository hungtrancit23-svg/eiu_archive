import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authService = {
  login: async (username: string, password: string) => {
    console.log("API_URL:", API_URL);

    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password,
    });

    const token = response.data.token;
    localStorage.setItem("token", token);
    return response.data;
  },

  // THÊM MỚI: Hàm xử lý Đăng nhập Google
  googleLogin: async (idToken: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        idToken,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);
      }
      return response.data;
    } catch (error) {
      throw new Error("Google login failed");
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      localStorage.removeItem("token");
    } catch (error) {
      throw new Error("Logout failed");
    }
  },

  register: async (username: string, password: string, email: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
        email,
      });
      return response.data;
    } catch (error) {
      throw new Error("Registration failed");
    }
  },
};

export default authService;