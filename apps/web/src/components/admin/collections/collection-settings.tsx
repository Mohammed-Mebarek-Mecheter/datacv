// components/admin/collections/collection-settings.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Star, Crown } from 'lucide-react';

interface CollectionSettingsProps {
    isActive: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    isCurated: boolean;
    onActiveChange: (checked: boolean) => void;
    onFeaturedChange: (checked: boolean) => void;
    onPremiumChange: (checked: boolean) => void;
    onCuratedChange: (checked: boolean) => void;
}

export const CollectionSettings: React.FC<CollectionSettingsProps> = ({
                                                                          isActive,
                                                                          isFeatured,
                                                                          isPremium,
                                                                          isCurated,
                                                                          onActiveChange,
                                                                          onFeaturedChange,
                                                                          onPremiumChange,
                                                                          onCuratedChange,
                                                                      }) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium">Collection Settings</h4>

            <div className="grid grid-cols-2 gap-6">
                {/* Active */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Active Collection
                        </Label>
                        <p className="text-sm text-muted-foreground">Visible to users</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={onActiveChange} />
                </div>

                {/* Featured */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-blue-500" />
                            Featured Collection
                        </Label>
                        <p className="text-sm text-muted-foreground">Highlighted in gallery</p>
                    </div>
                    <Switch checked={isFeatured} onCheckedChange={onFeaturedChange} />
                </div>

                {/* Premium */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            Premium Collection
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Requires Pro subscription
                        </p>
                    </div>
                    <Switch checked={isPremium} onCheckedChange={onPremiumChange} />
                </div>

                {/* Curated */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label>Curated Collection</Label>
                        <p className="text-sm text-muted-foreground">
                            Manually curated content
                        </p>
                    </div>
                    <Switch checked={isCurated} onCheckedChange={onCuratedChange} />
                </div>
            </div>
        </div>
    );
};
