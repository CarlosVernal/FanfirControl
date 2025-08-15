const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.loginUser = async (request, response, next) => {
    //get the user with the email from the request body
    const { email, password } = request.body;
    if (!email || !password) {
        return response.status(400).json({ error: "email and password required" });
    }

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
}

exports.registerUser = async (req, res, next) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "email and password required" });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "email already registered" });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            email: email.toLowerCase(),
            name: name || email.split("@")[0],
            passwordHash,
            isVerified: false,
            verificationToken: jwt.sign({ email }, process.env.SECRET, { expiresIn: 3600 })
        });
        await user.save();
        // Aquí deberías enviar el email de verificación
        res.status(201).json({ message: "User registered. Please verify your email." });
    } catch (error) {
        next(error);
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await User.findOne({ email: decoded.email, verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const resetToken = jwt.sign({ email }, process.env.SECRET, { expiresIn: 3600 });
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        // Aquí se enviara el email de restablecimiento de contraseña
        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await User.findOne({ email: decoded.email, resetPasswordToken: token });
        if (!user || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
};
