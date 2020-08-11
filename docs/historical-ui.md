# Historical UI

A small utility that allows you to control one or more mutually-exclusive popup UIs using the history stack. For example, if you have two potential popups, then open the first one, then open the second one, the first one would get closed first. Then, if you use the browser's back button, the second one gets closed as well. Then, the forward button would make it reopen.

Example:

```js
import { HistoricalUI } from "@travisspomer/tidbits"

const popupController = HistoricalUI.add({
	onStateChange: (ev) => {
		if (ev.state)
			myPopup.style.removeProperty("display")
		else
			myPopup.style.display = "none"
	}
})

myButton.addEventListener("click", () => popupController.state = !popupController.state)
```

In this example, the popup is visible when popupController.state is true, and hidden when it's false or null. A button click event toggles the popup's visibility manually. In addition, HistoricalUI sets the state to null when the user presses the Back button, or another UI that was registered with add() is opened.

# `HistoricalUI`

```ts
import { HistoricalUI } from "@travisspomer/tidbits"
```

## `add`

```ts
HistoricalUI.add({
	onStateChange: (ev: StateChangeEvent) => void,
	key?: string
}): HistoricalUIElement
```

* `onStateChange`: A function to be called when the state changes.
* `key`: A unique identifier for this UI element. (Optional)
* Returns: An object that you can use to manually trigger state changes.

Tip: In TypeScript, you can supply a state type to get a strongly-typed object in return. For example, `add<number>()` returns a `HistoricalUIElement<number>` which stores its state as a `number` instead of `any`.

If you supply a `key`, HistoricalUI will attempt to "rehydrate" the state of that element if the page is refreshed, or if the user navigates away and then back.

### `StateChangeEvent`

A `StateChangeEvent` object is passed to your `onStateChange` handler.

```ts
interface StateChangeEvent<StateType>
{
	readonly state: StateType
	readonly controller: HistoricalUIElement
}
```

#### `state`

The new state of your UI element.

#### `controller`

The same object that was returned from `add()`.

### `HistoricalUIElement`

A `HistoricalUIElement` object is returned from `add()`.

```ts
interface HistoricalUIElement<StateType>
{
	state: StateType | null
}
```

#### `state`

The current state of your UI element. You can change this property to trigger a state change. In TypeScript, if you supplied a type to `add()`, this property will be that same type or `null`.

**Important:** Setting any UI element's state to a non-falsy value will set all other registered UI elements to `null`. All falsy state values are treated as `null`.
