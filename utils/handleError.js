/**
 * Handles error and returns proper error message
 * @param {Object} error - Error object from catch block
 * @returns {String} - Proper error message
 */
const handleError = (error) => {
    // MongoDB Duplicate Key Error (Code 11000)
    if (error.code === 11000) {
        if (error.keyValue) {
            const field = Object.keys(error.keyValue)[0];
            const readableField = field === 'phoneNumber' ? 'Phone number' : field.charAt(0).toUpperCase() + field.slice(1);
            return `${readableField} already exists`;
        }
        return "Duplicate key error";
    }

    // Default error message
    return error.message || "An unexpected error occurred";
};

module.exports = handleError;
