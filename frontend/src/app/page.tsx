import { signIn } from '@/auth'

export default function Home() {
	return (
		<div className="flex h-screen w-full items-center justify-center">
			<form
				action={async () => {
					'use server'
					await signIn('google', { redirectTo: '/dashboard' })
				}}
			>
				<button
					type="submit"
					className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
				>
					Login with Google
				</button>
			</form>
		</div>
	)
}
