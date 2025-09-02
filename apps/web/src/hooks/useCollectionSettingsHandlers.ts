// hooks/useCollectionSettingsHandlers.ts
import { useCallback } from 'react';
import type {useCollectionForm, CollectionFormState} from './useCollectionForm';

export const useCollectionSettingsHandlers = (updateField: (field: keyof CollectionFormState, value: any) => void) => {
    const handleActiveChange = useCallback((checked: boolean) => {
        updateField('isActive', checked);
    }, [updateField]);

    const handleFeaturedChange = useCallback((checked: boolean) => {
        updateField('isFeatured', checked);
    }, [updateField]);

    const handlePremiumChange = useCallback((checked: boolean) => {
        updateField('isPremium', checked);
    }, [updateField]);

    const handleCuratedChange = useCallback((checked: boolean) => {
        updateField('isCurated', checked);
    }, [updateField]);

    return {
        handleActiveChange,
        handleFeaturedChange,
        handlePremiumChange,
        handleCuratedChange
    };
};
