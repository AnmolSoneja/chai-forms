import {z} from "zod";

export const createFormInput = z.object({
    title: z.string().max(50).describe("title ofthe form"),
    description: z.string().max(300).optional().describe("Description ofthe form"),
    createdBy: z.uuid().describe("UUID of the creator of the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const updateFormInput = z.object({
    formId: z.uuid(),
    title: z.string().trim().min(1).max(50),
});

export type UpdateFormInputType = z.infer<typeof updateFormInput>;

export const listFormsByUserIdInput = z.object({
    userId: z.uuid().describe("UUID of the user."),
});

export type ListFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>; 