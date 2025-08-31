import express from "express";
import * as uC from "../controllers/usersController.js";
import * as uV from "../validators/userValidations.js";
import tokenExtractor from "../middleware/tokenExtractor.js";
import { handleValidationErrors } from "../middleware/ValidationErrorHandle.js";

const router = express.Router();

//middleware
router.use(tokenExtractor);

// router.get("/", uC.getUsers); esta ruta sera implementada cuando exista el rol de administrador
router.put("/me", uV.updateUserValidation, handleValidationErrors, uC.updateUser);
router.delete("/me", uV.deleteUserValidation, handleValidationErrors, uC.deleteUser);
router.get("/me", uV.getUserByIdValidation, handleValidationErrors, uC.getUserById);

export default router;
