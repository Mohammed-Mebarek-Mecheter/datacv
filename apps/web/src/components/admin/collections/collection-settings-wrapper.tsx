// components/admin/collections/collection-settings-wrapper.tsx
import React from "react";
import { CollectionSettings } from "@/components/admin/collections/collection-settings";

export interface CollectionFormData {
    isActive: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    isCurated: boolean;
}

interface CollectionSettingsWrapperProps {
    formData: CollectionFormData;
    setFormData: React.Dispatch<React.SetStateAction<CollectionFormData>>;
}

export const CollectionSettingsWrapper: React.FC<CollectionSettingsWrapperProps> = ({
                                                                                        formData,
                                                                                        setFormData,
                                                                                    }) => {
    return (
        <CollectionSettings
            isActive={formData.isActive}
            isFeatured={formData.isFeatured}
            isPremium={formData.isPremium}
            isCurated={formData.isCurated}
            onActiveChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
            }
            onFeaturedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isFeatured: checked }))
            }
            onPremiumChange={(checked) =>
                setFormData((prev) => ({ ...prev, isPremium: checked }))
            }
            onCuratedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isCurated: checked }))
            }
        />
    );
};
