import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { getBrandsForSwitcher } from "@/modules/brands/services";
import { ActiveBrandProvider } from "@/contexts/active-brand-context";
import { WorkflowProvider } from "@/contexts/workflow-context";

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
        <ActiveBrandProvider>
            <WorkflowProvider>
                <DashboardShell user={session.user} brands={userBrands}>
                    {children}
                </DashboardShell>
            </WorkflowProvider>
        </ActiveBrandProvider>
    );
}
