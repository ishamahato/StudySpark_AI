import type { Metadata, Viewport } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#04AA6D" },
    { media: "(prefers-color-scheme: dark)", color: "#1D2A35" },
  ],
};

export const metadata: Metadata = {
  title: "StudySpark - AI Interactive Study Decks & Active Recall",
  description:
    "Transform lecture notes, topics, and study materials into interactive 3D flashcards, adaptive quizzes with wrong-answer re-testing, topic mastery tracking, and structured revision plans.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  authors: [{ name: "Isha Mahato", url: "mailto:isha.mahato@studyspark.ai" }],
  creator: "Isha Mahato",
  publisher: "StudySpark AI",
  keywords: [
    "AI Study Assistant",
    "Active Recall",
    "3D Flashcards",
    "Adaptive Quizzes",
    "Pomodoro Study Checklist",
    "Topic Mastery",
    "Isha Mahato",
  ],
  metadataBase: new URL("https://studyspark.ai"),
  openGraph: {
    title: "StudySpark - AI Interactive Study Decks",
    description:
      "Transform free-form notes into structured 3D flashcards, quizzes with error remediation, and adaptive study plans.",
    siteName: "StudySpark",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudySpark - AI Interactive Study Decks",
    description:
      "Transform free-form notes into structured 3D flashcards, quizzes with error remediation, and adaptive study plans.",
    creator: "@IshaMahato",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-text-main dark:text-text-darkMain antialiased transition-colors">
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
