import { getBrand } from "@/modules/brands/services";
import { notFound } from "next/navigation";
import { BrandDetail } from "./_components/brand-detail";

export default async function BrandPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const brand = await getBrand(id);

    if (!brand) {
        notFound();
    }

    return <BrandDetail brand={brand} />;
}
