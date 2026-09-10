import { DrawablyCard } from "drawably/react";

export default function FormConfirmationPage() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff3b0] px-6 py-6 text-[#5c3d2e]">
            <div className="pointer-events-none absolute left-8 top-8 text-4xl tracking-[0.5em] text-[#ff8fab]">✦ ･ ✧</div>
            <DrawablyCard className="w-full max-w-2xl rounded-[1.5rem] bg-[#fffdf7] p-8 text-center shadow-[0_18px_50px_rgba(92,61,46,0.14)]">
                <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#ffb3c6] text-3xl">✓</div>
                <h1 className="mb-3 text-2xl font-semibold">Thank you</h1>
                <p className="mb-6 text-[#8a6755]">
                    Your submission has been received.
                </p>
                <p className="mb-4 text-[#8a6755]">
                    You may now close this window.
                </p>
            </DrawablyCard>
        </main>
    );
}
