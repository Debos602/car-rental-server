import { Schema, model } from 'mongoose';

import { TUser } from './user.interface';

const userSchema = new Schema<TUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    phone: {
      type: String,
      required: true,
    },
    nid: {
      type: String,
      required: false,
    },
    drivingLicense: {
      type: String,
      required: false,
    },
    features: {
      type: [String],
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

// Password hashing middleware
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }

//   try {
//     // Assert that password is a string before hashing
//     if (typeof this.password === 'string') {
//       const salt = await bcrypt.genSalt(10);
//       this.password = await bcrypt.hash(this.password, salt);
//     } else {
//       throw new Error('Password is missing or not a string');
//     }
//     next(); // Proceed to the next middleware
//   } catch (error) {
//     next(); // Pass any errors to the next middleware
//   }
// });

export const UserModel = model<TUser>('User', userSchema);
