import db, { eq } from "@repo/database";
import { createSubmissionInput, CreateSubmissionInputType } from "./model";
import { formSubmissionTable } from "@repo/database/models/form-submission";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formsTable } from "@repo/database/models/form";

export default class FormSubmissionService {
    public async createSubmission(payload: CreateSubmissionInputType) {
        const {formId, values} = await createSubmissionInput.parseAsync(payload);

        const [form] = await db
            .select({ isPublished: formsTable.isPublished })
            .from(formsTable)
            .where(eq(formsTable.id, formId));

        if (!form?.isPublished) {
            throw new Error("This form is not available");
        }

        const fields = await db
            .select()
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId));
        const fieldsById = new Map(fields.map((field) => [field.id, field]));
        const submittedFieldIds = new Set<string>();

        for (const submitted of values) {
            const field = fieldsById.get(submitted.fieldId);
            if (!field) {
                throw new Error("Submission contains a field that does not belong to this form");
            }
            if (submittedFieldIds.has(submitted.fieldId)) {
                throw new Error("Submission contains the same field more than once");
            }
            submittedFieldIds.add(submitted.fieldId);

            if (field.type === "SINGLE_SELECT") {
                if (typeof submitted.value !== "string" || !submitted.value.trim()) {
                    throw new Error(`Field '${field.label}' requires one selected option`);
                }
                if (!field.options.includes(submitted.value)) {
                    throw new Error(`Invalid option for field '${field.label}'`);
                }
            }

            if (field.type === "MULTI_SELECT") {
                if (!Array.isArray(submitted.value)) {
                    throw new Error(`Field '${field.label}' requires an array of selected options`);
                }
                if (field.isRequired && submitted.value.length === 0) {
                    throw new Error(`Field '${field.label}' requires at least one selected option`);
                }
                if (submitted.value.some((option) => !field.options.includes(option))) {
                    throw new Error(`Invalid option for field '${field.label}'`);
                }
            }
        }

        for (const field of fields) {
            if (
                field.isRequired &&
                (field.type === "SINGLE_SELECT" || field.type === "MULTI_SELECT")
            ) {
                const submitted = values.find((value) => value.fieldId === field.id);
                const isEmpty = !submitted ||
                    (typeof submitted.value === "string" && !submitted.value.trim()) ||
                    (Array.isArray(submitted?.value) && submitted.value.length === 0);
                if (isEmpty) {
                    throw new Error(`Field '${field.label}' is required`);
                }
            }
        }

        const result = await db
            .insert(formSubmissionTable)
            .values({formId, values})
            .returning({id: formSubmissionTable.id, createdAt: formSubmissionTable.createdAt});

        if(!result || result.length === 0 || !result[0]?.id)
            throw new Error("Something went wrong while creating the submission");
    
        return {
            id: result[0].id,
            createdAt: result[0].createdAt? result[0].createdAt.toISOString() : null,
        };
    }

    public async getSubmissionsByFormId(formId: string) {
        const rows = await db
            .select({
                id: formSubmissionTable.id,
                formId: formSubmissionTable.formId,
                values: formSubmissionTable.values,
                createdAt: formSubmissionTable.createdAt,
                updatedAt: formSubmissionTable.updatedAt,
            })
            .from(formSubmissionTable)
            .where(eq(formSubmissionTable.formId, formId))
            .orderBy(formSubmissionTable.createdAt);

        return rows.map((r) => ({
            id: r.id,
            formId: r.formId,
            values: r.values ?? [],
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
            updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
        }));
    }
}