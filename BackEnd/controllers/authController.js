import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

export async function loginUser(request, response, next) {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).json({ error: "email and password required" });
        }

        const user = await User.findOne({ email });

        const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash);

        // Verifica si el usuario está verificado
        if (user && !user.isVerified) {
            return response.status(403).json({ error: "Please verify your email before logging in." });
        }

        if (!(user && passwordCorrect)) {
            return response.status(401).json({ error: "invalid email or password" });
        }

        const userForToken = {
            email: user.email,
            id: user._id,
        };
        const token = jwt.sign(userForToken, process.env.SECRET, {
            expiresIn: 60 * 60,
        });

        response
            .status(200)
            .send({ token, email: user.email, name: user.name });
    } catch (error) {
        next(error);
    }
}

export async function registerUser(req, res, next) {
    try {
        const { email, name, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "email and password required" });
        }
        // Verifica si el email ya está registrado
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
        // ⭕ AQUI SE DEBE ENVIAR EL CORREO DE VERIFICACION
        res.status(201).json({ message: "User registered. Please verify your email." });
    } catch (error) {
        next(error);
    }
};

export async function verifyEmail(req, res, next) {
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

export async function forgotPassword(req, res, next) {
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
        // ⭕ Aquí se enviara el email de restablecimiento de contraseña
        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        next(error);
    }
}

export async function resetPassword(req, res, next) {
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

export async function resendVerificationEmail(req, res, next) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: "El usuario ya está verificado" });
        }

        // Genera un nuevo token de verificación
        const verificationToken = jwt.sign(
            { email: user.email },
            process.env.SECRET,
            { expiresIn: "1h" }
        );
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        // REENVIAR CORREO DE VERIFICACION
        // sendVerificationEmail(user.email, verificationToken);

        res.status(200).json({ message: "Correo de verificación reenviado" });
    } catch (error) {
        next(error);
    }
};
