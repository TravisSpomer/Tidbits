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

## `remove`

```ts
HistoricalUI.remove(
	controller: HistoricalUIElement
): void
```

* `controller`: The object returned from `add()` to remove.

Removes an object from being managed by HistoricalUI. In a single-page application, you can use this to stop managing the state of a component when the component is about to be destroyed and you'll no longer have the reference to the `HistoricalUIElement`.

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
	readonly key: string
}
```

#### `state`

The current state of your UI element. You can change this property to trigger a state change. In TypeScript, if you supplied a type to `add()`, this property will be that same type or `null`.

**Important:** Setting any UI element's state to a non-falsy value will set all other registered UI elements to `null`. All falsy state values are treated as `null`.

#### `key`

Read-only. The key supplied to `add()`, or a randomly-generated one.

# Using it from React

You could use HistoricalUI from React too, but it's a bit more complicated, especially if you're using server-side rendering such as with Next.js.

* Use a class component, not a function component.
* Add an `async componentDidMount` method. In it, import the tidbits module dynamically rather than with an `import` statement at the top of the file, so the module doesn't get loaded on the server where it won't work:
	```ts
	const Dynamic = await import("@travisspomer/tidbits")
	this.popupController = Dynamic.HistoricalUI.add({
		key: "popup",
		onStateChange: (ev) => this.setState({ isPopupOpen: !!ev.state }),
	})
	```
* In your `onStateChange` event handler, copy the current state managed by HistoricalUI into your React component's state. This should be the only time that you modify that state value.
* If this component will repeatedly mount and unmount, also add an `async componentWillUnmount`:
	```ts
	const Dynamic = await import("@travisspomer/tidbits")
	Dynamic.HistoricalUI.remove(this.popupController)
	```
* When you want to change the UI state, do so on the controller object instead of through your component's React state.
	```jsx
	<button
		onClick={() => this.popupController.state = !this.state.isPopupOpen}
	>
		Toggle popup
	</button>
	```
* Then, use your React component state during `render()` normally:
	```jsx
	{this.state.isPopupOpen && <div className="my-popup">Yo I'm a popup</div>}
	```
