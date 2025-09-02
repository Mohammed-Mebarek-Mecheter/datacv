// components/admin/collections/collection-settings-form-section.tsx
import React from 'react';
import {
    type CollectionFormData,
    CollectionSettingsWrapper
} from "@/components/admin/collections/collection-settings-wrapper";

interface CollectionSettingsFormSectionProps {
    formData: CollectionFormData;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const CollectionSettingsFormSection: React.FC<CollectionSettingsFormSectionProps> = ({
                                                                                                formData,
                                                                                                setFormData
                                                                                            }) => {
    const handleSettingsUpdate = (update: Partial<CollectionFormData> | ((prev: CollectionFormData) => Partial<CollectionFormData>)) => {
        if (typeof update === 'function') {
            const newData = update(formData);
            setFormData((prev: any) => ({ ...prev, ...newData }));
        } else {
            setFormData((prev: any) => ({ ...prev, ...update }));
        }
    };

    return (
        <CollectionSettingsWrapper
            formData={formData}
            setFormData={handleSettingsUpdate}
        />
    );
};
