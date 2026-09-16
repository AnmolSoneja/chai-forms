import { trpc } from "~/trpc/client";

export const useCreateField = (formId: string) => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: createFieldAsync,
        mutate: createField,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    } = trpc.formField.createField.useMutation({
        onSuccess: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return {
        createFieldAsync,
        createField,
        error,
        failureCount,
        isError,
        isIdle,
        isSuccess,
        status,
    };
};

export const useDeleteField = (formId: string) => {
    const utils = trpc.useUtils();

    const {
        mutateAsync: deleteFieldAsync,
        error,
        status,
    } = trpc.formField.deleteField.useMutation({
        onSuccess: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return { deleteFieldAsync, error, status };
};

export const useUpdateField = (formId: string) => {
    const utils = trpc.useUtils();
    const {
        mutateAsync: updateFieldAsync,
        error,
        status,
    } = trpc.formField.updateField.useMutation({
        onSuccess: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return { updateFieldAsync, error, status };
};

export const useReorderFields = (formId: string) => {
    const utils = trpc.useUtils();
    const {
        mutateAsync: reorderFieldsAsync,
        error,
        status,
    } = trpc.formField.reorderFields.useMutation({
        onSuccess: async () => {
            await utils.formField.getFields.invalidate({ formId });
        },
    });

    return { reorderFieldsAsync, error, status };
};

export const useGetFields = (formId: string) => {
    const {
        data: fields,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.formField.getFields.useQuery({ formId });

    return {
        fields,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};
