const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "You must be logged in to access this resource" });
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: "Access denied: Admin privileges required" });
};

module.exports = {
    isAuthenticated,
    isAdmin
};
