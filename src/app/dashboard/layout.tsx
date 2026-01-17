import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getBrandsForSwitcher } from "@/modules/brands/services";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const userBrands = await getBrandsForSwitcher();

    return (
        <DashboardShell user={session.user} brands={userBrands}>
            {children}
        </DashboardShell>
    );
}
