"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetSubmissionsByFormId } from "~/hooks/api/form-submission";
import { useGetFields } from "~/hooks/api/form-field";
import { DrawablyCard } from "drawably/react";

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

    const { submissions, isLoading: subsLoading, error } = useGetSubmissionsByFormId(formId ?? "");
    const { fields, isLoading: fieldsLoading } = useGetFields(formId ?? "");

    const rows = useMemo(() => (submissions ?? []) as Submission[], [submissions]);

    const loading = subsLoading || fieldsLoading;

    if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#2b1e16] p-6 text-[#f5e6d3]"><span className="frosting-spinner" aria-label="Loading" /></div>;
    if (error) return <div className="min-h-screen bg-[#2b1e16] p-6 text-[#e8a18c]">Error loading submissions</div>;

    return (
        <main className="min-h-screen bg-[#2b1e16] p-6 text-[#f5e6d3]">
            <DrawablyCard className="mx-auto max-w-5xl rounded-[1.5rem] bg-[#4a3428] p-6 shadow-[0_18px_60px_rgba(217,160,102,0.12)]">
                <h2 className="mb-4 text-lg font-semibold text-[#f5e6d3]">Submissions</h2>

                <div className="mb-4 text-sm text-[#d9a066]">Total: {rows.length}</div>

                {/* determine ordered fields to render as columns */}
                {fields && fields.length > 0 && (
                    <div className="mb-4 text-xs text-[#d9a066]/75">
                        Fields: {fields.map((f) => f.label).join(", ")}
                    </div>
                )}

                {rows.length === 0 ? (
                    <div className="rounded-xl border border-[#76543e] bg-[#2b1e16] p-4 text-[#d9a066]">No submissions yet.</div>
                ) : (
                    <div className="overflow-auto rounded-xl border border-[#76543e]">
                        <table className="min-w-full table-fixed text-sm">
                            <thead className="bg-[#2b1e16] text-left text-[#f5e6d3]">
                                <tr>
                                    <th className="px-4 py-2 w-1/6">ID</th>
                                    <th className="px-4 py-2 w-1/6">Submitted</th>
                                    {/** render a column per field in index order */}
                                    {(fields ?? [])
                                        .slice()
                                        .sort((a, b) => parseFloat(a.index) - parseFloat(b.index))
                                        .map((f) => (
                                            <th key={f.id} className="px-4 py-2 text-left text-sm">
                                                {f.label}
                                            </th>
                                        ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id} className="border-t border-[#76543e] odd:bg-[#4a3428] even:bg-[#543b2c]">
                                        <td className="px-4 py-3 align-top break-all text-xs text-[#f5e6d3]">
                                            {r.id}
                                        </td>
                                        <td className="px-4 py-3 align-top text-xs text-[#d9a066]">
                                            {r.createdAt
                                                ? new Date(r.createdAt).toLocaleString()
                                                : "-"}
                                        </td>

                                        {(fields ?? [])
                                            .slice()
                                            .sort(
                                                (a, b) => parseFloat(a.index) - parseFloat(b.index),
                                            )
                                            .map((f) => {
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
                )}
            </DrawablyCard>
        </main>
    );
}
