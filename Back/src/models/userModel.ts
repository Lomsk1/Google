import mongoose, { Document, Model, Query } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

interface UserTypes {
  firstName: string;
  email: string;
  field: string;
  role: string;
  avatar: string;
  active: boolean;
  emailConfirmed: boolean;
  describeRoles: string;
  purpose: string;

  password: string;
  passwordConfirm: string;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
  emailConfirmToken: string;
  emailConfirmExpires: Date;

  calendarRefreshToken: string;

  workingSpace: mongoose.Types.ObjectId;
}
export interface UserDoc extends Document {
  firstName: string;
  email: string;
  field: string;
  role: string;
  avatar: string;
  active: boolean;
  emailConfirmed: boolean;
  describeRoles: string;
  purpose: string;

  password: string;
  passwordConfirm: string;
  passwordChangedAt: Date;
  passwordResetToken: string;
  passwordResetExpires: Date;
  emailConfirmToken: string;
  emailConfirmExpires: Date;

  calendarRefreshToken: string;

  workingSpace: mongoose.Types.ObjectId;

  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): Promise<boolean>;
  createPasswordResetToken(): Promise<boolean>;
  createConfirmationToken(): Promise<boolean>;
}

export interface UserModel extends Model<UserDoc> {
  build(attrs: UserTypes): UserDoc;
}

const userSchema = new mongoose.Schema<UserTypes>(
  {
    firstName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Please, tell us your Email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please, enter a valid email"], // This is for Email validation.
    },
    avatar: {
      type: String,
    },
    field: {
      type: String,
      enum: {
        values: ["work", "education", "personal"],
        message: "Field is either: Work, Education or Personal", // For Error message
      }, // Only this three string is valid in this field
    },
    role: {
      type: String,
      enum: {
        values: ["costumer", "admin"],
        message: "Role is either: Costumer or Personal",
      },
      default: "costumer", // Default value is ...
    },
    describeRoles: String,
    purpose: String,
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false, // If select is False, we don't receive this field as a response
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password field is Required"],
      minlength: 8, // Equal or more then 8
      maxlength: 64, // Maximum length is 64
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        "Password must contain: At least 1 lowercase/uppercase letter, 1 number & 1 special character",
      ], // If password contains at least 1 uppercase/lowercase  letter, 1 number, 1 special character. For more:
    },
    passwordConfirm: {
      type: String,
      required: [true, "Password confirmation is Required"],
      validate: {
        validator: function (el: string) {
          return el === this.password;
        },
        message: "Password should not match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    emailConfirmToken: String,
    passwordResetExpires: Date,
    emailConfirmExpires: Date,

    calendarRefreshToken: String,

    workingSpace: {
      type: mongoose.Schema.ObjectId,
      ref: "WorkingSpace",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("workingSpaceInvited", {
  ref: "WorkingSpaceInvitation",
  foreignField: "guest",
  localField: "_id",
  // justOne: true,
});

userSchema.pre(/^find/, async function (next) {
  const query = this as Query<UserModel[], UserModel>;

  query.populate({
    path: "workingSpaceInvited",
    select: "host _id -guest",
  });

  query.populate({
    path: "workingSpace",
    select: "name users _id",
  });

  next();
});

userSchema.pre("save", async function (next) {
  /* Only run this function if password was actually modified */
  if (!this.isModified("password")) return next();

  /* Hash the password with cost of 12 */
  this.password = await bcrypt.hash(this.password, 12);

  /* Delete passwordConfirmation field */
  this.passwordConfirm = undefined;
  next(); // Next function is for middleware. it is important when we use a Middleware
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

/* With with Middleware, we validate if user is active or not. Only Active users are allowed for response */
userSchema.pre(/^find/, function (this: Query<UserTypes[], UserTypes>, next) {
  this.find({ active: { $ne: false } });

  next();
});

/* This method is for checking if the password is correct or not. For login */
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);

  /* This will return False or True */
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      String(this.passwordChangedAt.getTime() / 1000)
    );
    return JWTTimestamp < changedTimestamp;
  }

  //   False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  /* This token is valid only 10 minutes */

  return resetToken;
};

userSchema.methods.createConfirmationToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.emailConfirmToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.emailConfirmExpires = Date.now() + 30 * 60 * 1000;

  /* This token is valid only 30 minutes */

  return resetToken;
};

const User = mongoose.model<UserTypes & UserDoc & Document>("User", userSchema);

export default User;
