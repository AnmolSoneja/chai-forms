"use client";

import { useState, type FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    Eye,
    PencilLine,
    Plus,
    FileText,
    Search,
    Link2,
    LayoutGrid,
    Megaphone,
    BarChart3,
    LineChart,
    Compass,
    Trash2,
} from "lucide-react";

import { useCreateForm, useDeleteForm, useListForms } from "~/hooks/api/form";
import { useUser } from "~/hooks/api/auth";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import {
    DrawablyButton,
    DrawablyInput,
    DrawablyTextarea,
    DrawablyDivider,
    DrawablyCard,
    DrawablyHighlight,
} from "drawably/react";

const THUMB_GRADIENTS = [
    "linear-gradient(135deg, #FFC2D1, #FFB3C6)",
    "linear-gradient(135deg, #D9A066, #C8956D)",
    "linear-gradient(135deg, #FFE29A, #FFC2D1)",
    "linear-gradient(135deg, #C8956D, #8A6755)",
];

function gradientFor(id: string) {
    const idx = Array.from(id).reduce((sum, c) => sum + c.charCodeAt(0), 0) % THUMB_GRADIENTS.length;
    return THUMB_GRADIENTS[idx];
}

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard/forms", icon: LayoutGrid, active: true },
    { label: "Templates", href: "/dashboard/templates", icon: Megaphone, active: false },
    // { label: "Responses", href: "/dashboard/responses", icon: BarChart3, active: false },
    // { label: "Analytics", href: "/dashboard/analytics", icon: LineChart, active: false },
    { label: "API Docs", href: "/dashboard/api-docs", icon: Compass, active: false },
];

