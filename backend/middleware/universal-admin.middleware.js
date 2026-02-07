export const checkUniversalAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.role !== "UniversalAdmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. UniversalAdmin privileges required.",
      });
    }

    next();
  } catch (error) {
<<<<<<< HEAD
    console.error("❌ Error:", error);
=======
>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};