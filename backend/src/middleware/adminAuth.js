const supabase = require("../config/supabase");

const adminAuth = async (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const [scheme, token] =
            authHeader.split(" ");

        if (
            scheme !== "Bearer" ||
            !token
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        const {
            data: userData,
            error: userError
        } = await supabase.auth.getUser(token);

        console.log("Token validation:", {
            success: !userError && !!userData?.user,
            error: userError?.message || null,
            status: userError?.status || null
        });

        if (
            userError ||
            !userData?.user
        ) {
            console.error("Supabase token validation failed:", {
                message: userError?.message,
                status: userError?.status,
                code: userError?.code
            });

            return res.status(401).json({
                success: false,
                message: "Invalid or expired session."
            });
        }

        const user = userData.user;

        const {
            data: adminProfile,
            error: adminError
        } = await supabase
            .from("admin_profiles")
            .select("id, role, full_name")
            .eq("id", user.id)
            .eq("role", "admin")
            .maybeSingle();

        if (adminError) {
            console.error(
                "Admin authorization error:",
                adminError
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to verify administrator access."
            });
        }

        if (!adminProfile) {
            return res.status(403).json({
                success: false,
                message: "Administrator access required."
            });
        }

        req.user = user;
        req.admin = adminProfile;

        next();

    } catch (error) {
        console.error(
            "Admin authentication error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to authenticate administrator."
        });
    }
};

module.exports = adminAuth;