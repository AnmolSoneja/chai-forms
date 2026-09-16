"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Pencil,
    Trash2,
    GripVertical,
    Type,
    AlignLeft,
    Mail,
    Hash,
    CircleDot,
    ListChecks,
    Star,
    CheckSquare,
    Calendar,
    KeyRound,
    ToggleLeft,
    CheckCircle2,
    Link2,
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useCreateField, useDeleteField, useGetFields, useReorderFields, useUpdateField } from "~/hooks/api/form-field";
import { useDeleteForm, useGetFormForOwner, useSetPublished } from "~/hooks/api/form";

import {
    DrawablyButton,
    DrawablyInput,
    DrawablySelect,
    DrawablyTextarea,
    DrawablyCheckbox,
    DrawablyBadge,
    DrawablyCard,
} from "drawably/react";

type FieldType =
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "EMAIL"
    | "NUMBER"
    | "SINGLE_SELECT"
    | "MULTI_SELECT"
    | "YES_NO"
    | "PASSWORD"
    | "RATING"
    | "DATE";

const FIELD_PALETTE: { type: FieldType; label: string; icon: typeof Type }[] = [
    { type: "SHORT_TEXT", label: "Short Text", icon: Type },
    { type: "LONG_TEXT", label: "Long Text", icon: AlignLeft },
    { type: "EMAIL", label: "Email", icon: Mail },
    { type: "NUMBER", label: "Number", icon: Hash },
    { type: "SINGLE_SELECT", label: "Single Select", icon: CircleDot },
    { type: "MULTI_SELECT", label: "Multi Select", icon: ListChecks },
    { type: "RATING", label: "Rating", icon: Star },
    { type: "YES_NO", label: "Yes / No", icon: ToggleLeft },
    { type: "PASSWORD", label: "Password", icon: KeyRound },
    { type: "DATE", label: "Date", icon: Calendar },
];

const DEFAULT_LABEL: Record<FieldType, string> = {
    SHORT_TEXT: "New Short Text",
    LONG_TEXT: "New Long Text",
    EMAIL: "New Email",
    NUMBER: "New Number",
    SINGLE_SELECT: "New Single Select",
    MULTI_SELECT: "New Multi Select",
    YES_NO: "New Yes / No",
    PASSWORD: "New Password",
    RATING: "New Rating",
    DATE: "New Date",
};

type FieldRecord = {
    id: string;
    label: string;
    type: FieldType;
    description?: string | null;
    placeholder?: string | null;
    options: string[];
    isRequired: boolean;
};

