import {z} from "zod"

export const createUserWithEmailAndPassword= z.object({
    fullName: z.string().describe("Full name of the user"),
    email: z.email().describe("Email of the User"),
    password: z.string().describe("Password of the User")
});

export type CreateUserWithEmailAndPassword = z.infer<typeof createUserWithEmailAndPassword>;

export const generateUserTokenPayload = z.object({
    id: z.string().describe("user id")
})

export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>;

export const signInUserWithEmailAndPassword = z.object({
    email: z.email().describe("Email of the User"),
    password: z.string().describe("Password of the User")
});

export type SignInUserWithEmailAndPasswordType = z.infer<typeof signInUserWithEmailAndPassword>;

