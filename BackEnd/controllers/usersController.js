const bcrypt = require("bcryptjs");
const User = require("../models/User");
const e = require("express");

  exports.createUser = async (request, response, next) => {
    try {
      const { email, name, password } = request.body; //destructuring the request body

      //check if any of the fields are empty
      if (!email || !name || !password) {
        return response
          .status(400)
          .json({ error: "missing email, name or password" }); //check if the request body is empty or partially filled
      }
      //name is optional, but if exist need to be valid
      if (name && !/^(?!\s)(?!.*\s$)[a-zA-Z][a-zA-Z0-9_-\s]{4,14}$/.test(name)) {
        //no space at the beginning or end, no special characters, start with a letter then letters, numvers or - or _ and space in the middle, large between 5 and 15 characters
        return response.status(400).json({ error: "name is not valid" });
      }
      //check if the email is valid
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return response.status(400).json({ error: "email is not valid" });
      }
      //check password length and complexity
      if (password.length < 3 || password.length > 20) {
        //large between 3 and 20 characters
        return response
          .status(400)
          .json({ error: "password must be between 3 and 20 characters long" });
      }
      if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
        //at least one uppercase letter, one number, and one special character
        return response.status(400).json({
          error:
            "password must contain at least one uppercase letter, one number, and one special character",
        });
      }
    //preparation for the encryptation of the password
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    // Check if the email is already registered
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return response.status(409).json({ error: "Email already registered" });
    }

    //create a new user
    const user = new User({
      email: email.toLowerCase(), //email is always lowercase
      name: name || email.split("@")[0], //if name is not provided, use email prefix as name
      passwordHash,
    });

    //save the user to the database
    const savedUser = await user.save();
    response.status(201).json(savedUser); //user created successfully
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, name, password } = req.body;

    // Validate request body
    if (!email && !name && !password) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields
    if (email) user.email = email.toLowerCase();
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

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
