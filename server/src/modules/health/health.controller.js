export const healthCheck = (req, res) => {
     res.status(200).json({
        success: true,
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
};
