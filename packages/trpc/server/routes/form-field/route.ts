import { formFieldService } from "../../services";
import { authenticatedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
    createFieldInputModel,
    createFieldOutputModel,
    deleteFieldInputModel,
    deleteFieldOutputModel,
    getFieldsInputModel,
    getFieldsOutputModel,
    reorderFieldsInputModel,
    reorderFieldsOutputModel,
    updateFieldInputModel,
    updateFieldOutputModel,
} from "./model";

const TAGS = ["FormField"];
const getPath = generatePath("/form-field");

export const formsFieldRouter = router({
    createField: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createField"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(createFieldInputModel)
        .output(createFieldOutputModel)
        .mutation(async ({input, ctx}) => {
            const {label, type, formId, description, placeholder, isRequired, options} = input;

            const result = await formFieldService.createField({
                label, type, formId, description, placeholder, isRequired, options
            }, ctx.user.id);

            return result;
        }),
    
    getFields: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getFields"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(getFieldsInputModel)
        .output(getFieldsOutputModel)
        .query(async ({ input, ctx }) => {
            const { formId } = input;
            const result = await formFieldService.getFields(formId, ctx.user.id);
            return result;
        }),

    deleteField: authenticatedProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: getPath("/deleteField"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(deleteFieldInputModel)
        .output(deleteFieldOutputModel)
        .mutation(async ({ input, ctx }) => formFieldService.deleteField(input.id, ctx.user.id)),

    updateField: authenticatedProcedure
        .meta({
            openapi: {
                method: "PUT",
                path: getPath("/updateField"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(updateFieldInputModel)
        .output(updateFieldOutputModel)
        .mutation(async ({ input, ctx }) => formFieldService.updateField(input, ctx.user.id)),

    reorderFields: authenticatedProcedure
        .meta({
            openapi: {
                method: "PUT",
                path: getPath("/reorderFields"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(reorderFieldsInputModel)
        .output(reorderFieldsOutputModel)
        .mutation(async ({ input, ctx }) => formFieldService.reorderFields(input, ctx.user.id)),
});