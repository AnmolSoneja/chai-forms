import { formService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
    createFormInputModel,
    createFormOutputModel,
    getFormInputModel,
    getFormOutputModel,
    listFormsInputModel,
    listFormsOutputModel,
    setPublishedInputModel,
    setPublishedOutputModel,
    deleteFormInputModel,
    deleteFormOutputModel,
    listTemplatesOutputModel,
    useTemplateInputModel,
    useTemplateOutputModel,
    updateFormInputModel,
    updateFormOutputModel,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
    createForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/createForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(createFormInputModel)
        .output(createFormOutputModel)
        .mutation(async ({input, ctx})=> {
            const { title, description } = input;
            const { id } = await formService.createForm({
                title, description, createdBy: ctx.user.id,
            });
            return { id };
        }),

    listForms: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/listForms"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(listFormsInputModel)
        .output(listFormsOutputModel)
        .query(async ({ ctx}) => {
            const forms = await formService.listFormsByUserId({ userId: ctx.user.id });
            return forms;
        }),

    updateForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "PUT",
                path: getPath("/updateForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(updateFormInputModel)
        .output(updateFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.updateForm(input, ctx.user.id)),

    setPublished: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/setPublished"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(setPublishedInputModel)
        .output(setPublishedOutputModel)
        .mutation(async ({ input, ctx }) => formService.setPublished(input.formId, ctx.user.id, input.isPublished, input.isTemplate)),

    listTemplates: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/listTemplates"),
                tags: TAGS,
                protect: true,
            },
        })
        .output(listTemplatesOutputModel)
        .query(async () => formService.listTemplates()),

    useTemplate: authenticatedProcedure
        .meta({
            openapi: {
                method: "POST",
                path: getPath("/useTemplate"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(useTemplateInputModel)
        .output(useTemplateOutputModel)
        .mutation(async ({ input, ctx }) => formService.useTemplate(input.formId, ctx.user.id)),

    deleteForm: authenticatedProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: getPath("/deleteForm"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(deleteFormInputModel)
        .output(deleteFormOutputModel)
        .mutation(async ({ input, ctx }) => formService.deleteForm(input.formId, ctx.user.id)),

    getFormForOwner: authenticatedProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getFormForOwner"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(getFormInputModel)
        .output(getFormOutputModel)
        .query(async ({ input, ctx }) => formService.getFormForOwner(input.formId, ctx.user.id)),
    
    getFormWithFields: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getForm"),
                tags: TAGS,
            },
        })
        .input(getFormInputModel)
        .output(getFormOutputModel)
        .query(async ({input})=> {
            const {formId} = input;
            const form = await formService.getPublishedFormWithFields(formId);
            return form;
        })
});