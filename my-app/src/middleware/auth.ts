import { Context, Next } from "hono";
import { decode, sign, verify } from 'hono/jwt'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
interface reqType {
    token: string,
}
export async function authMiddleware(c: Context, next: Next) {
    const auth = c.req.header('Authorization');
    const token = auth?.split(' ')[1]
    if (!token) return c.json({
        message: "Token is missing,Please Login Again"
    })
    try {
        await verify(token, c.env.secret)
    } catch (error) {
        return c.json({
            message: "User Token is Not Valid,Please Login Again"
        })
    }
    return next();
}