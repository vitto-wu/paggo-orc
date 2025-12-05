'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
	Plus,
	FileText,
	LogOut,
	User as UserIcon,
	Pencil,
	Trash2
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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
	onRename: (id: string, newName: string) => void
	onDelete: (id: string) => void
	isUploading?: boolean
	uploadProgress?: number
}

export function Sidebar({
	user,
	documents,
	selectedDocId,
	onSelectDocument,
	onUpload,
	onRename,
	onDelete,
	isUploading,
	uploadProgress = 0
}: SidebarProps) {
	const [renameId, setRenameId] = useState<string | null>(null)
	const [newName, setNewName] = useState('')
	const [deleteId, setDeleteId] = useState<string | null>(null)

	const handleRenameClick = (id: string, currentName: string) => {
		setRenameId(id)
		setNewName(currentName)
	}

	const handleRenameSubmit = () => {
		if (renameId && newName.trim()) {
			onRename(renameId, newName)
			setRenameId(null)
		}
	}

	return (
		<>
			<div className="flex h-full w-full flex-col pt-16">
				<div className="@container p-6">
					<h1 className="h-16 text-right text-[clamp(1.25rem,7.5cqw,1.875rem)] leading-tight font-semibold tracking-wide">
						Hi {user.name?.split(' ')[0]}, how can I
						<br /> <span className="mr-4">help you today?</span>
					</h1>
				</div>

				<div className="px-4 pb-4">
					<div
						onClick={isUploading ? undefined : onUpload}
						className={`group border-muted-foreground/25 bg-background relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 border-dashed px-4 py-8 transition-all ${
							isUploading
								? 'cursor-not-allowed border-solid'
								: 'hover:border-primary/50 hover:bg-background/80 cursor-pointer'
						}`}
					>
						{isUploading && (
							<>
								<div
									className={`bg-primary/10 absolute inset-0 transition-all duration-300 ease-out ${
										uploadProgress === 100
											? 'animate-pulse'
											: ''
									}`}
									style={{ width: `${uploadProgress}%` }}
								/>
								<div
									className="bg-primary absolute bottom-0 left-0 h-1 transition-all duration-300 ease-out"
									style={{ width: `${uploadProgress}%` }}
								/>
							</>
						)}

						<div className="bg-muted group-hover:bg-background relative z-10 rounded-full p-2">
							{uploadProgress === 100 && isUploading ? (
								<div className="text-primary h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
							) : (
								<Plus className="text-muted-foreground group-hover:text-primary h-6 w-6" />
							)}
						</div>
						<div className="relative z-10 text-center">
							<p className="text-sm font-medium">
								{isUploading
									? uploadProgress === 100
										? 'Processing OCR...'
										: `Uploading ${uploadProgress}%`
									: 'New Image'}
							</p>
							<p className="text-muted-foreground text-xs">
								{isUploading
									? uploadProgress === 100
										? 'Extracting text...'
										: 'Please wait'
									: 'Click or drag to upload'}
							</p>
						</div>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto px-4 py-2">
					<h2 className="text-muted-foreground mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
						Recent Images
					</h2>
					<div className="space-y-1">
						{documents.map((doc) => (
							<div
								key={doc.id}
								className={`group/item flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-left text-sm transition-colors ${
									selectedDocId === doc.id
										? 'bg-primary/10 text-primary ring-primary/20 ring-1'
										: 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'
								}`}
								onClick={() => onSelectDocument(doc.id)}
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
								<div className="flex opacity-0 transition-opacity group-hover/item:opacity-100">
									<button
										onClick={(e) => {
											e.stopPropagation()
											handleRenameClick(doc.id, doc.name)
										}}
										className="text-primary/50 hover:text-primary cursor-pointer p-1 transition-colors duration-300"
										title="Rename"
									>
										<Pencil className="h-4 w-4" />
									</button>
									<button
										onClick={(e) => {
											e.stopPropagation()
											setDeleteId(doc.id)
										}}
										className="text-primary/50 hover:text-destructive cursor-pointer p-1 transition-colors duration-300"
										title="Delete"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="p-4">
					<div className="bg-background ring-border flex items-center gap-3 rounded-lg p-3 shadow-sm ring-1">
						<div className="bg-primary/10 text-primary pointer-events-none relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full">
							{user.image ? (
								<Image
									src={user.image}
									alt={user.name || 'User'}
									fill
									className="object-cover"
									unoptimized
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
			<Dialog
				open={!!renameId}
				onOpenChange={(open) => !open && setRenameId(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename Document</DialogTitle>
						<DialogDescription>
							Enter a new name for your document.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input
								id="name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								className="col-span-3"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setRenameId(null)}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							onClick={handleRenameSubmit}
							className="cursor-pointer font-bold"
						>
							Save
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog
				open={!!deleteId}
				onOpenChange={(open) => !open && setDeleteId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently
							delete the document.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => setDeleteId(null)}
							className="cursor-pointer"
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => {
								if (deleteId) {
									onDelete(deleteId)
									setDeleteId(null)
								}
							}}
							className="bg-destructive hover:bg-destructive/90 cursor-pointer font-bold"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
