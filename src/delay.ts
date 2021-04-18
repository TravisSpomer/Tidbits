function core(immediate: boolean, interval: number, func: (...args: any[]) => void): (() => void)
{
	if (interval <= 0) throw new Error("Interval must be a positive number, in milliseconds.")
	// The earliest time at which the function can be called again.
	// If this isn't 0, then there's always a timer set.
	let throttleUntil = 0
	// If defined, at least one call has happened during the interval (before throttleUntil), OR exactly one call happened and
	// immediate is false. If defined, a timer is set, and if undefined, it's not.
	let queuedArgs: any | undefined

	const timerCallback = (): void =>
	{
		// Rarely, callQueued could be false here if the timer expired but the function was already called directly.
		// If so, just bail out now.
		if (!queuedArgs) return

		// The timer expired, and there was a callback waiting.
		const now = Date.now()
		throttleUntil = now + interval
		func(...queuedArgs)
		queuedArgs = undefined
	}

	return (...args: any[]): void =>
	{
		const now = Date.now()

		if (throttleUntil !== 0 && now < throttleUntil)
		{
			// We were called too soon. Start the timer if it's not already going.
			if (!queuedArgs) setTimeout(timerCallback, throttleUntil - now)
			queuedArgs = args
		}
		else
		{
			// It's been long enough since the last call, and the function was called directly.
			throttleUntil = now + interval
			if (immediate || queuedArgs)
			{
				queuedArgs = undefined
				func(...args)
			}
			else
			{
				queuedArgs = args
				setTimeout(timerCallback, interval)
			}
		}
	}
}

/**
	Creates a new wrapper function that calls another function no more often than a specified interval.
	If the wrapper function is called multiple times within the interval, the inner function is called once at the start, and then one more time
	after the interval has passed, regardless of how many times the wrapper function was called within the internal.
	@param interval A number of milliseconds to wait before the function can be called again.
	@param func A function to be called which has no arguments or return type.
*/
export const throttle: ((interval: number, func: (...args: any[]) => void) => (...args: any[]) => void) = core.bind(null, /* immediate: */ true)

/**
	Creates a new wrapper function that batches and delays calls to another function, ensuring it is called no more often than a specified interval.
	If the wrapper function is called multiple times within the interval, the inner function is called only once, once the interval has passed.
	@param interval A number of milliseconds to wait before the function is first called and before it can be called again.
	@param func A function to be called which has no arguments or return type.
*/
export const delay: ((interval: number, func: (...args: any[]) => void) => (...args: any[]) => void) = core.bind(null, /* immediate: */ false)
