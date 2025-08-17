const bcrypt = require("bcryptjs");
const User = require("../models/User");

//Esta funcion sera implementada cuando exista el rol de administrador
// exports.getUsers = async (req, res, next) => {
//   try {
//     const users = await User.find({});
//     res.status(200).json(users);
//   } catch (error) {
//     next(error);
//   }
// };

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;

    if (!req.user || req.user.id !== id) {
      return res.status(403).json({ error: "No tienes permiso para realizar esta acción" });
    }

    // Validate request body
    if (!name && !password) {
      return res.status(400).json({ error: "debes ingresar los campos que quieres actualizar" });
    }

    // Find user by ID
    const user = await User.findById(id);
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
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verifica que el usuario autenticado coincide con el usuario a eliminar
    if (!req.user || req.user.id !== id) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este usuario" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if(!req.user || req.user.id !== id) {
      return res.status(403).json({ error: "No tienes permiso para ver este usuario" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
