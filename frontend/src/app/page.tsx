import { signIn } from '@/auth'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import background from '@/assets/background.jpg'

export default function Home() {
	return (
		<div className="relative flex h-screen w-full items-center justify-center overflow-hidden">
			<Image
				src={background}
				alt="Background"
				fill
				className="object-cover"
				priority
			/>
			<div className="bg-background/50 relative z-10 flex flex-col items-center gap-12 rounded-xl border p-24 shadow-sm backdrop-blur-sm">
				<div className="flex flex-col items-center gap-4 text-center">
					<h1 className="text-4xl font-bold tracking-tight">
						Welcome to Paggo <br />
						ORC Case
					</h1>
					<p className="text-foreground/80 text-sm font-medium">
						Sign in to access your <br />
						intelligent document management system.
					</p>
				</div>

				<form
					action={async () => {
						'use server'
						await signIn('google', { redirectTo: '/dashboard' })
					}}
					className="grid w-full place-content-center"
				>
					<Button className="cursor-pointer" type="submit" size="lg">
						<svg
							className="mr-2 h-4 w-4"
							aria-hidden="true"
							focusable="false"
							data-prefix="fab"
							data-icon="google"
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 488 512"
						>
							<path
								fill="currentColor"
								d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
							></path>
						</svg>
						Continue with Google
					</Button>
				</form>
			</div>
		</div>
	)
}
