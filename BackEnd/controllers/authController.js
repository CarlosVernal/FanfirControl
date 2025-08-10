const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.loginUser = async (request, response, next) => {
    //get the user with the email from the request body
    const { email, password } = request.body;
    if (!email || !password) {
        return response.status(400).json({ error: "email and password required" });
    }
    const user = await User.findOne({ email });

    //check the password if the user exists
    const passwordCorrect =
        user === null ? false : await bcrypt.compare(password, user.passwordHash);

    //check if the user exists and the password is correct
    if (!(user && passwordCorrect)) {
        return response.status(401).json({ error: "invalid email or password" });
    }

    //create a token with the user id and the secret key
    const userForToken = {
        email: user.email,
        id: user._id,
    };
    //the token will expire in 1 hour
    const token = jwt.sign(userForToken, process.env.SECRET, {
        expiresIn: 60 * 60,
    });

    response
        .status(200)
        .send({ token, email: user.email, name: user.name });
};
