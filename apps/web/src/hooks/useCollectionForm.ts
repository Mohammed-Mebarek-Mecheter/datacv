// hooks/useCollectionForm.ts
import { useState, useCallback } from 'react';

export interface CollectionFormState {
    name: string;
    description: string;
    slug: string;
    coverImageUrl: string;
    color: string;
    icon: string;
    order: number;
    isActive: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    isCurated: boolean;
}

export const useCollectionForm = (initialState: CollectionFormState) => {
    const [formData, setFormData] = useState<CollectionFormState>(initialState);

    const updateField = useCallback((field: keyof CollectionFormState, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const updateFields = useCallback((updates: Partial<CollectionFormState>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    }, []);

    const resetForm = useCallback((newState?: CollectionFormState) => {
        setFormData(newState || initialState);
    }, [initialState]);

    return {
        formData,
        updateField,
        updateFields,
        resetForm,
        setFormData // Still provide direct access if needed
    };
};
