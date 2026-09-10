import { trpc } from "~/trpc/client"

export const useCreateForm = () => {
    const utils = trpc.useUtils();
    const {
        mutateAsync: createFormAsync,
        mutate: createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    } = trpc.form.createForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return {
        createFormAsync,
        createForm,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    };
}

export const useListForms = () => {

    const {
        data: forms,
        error,
        isFetched,
        isFetching, 
        isLoading,
        status
    } = trpc.form.listForms.useQuery();

    return {
        forms,
        error,
        isFetched,
        isFetching, 
        isLoading,
        status
    };
}

export const useGetFormWithFields = (formId: string) => {
    const {
        data: form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.getFormWithFields.useQuery({ formId });

    return {
        form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    }
}

export const useGetFormForOwner = (formId: string) => {
    const {
        data: form,
        error,
        isLoading,
        status,
    } = trpc.form.getFormForOwner.useQuery({ formId });

    return { form, error, isLoading, status };
};

export const useSetPublished = (formId: string) => {
    const utils = trpc.useUtils();
    const {
        mutateAsync: setPublishedAsync,
        error,
        status,
    } = trpc.form.setPublished.useMutation({
        onSuccess: async () => {
            await Promise.all([
                utils.form.getFormForOwner.invalidate({ formId }),
                utils.form.listForms.invalidate(),
            ]);
        },
    });

    return { setPublishedAsync, error, status };
};