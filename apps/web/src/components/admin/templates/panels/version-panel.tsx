// components/admin/templates/panels/version-panel.tsx
import { format } from "date-fns";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	GitBranch,
	History,
	Plus,
	RotateCcw,
	User,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { trpc } from "@/utils/trpc";

interface VersionPanelProps {
	templateId?: string;
}

export const VersionPanel: React.FC<VersionPanelProps> = ({ templateId }) => {
	const [newVersionData, setNewVersionData] = React.useState({
		versionNumber: "",
		versionType: "minor" as "major" | "minor" | "patch",
		changelogNotes: "",
		isBreaking: false,
	});

	const { data: versionsData, refetch } =
		trpc.admin.templates.getTemplateVersions.useQuery(
			{ templateId: templateId! },
			{ enabled: !!templateId },
		);

	const createVersionMutation =
		trpc.admin.templates.createTemplateVersion.useMutation({
			onSuccess: () => {
				toast({
					title: "Version created",
					description: "New template version has been created.",
				});
				setNewVersionData({
					versionNumber: "",
					versionType: "minor",
					changelogNotes: "",
					isBreaking: false,
				});
				refetch();
			},
			onError: (error) => {
				toast({
					title: "Version creation failed",
					description: error.message,
					variant: "destructive",
				});
			},
		});

	const publishVersionMutation =
		trpc.admin.templates.publishTemplateVersion.useMutation({
			onSuccess: () => {
				toast({
					title: "Version published",
					description: "Template version is now live.",
				});
				refetch();
			},
		});

	const revertVersionMutation =
		trpc.admin.templates.revertToTemplateVersion.useMutation({
			onSuccess: () => {
				toast({
					title: "Template reverted",
					description: "Template has been reverted to selected version.",
				});
			},
		});

	const handleCreateVersion = () => {
		if (!templateId || !newVersionData.versionNumber) return;

		createVersionMutation.mutate({
			templateId,
			...newVersionData,
		});
	};

	const handlePublishVersion = (versionId: string) => {
		publishVersionMutation.mutate({ versionId });
	};

	const handleRevertToVersion = (versionId: string) => {
		if (
			confirm(
				"Are you sure you want to revert to this version? This will create a backup of the current state.",
			)
		) {
			revertVersionMutation.mutate({
				templateId: templateId!,
				versionId,
				createBackup: true,
			});
		}
	};

	const getVersionTypeColor = (type: string | null) => {
		switch (type) {
			case "major":
				return "bg-red-100 text-red-800";
			case "minor":
				return "bg-blue-100 text-blue-800";
			case "patch":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (!templateId) {
		return (
			<div className="flex h-64 items-center justify-center text-muted-foreground">
				<p>Save template first to manage versions</p>
			</div>
		);
	}

	return (
		<div className="max-h-full space-y-6 overflow-y-auto">
			{/* Create New Version */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						Create New Version
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label className="font-medium text-sm">Version Number</label>
							<Input
								placeholder="e.g., 2.1.0"
								value={newVersionData.versionNumber}
								onChange={(e) =>
									setNewVersionData((prev) => ({
										...prev,
										versionNumber: e.target.value,
									}))
								}
							/>
						</div>
						<div className="space-y-2">
							<label className="font-medium text-sm">Version Type</label>
							<Select
								value={newVersionData.versionType}
								onValueChange={(value: "major" | "minor" | "patch") =>
									setNewVersionData((prev) => ({ ...prev, versionType: value }))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="patch">Patch (Bug fixes)</SelectItem>
									<SelectItem value="minor">Minor (New features)</SelectItem>
									<SelectItem value="major">
										Major (Breaking changes)
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<label className="font-medium text-sm">Changelog Notes</label>
						<Textarea
							placeholder="Describe the changes in this version..."
							value={newVersionData.changelogNotes}
							onChange={(e) =>
								setNewVersionData((prev) => ({
									...prev,
									changelogNotes: e.target.value,
								}))
							}
							rows={3}
						/>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="breaking-changes"
								checked={newVersionData.isBreaking}
								onChange={(e) =>
									setNewVersionData((prev) => ({
										...prev,
										isBreaking: e.target.checked,
									}))
								}
								className="rounded"
							/>
							<label htmlFor="breaking-changes" className="text-sm">
								Contains breaking changes
							</label>
						</div>
						<Button
							onClick={handleCreateVersion}
							disabled={
								!newVersionData.versionNumber || createVersionMutation.isPending
							}
						>
							{createVersionMutation.isPending
								? "Creating..."
								: "Create Version"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Version History */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<History className="h-4 w-4" />
						Version History
					</CardTitle>
				</CardHeader>
				<CardContent>
					{!versionsData?.versions?.length ? (
						<div className="py-8 text-center text-muted-foreground">
							<History className="mx-auto mb-2 h-8 w-8" />
							<p>No versions found</p>
							<p className="text-sm">Create your first version above</p>
						</div>
					) : (
						<div className="space-y-4">
							{versionsData.versions.map((version) => (
								<div key={version.id} className="rounded-lg border p-4">
									<div className="mb-3 flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Badge
												className={getVersionTypeColor(version.versionType)}
											>
												v{version.versionNumber}
											</Badge>
											<Badge variant="outline" className="capitalize">
												{version.versionType || "unknown"}
											</Badge>
											{version.isBreaking && (
												<Badge
													variant="destructive"
													className="flex items-center gap-1"
												>
													<AlertTriangle className="h-3 w-3" />
													Breaking
												</Badge>
											)}
											{version.isPublished && (
												<Badge className="bg-green-100 text-green-800">
													<CheckCircle className="mr-1 h-3 w-3" />
													Published
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-2">
											{!version.isPublished && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => handlePublishVersion(version.id)}
													disabled={publishVersionMutation.isPending}
												>
													<CheckCircle className="mr-1 h-3 w-3" />
													Publish
												</Button>
											)}
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleRevertToVersion(version.id)}
												disabled={revertVersionMutation.isPending}
											>
												<RotateCcw className="mr-1 h-3 w-3" />
												Revert
											</Button>
										</div>
									</div>

									<div className="space-y-2">
										{version.changelogNotes && (
											<p className="text-sm">{version.changelogNotes}</p>
										)}

										<div className="flex items-center gap-4 text-muted-foreground text-xs">
											<div className="flex items-center gap-1">
												<User className="h-3 w-3" />
												{version.creatorName || "Unknown"}
											</div>
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{version.createdAt &&
													format(
														new Date(version.createdAt),
														"MMM d, yyyy HH:mm",
													)}
											</div>
											{version.publishedAt && (
												<div className="flex items-center gap-1">
													<CheckCircle className="h-3 w-3" />
													Published{" "}
													{format(new Date(version.publishedAt), "MMM d, yyyy")}
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Version Comparison */}
			{versionsData?.versions && versionsData.versions.length > 1 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<GitBranch className="h-4 w-4" />
							Version Timeline
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="relative">
							{/* Timeline Line */}
							<div className="absolute top-0 bottom-0 left-4 w-0.5 bg-border" />

							{versionsData.versions.map((version, index) => (
								<div
									key={version.id}
									className="relative flex items-start gap-4 pb-6"
								>
									{/* Timeline Dot */}
									<div
										className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background ${
											version.isPublished
												? "border-green-500 bg-green-50"
												: "border-muted-foreground"
										}`}
									>
										{version.isPublished ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<Clock className="h-4 w-4 text-muted-foreground" />
										)}
									</div>

									{/* Version Info */}
									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center gap-2">
											<span className="font-medium">
												v{version.versionNumber}
											</span>
											<Badge
												className={getVersionTypeColor(version.versionType)}
											>
												{version.versionType || "unknown"}
											</Badge>
											{version.isBreaking && (
												<Badge variant="destructive" className="text-xs">
													Breaking
												</Badge>
											)}
										</div>

										{version.changelogNotes && (
											<p className="mb-2 text-muted-foreground text-sm">
												{version.changelogNotes}
											</p>
										)}

										<div className="flex items-center gap-3 text-muted-foreground text-xs">
											<span>
												{version.createdAt &&
													format(new Date(version.createdAt), "MMM d, yyyy")}
											</span>
											<span>by {version.creatorName || "Unknown"}</span>
											{index === 0 && (
												<Badge variant="outline" className="text-xs">
													Latest
												</Badge>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Version Management Info */}
			<Card>
				<CardHeader>
					<CardTitle>Version Management Guide</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge className="bg-green-100 text-green-800">Patch</Badge>
								<span className="font-medium">Bug Fixes</span>
							</div>
							<p className="text-muted-foreground text-xs">
								Small fixes, typo corrections, minor adjustments
							</p>
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge className="bg-blue-100 text-blue-800">Minor</Badge>
								<span className="font-medium">New Features</span>
							</div>
							<p className="text-muted-foreground text-xs">
								New sections, design improvements, additional options
							</p>
						</div>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Badge className="bg-red-100 text-red-800">Major</Badge>
								<span className="font-medium">Breaking Changes</span>
							</div>
							<p className="text-muted-foreground text-xs">
								Structure changes, removed features, incompatible updates
							</p>
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<p className="font-medium">Best Practices:</p>
						<ul className="list-inside list-disc space-y-1 text-muted-foreground">
							<li>
								Always create a new version before making structural changes
							</li>
							<li>Use semantic versioning (major.minor.patch)</li>
							<li>Provide clear changelog notes for each version</li>
							<li>Test thoroughly before publishing versions</li>
							<li>Only one version should be published at a time</li>
						</ul>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
