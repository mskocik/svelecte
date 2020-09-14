
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.25.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const mouseDownAction = e => e.preventDefault();

    function rendererActions(node, {item, index}) {

      function selectAction(e) {
        const eventType = e.target.closest('[data-action="deselect"]') ? 'deselect' : 'select';
        console.log('click', eventType);
        node.dispatchEvent(new CustomEvent(eventType, {
          bubble: true,
          detail: item
        }));
      }

      function hoverAction() {
        node.dispatchEvent(new CustomEvent('hover', {
          detail: index
        }));
      }
      node.onmousedown = mouseDownAction;
      node.onclick = selectAction;
      !item.isSelected && node.addEventListener('mouseenter', hoverAction);

      return {
        update(updated) {
          item = updated.item;
          index = updated.index;
        },
        destroy() {
          node.removeEventListener('mousedown', mouseDownAction);
          node.removeEventListener('click', selectAction);
          !item.isSelected && node.removeEventListener('mouseenter', hoverAction);
        }
      }
    }

    /* src\Svelecte\components\Item.svelte generated by Svelte v3.25.0 */
    const file = "src\\Svelecte\\components\\Item.svelte";

    // (65:0) {#if isSelected && isMultiple}
    function create_if_block(ctx) {
    	let a;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z");
    			add_location(path, file, 66, 89, 1635);
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			add_location(svg, file, 66, 4, 1550);
    			attr_dev(a, "href", "#deselect");
    			attr_dev(a, "class", "sv-item-btn");
    			attr_dev(a, "tabindex", "-1");
    			attr_dev(a, "data-action", "deselect");
    			add_location(a, file, 65, 2, 1467);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(65:0) {#if isSelected && isMultiple}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*item*/ ctx[1].text + "";
    	let t0;
    	let t1;
    	let itemActions_action;
    	let mounted;
    	let dispose;
    	let if_block = /*isSelected*/ ctx[2] && /*isMultiple*/ ctx[4] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "sv-item-content");
    			add_location(div0, file, 63, 2, 1385);
    			attr_dev(div1, "class", "sv-item");
    			toggle_class(div1, "is-disabled", /*isDisabled*/ ctx[3]);
    			add_location(div1, file, 56, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(itemActions_action = rendererActions.call(null, div1, {
    						item: /*item*/ ctx[1],
    						index: /*index*/ ctx[0]
    					})),
    					listen_dev(div1, "select", /*select_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "deselect", /*deselect_handler*/ ctx[6], false, false, false),
    					listen_dev(div1, "hover", /*hover_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*item*/ 2 && t0_value !== (t0_value = /*item*/ ctx[1].text + "")) set_data_dev(t0, t0_value);

    			if (/*isSelected*/ ctx[2] && /*isMultiple*/ ctx[4]) {
    				if (if_block) ; else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (itemActions_action && is_function(itemActions_action.update) && dirty & /*item, index*/ 3) itemActions_action.update.call(null, {
    				item: /*item*/ ctx[1],
    				index: /*index*/ ctx[0]
    			});

    			if (dirty & /*isDisabled*/ 8) {
    				toggle_class(div1, "is-disabled", /*isDisabled*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Item", slots, []);
    	let { index = -1 } = $$props;
    	let { item = {} } = $$props;
    	let { isSelected = false } = $$props;
    	let { isDisabled = false } = $$props;
    	let { isMultiple = false } = $$props;
    	const writable_props = ["index", "item", "isSelected", "isDisabled", "isMultiple"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	function select_handler(event) {
    		bubble($$self, event);
    	}

    	function deselect_handler(event) {
    		bubble($$self, event);
    	}

    	function hover_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("isSelected" in $$props) $$invalidate(2, isSelected = $$props.isSelected);
    		if ("isDisabled" in $$props) $$invalidate(3, isDisabled = $$props.isDisabled);
    		if ("isMultiple" in $$props) $$invalidate(4, isMultiple = $$props.isMultiple);
    	};

    	$$self.$capture_state = () => ({
    		itemActions: rendererActions,
    		index,
    		item,
    		isSelected,
    		isDisabled,
    		isMultiple
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("isSelected" in $$props) $$invalidate(2, isSelected = $$props.isSelected);
    		if ("isDisabled" in $$props) $$invalidate(3, isDisabled = $$props.isDisabled);
    		if ("isMultiple" in $$props) $$invalidate(4, isMultiple = $$props.isMultiple);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		index,
    		item,
    		isSelected,
    		isDisabled,
    		isMultiple,
    		select_handler,
    		deselect_handler,
    		hover_handler
    	];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			index: 0,
    			item: 1,
    			isSelected: 2,
    			isDisabled: 3,
    			isMultiple: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get index() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSelected() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSelected(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isMultiple() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isMultiple(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /**
     * sifter.js
     * Copyright (c) 2013–2020 Brian Reavis & contributors
     *
     * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
     * file except in compliance with the License. You may obtain a copy of the License at:
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software distributed under
     * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
     * ANY KIND, either express or implied. See the License for the specific language
     * governing permissions and limitations under the License.
     *
     * @author Brian Reavis <brian@thirdroute.com>
     */

    /**
     * Textually searches arrays and hashes of objects
     * by property (or multiple properties). Designed
     * specifically for autocomplete.
     *
     * @constructor
     * @param {array|object} items
     * @param {object} items
     */
    var Sifter = function(items, settings) {
        this.items = items;
        this.settings = settings || {diacritics: true};
    };

    /**
     * Splits a search string into an array of individual
     * regexps to be used to match results.
     *
     * @param {string} query
     * @returns {array}
     */
    Sifter.prototype.tokenize = function(query, respect_word_boundaries) {
        query = trim(String(query || '').toLowerCase());
        if (!query || !query.length) return [];

        var i, n, regex, letter;
        var tokens = [];
        var words = query.split(/ +/);

        for (i = 0, n = words.length; i < n; i++) {
            regex = escape_regex(words[i]);
            if (this.settings.diacritics) {
                for (letter in DIACRITICS) {
                    if (DIACRITICS.hasOwnProperty(letter)) {
                        regex = regex.replace(new RegExp(letter, 'g'), DIACRITICS[letter]);
                    }
                }
            }
            if (respect_word_boundaries) regex = "\\b"+regex;
            tokens.push({
                string : words[i],
                regex  : new RegExp(regex, 'i')
            });
        }

        return tokens;
    };

    /**
     * Iterates over arrays and hashes.
     *
     * ```
     * this.iterator(this.items, function(item, id) {
     *    // invoked for each item
     * });
     * ```
     *
     * @param {array|object} object
     */
    Sifter.prototype.iterator = function(object, callback) {
        var iterator;
        if (is_array(object)) {
            iterator = Array.prototype.forEach || function(callback) {
                for (var i = 0, n = this.length; i < n; i++) {
                    callback(this[i], i, this);
                }
            };
        } else {
            iterator = function(callback) {
                for (var key in this) {
                    if (this.hasOwnProperty(key)) {
                        callback(this[key], key, this);
                    }
                }
            };
        }

        iterator.apply(object, [callback]);
    };

    /**
     * Returns a function to be used to score individual results.
     *
     * Good matches will have a higher score than poor matches.
     * If an item is not a match, 0 will be returned by the function.
     *
     * @param {object|string} search
     * @param {object} options (optional)
     * @returns {function}
     */
    Sifter.prototype.getScoreFunction = function(search, options) {
        var self, fields, tokens, token_count, nesting;

        self        = this;
        search      = self.prepareSearch(search, options);
        tokens      = search.tokens;
        fields      = search.options.fields;
        token_count = tokens.length;
        nesting     = search.options.nesting;

        /**
         * Calculates how close of a match the
         * given value is against a search token.
         *
         * @param {mixed} value
         * @param {object} token
         * @return {number}
         */
        var scoreValue = function(value, token) {
            var score, pos;

            if (!value) return 0;
            value = String(value || '');
            pos = value.search(token.regex);
            if (pos === -1) return 0;
            score = token.string.length / value.length;
            if (pos === 0) score += 0.5;
            return score;
        };

        /**
         * Calculates the score of an object
         * against the search query.
         *
         * @param {object} token
         * @param {object} data
         * @return {number}
         */
        var scoreObject = (function() {
            var field_count = fields.length;
            if (!field_count) {
                return function() { return 0; };
            }
            if (field_count === 1) {
                return function(token, data) {
                    return scoreValue(getattr(data, fields[0], nesting), token);
                };
            }
            return function(token, data) {
                for (var i = 0, sum = 0; i < field_count; i++) {
                    sum += scoreValue(getattr(data, fields[i], nesting), token);
                }
                return sum / field_count;
            };
        })();

        if (!token_count) {
            return function() { return 0; };
        }
        if (token_count === 1) {
            return function(data) {
                return scoreObject(tokens[0], data);
            };
        }

        if (search.options.conjunction === 'and') {
            return function(data) {
                var score;
                for (var i = 0, sum = 0; i < token_count; i++) {
                    score = scoreObject(tokens[i], data);
                    if (score <= 0) return 0;
                    sum += score;
                }
                return sum / token_count;
            };
        } else {
            return function(data) {
                for (var i = 0, sum = 0; i < token_count; i++) {
                    sum += scoreObject(tokens[i], data);
                }
                return sum / token_count;
            };
        }
    };

    /**
     * Returns a function that can be used to compare two
     * results, for sorting purposes. If no sorting should
     * be performed, `null` will be returned.
     *
     * @param {string|object} search
     * @param {object} options
     * @return function(a,b)
     */
    Sifter.prototype.getSortFunction = function(search, options) {
        var i, n, self, field, fields, fields_count, multiplier, multipliers, get_field, implicit_score, sort;

        self   = this;
        search = self.prepareSearch(search, options);
        sort   = (!search.query && options.sort_empty) || options.sort;

        /**
         * Fetches the specified sort field value
         * from a search result item.
         *
         * @param  {string} name
         * @param  {object} result
         * @return {mixed}
         */
        get_field = function(name, result) {
            if (name === '$score') return result.score;
            return getattr(self.items[result.id], name, options.nesting);
        };

        // parse options
        fields = [];
        if (sort) {
            for (i = 0, n = sort.length; i < n; i++) {
                if (search.query || sort[i].field !== '$score') {
                    fields.push(sort[i]);
                }
            }
        }

        // the "$score" field is implied to be the primary
        // sort field, unless it's manually specified
        if (search.query) {
            implicit_score = true;
            for (i = 0, n = fields.length; i < n; i++) {
                if (fields[i].field === '$score') {
                    implicit_score = false;
                    break;
                }
            }
            if (implicit_score) {
                fields.unshift({field: '$score', direction: 'desc'});
            }
        } else {
            for (i = 0, n = fields.length; i < n; i++) {
                if (fields[i].field === '$score') {
                    fields.splice(i, 1);
                    break;
                }
            }
        }

        multipliers = [];
        for (i = 0, n = fields.length; i < n; i++) {
            multipliers.push(fields[i].direction === 'desc' ? -1 : 1);
        }

        // build function
        fields_count = fields.length;
        if (!fields_count) {
            return null;
        } else if (fields_count === 1) {
            field = fields[0].field;
            multiplier = multipliers[0];
            return function(a, b) {
                return multiplier * cmp(
                    get_field(field, a),
                    get_field(field, b)
                );
            };
        } else {
            return function(a, b) {
                var i, result, field;
                for (i = 0; i < fields_count; i++) {
                    field = fields[i].field;
                    result = multipliers[i] * cmp(
                        get_field(field, a),
                        get_field(field, b)
                    );
                    if (result) return result;
                }
                return 0;
            };
        }
    };

    /**
     * Parses a search query and returns an object
     * with tokens and fields ready to be populated
     * with results.
     *
     * @param {string} query
     * @param {object} options
     * @returns {object}
     */
    Sifter.prototype.prepareSearch = function(query, options) {
        if (typeof query === 'object') return query;

        options = extend({}, options);

        var option_fields     = options.fields;
        var option_sort       = options.sort;
        var option_sort_empty = options.sort_empty;

        if (option_fields && !is_array(option_fields)) options.fields = [option_fields];
        if (option_sort && !is_array(option_sort)) options.sort = [option_sort];
        if (option_sort_empty && !is_array(option_sort_empty)) options.sort_empty = [option_sort_empty];

        return {
            options : options,
            query   : String(query || '').toLowerCase(),
            tokens  : this.tokenize(query, options.respect_word_boundaries),
            total   : 0,
            items   : []
        };
    };

    /**
     * Searches through all items and returns a sorted array of matches.
     *
     * The `options` parameter can contain:
     *
     *   - fields {string|array}
     *   - sort {array}
     *   - score {function}
     *   - filter {bool}
     *   - limit {integer}
     *
     * Returns an object containing:
     *
     *   - options {object}
     *   - query {string}
     *   - tokens {array}
     *   - total {int}
     *   - items {array}
     *
     * @param {string} query
     * @param {object} options
     * @returns {object}
     */
    Sifter.prototype.search = function(query, options) {
        var self = this, score, search;
        var fn_sort;
        var fn_score;

        search  = this.prepareSearch(query, options);
        options = search.options;
        query   = search.query;

        // generate result scoring function
        fn_score = options.score || self.getScoreFunction(search);

        // perform search and sort
        if (query.length) {
            self.iterator(self.items, function(item, id) {
                score = fn_score(item);
                if (options.filter === false || score > 0) {
                    search.items.push({'score': score, 'id': id});
                }
            });
        } else {
            self.iterator(self.items, function(item, id) {
                search.items.push({'score': 1, 'id': id});
            });
        }

        fn_sort = self.getSortFunction(search, options);
        if (fn_sort) search.items.sort(fn_sort);

        // apply limits
        search.total = search.items.length;
        if (typeof options.limit === 'number') {
            search.items = search.items.slice(0, options.limit);
        }

        return search;
    };

    // utilities
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    var cmp = function(a, b) {
        if (typeof a === 'number' && typeof b === 'number') {
            return a > b ? 1 : (a < b ? -1 : 0);
        }
        a = asciifold(String(a || ''));
        b = asciifold(String(b || ''));
        if (a > b) return 1;
        if (b > a) return -1;
        return 0;
    };

    var extend = function(a, b) {
        var i, n, k, object;
        for (i = 1, n = arguments.length; i < n; i++) {
            object = arguments[i];
            if (!object) continue;
            for (k in object) {
                if (object.hasOwnProperty(k)) {
                    a[k] = object[k];
                }
            }
        }
        return a;
    };

    /**
     * A property getter resolving dot-notation
     * @param  {Object}  obj     The root object to fetch property on
     * @param  {String}  name    The optionally dotted property name to fetch
     * @param  {Boolean} nesting Handle nesting or not
     * @return {Object}          The resolved property value
     */
    var getattr = function(obj, name, nesting) {
        if (!obj || !name) return;
        if (!nesting) return obj[name];
        var names = name.split(".");
        while(names.length && (obj = obj[names.shift()]));
        return obj;
    };

    var trim = function(str) {
        return (str + '').replace(/^\s+|\s+$|/g, '');
    };

    var escape_regex = function(str) {
        return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    };

    var is_array = Array.isArray || (typeof $ !== 'undefined' && $.isArray) || function(object) {
        return Object.prototype.toString.call(object) === '[object Array]';
    };

    var DIACRITICS = {
        'a': '[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]',
        'b': '[b␢βΒB฿𐌁ᛒ]',
        'c': '[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]',
        'd': '[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]',
        'e': '[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]',
        'f': '[fƑƒḞḟ]',
        'g': '[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]',
        'h': '[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]',
        'i': '[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]',
        'j': '[jȷĴĵɈɉʝɟʲ]',
        'k': '[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]',
        'l': '[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]',
        'n': '[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]',
        'o': '[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]',
        'p': '[pṔṕṖṗⱣᵽƤƥᵱ]',
        'q': '[qꝖꝗʠɊɋꝘꝙq̃]',
        'r': '[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]',
        's': '[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]',
        't': '[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]',
        'u': '[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]',
        'v': '[vṼṽṾṿƲʋꝞꝟⱱʋ]',
        'w': '[wẂẃẀẁŴŵẄẅẆẇẈẉ]',
        'x': '[xẌẍẊẋχ]',
        'y': '[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]',
        'z': '[zŹźẐẑŽžŻżẒẓẔẕƵƶ]'
    };

    var asciifold = (function() {
        var i, n, k, chunk;
        var foreignletters = '';
        var lookup = {};
        for (k in DIACRITICS) {
            if (DIACRITICS.hasOwnProperty(k)) {
                chunk = DIACRITICS[k].substring(2, DIACRITICS[k].length - 1);
                foreignletters += chunk;
                for (i = 0, n = chunk.length; i < n; i++) {
                    lookup[chunk.charAt(i)] = k;
                }
            }
        }
        var regexp = new RegExp('[' +  foreignletters + ']', 'g');
        return function(str) {
            return str.replace(regexp, function(foreignletter) {
                return lookup[foreignletter];
            }).toLowerCase();
        };
    })();

    // source: https://github.com/rob-balfre/svelte-select/blob/master/src/utils/isOutOfViewport.js
    function isOutOfViewport(elem) {
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = bounding.top < 0 || bounding.top - bounding.height < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;

      return out;
    }
    function fetchRemote(url) {
      return function(query) {
        return new Promise((resolve, reject) => {
            if (!query) return [];
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `${url.replace('[query]', encodeURIComponent(query))}`);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.send();
            
            xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                  const resp = JSON.parse(xhr.response);
                  resolve(resp.data || resp.items || resp.options || resp);
                } else {
                  reject();
                }
              } 
            };
        });
      }
    }

    let timeout;
    function debounce(fn, delay) {
    	return function() {
    		const self = this;
    		const args = arguments;
    		clearTimeout(timeout);
    		timeout = setTimeout(function() {
    			fn.apply(self, args);
    		}, delay);
    	};
    }

    const key = {};

    function getFilterProps(object) {
      if (object.options) object = object.options[0];
      const exclude = ['value', 'isSelected', 'isDisabled' ,'selected', 'disabled'];
      return Object.keys(object).filter(prop => !exclude.includes(prop));
    }

    function setToggleHelper(o) {
      if (this.has(o)) {
        !o.isSelected && this.delete(o);
      } else {
        o.isSelected && this.add(o);
      }
    }

    const initStore = (options, _settings, fetchRemote) => {
      console.log('init', options.length);
      const settings = _settings;
      const dropdownMessages = {
        empty: 'No options',
        nomatch: 'No matching options',
        get max() { return `Maximum items (${settings.max}) selected` },
        fetchBefore: 'Type to search',
        fetchWait: 'Stop typing to search',
        fetchRemote: 'Fetching results...',
        fetchEmpty: 'No data related to your search'
      };

      const inputValue = writable('');
      const isFetchingData = writable(false);
      const hasFocus = writable(false);
      const hasDropdownOpened = writable(false);
      const hasRemoteData = fetchRemote ? true : false;
      const listMessage = writable(fetchRemote ? dropdownMessages.fetchBefore : dropdownMessages.empty); // default

      // automatically select all object fields for sifter filter
      // FUTURE: make this configurable  
      const sifterFilterFields = getFilterProps(options.length > 1 ? options[1] : ['text']);
      const _sifterDefaultSort = [{ field: 'text', direction: 'asc'}];

      const opts = writable(options);

      const internalSelection = new Set();
      const selectionToggle = setToggleHelper.bind(internalSelection);
      // init selection
      options.forEach(opt => opt.isSelected && internalSelection.add(opt));

      if (hasRemoteData) {
        const debouncedFetch = debounce(query => {
          isFetchingData.set(true);
          listMessage.set(dropdownMessages.fetchRemote);
          fetchRemote(query)
            .then(data => {
              internalSelection.size && internalSelection.forEach(s => {
                data.forEach((o, i) => {
                  if (o.value === s.value) data.splice(i, 1);
                });
                data.push(s);
              });
              opts.set(data);
              opts.update(data => data);
            })
            .catch(() => opts.update(() => []))
            .finally(() => {
              isFetchingData.set(false);
              listMessage.set(dropdownMessages.fetchEmpty);
            });
        }, 300);
        /** ************************************ define search-triggered fetch */
        onDestroy(
          inputValue.subscribe(value => {
            if (!value) {
              hasRemoteData && listMessage.set(dropdownMessages.fetchBefore);
              return;
            }
            listMessage.set(dropdownMessages.fetchWait);
            debouncedFetch(value);
          })
        );
      }

      /** ************************************ flat option array */
      const flatOptions = derived(opts, ($opts, set) => {
        set($opts.reduce((res, opt) => {
          if (opt.options) {
            res.push(...opt.options);
            return res;
          }
          res.push(opt);
          return res;
        }, []));
      });

      /** ************************************ sifter sort function (disabled when groups are present) */
      const optionsWithGroups = options.some(opt => opt.options);
      let sifterFilterSort = settings.searchMode === 'auto' && optionsWithGroups
        ? false
        : _sifterDefaultSort;

      /** ************************************ filtered results */
      // NOTE: this is dependant on data source (remote or not)
      const matchingOptions = hasRemoteData ? opts : derived([flatOptions, opts, inputValue], 
        ([$flatOptions, $opts, $inputValue], set) => {
          // set empty when max is reached
          if (settings.max && internalSelection.size === settings.max) {
            listMessage.set(dropdownMessages.max);
            set([]);
            return;
          }
          if ($inputValue === '') {
            return settings.multiple
              ? set($opts.reduce((res, opt) => {
                if (opt.options) {
                  if (!opt.isDisabled) {
                    const filteredOpts = opt.options.filter(o => !o.isSelected);
                    if (filteredOpts.length) {
                      res.push({
                        label: opt.label,
                        options: filteredOpts
                      });
                    }
                  }
                } else {
                  !opt.isSelected && res.push(opt);
                }
                return res;
              }, []))
              : set($opts);
          }
          /**
           * Sifter is used for searching to provide rich filter functionality.
           * But it degradate nicely, when optgroups are present
           */
          const sifter = new Sifter($flatOptions);
          if (optionsWithGroups) {  // disable sorting 
            sifter.getSortFunction = () => null;
          }
          const result = sifter.search($inputValue, {
            fields: sifterFilterFields,
            sort: sifterFilterSort
          });
          let mapped = result.items.map(item => $flatOptions[item.id]);
          if (optionsWithGroups) {
            let _s = mapped.shift();
            mapped = $opts.reduce((res, opt) => {
              if (opt === _s && !opt.isSelected) {
                _s = mapped.shift();
                res.push(opt);
              }
              if (opt.options) {
                const subopts = [];
                opt.options.forEach(o => {
                  if (o === _s && !o.isSelected) {
                    subopts.push(o);
                    _s = mapped.shift();
                  }
                });
                subopts.length && res.push({ label: opt.label, options: subopts });
              }
              return res;
            }, []);
          }
          set(mapped.filter(item => !item.isSelected));
        }
      );

      const listIndexMap = derived(matchingOptions, ($matchingOptions, set) => {
        let base = 0;
        let groupIndex = 0;
        let offset = 0;
        set(
          $matchingOptions.reduce((res, opt, idx) => {
            if (opt.options) {  // optGroup
              if (opt.isDisabled) { 
                res.push('');
                return res;
              }
              res.push(opt.options.map(o => {
                if (o.isDisabled) return '';       
                return offset++ + groupIndex;
              }));
              return res;
            }
            groupIndex++;
            if (opt.isDisabled) {
              res.push(''); 
              return res;
            }
            res.push(offset + base++); // increment
            return res;
          }, [])
        );
      });

      /** ************************************ for keyboard navigation even through opt-groups */
      const flatMatching = !optionsWithGroups
        ? matchingOptions
        : derived([matchingOptions, flatOptions, inputValue], ([$matchingOptions, $flatOptions, $inputValue], set) => {
        const flatList = $inputValue !== ''
          ? $matchingOptions.reduce((res, opt) => {
              if (opt.options) {
                res.push(...opt.options);
                return res;
              }
              res.push(opt);
              return res;
            }, [])
          : (settings.multiple ? $flatOptions.filter(o => !o.isSelected) : $flatOptions);
        set(flatList.filter(o => !o.isDisabled));
      });

      /** ************************************ selection set */
      const selectedOptions = derived(opts, ($opts, set) => {
        if (!settings.multiple) internalSelection.clear();
        $opts.forEach(o => {
          if (o.options) {
            !o.isDisabled && o.options.forEach(selectionToggle);
            return;
          }
          selectionToggle(o);
        });
        set(Array.from(internalSelection));
      }, Array.from(internalSelection));

      /***************************************************************/
      /**                    options exposed API                     */
      /***************************************************************/

      const selectOption = option => {
        if (settings.max && internalSelection.size === settings.max) return;
        opts.update(list => {
          if (!settings.multiple) {
            internalSelection.forEach(opt => {
              opt.isSelected = false;
              settings.creatable && opt._created && list.splice(list.indexOf(opt), 1);
            });
          }
          if (typeof option === 'string') {
            option = {
              text: option,
              value: encodeURIComponent(option),
              isSelected: false,
              _created: true,
            };
            list.push(option);
          }
          option.isSelected = true;
          return list;
        });
      };
      const deselectOption = option => opts.update(list => {
        option.isSelected = false;
        if (option._created) {
          internalSelection.delete(option);
          list.splice(list.indexOf(option), 1);
        } 
        return list;
      });
      const clearSelection = () => opts.update(list => {
        list.forEach(opt => {
          if (opt.options) {
            opt.options.forEach(o => o.isSelected = false);
          } else {
            opt.isSelected = false;
            if (opt._created) {
              internalSelection.delete(opt);
              list.splice(list.indexOf(opt), 1);
            }
          }
        });
        return list;
      });

      const listLength = derived(opts, ($opts, set) => {
        set(
          $opts.reduce((res, opt) => {
            res += opt.options ? opt.options.length : 1;
            return res;
          }, 0)
        );
      });
      const currentListLength = derived([inputValue, flatMatching], ([$inputValue, $flatMatching], set) => {
        set(settings.creatable && $inputValue ? $flatMatching.length : $flatMatching.length - 1);
      });

      return {
        /** context stores */
        hasFocus,
        hasDropdownOpened,
        inputValue,
        isFetchingData,
        listMessage,
        /** options:actions **/
        selectOption,
        deselectOption,
        clearSelection,
        /** options:getters **/
        listLength,
        listIndexMap,
        matchingOptions,
        flatMatching,
        currentListLength,
        selectedOptions,
        _set: opts.set
      }
    };

    const settings = {

      /** ************************************ sub-component props */
      /* HTML related */
      name: null, // if name is defined, <select> element is created as well
      
      required: false,
      multiple: false,
      searchable: true,     // TODO: implement
      disabled: false,
      creatable: false,
      clearable: false,
      selectOnTab: false,
      placeholder: 'Select',
      valueField: 'value',  // TODO: implement
      labelField: 'text',   // TODO: implement
      searchMode: 'auto',   // TODO: implement - means, when there are optgroups, don't use Sifter
      max: 0,
      renderer: 'default',
    };

    /* src\Svelecte\components\Input.svelte generated by Svelte v3.25.0 */
    const file$1 = "src\\Svelecte\\components\\Input.svelte";

    function create_fragment$1(ctx) {
    	let input;
    	let input_readonly_value;
    	let t0;
    	let div;
    	let t1;
    	let div_resize_listener;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			div = element("div");
    			t1 = text(/*shadowText*/ ctx[5]);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "inputBox svelte-1gxxklk");
    			input.disabled = /*disabled*/ ctx[1];
    			input.readOnly = input_readonly_value = !/*searchable*/ ctx[0];
    			attr_dev(input, "style", /*inputStyle*/ ctx[7]);
    			attr_dev(input, "placeholder", /*placeholderText*/ ctx[4]);
    			add_location(input, file$1, 25, 0, 697);
    			attr_dev(div, "class", "shadow-text svelte-1gxxklk");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[16].call(div));
    			add_location(div, file$1, 35, 0, 994);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[14](input);
    			set_input_value(input, /*$inputValue*/ ctx[6]);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, t1);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[16].bind(div));

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[15]),
    					listen_dev(input, "focus", stop_propagation(/*dispatchEvent*/ ctx[10]), false, false, true),
    					listen_dev(input, "blur", stop_propagation(/*dispatchEvent*/ ctx[10]), false, false, true),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 2) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (dirty & /*searchable*/ 1 && input_readonly_value !== (input_readonly_value = !/*searchable*/ ctx[0])) {
    				prop_dev(input, "readOnly", input_readonly_value);
    			}

    			if (dirty & /*inputStyle*/ 128) {
    				attr_dev(input, "style", /*inputStyle*/ ctx[7]);
    			}

    			if (dirty & /*placeholderText*/ 16) {
    				attr_dev(input, "placeholder", /*placeholderText*/ ctx[4]);
    			}

    			if (dirty & /*$inputValue*/ 64 && input.value !== /*$inputValue*/ ctx[6]) {
    				set_input_value(input, /*$inputValue*/ ctx[6]);
    			}

    			if (dirty & /*shadowText*/ 32) set_data_dev(t1, /*shadowText*/ ctx[5]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[14](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    			div_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $selectedOptions;
    	let $inputValue;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	const focus = () => inputRef.focus();
    	let { placeholder } = $$props;
    	let { searchable } = $$props;
    	let { disabled } = $$props;
    	let inputRef = null;
    	let shadowWidth = 0;
    	const dispatch = createEventDispatcher();
    	const { inputValue, selectedOptions } = getContext(key);
    	validate_store(inputValue, "inputValue");
    	component_subscribe($$self, inputValue, value => $$invalidate(6, $inputValue = value));
    	validate_store(selectedOptions, "selectedOptions");
    	component_subscribe($$self, selectedOptions, value => $$invalidate(17, $selectedOptions = value));

    	function dispatchEvent(event) {
    		dispatch(event.type);
    	}

    	const writable_props = ["placeholder", "searchable", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputRef = $$value;
    			$$invalidate(2, inputRef);
    		});
    	}

    	function input_input_handler() {
    		$inputValue = this.value;
    		inputValue.set($inputValue);
    	}

    	function div_elementresize_handler() {
    		shadowWidth = this.clientWidth;
    		$$invalidate(3, shadowWidth);
    	}

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(12, placeholder = $$props.placeholder);
    		if ("searchable" in $$props) $$invalidate(0, searchable = $$props.searchable);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		createEventDispatcher,
    		key,
    		focus,
    		placeholder,
    		searchable,
    		disabled,
    		inputRef,
    		shadowWidth,
    		dispatch,
    		inputValue,
    		selectedOptions,
    		dispatchEvent,
    		placeholderText,
    		$selectedOptions,
    		shadowText,
    		$inputValue,
    		inputStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(12, placeholder = $$props.placeholder);
    		if ("searchable" in $$props) $$invalidate(0, searchable = $$props.searchable);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ("inputRef" in $$props) $$invalidate(2, inputRef = $$props.inputRef);
    		if ("shadowWidth" in $$props) $$invalidate(3, shadowWidth = $$props.shadowWidth);
    		if ("placeholderText" in $$props) $$invalidate(4, placeholderText = $$props.placeholderText);
    		if ("shadowText" in $$props) $$invalidate(5, shadowText = $$props.shadowText);
    		if ("inputStyle" in $$props) $$invalidate(7, inputStyle = $$props.inputStyle);
    	};

    	let placeholderText;
    	let shadowText;
    	let inputStyle;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedOptions, placeholder*/ 135168) {
    			 $$invalidate(4, placeholderText = $selectedOptions.length ? "" : placeholder);
    		}

    		if ($$self.$$.dirty & /*$inputValue, placeholder*/ 4160) {
    			 $$invalidate(5, shadowText = $inputValue || placeholder);
    		}

    		if ($$self.$$.dirty & /*shadowWidth*/ 8) {
    			 $$invalidate(7, inputStyle = `width: ${shadowWidth + 19}px`);
    		}
    	};

    	return [
    		searchable,
    		disabled,
    		inputRef,
    		shadowWidth,
    		placeholderText,
    		shadowText,
    		$inputValue,
    		inputStyle,
    		inputValue,
    		selectedOptions,
    		dispatchEvent,
    		focus,
    		placeholder,
    		keydown_handler,
    		input_binding,
    		input_input_handler,
    		div_elementresize_handler
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			focus: 11,
    			placeholder: 12,
    			searchable: 0,
    			disabled: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*placeholder*/ ctx[12] === undefined && !("placeholder" in props)) {
    			console.warn("<Input> was created without expected prop 'placeholder'");
    		}

    		if (/*searchable*/ ctx[0] === undefined && !("searchable" in props)) {
    			console.warn("<Input> was created without expected prop 'searchable'");
    		}

    		if (/*disabled*/ ctx[1] === undefined && !("disabled" in props)) {
    			console.warn("<Input> was created without expected prop 'disabled'");
    		}
    	}

    	get focus() {
    		return this.$$.ctx[11];
    	}

    	set focus(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchable() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchable(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Svelecte\components\Control.svelte generated by Svelte v3.25.0 */
    const file$2 = "src\\Svelecte\\components\\Control.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	return child_ctx;
    }

    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (52:4) {#if $selectedOptions.length }
    function create_if_block_2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$selectedOptions*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*renderer, $selectedOptions, multiple*/ 548) {
    				each_value = /*$selectedOptions*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(52:4) {#if $selectedOptions.length }",
    		ctx
    	});

    	return block;
    }

    // (53:6) {#each $selectedOptions as opt}
    function create_each_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*renderer*/ ctx[2];

    	function switch_props(ctx) {
    		return {
    			props: {
    				item: /*opt*/ ctx[29],
    				isSelected: true,
    				isMultiple: /*multiple*/ ctx[5]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("deselect", /*deselect_handler*/ ctx[22]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*$selectedOptions*/ 512) switch_instance_changes.item = /*opt*/ ctx[29];
    			if (dirty[0] & /*multiple*/ 32) switch_instance_changes.isMultiple = /*multiple*/ ctx[5];

    			if (switch_value !== (switch_value = /*renderer*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("deselect", /*deselect_handler*/ ctx[22]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(53:6) {#each $selectedOptions as opt}",
    		ctx
    	});

    	return block;
    }

    // (67:4) {#if clearable && $selectedOptions.length && !disabled}
    function create_if_block_1(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z");
    			add_location(path, file$2, 71, 114, 2224);
    			attr_dev(svg, "class", "indicator-icon svelte-1nux2wg");
    			attr_dev(svg, "height", "20");
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			add_location(svg, file$2, 71, 6, 2116);
    			attr_dev(div, "aria-hidden", "true");
    			attr_dev(div, "class", "indicator-container close-icon svelte-1nux2wg");
    			add_location(div, file$2, 67, 4, 1959);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", prevent_default(/*mousedown_handler_1*/ ctx[21]), false, true, false),
    					listen_dev(div, "click", /*click_handler*/ ctx[25], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(67:4) {#if clearable && $selectedOptions.length && !disabled}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if clearable}
    function create_if_block$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			attr_dev(span, "class", "indicator-separator svelte-1nux2wg");
    			add_location(span, file$2, 75, 4, 2644);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(75:4) {#if clearable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let t0;
    	let div0;
    	let t1;
    	let input;
    	let t2;
    	let div2;
    	let t3;
    	let t4;
    	let div1;
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[18].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[17], get_icon_slot_context);
    	let if_block0 = /*$selectedOptions*/ ctx[9].length && create_if_block_2(ctx);

    	let input_props = {
    		disabled: /*disabled*/ ctx[3],
    		searchable: /*searchable*/ ctx[1],
    		placeholder: /*placeholder*/ ctx[4]
    	};

    	input = new Input({ props: input_props, $$inline: true });
    	/*input_binding*/ ctx[23](input);
    	input.$on("focus", /*onFocus*/ ctx[15]);
    	input.$on("blur", /*onBlur*/ ctx[16]);
    	input.$on("keydown", /*keydown_handler*/ ctx[24]);
    	let if_block1 = /*clearable*/ ctx[0] && /*$selectedOptions*/ ctx[9].length && !/*disabled*/ ctx[3] && create_if_block_1(ctx);
    	let if_block2 = /*clearable*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			if (icon_slot) icon_slot.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			create_component(input.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			t4 = space();
    			div1 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(div0, "class", "content svelte-1nux2wg");
    			toggle_class(div0, "has-multiSelection", /*multiple*/ ctx[5]);
    			add_location(div0, file$2, 50, 2, 1360);
    			attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
    			add_location(path, file$2, 79, 8, 2896);
    			attr_dev(svg, "width", "20");
    			attr_dev(svg, "class", "indicator-icon svelte-1nux2wg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			add_location(svg, file$2, 78, 6, 2790);
    			attr_dev(div1, "aria-hidden", "true");
    			attr_dev(div1, "class", "indicator-container svelte-1nux2wg");
    			add_location(div1, file$2, 77, 4, 2702);
    			attr_dev(div2, "class", "indicator svelte-1nux2wg");
    			add_location(div2, file$2, 65, 2, 1869);
    			attr_dev(div3, "class", "control svelte-1nux2wg");
    			toggle_class(div3, "is-active", /*$hasFocus*/ ctx[8]);
    			toggle_class(div3, "is-disabled", /*disabled*/ ctx[3]);
    			add_location(div3, file$2, 44, 0, 1144);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);

    			if (icon_slot) {
    				icon_slot.m(div3, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t1);
    			mount_component(input, div0, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			if (if_block1) if_block1.m(div2, null);
    			append_dev(div2, t3);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, svg);
    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "mousedown", prevent_default(/*mousedown_handler_2*/ ctx[20]), false, true, false),
    					listen_dev(div3, "mousedown", prevent_default(/*mousedown_handler*/ ctx[19]), false, true, false),
    					listen_dev(div3, "click", prevent_default(/*focusControl*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (icon_slot) {
    				if (icon_slot.p && dirty[0] & /*$$scope*/ 131072) {
    					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[17], dirty, get_icon_slot_changes, get_icon_slot_context);
    				}
    			}

    			if (/*$selectedOptions*/ ctx[9].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*$selectedOptions*/ 512) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const input_changes = {};
    			if (dirty[0] & /*disabled*/ 8) input_changes.disabled = /*disabled*/ ctx[3];
    			if (dirty[0] & /*searchable*/ 2) input_changes.searchable = /*searchable*/ ctx[1];
    			if (dirty[0] & /*placeholder*/ 16) input_changes.placeholder = /*placeholder*/ ctx[4];
    			input.$set(input_changes);

    			if (dirty[0] & /*multiple*/ 32) {
    				toggle_class(div0, "has-multiSelection", /*multiple*/ ctx[5]);
    			}

    			if (/*clearable*/ ctx[0] && /*$selectedOptions*/ ctx[9].length && !/*disabled*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(div2, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*clearable*/ ctx[0]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					if_block2.m(div2, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*$hasFocus*/ 256) {
    				toggle_class(div3, "is-active", /*$hasFocus*/ ctx[8]);
    			}

    			if (dirty[0] & /*disabled*/ 8) {
    				toggle_class(div3, "is-disabled", /*disabled*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			transition_in(if_block0);
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			transition_out(if_block0);
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (icon_slot) icon_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			/*input_binding*/ ctx[23](null);
    			destroy_component(input);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $hasFocus;
    	let $hasDropdownOpened;
    	let $inputValue;
    	let $selectedOptions;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Control", slots, ['icon']);
    	let { clearable } = $$props;
    	let { searchable } = $$props;
    	let { renderer } = $$props;
    	let { disabled } = $$props;
    	let { placeholder } = $$props;
    	let { multiple } = $$props;

    	function focusControl(event) {
    		if (disabled) return;

    		if (!event) {
    			!$hasFocus && refInput.focus();
    			set_store_value(hasDropdownOpened, $hasDropdownOpened = true);
    			return;
    		}

    		if (!$hasFocus) {
    			refInput.focus();
    		} else {
    			set_store_value(hasDropdownOpened, $hasDropdownOpened = !$hasDropdownOpened);
    		}
    	}

    	/** ************************************ context */
    	const dispatch = createEventDispatcher();

    	const { inputValue, hasFocus, hasDropdownOpened, selectedOptions } = getContext(key);
    	validate_store(inputValue, "inputValue");
    	component_subscribe($$self, inputValue, value => $$invalidate(28, $inputValue = value));
    	validate_store(hasFocus, "hasFocus");
    	component_subscribe($$self, hasFocus, value => $$invalidate(8, $hasFocus = value));
    	validate_store(hasDropdownOpened, "hasDropdownOpened");
    	component_subscribe($$self, hasDropdownOpened, value => $$invalidate(26, $hasDropdownOpened = value));
    	validate_store(selectedOptions, "selectedOptions");
    	component_subscribe($$self, selectedOptions, value => $$invalidate(9, $selectedOptions = value));
    	let refInput = undefined;

    	function onFocus() {
    		set_store_value(hasFocus, $hasFocus = true);
    		set_store_value(hasDropdownOpened, $hasDropdownOpened = true);
    	}

    	function onBlur() {
    		set_store_value(hasFocus, $hasFocus = false);
    		set_store_value(hasDropdownOpened, $hasDropdownOpened = false);
    		set_store_value(inputValue, $inputValue = ""); // reset
    	}

    	const writable_props = ["clearable", "searchable", "renderer", "disabled", "placeholder", "multiple"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Control> was created with unknown prop '${key}'`);
    	});

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler_2(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler_1(event) {
    		bubble($$self, event);
    	}

    	function deselect_handler(event) {
    		bubble($$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			refInput = $$value;
    			$$invalidate(7, refInput);
    		});
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	const click_handler = () => dispatch("deselect");

    	$$self.$$set = $$props => {
    		if ("clearable" in $$props) $$invalidate(0, clearable = $$props.clearable);
    		if ("searchable" in $$props) $$invalidate(1, searchable = $$props.searchable);
    		if ("renderer" in $$props) $$invalidate(2, renderer = $$props.renderer);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("$$scope" in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		tick,
    		key,
    		Input,
    		clearable,
    		searchable,
    		renderer,
    		disabled,
    		placeholder,
    		multiple,
    		focusControl,
    		dispatch,
    		inputValue,
    		hasFocus,
    		hasDropdownOpened,
    		selectedOptions,
    		refInput,
    		onFocus,
    		onBlur,
    		$hasFocus,
    		$hasDropdownOpened,
    		showSelection,
    		$inputValue,
    		$selectedOptions
    	});

    	$$self.$inject_state = $$props => {
    		if ("clearable" in $$props) $$invalidate(0, clearable = $$props.clearable);
    		if ("searchable" in $$props) $$invalidate(1, searchable = $$props.searchable);
    		if ("renderer" in $$props) $$invalidate(2, renderer = $$props.renderer);
    		if ("disabled" in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("refInput" in $$props) $$invalidate(7, refInput = $$props.refInput);
    		if ("showSelection" in $$props) showSelection = $$props.showSelection;
    	};

    	let showSelection;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*multiple, $inputValue, $selectedOptions*/ 268436000) {
    			 showSelection = multiple
    			? true
    			: !$inputValue && $selectedOptions.length;
    		}
    	};

    	return [
    		clearable,
    		searchable,
    		renderer,
    		disabled,
    		placeholder,
    		multiple,
    		focusControl,
    		refInput,
    		$hasFocus,
    		$selectedOptions,
    		dispatch,
    		inputValue,
    		hasFocus,
    		hasDropdownOpened,
    		selectedOptions,
    		onFocus,
    		onBlur,
    		$$scope,
    		slots,
    		mousedown_handler,
    		mousedown_handler_2,
    		mousedown_handler_1,
    		deselect_handler,
    		input_binding,
    		keydown_handler,
    		click_handler
    	];
    }

    class Control extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				clearable: 0,
    				searchable: 1,
    				renderer: 2,
    				disabled: 3,
    				placeholder: 4,
    				multiple: 5,
    				focusControl: 6
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Control",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*clearable*/ ctx[0] === undefined && !("clearable" in props)) {
    			console.warn("<Control> was created without expected prop 'clearable'");
    		}

    		if (/*searchable*/ ctx[1] === undefined && !("searchable" in props)) {
    			console.warn("<Control> was created without expected prop 'searchable'");
    		}

    		if (/*renderer*/ ctx[2] === undefined && !("renderer" in props)) {
    			console.warn("<Control> was created without expected prop 'renderer'");
    		}

    		if (/*disabled*/ ctx[3] === undefined && !("disabled" in props)) {
    			console.warn("<Control> was created without expected prop 'disabled'");
    		}

    		if (/*placeholder*/ ctx[4] === undefined && !("placeholder" in props)) {
    			console.warn("<Control> was created without expected prop 'placeholder'");
    		}

    		if (/*multiple*/ ctx[5] === undefined && !("multiple" in props)) {
    			console.warn("<Control> was created without expected prop 'multiple'");
    		}
    	}

    	get clearable() {
    		throw new Error("<Control>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearable(value) {
    		throw new Error("<Control>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchable() {
    		throw new Error("<Control>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchable(value) {
    		throw new Error("<Control>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get renderer() {
    		throw new Error("<Control>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set renderer(value) {
    		throw new Error("<Control>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Control>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Control>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Control>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Control>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Control>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Control>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get focusControl() {
    		return this.$$.ctx[6];
    	}

    	set focusControl(value) {
    		throw new Error("<Control>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Svelecte\components\Dropdown.svelte generated by Svelte v3.25.0 */
    const file$3 = "src\\Svelecte\\components\\Dropdown.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	child_ctx[47] = i;
    	return child_ctx;
    }

    const get_dropdown_group_header_slot_changes = dirty => ({});
    const get_dropdown_group_header_slot_context = ctx => ({});

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	child_ctx[44] = i;
    	return child_ctx;
    }

    // (76:2) {#if $listLength}
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$matchingOptions*/ ctx[7];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$matchingOptions, $listIndexMap, dropdownIndex, renderer*/ 4236 | dirty[1] & /*$$scope*/ 8) {
    				each_value = /*$matchingOptions*/ ctx[7];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(76:2) {#if $listLength}",
    		ctx
    	});

    	return block;
    }

    // (96:6) {:else}
    function create_else_block(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let div_data_pos_value;
    	let current;
    	var switch_value = /*renderer*/ ctx[3];

    	function switch_props(ctx) {
    		return {
    			props: {
    				index: /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]],
    				isDisabled: /*opt*/ ctx[42].isDisabled,
    				item: /*opt*/ ctx[42]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("hover", /*hover_handler_1*/ ctx[30]);
    		switch_instance.$on("select", /*select_handler_1*/ ctx[31]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "data-pos", div_data_pos_value = /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]]);
    			toggle_class(div, "active", /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]] === /*dropdownIndex*/ ctx[2]);
    			add_location(div, file$3, 96, 6, 3567);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*$listIndexMap*/ 4096) switch_instance_changes.index = /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]];
    			if (dirty[0] & /*$matchingOptions*/ 128) switch_instance_changes.isDisabled = /*opt*/ ctx[42].isDisabled;
    			if (dirty[0] & /*$matchingOptions*/ 128) switch_instance_changes.item = /*opt*/ ctx[42];

    			if (dirty[1] & /*$$scope*/ 8) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderer*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("hover", /*hover_handler_1*/ ctx[30]);
    					switch_instance.$on("select", /*select_handler_1*/ ctx[31]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*$listIndexMap*/ 4096 && div_data_pos_value !== (div_data_pos_value = /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]])) {
    				attr_dev(div, "data-pos", div_data_pos_value);
    			}

    			if (dirty[0] & /*$listIndexMap, dropdownIndex*/ 4100) {
    				toggle_class(div, "active", /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]] === /*dropdownIndex*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(96:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (79:6) {#if opt.options && Array.isArray(opt.options)}
    function create_if_block_4(ctx) {
    	let div;
    	let t;
    	let each_1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const dropdown_group_header_slot_template = /*#slots*/ ctx[25]["dropdown-group-header"];
    	const dropdown_group_header_slot = create_slot(dropdown_group_header_slot_template, ctx, /*$$scope*/ ctx[34], get_dropdown_group_header_slot_context);
    	const dropdown_group_header_slot_or_fallback = dropdown_group_header_slot || fallback_block(ctx);
    	let each_value_1 = /*opt*/ ctx[42].options;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (dropdown_group_header_slot_or_fallback) dropdown_group_header_slot_or_fallback.c();
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(div, "class", "optgroup-header svelte-1od39di");
    			add_location(div, file$3, 79, 8, 2900);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (dropdown_group_header_slot_or_fallback) {
    				dropdown_group_header_slot_or_fallback.m(div, null);
    			}

    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "mousedown", prevent_default(/*mousedown_handler_1*/ ctx[27]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dropdown_group_header_slot) {
    				if (dropdown_group_header_slot.p && dirty[1] & /*$$scope*/ 8) {
    					update_slot(dropdown_group_header_slot, dropdown_group_header_slot_template, ctx, /*$$scope*/ ctx[34], dirty, get_dropdown_group_header_slot_changes, get_dropdown_group_header_slot_context);
    				}
    			} else {
    				if (dropdown_group_header_slot_or_fallback && dropdown_group_header_slot_or_fallback.p && dirty[0] & /*$matchingOptions*/ 128) {
    					dropdown_group_header_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			if (dirty[0] & /*$listIndexMap, dropdownIndex, renderer, $matchingOptions*/ 4236) {
    				each_value_1 = /*opt*/ ctx[42].options;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdown_group_header_slot_or_fallback, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdown_group_header_slot_or_fallback, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (dropdown_group_header_slot_or_fallback) dropdown_group_header_slot_or_fallback.d(detaching);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(79:6) {#if opt.options && Array.isArray(opt.options)}",
    		ctx
    	});

    	return block;
    }

    // (81:45) <b>
    function fallback_block(ctx) {
    	let b;
    	let t_value = /*opt*/ ctx[42].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			b = element("b");
    			t = text(t_value);
    			add_location(b, file$3, 80, 45, 3004);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, b, anchor);
    			append_dev(b, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$matchingOptions*/ 128 && t_value !== (t_value = /*opt*/ ctx[42].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(b);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(81:45) <b>",
    		ctx
    	});

    	return block;
    }

    // (83:8) {#each opt.options as groupOpt, j}
    function create_each_block_1(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let div_data_pos_value;
    	let current;
    	var switch_value = /*renderer*/ ctx[3];

    	function switch_props(ctx) {
    		return {
    			props: {
    				isDisabled: /*opt*/ ctx[42].isDisabled || /*groupOpt*/ ctx[45].isDisabled,
    				index: /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]][/*j*/ ctx[47]],
    				item: /*groupOpt*/ ctx[45]
    			},
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		switch_instance.$on("hover", /*hover_handler*/ ctx[28]);
    		switch_instance.$on("select", /*select_handler*/ ctx[29]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr_dev(div, "data-pos", div_data_pos_value = /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]][/*j*/ ctx[47]]);
    			attr_dev(div, "class", "optgroup-item svelte-1od39di");
    			toggle_class(div, "active", /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]][/*j*/ ctx[47]] === /*dropdownIndex*/ ctx[2]);
    			add_location(div, file$3, 83, 8, 3099);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*$matchingOptions*/ 128) switch_instance_changes.isDisabled = /*opt*/ ctx[42].isDisabled || /*groupOpt*/ ctx[45].isDisabled;
    			if (dirty[0] & /*$listIndexMap*/ 4096) switch_instance_changes.index = /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]][/*j*/ ctx[47]];
    			if (dirty[0] & /*$matchingOptions*/ 128) switch_instance_changes.item = /*groupOpt*/ ctx[45];

    			if (dirty[1] & /*$$scope*/ 8) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*renderer*/ ctx[3])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					switch_instance.$on("hover", /*hover_handler*/ ctx[28]);
    					switch_instance.$on("select", /*select_handler*/ ctx[29]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*$listIndexMap*/ 4096 && div_data_pos_value !== (div_data_pos_value = /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]][/*j*/ ctx[47]])) {
    				attr_dev(div, "data-pos", div_data_pos_value);
    			}

    			if (dirty[0] & /*$listIndexMap, dropdownIndex*/ 4100) {
    				toggle_class(div, "active", /*$listIndexMap*/ ctx[12][/*i*/ ctx[44]][/*j*/ ctx[47]] === /*dropdownIndex*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(83:8) {#each opt.options as groupOpt, j}",
    		ctx
    	});

    	return block;
    }

    // (77:4) {#each $matchingOptions as opt, i}
    function create_each_block$1(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_4, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*$matchingOptions*/ 128) show_if = !!(/*opt*/ ctx[42].options && Array.isArray(/*opt*/ ctx[42].options));
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, [-1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(77:4) {#each $matchingOptions as opt, i}",
    		ctx
    	});

    	return block;
    }

    // (111:4) {#if $inputValue && creatable}
    function create_if_block_1$1(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;
    	let if_block = /*$currentListLength*/ ctx[13] !== /*dropdownIndex*/ ctx[2] && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text("Create '");
    			t1 = text(/*$inputValue*/ ctx[8]);
    			t2 = text("'");
    			t3 = space();
    			if (if_block) if_block.c();
    			add_location(span, file$3, 112, 6, 4099);
    			attr_dev(div, "class", "creatable-row svelte-1od39di");
    			toggle_class(div, "active", /*$currentListLength*/ ctx[13] === /*dropdownIndex*/ ctx[2]);
    			add_location(div, file$3, 111, 4, 3969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(div, t3);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(
    					div,
    					"click",
    					function () {
    						if (is_function(/*dispatch*/ ctx[15]("select", /*$inputValue*/ ctx[8]))) /*dispatch*/ ctx[15]("select", /*$inputValue*/ ctx[8]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$inputValue*/ 256) set_data_dev(t1, /*$inputValue*/ ctx[8]);

    			if (/*$currentListLength*/ ctx[13] !== /*dropdownIndex*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*$currentListLength, dropdownIndex*/ 8196) {
    				toggle_class(div, "active", /*$currentListLength*/ ctx[13] === /*dropdownIndex*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(111:4) {#if $inputValue && creatable}",
    		ctx
    	});

    	return block;
    }

    // (114:6) {#if $currentListLength !== dropdownIndex}
    function create_if_block_2$1(ctx) {
    	let span;
    	let kbd0;
    	let t1;
    	let kbd1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			kbd0 = element("kbd");
    			kbd0.textContent = "Ctrl";
    			t1 = text("+");
    			kbd1 = element("kbd");
    			kbd1.textContent = "Enter";
    			attr_dev(kbd0, "class", "svelte-1od39di");
    			add_location(kbd0, file$3, 114, 29, 4215);
    			attr_dev(kbd1, "class", "svelte-1od39di");
    			add_location(kbd1, file$3, 114, 45, 4231);
    			attr_dev(span, "class", "shortcut svelte-1od39di");
    			add_location(span, file$3, 114, 6, 4192);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, kbd0);
    			append_dev(span, t1);
    			append_dev(span, kbd1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(114:6) {#if $currentListLength !== dropdownIndex}",
    		ctx
    	});

    	return block;
    }

    // (119:4) {#if hasEmptyList && !$isFetchingData}
    function create_if_block$2(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*$listMessage*/ ctx[14]);
    			attr_dev(div, "class", "empty-list-row svelte-1od39di");
    			add_location(div, file$3, 119, 4, 4340);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$listMessage*/ 16384) set_data_dev(t, /*$listMessage*/ ctx[14]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(119:4) {#if hasEmptyList && !$isFetchingData}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*$listLength*/ ctx[11] && create_if_block_3(ctx);
    	let if_block1 = /*$inputValue*/ ctx[8] && /*creatable*/ ctx[0] && create_if_block_1$1(ctx);
    	let if_block2 = /*hasEmptyList*/ ctx[6] && !/*$isFetchingData*/ ctx[9] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", "dropdown-content svelte-1od39di");
    			toggle_class(div0, "max-reached", /*maxReached*/ ctx[1]);
    			add_location(div0, file$3, 74, 2, 2665);
    			attr_dev(div1, "class", "dropdown svelte-1od39di");
    			attr_dev(div1, "aria-expanded", /*$hasDropdownOpened*/ ctx[10]);
    			toggle_class(div1, "is-loading", /*$isFetchingData*/ ctx[9]);
    			add_location(div1, file$3, 70, 0, 2504);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			/*div0_binding*/ ctx[32](div0);
    			/*div1_binding*/ ctx[33](div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "mousedown", prevent_default(/*mousedown_handler*/ ctx[26]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*$listLength*/ ctx[11]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*$listLength*/ 2048) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$inputValue*/ ctx[8] && /*creatable*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*hasEmptyList*/ ctx[6] && !/*$isFetchingData*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$2(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*maxReached*/ 2) {
    				toggle_class(div0, "max-reached", /*maxReached*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*$hasDropdownOpened*/ 1024) {
    				attr_dev(div1, "aria-expanded", /*$hasDropdownOpened*/ ctx[10]);
    			}

    			if (dirty[0] & /*$isFetchingData*/ 512) {
    				toggle_class(div1, "is-loading", /*$isFetchingData*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			/*div0_binding*/ ctx[32](null);
    			/*div1_binding*/ ctx[33](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $matchingOptions;
    	let $inputValue;
    	let $isFetchingData;
    	let $hasDropdownOpened;
    	let $listLength;
    	let $listIndexMap;
    	let $currentListLength;
    	let $listMessage;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dropdown", slots, ['dropdown-group-header']);
    	let { creatable } = $$props;
    	let { maxReached = false } = $$props;
    	let { dropdownIndex = 0 } = $$props;
    	let { renderer } = $$props;

    	function scrollIntoView(params) {
    		const focusedEl = container.querySelector(`[data-pos="${dropdownIndex}"]`);
    		if (!focusedEl) return;
    		const focusedRect = focusedEl.getBoundingClientRect();
    		const menuRect = scrollContainer.getBoundingClientRect();
    		const overScroll = focusedEl.offsetHeight / 3;

    		switch (true) {
    			case focusedEl.offsetTop < scrollContainer.scrollTop:
    				$$invalidate(5, scrollContainer.scrollTop = focusedEl.offsetTop - overScroll, scrollContainer);
    				break;
    			case focusedEl.offsetTop + focusedRect.height > scrollContainer.scrollTop + menuRect.height:
    				$$invalidate(5, scrollContainer.scrollTop = focusedEl.offsetTop + focusedRect.height - scrollContainer.offsetHeight + overScroll, scrollContainer);
    				break;
    		}
    	}

    	const dispatch = createEventDispatcher();

    	const { // getContext
    	inputValue, hasDropdownOpened, listLength, currentListLength, listMessage, isFetchingData, matchingOptions, flatMatching, selectedOptions, listIndexMap } = getContext(key);

    	validate_store(inputValue, "inputValue");
    	component_subscribe($$self, inputValue, value => $$invalidate(8, $inputValue = value));
    	validate_store(hasDropdownOpened, "hasDropdownOpened");
    	component_subscribe($$self, hasDropdownOpened, value => $$invalidate(10, $hasDropdownOpened = value));
    	validate_store(listLength, "listLength");
    	component_subscribe($$self, listLength, value => $$invalidate(11, $listLength = value));
    	validate_store(currentListLength, "currentListLength");
    	component_subscribe($$self, currentListLength, value => $$invalidate(13, $currentListLength = value));
    	validate_store(listMessage, "listMessage");
    	component_subscribe($$self, listMessage, value => $$invalidate(14, $listMessage = value));
    	validate_store(isFetchingData, "isFetchingData");
    	component_subscribe($$self, isFetchingData, value => $$invalidate(9, $isFetchingData = value));
    	validate_store(matchingOptions, "matchingOptions");
    	component_subscribe($$self, matchingOptions, value => $$invalidate(7, $matchingOptions = value));
    	validate_store(listIndexMap, "listIndexMap");
    	component_subscribe($$self, listIndexMap, value => $$invalidate(12, $listIndexMap = value));
    	let container;
    	let scrollContainer;
    	let scrollPos = null;
    	let isMounted = false;
    	let hasEmptyList = false;
    	let remoteSearch = false;

    	function positionDropdown(val) {
    		const outVp = isOutOfViewport(scrollContainer);

    		if (outVp.bottom && !outVp.top) {
    			$$invalidate(5, scrollContainer.style.bottom = scrollContainer.parentElement.clientHeight + 1 + "px", scrollContainer);
    		} else if (!val || outVp.top) {
    			$$invalidate(5, scrollContainer.style.bottom = "", scrollContainer); // TODO: debounce ....
    		}
    	}

    	let dropdownStateSubscription;

    	/** ************************************ lifecycle */
    	onMount(() => {
    		isMounted = true;

    		/** ************************************ flawless UX related tweak */
    		dropdownStateSubscription = hasDropdownOpened.subscribe(val => {
    			tick().then(() => positionDropdown(val));

    			// bind/unbind scroll listener
    			document[val ? "addEventListener" : "removeEventListener"]("scroll", () => positionDropdown(val));
    		});
    	});

    	onDestroy(() => dropdownStateSubscription());
    	const writable_props = ["creatable", "maxReached", "dropdownIndex", "renderer"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	function mousedown_handler(event) {
    		bubble($$self, event);
    	}

    	function mousedown_handler_1(event) {
    		bubble($$self, event);
    	}

    	function hover_handler(event) {
    		bubble($$self, event);
    	}

    	function select_handler(event) {
    		bubble($$self, event);
    	}

    	function hover_handler_1(event) {
    		bubble($$self, event);
    	}

    	function select_handler_1(event) {
    		bubble($$self, event);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(4, container);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			scrollContainer = $$value;
    			$$invalidate(5, scrollContainer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("creatable" in $$props) $$invalidate(0, creatable = $$props.creatable);
    		if ("maxReached" in $$props) $$invalidate(1, maxReached = $$props.maxReached);
    		if ("dropdownIndex" in $$props) $$invalidate(2, dropdownIndex = $$props.dropdownIndex);
    		if ("renderer" in $$props) $$invalidate(3, renderer = $$props.renderer);
    		if ("$$scope" in $$props) $$invalidate(34, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		key,
    		isOutOfViewport,
    		creatable,
    		maxReached,
    		dropdownIndex,
    		renderer,
    		scrollIntoView,
    		dispatch,
    		inputValue,
    		hasDropdownOpened,
    		listLength,
    		currentListLength,
    		listMessage,
    		isFetchingData,
    		matchingOptions,
    		flatMatching,
    		selectedOptions,
    		listIndexMap,
    		container,
    		scrollContainer,
    		scrollPos,
    		isMounted,
    		hasEmptyList,
    		remoteSearch,
    		positionDropdown,
    		dropdownStateSubscription,
    		$matchingOptions,
    		$inputValue,
    		$isFetchingData,
    		$hasDropdownOpened,
    		$listLength,
    		$listIndexMap,
    		$currentListLength,
    		$listMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("creatable" in $$props) $$invalidate(0, creatable = $$props.creatable);
    		if ("maxReached" in $$props) $$invalidate(1, maxReached = $$props.maxReached);
    		if ("dropdownIndex" in $$props) $$invalidate(2, dropdownIndex = $$props.dropdownIndex);
    		if ("renderer" in $$props) $$invalidate(3, renderer = $$props.renderer);
    		if ("container" in $$props) $$invalidate(4, container = $$props.container);
    		if ("scrollContainer" in $$props) $$invalidate(5, scrollContainer = $$props.scrollContainer);
    		if ("scrollPos" in $$props) scrollPos = $$props.scrollPos;
    		if ("isMounted" in $$props) isMounted = $$props.isMounted;
    		if ("hasEmptyList" in $$props) $$invalidate(6, hasEmptyList = $$props.hasEmptyList);
    		if ("remoteSearch" in $$props) remoteSearch = $$props.remoteSearch;
    		if ("dropdownStateSubscription" in $$props) dropdownStateSubscription = $$props.dropdownStateSubscription;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$matchingOptions, creatable, $inputValue*/ 385) {
    			 {
    				$$invalidate(6, hasEmptyList = $matchingOptions.length < 1 && (creatable ? !$inputValue : true));
    			}
    		}
    	};

    	return [
    		creatable,
    		maxReached,
    		dropdownIndex,
    		renderer,
    		container,
    		scrollContainer,
    		hasEmptyList,
    		$matchingOptions,
    		$inputValue,
    		$isFetchingData,
    		$hasDropdownOpened,
    		$listLength,
    		$listIndexMap,
    		$currentListLength,
    		$listMessage,
    		dispatch,
    		inputValue,
    		hasDropdownOpened,
    		listLength,
    		currentListLength,
    		listMessage,
    		isFetchingData,
    		matchingOptions,
    		listIndexMap,
    		scrollIntoView,
    		slots,
    		mousedown_handler,
    		mousedown_handler_1,
    		hover_handler,
    		select_handler,
    		hover_handler_1,
    		select_handler_1,
    		div0_binding,
    		div1_binding,
    		$$scope
    	];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				creatable: 0,
    				maxReached: 1,
    				dropdownIndex: 2,
    				renderer: 3,
    				scrollIntoView: 24
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*creatable*/ ctx[0] === undefined && !("creatable" in props)) {
    			console.warn("<Dropdown> was created without expected prop 'creatable'");
    		}

    		if (/*renderer*/ ctx[3] === undefined && !("renderer" in props)) {
    			console.warn("<Dropdown> was created without expected prop 'renderer'");
    		}
    	}

    	get creatable() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set creatable(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxReached() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxReached(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropdownIndex() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownIndex(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get renderer() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set renderer(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scrollIntoView() {
    		return this.$$.ctx[24];
    	}

    	set scrollIntoView(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Svelecte\Svelecte.svelte generated by Svelte v3.25.0 */

    const { Object: Object_1 } = globals;
    const file$4 = "src\\Svelecte\\Svelecte.svelte";
    const get_icon_slot_changes$1 = dirty => ({});
    const get_icon_slot_context$1 = ctx => ({});

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[60] = list[i];
    	return child_ctx;
    }

    // (268:2) {#if name}
    function create_if_block$3(ctx) {
    	let select;
    	let each_value = /*$selectedOptions*/ ctx[15];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "name", /*name*/ ctx[2]);
    			select.multiple = /*multiple*/ ctx[0];
    			attr_dev(select, "class", "is-hidden svelte-hgftk9");
    			attr_dev(select, "tabindex", "-1");
    			select.required = /*required*/ ctx[3];
    			select.disabled = /*disabled*/ ctx[4];
    			add_location(select, file$4, 268, 2, 8734);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$selectedOptions*/ 32768) {
    				each_value = /*$selectedOptions*/ ctx[15];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*name*/ 4) {
    				attr_dev(select, "name", /*name*/ ctx[2]);
    			}

    			if (dirty[0] & /*multiple*/ 1) {
    				prop_dev(select, "multiple", /*multiple*/ ctx[0]);
    			}

    			if (dirty[0] & /*required*/ 8) {
    				prop_dev(select, "required", /*required*/ ctx[3]);
    			}

    			if (dirty[0] & /*disabled*/ 16) {
    				prop_dev(select, "disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(268:2) {#if name}",
    		ctx
    	});

    	return block;
    }

    // (270:4) {#each $selectedOptions as opt}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[60].text + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*opt*/ ctx[60].value;
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$4, 270, 4, 8862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$selectedOptions*/ 32768 && t_value !== (t_value = /*opt*/ ctx[60].text + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*$selectedOptions*/ 32768 && option_value_value !== (option_value_value = /*opt*/ ctx[60].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(270:4) {#each $selectedOptions as opt}",
    		ctx
    	});

    	return block;
    }

    // (280:4) <div slot="icon" class="icon-slot">
    function create_icon_slot(ctx) {
    	let div;
    	let current;
    	const icon_slot_template = /*#slots*/ ctx[35].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[38], get_icon_slot_context$1);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (icon_slot) icon_slot.c();
    			attr_dev(div, "slot", "icon");
    			attr_dev(div, "class", "icon-slot svelte-hgftk9");
    			add_location(div, file$4, 279, 4, 9145);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (icon_slot) {
    				icon_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (icon_slot) {
    				if (icon_slot.p && dirty[1] & /*$$scope*/ 128) {
    					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[38], dirty, get_icon_slot_changes$1, get_icon_slot_context$1);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (icon_slot) icon_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_icon_slot.name,
    		type: "slot",
    		source: "(280:4) <div slot=\\\"icon\\\" class=\\\"icon-slot\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let control;
    	let t1;
    	let dropdown;
    	let div_class_value;
    	let current;
    	let if_block = /*name*/ ctx[2] && create_if_block$3(ctx);

    	let control_props = {
    		renderer: /*itemRenderer*/ ctx[14],
    		disabled: /*disabled*/ ctx[4],
    		clearable: /*clearable*/ ctx[7],
    		searchable: /*searchable*/ ctx[8],
    		placeholder: /*placeholder*/ ctx[1],
    		multiple: /*multiple*/ ctx[0],
    		$$slots: { icon: [create_icon_slot] },
    		$$scope: { ctx }
    	};

    	control = new Control({ props: control_props, $$inline: true });
    	/*control_binding*/ ctx[36](control);
    	control.$on("deselect", /*onDeselect*/ ctx[22]);
    	control.$on("keydown", /*onKeyDown*/ ctx[24]);

    	let dropdown_props = {
    		renderer: /*itemRenderer*/ ctx[14],
    		creatable: /*creatable*/ ctx[5],
    		maxReached: /*max*/ ctx[6] && /*max*/ ctx[6] === /*$selectedOptions*/ ctx[15].length,
    		dropdownIndex: /*dropdownActiveIndex*/ ctx[13]
    	};

    	dropdown = new Dropdown({ props: dropdown_props, $$inline: true });
    	/*dropdown_binding*/ ctx[37](dropdown);
    	dropdown.$on("select", /*onSelect*/ ctx[21]);
    	dropdown.$on("hover", /*onHover*/ ctx[23]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			create_component(control.$$.fragment);
    			t1 = space();
    			create_component(dropdown.$$.fragment);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`svelecte ${/*className*/ ctx[9]}`) + " svelte-hgftk9"));
    			attr_dev(div, "style", /*style*/ ctx[10]);
    			toggle_class(div, "is-disabled", /*disabled*/ ctx[4]);
    			add_location(div, file$4, 266, 0, 8642);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			mount_component(control, div, null);
    			append_dev(div, t1);
    			mount_component(dropdown, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*name*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const control_changes = {};
    			if (dirty[0] & /*itemRenderer*/ 16384) control_changes.renderer = /*itemRenderer*/ ctx[14];
    			if (dirty[0] & /*disabled*/ 16) control_changes.disabled = /*disabled*/ ctx[4];
    			if (dirty[0] & /*clearable*/ 128) control_changes.clearable = /*clearable*/ ctx[7];
    			if (dirty[0] & /*searchable*/ 256) control_changes.searchable = /*searchable*/ ctx[8];
    			if (dirty[0] & /*placeholder*/ 2) control_changes.placeholder = /*placeholder*/ ctx[1];
    			if (dirty[0] & /*multiple*/ 1) control_changes.multiple = /*multiple*/ ctx[0];

    			if (dirty[1] & /*$$scope*/ 128) {
    				control_changes.$$scope = { dirty, ctx };
    			}

    			control.$set(control_changes);
    			const dropdown_changes = {};
    			if (dirty[0] & /*itemRenderer*/ 16384) dropdown_changes.renderer = /*itemRenderer*/ ctx[14];
    			if (dirty[0] & /*creatable*/ 32) dropdown_changes.creatable = /*creatable*/ ctx[5];
    			if (dirty[0] & /*max, $selectedOptions*/ 32832) dropdown_changes.maxReached = /*max*/ ctx[6] && /*max*/ ctx[6] === /*$selectedOptions*/ ctx[15].length;
    			if (dirty[0] & /*dropdownActiveIndex*/ 8192) dropdown_changes.dropdownIndex = /*dropdownActiveIndex*/ ctx[13];
    			dropdown.$set(dropdown_changes);

    			if (!current || dirty[0] & /*className*/ 512 && div_class_value !== (div_class_value = "" + (null_to_empty(`svelecte ${/*className*/ ctx[9]}`) + " svelte-hgftk9"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*style*/ 1024) {
    				attr_dev(div, "style", /*style*/ ctx[10]);
    			}

    			if (dirty[0] & /*className, disabled*/ 528) {
    				toggle_class(div, "is-disabled", /*disabled*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(control.$$.fragment, local);
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(control.$$.fragment, local);
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*control_binding*/ ctx[36](null);
    			destroy_component(control);
    			/*dropdown_binding*/ ctx[37](null);
    			destroy_component(dropdown);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const renderers = { default: Item };

    function registerRenderer(name, component) {
    	renderers[name] = component;
    }

    const itemActions = rendererActions;

    function instance$4($$self, $$props, $$invalidate) {
    	let $selectedOptions;
    	let $flatMatching;
    	let $inputValue;
    	let $hasDropdownOpened;
    	let $currentListLength;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Svelecte", slots, ['icon']);
    	let { name = null } = $$props;
    	let { required = false } = $$props;
    	let { multiple = settings.multiple } = $$props;
    	let { disabled = settings.disabled } = $$props;
    	let { creatable = settings.creatable } = $$props;
    	let { selectOnTab = settings.selectOnTab } = $$props;
    	let { valueField = settings.valueField } = $$props;
    	let { searchMode = settings.searchMode } = $$props;
    	let { max = settings.max } = $$props;
    	let { renderer = settings.renderer } = $$props;
    	let { clearable = settings.clearable } = $$props;
    	let { searchable = settings.searchable } = $$props;
    	let { placeholder = "Select" } = $$props;
    	let { fetch = null } = $$props;
    	let { options = [] } = $$props;
    	let { class: className = "svelecte-control" } = $$props;
    	let { style = null } = $$props;
    	let { selection = undefined } = $$props;
    	let { value = undefined } = $$props;
    	const getSelection = () => JSON.parse(JSON.stringify(selection));
    	const setSelection = selection => _selectByValues(selection);

    	// options are being updated
    	let prevOptions = undefined;

    	const dispatch = createEventDispatcher();
    	const storeSettings = { multiple, creatable, searchMode, max };
    	multiple = name && !multiple ? name.endsWith("[]") : multiple;

    	/** ************************************ Context definition */
    	const { hasFocus, hasDropdownOpened, inputValue, listMessage, selectOption, deselectOption, clearSelection, listLength, matchingOptions, flatMatching, currentListLength, selectedOptions, listIndexMap, _set, _remote, isFetchingData } = initStore(options, storeSettings, typeof fetch === "string" ? fetchRemote(fetch) : fetch);

    	validate_store(hasDropdownOpened, "hasDropdownOpened");
    	component_subscribe($$self, hasDropdownOpened, value => $$invalidate(44, $hasDropdownOpened = value));
    	validate_store(inputValue, "inputValue");
    	component_subscribe($$self, inputValue, value => $$invalidate(43, $inputValue = value));
    	validate_store(flatMatching, "flatMatching");
    	component_subscribe($$self, flatMatching, value => $$invalidate(42, $flatMatching = value));
    	validate_store(currentListLength, "currentListLength");
    	component_subscribe($$self, currentListLength, value => $$invalidate(45, $currentListLength = value));
    	validate_store(selectedOptions, "selectedOptions");
    	component_subscribe($$self, selectedOptions, value => $$invalidate(15, $selectedOptions = value));

    	setContext(key, {
    		hasFocus,
    		hasDropdownOpened,
    		inputValue,
    		listMessage,
    		selectOption,
    		deselectOption,
    		clearSelection,
    		listLength,
    		matchingOptions,
    		flatMatching,
    		currentListLength,
    		selectedOptions,
    		listIndexMap,
    		isFetchingData
    	});

    	/** ************************************ component logic */
    	let refDropdown;

    	let refControl;
    	let ignoreHover = false;

    	let dropdownActiveIndex = !multiple && options.some(o => o.isSelected)
    	? options.indexOf(options.filter(o => o.isSelected).shift())
    	: 0;

    	/**
     * Dispatch change event on add options/remove selected items
     */
    	function emitChangeEvent() {
    		tick().then(() => {
    			dispatch("change", selection);
    		});
    	}

    	/**
     * TODO: check this funcionality
     * Internal helper for passed value array. Should be used for CC
     */
    	function _selectByValues(values) {
    		if (!Array.isArray(values)) values = [values];
    		if (values[0] && values[0] instanceof Object) values = values.map(opt => opt[valueField]);
    		clearSelection();
    		const newAddition = [];

    		$flatMatching.forEach(opt => {
    			if (values.includes(opt.value)) {
    				newAddition.push(opt);
    			}
    		});

    		newAddition.forEach(selectOption);
    	}

    	/**
     * Add given option to selection pool
     */
    	function onSelect(event, opt) {
    		opt = opt || event.detail;
    		if (disabled || opt.isDisabled) return;
    		selectOption(opt);
    		set_store_value(inputValue, $inputValue = "");

    		if (!multiple) {
    			set_store_value(hasDropdownOpened, $hasDropdownOpened = false);
    		}

    		emitChangeEvent();
    	}

    	/**
     * Remove option/all options from selection pool
     */
    	function onDeselect(event, opt) {
    		if (disabled) return;
    		opt = opt || event.detail;

    		if (opt) {
    			deselectOption(opt);
    		} else {
    			// apply for 'x' when clearable:true || ctrl+backspace || ctrl+delete
    			clearSelection();
    		}

    		tick().then(refControl.focusControl);
    		emitChangeEvent();
    	}

    	/**
     * Dropdown hover handler - update active item
     */
    	function onHover(event) {
    		if (ignoreHover) {
    			ignoreHover = false;
    			return;
    		}

    		$$invalidate(13, dropdownActiveIndex = event.detail);
    	}

    	/**
     * Keyboard navigation
     */
    	function onKeyDown(event) {

    		const Tab = selectOnTab && $hasDropdownOpened && !event.shiftKey
    		? "Tab"
    		: "No-tab";

    		switch (event.key) {
    			case "PageDown":
    				$$invalidate(13, dropdownActiveIndex = 0);
    			case "ArrowUp":
    				if (!$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true);
    					return;
    				}
    				event.preventDefault();
    				$$invalidate(13, dropdownActiveIndex = dropdownActiveIndex == 0
    				? $currentListLength
    				: dropdownActiveIndex - 1);
    				tick().then(refDropdown.scrollIntoView);
    				ignoreHover = true;
    				break;
    			case "PageUp":
    				$$invalidate(13, dropdownActiveIndex = $currentListLength + 2);
    			case "ArrowDown":
    				if (!$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true);
    					return;
    				}
    				event.preventDefault();
    				$$invalidate(13, dropdownActiveIndex = dropdownActiveIndex >= $currentListLength
    				? 0
    				: dropdownActiveIndex + 1);
    				tick().then(refDropdown.scrollIntoView);
    				ignoreHover = true;
    				break;
    			case "Escape":
    				if (!$inputValue) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = false);
    				}
    				set_store_value(inputValue, $inputValue = "");
    				break;
    			case Tab:
    				set_store_value(hasDropdownOpened, $hasDropdownOpened = false);
    				event.preventDefault();
    			case "Enter":
    				if (!$hasDropdownOpened) return;
    				let activeDropdownItem = $flatMatching[dropdownActiveIndex];
    				if (creatable && $inputValue) {
    					activeDropdownItem = !activeDropdownItem || event.ctrlKey
    					? $inputValue
    					: activeDropdownItem;
    				}
    				activeDropdownItem && onSelect(null, activeDropdownItem);
    				if ($flatMatching.length <= dropdownActiveIndex) {
    					$$invalidate(13, dropdownActiveIndex = $currentListLength > 0 ? $currentListLength : 0);
    				}
    				event.preventDefault();
    				break;
    			case " ":
    				if (!$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true); // prevent form submit
    					event.preventDefault();
    				}
    				break;
    			case "Backspace":
    			case "Delete":
    				if ($inputValue === "" && $selectedOptions.length) {
    					event.ctrlKey
    					? onDeselect({})
    					: onDeselect(null, $selectedOptions.pop());
    				}
    			default:
    				if (!event.ctrlKey && event.key !== "Shift" && !$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true);
    				}
    				if (!multiple && $selectedOptions.length && event.key !== "Tab") event.preventDefault();
    		}
    	}

    	/**
     * Lazy calling of scrollIntoView function, which is required
     */
    	onDestroy(currentListLength.subscribe(val => {
    		if (val <= dropdownActiveIndex) $$invalidate(13, dropdownActiveIndex = val);
    		if (dropdownActiveIndex < 0) $$invalidate(13, dropdownActiveIndex = 0);
    		tick().then(() => refDropdown && refDropdown.scrollIntoView({}));
    	}));

    	const writable_props = [
    		"name",
    		"required",
    		"multiple",
    		"disabled",
    		"creatable",
    		"selectOnTab",
    		"valueField",
    		"searchMode",
    		"max",
    		"renderer",
    		"clearable",
    		"searchable",
    		"placeholder",
    		"fetch",
    		"options",
    		"class",
    		"style",
    		"selection",
    		"value"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svelecte> was created with unknown prop '${key}'`);
    	});

    	function control_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			refControl = $$value;
    			$$invalidate(12, refControl);
    		});
    	}

    	function dropdown_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			refDropdown = $$value;
    			$$invalidate(11, refDropdown);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("required" in $$props) $$invalidate(3, required = $$props.required);
    		if ("multiple" in $$props) $$invalidate(0, multiple = $$props.multiple);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("creatable" in $$props) $$invalidate(5, creatable = $$props.creatable);
    		if ("selectOnTab" in $$props) $$invalidate(27, selectOnTab = $$props.selectOnTab);
    		if ("valueField" in $$props) $$invalidate(28, valueField = $$props.valueField);
    		if ("searchMode" in $$props) $$invalidate(29, searchMode = $$props.searchMode);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("renderer" in $$props) $$invalidate(30, renderer = $$props.renderer);
    		if ("clearable" in $$props) $$invalidate(7, clearable = $$props.clearable);
    		if ("searchable" in $$props) $$invalidate(8, searchable = $$props.searchable);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("fetch" in $$props) $$invalidate(31, fetch = $$props.fetch);
    		if ("options" in $$props) $$invalidate(32, options = $$props.options);
    		if ("class" in $$props) $$invalidate(9, className = $$props.class);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("selection" in $$props) $$invalidate(25, selection = $$props.selection);
    		if ("value" in $$props) $$invalidate(26, value = $$props.value);
    		if ("$$scope" in $$props) $$invalidate(38, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		rendererActions,
    		Item,
    		renderers,
    		registerRenderer,
    		itemActions,
    		setContext,
    		onDestroy,
    		createEventDispatcher,
    		tick,
    		key,
    		initStore,
    		fetchRemote,
    		defaults: settings,
    		Control,
    		Dropdown,
    		name,
    		required,
    		multiple,
    		disabled,
    		creatable,
    		selectOnTab,
    		valueField,
    		searchMode,
    		max,
    		renderer,
    		clearable,
    		searchable,
    		placeholder,
    		fetch,
    		options,
    		className,
    		style,
    		selection,
    		value,
    		getSelection,
    		setSelection,
    		prevOptions,
    		dispatch,
    		storeSettings,
    		hasFocus,
    		hasDropdownOpened,
    		inputValue,
    		listMessage,
    		selectOption,
    		deselectOption,
    		clearSelection,
    		listLength,
    		matchingOptions,
    		flatMatching,
    		currentListLength,
    		selectedOptions,
    		listIndexMap,
    		_set,
    		_remote,
    		isFetchingData,
    		refDropdown,
    		refControl,
    		ignoreHover,
    		dropdownActiveIndex,
    		emitChangeEvent,
    		_selectByValues,
    		onSelect,
    		onDeselect,
    		onHover,
    		onKeyDown,
    		itemRenderer,
    		$selectedOptions,
    		$flatMatching,
    		$inputValue,
    		$hasDropdownOpened,
    		$currentListLength
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("required" in $$props) $$invalidate(3, required = $$props.required);
    		if ("multiple" in $$props) $$invalidate(0, multiple = $$props.multiple);
    		if ("disabled" in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ("creatable" in $$props) $$invalidate(5, creatable = $$props.creatable);
    		if ("selectOnTab" in $$props) $$invalidate(27, selectOnTab = $$props.selectOnTab);
    		if ("valueField" in $$props) $$invalidate(28, valueField = $$props.valueField);
    		if ("searchMode" in $$props) $$invalidate(29, searchMode = $$props.searchMode);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("renderer" in $$props) $$invalidate(30, renderer = $$props.renderer);
    		if ("clearable" in $$props) $$invalidate(7, clearable = $$props.clearable);
    		if ("searchable" in $$props) $$invalidate(8, searchable = $$props.searchable);
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("fetch" in $$props) $$invalidate(31, fetch = $$props.fetch);
    		if ("options" in $$props) $$invalidate(32, options = $$props.options);
    		if ("className" in $$props) $$invalidate(9, className = $$props.className);
    		if ("style" in $$props) $$invalidate(10, style = $$props.style);
    		if ("selection" in $$props) $$invalidate(25, selection = $$props.selection);
    		if ("value" in $$props) $$invalidate(26, value = $$props.value);
    		if ("prevOptions" in $$props) $$invalidate(39, prevOptions = $$props.prevOptions);
    		if ("refDropdown" in $$props) $$invalidate(11, refDropdown = $$props.refDropdown);
    		if ("refControl" in $$props) $$invalidate(12, refControl = $$props.refControl);
    		if ("ignoreHover" in $$props) ignoreHover = $$props.ignoreHover;
    		if ("dropdownActiveIndex" in $$props) $$invalidate(13, dropdownActiveIndex = $$props.dropdownActiveIndex);
    		if ("itemRenderer" in $$props) $$invalidate(14, itemRenderer = $$props.itemRenderer);
    	};

    	let itemRenderer;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*prevOptions, options*/ 258) {
    			 {
    				if (prevOptions !== options && _set) {
    					_set(options);
    					$$invalidate(39, prevOptions = options);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*placeholder*/ 2 | $$self.$$.dirty[1] & /*options*/ 2) {
    			// TODO: re-evaluate need of this
    			/** ************************************ auto configuration */
    			 {
    				$$invalidate(1, placeholder = options.reduce(
    					(res, opt, i) => {
    						if (opt.value === "") {
    							res = opt.text;
    							options.splice(i, 1); // remove this option 
    						}

    						return res;
    					},
    					placeholder
    				));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*multiple, creatable, searchMode, max*/ 536871009) {
    			// TODO: re-evaluate - can't it be done in some more clean fashion?
    			 {
    				storeSettings.multiple = multiple;
    				storeSettings.creatable = creatable;
    				storeSettings.searchMode = searchMode;
    				storeSettings.max = max;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*renderer*/ 1073741824) {
    			 $$invalidate(14, itemRenderer = typeof renderer === "string"
    			? renderers[renderer] || Item
    			: renderer);
    		}

    		if ($$self.$$.dirty[0] & /*multiple, $selectedOptions, valueField*/ 268468225) {
    			 {
    				$$invalidate(25, selection = multiple
    				? $selectedOptions
    				: $selectedOptions.length ? $selectedOptions[0] : null);

    				$$invalidate(26, value = multiple
    				? $selectedOptions.map(opt => opt[valueField])
    				: $selectedOptions.length
    					? $selectedOptions[0][valueField]
    					: null);
    			}
    		}
    	};

    	return [
    		multiple,
    		placeholder,
    		name,
    		required,
    		disabled,
    		creatable,
    		max,
    		clearable,
    		searchable,
    		className,
    		style,
    		refDropdown,
    		refControl,
    		dropdownActiveIndex,
    		itemRenderer,
    		$selectedOptions,
    		hasDropdownOpened,
    		inputValue,
    		flatMatching,
    		currentListLength,
    		selectedOptions,
    		onSelect,
    		onDeselect,
    		onHover,
    		onKeyDown,
    		selection,
    		value,
    		selectOnTab,
    		valueField,
    		searchMode,
    		renderer,
    		fetch,
    		options,
    		getSelection,
    		setSelection,
    		slots,
    		control_binding,
    		dropdown_binding,
    		$$scope
    	];
    }

    class Svelecte extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				name: 2,
    				required: 3,
    				multiple: 0,
    				disabled: 4,
    				creatable: 5,
    				selectOnTab: 27,
    				valueField: 28,
    				searchMode: 29,
    				max: 6,
    				renderer: 30,
    				clearable: 7,
    				searchable: 8,
    				placeholder: 1,
    				fetch: 31,
    				options: 32,
    				class: 9,
    				style: 10,
    				selection: 25,
    				value: 26,
    				getSelection: 33,
    				setSelection: 34
    			},
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svelecte",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get name() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get creatable() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set creatable(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectOnTab() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectOnTab(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueField() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueField(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchMode() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchMode(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get renderer() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set renderer(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clearable() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clearable(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchable() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchable(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fetch() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fetch(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selection() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selection(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Svelecte>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getSelection() {
    		return this.$$.ctx[33];
    	}

    	set getSelection(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setSelection() {
    		return this.$$.ctx[34];
    	}

    	set setSelection(value) {
    		throw new Error("<Svelecte>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.25.0 */
    const file$5 = "src\\App.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let svelecte0;
    	let t;
    	let svelecte1;
    	let current;

    	svelecte0 = new Svelecte({
    			props: {
    				options: /*options*/ ctx[0],
    				class: "svelecte-control test"
    			},
    			$$inline: true
    		});

    	svelecte1 = new Svelecte({
    			props: {
    				options: /*options2*/ ctx[1],
    				style: "margin-top:2rem"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(svelecte0.$$.fragment);
    			t = space();
    			create_component(svelecte1.$$.fragment);
    			attr_dev(main, "class", "svelte-h1lpqb");
    			add_location(main, file$5, 15, 0, 242);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(svelecte0, main, null);
    			append_dev(main, t);
    			mount_component(svelecte1, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svelecte0.$$.fragment, local);
    			transition_in(svelecte1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svelecte0.$$.fragment, local);
    			transition_out(svelecte1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(svelecte0);
    			destroy_component(svelecte1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let options = [{ value: 1, text: "Hello" }, { value: 2, text: "Bello" }];
    	let options2 = [{ value: 1, text: "Hello" }, { value: 2, text: "Bello" }];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Svelecte, options, options2 });

    	$$self.$inject_state = $$props => {
    		if ("options" in $$props) $$invalidate(0, options = $$props.options);
    		if ("options2" in $$props) $$invalidate(1, options2 = $$props.options2);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [options, options2];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\demo\DottedRenderer.svelte generated by Svelte v3.25.0 */
    const file$6 = "src\\demo\\DottedRenderer.svelte";

    // (80:0) {#if isSelected}
    function create_if_block$4(ctx) {
    	let a;
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z");
    			add_location(path, file$6, 81, 89, 1847);
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			add_location(svg, file$6, 81, 4, 1762);
    			attr_dev(a, "href", "#deselect");
    			attr_dev(a, "class", "item-btn svelte-1rteqvk");
    			attr_dev(a, "tabindex", "-1");
    			attr_dev(a, "data-action", "deselect");
    			add_location(a, file$6, 80, 2, 1682);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(80:0) {#if isSelected}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t0;
    	let t1_value = /*item*/ ctx[1].text + "";
    	let t1;
    	let t2;
    	let itemActions_action;
    	let mounted;
    	let dispose;
    	let if_block = /*isSelected*/ ctx[2] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "style", /*itemStyle*/ ctx[4]);
    			attr_dev(span, "class", "color svelte-1rteqvk");
    			add_location(span, file$6, 77, 4, 1593);
    			attr_dev(div0, "class", "item-content svelte-1rteqvk");
    			add_location(div0, file$6, 76, 2, 1561);
    			attr_dev(div1, "class", "item svelte-1rteqvk");
    			toggle_class(div1, "is-disabled", /*isDisabled*/ ctx[3]);
    			add_location(div1, file$6, 69, 0, 1428);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(itemActions_action = itemActions.call(null, div1, {
    						item: /*item*/ ctx[1],
    						index: /*index*/ ctx[0]
    					})),
    					listen_dev(div1, "select", /*select_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "deselect", /*deselect_handler*/ ctx[6], false, false, false),
    					listen_dev(div1, "hover", /*hover_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*itemStyle*/ 16) {
    				attr_dev(span, "style", /*itemStyle*/ ctx[4]);
    			}

    			if (dirty & /*item*/ 2 && t1_value !== (t1_value = /*item*/ ctx[1].text + "")) set_data_dev(t1, t1_value);

    			if (/*isSelected*/ ctx[2]) {
    				if (if_block) ; else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (itemActions_action && is_function(itemActions_action.update) && dirty & /*item, index*/ 3) itemActions_action.update.call(null, {
    				item: /*item*/ ctx[1],
    				index: /*index*/ ctx[0]
    			});

    			if (dirty & /*isDisabled*/ 8) {
    				toggle_class(div1, "is-disabled", /*isDisabled*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DottedRenderer", slots, []);
    	let { index = -1 } = $$props;
    	let { item = {} } = $$props;
    	let { isSelected = false } = $$props;
    	let { isDisabled = false } = $$props;
    	const writable_props = ["index", "item", "isSelected", "isDisabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DottedRenderer> was created with unknown prop '${key}'`);
    	});

    	function select_handler(event) {
    		bubble($$self, event);
    	}

    	function deselect_handler(event) {
    		bubble($$self, event);
    	}

    	function hover_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("isSelected" in $$props) $$invalidate(2, isSelected = $$props.isSelected);
    		if ("isDisabled" in $$props) $$invalidate(3, isDisabled = $$props.isDisabled);
    	};

    	$$self.$capture_state = () => ({
    		itemActions,
    		index,
    		item,
    		isSelected,
    		isDisabled,
    		itemStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ("index" in $$props) $$invalidate(0, index = $$props.index);
    		if ("item" in $$props) $$invalidate(1, item = $$props.item);
    		if ("isSelected" in $$props) $$invalidate(2, isSelected = $$props.isSelected);
    		if ("isDisabled" in $$props) $$invalidate(3, isDisabled = $$props.isDisabled);
    		if ("itemStyle" in $$props) $$invalidate(4, itemStyle = $$props.itemStyle);
    	};

    	let itemStyle;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*item*/ 2) {
    			 $$invalidate(4, itemStyle = `background-color: ${item.hex || "#ccc"}`);
    		}
    	};

    	return [
    		index,
    		item,
    		isSelected,
    		isDisabled,
    		itemStyle,
    		select_handler,
    		deselect_handler,
    		hover_handler
    	];
    }

    class DottedRenderer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			index: 0,
    			item: 1,
    			isSelected: 2,
    			isDisabled: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DottedRenderer",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get index() {
    		throw new Error("<DottedRenderer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<DottedRenderer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get item() {
    		throw new Error("<DottedRenderer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set item(value) {
    		throw new Error("<DottedRenderer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSelected() {
    		throw new Error("<DottedRenderer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSelected(value) {
    		throw new Error("<DottedRenderer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isDisabled() {
    		throw new Error("<DottedRenderer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isDisabled(value) {
    		throw new Error("<DottedRenderer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const OPTION_LIST = [
      'options', 'fetch', 'name', 'required',
      'multiple','disabled', 'max', 'creatable', 
      'placeholder', 'renderer', 'searchable', 'clearable', 'css'
    ];

    function formatValue(name, value) {
      switch (name) {
        case 'options':
          if (Array.isArray(value)) return value;
          try {
            value = JSON.parse(value);
            if (!Array.isArray(value)) {
              value = [];
            }
          } catch (e) {
            value = [];
          }
          return value;
        case 'renderer':
          return value || 'default';
        case 'searchable':
          return value == 'true';
        case 'clearable':
          return value != 'false';
        case 'multiple':
        case 'creatable':
        case 'selectOnTab':
          return value !== null;
        case 'disabled':
          return value !== null;
        case 'max':
          return isNaN(parseInt(value)) ? 0 : parseInt(value);
      }
      return value;
    }

    /**
     * Connect Custom Component attributes to Svelte Component properties
     * @param {string} name Name of the Custom Component
     */
    function registerSvelecte(name) {

      return customElements.define(name, class extends HTMLElement {
        constructor() {
          super();
          this.svelecte = undefined;
          
          /** ************************************ public API */
          this.setOptions = options => this.svelecte.setOptions(options);
          Object.defineProperties(this, {
            'selection': {
              get() {
                return this.svelecte.getSelection();
              }
            },
            'value': {
              get() {
                const val = this.svelecte.getSelection();
                return this.multiple ? val.map(v => v.value) : val.value;
              },
              set(value) {
                this.svelecte.setSelection(value);
              }
            },
            'options': {
              get() {
                return JSON.parse(this.getAttribute('options'));
              },
              set(value) {
                this.setAttribute('options', Array.isArray(value) ? JSON.stringify(value) : value);
              }
            },
            'disabled': {
              get() {
                return this.getAttribute('disabled') !== null;
              },
              set(value) {
                if (!value) { 
                  this.removeAttribute('disabled');
                } else {
                  this.setAttribute('disabled', value === true ? '' : value);
                }
              }
            },
            'multiple': {
              get() {
                return this.getAttribute('multiple') !== null;
              },
              set(value) {
                if (!value) { 
                  this.removeAttribute('multiple');
                } else {
                  this.setAttribute('multiple', value === true ? '' : value);
                }
              }
            },
            'creatable': {
              get() {
                return this.getAttribute('creatable') !== null;
              },
              set(value) {
                if (!value) { 
                  this.removeAttribute('creatable');
                } else {
                  this.setAttribute('creatable', value === true ? '' : value);
                }
              }
            },
            'clearable': {
              get() {
                return this.getAttribute('clearable') !== 'false';
              },
              set(value) {
                this.setAttribute('clearable', value ? 'true' : 'false');
              }
            },
            'placeholder': {
              get() {
                return this.getAttribute('placeholder') || '';
              },
              set(value) {
                this.setAttribute('placeholder', value || 'Select');
              }
            },
            'renderer': {
              get() {
                return this.getAttribute('renderer') || 'default';
              },
              set(value) {
                value && this.setAttribute('renderer', value);
              }
            },
            'max': {
              get() {
                return this.getAttribute('max') || 0;
              },
              set(value) {
                try {
                  value = parseInt(value);
                  if (value < 0) value = 0;
                } catch (e) {
                  value = 0;
                }
                this.setAttribute('max', value);
              }
            }
          });
        }

        static get observedAttributes() {
          return OPTION_LIST;
        }

        attributeChangedCallback(name, oldValue, newValue) {
          if (this.svelecte && oldValue !== newValue) {
            this.svelecte.$set({ [name]: formatValue(name, newValue) });
          }
        }

        connectedCallback() {
          let props = {};

          setTimeout(() => {
            for (const attr of OPTION_LIST) {
              if (this.hasAttribute(attr)) {
                props[attr] = formatValue(attr, this.getAttribute(attr));
              }
            }
            if (this.childElementCount > 0) {
              props.options = Array.prototype.slice.call(this.children).map(opt => {
                return Object.assign({
                  isSelected: opt.selected,
                  isDisabled: opt.disabled
                }, opt.dataset.data ? JSON.parse(opt.dataset.data)
                  : {
                    value: opt.value,
                    text: opt.text,
                  }
                );
              });
              this.innerHTML = '';
            }

            this.svelecte = new Svelecte({
              target: this,
              props,
            });
            this.svelecte.$on('change', e => this.dispatchEvent(e));
          });
        }

        disconnectedCallback() {
          this.svelecte && this.svelecte.$destroy();
        }
      });
    }

    const app = new App({
    	target: document.getElementById('app')
    });

    registerSvelecte('el-svelecte');
    registerRenderer('dotted', DottedRenderer);

    window.q = document.querySelector('el-svelecte');
    q.options = [
    	{ value: 2, text: 'blue', hex: '#00F' },
    	{ value: 3, text: 'green', hex: '#0F0' },
    	{ value: 1, text: 'red', hex: '#F00'},
    	{ value: 4, text: 'yellow', hex: '#FF0'}
    ];

    return app;

}());
//# sourceMappingURL=demo.js.map
