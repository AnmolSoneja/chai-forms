"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useGetSubmissionsByFormId } from "~/hooks/api/form-submission";
import { useGetFields } from "~/hooks/api/form-field";
import { DrawablyCard, DrawablyDivider, DrawablyToggle } from "drawably/react";

type Submission = {
    id: string;
    formId?: string | null;
    values?: { fieldId: string; value: string | string[] }[] | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export default function FormSubmissions() {
    const params = useParams();
    const formId = params?.id as string | undefined;
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [expandAll, setExpandAll] = useState(false);

    const { submissions, isLoading: subsLoading, error } = useGetSubmissionsByFormId(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");

    const rows = useMemo(() => (submissions ?? []) as Submission[], [submissions]);
    const orderedFields = useMemo(
        () => (fields ?? []).slice().sort((a, b) => parseFloat(a.index) - parseFloat(b.index)),
        [fields],
    );
    const fieldAnalytics = useMemo(
        () => orderedFields.map((field) => {
            const filledResponses = rows.filter((row) => {
                const value = row.values?.find((item) => item.fieldId === field.id)?.value;
                return Array.isArray(value) ? value.length > 0 : typeof value === "string" && value.trim().length > 0;
            }).length;

            return {
                ...field,
                filledResponses,
                completionRate: rows.length === 0 ? 0 : Math.round((filledResponses / rows.length) * 100),
            };
        }),
        [orderedFields, rows],
    );

    const loading = subsLoading || fieldsLoading;

    const toggleRow = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleExpandAllToggle = (checked: boolean) => {
        setExpandAll(checked);
        setExpandedIds(checked ? new Set(rows.map((r) => r.id)) : new Set());
    };

    const isRowExpanded = (id: string) => expandAll || expandedIds.has(id);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--theme-bg) p-6 text-(--theme-text)">
                <span className="frosting-spinner" aria-label="Loading" />
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen bg-(--theme-bg) p-6 text-(--theme-text)">
                Error loading submissions
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-(--theme-bg) p-6 text-(--theme-text)">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">

                {/* Responses */}
                <DrawablyCard className="rounded-[1.5rem] bg-(--theme-surface) p-6 shadow-[0_18px_60px_rgba(217,160,102,0.12)]">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-(--theme-text)">Responses</h2>
                            <p className="mt-1 text-sm text-(--theme-muted)">
                                {rows.length} {rows.length === 1 ? "submission" : "submissions"} · click a row to expand it
                            </p>
                        </div>

                        {rows.length > 0 && (
                            <label className="flex shrink-0 items-center gap-2 text-sm text-(--theme-muted)">
                                Expand all
                                <DrawablyToggle
                                    seed={45194250}
                                    roughness={0.6}
                                    boil={0.5}
                                    width={1.5}
                                    checked={expandAll}
                                    onChange={(e) => handleExpandAllToggle(e.target.checked)}
                                />
                            </label>
                        )}
                    </div>

                    {rows.length === 0 ? (
                        <div className="rounded-xl border border-(--theme-border)/50 bg-(--theme-card) p-4 text-sm text-(--theme-muted)">
                            No submissions yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {rows.map((r) => {
                                const expanded = isRowExpanded(r.id);
                                return (
                                    <div
                                        key={r.id}
                                        className="overflow-hidden rounded-xl border border-(--theme-border)/50 bg-(--theme-card)"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleRow(r.id)}
                                            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-(--theme-accent)/10"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-xs text-(--theme-muted)">
                                                    {r.id.slice(0, 12)}…
                                                </span>
                                                <span className="text-xs text-(--theme-muted)">
                                                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                                                </span>
                                            </div>
                                            <ChevronDown
                                                className={`size-4 shrink-0 text-(--theme-muted) transition-transform ${
                                                    expanded ? "rotate-180" : ""
                                                }`}
                                            />
                                        </button>

                                        {expanded && (
                                            <div className="flex flex-col divide-y divide-(--theme-border)/40 border-t border-(--theme-border)/40">
                                                {orderedFields.map((f) => {
                                                    const v = r.values?.find((x) => x.fieldId === f.id)?.value;
                                                    const display = Array.isArray(v)
                                                        ? v.length > 0 ? v.join(", ") : "-"
                                                        : v && v.trim() !== "" ? v : "-";

                                                    return (
                                                        <div key={f.id} className="flex flex-col gap-0.5 px-4 py-2.5">
                                                            <span className="text-xs font-semibold uppercase tracking-wide text-(--theme-muted)">
                                                                {f.label}
                                                            </span>
                                                            <span className="text-sm text-(--theme-text)">{display}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </DrawablyCard>

                <DrawablyDivider seed={1839204923} roughness={1.4} boil={0.4} width={1.5} />

                {/* Analytics */}
                <DrawablyCard className="rounded-[1.5rem] bg-(--theme-surface) p-6 shadow-[0_18px_60px_rgba(217,160,102,0.12)]">
                    <div className="mb-5">
                        <h2 className="text-lg font-semibold text-(--theme-text)">Response analytics</h2>
                        <p className="mt-1 text-sm text-(--theme-muted)">See how often users completed each field.</p>
                    </div>

                    <div className="mb-6 rounded-xl border border-(--theme-border)/50 bg-(--theme-card) p-5">
                        <div className="text-sm text-(--theme-muted)">Total responses</div>
                        <div className="mt-1 text-4xl font-semibold text-(--theme-text)">{rows.length}</div>
                    </div>

                    {fieldAnalytics.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {fieldAnalytics.map((field) => (
                                <div key={field.id} className="rounded-xl border border-(--theme-border)/50 bg-(--theme-card) p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate font-medium text-(--theme-text)">{field.label}</div>
                                            <div className="mt-1 text-xs text-(--theme-muted)">
                                                {field.filledResponses} of {rows.length} responses
                                            </div>
                                        </div>
                                        <div className="text-xl font-semibold text-(--theme-text)">{field.completionRate}%</div>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-(--theme-border)/50">
                                        <div
                                            className="h-full rounded-full bg-(--theme-accent) transition-[width]"
                                            style={{ width: `${field.completionRate}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-(--theme-border)/50 bg-(--theme-card) p-4 text-(--theme-muted)">
                            No fields yet.
                        </div>
                    )}
                </DrawablyCard>
            </div>
        </main>
    );
}