import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        avatar: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            enum: ["admin", "owner", "member"],
            default: "member",
        },
        isActive: {
            type: Boolean,
            default: true,
        },

        resetPasswordToken: {
            type: String,
            select: false,
        },
        resetPasswordExpiresAt: {
            type: Date,
            select: false,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
