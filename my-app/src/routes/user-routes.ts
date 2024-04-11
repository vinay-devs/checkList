import { Context, Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { signInSchema, signUpSchema } from "../middleware/validation/user-schema";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { z } from "zod";
import { sign } from "hono/jwt";
import { compareSync, genSaltSync, hashSync } from "bcrypt-ts";
import { authMiddleware } from "../middleware/auth";
export const userRouters = new Hono();



type signUpType = z.input<typeof signUpSchema>;
type signInType = z.input<typeof signInSchema>
export type payloadType = {
    username: string,
}
userRouters.post("/signup", zValidator("json", signUpSchema),
    async (c: Context) => {
        try {
            const req: signUpType = await c.req.json();
            const prisma = new PrismaClient({
                datasourceUrl: c.env.DATABASE_URL,
            }).$extends(withAccelerate())

            const userExists = await prisma.user.findFirst(
                {
                    where: {
                        userName: req.username
                    }
                }
            )

            if (userExists?.userName == req.username) return c.json({
                message: "User Already Exists, Please Login"
            })
            const salt = genSaltSync(10);
            const hash = hashSync(req.password, salt)
            const user = await prisma.user.create({
                data: {
                    userName: req.username,
                    firstName: req.firstName,
                    lastName: req.lastName,
                    password: hash
                }
            })


            return c.json({
                message: "User Created Succesfully"
            })
        } catch (error) {
            return c.json(error)
        }
    }

);

userRouters.post('/signin', zValidator('json', signInSchema), async function (c: Context) {
    try {
        const req: signInType = await c.req.json();
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate());

        const res = await prisma.user.findFirst({
            where: {
                userName: req.username
            }
        })
        if (!res) {
            return c.json({
                message: "User Not Found"
            })
        }

        const isPasswordValid = compareSync(req.password, res.password)

        if (!isPasswordValid) return c.json({
            message: "Invalid Password"
        })

        const payload = {
            username: req.username,
        }
        const secret = c.env.secret;
        const token = await sign(payload, secret);
        return c.json({
            token: token,
            username: req.username,
            id: res.id
        })
    } catch (error) {

        return c.json(error)
    }
})


