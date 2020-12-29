# Delay

Utilities for delaying function calls.

```ts
import { throttle, delay } from "@travisspomer/tidbits"

// Prints "Hello!" ten times.
const myFunction = () => { console.log("Hello!") }
for (i = 0; i < 10; i++) myFunction()

// Prints "Hello!" twice: once immediately, and once after 1 second passes.
const myThrottledFunction = throttle(1000, myFunction)
for (i = 0; i < 10; i++) myThrottledFunction()

// Prints "Hello!" once after 1 second passes.
const myDelayedFunction = throttle(1000, myFunction)
for (i = 0; i < 10; i++) myDelayedFunction()
```

# `throttle` and `delay`

```ts
throttle(interval: number, func: () => void): () => void
delay(interval: number, func: () => void): () => void
```

* `interval`: The number of milliseconds to delay calls to `func`. Must be greater than 0.
* `func`: The function to call (with no arguments or return value).
* Returns: *A new function* which will call `func` no more often than once every `interval` milliseconds. The new function takes no arguments and returns no value.
	* `throttle`: `func` will be called immediately when the function returned by `throttle` is called. If it is called again within the interval, those interim calls will be batched, and replaced with a single call to `func` after the interval has elapsed. If the function returned by `throttle` was only called once, there will be no follow-up call to `func`.
	* `delay`: `func` will be called once at the end of the interval after the function returned by `delay` is called, and any subsequent calls to that function within the interval will be ignored.
	* In either case, `func` will never be called more times than the returned function is called, and after the interval elapses, the timer is reset the next time the returned function is called and the process starts again.

If you're not sure which one you want, just try both and see which one feels better: probably `throttle`.

Note that this is *not* a debounce function. For example, if the interval is 1 second (`1000`), and the function is called repeatedly over the course of 5.5 seconds, `func` will still get called up to 6 times. A traditional debounce function would reset the timer on each call, so `func` would only get called once at the very end.

Since arguments are ignored, this cannot be used to implement a feature like how the browser groups calls with identical arguments to `console.log()`—it's for time-based delays only.

You should never call `throttle` or `delay` itself in a loop: both methods return a new function that encapsulates the delay logic.

```ts
// This won't work as expected:
for (i = 0; i < 10; i++) throttle(1000, () => console.log("Hello!"))
```
