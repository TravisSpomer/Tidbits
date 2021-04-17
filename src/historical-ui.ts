const RootStateKey = "__HistoricalUI"

interface AddParams<StateType>
{
	/// Optionally, a key that uniquely represents this UI. It will be accessible from the state change event, and
	/// can be used to rehydrate state after navigating away or refreshing page.
	key?: string

	/// An event handler that should be called whenever the state for this element changes.
	onStateChange: StateChangeEventHandler<StateType>
}

interface HistoricalUI
{
	/// Sets up a portion of your UI to have its state controlled by the navigation history.
	/// Returns an object with a "state" property that lets you change the state of the object manually.
	add<StateType>(params: AddParams<StateType>): HistoricalUIElement<StateType>
	/// Removes a state controller (the object returned from add()) from being managed by HistoricalUI.
	remove<StateType>(controller: HistoricalUIElement<StateType>): void
}

interface HistoryStateValue
{
	key: string
	value: any
}

class HistoricalUIImpl implements HistoricalUI
{
	private _registeredControllers = new Map<string, HistoricalUIElementImpl<any>>()
	private _activeController: HistoricalUIElementImpl<any> | null = null
	private _isRehydrating = false

	public constructor()
	{
		window.addEventListener("popstate", () => this.rehydrate())

		if (history)
		{
			if (history.state && RootStateKey in history.state)
			{
				// If they refreshed the page, rehydrate history-controlled UI from the history state.
				this.rehydrate()
			}
			else
			{
				// When this class is first used on a page, add a sentinel to the state dictionary so that we know before we're about to leave the page.
				const state = history.state || {}
				state[RootStateKey] = null
				history.replaceState(state, "")
			}
		}
	}

	public add<StateType>(params: AddParams<StateType>): HistoricalUIElement<StateType>
	{
		const controller = new HistoricalUIElementImpl(params.onStateChange, params.key)
		this._registeredControllers.set(controller.key, controller)
		this.rehydrate() // in case this is already the active controller due to refreshing the page
		return controller
	}

	public remove<StateType>(controller: HistoricalUIElement<StateType>): void
	{
		this._registeredControllers.delete(controller.key)
		if (history && history.state && history.state[RootStateKey] && controller.key in history.state[RootStateKey])
			delete history.state[RootStateKey][controller.key]
	}

	public get activeController(): HistoricalUIElementImpl<any> | null
	{
		return this._activeController
	}

	public setState<StateType>(controller: HistoricalUIElementImpl<StateType>, value: StateType): void
	public setState(controller: null, value: null): void
	public setState<StateType>(controller: HistoricalUIElementImpl<StateType> | null, value: StateType | null): void
	{
		const prevController = this._activeController

		// If it's already the currently-active controller, just update the history state value and skip the rest.
		if (controller && prevController === controller)
		{
			controller.raiseOnChanged()
			if (!this._isRehydrating && history)
			{
				history.replaceState({ ...history.state, [RootStateKey]: { key: controller.key, value: value } as HistoryStateValue }, "")
			}
			return
		}

		// Okay, deactivate the previously-active controller.
		if (prevController)
		{
			this._activeController = null
			prevController.raiseOnChanged()
		}

		// Now, activate the new one.
		if (controller)
		{
			this._activeController = controller
			controller.raiseOnChanged()
		}

		// Finally, update the history state.
		if (!this._isRehydrating && history)
		{
			if (controller && !prevController)
			{
				history.pushState({ ...history.state, [RootStateKey]: null }, "")
				history.replaceState({ ...history.state, [RootStateKey]: { key: controller.key, value: value } as HistoryStateValue }, "")
			}
			else if (controller)
			{
				history.replaceState({ ...history.state, [RootStateKey]: { key: controller.key, value: value } as HistoryStateValue }, "")
			}
			else
			{
				if (!(history.state && history.state[RootStateKey] && history.state[RootStateKey] === null))
					history.back()
			}
		}
	}

	private rehydrate(): void
	{
		if (!history) return
		this._isRehydrating = true
		const stateInfo: HistoryStateValue | null = (history.state && RootStateKey in history.state && history.state[RootStateKey] !== null) ? history.state[RootStateKey] || null : null
		const controller = stateInfo ? this._registeredControllers.get(stateInfo.key) || null : null
		if (controller && stateInfo)
			controller.state = stateInfo.value
		else
			this.setState(null, null)
		this._isRehydrating = false
	}
}

const HistoricalUIServerInstance: HistoricalUI =
{
	add<StateType>(): HistoricalUIElement<StateType>
	{
		return null as unknown as HistoricalUIElement<StateType>
	},
	remove(): void
	{ /* noop */ },
}

const HistoricalUIInstance = (globalThis && !("window" in globalThis)) ? new HistoricalUIImpl() : HistoricalUIServerInstance as unknown as HistoricalUIImpl
const PublicAPI = HistoricalUIInstance as HistoricalUI

interface StateChangeEvent<StateType>
{
	/// The controller raising the event.
	readonly controller: HistoricalUIElement<StateType>
	/// The controller's current state.
	readonly state: any
}

type StateChangeEventHandler<StateType> = (ev: StateChangeEvent<StateType>) => void

interface HistoricalUIElement<StateType>
{
	/// The state of the element.
	/// Important: All falsy values are treated as null.
	state: StateType | null
	/// The key passed into add(), or a randomly-generated one.
	readonly key: string
}

class HistoricalUIElementImpl<StateType> implements HistoricalUIElement<StateType>
{
	public readonly key: string
	public readonly onStateChange: StateChangeEventHandler<StateType>
	private _state: StateType | null = null

	public constructor(onStateChange: StateChangeEventHandler<StateType>, key?: string)
	{
		this.key = key || `__${Math.random().toString().substring(2)}`
		this.onStateChange = onStateChange
	}

	public get state(): any | null
	{
		return HistoricalUIInstance.activeController === this ? this._state : null
	}

	public set state(value: any | null)
	{
		if (value)
		{
			if (HistoricalUIInstance.activeController === this && value === this._state) return
			this._state = value
			HistoricalUIInstance.setState(this, value)
		}
		else
		{
			if (HistoricalUIInstance.activeController !== this) return
			this._state = null
			HistoricalUIInstance.setState(null, null)
		}
	}

	public raiseOnChanged(): void
	{
		this.onStateChange({ controller: this, state: this.state })
	}
}

export default PublicAPI
export
{
	PublicAPI as HistoricalUI,
	AddParams,
	HistoricalUIElement,
	StateChangeEvent,
	StateChangeEventHandler,
}
// Don't forget to export these from index.ts too!
