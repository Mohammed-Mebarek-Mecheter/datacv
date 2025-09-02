// src/app/(app)/(admin)/analytics/page.tsx
"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";

export default function AnalyticsPage() {
	// Use getSystemStats instead of getDashboardStats
	const { data: stats, isLoading } = trpc.admin.analytics.getSystemStats.useQuery();
	// Remove getUsageStats query as it doesn't exist

	// Mock data for charts (replace with real data when available)
	const documentCreationData = [
		{ date: "Jan", resumes: 40, cvs: 24, coverLetters: 20 },
		{ date: "Feb", resumes: 30, cvs: 13, coverLetters: 15 },
		{ date: "Mar", resumes: 20, cvs: 18, coverLetters: 12 },
		{ date: "Apr", resumes: 27, cvs: 19, coverLetters: 18 },
		{ date: "May", resumes: 18, cvs: 24, coverLetters: 14 },
		{ date: "Jun", resumes: 23, cvs: 22, coverLetters: 19 },
	];

	const aiUsageData = [
		{ date: "Jan", contentGeneration: 45, jobMatching: 30, improvements: 25 },
		{ date: "Feb", contentGeneration: 52, jobMatching: 35, improvements: 28 },
		{ date: "Mar", contentGeneration: 48, jobMatching: 40, improvements: 32 },
		{ date: "Apr", contentGeneration: 60, jobMatching: 45, improvements: 35 },
		{ date: "May", contentGeneration: 55, jobMatching: 50, improvements: 40 },
		{ date: "Jun", contentGeneration: 65, jobMatching: 55, improvements: 45 },
	];

	return (
		<div className="container py-8">
			<div className="mb-8">
				<h1 className="font-bold text-3xl">Analytics</h1>
				<p className="text-muted-foreground">
					Platform usage and performance metrics
				</p>
			</div>

			{/* Stats Cards - Updated to use stats from getSystemStats */}
			<div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Total Documents"
					value={stats?.documents.total ?? 0}
					isLoading={isLoading}
					description="All created documents"
				/>
				<StatCard
					title="Active Templates"
					value={stats?.templates.active ?? 0}
					isLoading={isLoading}
					description="Currently available"
				/>
				<StatCard
					title="Total Users"
					value={stats?.users.total ?? 0}
					isLoading={isLoading}
					description="Registered users"
				/>
				<StatCard
					title="AI Interactions"
					value={stats?.ai.totalInteractions ?? 0}
					isLoading={isLoading}
					description="AI tools used"
				/>
			</div>

			{/* Charts */}
			<div className="mb-8 grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Document Creation</CardTitle>
						<CardDescription>Monthly document creation trends</CardDescription>
					</CardHeader>
					<CardContent className="h-80">
						{isLoading ? (
							<Skeleton className="h-full w-full" />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={documentCreationData}
									margin={{
										top: 5,
										right: 30,
										left: 20,
										bottom: 5,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar dataKey="resumes" fill="#0088FE" name="Resumes" />
									<Bar dataKey="cvs" fill="#00C49F" name="CVs" />
									<Bar
										dataKey="coverLetters"
										fill="#FFBB28"
										name="Cover Letters"
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>AI Tool Usage</CardTitle>
						<CardDescription>Monthly AI tool usage trends</CardDescription>
					</CardHeader>
					<CardContent className="h-80">
						{isLoading ? (
							<Skeleton className="h-full w-full" />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<LineChart
									data={aiUsageData}
									margin={{
										top: 5,
										right: 30,
										left: 20,
										bottom: 5,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="date" />
									<YAxis />
									<Tooltip />
									<Legend />
									<Line
										type="monotone"
										dataKey="contentGeneration"
										stroke="#0088FE"
										name="Content Generation"
										strokeWidth={2}
									/>
									<Line
										type="monotone"
										dataKey="jobMatching"
										stroke="#00C49F"
										name="Job Matching"
										strokeWidth={2}
									/>
									<Line
										type="monotone"
										dataKey="improvements"
										stroke="#FFBB28"
										name="Improvements"
										strokeWidth={2}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Usage Stats - Updated to use data from getSystemStats or show N/A */}
			<Card>
				<CardHeader>
					<CardTitle>Platform Usage</CardTitle>
					<CardDescription>Detailed usage statistics</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<div className="rounded-lg border p-4">
							<div className="font-bold text-2xl">
								{stats?.documents.total ?? "N/A"}
							</div>
							<div className="text-muted-foreground text-sm">
								Total Documents
							</div>
						</div>
						<div className="rounded-lg border p-4">
							<div className="font-bold text-2xl">
								{stats?.templates.active ?? "N/A"}
							</div>
							<div className="text-muted-foreground text-sm">
								Templates Used
							</div>
						</div>
						<div className="rounded-lg border p-4">
							{/* Export data not available in getSystemStats, show N/A or 0 */}
							<div className="font-bold text-2xl">{"N/A"}</div>
							<div className="text-muted-foreground text-sm">
								Documents Exported
							</div>
						</div>
						<div className="rounded-lg border p-4">
							<div className="font-bold text-2xl">
								{stats?.ai.totalInteractions ?? "N/A"}
							</div>
							<div className="text-muted-foreground text-sm">
								AI Interactions
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// StatCard component remains the same
function StatCard({
	title,
	value,
	description,
	isLoading,
}: {
	title: string;
	value: number;
	description: string;
	isLoading: boolean;
}) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardDescription>{title}</CardDescription>
				<CardTitle className="text-3xl">
					{isLoading ? <Skeleton className="h-8 w-16" /> : value}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	);
}
