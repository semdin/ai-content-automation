import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./_components/login-form";

export default async function LoginPage() {
    // Zaten giriş yapmışsa dashboard'a yönlendir
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/dashboard");
    }

    return <LoginForm />;
}
