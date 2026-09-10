"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, PencilLine, Plus, FileText, Search } from "lucide-react";

import { useCreateForm, useListForms } from "~/hooks/api/form";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { DrawablyButton, DrawablyInput, DrawablyTextarea, DrawablyDivider } from "drawably/react";

export default function DashboardForms() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [query, setQuery] = useState("");

    const { createFormAsync, error, status } = useCreateForm();
    const { forms, isLoading } = useListForms();

    const filteredForms = forms?.filter((f) =>
        f.title.toLowerCase().includes(query.toLowerCase()),
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { id } = await createFormAsync({
            title: title.trim(),
            description: description.trim() ? description.trim() : undefined,
        });

        router.push(`/dashboard/forms/${id}`);
        setOpen(false);
        setTitle("");
        setDescription("");
    };

    return (
        <main className="min-h-screen bg-(--theme-bg) text-(--theme-text)">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">

                <div className="flex items-end justify-between gap-4 pb-6">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold tracking-wide text-(--theme-accent) uppercase">
                            Forms
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Your forms
                        </h1>
                        {forms && forms.length > 0 && (
                            <p className="text-sm text-(--theme-muted)">
                                {forms.length} {forms.length === 1 ? "form" : "forms"}
                            </p>
                        )}
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <span>
                                <DrawablyButton seed={2450220332} roughness={0.5} boil={0.2} width={3}
                                    variant="solid"
                                    className="flex shrink-0 items-center gap-2 bg-(--theme-accent) text-(--theme-bg)">
                                    <Plus className="size-4" />
                                    New form
                                </DrawablyButton>
                            </span>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl border-0 bg-(--theme-surface) text-(--theme-text) sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create a new form</DialogTitle>
                                <DialogDescription className="text-(--theme-muted)">
                                    Give it a name — you can add questions next.
                                </DialogDescription>
                            </DialogHeader>

                            <form className="space-y-5 pt-2" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium">
                                        Title
                                    </label>
                                    <DrawablyInput
                                        id="title"
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        placeholder="Customer feedback survey"
                                        autoFocus
                                        className="block w-full bg-(--theme-card) text-(--theme-text) placeholder:text-(--theme-muted)"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium">
                                        Description
                                        <span className="ml-1.5 font-normal text-(--theme-muted)">
                                            (optional)
                                        </span>
                                    </label>
                                    <DrawablyTextarea
                                        id="description"
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="What's this form for?"
                                        className="block w-full bg-(--theme-card) text-(--theme-text) placeholder:text-(--theme-muted)"
                                    />
                                </div>

                                {error ? (
                                    <p className="text-sm text-red-400">{error.message}</p>
                                ) : null}

                                <DialogFooter className="gap-2 pt-2">
                                    <DrawablyButton
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                        className="bg-(--theme-card) text-(--theme-text)"
                                    >
                                        Cancel
                                    </DrawablyButton>
                                    <DrawablyButton
                                        type="submit"
                                        variant="solid"
                                        disabled={status === "pending" || title.trim().length === 0}
                                        className="bg-(--theme-accent) text-(--theme-bg)"
                                    >
                                        {status === "pending" ? "Creating…" : "Create form"}
                                    </DrawablyButton>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <DrawablyDivider seed={4064633627} roughness={1.6} boil={0.6} width={1.5}></DrawablyDivider>

                {forms && forms.length > 4 && (
                    <div className="drawably-inputbox flex! h-11! items-center gap-2 px-4">
                        <Search className="size-4 shrink-0 text-(--theme-muted)" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search forms"
                            className="h-full w-full border-0 bg-transparent text-(--theme-text) placeholder:text-(--theme-muted) focus:outline-none"
                        />
                    </div>
                )}

                <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-44 animate-pulse rounded-2xl bg-(--theme-surface)"
                            />
                        ))
                    ) : filteredForms && filteredForms.length > 0 ? (
                        filteredForms.map((form) => (
                            <DrawablyButton
                                key={form.id}
                                variant="outline"
                                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                                className="flex h-48 w-full flex-col items-start justify-start! gap-3 bg-(--theme-card) p-8 text-left normal-case"
                                style={{ padding: "1.75rem 2rem" }}
                            >
                                <div className="min-w-0 w-full space-y-1">
                                    <h2 className="truncate text-lg font-semibold text-(--theme-text)">
                                        {form.title}
                                    </h2>
                                    <p className="line-clamp-2 text-sm font-normal text-(--theme-muted)">
                                        {form.description || "No description"}
                                    </p>
                                </div>

                                <div className="mt-auto flex w-full items-center justify-between pt-2">
                                    <span className="shrink-0 text-xs font-normal text-(--theme-muted)/70">
                                        {form.createdAt
                                            ? new Date(form.createdAt).toLocaleDateString(undefined, {
                                                  month: "short",
                                                  day: "numeric",
                                              })
                                            : ""}
                                    </span>

                                    <div
                                        className="flex shrink-0 items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/form/${form.id}/submissions`)}
                                            aria-label="View submissions"
                                            title="View submissions"
                                            className="rounded-lg border-0 bg-transparent p-2 text-(--theme-muted) transition hover:bg-(--theme-bg) hover:text-(--theme-text)"
                                        >
                                            <Eye className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                                            aria-label="Edit form"
                                            title="Edit form"
                                            className="rounded-lg border-0 bg-transparent p-2 text-(--theme-muted) transition hover:bg-(--theme-bg) hover:text-(--theme-text)"
                                        >
                                            <PencilLine className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </DrawablyButton>
                        ))
                    ) : forms && forms.length > 0 ? (
                        <div className="col-span-full rounded-2xl bg-(--theme-surface) px-6 py-10 text-center text-sm text-(--theme-muted)">
                            No forms match "{query}"
                        </div>
                    ) : (
                        <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl bg-(--theme-surface) px-6 py-14 text-center">
                            <FileText className="size-8 text-(--theme-muted)" />
                            <div className="space-y-1">
                                <p className="font-medium text-(--theme-text)">No forms yet</p>
                                <p className="text-sm text-(--theme-muted)">
                                    Create your first form to start collecting responses.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}