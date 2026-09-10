"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import { useGetFormWithFields } from "~/hooks/api/form";
import { useCreateSubmission } from "~/hooks/api/form-submission";

import { Star } from "lucide-react";
import { DrawablyButton, DrawablyCheckbox, DrawablyInput, DrawablySelect, DrawablyTextarea } from "drawably/react";

export default function PublicFormPage() {
    const params = useParams();
    const router = useRouter();
    const formId = params?.id as string | undefined;

    const { form, isLoading } = useGetFormWithFields(formId ?? "");
    const { createSubmissionAsync, status, error } = useCreateSubmission();

    const [values, setValues] = useState<Record<string, string | string[]>>({});
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
            router.replace(`/form/${formId}/confirmation`);
        } catch {
            // The mutation error is rendered below the fields.
        }
    };

    if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#fff3b0] p-6 text-[#5c3d2e]"><span className="frosting-spinner" aria-label="Loading" /></div>;
    if (!form) return <div className="flex min-h-screen items-center justify-center bg-[#fff3b0] p-6 text-[#5c3d2e]">Form not found.</div>;

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#fff3b0] px-6 py-8 text-[#5c3d2e]">
            <div className="pointer-events-none absolute right-8 top-8 text-4xl tracking-[0.5em] text-[#ff8fab]">✦ ･ ✧</div>
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 rounded-[1.5rem] border-2 border-[#d9b6a5] bg-[#fffdf7] p-6 shadow-[0_18px_50px_rgba(92,61,46,0.12)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d46c87]">A little something for you</p>
                    <h1 className="mt-2 text-3xl font-semibold">{form.title}</h1>
                    {form.description ? <p className="mt-2 text-[#8a6755]">{form.description}</p> : null}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.5rem] border-2 border-[#d9b6a5] bg-[#fffdf7] p-6 shadow-[0_18px_50px_rgba(92,61,46,0.12)]">
                    {form.fields.map((f) => (
                        <div key={f.id} className="space-y-1">
                            <label className="block text-sm font-medium text-[#5c3d2e]">
                                {f.label}
                                {f.isRequired ? <span className="text-red-400"> *</span> : null}
                            </label>
                            {f.type === "SHORT_TEXT" && (
                                <DrawablyInput
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                    className="block w-full [&>input]:h-10"
                                />
                            )}

                            {f.type === "LONG_TEXT" && (
                                <DrawablyTextarea
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                    className="block w-full [&>textarea]:min-h-28"
                                />
                            )}

                            {f.type === "NUMBER" && (
                                <DrawablyInput
                                    type="number"
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                    className="block w-full [&>input]:h-10"
                                />
                            )}

                            {f.type === "EMAIL" && (
                                <DrawablyInput
                                    type="email"
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                    className="block w-full [&>input]:h-10"
                                />
                            )}

                            {f.type === "PASSWORD" && (
                                <DrawablyInput
                                    type="password"
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    placeholder={f.placeholder ?? ""}
                                    required={f.isRequired}
                                    className="block w-full [&>input]:h-10"
                                />
                            )}

                            {f.type === "DATE" && (
                                <DrawablyInput
                                    type="date"
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    required={f.isRequired}
                                    className="block w-full [&>input]:h-10"
                                />
                            )}

                            {f.type === "YES_NO" && (
                                <DrawablySelect
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    className="block w-full bg-transparent text-sm text-(--theme-text) [&>select]:h-10"
                                    required={f.isRequired}
                                >
                                    <option value="">Select...</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </DrawablySelect>
                            )}

                            {f.type === "SINGLE_SELECT" && (
                                <DrawablySelect
                                    value={typeof values[f.id] === "string" ? values[f.id] : ""}
                                    onChange={(e) => handleChange(f.id, e.target.value)}
                                    className="block w-full bg-transparent text-sm text-(--theme-text) [&>select]:h-10"
                                    required={f.isRequired}
                                >
                                    <option value="">Select...</option>
                                    {f.options.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </DrawablySelect>
                            )}

                            {f.type === "MULTI_SELECT" && (
                                <div className="space-y-3" role="group" aria-label={f.label}>
                                    {f.options.map((option) => {
                                        const value = values[f.id];
                                        const current = Array.isArray(value) ? value : [];
                                        const selected = current.includes(option);
                                        return (
                                            <label key={option} className="flex items-center gap-3 text-sm text-white/80">
                                                <DrawablyCheckbox
                                                    checked={selected}
                                                    onChange={(event) => {
                                                        handleChange(
                                                            f.id,
                                                            event.target.checked ? [...current, option] : current.filter((value) => value !== option),
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
                                        <DrawablyButton
                                            key={rating}
                                            type="button"
                                            variant="outline"
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
                                        </DrawablyButton>
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
                                    <div className="text-sm text-[#8a6755]">{f.description}</div>
                            ) : null}
                        </div>
                    ))}

                    {validationError ? <div className="text-sm text-[#b34f66]">{validationError}</div> : null}
                    {error ? <div className="text-sm text-[#b34f66]">{error.message}</div> : null}

                    <div>
                        <DrawablyButton
                            type="submit"
                            disabled={status === "pending"}
                            variant="solid"
                            state={status === "pending" ? "loading" : "idle"}
                            className="bg-[#ffb3c6] text-[#5c3d2e]"
                        >
                            {status === "pending" ? "Submitting..." : "Submit"}
                        </DrawablyButton>
                    </div>
                </form>
            </div>
        </main>
    );
}
