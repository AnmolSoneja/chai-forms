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

export const useUpdateForm = (formId: string) => {
    const utils = trpc.useUtils();
    const { mutateAsync: updateFormAsync, error, status } = trpc.form.updateForm.useMutation({
        onSuccess: async () => {
            await Promise.all([
                utils.form.getFormForOwner.invalidate({ formId }),
                utils.form.listForms.invalidate(),
            ]);
        },
    });

    return { updateFormAsync, error, status };
};

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

export const useListTemplates = () => {
    const { data: templates, error, isLoading, status } = trpc.form.listTemplates.useQuery();

    return { templates, error, isLoading, status };
};

export const useUseTemplate = () => {
    const utils = trpc.useUtils();
    const { mutateAsync: useTemplateAsync, error, status } = trpc.form.useTemplate.useMutation({
        onSuccess: async () => {
            await utils.form.listForms.invalidate();
        },
    });

    return { useTemplateAsync, error, status };
};

export const useDeleteForm = () => {
    const utils = trpc.useUtils();
    const {
        mutateAsync: deleteFormAsync,
        error,
        status,
    } = trpc.form.deleteForm.useMutation({
        onSuccess: async () => {
            await utils.form.invalidate();
        },
    });

    return { deleteFormAsync, error, status };
};