const pick = (obj, keys = []) => {
    if (!obj || typeof obj !== "object") {
        return {};
    }

    if (!Array.isArray(keys)) {
        return {};
    }

    return keys.reduce((acc, key) => {
        if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
};

export default pick;
