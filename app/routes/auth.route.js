import controllerAuth from "../controllers/auth.controller.js";
import express from 'express';
const router = express.Router();
router.post("/signup", controllerAuth.signup);
router.post("/signin", controllerAuth.signin);
export default router