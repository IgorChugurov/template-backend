import jwt from "jsonwebtoken";
import config from "../config/auth.config.js";
export const verifyToken = (req, res, next) => {
    delete req.userId
    let token = req.headers["x-access-token"];
    if (!token) {
        req.authError = { message: "No token provided!" , status : 403 }
        return next()
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            req.authError = { message: "Unauthorized!" , status : 401 }
            return next()
        }
        req.userId = decoded.id;
        next();
    });
};