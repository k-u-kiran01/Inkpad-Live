import { config } from "dotenv";

config();

export const {port="5000" , NODE_ENV, db_url , jwt_secret_key , jwt_expiry} = process.env
