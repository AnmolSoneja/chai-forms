"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, LayoutTemplate } from "lucide-react";
import { useListTemplates, useUseTemplate } from "~/hooks/api/form";
import { DrawablyButton, DrawablyCard } from "drawably/react";

export default function TemplatesPage() {
    const router = useRouter();
    const { templates, isLoading } = useListTemplates();
    const { useTemplateAsync, error, status } = useUseTemplate();

    const handleUseTemplate = async (formId: string) => {
        const copy = await useTemplateAsync({ formId });
        router.push(`/dashboard/forms/${copy.id}`);
    };

    return (
        <div className="min-h-screen bg-(--theme-bg) text-(--theme-text)">
            <header className="flex items-center justify-between border-b border-(--theme-border)/40 bg-(--theme-surface) px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-(--theme-accent) font-bold text-(--theme-bg)">
                        C
                    </div>
                    <div>
                        <p className="font-bold">ChaiForms</p>
                        <p className="text-xs uppercase tracking-wide text-(--theme-muted)">Explore templates</p>
                    </div>
                </div>
                <DrawablyButton
                    variant="outline"
                    onClick={() => router.push("/dashboard/forms")}
                    className="flex items-center gap-2 bg-(--theme-card) text-(--theme-text)"
                >
                    <ArrowLeft className="size-4" />
                    My forms
                </DrawablyButton>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-10">
                <div className="mb-8 space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Explore templates</h1>
                    <p className="text-sm text-(--theme-muted)">
                        Start with a community form. Your copy is private and editable.
                    </p>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-56 animate-pulse rounded-2xl bg-(--theme-surface)" />
                        ))}
                    </div>
                ) : templates && templates.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <DrawablyCard key={template.id} className="flex flex-col gap-4 rounded-2xl bg-(--theme-card) p-6">
                                <div className="flex size-11 items-center justify-center rounded-xl bg-(--theme-accent)/15 text-(--theme-accent)">
                                    <LayoutTemplate className="size-5" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-lg font-semibold">{template.title}</h2>
                                    <p className="line-clamp-3 text-sm text-(--theme-muted)">
                                        {template.description || "No description"}
                                    </p>
                                </div>
                                <DrawablyButton
                                    variant="solid"
                                    onClick={() => void handleUseTemplate(template.id)}
                                    disabled={status === "pending"}
                                    className="mt-auto flex items-center justify-center! gap-2 bg-(--theme-accent) text-(--theme-bg)"
                                >
                                    <Copy className="size-4" />
                                    {status === "pending" ? "Copying..." : "Use template"}
                                </DrawablyButton>
                            </DrawablyCard>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl bg-(--theme-surface) px-6 py-14 text-center text-sm text-(--theme-muted)">
                        No templates have been published yet.
                    </div>
                )}

                {error ? <p className="mt-6 text-sm text-red-400">{error.message}</p> : null}
            </main>
        </div>
    );
}
