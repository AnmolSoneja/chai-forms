"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useSignup } from "~/hooks/api/auth";
import { Label } from "~/components/ui/label";
import { DrawablyButton, DrawablyInput } from "drawably/react";

export default function SignupPage() {
    const router = useRouter();
    const { createUserWithEmailAndPasswordAsync, isPending, isSuccess, error } = useSignup();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await createUserWithEmailAndPasswordAsync({
            fullName,
            email,
            password,
        });

        router.push("/dashboard/forms");
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fff3b0] px-4 text-[#5c3d2e]">
            <div className="pointer-events-none absolute left-8 top-8 text-3xl text-[#ff8fab]">✦ ･ ✧</div>
            <div className="pointer-events-none absolute bottom-10 right-8 text-3xl text-[#ff8fab]">✧ ･ ✦</div>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-5 rounded-[1.5rem] border-2 border-[#5c3d2e]/15 bg-[#fffdf7] p-7 shadow-[0_18px_50px_rgba(92,61,46,0.16)]"
            >
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
                    <p className="text-sm text-[#8a6755]">
                        Register with your name, email, and password.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <DrawablyInput
                        id="fullName"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder="Jane Doe"
                        className="border-[#5c3d2e]/15 bg-[#fff8df] text-[#5c3d2e] placeholder:text-[#a78978]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <DrawablyInput
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="jane@example.com"
                        className="border-[#5c3d2e]/15 bg-[#fff8df] text-[#5c3d2e] placeholder:text-[#a78978]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <DrawablyInput
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className="border-[#5c3d2e]/15 bg-[#fff8df] text-[#5c3d2e] placeholder:text-[#a78978]"
                    />
                </div>

                {error ? <p className="text-sm text-red-400">{error.message}</p> : null}
                {isSuccess ? <p className="text-sm text-emerald-400">Account created.</p> : null}

                <DrawablyButton
                    type="submit"
                    variant="solid"
                    className="w-full bg-[#ffb3c6] text-[#5c3d2e]"
                    disabled={isPending}
                >
                    {isPending ? "Registering..." : "Register"}
                </DrawablyButton>
            </form>
        </main>
    );
}