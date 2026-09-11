"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useGetSubmissionsByFormId } from "~/hooks/api/form-submission";
import { useGetFields } from "~/hooks/api/form-field";
import { DrawablyButton, DrawablyCard } from "drawably/react";

type Submission = {
    id: string;
    formId?: string | null;
    values?: { fieldId: string; value: string }[] | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export default function FormSubmissions() {
    const params = useParams();
    const formId = params?.id as string | undefined;
    const [showResponses, setShowResponses] = useState(false);

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

    if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#2b1e16] p-6 text-[#f5e6d3]"><span className="frosting-spinner" aria-label="Loading" /></div>;
    if (error) return <div className="min-h-screen bg-[#2b1e16] p-6 text-[#e8a18c]">Error loading submissions</div>;

    return (
        <main className="min-h-screen bg-[#2b1e16] p-6 text-[#f5e6d3]">
            <DrawablyCard className="mx-auto max-w-5xl rounded-[1.5rem] bg-[#4a3428] p-6 shadow-[0_18px_60px_rgba(217,160,102,0.12)]">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[#f5e6d3]">Response analytics</h2>
                        <p className="mt-1 text-sm text-[#d9a066]">See how often users completed each field.</p>
                    </div>
                    <DrawablyButton
                        type="button"
                        variant="outline"
                        onClick={() => setShowResponses((visible) => !visible)}
                        className="shrink-0 border-[#d9a066] text-[#f5e6d3]"
                    >
                        {showResponses ? "Hide responses" : "Show responses"}
                    </DrawablyButton>
                </div>

                <div className="mb-6 rounded-xl border border-[#76543e] bg-[#2b1e16] p-5">
                    <div className="text-sm text-[#d9a066]">Total responses</div>
                    <div className="mt-1 text-4xl font-semibold text-[#f5e6d3]">{rows.length}</div>
                </div>

                {fieldAnalytics.length > 0 ? (
                    <div className="mb-6 grid gap-3 sm:grid-cols-2">
                        {fieldAnalytics.map((field) => (
                            <div key={field.id} className="rounded-xl border border-[#76543e] bg-[#2b1e16] p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="truncate font-medium text-[#f5e6d3]">{field.label}</div>
                                        <div className="mt-1 text-xs text-[#d9a066]">
                                            {field.filledResponses} of {rows.length} responses
                                        </div>
                                    </div>
                                    <div className="text-xl font-semibold text-[#f5e6d3]">{field.completionRate}%</div>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#76543e]">
                                    <div
                                        className="h-full rounded-full bg-[#d9a066] transition-[width]"
                                        style={{ width: `${field.completionRate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mb-6 rounded-xl border border-[#76543e] bg-[#2b1e16] p-4 text-[#d9a066]">No fields yet.</div>
                )}

                {showResponses && (rows.length === 0 ? (
                    <div className="rounded-xl border border-[#76543e] bg-[#2b1e16] p-4 text-[#d9a066]">No submissions yet.</div>
                ) : (
                    <div className="overflow-auto rounded-xl border border-[#76543e]">
                        <table className="min-w-full table-fixed text-sm">
                            <thead className="bg-[#2b1e16] text-left text-[#f5e6d3]">
                                <tr>
                                    <th className="px-4 py-2 w-1/6">Submitted</th>
                                    {/** render a column per field in index order */}
                                    {orderedFields.map((f) => (
                                            <th key={f.id} className="px-4 py-2 text-left text-sm">
                                                {f.label}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id} className="border-t border-[#76543e] odd:bg-[#4a3428] even:bg-[#543b2c]">
                                        <td className="px-4 py-3 align-top text-xs text-[#d9a066]">
                                            {r.createdAt
                                                ? new Date(r.createdAt).toLocaleString()
                                                : "-"}
                                        </td>

                                        {orderedFields.map((f) => {
                                                const v = r.values?.find((x) => x.fieldId === f.id);
                                                return (
                                                    <td
                                                        key={f.id}
                                                        className="px-4 py-3 align-top text-xs text-[#f5e6d3]/85"
                                                    >
                                                        {v ? v.value : "-"}
                                                    </td>
                                                );
                                            })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </DrawablyCard>
        </main>
    );
}
