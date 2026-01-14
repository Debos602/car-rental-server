import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  default_password: process.env.DEFAULT_PASSWORD,
  jwt_access_token_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  reset_password_ui_link: process.env.RESET_PASS_UI_LINK,
  Store_Id: process.env.STORE_ID,
  Signature_Key: process.env.SIGNATURE_KEY,
  Payment_url: process.env.PAYMENT_URL,
  Payment_verify_url: process.env.PAYMENT_VERIFY_URL,
  Client_url: process.env.CLIENT_URL,
  Server_url: process.env.SERVER_URL,
};

export default config;
