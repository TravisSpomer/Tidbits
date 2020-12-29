const throttleOrDelayCore = (immediate: boolean, interval: number, func: () => void) =>
{
	if (interval <= 0) throw new Error("Interval must be a positive number, in milliseconds.")
	let throttleUntil = 0, wasThrottled = false
	const timerCallback = () =>
	{
		func()
		throttleUntil = 0
		wasThrottled = false
	}
	return () =>
	{
		const now = Date.now()
		if ((!immediate) || (throttleUntil !== 0 && now < throttleUntil))
		{
			// We were called too soon.
			if (!wasThrottled)
			{
				if (throttleUntil === 0) throttleUntil = now + interval
				setTimeout(timerCallback, interval)
				wasThrottled = true
			}
		}
		else
		{
			// It's been long enough, or this is the first call of the sequence.
			throttleUntil = now + interval
			func()
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
export const throttle: (interval: number, func: () => void) => () => void = throttleOrDelayCore.bind(null, /* immediate: */ true)

/**
	Creates a new wrapper function that batches and delays calls to another function, ensuring it is called no more often than a specified interval.
	If the wrapper function is called multiple times within the interval, the inner function is called only once, once the interval has passed.
	@param interval A number of milliseconds to wait before the function is first called and before it can be called again.
	@param func A function to be called which has no arguments or return type.
*/
export const delay: (interval: number, func: () => void) => () => void = throttleOrDelayCore.bind(null, /* immediate: */ false)
