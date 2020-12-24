/**
	Converts a string or number to a Boolean.
	Values true, 1, and "true" (case-insensitive) return true.
	All falsy values return false.
	Anything else throws an exception.
	@param str A string to convert to a Boolean.
*/
export const toBoolean = (str: string | boolean | number): boolean =>
{
	if (str === true || str === 1) return true
	const lower = typeof(str) === "string" ? str.trim().toLowerCase() : ""
	if (lower === "true") return true
	if (!str || lower === "false") return false
	throw new Error("Your whimsical input couldn't be converted to a Boolean.")
}
