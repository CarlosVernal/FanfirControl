const express = require("express");
const uC = require("../controllers/usersController");
const router = express.Router();
const uV = require("../validations/userValidations");
const tokenExtractor = require("../middleware/tokenExtractor");

//middleware
router.use(tokenExtractor);

// router.get("/", uC.getUsers); esta ruta sera implementada cuando exista el rol de administrador
router.put("/:id", uV.updateUserValidation, uC.updateUser);
router.delete("/:id", uV.deleteUserValidation, uC.deleteUser);
router.get("/:id", uV.getUserByIdValidation, uC.getUserById);

module.exports = router;
