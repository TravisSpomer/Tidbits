# Conversions

Utilities for converting data types.

# `toBoolean`

```ts
import { toBoolean } from "@travisspomer/tidbits"

const trueOrFalse: boolean = toBoolean(value)
```

* `value`: A string or number to be converted to a Boolean. (Or, an existing Boolean will be returned as-is.)
* Returns:
	* `true` if `value` is `true`, `1`, or `"true"` (case- and whitespace-insensitive).
	* `false` if `value` is `"false"` or any falsy value (`false`, `0`, `""`, `null`, `undefined`, `NaN`).
	* Anything else (`"daffodil"`, 42, `{}`, etc.) throws an exception.
