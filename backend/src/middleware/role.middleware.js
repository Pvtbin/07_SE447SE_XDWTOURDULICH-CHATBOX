export const isAdmin = (req, res, next) => {
    if (req.user.vai_tro !== "admin") {
        return res.status(403).json({ message: "Bạn không có quyền" });
    }
    next();
};