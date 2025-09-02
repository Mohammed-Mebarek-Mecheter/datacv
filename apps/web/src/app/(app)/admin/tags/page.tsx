// src/app/(app)/(admin)/admin/tags/page.tsx
'use client';

import React from 'react';
import { TagList } from '@/components/admin/tags/tag-list';

export default function AdminTagsPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tag Management</h1>
                        <p className="text-muted-foreground">
                            Manage tags for template categorization and search optimization
                        </p>
                    </div>
                </div>

                <TagList />
            </div>
        </div>
    );
}
