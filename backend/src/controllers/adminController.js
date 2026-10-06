const getAdminDashboard = async (req, res) => {
    return res.json({
        success: true,
        message: "Admin authentication successful.",
        admin: {
            id: req.admin.id,
            name: req.admin.full_name,
            role: req.admin.role
        }
    });
};

module.exports = {
    getAdminDashboard
};