import bcrypt from "bcryptjs";
import User from "../models/User.js";
import validateAuthenticatedUser from "../utils/authUtils.js";
// la creacion de usuario esta en authController.js

//Esta funcion sera implementada cuando exista el rol de administrador
// export async function getUsers(req, res, next) {
//   try {
//     const users = await User.find({});
//     res.status(200).json(users);
//   } catch (error) {
//     next(error);
//   }
// }

export async function updateUser(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);
    const { name, password } = req.body;

    // Validate request body
    if (!name && !password) {
      return res.status(400).json({ error: "debes ingresar los campos que quieres actualizar" });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields
    if (name) user.name = name;
    if (password) user.passwordHash = bcrypt.hashSync(password, 10);

    // Save updated user
    const updatedUser = await user.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const userId = validateAuthenticatedUser(req, res);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
