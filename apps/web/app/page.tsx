"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, FilePlus2, LayoutTemplate, Sparkles } from "lucide-react";

import { useUser } from "~/hooks/api/auth";
import { DrawablyButton } from "drawably/react";

export default function Home() {
    const { user } = useUser();
    const router = useRouter();

    return (
        <main className="min-h-screen overflow-hidden bg-[#fff3b0] text-[#5c3d2e]">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#5c3d2e] text-[#fffdf7]">
                        <Sparkles className="size-4" />
                    </span>
                    ChaiForms
                </Link>

                <div className="hidden items-center gap-8 text-sm font-medium text-[#8a6755] md:flex">
                    <a href="#explore" className="transition-colors hover:text-[#5c3d2e]">Explore</a>
                    <a href="#how-it-works" className="transition-colors hover:text-[#5c3d2e]">How it works</a>
                    <a href="#templates" className="transition-colors hover:text-[#5c3d2e]">Templates</a>
                </div>

                <div className="flex items-center gap-2">
                    {user?.id ? (
                        <DrawablyButton type="button" variant="outline" onClick={() => router.push("/dashboard/forms")} className="hidden text-[#8a6755] sm:inline-flex">Dashboard</DrawablyButton>
                    ) : (
                        <DrawablyButton type="button" variant="outline" onClick={() => router.push("/signin")} className="hidden text-[#8a6755] sm:inline-flex">Sign in</DrawablyButton>
                    )}
                    <DrawablyButton type="button" variant="solid" onClick={() => router.push(user?.id ? "/dashboard/forms" : "/signup")} className="bg-[#ffb3c6] text-[#5c3d2e] shadow-none">
                        {user?.id ? "Create a form" : "Get started"}
                        <ArrowRight className="size-4" />
                    </DrawablyButton>
                </div>
            </nav>

            <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-16 px-6 pb-20 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-16">
                <div className="max-w-2xl">
                    <p className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#d46c87]">
                        <span className="h-px w-8 bg-[#d46c87]" />
                        Forms with a little more feeling
                    </p>
                    <h1 className="max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-[#5c3d2e] sm:text-7xl">
                        Ask better questions. Get clearer answers.
                    </h1>
                    <p className="mt-7 max-w-lg text-lg leading-8 text-[#8a6755]">
                        ChaiForms helps you make thoughtful forms that feel easy to complete and simple to understand.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <DrawablyButton type="button" variant="solid" onClick={() => router.push(user?.id ? "/dashboard/forms" : "/signup")} className="bg-[#ffb3c6] text-[#5c3d2e]">
                            <FilePlus2 className="size-4" /> Create a new form
                        </DrawablyButton>
                        <DrawablyButton type="button" variant="outline" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })} className="border-[#d9b6a5] bg-transparent text-[#5c3d2e]">
                            Explore ChaiForms
                        </DrawablyButton>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#8a6755]">
                        <span className="flex items-center gap-2"><Check className="size-4 text-[#d46c87]" /> No design degree required</span>
                        <span className="flex items-center gap-2"><Check className="size-4 text-[#d46c87]" /> Publish when you are ready</span>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-lg" aria-label="Form preview">
                    <div className="absolute -left-8 top-12 text-4xl tracking-[0.5em] text-[#ff8fab]">✦ ･ ✧</div>
                    <div className="absolute -right-8 bottom-2 text-4xl tracking-[0.5em] text-[#d46c87]">✧ ･ ✦</div>
                    <div className="relative rotate-2 rounded-[2rem] border-2 border-[#d9b6a5] bg-[#fffdf7] p-5 shadow-[0_24px_80px_rgba(92,61,46,0.18)]">
                        <div className="flex items-center justify-between border-b border-[#f1d5dc] pb-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d46c87]">New form</p>
                                <h2 className="mt-1 text-xl font-semibold text-[#5c3d2e]">Team pulse check-in</h2>
                            </div>
                            <span className="rounded-full bg-[#ffe0e8] px-3 py-1 text-xs font-medium text-[#a34862]">Live</span>
                        </div>
                        <div className="space-y-5 py-6">
                            <div>
                                <p className="mb-2 text-sm font-medium text-[#5c3d2e]">What is one win from this week?</p>
                                <div className="h-14 rounded-xl border border-[#ead1d7] bg-[#fffaf1]" />
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-[#5c3d2e]">How are you feeling today?</p>
                                <div className="flex gap-2">
                                    {['Calm', 'Good', 'Energized'].map((label, index) => (
                                        <span key={label} className={`rounded-full border px-3 py-2 text-xs ${index === 1 ? 'border-[#d46c87] bg-[#ffe0e8] text-[#a34862]' : 'border-[#ead1d7] text-[#a78978]'}`}>{label}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-[#5c3d2e]">Anything we can improve?</p>
                                <div className="h-20 rounded-xl border border-[#ead1d7] bg-[#fffaf1]" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-[#f1d5dc] pt-5">
                            <span className="text-xs text-[#a78978]">2 min to complete</span>
                            <span className="rounded-lg bg-[#ffb3c6] px-4 py-2 text-xs font-medium text-[#5c3d2e]">Submit response</span>
                        </div>
                    </div>
                </div>
            </section>

            <section id="explore" className="border-y border-[#ded8cd] bg-[#ebe7de] px-6 py-20 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b65f3e]">Explore</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#173c35] sm:text-4xl">Everything you need to collect useful responses.</h2>
                    </div>
                    <div id="templates" className="mt-10 grid gap-4 md:grid-cols-3">
                        {[
                            { icon: LayoutTemplate, title: "Flexible fields", text: "Build with text, choices, ratings, dates, and more." },
                            { icon: Sparkles, title: "Clear by default", text: "Keep every question focused and every response easy to read." },
                            { icon: FilePlus2, title: "Publish on your terms", text: "Draft privately, then share your form when it is ready." },
                        ].map(({ icon: Icon, title, text }) => (
                            <div key={title} className="border border-[#d8d1c5] bg-[#f8f5ee] p-6">
                                <Icon className="size-5 text-[#b65f3e]" />
                                <h3 className="mt-8 text-lg font-semibold text-[#173c35]">{title}</h3>
                                <p className="mt-2 text-sm leading-6 text-[#66736b]">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
                <div className="grid gap-10 md:grid-cols-3">
                    {["Start with a question", "Shape the experience", "Share when ready"].map((title, index) => (
                        <div key={title} className="border-t-2 border-[#b65f3e] pt-5">
                            <span className="text-sm font-semibold text-[#b65f3e]">0{index + 1}</span>
                            <h2 className="mt-8 text-xl font-semibold text-[#173c35]">{title}</h2>
                        </div>
                    ))}
                </div>
            </section>

            <footer className="border-t border-[#ded8cd] px-6 py-8 lg:px-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-[#718078] sm:flex-row sm:items-center sm:justify-between">
                    <span>ChaiForms © 2026</span>
                    <span>Thoughtful forms for real conversations.</span>
                </div>
            </footer>
        </main>
    );
}