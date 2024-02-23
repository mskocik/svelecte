# Events

Event        | arguments                   | description
-------------|-----------------------------|----------------------------------------------------------------------------
fetch        | options                     | newly fetched remote options
fetchError   | error                     | dispatche on fetch error of any kind
change       | selection                   | selected objects. If `anchor` property is defined, `change` event is called also on it
createoption | option                      | newly created option object
createFail | object | thrown if `createHandler` fails
focus        | `<input>`                        | focus event
blur         | `<input>`                           | blur event
invalidValue | invalidValue                | triggered when passed `value` is out of provided `options` items. Internal (and bound, if any) `value` is set to `null` or `[]` if multiple
enterKey     | underlying `keyDown` event  | triggered when natively it would cause form submit (dropdown is closed). This gives you ability to prevent it by calling `event.detail.preventDefault()`
