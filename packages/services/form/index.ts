import {formsTable} from "@repo/database/models/form";

import { createFormInput, listFormsByUserIdInput, ListFormsByUserIdInputType, type CreateFormInputType } from "./model";
import { and, db, eq } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionTable } from "@repo/database/models/form-submission";

export default class UserService {
    public async createForm(payload: CreateFormInputType) {
        const {title, description, createdBy} = await createFormInput.parseAsync(payload);

        const result = await db.insert(formsTable).values({title, description, createdBy}).returning({id: formsTable.id});

        if(!result || result.length === 0 || !result[0]?.id) {
            throw new Error("Something went wrong while creating the form");
        }

        return {
            id: result[0].id
        };
    }

    public async listFormsByUserId(payload: ListFormsByUserIdInputType) {
        const {userId} = await listFormsByUserIdInput.parseAsync(payload);

        const forms = await db.select({
            id: formsTable.id,
            title: formsTable.title,
            description: formsTable.description,
            isPublished: formsTable.isPublished,
            createdAt: formsTable.createdAt,
            updatedAt: formsTable.updatedAt,
        })
        .from(formsTable)
        .where(eq(formsTable.createdBy, userId));

        return forms;
    }

    public async getPublishedFormWithFields(formId: string) {
        return this.getFormWithFields(formId, undefined, true);
    }

    public async getFormForOwner(formId: string, userId: string) {
        return this.getFormWithFields(formId, userId, false);
    }

    private async getFormWithFields(formId: string, userId: string | undefined, requirePublished: boolean) {
        const rows = await db
            .select({
                id: formsTable.id,
                title: formsTable.title,
                description: formsTable.description,
                isPublished: formsTable.isPublished,
                createdAt: formsTable.createdAt,
                updatedAt: formsTable.updatedAt,

                field_id: formFieldsTable.id,
                field_formId: formFieldsTable.formId,
                field_label: formFieldsTable.label,
                field_labelKey: formFieldsTable.labelKey,
                field_placeholder: formFieldsTable.placeholder,
                field_description: formFieldsTable.description,
                field_isRequired: formFieldsTable.isRequired,
                field_index: formFieldsTable.index,
                field_type: formFieldsTable.type,
                field_options: formFieldsTable.options,
                field_createdAt: formFieldsTable.createdAt,
                field_updatedAt: formFieldsTable.updatedAt,
            })
            .from(formsTable)
            .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formsTable.id))
            .where(and(
                eq(formsTable.id, formId),
                userId ? eq(formsTable.createdBy, userId) : eq(formsTable.isPublished, requirePublished),
            ))
            .orderBy(formFieldsTable.index);

        if(!rows || rows.length === 0) 
            throw new Error(`Form with ID ${formId} not found`);
    
        const first = rows[0]!;

        const form = {
            id: first.id,
            title: first.title,
            description: first.description,
            isPublished: first.isPublished,
            createdAt: first.createdAt ? first.createdAt.toISOString() : null,
            updatedAt: first.updatedAt  ? first.updatedAt.toISOString(): null,
            fields: [] as Array<any>,
        };

        for(const r of rows) {
            if(!r.field_id) continue;

            form.fields.push({
                id: r.field_id,
                formId: r.field_formId,
                label: r.field_label,
                labelKey: r.field_labelKey,
                description: r.field_description ?? null,
                placeholder: r.field_placeholder ?? null,
                isRequired: r.field_isRequired,
                index: r.field_index!.toString(),
                type: r.field_type,
                options: r.field_options ?? [],
                createdAt: r.field_createdAt ? r.field_createdAt.toISOString() : null,
                updatedAt: r.field_updatedAt ? r.field_updatedAt.toISOString() : null,
        
            });
        }

        return form;
    }

    public async setPublished(formId: string, userId: string, isPublished: boolean) {
        const result = await db
            .update(formsTable)
            .set({ isPublished })
            .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)))
            .returning({ id: formsTable.id, isPublished: formsTable.isPublished });

        if (!result[0]?.id) {
            throw new Error("Form not found");
        }

        return result[0];
    }

    public async deleteForm(formId: string, userId: string) {
        return db.transaction(async (tx) => {
            const form = await tx
                .select({ id: formsTable.id })
                .from(formsTable)
                .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

            if (!form[0]?.id) {
                throw new Error("Form not found");
            }

            await tx.delete(formSubmissionTable).where(eq(formSubmissionTable.formId, formId));
            await tx.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));
            const result = await tx
                .delete(formsTable)
                .where(eq(formsTable.id, formId))
                .returning({ id: formsTable.id });

            if (!result[0]?.id) {
                throw new Error("Form not found");
            }

            return result[0];
        });
    }
}