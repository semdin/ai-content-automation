import { getMannequinWithBrands } from "@/modules/mannequins/services";
import { getBrandsForSwitcher } from "@/modules/brands/services";
import { notFound } from "next/navigation";
import { MannequinDetail } from "./_components/mannequin-detail";

export default async function MannequinPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const mannequin = await getMannequinWithBrands(id);
    const allBrands = await getBrandsForSwitcher();

    if (!mannequin) {
        notFound();
    }

    return <MannequinDetail mannequin={mannequin} allBrands={allBrands} />;
}
