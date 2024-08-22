import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body;

            // Check if user already exists

            const userExists = await User.findOne({ email });
            if (userExists) {
                const error = new Error("El usuario ya esta registrado");
                return res.status(409).json({ error: error.message });
            }

            // Create new user
            const user = new User(req.body);

            // Hash password
            user.password = await hashPassword(password);

            // Generate token

            const token = new Token();
            token.token = generateToken();
            token.user = user.id;

            // Save user and token

            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
            });

            await Promise.allSettled([user.save(), token.save()]);

            res.send(
                "Usuario creado, por favor revisa tu correo para confirmar tu cuenta"
            );
        } catch (error) {
            res.status(500).json("Internal server error");
        }
    };

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            const tokenExists = await Token.findOne({ token });

            if (!tokenExists) {
                const error = new Error("Token no válido");
                return res.status(404).json({ error: error.message });
            }

            const user = await User.findById(tokenExists.user);
            user.confirmed = true;

            await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

            res.send("Cuenta confirmada");
        } catch (error) {
            res.status(500).json("Internal server error");
        }
    };

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                const error = new Error("Usuario no encontrado");
                return res.status(404).json({ error: error.message });
            }

            if (!user.confirmed) {
                const token = new Token();
                token.user = user.id;
                token.token = generateToken();
                await token.save();

                // Send confirmation email again

                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token,
                });

                const error = new Error(
                    "Cuenta no confirmada, hemos enviado un nuevo correo de confirmación"
                );
                return res.status(401).json({ error: error.message });
            }

            // Check password

            const isPasswordCorrect = await checkPassword(password, user.password);
            if (!isPasswordCorrect) {
                const error = new Error("Contraseña incorrecta");
                return res.status(401).json({ error: error.message });
            }

            const token = generateJWT({ id: user.id });
            res.send(token);
        } catch (error) {
            res.status(500).json("Internal server error");
        }
    };

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            // usuario existe
            const user = await User.findOne({ email });
            if (!user) {
                const error = new Error("Usuario no encontrado");
                return res.status(404).json({ error: error.message });
            }

            if (user.confirmed) {
                const error = new Error("Usuario ya confirmado");
                return res.status(403).json({ error: error.message });
            }

            // generar token

            const token = new Token();
            token.token = generateToken();
            token.user = user.id;

            // enviar correo

            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
            });

            await Promise.allSettled([token.save()]);
            res.send("Código de confirmación enviado");
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    };

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            // usuario existe
            const user = await User.findOne({ email });
            if (!user) {
                const error = new Error("Usuario no encontrado");
                return res.status(404).json({ error: error.message });
            }

            // generar token

            const token = new Token();
            token.token = generateToken();
            token.user = user.id;
            await token.save();

            // enviar correo

            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token,
            });

            res.send("Revisa tu correo para reestablecer tu contraseña");
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    };

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            const tokenExists = await Token.findOne({ token });

            if (!tokenExists) {
                const error = new Error("Token no válido");
                return res.status(404).json({ error: error.message });
            }

            res.send("Token válido, ingresa tu nueva contraseña");
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    };

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const tokenExists = await Token.findOne({ token });

            if (!tokenExists) {
                const error = new Error("Token no válido");
                return res.status(404).json({ error: error.message });
            }

            // obetener el usuario, hash password y guardar

            const user = await User.findById(tokenExists.user);
            user.password = await hashPassword(password);

            await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

            res.send("Contraseña actualizada correctamente");
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    };

    static user = async (req: Request, res: Response) => {
        return res.json(req.user);
    };

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            const error = new Error("Email no disponible");
            return res.status(409).json({ error: error.message });
        }

        req.user.name = name;
        req.user.email = email;

        try {
            await req.user.save();
            res.send("Perfil actualizado correctamente");
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    };

    static updatePassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body;
        const user = await User.findById(req.user.id);

        const isPasswordCorrect = await checkPassword(
            current_password,
            user.password
        );
        if (!isPasswordCorrect) {
            const error = new Error("Contraseña actual incorrecta");
            return res.status(401).json({ error: error.message });
        }
        if (current_password == password) {
            const error = new Error(
                "La nueva contraseña debe ser diferente a la contraseña actual"
            );
            return res.status(400).json({ error: error.message });
        }
        try {
            user.password = await hashPassword(password);
            await user.save();
            res.send("Contraseña actualizada correctamente");
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    };

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body;

        const user = await User.findById(req.user.id);

        const isPasswordCorrect = await checkPassword(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error("Contraseña incorrecta")
            return res.status(401).json({ error: error.message })
        }
        res.send("Contraseña correcta");
    };
}
