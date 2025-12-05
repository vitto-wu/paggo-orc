export function playSuccessSound() {
	try {
		const AudioContext =
			window.AudioContext ||
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).webkitAudioContext
		if (!AudioContext) return

		const ctx = new AudioContext()
		const osc = ctx.createOscillator()
		const gain = ctx.createGain()

		osc.connect(gain)
		gain.connect(ctx.destination)

		osc.type = 'sine'
		osc.frequency.setValueAtTime(880, ctx.currentTime)
		osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)

		gain.gain.setValueAtTime(0.1, ctx.currentTime)
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

		osc.start()
		osc.stop(ctx.currentTime + 0.15)
	} catch (e) {
		console.error('Audio play failed', e)
	}
}

export function playErrorSound() {
	try {
		const AudioContext =
			window.AudioContext ||
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).webkitAudioContext
		if (!AudioContext) return

		const ctx = new AudioContext()
		const osc = ctx.createOscillator()
		const gain = ctx.createGain()

		osc.connect(gain)
		gain.connect(ctx.destination)

		osc.type = 'sawtooth'
		osc.frequency.setValueAtTime(400, ctx.currentTime)
		osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.3)

		gain.gain.setValueAtTime(0.1, ctx.currentTime)
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

		osc.start()
		osc.stop(ctx.currentTime + 0.3)
	} catch (e) {
		console.error('Audio play failed', e)
	}
}
