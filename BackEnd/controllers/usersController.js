const bcrypt = require("bcryptjs");
const User = require("../models/User");

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

// exports.getAllUsers = async (request, response, next) => {
//   try {
//     //get {name,blogs:{title}}
//     const users = await User.find({}).select("name blogs").populate("blogs", {
//       title: 1,
//     });
//     response.status(200).json(users); //found all users
//   } catch (error) {
//     next(error);
//   }
// };

// Example of how to export a function
// // exports.SomeFuncion = async (request, response, next) => {
//     try {

//     }
//     catch(error){
//         next(error)
//     }
// }
