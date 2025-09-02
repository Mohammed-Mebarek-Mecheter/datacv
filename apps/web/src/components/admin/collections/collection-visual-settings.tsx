// components/admin/collections/collection-visual-settings.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Palette } from 'lucide-react';

interface CollectionVisualSettingsProps {
    color: string;
    icon: string;
    coverImageUrl: string;
    errors: Record<string, string>;
    onColorChange: (value: string) => void;
    onIconChange: (value: string) => void;
    onCoverImageUrlChange: (value: string) => void;
}

export const CollectionVisualSettings: React.FC<CollectionVisualSettingsProps> = ({
                                                                                      color,
                                                                                      icon,
                                                                                      coverImageUrl,
                                                                                      errors,
                                                                                      onColorChange,
                                                                                      onIconChange,
                                                                                      onCoverImageUrlChange,
                                                                                  }) => {
    return (
        <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Visual Settings
            </h4>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="color">Collection Color</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="color"
                            type="color"
                            value={color}
                            onChange={(e) => onColorChange(e.target.value)}
                            className="w-16 h-10"
                        />
                        <Input
                            value={color}
                            onChange={(e) => onColorChange(e.target.value)}
                            placeholder="#3B82F6"
                            className="flex-1"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="icon">Icon (Emoji)</Label>
                    <Input
                        id="icon"
                        value={icon}
                        onChange={(e) => onIconChange(e.target.value)}
                        placeholder="📊"
                        maxLength={2}
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                <Input
                    id="coverImageUrl"
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => onCoverImageUrlChange(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className={errors.coverImageUrl ? 'border-red-500' : ''}
                />
                {errors.coverImageUrl && (
                    <p className="text-sm text-red-500 mt-1">{errors.coverImageUrl}</p>
                )}
            </div>
        </div>
    );
};
