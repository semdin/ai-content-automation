import { ContentWizard } from "../_components/content-wizard";
import { getBrandsForSwitcher } from "@/modules/brands/services";

export default async function CreateContentPage() {
    const brands = await getBrandsForSwitcher();

    return (
        <div className="mx-auto max-w-5xl py-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Yeni İçerik Oluştur</h1>
                <p className="text-muted-foreground">
                    Fal.ai destekli asistan ile sosyal medya içeriklerinizi hazırlayın.
                </p>
            </div>
            
            <ContentWizard brands={brands} />
        </div>
    );
}
