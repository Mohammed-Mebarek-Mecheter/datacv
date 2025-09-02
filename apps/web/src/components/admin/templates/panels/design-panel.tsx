// components/admin/templates/panels/design-panel.tsx
import { Layout, Palette, RotateCcw, Space, Type } from "lucide-react";
import type React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const DesignPanel: React.FC = () => {
	const form = useFormContext();

	const resetToDefaults = (
		section: "colors" | "typography" | "spacing" | "layout",
	) => {
		const defaults = {
			colors: {
				primary: "#000000",
				secondary: "#666666",
				text: "#000000",
				background: "#ffffff",
				border: "#e5e7eb",
			},
			typography: {
				fontFamily: "Inter",
				fontSize: 12,
				lineHeight: 1.5,
				headingFontFamily: "Inter",
			},
			spacing: {
				sectionSpacing: 16,
				itemSpacing: 8,
				paragraphSpacing: 4,
			},
			layout: {
				columns: 1,
				headerStyle: "standard",
				maxWidth: "8.5in",
			},
		};

		form.setValue(`designConfig.${section}`, defaults[section], {
			shouldDirty: true,
		});
	};

	return (
		<div className="max-h-full space-y-6 overflow-y-auto">
			{/* Color Configuration */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Palette className="h-4 w-4" />
						Color Scheme
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => resetToDefaults("colors")}
					>
						<RotateCcw className="mr-1 h-3 w-3" />
						Reset
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="designConfig.colors.primary"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Primary Color</FormLabel>
									<div className="flex items-center gap-2">
										<FormControl>
											<Input
												type="color"
												{...field}
												className="h-8 w-16 border-0 p-0"
											/>
										</FormControl>
										<FormControl>
											<Input
												{...field}
												placeholder="#000000"
												className="flex-1"
											/>
										</FormControl>
									</div>
									<FormDescription>
										Main accent color for headers and highlights
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="designConfig.colors.secondary"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Secondary Color</FormLabel>
									<div className="flex items-center gap-2">
										<FormControl>
											<Input
												type="color"
												value={field.value || "#666666"}
												onChange={field.onChange}
												className="h-8 w-16 border-0 p-0"
											/>
										</FormControl>
										<FormControl>
											<Input
												{...field}
												value={field.value || ""}
												placeholder="#666666"
												className="flex-1"
											/>
										</FormControl>
									</div>
									<FormDescription>
										Supporting color for subheadings
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="designConfig.colors.text"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Text Color</FormLabel>
									<div className="flex items-center gap-2">
										<FormControl>
											<Input
												type="color"
												{...field}
												className="h-8 w-16 border-0 p-0"
											/>
										</FormControl>
										<FormControl>
											<Input
												{...field}
												placeholder="#000000"
												className="flex-1"
											/>
										</FormControl>
									</div>
									<FormDescription>Main body text color</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="designConfig.colors.background"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Background Color</FormLabel>
									<div className="flex items-center gap-2">
										<FormControl>
											<Input
												type="color"
												{...field}
												className="h-8 w-16 border-0 p-0"
											/>
										</FormControl>
										<FormControl>
											<Input
												{...field}
												placeholder="#ffffff"
												className="flex-1"
											/>
										</FormControl>
									</div>
									<FormDescription>Document background color</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Color Preview */}
					<div
						className="rounded-lg border p-4"
						style={{
							backgroundColor: form.watch("designConfig.colors.background"),
							color: form.watch("designConfig.colors.text"),
						}}
					>
						<h3
							style={{ color: form.watch("designConfig.colors.primary") }}
							className="mb-2 font-bold"
						>
							Sample Header Text
						</h3>
						<p className="mb-1 text-sm">Main body text appears like this</p>
						<p
							style={{ color: form.watch("designConfig.colors.secondary") }}
							className="text-sm"
						>
							Secondary text appears like this
						</p>
					</div>
				</CardContent>
			</Card>

			{/* Typography Configuration */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Type className="h-4 w-4" />
						Typography
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => resetToDefaults("typography")}
					>
						<RotateCcw className="mr-1 h-3 w-3" />
						Reset
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="designConfig.typography.fontFamily"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Font Family</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="Inter">Inter</SelectItem>
											<SelectItem value="Roboto">Roboto</SelectItem>
											<SelectItem value="Open Sans">Open Sans</SelectItem>
											<SelectItem value="Lato">Lato</SelectItem>
											<SelectItem value="Merriweather">Merriweather</SelectItem>
											<SelectItem value="Playfair Display">
												Playfair Display
											</SelectItem>
											<SelectItem value="Source Sans Pro">
												Source Sans Pro
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="designConfig.typography.headingFontFamily"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Heading Font</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={
											field.value ||
											form.watch("designConfig.typography.fontFamily")
										}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Same as body" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">Same as body</SelectItem>
											<SelectItem value="Inter">Inter</SelectItem>
											<SelectItem value="Roboto">Roboto</SelectItem>
											<SelectItem value="Playfair Display">
												Playfair Display
											</SelectItem>
											<SelectItem value="Merriweather">Merriweather</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="designConfig.typography.fontSize"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Font Size: {field.value}pt</FormLabel>
								<FormControl>
									<Slider
										min={8}
										max={16}
										step={0.5}
										value={[field.value]}
										onValueChange={(value) => field.onChange(value[0])}
										className="w-full"
									/>
								</FormControl>
								<FormDescription>
									Base font size for body text (8-16pt)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="designConfig.typography.lineHeight"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Line Height: {field.value || 1.5}</FormLabel>
								<FormControl>
									<Slider
										min={1.0}
										max={2.0}
										step={0.1}
										value={[field.value || 1.5]}
										onValueChange={(value) => field.onChange(value[0])}
										className="w-full"
									/>
								</FormControl>
								<FormDescription>
									Line spacing for better readability (1.0-2.0)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Typography Preview */}
					<div className="rounded-lg border bg-white p-4">
						<div
							style={{
								fontFamily: form.watch("designConfig.typography.fontFamily"),
								fontSize: `${form.watch("designConfig.typography.fontSize")}pt`,
								lineHeight:
									form.watch("designConfig.typography.lineHeight") || 1.5,
								color: form.watch("designConfig.colors.text"),
							}}
						>
							<h3
								style={{
									fontFamily:
										form.watch("designConfig.typography.headingFontFamily") ||
										form.watch("designConfig.typography.fontFamily"),
									color: form.watch("designConfig.colors.primary"),
									fontSize: `${form.watch("designConfig.typography.fontSize") * 1.3}pt`,
								}}
								className="mb-2 font-bold"
							>
								John Doe
							</h3>
							<p className="mb-2">Senior Data Scientist</p>
							<p className="text-sm">
								Experienced data scientist with expertise in machine learning,
								statistical analysis, and predictive modeling. Proven track
								record of delivering data-driven insights.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Layout Configuration */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Layout className="h-4 w-4" />
						Layout & Structure
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => resetToDefaults("layout")}
					>
						<RotateCcw className="mr-1 h-3 w-3" />
						Reset
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="designConfig.layout.columns"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Layout Columns</FormLabel>
									<Select
										onValueChange={(value) =>
											field.onChange(Number.parseInt(value))
										}
										value={field.value?.toString()}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="1">Single Column</SelectItem>
											<SelectItem value="2">Two Columns</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Number of main content columns
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="designConfig.layout.headerStyle"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Header Style</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="minimal">Minimal</SelectItem>
											<SelectItem value="standard">Standard</SelectItem>
											<SelectItem value="prominent">Prominent</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Header section prominence level
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="designConfig.layout.maxWidth"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Max Width</FormLabel>
								<FormControl>
									<Input {...field} placeholder="8.5in" />
								</FormControl>
								<FormDescription>
									Maximum width of the document (e.g., 8.5in, 210mm, 600px)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			{/* Spacing Configuration */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Space className="h-4 w-4" />
						Spacing & Margins
					</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => resetToDefaults("spacing")}
					>
						<RotateCcw className="mr-1 h-3 w-3" />
						Reset
					</Button>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="designConfig.spacing.sectionSpacing"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Section Spacing: {field.value}px</FormLabel>
								<FormControl>
									<Slider
										min={8}
										max={32}
										step={2}
										value={[field.value]}
										onValueChange={(value) => field.onChange(value[0])}
										className="w-full"
									/>
								</FormControl>
								<FormDescription>Space between major sections</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="designConfig.spacing.itemSpacing"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Item Spacing: {field.value || 8}px</FormLabel>
								<FormControl>
									<Slider
										min={4}
										max={16}
										step={1}
										value={[field.value || 8]}
										onValueChange={(value) => field.onChange(value[0])}
										className="w-full"
									/>
								</FormControl>
								<FormDescription>
									Space between items within sections
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="designConfig.spacing.paragraphSpacing"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Paragraph Spacing: {field.value || 4}px</FormLabel>
								<FormControl>
									<Slider
										min={2}
										max={12}
										step={1}
										value={[field.value || 4]}
										onValueChange={(value) => field.onChange(value[0])}
										className="w-full"
									/>
								</FormControl>
								<FormDescription>Space between paragraphs</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			{/* Border & Effects */}
			<Card>
				<CardHeader>
					<CardTitle>Borders & Effects</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="designConfig.borders.sectionDividers"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel>Section Dividers</FormLabel>
									<FormDescription>
										Add visual separators between sections
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value || false}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="designConfig.borders.headerUnderline"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel>Header Underlines</FormLabel>
									<FormDescription>
										Add underlines to section headers
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value || false}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					{(form.watch("designConfig.borders.sectionDividers") ||
						form.watch("designConfig.borders.headerUnderline")) && (
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="designConfig.borders.style"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Border Style</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value || "solid"}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="solid">Solid</SelectItem>
												<SelectItem value="dotted">Dotted</SelectItem>
												<SelectItem value="dashed">Dashed</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="designConfig.borders.width"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Border Width: {field.value || 1}px</FormLabel>
										<FormControl>
											<Slider
												min={1}
												max={4}
												step={0.5}
												value={[field.value || 1]}
												onValueChange={(value) => field.onChange(value[0])}
												className="w-full"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Advanced Effects */}
			<Card>
				<CardHeader>
					<CardTitle>Advanced Effects</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="designConfig.effects.shadows"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel>Drop Shadows</FormLabel>
									<FormDescription>
										Add subtle shadows to elements
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value || false}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="designConfig.effects.gradients"
						render={({ field }) => (
							<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
								<div className="space-y-0.5">
									<FormLabel>Gradient Effects</FormLabel>
									<FormDescription>
										Use gradient backgrounds for headers
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value || false}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			{/* Design Summary */}
			<Card>
				<CardHeader>
					<CardTitle>Design Summary</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div>
							<h4 className="mb-2 font-medium">Typography</h4>
							<ul className="space-y-1 text-muted-foreground">
								<li>
									Font: {form.watch("designConfig.typography.fontFamily")}
								</li>
								<li>
									Size: {form.watch("designConfig.typography.fontSize")}pt
								</li>
								<li>
									Line Height:{" "}
									{form.watch("designConfig.typography.lineHeight") || 1.5}
								</li>
							</ul>
						</div>
						<div>
							<h4 className="mb-2 font-medium">Layout</h4>
							<ul className="space-y-1 text-muted-foreground">
								<li>
									Columns: {form.watch("designConfig.layout.columns") || 1}
								</li>
								<li>
									Header:{" "}
									{form.watch("designConfig.layout.headerStyle") || "standard"}
								</li>
								<li>
									Section Gap:{" "}
									{form.watch("designConfig.spacing.sectionSpacing")}px
								</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
