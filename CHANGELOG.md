## v5.0

- [breaking] Dropped dispatching custom events through `createEventDispatcher`. Callback methods are expected instead. Previous event names has now added prefix `on` and are properly capitalized. This is a list of event to callback mapping:
    - `change` changed to `onChange`
    - `focus` changed to `onFocus`
    - `blur` changed to `onBlur`
    - `createoption` changed to `onCreateOption`
    - `createFail` changed to `onCreateFail`
    - `enterKey` changed to `onEnterKey`
    - `fetch` changed to `onFetch`
    - `fetchError` changed to `onFetchError`
    - `invalidValue` changed to `onInvalidValue`
- [breaking] Dropped support for `svelte-use-form` validation library.

## v4.0:

- [breaking] changed signature of `registerSvelecte`
- [breaking] `registerSvelecte` is now available from `svelecte` itself, not from `svelecte/component`

- fix default placeholder to use global settings
