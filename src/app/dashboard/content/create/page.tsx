import { ContentWizard } from "../_components/content-wizard";
import { getBrandsForSwitcher } from "@/modules/brands/services";

export default async function CreateContentPage() {
    const brands = await getBrandsForSwitcher();

    return (
        <div className="mx-auto max-w-6xl py-6">
            <ContentWizard brands={brands} />
        </div>
    );
}
