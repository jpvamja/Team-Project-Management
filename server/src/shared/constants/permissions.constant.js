export const PERMISSIONS = Object.freeze({
    USER_READ: "user:read",
    USER_UPDATE: "user:update",
    WORKSPACE_MANAGE: "workspace:manage",
});

export const ROLE_PERMISSIONS = Object.freeze({
    admin: [
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.WORKSPACE_MANAGE,
    ],
    owner: [PERMISSIONS.WORKSPACE_MANAGE],
    member: [PERMISSIONS.USER_READ],
});
