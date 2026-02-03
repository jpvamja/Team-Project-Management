import ApiResponse from "../../shared/responses/ApiResponse.js";
import ApiError from "../../shared/errors/ApiError.js";
import User from "./user.model.js";
import asyncHandler from "../../shared/utils/asyncHandler.utils.js";

export const userCheck = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("_id email");

    if (!user) {
        throw ApiError.unauthorized("User not found");
    }

    return ApiResponse.success(res, {
        id: user._id,
        email: user.email,
    });
});
