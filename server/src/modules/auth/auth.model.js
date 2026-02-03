import mongoose from "mongoose";
import { hashPassword, comparePassword } from "../../shared/utils/bcrypt.utils.js";

const authSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },
        provider: {
            type: String,
            enum: ["LOCAL", "GOOGLE", "GITHUB"],
            default: "LOCAL",
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

authSchema.pre("save", async function () {
    if (!this.isModified("passwordHash")) {
        return;
    }
    this.passwordHash = await hashPassword(this.passwordHash);
});

authSchema.methods.comparePassword = async function (plainPassword) {
    return comparePassword(plainPassword, this.passwordHash);
};

const Auth = mongoose.model("Auth", authSchema);

export default Auth;
