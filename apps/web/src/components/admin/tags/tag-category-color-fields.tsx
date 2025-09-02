// components/admin/tags/tag-category-color-fields.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TAG_CATEGORIES = [
    'industry',
    'skill',
    'experience',
    'style',
    'format',
    'specialization',
    'other'
];

interface TagCategoryColorFieldsProps {
    category: string;
    color: string;
    onCategoryChange: (value: string) => void;
    onColorChange: (value: string) => void;
}

export const TagCategoryColorFields: React.FC<TagCategoryColorFieldsProps> = ({
                                                                                  category,
                                                                                  color,
                                                                                  onCategoryChange,
                                                                                  onColorChange,
                                                                              }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="category">Category</Label>
                <Select
                    value={category}
                    onValueChange={onCategoryChange}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {TAG_CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="color">Tag Color</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(e) => onColorChange(e.target.value)}
                        className="w-12 h-10"
                    />
                    <Input
                        value={color}
                        onChange={(e) => onColorChange(e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
};
