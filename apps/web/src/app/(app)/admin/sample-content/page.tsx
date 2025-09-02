// src/app/(app)/(admin)/admin/sample-content/page.tsx
'use client';

import React from 'react';
import { SampleContentManager } from '@/components/admin/sample-content-manager';

export default function SampleContentPage() {
    return (
        <div className="container mx-auto py-6">
            <SampleContentManager />
        </div>
    );
}
