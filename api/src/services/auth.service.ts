import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import db from "../config/database";

interface AdminUser {
    id: number;
    name: string;
    username: string;
    password_hash: string;
    is_active: boolean;
}

interface LoginResult {
    token: string;
    user: {
        id: number;
        name: string;
        username: string;
    };
}

interface JwtPayload {
    userId: number;
    username: string;
    jti: string;
}

const JWT_SECRET: string = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET is not configured in environment variables"
    );
}

const JWT_EXPIRES_IN = "1d";

export async function login(
    username: string,
    password: string
): Promise<LoginResult> {
    const user = await db<AdminUser>("users")
        .where({
            username,
            is_active: true,
        })
        .first();

    if (!user) {
        throw new Error("Invalid username or password");
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        throw new Error("Invalid username or password");
    }

    const tokenId = crypto.randomUUID();

    const token = jwt.sign(
        {
            userId: user.id,
            username: user.username,
            jti: tokenId,
        },
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN,
        }
    );

    const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    await db("auth_sessions").insert({
        user_id: user.id,
        token_id: tokenId,
        expires_at: expiresAt,
    });

    await db("users")
        .where({ id: user.id })
        .update({
            last_login_at: db.fn.now(),
            updated_at: db.fn.now(),
        });

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
        },
    };
}

export async function createAdmin(
    name: string,
    username: string,
    password: string
) {
    const existingUser = await db<AdminUser>("users")
        .where({ username })
        .first();

    if (existingUser) {
        throw new Error("Username already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db("users")
        .insert({
            name,
            username,
            password_hash: passwordHash,
            is_active: true,
        })
        .returning([
            "id",
            "name",
            "username",
            "is_active",
            "created_at",
        ]);

    return user;
}

export async function logout(tokenId: string): Promise<void> {
    await db("auth_sessions")
        .where({
            token_id: tokenId,
        })
        .whereNull("revoked_at")
        .update({
            revoked_at: db.fn.now(),
        });
}

export async function validateSession(
    tokenId: string,
    userId: number
): Promise<boolean> {
    const session = await db("auth_sessions")
        .where({
            token_id: tokenId,
            user_id: userId,
        })
        .whereNull("revoked_at")
        .where("expires_at", ">", db.fn.now())
        .first();

    return Boolean(session);
}