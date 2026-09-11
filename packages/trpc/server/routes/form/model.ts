import { z } from "zod";
import { fieldOutputModel } from "../form-field/model";

export const createFormInputModel = z.object({
    title: z.string().max(50).describe("Title of the form."),
    description: z.string().max(300).optional().describe("descrption of the form"),
});

export const createFormOutputModel = z.object({
    id: z.string().describe("ID of the created form"),
});

export const listFormsInputModel = z.undefined();

export const listFormsOutputModel = z.array(
    z.object({
        id: z.string().describe("ID of the form"), 
        title: z.string().max(50).describe("Title of the form."),
        description: z.string().max(300).nullable().optional().describe("descrption of the form"),
        isPublished: z.boolean(),

        createdAt: z.date().nullable().describe("Creation Timestamp"),
        updatedAt: z.date().nullable().describe("Updation Timestamp"),
    }),
);

export const getFormInputModel = z.object({
    formId: z.uuid().describe("UUID of the form to fetch"),
});

export const getFormOutputModel = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    isPublished: z.boolean(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    fields: z.array(fieldOutputModel),
});

export const setPublishedInputModel = z.object({
    formId: z.uuid(),
    isPublished: z.boolean(),
});

export const setPublishedOutputModel = z.object({
    id: z.uuid(),
    isPublished: z.boolean(),
});

export const deleteFormInputModel = z.object({
    formId: z.uuid(),
});

export const deleteFormOutputModel = z.object({
    id: z.uuid(),
});


