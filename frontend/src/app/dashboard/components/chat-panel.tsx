'use client'

import { Send, Bot, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
}

export function ChatPanel() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			role: 'assistant',
			content:
				'Hello! I can help you analyze your documents. Select a document to get started.'
		}
	])
	const [inputValue, setInputValue] = useState('')
	const messagesEndRef = useRef<HTMLDivElement>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!inputValue.trim()) return

		const newMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: inputValue
		}

		setMessages((prev) => [...prev, newMessage])
		setInputValue('')

		// Simulate AI response
		setTimeout(() => {
			setMessages((prev) => [
				...prev,
				{
					id: (Date.now() + 1).toString(),
					role: 'assistant',
					content:
						"I'm a simulated AI response. I see you're interested in this document."
				}
			])
		}, 1000)
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
								{message.content}
							</div>
						</div>
					))}
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
						className="bg-background focus:ring-primary/50 w-full rounded-md border py-2 pr-10 pl-3 text-sm outline-none focus:ring-2"
					/>
					<button
						type="submit"
						disabled={!inputValue.trim()}
						className="text-primary hover:bg-primary/10 absolute top-1 right-1 rounded-sm p-1.5 disabled:opacity-50"
					>
						<Send className="h-4 w-4" />
					</button>
				</form>
			</div>
		</div>
	)
}
