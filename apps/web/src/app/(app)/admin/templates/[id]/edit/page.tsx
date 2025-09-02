// src/app/(app)/(admin)/admin/templates/[id]/edit/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import { TemplateEditor } from "@/components/admin/templates/template-editor";

export default function EditTemplatePage() {
	const router = useRouter();
	const params = useParams();
	const templateId = params.id as string;

	const handleSave = () => {
		// Stay on the same page or redirect as needed
		router.refresh();
	};

	const handleCancel = () => {
		router.push("/admin/templates");
	};

	return (
		<div className="h-screen">
			<TemplateEditor
				templateId={templateId}
				mode="edit"
				onSave={handleSave}
				onCancel={handleCancel}
			/>
		</div>
	);
}
