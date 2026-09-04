import { z } from "zod";

export const fieldTypeEnum = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFieldInputModel = z.object({
    label: z.string().max(100).describe("Display label of the field"),
    type: fieldTypeEnum.describe("Type ofthe field"),
    formId: z.uuid().describe("UUID of the form"),
    description: z.string().optional().describe("Helper text"),
    placeholder: z.string().optional().describe("Placeholder text for the field"),
    isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
});

export const createFieldOutputModel = z.object({
    id: z.string().describe("ID of the created field"),
    labelKey: z.string().describe("Immutable slug key for the field label"),
    index: z.string().describe("Index string for ordering"),
});

export const getFieldsInputModel = z.object({
    formId: z.uuid().describe("UUID of the form to fetch fields from"),
});

export const fieldOutputModel = z.object({
    id: z.string(),
    formId: z.uuid().nullable(),
    label: z.string(),
    labelKey: z.string(),
    description: z.string().nullable(),
    placeholder: z.string().nullable(),
    isRequired: z.boolean(),
    index: z.string(),
    type: fieldTypeEnum,
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

export const getFieldsOutputModel = z.array(fieldOutputModel);

// export type CreateFieldInputModelType = z.infer<typeof createFieldInputModel>;
// export type CreateFieldOutputModelType = z.infer<typeof createFieldOutputModel>;
// export type GetFieldsInputModelType = z.infer<typeof getFieldsInputModel>;
// export type GetFieldsOutputModelType = z.infer<typeof getFieldsOutputModel>;
