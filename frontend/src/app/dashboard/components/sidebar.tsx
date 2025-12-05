'use client'

import { Plus, FileText, LogOut, User as UserIcon } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface SidebarProps {
	user: {
		name?: string | null
		email?: string | null
		image?: string | null
	}
	documents: Array<{ id: string; name: string; date: string }>
	selectedDocId: string | null
	onSelectDocument: (id: string) => void
	onUpload: () => void
	isUploading?: boolean
	uploadError?: string | null
}

export function Sidebar({
	user,
	documents,
	selectedDocId,
	onSelectDocument,
	onUpload,
	isUploading,
	uploadError
}: SidebarProps) {
	return (
		<div className="flex h-full w-full flex-col pt-16">
			<div className="@container p-6">
				<h1 className="text-right text-[clamp(1.25rem,7.5cqw,1.875rem)] leading-tight font-semibold tracking-wide">
					Hi {user.name?.split(' ')[0]}, how can I
					<br /> <span className="mr-4">help you today?</span>
				</h1>
			</div>

			<div className="px-4 pb-4">
				<div
					onClick={isUploading ? undefined : onUpload}
					className={`group border-muted-foreground/25 bg-background relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
						isUploading
							? 'cursor-not-allowed opacity-50'
							: 'hover:border-primary/50 hover:bg-background/80 cursor-pointer'
					}`}
				>
					<div className="bg-muted group-hover:bg-background rounded-full p-2">
						<Plus className="text-muted-foreground group-hover:text-primary h-6 w-6" />
					</div>
					<div className="text-center">
						<p className="text-sm font-medium">
							{isUploading ? 'Uploading...' : 'New Document'}
						</p>
						<p className="text-muted-foreground text-xs">
							{isUploading
								? 'Please wait'
								: 'Click or drag to upload'}
						</p>
					</div>
				</div>
				{uploadError && (
					<p className="text-destructive mt-2 text-center text-xs font-medium">
						{uploadError}
					</p>
				)}
			</div>

			<div className="flex-1 overflow-y-auto px-4 py-2">
				<h2 className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
					Recent Documents
				</h2>
				<div className="space-y-1">
					{documents.map((doc) => (
						<button
							key={doc.id}
							onClick={() => onSelectDocument(doc.id)}
							className={`flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors ${
								selectedDocId === doc.id
									? 'bg-primary/10 text-primary ring-primary/20 ring-1'
									: 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'
							}`}
						>
							<FileText className="h-4 w-4 shrink-0" />
							<div className="flex-1 overflow-hidden">
								<p className="truncate font-medium">
									{doc.name}
								</p>
								<p className="truncate text-xs opacity-70">
									{doc.date}
								</p>
							</div>
						</button>
					))}
				</div>
			</div>

			<div className="p-4">
				<div className="bg-background ring-border flex items-center gap-3 rounded-lg p-3 shadow-sm ring-1">
					<div className="bg-primary/10 text-primary pointer-events-none flex h-10 w-10 items-center justify-center rounded-full">
						{user.image ? (
							<img
								src={user.image}
								alt={user.name || 'User'}
								className="h-full w-full rounded-full object-cover"
							/>
						) : (
							<UserIcon className="h-5 w-5" />
						)}
					</div>
					<div className="flex-1 overflow-hidden">
						<p className="truncate text-sm font-medium">
							{user.name}
						</p>
						<p className="text-muted-foreground truncate text-xs">
							{user.email}
						</p>
					</div>
					<button
						onClick={() => signOut({ callbackUrl: '/' })}
						className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-md p-2"
						title="Sign out"
					>
						<LogOut className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	)
}