function SortableFieldCard({
    field,
    index,
    isSelected,
    onSelect,
    onDelete,
    deleting,
}: {
    field: FieldRecord;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
    deleting: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <DrawablyCard
                onClick={onSelect}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-(--theme-surface) p-4 transition ${
                    isSelected
                        ? "border-(--theme-accent) shadow-[0_0_0_1px_var(--theme-accent)]"
                        : "border-(--theme-border)/40 hover:border-(--theme-border)"
                }`}
            >
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 cursor-grab touch-none text-(--theme-muted) active:cursor-grabbing"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="size-4" />
                </button>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-(--theme-accent)">
                        <span>{index + 1}</span>
                        <span className="uppercase tracking-wide">{field.type.replace("_", " ")}</span>
                        {field.isRequired && (
                            <span className="text-(--theme-muted)">*required</span>
                        )}
                    </div>
                    <p className="mt-1 truncate text-base font-medium text-(--theme-text)">
                        {field.label}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    disabled={deleting}
                    aria-label={`Delete ${field.label}`}
                    title="Delete field"
                    className="rounded-lg p-1.5 text-(--theme-muted) transition hover:bg-[#e8a18c]/10 hover:text-[#e8a18c]"
                >
                    <Trash2 className="size-4" />
                </button>
            </DrawablyCard>
        </div>
    );
}

export default function FormBuilder() {
    const params = useParams();
    const router = useRouter();
    const formId = params?.id as string | undefined;

    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [panelLabel, setPanelLabel] = useState("");
    const [panelType, setPanelType] = useState<FieldType>("SHORT_TEXT");
    const [panelDescription, setPanelDescription] = useState("");
    const [panelPlaceholder, setPanelPlaceholder] = useState("");
    const [panelOptionsText, setPanelOptionsText] = useState("");
    const [panelRequired, setPanelRequired] = useState(false);
    const [localOrder, setLocalOrder] = useState<string[]>([]);

    const { createFieldAsync, status: createStatus } = useCreateField(formId ?? "");
    const { deleteFieldAsync, status: deleteStatus } = useDeleteField(formId ?? "");
    const { updateFieldAsync, status: updateStatus, error: updateError } = useUpdateField(formId ?? "");
    const { reorderFieldsAsync, status: reorderStatus } = useReorderFields(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");
    const { form } = useGetFormForOwner(formId ?? "");
    const { setPublishedAsync, status: publishStatus } = useSetPublished(formId ?? "");
    const { deleteFormAsync, status: deleteFormStatus } = useDeleteForm();

    const supportsPlaceholder = !["SINGLE_SELECT", "MULTI_SELECT", "YES_NO", "RATING"].includes(panelType);
    const supportsOptions = panelType === "SINGLE_SELECT" || panelType === "MULTI_SELECT";

    // Keep local drag order in sync with the persisted server order.
    useEffect(() => {
        if (fields) setLocalOrder(fields.map((f) => f.id));
    }, [fields]);

    const orderedFields: FieldRecord[] = localOrder
        .map((id) => fields?.find((f) => f.id === id))
        .filter((f): f is NonNullable<typeof f> => Boolean(f));

    const selectedField = orderedFields.find((f) => f.id === selectedFieldId) ?? null;

    useEffect(() => {
    if (!selectedFieldId) return;

    if (!selectedField) {
        setPanelLabel("");
        setPanelType("SHORT_TEXT");
        setPanelDescription("");
        setPanelPlaceholder("");
        setPanelOptionsText("");
        setPanelRequired(false);
        return;
    }

    setPanelLabel(selectedField.label);
    setPanelType(selectedField.type);
    setPanelDescription(selectedField.description ?? "");
    setPanelPlaceholder(selectedField.placeholder ?? "");
    setPanelOptionsText(selectedField.options.join("\n"));
    setPanelRequired(selectedField.isRequired);
}, [selectedFieldId, selectedField]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const nextOrder = arrayMove(localOrder, localOrder.indexOf(String(active.id)), localOrder.indexOf(String(over.id)));
        setLocalOrder(nextOrder);

        try {
            await reorderFieldsAsync({ formId: formId ?? "", orderedIds: nextOrder });
        } catch {
            setLocalOrder(localOrder);
        }
    };

    const DEFAULT_OPTIONS: Partial<Record<FieldType, string[]>> = {
        SINGLE_SELECT: ["Option 1"],
        MULTI_SELECT: ["Option 1"],
    };

    const handleAddField = async (type: FieldType) => {
        if (!formId) return;
        const created = await createFieldAsync({
            formId,
            label: DEFAULT_LABEL[type],
            type,
            isRequired: false,
            options: DEFAULT_OPTIONS[type] ?? [],
        });
        if (created?.id) setSelectedFieldId(created.id);
    };

    const handleSavePanel = async () => {
        if (!formId || !selectedFieldId) return;
        await updateFieldAsync({
            id: selectedFieldId,
            formId,
            label: panelLabel.trim(),
            type: panelType,
            description: panelDescription.trim() || undefined,
            placeholder: supportsPlaceholder && panelPlaceholder.trim() ? panelPlaceholder.trim() : undefined,
            isRequired: panelRequired,
            options: supportsOptions
                ? panelOptionsText.split("\n").map((o) => o.trim()).filter(Boolean)
                : [],
        });
    };

    const handleDeleteField = async (fieldId: string, fieldLabel: string) => {
        if (!window.confirm(`Delete "${fieldLabel}"?`)) return;
        await deleteFieldAsync({ id: fieldId });
        if (selectedFieldId === fieldId) setSelectedFieldId(null);
    };

    const handlePublishToggle = async () => {
        if (!form || publishStatus === "pending") return;
        await setPublishedAsync({ formId: formId ?? "", isPublished: !form.isPublished });
    };

    const handleDeleteForm = async () => {
        if (!formId || !form || deleteFormStatus === "pending") return;
        if (!window.confirm(`Delete "${form.title}" and all its fields and submissions?`)) return;
        await deleteFormAsync({ formId });
        router.push("/dashboard/forms");
    };

    const handleCopyLink = () => {
        if (!formId) return;
        const url = `${window.location.origin}/f/${formId}`;
        void navigator.clipboard.writeText(url);
    };

    return (
        <div className="flex h-screen flex-col bg-(--theme-bg) text-(--theme-text)">
            {/* Top bar */}
            <header className="flex shrink-0 items-center justify-between border-b border-(--theme-border)/40 bg-(--theme-surface) px-5 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-(--theme-accent) text-(--theme-bg)">
                            C
                        </div>
                        ChaiForms
                    </div>
                    <span className="text-(--theme-muted)">/</span>
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/forms")}
                        className="text-sm text-(--theme-muted) hover:text-(--theme-text)"
                    >
                        Dashboard
                    </button>
                    <span className="text-(--theme-muted)">/</span>
                    <span className="text-sm font-semibold">{form?.title ?? "Form Builder"}</span>
                </div>

                <nav className="flex items-center gap-1 text-sm font-medium">
                    {["Preview", "Responses"].map((label) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => {
                                if (label === "Responses") router.push(`/form/${formId}/submissions`);
                                if (label === "Preview") router.push(`/f/${formId}`);
                            }}
                            className="rounded-lg px-3 py-1.5 text-(--theme-muted) transition hover:bg-(--theme-bg) hover:text-(--theme-text)"
                        >
                            {label}
                        </button>
                    ))}
                    <span className="rounded-lg bg-(--theme-accent)/15 px-3 py-1.5 text-(--theme-accent)">
                        Builder
                    </span>
                </nav>

                <div className="flex items-center gap-2">
                    <div
                        className={`flex items-center gap-1 ${
                            form?.isPublished
                                ? "bg-green-500/15 text-green-500 px-3 py-1.5 text-sm font-medium rounded-lg"
                                : "bg-(--theme-muted)/15 text-(--theme-muted) px-3 py-1.5 text-sm font-medium rounded-lg"
                        }`}
                    >
                        <CheckCircle2 className="size-3" />
                        {form?.isPublished ? "Published" : "Unpublished"}
                    </div>

                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-(--theme-border)/50 bg-(--theme-card) px-3 py-1.5 text-sm font-medium text-(--theme-text) hover:border-(--theme-accent)/50"
                    >
                        <Link2 className="size-3.5" />
                        Copy Link
                    </button>

                    <button
                        type="button"
                        onClick={() => void handlePublishToggle()}
                        disabled={!form || publishStatus === "pending"}
                        className="action-button cursor-pointer rounded-xl bg-(--theme-accent) px-3 py-1.5 text-sm font-bold text-(--theme-bg) transition hover:brightness-105 disabled:cursor-not-allowed"
                    >
                        {publishStatus === "pending"
                            ? form?.isPublished ? "Unpublishing..." : "Publishing..."
                            : form?.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                        type="button"
                        onClick={() => void handleDeleteForm()}
                        disabled={!form || deleteFormStatus === "pending"}
                        aria-label="Delete form"
                        title="Delete form"
                        className="rounded-lg p-2 text-(--theme-muted) cursor-pointer transition hover:bg-[#e8a18c]/10 hover:text-[#e8a18c]"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: field palette */}
                <aside className="w-56 shrink-0 overflow-y-auto border-r border-(--theme-border)/40 bg-(--theme-surface) p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-(--theme-muted)">
                        Add field
                    </p>
                    <div className="flex flex-col gap-1">
                        {FIELD_PALETTE.map(({ type, label, icon: Icon }) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => void handleAddField(type)}
                                disabled={!formId || createStatus === "pending"}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-(--theme-text) transition hover:bg-(--theme-bg)"
                            >
                                <Icon className="size-4 text-(--theme-muted)" />
                                {label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Center: canvas */}
                <main className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="mx-auto flex max-w-2xl flex-col gap-3">
                        {fieldsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 animate-pulse rounded-2xl bg-(--theme-surface)" />
                            ))
                        ) : orderedFields.length > 0 ? (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(event) => void handleDragEnd(event)}
                            >
                                <SortableContext items={localOrder} strategy={verticalListSortingStrategy}>
                                    {orderedFields.map((field, index) => (
                                        <SortableFieldCard
                                            key={field.id}
                                            field={field}
                                            index={index}
                                            isSelected={field.id === selectedFieldId}
                                            onSelect={() => setSelectedFieldId(field.id)}
                                            onDelete={() => void handleDeleteField(field.id, field.label)}
                                            deleting={deleteStatus === "pending" || reorderStatus === "pending"}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-(--theme-border)/60 bg-(--theme-surface) p-10 text-center text-sm text-(--theme-muted)">
                                No fields yet — add one from the left panel.
                            </div>
                        )}
                    </div>
                </main>

                {/* Right: field properties */}
                <aside className="w-80 shrink-0 overflow-y-auto border-l border-(--theme-border)/40 bg-(--theme-surface) p-5">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-(--theme-muted)">
                        Field properties
                    </p>

                    {!selectedField ? (
                        <p className="text-sm text-(--theme-muted)">
                            Select a field to edit its properties.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <DrawablyBadge className="w-fit bg-(--theme-accent)/15 text-(--theme-accent)">
                                {panelType.replace("_", " ")}
                            </DrawablyBadge>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-(--theme-muted)">Label</label>
                                <DrawablyInput
                                    value={panelLabel}
                                    onChange={(e) => setPanelLabel(e.target.value)}
                                    className="block w-full bg-(--theme-card) text-(--theme-text)"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-(--theme-muted)">Type</label>
                                <DrawablySelect
                                    value={panelType}
                                    onChange={(e) => setPanelType(e.target.value as FieldType)}
                                    className="block w-full bg-(--theme-card) text-sm text-(--theme-text)"
                                >
                                    {FIELD_PALETTE.map(({ type, label }) => (
                                        <option key={type} value={type}>
                                            {label}
                                        </option>
                                    ))}
                                </DrawablySelect>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-(--theme-muted)">Description</label>
                                <DrawablyTextarea
                                    value={panelDescription}
                                    onChange={(e) => setPanelDescription(e.target.value)}
                                    placeholder="Optional helper text"
                                    className="block w-full bg-(--theme-card) text-(--theme-text)"
                                />
                            </div>

                            {supportsPlaceholder && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-(--theme-muted)">Placeholder</label>
                                    <DrawablyInput
                                        value={panelPlaceholder}
                                        onChange={(e) => setPanelPlaceholder(e.target.value)}
                                        placeholder="Optional placeholder"
                                        className="block w-full bg-(--theme-card) text-(--theme-text)"
                                    />
                                </div>
                            )}

                            {supportsOptions && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-(--theme-muted)">Options</label>
                                    <DrawablyTextarea
                                        value={panelOptionsText}
                                        onChange={(e) => setPanelOptionsText(e.target.value)}
                                        placeholder="One option per line"
                                        className="block w-full bg-(--theme-card) text-(--theme-text)"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <DrawablyCheckbox
                                    checked={panelRequired}
                                    onChange={(e) => setPanelRequired(e.target.checked)}
                                />
                                <span className="text-sm text-(--theme-text)">Required</span>
                            </div>

                            {updateError ? (
                                <p className="text-sm text-red-400">{updateError.message}</p>
                            ) : null}

                            <button
                                type="button"
                                onClick={() => void handleSavePanel()}
                                disabled={updateStatus === "pending" || !panelLabel.trim()}
                                className="action-button w-full rounded-xl bg-(--theme-accent) px-3 py-2 text-sm font-bold text-(--theme-bg) transition hover:brightness-105 disabled:cursor-not-allowed"
                            >
                                {updateStatus === "pending" ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}