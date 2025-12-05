'use client'

import { File, Copy, Image as ImageIcon, FileText, Check } from 'lucide-react'
import { useState } from 'react'

interface DocumentViewerProps {
	document: {
		id: string
		name: string
		content?: string
		imageUrl?: string
	} | null
}

export function DocumentViewer({ document }: DocumentViewerProps) {
	const [viewMode, setViewMode] = useState<'raw' | 'text'>('text')
	const [copied, setCopied] = useState(false)

	const handleCopy = () => {
		if (document?.content) {
			navigator.clipboard.writeText(document.content)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		}
	}

	if (!document) {
		return (
			<div className="pointer-events-none flex h-full flex-1 flex-col items-center justify-center p-8 text-center select-none">
				<div className="bg-primary/10 mb-4 rounded-full p-6">
					<File className="text-muted-foreground/50 h-10 w-10" />
				</div>
				<h3 className="text-lg font-semibold">It's empty here</h3>
				<p className="text-muted-foreground text-center text-sm">
					Choose an image from the sidebar <br /> or upload a new one
					to get started.
				</p>
			</div>
		)
	}

	return (
		<div className="flex h-full flex-1 flex-col overflow-hidden">
			<div className="flex items-center justify-between border-b px-6 py-3">
				<div className="bg-primary/5 flex items-center gap-1 rounded-lg p-1">
					<button
						onClick={() => setViewMode('raw')}
						className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
							viewMode === 'raw'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						<ImageIcon className="h-4 w-4" />
						Raw Image
					</button>
					<button
						onClick={() => setViewMode('text')}
						className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
							viewMode === 'text'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						<FileText className="h-4 w-4" />
						Extracted Text
					</button>
				</div>

				{viewMode === 'text' && (
					<button
						onClick={handleCopy}
						className="bg-background hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
					>
						{copied ? (
							<Check className="h-3.5 w-3.5 text-green-500" />
						) : (
							<Copy className="h-3.5 w-3.5" />
						)}
						{copied ? 'Copied' : 'Copy Text'}
					</button>
				)}
			</div>

			<div
				className={`flex-1 p-6 ${viewMode === 'raw' ? 'overflow-hidden' : 'overflow-y-auto'}`}
			>
				{viewMode === 'raw' ? (
					<div className="bg-muted/10 pointer-events-none flex h-full w-full items-center justify-center rounded-lg border border-dashed p-4">
						{document.imageUrl ? (
							<img
								src={document.imageUrl}
								alt={document.name}
								className="max-h-full max-w-full rounded object-contain shadow-sm"
							/>
						) : (
							<div className="text-muted-foreground text-center">
								<ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
								<p>No image preview available</p>
							</div>
						)}
					</div>
				) : (
					<div className="prose prose-sm bg-card max-w-none rounded-lg border p-8 shadow-sm">
						{document.content ? (
							<pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap">
								{document.content}
							</pre>
						) : (
							<p className="text-muted-foreground italic">
								No text extracted yet...
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
