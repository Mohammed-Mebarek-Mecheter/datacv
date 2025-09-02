// src/app/(app)/(admin)/admin/templates/create/page.tsx
"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { TemplateEditor } from "@/components/admin/templates/template-editor";

export default function CreateTemplatePage() {
	const router = useRouter();

	const handleSave = (template: any) => {
		// Navigate to the edit page for the newly created template
		router.push(`/admin/templates/${template.id}/edit`);
	};

	const handleCancel = () => {
		router.push("/admin/templates");
	};

	return (
		<div className="h-screen">
			<TemplateEditor
				mode="create"
				onSave={handleSave}
				onCancel={handleCancel}
			/>
		</div>
	);
}
