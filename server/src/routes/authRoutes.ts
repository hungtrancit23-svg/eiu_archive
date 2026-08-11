import express from "express";
import { register, login, googleLogin, deleteUser } from "../controllers/authController.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin); // Route mới cho Google Login
router.delete('/:userId', deleteUser);

export default router;