"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Trash2 } from "lucide-react";

import { useCreateField, useDeleteField, useGetFields } from "~/hooks/api/form-field";
import { useGetFormForOwner, useSetPublished } from "~/hooks/api/form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { DrawablyButton, DrawablyCard, DrawablyCheckbox, DrawablyInput, DrawablySelect, DrawablyTextarea } from "drawably/react";

export default function FormBuilder() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState("");
    const [type, setType] = useState<
        | "SHORT_TEXT"
        | "LONG_TEXT"
        | "EMAIL"
        | "NUMBER"
        | "SINGLE_SELECT"
        | "MULTI_SELECT"
        | "YES_NO"
        | "PASSWORD"
        | "RATING"
        | "DATE"
    >("SHORT_TEXT");
    const [description, setDescription] = useState("");
    const [placeholder, setPlaceholder] = useState("");
    const [optionsText, setOptionsText] = useState("");
    const [isRequired, setIsRequired] = useState(false);

    const { createFieldAsync, status, error } = useCreateField(formId ?? "");
    const { deleteFieldAsync, error: deleteError, status: deleteStatus } = useDeleteField(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");
    const { form } = useGetFormForOwner(formId ?? "");
    const { setPublishedAsync, error: publishError, status: publishStatus } = useSetPublished(formId ?? "");
    const supportsPlaceholder = !["SINGLE_SELECT", "MULTI_SELECT", "YES_NO", "RATING"].includes(type);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formId) return;

        await createFieldAsync({
            label: label.trim(),
            type,
            formId,
            description: description.trim() ? description.trim() : undefined,
            placeholder: supportsPlaceholder && placeholder.trim() ? placeholder.trim() : undefined,
            isRequired,
            options: optionsText.split("\n").map((option) => option.trim()).filter(Boolean),
        });

        setOpen(false);
        setLabel("");
        setType("SHORT_TEXT");
        setDescription("");
        setPlaceholder("");
        setOptionsText("");
        setIsRequired(false);
    };

    const handleDelete = async (fieldId: string, fieldLabel: string) => {
        if (!window.confirm(`Delete "${fieldLabel}"?`)) return;

        await deleteFieldAsync({ id: fieldId });
    };

    const handlePublishToggle = async () => {
        if (!form || publishStatus === "pending") return;

        await setPublishedAsync({ formId: formId ?? "", isPublished: !form?.isPublished });
    };

    return (
        <main className="min-h-screen bg-(--theme-bg) px-6 py-6 text-(--theme-text)">
            <div className="mx-auto max-w-3xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">{form?.title ?? "Form Builder"}</h1>
                        <p className="text-sm text-(--theme-muted)">
                            {form?.isPublished ? "Published" : "Unpublished"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <DrawablyButton
                            type="button"
                            variant="solid"
                            onClick={() => void handlePublishToggle()}
                            aria-disabled={!form || publishStatus === "pending"}
                            className="publish-button bg-(--theme-accent) text-(--theme-bg)"
                        >
                            {publishStatus === "pending"
                                ? form?.isPublished ? "Unpublishing..." : "Publishing..."
                                : form?.isPublished ? "Unpublish" : "Publish"}
                        </DrawablyButton>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <span>
                                    <DrawablyButton variant="solid" className="bg-(--theme-accent) text-(--theme-bg)">Create Field</DrawablyButton>
                                </span>
                            </DialogTrigger>

                        <DialogContent className="border-0 bg-(--theme-surface) text-(--theme-text) sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create Field</DialogTitle>
                                <DialogDescription className="text-(--theme-muted)">
                                    Add a field to this form.
                                </DialogDescription>
                            </DialogHeader>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="text-sm text-(--theme-text)/75 block mb-1">
                                        Label
                                    </label>
                                    <DrawablyInput
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        placeholder="Field label"
                                        className="block w-full [&>input]:h-10"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-(--theme-text)/75 block mb-1">Type</label>
                                    <DrawablySelect
                                        value={type}
                                        onChange={(e) =>
                                            setType(
                                                e.target.value as
                                                    | "SHORT_TEXT"
                                                    | "LONG_TEXT"
                                                    | "NUMBER"
                                                    | "EMAIL"
                                                    | "SINGLE_SELECT"
                                                    | "MULTI_SELECT"
                                                    | "YES_NO"
                                                    | "PASSWORD"
                                                    | "RATING"
                                                    | "DATE",
                                            )
                                        }
                                        className="block w-full bg-(--theme-bg) text-sm text-(--theme-text) [&>select]:h-10"
                                    >
                                        <option value="SHORT_TEXT">Short text</option>
                                        <option value="LONG_TEXT">Long text</option>
                                        <option value="NUMBER">Number</option>
                                        <option value="EMAIL">Email</option>
                                        <option value="SINGLE_SELECT">Single select</option>
                                        <option value="MULTI_SELECT">Multi select</option>
                                        <option value="YES_NO">Yes / No</option>
                                        <option value="PASSWORD">Password</option>
                                        <option value="RATING">Rating</option>
                                        <option value="DATE">Date</option>
                                    </DrawablySelect>
                                </div>

                                <div>
                                    <label className="text-sm text-(--theme-text)/75 block mb-1">
                                        Description
                                    </label>
                                    <DrawablyTextarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional helper text"
                                        className="block w-full"
                                    />
                                </div>

                                {supportsPlaceholder && (
                                    <div>
                                        <label className="text-sm text-(--theme-text)/75 block mb-1">
                                            Placeholder
                                        </label>
                                        <DrawablyInput
                                            value={placeholder}
                                            onChange={(e) => setPlaceholder(e.target.value)}
                                            placeholder="Optional placeholder"
                                            className="block w-full [&>input]:h-10"
                                        />
                                    </div>
                                )}

                                {(type === "SINGLE_SELECT" || type === "MULTI_SELECT") && (
                                    <div>
                                        <label className="text-sm text-(--theme-text)/75 block mb-1">
                                            Options
                                        </label>
                                        <DrawablyTextarea
                                            value={optionsText}
                                            onChange={(e) => setOptionsText(e.target.value)}
                                            placeholder="One option per line"
                                            required
                                            className="block w-full"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <DrawablyCheckbox
                                        checked={isRequired}
                                        onChange={(event) => setIsRequired(event.target.checked)}
                                    />
                                    <span className="text-sm text-(--theme-text)/75">Required</span>
                                </div>

                                {error ? (
                                    <p className="text-sm text-red-400">{error.message}</p>
                                ) : null}

                                <DialogFooter>
                                    <DrawablyButton
                                        type="submit"
                                        variant="solid"
                                        disabled={status === "pending" || !label.trim()}
                                        className="bg-(--theme-accent) text-(--theme-bg)"
                                    >
                                        {status === "pending" ? "Creating..." : "Create Field"}
                                    </DrawablyButton>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {publishError ? (
                    <p className="mb-4 text-sm text-red-400">{publishError.message}</p>
                ) : null}

                <section className="grid gap-3">
                    <DrawablyCard className="bg-transparent p-6 text-sm text-(--theme-muted)">
                        Form canvas
                    </DrawablyCard>

                    {fieldsLoading ? (
                        <div className="border-0 bg-(--theme-surface) p-4 text-sm text-(--theme-muted)">
                            Loading fields...
                        </div>
                    ) : fields && fields.length > 0 ? (
                        fields.map((f) => (
                            <DrawablyCard
                                key={f.id}
                                className="flex items-center justify-between border-0 bg-(--theme-surface) p-4 shadow-[0_12px_35px_rgba(217,160,102,0.08)]"
                            >
                                <div>
                                    <div className="font-medium text-(--theme-text)">{f.label}</div>
                                    <div className="text-sm text-(--theme-muted)/75">
                                        {f.description || f.placeholder || ""}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-sm text-(--theme-muted)">{f.type}</div>
                                    <DrawablyButton
                                        type="button"
                                        variant="outline"
                                        onClick={() => void handleDelete(f.id, f.label)}
                                        disabled={deleteStatus === "pending"}
                                        aria-label={`Delete ${f.label}`}
                                        title="Delete field"
                                        className="text-[#e8a18c] hover:bg-[#e8a18c]/10 hover:text-[#f5c0af]"
                                    >
                                        <Trash2 />
                                    </DrawablyButton>
                                </div>
                            </DrawablyCard>
                        ))
                    ) : (
                        <div className="border-0 bg-(--theme-surface) p-4 text-sm text-(--theme-muted)">
                            No fields yet.
                        </div>
                    )}
                    {deleteError ? (
                        <div className="text-sm text-red-400">{deleteError.message}</div>
                    ) : null}
                </section>
            </div>
        </main>
    );
}
