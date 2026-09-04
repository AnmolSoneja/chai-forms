import { formSubmissionService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { createSubmissionInputModel, createSubmissionOutputModel, getSubmissionByFormIdInputModel, getSubmissionByFormIdOutputModel } from "./model";

const TAGS = ["FormSubmission"];
const getPath = generatePath("/form-submission");

export const formSubmissionRouter = router({
    createSubmission: publicProcedure 
        .meta({
            openapi: {
                method: "POST", 
                path: getPath("/createSubmission"), 
                tags: TAGS
            }
        })
        .input(createSubmissionInputModel)
        .output(createSubmissionOutputModel)
        .mutation(async ({input})=> {
            const result = await formSubmissionService.createSubmission(input);
            return result;
        }),
    

    getSubmissionByFormId: authenticatedProcedure 
        .meta({
            openapi: {
                method: "GET",
                path: getPath("/getSubmissionsByFormId"),
                tags: TAGS,
                protect: true,
            },
        })
        .input(getSubmissionByFormIdInputModel)
        .output(getSubmissionByFormIdOutputModel)
        .query(async ({input}) => {
            const {formId} = input;
            const result = await formSubmissionService.getSubmissionsByFormId(formId);
            return result;
        }),
});
export default formSubmissionRouter;