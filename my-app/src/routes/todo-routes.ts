import { Context, Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { todoSchema, updateTodoSchema } from "../middleware/validation/todo-schema";
import { z } from "zod";
import { decode } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { payloadType } from "./user-routes";
export const todoRoutes = new Hono();


type todoPostReq = z.input<typeof todoSchema>
type todoPutReq = z.input<typeof updateTodoSchema>



todoRoutes.post('/todos', authMiddleware, zValidator('json', todoSchema), async (c: Context) => {
    const req: todoPostReq = await c.req.json();
    const token = c.req.header('Authorization')?.split(' ')[1];
    console.log(token, req)
    if (!token) {
        return c.json({
            message: "Token Not Found"
        })
    }
    const { payload }: { payload: payloadType } = decode(token);
    console.log(payload)
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const user = await prisma.user.findFirst({
        where: {
            userName: payload.username
        }
    })
    if (!user) {
        return c.json({
            message: "User Not Found"
        })
    }
    const todoResponse = await prisma.todo.create({
        data: {
            title: req.title,
            description: req.description,
            userId: user.id
        }
    })
    return c.json(todoResponse);
})

todoRoutes.get('/todos', authMiddleware, async (c: Context) => {
    const token = c.req.header("Authorization")?.split(' ')[1];
    if (!token) return c.json({
        message: "Token Not Found"
    })
    const { payload }: { payload: payloadType } = decode(token)
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    const userTodo = await prisma.user.findMany({
        where: {
            userName: payload.username,
        },
        select: {
            id: true,
            firstName: true,
            todos: {
                select: {
                    id: true,
                    title: true,
                    description: true
                }
            }
        }
    })
    return c.json(userTodo)
})


todoRoutes.put('/:id', authMiddleware, zValidator('json', updateTodoSchema), async (c: Context) => {
    const req: todoPostReq = await c.req.json();
    const todoId = Number(c.req.param('id'))
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const todo = await prisma.todo.update({
        where: {
            id: todoId,
        }, data: {
            title: req.title,
            description: req.description
        }
    })
    return c.json(todo)
})

todoRoutes.delete('/:id', authMiddleware, async (c: Context) => {
    const todoId: number = Number(c.req.param('id'));
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate());

    console.log(todoId)
    try {
        const todo = await prisma.todo.delete({
            where: {
                id: todoId
            }
        })
        return c.json(todo)
    } catch (error) {
        return c.json({
            message: "Todo Is Not Found"
        })
    }



})

todoRoutes.put('status/:id', authMiddleware, async (c: Context) => {
    const todoId: number = Number(c.req.param('id'));
    const req: { status: boolean } = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const todo = await prisma.todo.update({
        where: {
            id: todoId
        },
        data: {
            status: req.status
        }
    })
    return c.json(todo)
})