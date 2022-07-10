//The dotenv package is used to read environment variables from the .env file.
import dotenv from "dotenv";
dotenv.config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = { ...process.env };
const url = process.env.MONGODB_URL
  ? process.env.MONGODB_URL
  : process.env.NODE_ENV && process.env.NODE_ENV === "development"
  ? `mongodb://${DB_HOST}:27017/${DB_NAME}`
  : `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

export default {
  url: url,
};
