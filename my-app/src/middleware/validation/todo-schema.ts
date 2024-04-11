import { z } from 'zod';


export const todoSchema = z.object({
    title: z.string(),
    description: z.string(),
})

export const updateTodoSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional()
})