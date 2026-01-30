import ApiResponse from "../../shared/responses/ApiResponse.js";
import { HTTP_STATUS } from "../../shared/constants/httpStatus.constant.js";

export const healthCheck = (req, res) => {
    return ApiResponse.success(res, {
        status: HTTP_STATUS.OK,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
};
