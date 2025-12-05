import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from './dashboard-layout'
import axios from 'axios'

export default async function Dashboard() {
	const session = await auth()

	if (!session?.user) {
		redirect('/')
	}

	return <DashboardLayout user={session.user} />
}
