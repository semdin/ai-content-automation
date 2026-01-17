"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = isRegister
                ? await signUp.email({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                })
                : await signIn.email({
                    email: formData.email,
                    password: formData.password,
                });

            if (result.error) {
                setError(result.error.message || "Bir hata oluştu");
                setIsLoading(false);
                return;
            }
            router.push("/dashboard");
        } catch {
            setError("Bir hata oluştu");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">AI Content Automation</CardTitle>
                    <CardDescription>
                        {isRegister ? "Yeni hesap oluştur" : "Hesabına giriş yap"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isRegister && (
                            <Input
                                type="text"
                                placeholder="İsim"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        )}
                        <Input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Şifre"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                            minLength={8}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading
                                ? "Yükleniyor..."
                                : isRegister
                                    ? "Kayıt Ol"
                                    : "Giriş Yap"}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">veya</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Google ile Giriş
                    </Button>
                </CardContent>

                <CardFooter className="justify-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError(null);
                        }}
                        className="text-sm text-muted-foreground underline hover:text-foreground"
                    >
                        {isRegister
                            ? "Zaten hesabın var mı? Giriş yap"
                            : "Hesabın yok mu? Kayıt ol"}
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
}
