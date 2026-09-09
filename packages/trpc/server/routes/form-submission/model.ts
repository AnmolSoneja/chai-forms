import {z} from "zod";

export const submissionValueModel = z.object({
    fieldId: z.uuid().describe("UUID of the form field"),
    value: z.union([z.string(), z.array(z.string())]).describe("Submitted value as string or array of strings"),
});

export const createSubmissionInputModel = z.object({
    formId: z.uuid().describe("UUID of the form field"),
    values: z.array(submissionValueModel).describe("Array of field - value pairs"),
});

export const createSubmissionOutputModel = z.object({
    id: z.string().describe("ID of the created submission"),
    createdAt: z.string().nullable().describe("Creation timepstamp"),
});

export const getSubmissionByFormIdInputModel = z.object({
    formId: z.uuid().describe("UUID of the form"),
})

export const getSubmissionByFormIdOutputModel = z.array(
    z.object({
        id: z.string(),
        formId: z.uuid().nullable(),
        values: z.array(
            z.object({
                fieldId: z.uuid(),
                value: z.union([z.string(), z.array(z.string())]),
            })
        ),
        createdAt: z.string().nullable(),
        updatedAt: z.string().nullable(),
    })
)