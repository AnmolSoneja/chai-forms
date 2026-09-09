import { z } from "zod";

const fieldTypeEnum = z.enum(["SHORT_TEXT", "LONG_TEXT", "EMAIL", "NUMBER", "SINGLE_SELECT", "MULTI_SELECT", "YES_NO", "PASSWORD", "RATING", "DATE"]);

export const createFieldInput = z.object({
    label: z.string().max(100).describe("Display label of the field"),
    type: fieldTypeEnum.describe("Type ofthe field"),
    formId: z.uuid().describe("UUID of the form"),
    description: z.string().optional().describe("Helper text"),
    placeholder: z.string().optional().describe("Placeholder text for the field"),
    isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
    options: z.array(z.string().trim().min(1)).max(100).optional().default([]),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const getFieldsType = z.object({
    formId: z.uuid().describe("UUID of the form to fetch fields for"),
});

export type GetFieldsInputType = z.infer<typeof getFieldsType>;