export default function DashboardForms() {
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [query, setQuery] = useState("");

    const { createFormAsync, error, status } = useCreateForm();
    const { forms, isLoading } = useListForms();
    const { deleteFormAsync, error: deleteFormError, status: deleteFormStatus } = useDeleteForm();
    const { user } = useUser();
    const userName = user?.fullName || "there";

    const filteredForms = forms?.filter((f) =>
        f.title.toLowerCase().includes(query.toLowerCase()),
    );
    const totalForms = forms?.length ?? 0;
    const publishedForms = forms?.filter((form) => form.isPublished).length ?? 0;
    const publishedPercentage = totalForms === 0 ? 0 : Math.round((publishedForms / totalForms) * 100);

    const handleDeleteForm = async (formId: string, title: string) => {
        if (deleteFormStatus === "pending") return;
        if (!window.confirm(`Delete "${title}" and all its fields and responses?`)) return;

        await deleteFormAsync({ formId });
    };

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
        <div className="flex min-h-screen bg-(--theme-bg) text-(--theme-text)">
            {/* Sidebar */}
            <aside className="flex w-64 shrink-0 flex-col gap-6 border-r border-(--theme-border)/40 bg-(--theme-surface) p-5">
                <div className="flex items-center gap-3 px-1 pt-1">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-(--theme-accent) text-(--theme-bg) font-bold">
                        C
                    </div>
                    <div>
                        <p className="text-base font-bold leading-tight">ChaiForms</p>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-(--theme-muted)">
                            Form builder
                        </p>
                    </div>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <span>
                            <DrawablyButton
                                seed={2450220332} roughness={0.5} boil={0.2} width={3}
                                variant="solid"
                                className="flex w-full items-center justify-center! gap-2 bg-(--theme-accent) text-(--theme-bg)"
                            >
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

                <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.active && pathname === "/dashboard/forms");
                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => item.active && router.push(item.href)}
                                disabled={!item.active}
                                title={item.active ? undefined : "Coming soon"}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                                    isActive
                                        ? "bg-(--theme-accent)/15 text-(--theme-accent)"
                                        : item.active
                                          ? "text-(--theme-muted) hover:bg-(--theme-bg) hover:text-(--theme-text)"
                                          : "cursor-not-allowed text-(--theme-muted)/40"
                                }`}
                            >
                                <Icon className="size-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 px-8 py-10">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">

                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back, {userName}
                        </h1>
                        <p className="text-sm text-(--theme-muted)">
                            Create, share, and track your forms.
                        </p>
                    </div>

                    {/* Stat cards — Published is a placeholder until you add a status field */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl">
                        <DrawablyCard className="bg-(--theme-card) p-5 rounded-2xl">
                            <p className="text-xs font-semibold tracking-wide text-(--theme-muted) uppercase">
                                Total forms
                            </p>
                            <p className="mt-2 text-2xl font-bold">{forms ? totalForms : "—"}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-(--theme-muted)">
                                <FileText className="size-3" /> All your forms
                            </p>
                        </DrawablyCard>

                        <DrawablyCard className="bg-(--theme-card) p-5 rounded-2xl">
                            <p className="text-xs font-semibold tracking-wide text-(--theme-muted) uppercase">
                                Published
                            </p>
                            <div className="mt-2 flex items-end justify-between gap-3">
                                <p className="text-2xl font-bold">{forms ? publishedForms : "—"}</p>
                                <p className="text-xs font-semibold text-(--theme-muted)">
                                    {forms ? `${publishedPercentage}%` : "—"}
                                </p>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--theme-muted)/20">
                                <div
                                    className="h-full rounded-full bg-(--theme-accent) transition-[width]"
                                    style={{ width: `${publishedPercentage}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-(--theme-muted)">
                                {forms ? `${publishedForms} of ${totalForms} forms published` : "Loading status"}
                            </p>
                        </DrawablyCard>
                    </div>

                    <DrawablyDivider seed={4064633627} roughness={1.6} boil={0.6} width={1.5} />

                    {forms && forms.length > 4 && (
                        <div className="drawably-inputbox flex! h-11! w-full items-center gap-2 px-4">
                            <Search className="size-4 shrink-0 text-(--theme-muted)" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search forms"
                                className="h-full w-full border-0 bg-transparent text-(--theme-text) placeholder:text-(--theme-muted) focus:outline-none"
                            />
                        </div>
                    )}

                    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-64 animate-pulse rounded-2xl bg-(--theme-surface)"
                                />
                            ))
                        ) : filteredForms && filteredForms.length > 0 ? (
                            filteredForms.map((form) => (
                                <DrawablyCard
                                    key={form.id}
                                    className="flex flex-col overflow-hidden bg-(--theme-card) p-0 rounded-2xl"
                                >
                                    <div
                                        className="h-32 w-full"
                                        style={{ background: gradientFor(form.id) }}
                                    />

                                    <div className="flex flex-1 flex-col gap-3 p-5">
                                        <div className="flex items-start justify-between gap-2">
                                            <h2 className="truncate text-base font-semibold text-(--theme-text)">
                                                {form.title}
                                            </h2>
                                            
                                            <DrawablyHighlight 
                                                seed={257167514} 
                                                roughness={0.5} 
                                                boil={0.2} 
                                                width={3}
                                                className="text-sm">
                                                {form.isPublished ? "Published" : "Draft"}
                                            </DrawablyHighlight>
                                        </div>

                                        <p className="line-clamp-2 text-sm text-(--theme-muted)">
                                            {form.description || "No description"}
                                        </p>

                                        <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-(--theme-muted)">
                                            <span className="flex items-center gap-1">
                                                <Link2 className="size-3" />
                                                /form/{form.id.slice(0, 8)}
                                            </span>
                                            <span>·</span>
                                            <span>
                                                {form.createdAt
                                                    ? new Date(form.createdAt).toLocaleDateString(undefined, {
                                                          month: "short",
                                                          day: "numeric",
                                                      })
                                                    : ""}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <DrawablyButton
                                                variant="outline"
                                                onClick={() => router.push(`/form/${form.id}/submissions`)}
                                                className="flex flex-1 items-center justify-center! gap-1.5 bg-(--theme-surface) text-xs text-(--theme-text)"
                                            >
                                                <Eye className="size-3.5" />
                                                View
                                            </DrawablyButton>
                                            <DrawablyButton
                                                variant="outline"
                                                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
                                                className="flex flex-1 items-center justify-center! gap-1.5 bg-(--theme-surface) text-xs text-(--theme-text)"
                                            >
                                                <PencilLine className="size-3.5" />
                                                Edit
                                            </DrawablyButton>
                                            <DrawablyButton
                                                type="button"
                                                variant="outline"
                                                onClick={() => void handleDeleteForm(form.id, form.title)}
                                                disabled={deleteFormStatus === "pending"}
                                                aria-label={`Delete ${form.title}`}
                                                title="Delete form"
                                                className="flex flex-1 items-center justify-center! gap-1.5 bg-(--theme-surface) text-xs text-(--theme-text)"
                                            >
                                                <Trash2 className="size-3.5" />
                                                Delete
                                            </DrawablyButton>
                                        </div>
                                    </div>
                                </DrawablyCard>
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
                    {deleteFormError ? (
                        <p className="text-sm text-red-400">{deleteFormError.message}</p>
                    ) : null}
                </div>
            </main>
        </div>
    );
}