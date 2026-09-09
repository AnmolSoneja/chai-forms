"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";

import { useGetFormWithFields } from "~/hooks/api/form";
import { useCreateSubmission } from "~/hooks/api/form-submission";

import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Star } from "lucide-react";

export default function PublicFormPage() {
    const params = useParams();
    const formId = params?.id as string | undefined;

    const { form, isLoading } = useGetFormWithFields(formId ?? "");
    const { createSubmissionAsync, status, error } = useCreateSubmission();

    const [values, setValues] = useState<Record<string, string | string[]>>({});
    const [submitted, setSubmitted] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (!form?.fields) return;
        const initial: Record<string, string | string[]> = {};
        for (const f of form.fields) initial[f.id] = f.type === "MULTI_SELECT" ? [] : "";
        setValues(initial);
    }, [form?.fields]);

    const handleChange = (fieldId: string, v: string | string[]) => {
        setValues((s) => ({ ...s, [fieldId]: v }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formId) return;

        const fields = form?.fields ?? [];
        const invalidEmail = fields.find(
            (field) => field.type === "EMAIL"
                && typeof values[field.id] === "string"
                && values[field.id] !== ""
                && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[field.id] as string),
        );
        const missingRequiredGroup = fields.find(
            (field) => {
                const value = values[field.id];
                return field.isRequired
                    && ((field.type === "MULTI_SELECT" && (!Array.isArray(value) || value.length === 0))
                        || (field.type === "RATING" && !value));
            },
        );

        if (invalidEmail) {
            setValidationError(`${invalidEmail.label} must be a valid email address.`);
            return;
        }
        if (missingRequiredGroup) {
            setValidationError(`${missingRequiredGroup.label} is required.`);
            return;
        }
        setValidationError(null);

        const payload = {
            formId,
            values: Object.entries(values).map(([fieldId, value]) => ({ fieldId, value })),
        };

        try {
            await createSubmissionAsync(payload);
            setSubmitted(true);
            setValues((s) => Object.fromEntries(
                Object.entries(s).map(([fieldId, value]) => [fieldId, Array.isArray(value) ? [] : ""]),
            ));
        } catch {
            // The mutation error is rendered below the fields.
        }
    };

    if (isLoading) return <div className="p-6">Loading form…</div>;
    if (!form) return <div className="p-6">Form not found.</div>;

    return (
        <main className="min-h-screen bg-black text-white px-6 py-6">
            <div className="mx-auto max-w-2xl">
                <h1 className="text-2xl font-semibold mb-2">{form.title}</h1>
                {form.description ? <p className="text-white/60 mb-6">{form.description}</p> : null}

                {submitted ? (
                    <div className="mb-6 rounded-md bg-white/5 p-4 text-white/80">
                        Thanks — your submission was received.
                    </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {form.fields.map((f) => (
                        <div key={f.id} className="space-y-1">
                            <label className="block text-sm text-white/80">
                                {f.label}
                                {f.isRequired ? <span className="text-red-400"> *</span> : null}
                            </label>
                            {f.type === "SHORT_TEXT" && (
                                <Input
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                />
                            )}

                            {f.type === "LONG_TEXT" && (
                                <Textarea
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                    className="min-h-28"
                                />
                            )}

                            {f.type === "NUMBER" && (
                                <Input
                                    type="number"
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                />
                            )}

                            {f.type === "EMAIL" && (
                                <Input
                                    type="email"
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                />
                            )}

                            {f.type === "PASSWORD" && (
                                <Input
                                    type="password"
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                />
                            )}

                            {f.type === "DATE" && (
                                <Input
                                    type="date"
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    required={f.isRequired}
                                />
                            )}

                            {f.type === "YES_NO" && (
                                <select
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm text-white"
                                    required={f.isRequired}
                                >
                                    <option value="">Select...</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            )}

                            {f.type === "SINGLE_SELECT" && (
                                <select
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm text-white"
                                    required={f.isRequired}
                                >
                                    <option value="">Select...</option>
                                    {f.options.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            )}

                            {f.type === "MULTI_SELECT" && (
                                <div className="space-y-3" role="group" aria-label={f.label}>
                                    {f.options.map((option) => {
                                        const value = values[f.id];
                                        const current = Array.isArray(value) ? value : [];
                                        const selected = current.includes(option);
                                        return (
                                            <label key={option} className="flex items-center gap-3 text-sm text-white/80">
                                                <Checkbox
                                                    checked={selected}
                                                    onCheckedChange={(checked) => {
                                                        handleChange(
                                                            f.id,
                                                            checked ? [...current, option] : current.filter((value) => value !== option),
                                                        );
                                                    }}
                                                />
                                                {option}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {f.type === "RATING" && (
                                <div className="flex gap-2" role="radiogroup" aria-label={f.label}>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            aria-checked={values[f.id] === String(rating)}
                                            role="radio"
                                            onClick={() => handleChange(f.id, String(rating))}
                                            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                                            className="text-yellow-400 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className="size-8"
                                                fill={values[f.id] === String(rating) ? "currentColor" : "none"}
                                            />
                                        </button>
                                    ))}
                                    {f.isRequired && (
                                        <input
                                            tabIndex={-1}
                                            required={!values[f.id]}
                                            value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                            onChange={() => undefined}
                                            className="sr-only"
                                            aria-label={`${f.label} rating`}
                                        />
                                    )}
                                </div>
                            )}

                            {f.description ? (
                                <div className="text-sm text-white/60">{f.description}</div>
                            ) : null}
                        </div>
                    ))}

                    {validationError ? <div className="text-sm text-red-400">{validationError}</div> : null}
                    {error ? <div className="text-sm text-red-400">{error.message}</div> : null}

                    <div>
                        <Button
                            type="submit"
                            disabled={status === "pending"}
                            className="bg-white text-black"
                        >
                            {status === "pending" ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
