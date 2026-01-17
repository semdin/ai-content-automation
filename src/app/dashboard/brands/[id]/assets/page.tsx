import { getBrandWithMannequins } from "@/modules/brands/services";
import { getAssetsByBrand } from "@/modules/brand-assets/services";
import { notFound } from "next/navigation";
import { BrandAssets } from "./_components/brand-assets";

export default async function BrandAssetsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const brand = await getBrandWithMannequins(id);
    const assets = await getAssetsByBrand(id);

    if (!brand) {
        notFound();
    }

    return <BrandAssets brand={brand} assets={assets} />;
}
