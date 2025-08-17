import express from "express";
import * as uC from "../controllers/usersController.js";
import * as uV from "../validators/userValidations.js";
import tokenExtractor from "../middleware/tokenExtractor.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

// router.get("/", uC.getUsers); esta ruta sera implementada cuando exista el rol de administrador
router.put("/:id", uV.updateUserValidation, uC.updateUser);
router.delete("/:id", uV.deleteUserValidation, uC.deleteUser);
router.get("/:id", uV.getUserByIdValidation, uC.getUserById);

export default router;
