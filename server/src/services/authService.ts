import { OAuth2Client } from "google-auth-library";
import { userRepository } from "../repositories/userRepository.js";
import { generateToken } from "../utils/jwt.js";
import { bcryptUtils } from "../utils/bcrypt.js";

import { ConflictError } from "../errors/ConflictError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authService = {
  async registerUser(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    const { username, email, password } = userData;

    // Check required fields
    if (!username || !email || !password) {
      throw new ValidationError("Missing required fields.");
    }

    const isExist = await userRepository.isUsernameExists(username);

    if (isExist) {
      throw new ConflictError("Username already exists.");
    }

    const hashedPassword = await bcryptUtils.hashPassword(password);

    await userRepository.createUser(username, email, hashedPassword);
  },

  async loginUser(userData: { username: string; password: string }) {
    const { username, password } = userData;

    // Check required fields
    if (!username || !password) {
      throw new ValidationError("Missing required fields.");
    }

    const user = await userRepository.findUserByUsername(username);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // Kiểm tra nếu user tạo bằng Google mà không có mật khẩu
    if (!user.password) {
      throw new ValidationError("Account created via Google. Please login with Google.");
    }

    const isPasswordValid = await bcryptUtils.comparePasswords(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ValidationError("Invalid password.");
    }

    const token = generateToken({ id: user.id, username: user.username });

    return { token, user };
  },

  // THÊM MỚI: Hàm xử lý Đăng nhập bằng Google
  async googleLogin(idToken: string) {
    if (!idToken) {
      throw new ValidationError("Google idToken is required.");
    }

    // 1. Xác thực idToken gửi từ phía Frontend lên
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new ValidationError("Invalid Google token.");
    }

    const { sub: googleId, email, name, picture } = payload;

    // 2. Kiểm tra xem Email đã tồn tại trong CSDL chưa
    let user = await userRepository.findUserByEmail(email);

    if (!user) {
      // Nếu chưa có -> Tạo username ngẫu nhiên từ email & Tạo user mới
      const baseUsername = email.split("@")[0];
      const username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

      user = await userRepository.createGoogleUser({
        username,
        email,
        googleId,
        avatarUrl: picture,
        firstName: name,
      });
    } else if (!user.googleId) {
      // Nếu tài khoản đã tồn tại qua Đăng ký thường -> Cập nhật thêm googleId
      user = await userRepository.updateGoogleId(user.id, googleId);
    }

    // 3. Tạo JWT Token trả về cho client
    const token = generateToken({ id: user.id, username: user.username });

    return { token, user };
  },

  async logoutUser() {
    // Invalidate the token on the client side (handled in the frontend)
    // Optionally, you can implement token blacklisting on the server side if needed
  },

  async deleteUser(userId: string) {
    const user = await userRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found.");
    }

    await userRepository.deleteUserById(userId);
  },
};