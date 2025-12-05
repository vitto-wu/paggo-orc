'use client'

import { Send, Bot, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
}

interface ChatPanelProps {
	documentId: string | null
}

export function ChatPanel({ documentId }: ChatPanelProps) {
	const [messages, setMessages] = useState<Message[]>([])
	const [inputValue, setInputValue] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	// Fetch history when documentId changes
	useEffect(() => {
		if (!documentId) {
			setMessages([])
			return
		}

		const fetchHistory = async () => {
			try {
				const res = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/documents/details/${documentId}`
				)
				if (res.data && res.data.messages) {
					setMessages(res.data.messages)
				}
			} catch (error) {
				console.error('Failed to fetch chat history:', error)
			}
		}

		fetchHistory()
	}, [documentId])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!inputValue.trim() || !documentId) return

		const tempId = Date.now().toString()
		const newMessage: Message = {
			id: tempId,
			role: 'user',
			content: inputValue
		}

		setMessages((prev) => [...prev, newMessage])
		setInputValue('')
		setIsLoading(true)

		try {
			const res = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}/chat`,
				{
					content: newMessage.content,
					role: 'user'
				}
			)

			// The backend returns the AI message (or the user message if error, but let's assume AI)
			// Actually my backend implementation returns the AI message.
			// But wait, I should probably append the AI message returned.
			if (res.data && res.data.role === 'assistant') {
				setMessages((prev) => [...prev, res.data])
			}
		} catch (error) {
			console.error('Failed to send message:', error)
			// Optional: Remove the user message or show error
		} finally {
			setIsLoading(false)
		}
	}

	if (!documentId) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
				<p className="text-muted-foreground text-sm">
					Select a document to start chatting
				</p>
			</div>
		)
	}

	return (
		<div className="flex h-full w-full flex-col">
			<div className="border-b p-4">
				<h2 className="font-semibold">AI Assistant</h2>
				<p className="text-muted-foreground text-xs">
					Ask questions about your documents
				</p>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-4">
					{messages.length === 0 && (
						<div className="text-muted-foreground text-center text-sm">
							No messages yet. Start the conversation!
						</div>
					)}
					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex gap-3 ${
								message.role === 'user'
									? 'flex-row-reverse'
									: ''
							}`}
						>
							<div
								className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
									message.role === 'user'
										? 'bg-primary text-primary-foreground'
										: 'bg-primary/10 text-foreground'
								}`}
							>
								{message.role === 'user' ? (
									<User className="h-4 w-4" />
								) : (
									<Bot className="h-4 w-4" />
								)}
							</div>
							<div
								className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
									message.role === 'user'
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-foreground'
								}`}
							>
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										ul: ({ node, ...props }) => (
											<ul
												className="my-2 list-disc pl-4"
												{...props}
											/>
										),
										ol: ({ node, ...props }) => (
											<ol
												className="my-2 list-decimal pl-4"
												{...props}
											/>
										),
										h1: ({ node, ...props }) => (
											<h1
												className="my-2 text-xl font-bold"
												{...props}
											/>
										),
										h2: ({ node, ...props }) => (
											<h2
												className="my-2 text-lg font-bold"
												{...props}
											/>
										),
										h3: ({ node, ...props }) => (
											<h3
												className="text-md my-2 font-bold"
												{...props}
											/>
										),
										p: ({ node, ...props }) => (
											<p className="my-1" {...props} />
										),
										strong: ({ node, ...props }) => (
											<strong
												className="font-bold"
												{...props}
											/>
										)
									}}
								>
									{message.content}
								</ReactMarkdown>
							</div>
						</div>
					))}
					{isLoading && (
						<div className="flex gap-3">
							<div className="bg-primary/10 text-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
								<Bot className="h-4 w-4" />
							</div>
							<div className="bg-muted text-foreground max-w-[80%] rounded-lg px-3 py-2 text-sm">
								<span className="animate-pulse">
									Thinking...
								</span>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			<div className="border-t p-4">
				<form onSubmit={handleSubmit} className="relative">
					<input
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder="Type a message..."
						disabled={isLoading}
						className="bg-background focus:ring-primary/50 w-full rounded-md border py-2 pr-10 pl-3 text-sm outline-none focus:ring-2 disabled:opacity-50"
					/>
					<button
						type="submit"
						disabled={!inputValue.trim() || isLoading}
						className="text-primary hover:bg-primary/10 absolute top-1 right-1 rounded-sm p-1.5 disabled:opacity-50"
					>
						<Send className="h-4 w-4" />
					</button>
				</form>
			</div>
		</div>
	)
}
