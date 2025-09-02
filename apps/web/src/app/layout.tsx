// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google'
import "./index.css";
import Providers from "@/components/providers";
import { TRPCProvider } from "@/components/trpc-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "DataCV - AI Resume Builder for Data Scientists & ML Engineers | Data Professional Resume Creator",
    description: "The only AI resume builder designed specifically for data professionals. Create ATS-optimized resumes with quantified impact metrics. Perfect for data scientists, ML engineers, and data analysts.",
    keywords: "data science resume, ML engineer resume, AI resume builder, data scientist CV, ATS optimization data professional, machine learning resume, data analyst resume, technical resume builder",
    metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://DataCV.com' : 'http://localhost:3001'),
    openGraph: {
        title: "DataCV - AI Resume Builder for Data Professionals",
        description: "Build impactful resumes that showcase your data science expertise with AI designed for technical roles",
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "DataCV - Resume Builder for Data Professionals",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "DataCV - AI Resume Builder for Data Professionals",
        description: "Build impactful resumes that showcase your data science expertise",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <TRPCProvider> {/* Now this is defined */}
            <Providers>
                <div className="min-h-screen bg-background text-foreground">
                    {children}
                </div>
            </Providers>
        </TRPCProvider>
        </body>
        </html>
    );
}
