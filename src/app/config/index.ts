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
  cloud_name: process.env.cloudinary_cloudeName,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_seqret,
  reset_password_ui_link: process.env.RESET_PASS_UI_LINK,
  Store_Id: process.env.Store_Id,
  Signature_Key: process.env.Signature_Key,
  Payment_url: process.env.Payment_url,
  Payment_verify_url: process.env.Payment_verify_url,
  Client_url: process.env.CLIENT_URL,
};

export default config;
