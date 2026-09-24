import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../db";
import { users } from "../db/schema/user.schema";
import { AuthRequest } from "../types";

// Generate JWT Token
const generateToken = (id: number, email: string, role: string): string => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );
};

// =============================================
// @desc    Register User
// @route   POST /api/auth/register
// @access  Public
// =============================================
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        // Validate fields
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "Please provide name, email and password",
            });
            return;
        }

        // Check if user exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            res.status(409).json({
                success: false,
                message: "User already exists with this email",
            });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into DB
        const [newUser] = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
                role: role || "user",
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            });

        // Generate token
        const token = generateToken(newUser.id, newUser.email, newUser.role);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: newUser,
                token,
            },
        });
    } catch (error: any) {
        console.error("Register Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =============================================
// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
// =============================================
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate fields
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
            return;
        }

        // Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        if (user.suspendedAt) {
            res.status(403).json({
                success: false,
                message: "This account has been suspended",
            });
            return;
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        // Generate token
        const token = generateToken(user.id, user.email, user.role);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =============================================
// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
// =============================================
export const getMe = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const [user] = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, req.user!.id))
            .limit(1);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: { user },
        });
    } catch (error) {
        console.error("GetMe Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// =============================================
// @desc    Update Profile
// @route   PUT /api/auth/profile
// @access  Private
// =============================================
export const updateProfile = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, email, currentPassword, newPassword } = req.body;
        const userId = req.user!.id;

        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!currentUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        if (newPassword && currentPassword) {
            const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);

            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: "Current password is incorrect",
                });
                return;
            }
        }

        const updateData: Record<string, any> = {
            updatedAt: new Date(),
        };

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) {
            if (email !== currentUser.email) {
                const existingUser = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (existingUser.length > 0) {
                    res.status(409).json({
                        success: false,
                        message: "Email already in use",
                    });
                    return;
                }
            }
            updateData.email = email;
        }
        if (newPassword && currentPassword) {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(newPassword, salt);
        }

        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, userId))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { user: updatedUser },
        });
    } catch (error) {
        console.error("UpdateProfile Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};