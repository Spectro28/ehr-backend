const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middleware/auth.middleware");

//TODO: Estas rutas deben ser movidas a adminRoutes.js
// Rutas protegidas (solo admin)
// router.post("/create", authMiddleware, isAdmin, userController.createUser);
// router.get("/all", authMiddleware, isAdmin, userController.getAllUsers);
// router.get(
//   "/role/:role",
//   authMiddleware,
//   isAdmin,
//   userController.getUsersByRole
// );

//Rutas de usuario
router.post("/register", userController.register);

module.exports = router;
