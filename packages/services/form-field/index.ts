import { and, db, eq, max } from "@repo/database";
import { createFieldInput, CreateFieldInputType, updateFieldInput, UpdateFieldInputType } from "./model";
import {formFieldsTable} from "@repo/database/models/form-field"
import { formsTable } from "@repo/database/models/form";

function toLabelKey(label : string): string {
    return label 
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
}

export default class FormFieldService {
    private async getNextIndex(formId: string): Promise<string> {
        const result = await db
            .select({maxIndex: max(formFieldsTable.index)})
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId));
        
        const current = result[0]?.maxIndex;
        const next = current ? Number(current) + 1 : 1;

        return next.toString();
    }
    public async createField(payload: CreateFieldInputType) {
        const {label, type, isRequired, description, formId, placeholder, options}
         = await createFieldInput.parseAsync(payload);

        const normalizedOptions = [...new Set(options.map((option) => option.trim()))];
        const labelKey = toLabelKey(label);
        const index = await this.getNextIndex(formId);

        if (!["SINGLE_SELECT", "MULTI_SELECT"].includes(type) && normalizedOptions.length > 0) {
            throw new Error("Only select fields can have options");
        }

        if (["SINGLE_SELECT", "MULTI_SELECT"].includes(type) && normalizedOptions.length === 0) {
            throw new Error("Select fields require at least one option");
        }

        const result = await db
            .insert(formFieldsTable)
            .values({
                label,
                labelKey,
                type, 
                formId, 
                isRequired, 
                description, 
                placeholder,
                index,
                options: normalizedOptions
            })
            .returning({id: formFieldsTable.id});

        if(!result || result.length === 0 || !result[0]?.id) {
            throw new Error("Something went wrong while creating the field");
        }

        return {id: result[0].id, labelKey, index};
    }

    public async getFields(formId: string) {
        const result = await db
            .select()
            .from(formFieldsTable)
            .where(eq(formFieldsTable.formId, formId))
            .orderBy(formFieldsTable.index);

        return result.map((r) => ({
            id: r.id,
            formId: r.formId,
            label: r.label,
            labelKey: r.labelKey,
            description: r.description,
            placeholder: r.placeholder,
            isRequired: r.isRequired, 
            index: r.index.toString(),
            type: r.type, 
            options: r.options,
            createdAt: r.createdAt? r.createdAt.toISOString() : null,
            updatedAt: r.updatedAt? r.updatedAt.toISOString() : null,
        }));
    }

    public async deleteField(id: string) {
        const result = await db
            .delete(formFieldsTable)
            .where(eq(formFieldsTable.id, id))
            .returning({ id: formFieldsTable.id });

        if (!result[0]?.id) {
            throw new Error("Field not found");
        }

        return result[0];
    }

    public async updateField(payload: UpdateFieldInputType, userId: string) {
        const { id, formId, label, type, isRequired, description, placeholder, options } =
            await updateFieldInput.parseAsync(payload);
        const normalizedOptions = [...new Set(options.map((option) => option.trim()))];

        if (!["SINGLE_SELECT", "MULTI_SELECT"].includes(type) && normalizedOptions.length > 0) {
            throw new Error("Only select fields can have options");
        }

        if (["SINGLE_SELECT", "MULTI_SELECT"].includes(type) && normalizedOptions.length === 0) {
            throw new Error("Select fields require at least one option");
        }

        const ownedField = await db
            .select({ id: formFieldsTable.id })
            .from(formFieldsTable)
            .innerJoin(formsTable, eq(formsTable.id, formFieldsTable.formId))
            .where(and(
                eq(formFieldsTable.id, id),
                eq(formFieldsTable.formId, formId),
                eq(formsTable.createdBy, userId),
            ));

        if (!ownedField[0]?.id) {
            throw new Error("Field not found");
        }

        const result = await db
            .update(formFieldsTable)
            .set({
                label,
                labelKey: toLabelKey(label),
                type,
                isRequired,
                description,
                placeholder: ["SINGLE_SELECT", "MULTI_SELECT", "YES_NO", "RATING"].includes(type)
                    ? null
                    : placeholder,
                options: normalizedOptions,
            })
            .where(eq(formFieldsTable.id, id))
            .returning({ id: formFieldsTable.id });

        if (!result[0]?.id) {
            throw new Error("Field not found");
        }

        return result[0];
    }

}