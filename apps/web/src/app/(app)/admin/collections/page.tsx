// src/app/(app)/(admin)/admin/collections/page.tsx
'use client';

import React from 'react';
import { CollectionList } from '@/components/admin/collections/collection-list';

export default function AdminCollectionsPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Collection Management</h1>
                        <p className="text-muted-foreground">
                            Organize templates into collections for better discovery and curation
                        </p>
                    </div>
                </div>

                <CollectionList />
            </div>
        </div>
    );
}
