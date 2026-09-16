"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send } from "lucide-react";

import { useGetFormWithFields } from "~/hooks/api/form";
import { useCreateSubmission } from "~/hooks/api/form-submission";

type FieldValue = string | string[];

type ChatMessage =
    | { id: string; role: "bot"; text: string }
    | { id: string; role: "user"; text: string }
    | { id: string; role: "system"; text: string };

function uid() {
    return Math.random().toString(36).slice(2);
}

// Builds the bot's question bubble text, including any options list.
function questionText(field: { label: string; description?: string | null; type: string; options: string[]; isRequired: boolean }) {
    let text = field.label;
    if (field.description) text += `\n${field.description}`;

    if (field.type === "SINGLE_SELECT") {
        text += "\n" + field.options.map((o, i) => `${i + 1}. ${o}`).join("\n");
        text += "\nReply with the number of your choice.";
    } else if (field.type === "MULTI_SELECT") {
        text += "\n" + field.options.map((o, i) => `${i + 1}. ${o}`).join("\n");
        text += "\nReply with numbers separated by commas (e.g. 1,3).";
    } else if (field.type === "YES_NO") {
        text += "\n1. Yes\n2. No";
    } else if (field.type === "RATING") {
        text += "\nReply with a number from 1 to 5.";
    } else if (field.type === "DATE") {
        text += "\nReply in YYYY-MM-DD format.";
    }

    if (!field.isRequired) text += "\n(optional — type \"skip\" to skip)";
    return text;
}

// Validates + converts raw chat input into a submission value.
// Returns { ok: true, value, display } or { ok: false, error }.
function parseAnswer(
    raw: string,
    field: { type: string; options: string[]; isRequired: boolean; label: string },
): { ok: true; value: FieldValue; display: string } | { ok: false; error: string } {
    const trimmed = raw.trim();

    if (trimmed.toLowerCase() === "skip" && !field.isRequired) {
        return { ok: true, value: field.type === "MULTI_SELECT" ? [] : "", display: "(skipped)" };
    }

    if (trimmed === "" && field.isRequired) {
        return { ok: false, error: `${field.label} is required.` };
    }
    if (trimmed === "" && !field.isRequired) {
        return { ok: true, value: field.type === "MULTI_SELECT" ? [] : "", display: "(skipped)" };
    }

    switch (field.type) {
        case "EMAIL": {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                return { ok: false, error: "That doesn't look like a valid email address." };
            }
            return { ok: true, value: trimmed, display: trimmed };
        }

        case "NUMBER": {
            if (Number.isNaN(Number(trimmed))) {
                return { ok: false, error: "Please enter a valid number." };
            }
            return { ok: true, value: trimmed, display: trimmed };
        }

        case "DATE": {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || Number.isNaN(new Date(trimmed).getTime())) {
                return { ok: false, error: "Please enter a date as YYYY-MM-DD." };
            }
            return { ok: true, value: trimmed, display: trimmed };
        }

        case "PASSWORD": {
            return { ok: true, value: trimmed, display: "•".repeat(Math.min(trimmed.length, 12)) };
        }

        case "YES_NO": {
            const n = trimmed.toLowerCase();
            if (n === "1" || n === "yes" || n === "y") return { ok: true, value: "true", display: "Yes" };
            if (n === "2" || n === "no" || n === "n") return { ok: true, value: "false", display: "No" };
            return { ok: false, error: "Reply with 1 for Yes or 2 for No." };
        }

        case "SINGLE_SELECT": {
            const idx = Number(trimmed) - 1;
            if (!Number.isInteger(idx) || idx < 0 || idx >= field.options.length) {
                return { ok: false, error: `Reply with a number from 1 to ${field.options.length}.` };
            }
            return { ok: true, value: field.options[idx]!, display: field.options[idx]! };
        }

        case "MULTI_SELECT": {
            const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
            const indices = parts.map((p) => Number(p) - 1);
            const invalid = indices.some((i) => !Number.isInteger(i) || i < 0 || i >= field.options.length);
            if (parts.length === 0 || invalid) {
                return { ok: false, error: `Reply with one or more numbers from 1 to ${field.options.length}, separated by commas.` };
            }
            const values = [...new Set(indices.map((i) => field.options[i]!))];
            return { ok: true, value: values, display: values.join(", ") };
        }

        case "RATING": {
            const n = Number(trimmed);
            if (!Number.isInteger(n) || n < 1 || n > 5) {
                return { ok: false, error: "Reply with a number from 1 to 5." };
            }
            return { ok: true, value: String(n), display: "★".repeat(n) + "☆".repeat(5 - n) };
        }

        default:
            return { ok: true, value: trimmed, display: trimmed };
    }
}

