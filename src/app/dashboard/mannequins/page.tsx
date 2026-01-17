import { getMannequins } from "@/modules/mannequins/services";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User } from "lucide-react";
import Link from "next/link";

export default async function MannequinsPage() {
    const mannequins = await getMannequins();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Mankenler</h1>
                <Button asChild>
                    <Link href="/dashboard/mannequins/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Manken
                    </Link>
                </Button>
            </div>

            {mannequins.length === 0 ? (
                <Card>
                    <CardHeader className="text-center text-muted-foreground">
                        Henüz manken eklemediniz.
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mannequins.map((mannequin) => (
                        <Link key={mannequin.id} href={`/dashboard/mannequins/${mannequin.id}`}>
                            <Card className="hover:border-primary transition-colors cursor-pointer">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    {mannequin.primaryPhotoUrl ? (
                                        <img
                                            src={mannequin.primaryPhotoUrl}
                                            alt={mannequin.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                            <User className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div>
                                        <CardTitle className="text-lg">{mannequin.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {mannequin.heightCm && `${mannequin.heightCm} cm`}
                                            {mannequin.heightCm && mannequin.birthYear && " • "}
                                            {mannequin.birthYear && `${new Date().getFullYear() - mannequin.birthYear} yaş`}
                                        </p>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
