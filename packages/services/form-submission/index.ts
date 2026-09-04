import db, { eq } from "@repo/database";
import { createSubmissionInput, CreateSubmissionInputType } from "./model";
import { formSubmissionTable } from "@repo/database/models/form-submission";


export default class FormSubmissionService {
    public async createSubmission(payload: CreateSubmissionInputType) {
        const {formId, values} = await createSubmissionInput.parseAsync(payload);

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