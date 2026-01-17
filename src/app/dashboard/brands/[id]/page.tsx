import { getBrandWithMannequins } from "@/modules/brands/services";
import { getMannequinsForSelect } from "@/modules/mannequins/services";
import { notFound } from "next/navigation";
import { BrandDetail } from "./_components/brand-detail";

export default async function BrandPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const brand = await getBrandWithMannequins(id);
    const allMannequins = await getMannequinsForSelect();

    if (!brand) {
        notFound();
    }

    return <BrandDetail brand={brand} allMannequins={allMannequins} />;
}
