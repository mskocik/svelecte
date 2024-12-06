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
- [breaking] Dropped support for `svelte-use-form` validation library (remove triggering `input` event on `<select>` element)
- [breaking] Replaced slots with snippets
- add `i18n.aria_removeItemLabel` function to avoid svelte compiler warning
- add `emitValues` property to emit values instead of objects
- [breaking] do not automatically set `multiple` property if `name` included "[]" meaning multiple items when submitting form. It's inversed now, if name doesn't contain `[]` suffix it is added automatically
- [breaking] when using `optionResolver`, value cannot be changed from parent component. All these updates from parent are ignored.
- [breaking] remove `svelte-tiny-virtual-list` dependency, provide own implementation
- [breaking] remove `vlHeight` property, related to removal of virtual list dependency, use `--max-height` css property instead
- add `html` renderer since default one escapes following HTML entities: `<`, `>`, `&`, `'` and `"`

## v4.0:

- [breaking] changed signature of `registerSvelecte`
- [breaking] `registerSvelecte` is now available from `svelecte` itself, not from `svelecte/component`

- fix default placeholder to use global settings
