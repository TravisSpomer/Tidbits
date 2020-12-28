/**
	Converts a value to a Boolean.
	Values true, 1, and "true" (case-insensitive) return true.
	All falsy values return false.
	Anything else throws an exception.
	@param value A value to convert to a Boolean.
*/
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const toBoolean = (value: any): boolean =>
{
	if (value === true || value === 1) return true
	const lower = typeof(value) === "string" ? value.trim().toLowerCase() : ""
	if (lower === "true") return true
	if (!value || lower === "false") return false
	throw new Error("Your whimsical input couldn't be converted to a Boolean.")
}
