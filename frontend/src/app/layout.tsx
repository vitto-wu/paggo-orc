import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-jetbrains-mono'
})

export const metadata: Metadata = {
	title: 'Paggo - OCR',
	description: 'Paggo - OCR Case Outline'
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={`${jetbrainsMono.variable} font-main h-screen w-full antialiased`}
			>
				<SessionProvider>{children}</SessionProvider>
			</body>
		</html>
	)
}