export default function PublicFormPage() {
    const params = useParams();
    const router = useRouter();
    const formId = params?.id as string | undefined;

    const { form, isLoading } = useGetFormWithFields(formId ?? "");
    const { createSubmissionAsync, status: submitStatus, error: submitError } = useCreateSubmission();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [fieldIndex, setFieldIndex] = useState(0);
    const [draft, setDraft] = useState("");
    const [answers, setAnswers] = useState<Record<string, FieldValue>>({});
    const [finished, setFinished] = useState(false);
    const [systemNote, setSystemNote] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const askedFieldRef = useRef<string | null>(null);

    const fields = form?.fields ?? [];
    const currentField = fields[fieldIndex];

    // Ask the first/next question exactly once per field.
    useEffect(() => {
        if (!currentField || askedFieldRef.current === currentField.id) return;
        askedFieldRef.current = currentField.id;
        setMessages((m) => [...m, { id: uid(), role: "bot", text: questionText(currentField) }]);
    }, [currentField]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages, systemNote]);

    const submitAll = async (finalAnswers: Record<string, FieldValue>) => {
        if (!formId) return;
        setMessages((m) => [...m, { id: uid(), role: "bot", text: "Sending your answers…" }]);
        try {
            await createSubmissionAsync({
                formId,
                values: Object.entries(finalAnswers).map(([fieldId, value]) => ({ fieldId, value })),
            });
            router.replace(`/form/${formId}/confirmation`);
        } catch {
            setSystemNote("Something went wrong submitting your response — please try again.");
        }
    };

    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        if (!currentField || finished) return;

        const result = parseAnswer(draft, currentField);

        if (!result.ok) {
            setSystemNote(result.error);
            return;
        }

        setSystemNote(null);
        setMessages((m) => [...m, { id: uid(), role: "user", text: result.display }]);
        const nextAnswers = { ...answers, [currentField.id]: result.value };
        setAnswers(nextAnswers);
        setDraft("");

        const nextIndex = fieldIndex + 1;
        if (nextIndex >= fields.length) {
            setFinished(true);
            void submitAll(nextAnswers);
        } else {
            setFieldIndex(nextIndex);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--theme-bg) p-6 text-(--theme-text)">
                <span className="frosting-spinner" aria-label="Loading" />
            </div>
        );
    }
    if (!form) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--theme-bg) p-6 text-(--theme-text)">
                Form not found.
            </div>
        );
    }

    return (
        <main className="flex h-screen flex-col bg-(--theme-bg) text-(--theme-text)">
            {/* Header */}
            <div className="shrink-0 border-b border-(--theme-border)/40 bg-(--theme-surface) px-6 py-4">
                <div className="mx-auto max-w-xl">
                    <h1 className="text-lg font-semibold">{form.title}</h1>
                    {form.description ? (
                        <p className="text-sm text-(--theme-muted)">{form.description}</p>
                    ) : null}
                </div>
            </div>

            {/* Chat thread */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto flex max-w-xl flex-col gap-3">
                    {messages.map((msg) =>
                        msg.role === "system" ? null : (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
                                        msg.role === "user"
                                            ? "bg-(--theme-accent) text-(--theme-bg)"
                                            : "bg-(--theme-card) text-(--theme-text)"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ),
                    )}

                    {finished && submitStatus === "pending" && (
                        <div className="flex justify-center">
                            <span className="frosting-spinner" aria-label="Submitting" />
                        </div>
                    )}

                    {(systemNote || submitError) && (
                        <div className="flex justify-center py-1">
                            <span className="rounded-full bg-(--theme-muted)/15 px-3 py-1 text-xs text-(--theme-muted)">
                                {systemNote ?? submitError?.message}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Composer */}
            {!finished && (
                <form
                    onSubmit={handleSend}
                    className="shrink-0 border-t border-(--theme-border)/40 bg-(--theme-surface) px-4 py-3"
                >
                    <div className="mx-auto flex max-w-xl items-center gap-2">
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="Type your answer…"
                            autoFocus
                            className="h-11 flex-1 rounded-full border border-(--theme-border)/50 bg-(--theme-card) px-4 text-sm text-(--theme-text) placeholder:text-(--theme-muted) focus:border-(--theme-accent) focus:outline-none"
                        />
                        <button
                            type="submit"
                            aria-label="Send answer"
                            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--theme-accent) text-(--theme-bg) transition hover:brightness-105"
                        >
                            <Send className="size-4" />
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
}