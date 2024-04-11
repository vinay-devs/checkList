import { z } from "zod";
export const signUpSchema = z.object({
    username: z.string().min(5),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string().min(5)
})

export const signInSchema = z.object({
    username: z.string().min(5),
    password: z.string().min(5)
})