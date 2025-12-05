'use client'

import { useState, useEffect, useRef } from 'react'
import { Sidebar } from './components/sidebar'
import { DocumentViewer } from './components/document-viewer'
import { ChatPanel } from './components/chat-panel'
import axios from 'axios'
import { toast } from 'sonner'
import { playSuccessSound, playErrorSound } from '@/lib/sounds'

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup
} from '@/components/ui/resizable'

interface Document {
	id: string
	fileName: string
	createdAt: string
	extractedText: string
	fileUrl: string
}

interface DashboardLayoutProps {
	user: {
		id?: string | null
		name?: string | null
		email?: string | null
		image?: string | null
	}
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
	const [documents, setDocuments] = useState<Document[]>([])
	const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
	const [currentUserId, setCurrentUserId] = useState<string | null>(
		user.id || null
	)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const fileInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (user.id) {
			axios
				.post(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
					id: user.id,
					email: user.email || '',
					name: user.name || '',
					image: user.image || ''
				})
				.then((res) => {
					if (res.data && res.data.id) {
						setCurrentUserId(res.data.id)
					}
				})
				.catch((err) =>
					console.error('Client-side user sync failed', err)
				)
		}
	}, [user.id, user.email, user.name, user.image])

	useEffect(() => {
		if (currentUserId) {
			fetchDocuments(currentUserId)
		}
	}, [currentUserId])

	const fetchDocuments = async (userId: string) => {
		try {
			const res = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/documents/${userId}`
			)
			setDocuments(res.data)
		} catch (error) {
			console.error('Failed to fetch documents:', error)
		}
	}

	const selectedDocument =
		documents.find((doc) => doc.id === selectedDocId) || null

	const viewerDocument = selectedDocument
		? {
				id: selectedDocument.id,
				name: selectedDocument.fileName,
				date: new Date(selectedDocument.createdAt).toLocaleString(),
				content: selectedDocument.extractedText || '',
				imageUrl: selectedDocument.fileUrl
			}
		: null

	const handleUploadClick = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file || !currentUserId) return

		setIsUploading(true)
		setUploadProgress(0)
		const formData = new FormData()
		formData.append('userId', currentUserId)
		formData.append('file', file)

		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/documents/upload`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					},
					onUploadProgress: (progressEvent) => {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total!
						)
						setUploadProgress(percentCompleted)
					}
				}
			)

			await fetchDocuments(currentUserId)
			if (response.data && response.data.id) {
				setSelectedDocId(response.data.id)
			}
			toast.success('Image uploaded successfully')
			playSuccessSound()
		} catch (error) {
			console.error('Error uploading file:', error)
			toast.error('Failed to upload image. Please try again.')
			playErrorSound()
		} finally {
			setIsUploading(false)
			setUploadProgress(0)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}

	const handleRename = async (id: string, newName: string) => {
		if (!currentUserId) return
		try {
			await axios.patch(
				`${process.env.NEXT_PUBLIC_API_URL}/documents/${id}`,
				{
					name: newName
				}
			)
			await fetchDocuments(currentUserId)
			toast.success('Document renamed successfully')
			playSuccessSound()
		} catch (error) {
			console.error('Error renaming document:', error)
			toast.error('Failed to rename document')
			playErrorSound()
		}
	}

	const handleDelete = async (id: string) => {
		if (!currentUserId) return
		try {
			await axios.delete(
				`${process.env.NEXT_PUBLIC_API_URL}/documents/${id}`
			)
			if (selectedDocId === id) {
				setSelectedDocId(null)
			}
			await fetchDocuments(currentUserId)
			toast.success('Document deleted successfully')
			playSuccessSound()
		} catch (error) {
			console.error('Error deleting document:', error)
			toast.error('Failed to delete document')
			playErrorSound()
		}
	}

	// Map documents for Sidebar
	const sidebarDocuments = documents.map((doc) => ({
		id: doc.id,
		name: doc.fileName,
		date: new Date(doc.createdAt).toLocaleDateString()
	}))

	return (
		<ResizablePanelGroup
			direction="horizontal"
			className="text-foreground h-screen w-full border p-4"
		>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				onChange={handleFileChange}
				accept=".png,.jpg,.jpeg"
			/>
			<ResizablePanel
				className="bg-muted rounded-2xl"
				defaultSize={25}
				minSize={23}
				maxSize={27}
			>
				<Sidebar
					user={user}
					documents={sidebarDocuments}
					selectedDocId={selectedDocId}
					onSelectDocument={setSelectedDocId}
					onUpload={handleUploadClick}
					onRename={handleRename}
					onDelete={handleDelete}
					isUploading={isUploading}
					uploadProgress={uploadProgress}
				/>
			</ResizablePanel>
			<ResizableHandle withHandle className="bg-background w-4" />
			<ResizablePanel
				className="bg-muted rounded-2xl"
				defaultSize={50}
				minSize={45}
			>
				<DocumentViewer document={viewerDocument} />
			</ResizablePanel>
			<ResizableHandle withHandle className="bg-background w-4" />
			<ResizablePanel
				className="bg-muted rounded-2xl"
				defaultSize={25}
				minSize={25}
			>
				<ChatPanel documentId={selectedDocId} />
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}
