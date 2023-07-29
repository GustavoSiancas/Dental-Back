const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");

const check = require("../authorization/auth");

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/", check.auth, UserController.profile);
router.get("/:id", UserController.userById);

module.exports = router;