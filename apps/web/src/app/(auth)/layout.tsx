// src/app/(auth)/layout.tsx
import { Sparkles } from "lucide-react";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="grid min-h-screen lg:grid-cols-2">
			{/* Left Panel - Branding */}
			<div className="hidden flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white lg:flex">
				<div className="max-w-md text-center">
					<div className="mb-8 flex items-center justify-center gap-2">
						<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white">
							<Sparkles className="h-7 w-7 text-blue-600" />
						</div>
						<span className="font-bold text-3xl">DataCV</span>
					</div>

					<h1 className="mb-6 font-bold text-3xl">
						Build Your Data Career with AI-Powered Resumes
					</h1>

					<p className="mb-8 text-blue-100 text-lg">
						Join thousands of data professionals who've accelerated their
						careers with tailored resumes that showcase quantifiable impact and
						technical expertise.
					</p>

					<div className="space-y-4 text-left">
						<div className="flex items-center gap-3">
							<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
								<span className="font-bold text-sm">✓</span>
							</div>
							<span>AI-generated content specifically for data roles</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
								<span className="font-bold text-sm">✓</span>
							</div>
							<span>ATS-optimized templates that pass screening</span>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
								<span className="font-bold text-sm">✓</span>
							</div>
							<span>Job match analysis with improvement suggestions</span>
						</div>
					</div>
				</div>
			</div>

			{/* Right Panel - Auth Forms */}
			<div className="flex flex-col items-center justify-center bg-white p-8 dark:bg-gray-900">
				<div className="w-full max-w-md">
					<div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
							<Sparkles className="h-6 w-6 text-white" />
						</div>
						<span className="font-bold text-2xl">DataCV</span>
					</div>

					{children}
				</div>
			</div>
		</div>
	);
}
