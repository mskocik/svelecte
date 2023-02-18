
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
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
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }
    function construct_svelte_component(component, props) {
        return new component(props);
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
        else if (callback) {
            callback();
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
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
        if (Array.isArray(object)) {
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
         * @param {string | number} value
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

        if (option_fields && !Array.isArray(option_fields)) options.fields = [option_fields];
        if (option_sort && !Array.isArray(option_sort)) options.sort = [option_sort];
        if (option_sort_empty && !Array.isArray(option_sort_empty)) options.sort_empty = [option_sort_empty];

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

    const asciifold = (function() {
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
      if (!elem) return false;
      const parentBounding = elem
        .parentElement  // dropdown container
        .parentElement  // component container
          .getBoundingClientRect();
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = parentBounding.top < 0;
      out.left = parentBounding.left < 0;
      out.bottom = parentBounding.bottom + bounding.height > (window.innerHeight || document.documentElement.clientHeight); 
      out.right = parentBounding.right > (window.innerWidth || document.documentElement.clientWidth);
      out.any = out.top || out.left || out.bottom || out.right;

      return out;
    }
    let xhr = null;

    function fetchRemote(url) {
      return function(query, cb) {
        return new Promise((resolve, reject) => {
          xhr = new XMLHttpRequest();
          xhr.open('GET', `${url.replace('[query]', encodeURIComponent(query))}`);
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          xhr.send();
          
          xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
              if (this.status === 200) {
                try {
                  const resp = JSON.parse(this.response);
                  resolve(cb ? cb(resp) : (resp.data || resp.items || resp.options || resp));
                } catch (e) {
                  console.warn('[Svelecte]:Fetch - error handling fetch response', e);
                  reject();
                }
              } else {
                reject();
              }
            } 
          };
        });
      }
    }

    function debounce(fn, delay) {
      let timeout;
    	return function() {
    		const self = this;
    		const args = arguments;
    		clearTimeout(timeout);
    		timeout = setTimeout(function() {
          fn.apply(self, args);
    		}, delay);
    	};
    }
    let itemHtml;

    function highlightSearch(item, isSelected, $inputValue, formatter, disableHighlight) {
      const itemHtmlText = formatter ? formatter(item, isSelected, $inputValue) : item;
      
      if ($inputValue == '' || item.isSelected || disableHighlight) {
        return '<div class="sv-item-content">' + itemHtmlText + '</div>';
      }

      if (!itemHtml) {
        itemHtml = document.createElement('div');
        itemHtml.className = 'sv-item-content';
      }
      itemHtml.innerHTML = itemHtmlText;

      // const regex = new RegExp(`(${asciifold($inputValue)})`, 'ig');
      const pattern = asciifold($inputValue);
      pattern.split(' ').filter(e => e).forEach(pat => {
        highlight(itemHtml, pat);
      });
      
      return itemHtml.outerHTML;
    }

    /**
     * highlight function code from selectize itself. We pass raw html through @html svelte tag
     * base from https://github.com/selectize/selectize.js/blob/master/src/contrib/highlight.js & edited
     */
    const highlight = function(node, regex) {
      let skip = 0;
      // Wrap matching part of text node with highlighting <span>, e.g.
      // Soccer  ->  <span class="highlight">Soc</span>cer for pattern 'soc'
      if (node.nodeType === 3) {
        const folded = asciifold(node.data);
        let pos = folded.indexOf(regex);
        pos -= (folded.substr(0, pos).toUpperCase().length - folded.substr(0, pos).length);
        if (pos >= 0 ) {
          const spannode = document.createElement('span');
          spannode.className = 'highlight';
          const middlebit = node.splitText(pos);
          middlebit.splitText(regex.length);
          const middleclone = middlebit.cloneNode(true);
          spannode.appendChild(middleclone);
          middlebit.parentNode.replaceChild(spannode, middlebit);
          skip = 1;
        }
      } 
      // Recurse element node, looking for child text nodes to highlight, unless element 
      // is childless, <script>, <style>, or already highlighted: <span class="hightlight">
      else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName) && ( node.className !== 'highlight' || node.tagName !== 'SPAN' )) {
        for (var i = 0; i < node.childNodes.length; ++i) {
          i += highlight(node.childNodes[i], regex);
        }
      }
      return skip;
    };

    /**
     * Automatic setter for 'valueField' or 'labelField' when they are not set
     */
    function fieldInit(type, options, config) {
      const isValue = type === 'value';
      if (config.isOptionArray) return isValue ? 'value' : 'label';
      let val = isValue  ? 'value' : 'text';              // selectize style defaults
      if (options && options.length) {
        const firstItem = options[0][config.optItems] ? options[0][config.optItems][0] : options[0];
        if (!firstItem) return val;
        const autoAddItem = isValue ? 0 : 1;
        const guessList = isValue
          ? ['id', 'value', 'ID']
          : ['name', 'title', 'label'];
        val = Object.keys(firstItem).filter(prop => guessList.includes(prop))
          .concat([Object.keys(firstItem)[autoAddItem]])  // auto add field (used as fallback)
          .shift();  
      }
      return val;
    }

    /**
     * Detect Mac device
     * 
     * @returns {bool}
     */
    function iOS() {
      return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
      ].includes(navigator.platform)
      // iPad on iOS 13 detection
      || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    }

    /**
     * Detects if on android device
     * 
     * @returns {bool}
     */
    function android() {
      return navigator.userAgent.toLowerCase().includes('android');
    }

    /**
     * Formatter of newly created items. When `''` is returned, it means new option cannot be created.
     * 
     * @param {string} val 
     * @param {array} options 
     * @returns {string}
     */
    function defaultCreateFilter(val, options) {  
      return (val || '').replace(/\t/g, ' ').trim().split(' ').filter(ch => ch).join(' ');
    }

    /**
     * Default create function
     * 
     * @param {string} inputValue 
     * @param {string} creatablePrefix 
     * @returns {object} newly created option
     */
    function defaultCreateTransform(inputValue, creatablePrefix, valueField, labelField) {
      return {
        [valueField]: inputValue,
        [labelField]: creatablePrefix + inputValue,
      }
    }

    const settings = {
      // html
      disabled: false,
      // basic
      valueField: null,
      labelField: null,
      groupLabelField: 'label',
      groupItemsField: 'options',
      disabledField: '$disabled',
      placeholder: 'Select',
      valueAsObject: false,
      // ui
      searchable: true,
      clearable: false,
      selectOnTab: false,
      resetOnBlur: true,
      resetOnSelect: true,
      resetOnCollapsableDeselect: true,
      fetchResetOnBlur: true,
      // multi
      multiple: false,
      closeAfterSelect: false,
      max: 0,
      collapseSelection: false, // enable collapsible multiple selection
      // create
      creatable: false,
      creatablePrefix: '*',
      keepCreated: true,
      allowEditing: false,
      delimiter: ',',
      // remote
      fetchCallback: null,
      minQuery: 1,
      // performance
      lazyDropdown: true,
      // virtual list
      virtualList: false,
      vlItemSize: null,
      vlHeight: null,
      // i18n
      i18n: {
        empty: 'No options',
        nomatch: 'No matching options',    
        max: num => `Maximum items ${num} selected`,
        fetchBefore: 'Type to start searching',
        fetchQuery: (minQuery, inputLength) => `Type ${minQuery > 1 && minQuery > inputLength 
      ? `at least ${minQuery - inputLength} characters `
      : '' }to start searching`,
        fetchInit: 'Fetching data, please wait...',
        fetchEmpty: 'No data related to your search',
        collapsedSelection: count => `${count} selected`,
        createRowLabel: value => `Create '${value}'`
      },
      // bound to 'i18n'
      collapseSelectionFn: function(selectionCount, selection) {
        return this.collapsedSelection(selectionCount);
      }
    };

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function initSelection(initialValue, valueAsObject, config) {
      if (valueAsObject) return Array.isArray(initialValue) ? initialValue : [initialValue];

      const _initialValue = Array.isArray(initialValue) ? initialValue : [initialValue];
      const valueField = config.labelAsValue ? config.labelField : config.valueField;

      const initialSelection = this/** options */.reduce((res, val, i) => {
        if (val[config.optItems] && val[config.optItems].length) {  // handle groups
          const selected = val[config.optItems].reduce((res, groupVal) => {
            if (_initialValue.includes(groupVal[valueField])) res.push(groupVal);
            return res;
          }, []);
          if (selected.length) {
            res.push(...selected);
            return res;
          }
        }
        if (_initialValue.includes(typeof val === 'object' ? val[valueField] : (config.labelAsValue ? val : i))) {
          if (config.isOptionArray) {
            // initial options are not transformed, therefore we need to create object from given option
            val = {
              [config.valueField]: i,
              [config.labelField]: val
            };
          }
          res.push(val);
        }    return res;
      }, []);

      return initialSelection
        .sort((a, b) => _initialValue.indexOf(a[valueField]) < _initialValue.indexOf(b[valueField]) ? -1 : 1)
    }

    function flatList(options, config) {
      const flatOpts = options.reduce((res, opt, i) => {
        if (config.isOptionArray) {
          res.push({
            [config.valueField]: i,
            [config.labelField]: opt
          });
          return res;
        }
        if (opt[config.optItems] && opt[config.optItems].length) {
          config.optionsWithGroups = true;
          res.push({ label: opt[config.optLabel], $isGroupHeader: true });
          res.push(...opt[config.optItems].map(_opt => {
            _opt.$isGroupItem = true;
            return _opt;
          }));
          return res;
        }
        res.push(opt);
        return res;
      }, []);
      updateOptionProps(flatOpts, config);
      return flatOpts;
    }

    function updateOptionProps(options, config) {
      if (config.isOptionArray) {
        if (!config.optionProps) {
          config.optionProps = ['value', 'label'];
        }
      }
      options.some(opt => {
        if (opt.$isGroupHeader) return false;
        config.optionProps = getFilterProps(opt);
        return true;
      });
    }

    function getFilterProps(object) {
      if (object.options) object = object.options[0];
      const exclude = ['$disabled', '$isGroupHeader', '$isGroupItem'];
      return Object.keys(object).filter(prop => !exclude.includes(prop));
    }

    function filterList(options, inputValue, excludeSelected, sifterSearchField, sifterSortField, config) {
      if (excludeSelected) {
        options = options
          .filter(opt => !excludeSelected.has(opt[config.valueField]))
          .filter((opt, idx, self) => {
            if (opt.$isGroupHeader &&
              (
                (self[idx + 1] && self[idx + 1].$isGroupHeader) 
              || self.length <= 1
              || self.length - 1 === idx
              )
            ) return false;
            return true;
          });
      }
      if (!inputValue) return options;

      const sifter = new Sifter(options);
      /**
       * Sifter is used for searching to provide rich filter functionality.
       * But it degradate nicely, when optgroups are present
      */
      if (config.optionsWithGroups) {  // disable sorting 
        sifter.getSortFunction = () => null;
      }
      let conjunction = 'and';
      if (inputValue.startsWith('|| ')) {
        conjunction = 'or';
        inputValue = inputValue.substr(2);
      }

      const result = sifter.search(inputValue, {
        fields: sifterSearchField || config.optionProps,
        sort: createSifterSortField(sifterSortField || config.labelField),
        conjunction: conjunction
      });

      const mapped = config.optionsWithGroups
        ? result.items.reduce((res, item) => {
            const opt = options[item.id];
            if (excludeSelected && opt.isSelected) return res;
            const lastPos = res.push(opt);
            if (opt.$isGroupItem) {
              const prevItems = options.slice(0, item.id);
              let prev = null;
              do {
                prev = prevItems.pop();
                prev && prev.$isGroupHeader && !res.includes(prev) && res.splice(lastPos - 1, 0, prev);
              } while (prev && !prev.$isGroupHeader);
            }
            return res;
          }, [])
        : result.items.map(item => options[item.id]);
      return mapped;
    }

    function createSifterSortField(prop) {
      return [{ field: prop, direction: 'asc'}];
    }

    function indexList(options, includeCreateRow, config)  {
      const map = config.optionsWithGroups
        ? options.reduce((res, opt, index) => {
          res.push(opt.$isGroupHeader ? '' : index);
          return res;
        }, [])
        : Object.keys(options);

      return {
        map: map,
        first:  map[0] !== '' ? 0 : 1,
        last: map.length ? map.length - (includeCreateRow ? 0 : 1) : 0,
        hasCreateRow: !!includeCreateRow,
        next(curr, prevOnUndefined) {
          const val = this.map[++curr];
          if (this.hasCreateRow && curr === this.last) return this.last;
          if (val === '') return this.next(curr);
          if (val === undefined) {
            if (!this.map.length) return 0;   // ref #26
            if (curr > this.map.length) curr = this.first - 1;
            return prevOnUndefined === true ? this.prev(curr) : this.next(curr);
          }
          return val;
        },
        prev(curr) {
          const val = this.map[--curr];
          if (this.hasCreateRow && curr === this.first) return this.first;
          if (val === '') return this.prev(curr);
          if (!val) return this.last;
          return val;
        }
      };
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    /* src\components\Input.svelte generated by Svelte v3.55.1 */

    function create_fragment$i(ctx) {
    	let input;
    	let input_readonly_value;
    	let t0;
    	let div;
    	let t1;
    	let div_resize_listener;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			input = element("input");
    			t0 = space();
    			div = element("div");
    			t1 = text(/*shadowText*/ ctx[11]);
    			attr(input, "type", "text");
    			attr(input, "class", "inputBox svelte-x1t6fd");
    			input.disabled = /*disabled*/ ctx[2];
    			input.readOnly = input_readonly_value = !/*searchable*/ ctx[1];
    			attr(input, "id", /*inputId*/ ctx[0]);
    			attr(input, "style", /*inputStyle*/ ctx[10]);
    			attr(input, "placeholder", /*placeholderText*/ ctx[6]);
    			attr(input, "enterkeyhint", /*enterHint*/ ctx[9]);
    			attr(div, "class", "shadow-text svelte-x1t6fd");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[28].call(div));
    		},
    		m(target, anchor) {
    			insert(target, input, anchor);
    			/*input_binding*/ ctx[26](input);
    			set_input_value(input, /*$inputValue*/ ctx[7]);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, t1);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[28].bind(div));

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[27]),
    					listen(input, "focus", /*focus_handler*/ ctx[22]),
    					listen(input, "blur", /*blur_handler*/ ctx[23]),
    					listen(input, "input", /*onInput*/ ctx[14]),
    					listen(input, "keydown", /*onKeyDown*/ ctx[12]),
    					listen(input, "keyup", /*onKeyUp*/ ctx[13]),
    					listen(input, "paste", /*paste_handler*/ ctx[24]),
    					listen(input, "change", stop_propagation(/*change_handler*/ ctx[25]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*disabled*/ 4) {
    				input.disabled = /*disabled*/ ctx[2];
    			}

    			if (dirty[0] & /*searchable*/ 2 && input_readonly_value !== (input_readonly_value = !/*searchable*/ ctx[1])) {
    				input.readOnly = input_readonly_value;
    			}

    			if (dirty[0] & /*inputId*/ 1) {
    				attr(input, "id", /*inputId*/ ctx[0]);
    			}

    			if (dirty[0] & /*inputStyle*/ 1024) {
    				attr(input, "style", /*inputStyle*/ ctx[10]);
    			}

    			if (dirty[0] & /*placeholderText*/ 64) {
    				attr(input, "placeholder", /*placeholderText*/ ctx[6]);
    			}

    			if (dirty[0] & /*enterHint*/ 512) {
    				attr(input, "enterkeyhint", /*enterHint*/ ctx[9]);
    			}

    			if (dirty[0] & /*$inputValue*/ 128 && input.value !== /*$inputValue*/ ctx[7]) {
    				set_input_value(input, /*$inputValue*/ ctx[7]);
    			}

    			if (dirty[0] & /*shadowText*/ 2048) set_data(t1, /*shadowText*/ ctx[11]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(input);
    			/*input_binding*/ ctx[26](null);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			div_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let isSingleFilled;
    	let placeholderText;
    	let shadowText;
    	let widthAddition;
    	let inputStyle;
    	let enterHint;

    	let $inputValue,
    		$$unsubscribe_inputValue = noop,
    		$$subscribe_inputValue = () => ($$unsubscribe_inputValue(), $$unsubscribe_inputValue = subscribe(inputValue, $$value => $$invalidate(7, $inputValue = $$value)), inputValue);

    	let $hasDropdownOpened,
    		$$unsubscribe_hasDropdownOpened = noop,
    		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(30, $hasDropdownOpened = $$value)), hasDropdownOpened);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_inputValue());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_hasDropdownOpened());
    	const focus = () => inputRef.focus();
    	let { inputId } = $$props;
    	let { placeholder } = $$props;
    	let { searchable } = $$props;
    	let { disabled } = $$props;
    	let { multiple } = $$props;
    	let { inputValue } = $$props;
    	$$subscribe_inputValue();
    	let { hasDropdownOpened } = $$props;
    	$$subscribe_hasDropdownOpened();
    	let { selectedOptions } = $$props;
    	let { isAndroid } = $$props;
    	let inputRef = null;
    	let shadowWidth = 0;
    	const dispatch = createEventDispatcher();
    	let disableEventBubble = false;

    	function onKeyDown(e) {
    		if (isAndroid && !enterHint && e.key === 'Enter') return true;
    		disableEventBubble = ['Enter', 'Escape'].includes(e.key) && $hasDropdownOpened;
    		dispatch('keydown', e);
    	}

    	/** Stop event propagation on keyup, when dropdown is opened. Typically this will prevent form submit */
    	function onKeyUp(e) {
    		if (disableEventBubble) {
    			e.stopImmediatePropagation();
    			e.preventDefault();
    		}

    		disableEventBubble = false;
    	}

    	function onInput(e) {
    		if (selectedOptions.length === 1 && !multiple) {
    			set_store_value(inputValue, $inputValue = '', $inputValue);
    		}
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function paste_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputRef = $$value;
    			$$invalidate(8, inputRef);
    		});
    	}

    	function input_input_handler() {
    		$inputValue = this.value;
    		inputValue.set($inputValue);
    	}

    	function div_elementresize_handler() {
    		shadowWidth = this.clientWidth;
    		$$invalidate(5, shadowWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('inputId' in $$props) $$invalidate(0, inputId = $$props.inputId);
    		if ('placeholder' in $$props) $$invalidate(16, placeholder = $$props.placeholder);
    		if ('searchable' in $$props) $$invalidate(1, searchable = $$props.searchable);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ('multiple' in $$props) $$invalidate(17, multiple = $$props.multiple);
    		if ('inputValue' in $$props) $$subscribe_inputValue($$invalidate(3, inputValue = $$props.inputValue));
    		if ('hasDropdownOpened' in $$props) $$subscribe_hasDropdownOpened($$invalidate(4, hasDropdownOpened = $$props.hasDropdownOpened));
    		if ('selectedOptions' in $$props) $$invalidate(18, selectedOptions = $$props.selectedOptions);
    		if ('isAndroid' in $$props) $$invalidate(19, isAndroid = $$props.isAndroid);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedOptions, multiple*/ 393216) {
    			$$invalidate(20, isSingleFilled = selectedOptions.length > 0 && multiple === false);
    		}

    		if ($$self.$$.dirty[0] & /*selectedOptions, placeholder*/ 327680) {
    			$$invalidate(6, placeholderText = selectedOptions.length > 0 ? '' : placeholder);
    		}

    		if ($$self.$$.dirty[0] & /*$inputValue, placeholderText*/ 192) {
    			$$invalidate(11, shadowText = $inputValue || placeholderText);
    		}

    		if ($$self.$$.dirty[0] & /*selectedOptions*/ 262144) {
    			$$invalidate(21, widthAddition = selectedOptions.length === 0 ? 19 : 12);
    		}

    		if ($$self.$$.dirty[0] & /*isSingleFilled, shadowWidth, widthAddition*/ 3145760) {
    			$$invalidate(10, inputStyle = `width: ${isSingleFilled ? 2 : shadowWidth + widthAddition}px`);
    		}

    		if ($$self.$$.dirty[0] & /*isSingleFilled*/ 1048576) {
    			$$invalidate(9, enterHint = isSingleFilled ? null : 'enter');
    		}
    	};

    	return [
    		inputId,
    		searchable,
    		disabled,
    		inputValue,
    		hasDropdownOpened,
    		shadowWidth,
    		placeholderText,
    		$inputValue,
    		inputRef,
    		enterHint,
    		inputStyle,
    		shadowText,
    		onKeyDown,
    		onKeyUp,
    		onInput,
    		focus,
    		placeholder,
    		multiple,
    		selectedOptions,
    		isAndroid,
    		isSingleFilled,
    		widthAddition,
    		focus_handler,
    		blur_handler,
    		paste_handler,
    		change_handler,
    		input_binding,
    		input_input_handler,
    		div_elementresize_handler
    	];
    }

    class Input extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$h,
    			create_fragment$i,
    			safe_not_equal,
    			{
    				focus: 15,
    				inputId: 0,
    				placeholder: 16,
    				searchable: 1,
    				disabled: 2,
    				multiple: 17,
    				inputValue: 3,
    				hasDropdownOpened: 4,
    				selectedOptions: 18,
    				isAndroid: 19
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get focus() {
    		return this.$$.ctx[15];
    	}
    }

    /* src\components\Control.svelte generated by Svelte v3.55.1 */
    const get_control_end_slot_changes$1 = dirty => ({});
    const get_control_end_slot_context$1 = ctx => ({});

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i];
    	return child_ctx;
    }

    const get_collapsable_slot_changes = dirty => ({
    	selectedCount: dirty[0] & /*selectedOptionsLength*/ 4194304
    });

    const get_collapsable_slot_context = ctx => ({
    	selectedCount: /*selectedOptionsLength*/ ctx[22]
    });

    const get_icon_slot_changes$1 = dirty => ({});
    const get_icon_slot_context$1 = ctx => ({});

    // (79:4) {#if selectedOptionsLength }
    function create_if_block_2$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$1, create_if_block_4$1, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*virtualList*/ ctx[18] && /*collapsable*/ ctx[17] && /*selectedOptionsLength*/ ctx[22] > 1) return 0;
    		if (/*multiple*/ ctx[5] && /*collapseSelection*/ ctx[6] && /*doCollapse*/ ctx[20]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (88:6) {:else}
    function create_else_block$2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = /*selectedOptions*/ ctx[11];
    	const get_key = ctx => /*opt*/ ctx[42][/*currentValueField*/ ctx[14]];

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*itemComponent, renderer, selectedOptions, multiple, $inputValue, currentValueField*/ 8439844) {
    				each_value = /*selectedOptions*/ ctx[11];
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, fix_and_outro_and_destroy_block, create_each_block$4, each_1_anchor, get_each_context$4);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (86:60) 
    function create_if_block_4$1(ctx) {
    	let t_value = /*collapseSelection*/ ctx[6](/*selectedOptionsLength*/ ctx[22], /*selectedOptions*/ ctx[11]) + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*collapseSelection, selectedOptionsLength, selectedOptions*/ 4196416 && t_value !== (t_value = /*collapseSelection*/ ctx[6](/*selectedOptionsLength*/ ctx[22], /*selectedOptions*/ ctx[11]) + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (80:6) {#if virtualList && collapsable && selectedOptionsLength > 1}
    function create_if_block_3$1(ctx) {
    	let current;
    	const collapsable_slot_template = /*#slots*/ ctx[30].collapsable;
    	const collapsable_slot = create_slot(collapsable_slot_template, ctx, /*$$scope*/ ctx[29], get_collapsable_slot_context);
    	const collapsable_slot_or_fallback = collapsable_slot || fallback_block(ctx);

    	return {
    		c() {
    			if (collapsable_slot_or_fallback) collapsable_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (collapsable_slot_or_fallback) {
    				collapsable_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (collapsable_slot) {
    				if (collapsable_slot.p && (!current || dirty[0] & /*$$scope, selectedOptionsLength*/ 541065216)) {
    					update_slot_base(
    						collapsable_slot,
    						collapsable_slot_template,
    						ctx,
    						/*$$scope*/ ctx[29],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[29])
    						: get_slot_changes(collapsable_slot_template, /*$$scope*/ ctx[29], dirty, get_collapsable_slot_changes),
    						get_collapsable_slot_context
    					);
    				}
    			} else {
    				if (collapsable_slot_or_fallback && collapsable_slot_or_fallback.p && (!current || dirty[0] & /*selectedOptionsLength*/ 4194304)) {
    					collapsable_slot_or_fallback.p(ctx, !current ? [-1, -1] : dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(collapsable_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(collapsable_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (collapsable_slot_or_fallback) collapsable_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (89:8) {#each selectedOptions as opt (opt[currentValueField])}
    function create_each_block$4(key_1, ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let rect;
    	let stop_animation = noop;
    	let current;
    	var switch_value = /*itemComponent*/ ctx[15];

    	function switch_props(ctx) {
    		return {
    			props: {
    				formatter: /*renderer*/ ctx[2],
    				item: /*opt*/ ctx[42],
    				isSelected: true,
    				isMultiple: /*multiple*/ ctx[5],
    				inputValue: /*$inputValue*/ ctx[23]
    			}
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    		switch_instance.$on("deselect", /*deselect_handler*/ ctx[36]);
    	}

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			this.first = div;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (switch_instance) mount_component(switch_instance, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			const switch_instance_changes = {};
    			if (dirty[0] & /*renderer*/ 4) switch_instance_changes.formatter = /*renderer*/ ctx[2];
    			if (dirty[0] & /*selectedOptions*/ 2048) switch_instance_changes.item = /*opt*/ ctx[42];
    			if (dirty[0] & /*multiple*/ 32) switch_instance_changes.isMultiple = /*multiple*/ ctx[5];
    			if (dirty[0] & /*$inputValue*/ 8388608) switch_instance_changes.inputValue = /*$inputValue*/ ctx[23];

    			if (switch_value !== (switch_value = /*itemComponent*/ ctx[15])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    					switch_instance.$on("deselect", /*deselect_handler*/ ctx[36]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		r() {
    			rect = div.getBoundingClientRect();
    		},
    		f() {
    			fix_position(div);
    			stop_animation();
    		},
    		a() {
    			stop_animation();
    			stop_animation = create_animation(div, rect, flip, { duration: flipDurationMs });
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};
    }

    // (81:71)             
    function fallback_block(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*selectedOptionsLength*/ ctx[22]);
    			t1 = text(" selected");
    			attr(div0, "class", "sv-item-content");
    			attr(div1, "class", "sv-item");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, t0);
    			append(div0, t1);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedOptionsLength*/ 4194304) set_data(t0, /*selectedOptionsLength*/ ctx[22]);
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    		}
    	};
    }

    // (109:4) {#if clearable && selectedOptionsLength && !disabled}
    function create_if_block_1$3(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			div.innerHTML = `<svg class="indicator-icon svelte-1jlo1jg" height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>`;
    			attr(div, "aria-hidden", "true");
    			attr(div, "class", "indicator-container close-icon svelte-1jlo1jg");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen(div, "mousedown", prevent_default(/*mousedown_handler_1*/ ctx[33])),
    					listen(div, "click", /*click_handler*/ ctx[40])
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (117:4) {#if clearable}
    function create_if_block$5(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "indicator-separator svelte-1jlo1jg");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	let div3;
    	let t0;
    	let div0;
    	let t1;
    	let input;
    	let dndzone_action;
    	let t2;
    	let div2;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[30].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[29], get_icon_slot_context$1);
    	let if_block0 = /*selectedOptionsLength*/ ctx[22] && create_if_block_2$1(ctx);

    	let input_props = {
    		disabled: /*disabled*/ ctx[3],
    		searchable: /*searchable*/ ctx[1],
    		placeholder: /*placeholder*/ ctx[4],
    		multiple: /*multiple*/ ctx[5],
    		inputId: /*inputId*/ ctx[7],
    		inputValue: /*inputValue*/ ctx[8],
    		hasDropdownOpened: /*hasDropdownOpened*/ ctx[10],
    		selectedOptions: /*selectedOptions*/ ctx[11],
    		isAndroid: /*isAndroid*/ ctx[16]
    	};

    	input = new Input({ props: input_props });
    	/*input_binding*/ ctx[37](input);
    	input.$on("focus", /*onFocus*/ ctx[26]);
    	input.$on("blur", /*onBlur*/ ctx[27]);
    	input.$on("keydown", /*keydown_handler*/ ctx[38]);
    	input.$on("paste", /*paste_handler*/ ctx[39]);
    	let if_block1 = /*clearable*/ ctx[0] && /*selectedOptionsLength*/ ctx[22] && !/*disabled*/ ctx[3] && create_if_block_1$3(ctx);
    	let if_block2 = /*clearable*/ ctx[0] && create_if_block$5();
    	const control_end_slot_template = /*#slots*/ ctx[30]["control-end"];
    	const control_end_slot = create_slot(control_end_slot_template, ctx, /*$$scope*/ ctx[29], get_control_end_slot_context$1);

    	return {
    		c() {
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
    			div1.innerHTML = `<svg width="20" height="20" class="indicator-icon svelte-1jlo1jg" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg>`;
    			t5 = space();
    			if (control_end_slot) control_end_slot.c();
    			attr(div0, "class", "sv-content sv-input-row svelte-1jlo1jg");
    			toggle_class(div0, "has-multiSelection", /*multiple*/ ctx[5]);
    			attr(div1, "aria-hidden", "true");
    			attr(div1, "class", "indicator-container svelte-1jlo1jg");
    			attr(div2, "class", "indicator svelte-1jlo1jg");
    			toggle_class(div2, "is-loading", /*isFetchingData*/ ctx[12]);
    			attr(div3, "class", "sv-control svelte-1jlo1jg");
    			toggle_class(div3, "is-active", /*$hasFocus*/ ctx[24]);
    			toggle_class(div3, "is-disabled", /*disabled*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);

    			if (icon_slot) {
    				icon_slot.m(div3, null);
    			}

    			append(div3, t0);
    			append(div3, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t1);
    			mount_component(input, div0, null);
    			append(div3, t2);
    			append(div3, div2);
    			if (if_block1) if_block1.m(div2, null);
    			append(div2, t3);
    			if (if_block2) if_block2.m(div2, null);
    			append(div2, t4);
    			append(div2, div1);
    			append(div3, t5);

    			if (control_end_slot) {
    				control_end_slot.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(dndzone_action = /*dndzone*/ ctx[13].call(null, div0, {
    						items: /*selectedOptions*/ ctx[11],
    						flipDurationMs,
    						type: /*inputId*/ ctx[7]
    					})),
    					listen(div0, "consider", /*consider_handler*/ ctx[34]),
    					listen(div0, "finalize", /*finalize_handler*/ ctx[35]),
    					listen(div1, "mousedown", prevent_default(/*mousedown_handler_2*/ ctx[32])),
    					listen(div3, "mousedown", prevent_default(/*mousedown_handler*/ ctx[31])),
    					listen(div3, "click", prevent_default(/*focusControl*/ ctx[19]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (icon_slot) {
    				if (icon_slot.p && (!current || dirty[0] & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						icon_slot,
    						icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[29],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[29])
    						: get_slot_changes(icon_slot_template, /*$$scope*/ ctx[29], dirty, get_icon_slot_changes$1),
    						get_icon_slot_context$1
    					);
    				}
    			}

    			if (/*selectedOptionsLength*/ ctx[22]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*selectedOptionsLength*/ 4194304) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
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
    			if (dirty[0] & /*multiple*/ 32) input_changes.multiple = /*multiple*/ ctx[5];
    			if (dirty[0] & /*inputId*/ 128) input_changes.inputId = /*inputId*/ ctx[7];
    			if (dirty[0] & /*inputValue*/ 256) input_changes.inputValue = /*inputValue*/ ctx[8];
    			if (dirty[0] & /*hasDropdownOpened*/ 1024) input_changes.hasDropdownOpened = /*hasDropdownOpened*/ ctx[10];
    			if (dirty[0] & /*selectedOptions*/ 2048) input_changes.selectedOptions = /*selectedOptions*/ ctx[11];
    			if (dirty[0] & /*isAndroid*/ 65536) input_changes.isAndroid = /*isAndroid*/ ctx[16];
    			input.$set(input_changes);

    			if (dndzone_action && is_function(dndzone_action.update) && dirty[0] & /*selectedOptions, inputId*/ 2176) dndzone_action.update.call(null, {
    				items: /*selectedOptions*/ ctx[11],
    				flipDurationMs,
    				type: /*inputId*/ ctx[7]
    			});

    			if (!current || dirty[0] & /*multiple*/ 32) {
    				toggle_class(div0, "has-multiSelection", /*multiple*/ ctx[5]);
    			}

    			if (/*clearable*/ ctx[0] && /*selectedOptionsLength*/ ctx[22] && !/*disabled*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(div2, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*clearable*/ ctx[0]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block$5();
    					if_block2.c();
    					if_block2.m(div2, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty[0] & /*isFetchingData*/ 4096) {
    				toggle_class(div2, "is-loading", /*isFetchingData*/ ctx[12]);
    			}

    			if (control_end_slot) {
    				if (control_end_slot.p && (!current || dirty[0] & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						control_end_slot,
    						control_end_slot_template,
    						ctx,
    						/*$$scope*/ ctx[29],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[29])
    						: get_slot_changes(control_end_slot_template, /*$$scope*/ ctx[29], dirty, get_control_end_slot_changes$1),
    						get_control_end_slot_context$1
    					);
    				}
    			}

    			if (!current || dirty[0] & /*$hasFocus*/ 16777216) {
    				toggle_class(div3, "is-active", /*$hasFocus*/ ctx[24]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 8) {
    				toggle_class(div3, "is-disabled", /*disabled*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			transition_in(if_block0);
    			transition_in(input.$$.fragment, local);
    			transition_in(control_end_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(icon_slot, local);
    			transition_out(if_block0);
    			transition_out(input.$$.fragment, local);
    			transition_out(control_end_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			if (icon_slot) icon_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			/*input_binding*/ ctx[37](null);
    			destroy_component(input);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (control_end_slot) control_end_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    const flipDurationMs = 100;

    function instance$g($$self, $$props, $$invalidate) {
    	let selectedOptionsLength;

    	let $inputValue,
    		$$unsubscribe_inputValue = noop,
    		$$subscribe_inputValue = () => ($$unsubscribe_inputValue(), $$unsubscribe_inputValue = subscribe(inputValue, $$value => $$invalidate(23, $inputValue = $$value)), inputValue);

    	let $hasDropdownOpened,
    		$$unsubscribe_hasDropdownOpened = noop,
    		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(41, $hasDropdownOpened = $$value)), hasDropdownOpened);

    	let $hasFocus,
    		$$unsubscribe_hasFocus = noop,
    		$$subscribe_hasFocus = () => ($$unsubscribe_hasFocus(), $$unsubscribe_hasFocus = subscribe(hasFocus, $$value => $$invalidate(24, $hasFocus = $$value)), hasFocus);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_inputValue());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_hasDropdownOpened());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_hasFocus());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { clearable } = $$props;
    	let { searchable } = $$props;
    	let { renderer } = $$props;
    	let { disabled } = $$props;
    	let { placeholder } = $$props;
    	let { multiple } = $$props;
    	let { resetOnBlur } = $$props;
    	let { collapseSelection } = $$props;
    	let { inputId } = $$props;
    	let { inputValue } = $$props;
    	$$subscribe_inputValue();
    	let { hasFocus } = $$props;
    	$$subscribe_hasFocus();
    	let { hasDropdownOpened } = $$props;
    	$$subscribe_hasDropdownOpened();
    	let { selectedOptions } = $$props;
    	let { isFetchingData } = $$props;
    	let { dndzone } = $$props;
    	let { currentValueField } = $$props;
    	let { itemComponent } = $$props;
    	let { isAndroid } = $$props;
    	let { collapsable } = $$props;
    	let { virtualList } = $$props;

    	function focusControl(event) {
    		if (disabled) return;

    		if (!event) {
    			!$hasFocus && refInput.focus();
    			set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened);
    			return;
    		}

    		if (!$hasFocus) {
    			refInput.focus();
    		} else {
    			set_store_value(hasDropdownOpened, $hasDropdownOpened = !$hasDropdownOpened, $hasDropdownOpened);
    		}
    	}

    	/** ************************************ context */
    	const dispatch = createEventDispatcher();

    	let doCollapse = true;
    	let refInput = undefined;

    	function onFocus() {
    		set_store_value(hasFocus, $hasFocus = true, $hasFocus);
    		set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened);

    		setTimeout(
    			() => {
    				$$invalidate(20, doCollapse = false);
    			},
    			150
    		);
    	}

    	function onBlur() {
    		set_store_value(hasFocus, $hasFocus = false, $hasFocus);
    		set_store_value(hasDropdownOpened, $hasDropdownOpened = false, $hasDropdownOpened);
    		if (resetOnBlur) set_store_value(inputValue, $inputValue = '', $inputValue); // reset

    		setTimeout(
    			() => {
    				$$invalidate(20, doCollapse = true);
    			},
    			100
    		);

    		dispatch('blur');
    	}

    	function mousedown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mousedown_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mousedown_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function consider_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function finalize_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function deselect_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refInput = $$value;
    			$$invalidate(21, refInput);
    		});
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function paste_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const click_handler = () => dispatch('deselect');

    	$$self.$$set = $$props => {
    		if ('clearable' in $$props) $$invalidate(0, clearable = $$props.clearable);
    		if ('searchable' in $$props) $$invalidate(1, searchable = $$props.searchable);
    		if ('renderer' in $$props) $$invalidate(2, renderer = $$props.renderer);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ('placeholder' in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ('multiple' in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ('resetOnBlur' in $$props) $$invalidate(28, resetOnBlur = $$props.resetOnBlur);
    		if ('collapseSelection' in $$props) $$invalidate(6, collapseSelection = $$props.collapseSelection);
    		if ('inputId' in $$props) $$invalidate(7, inputId = $$props.inputId);
    		if ('inputValue' in $$props) $$subscribe_inputValue($$invalidate(8, inputValue = $$props.inputValue));
    		if ('hasFocus' in $$props) $$subscribe_hasFocus($$invalidate(9, hasFocus = $$props.hasFocus));
    		if ('hasDropdownOpened' in $$props) $$subscribe_hasDropdownOpened($$invalidate(10, hasDropdownOpened = $$props.hasDropdownOpened));
    		if ('selectedOptions' in $$props) $$invalidate(11, selectedOptions = $$props.selectedOptions);
    		if ('isFetchingData' in $$props) $$invalidate(12, isFetchingData = $$props.isFetchingData);
    		if ('dndzone' in $$props) $$invalidate(13, dndzone = $$props.dndzone);
    		if ('currentValueField' in $$props) $$invalidate(14, currentValueField = $$props.currentValueField);
    		if ('itemComponent' in $$props) $$invalidate(15, itemComponent = $$props.itemComponent);
    		if ('isAndroid' in $$props) $$invalidate(16, isAndroid = $$props.isAndroid);
    		if ('collapsable' in $$props) $$invalidate(17, collapsable = $$props.collapsable);
    		if ('virtualList' in $$props) $$invalidate(18, virtualList = $$props.virtualList);
    		if ('$$scope' in $$props) $$invalidate(29, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*selectedOptions*/ 2048) {
    			$$invalidate(22, selectedOptionsLength = selectedOptions.length);
    		}
    	};

    	return [
    		clearable,
    		searchable,
    		renderer,
    		disabled,
    		placeholder,
    		multiple,
    		collapseSelection,
    		inputId,
    		inputValue,
    		hasFocus,
    		hasDropdownOpened,
    		selectedOptions,
    		isFetchingData,
    		dndzone,
    		currentValueField,
    		itemComponent,
    		isAndroid,
    		collapsable,
    		virtualList,
    		focusControl,
    		doCollapse,
    		refInput,
    		selectedOptionsLength,
    		$inputValue,
    		$hasFocus,
    		dispatch,
    		onFocus,
    		onBlur,
    		resetOnBlur,
    		$$scope,
    		slots,
    		mousedown_handler,
    		mousedown_handler_2,
    		mousedown_handler_1,
    		consider_handler,
    		finalize_handler,
    		deselect_handler,
    		input_binding,
    		keydown_handler,
    		paste_handler,
    		click_handler
    	];
    }

    class Control extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$g,
    			create_fragment$h,
    			safe_not_equal,
    			{
    				clearable: 0,
    				searchable: 1,
    				renderer: 2,
    				disabled: 3,
    				placeholder: 4,
    				multiple: 5,
    				resetOnBlur: 28,
    				collapseSelection: 6,
    				inputId: 7,
    				inputValue: 8,
    				hasFocus: 9,
    				hasDropdownOpened: 10,
    				selectedOptions: 11,
    				isFetchingData: 12,
    				dndzone: 13,
    				currentValueField: 14,
    				itemComponent: 15,
    				isAndroid: 16,
    				collapsable: 17,
    				virtualList: 18,
    				focusControl: 19
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get focusControl() {
    		return this.$$.ctx[19];
    	}
    }

    const ALIGNMENT = {
    	AUTO:   'auto',
    	START:  'start',
    	CENTER: 'center',
    	END:    'end',
    };

    const DIRECTION = {
    	HORIZONTAL: 'horizontal',
    	VERTICAL:   'vertical',
    };

    const SCROLL_CHANGE_REASON = {
    	OBSERVED:  0,
    	REQUESTED: 1,
    };

    const SCROLL_PROP = {
    	[DIRECTION.VERTICAL]:   'top',
    	[DIRECTION.HORIZONTAL]: 'left',
    };

    const SCROLL_PROP_LEGACY = {
    	[DIRECTION.VERTICAL]:   'scrollTop',
    	[DIRECTION.HORIZONTAL]: 'scrollLeft',
    };

    /* Forked from react-virtualized 💖 */

    /**
     * @callback ItemSizeGetter
     * @param {number} index
     * @return {number}
     */

    /**
     * @typedef ItemSize
     * @type {number | number[] | ItemSizeGetter}
     */

    /**
     * @typedef SizeAndPosition
     * @type {object}
     * @property {number} size
     * @property {number} offset
     */

    /**
     * @typedef SizeAndPositionData
     * @type {Object.<number, SizeAndPosition>}
     */

    /**
     * @typedef Options
     * @type {object}
     * @property {number} itemCount
     * @property {ItemSize} itemSize
     * @property {number} estimatedItemSize
     */

    class SizeAndPositionManager {

    	/**
    	 * @param {Options} options
    	 */
    	constructor({ itemSize, itemCount, estimatedItemSize }) {
    		/**
    		 * @private
    		 * @type {ItemSize}
    		 */
    		this.itemSize = itemSize;

    		/**
    		 * @private
    		 * @type {number}
    		 */
    		this.itemCount = itemCount;

    		/**
    		 * @private
    		 * @type {number}
    		 */
    		this.estimatedItemSize = estimatedItemSize;

    		/**
    		 * Cache of size and position data for items, mapped by item index.
    		 *
    		 * @private
    		 * @type {SizeAndPositionData}
    		 */
    		this.itemSizeAndPositionData = {};

    		/**
    		 * Measurements for items up to this index can be trusted; items afterward should be estimated.
    		 *
    		 * @private
    		 * @type {number}
    		 */
    		this.lastMeasuredIndex = -1;

    		this.checkForMismatchItemSizeAndItemCount();

    		if (!this.justInTime) this.computeTotalSizeAndPositionData();
    	}

    	get justInTime() {
    		return typeof this.itemSize === 'function';
    	}

    	/**
    	 * @param {Options} options
    	 */
    	updateConfig({ itemSize, itemCount, estimatedItemSize }) {
    		if (itemCount != null) {
    			this.itemCount = itemCount;
    		}

    		if (estimatedItemSize != null) {
    			this.estimatedItemSize = estimatedItemSize;
    		}

    		if (itemSize != null) {
    			this.itemSize = itemSize;
    		}

    		this.checkForMismatchItemSizeAndItemCount();

    		if (this.justInTime && this.totalSize != null) {
    			this.totalSize = undefined;
    		} else {
    			this.computeTotalSizeAndPositionData();
    		}
    	}

    	checkForMismatchItemSizeAndItemCount() {
    		if (Array.isArray(this.itemSize) && this.itemSize.length < this.itemCount) {
    			throw Error(
    				`When itemSize is an array, itemSize.length can't be smaller than itemCount`,
    			);
    		}
    	}

    	/**
    	 * @param {number} index
    	 */
    	getSize(index) {
    		const { itemSize } = this;

    		if (typeof itemSize === 'function') {
    			return itemSize(index);
    		}

    		return Array.isArray(itemSize) ? itemSize[index] : itemSize;
    	}

    	/**
    	 * Compute the totalSize and itemSizeAndPositionData at the start,
    	 * only when itemSize is a number or an array.
    	 */
    	computeTotalSizeAndPositionData() {
    		let totalSize = 0;
    		for (let i = 0; i < this.itemCount; i++) {
    			const size = this.getSize(i);
    			const offset = totalSize;
    			totalSize += size;

    			this.itemSizeAndPositionData[i] = {
    				offset,
    				size,
    			};
    		}

    		this.totalSize = totalSize;
    	}

    	getLastMeasuredIndex() {
    		return this.lastMeasuredIndex;
    	}


    	/**
    	 * This method returns the size and position for the item at the specified index.
    	 *
    	 * @param {number} index
    	 */
    	getSizeAndPositionForIndex(index) {
    		if (index < 0 || index >= this.itemCount) {
    			throw Error(
    				`Requested index ${index} is outside of range 0..${this.itemCount}`,
    			);
    		}

    		return this.justInTime
    			? this.getJustInTimeSizeAndPositionForIndex(index)
    			: this.itemSizeAndPositionData[index];
    	}

    	/**
    	 * This is used when itemSize is a function.
    	 * just-in-time calculates (or used cached values) for items leading up to the index.
    	 *
    	 * @param {number} index
    	 */
    	getJustInTimeSizeAndPositionForIndex(index) {
    		if (index > this.lastMeasuredIndex) {
    			const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
    			let offset =
    				    lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size;

    			for (let i = this.lastMeasuredIndex + 1; i <= index; i++) {
    				const size = this.getSize(i);

    				if (size == null || isNaN(size)) {
    					throw Error(`Invalid size returned for index ${i} of value ${size}`);
    				}

    				this.itemSizeAndPositionData[i] = {
    					offset,
    					size,
    				};

    				offset += size;
    			}

    			this.lastMeasuredIndex = index;
    		}

    		return this.itemSizeAndPositionData[index];
    	}

    	getSizeAndPositionOfLastMeasuredItem() {
    		return this.lastMeasuredIndex >= 0
    			? this.itemSizeAndPositionData[this.lastMeasuredIndex]
    			: { offset: 0, size: 0 };
    	}

    	/**
    	 * Total size of all items being measured.
    	 *
    	 * @return {number}
    	 */
    	getTotalSize() {
    		// Return the pre computed totalSize when itemSize is number or array.
    		if (this.totalSize) return this.totalSize;

    		/**
    		 * When itemSize is a function,
    		 * This value will be completedly estimated initially.
    		 * As items as measured the estimate will be updated.
    		 */
    		const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();

    		return (
    			lastMeasuredSizeAndPosition.offset +
    			lastMeasuredSizeAndPosition.size +
    			(this.itemCount - this.lastMeasuredIndex - 1) * this.estimatedItemSize
    		);
    	}

    	/**
    	 * Determines a new offset that ensures a certain item is visible, given the alignment.
    	 *
    	 * @param {'auto' | 'start' | 'center' | 'end'} align Desired alignment within container
    	 * @param {number | undefined} containerSize Size (width or height) of the container viewport
    	 * @param {number | undefined} currentOffset
    	 * @param {number | undefined} targetIndex
    	 * @return {number} Offset to use to ensure the specified item is visible
    	 */
    	getUpdatedOffsetForIndex({ align = ALIGNMENT.START, containerSize, currentOffset, targetIndex }) {
    		if (containerSize <= 0) {
    			return 0;
    		}

    		const datum = this.getSizeAndPositionForIndex(targetIndex);
    		const maxOffset = datum.offset;
    		const minOffset = maxOffset - containerSize + datum.size;

    		let idealOffset;

    		switch (align) {
    			case ALIGNMENT.END:
    				idealOffset = minOffset;
    				break;
    			case ALIGNMENT.CENTER:
    				idealOffset = maxOffset - (containerSize - datum.size) / 2;
    				break;
    			case ALIGNMENT.START:
    				idealOffset = maxOffset;
    				break;
    			default:
    				idealOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
    		}

    		const totalSize = this.getTotalSize();

    		return Math.max(0, Math.min(totalSize - containerSize, idealOffset));
    	}

    	/**
    	 * @param {number} containerSize
    	 * @param {number} offset
    	 * @param {number} overscanCount
    	 * @return {{stop: number|undefined, start: number|undefined}}
    	 */
    	getVisibleRange({ containerSize = 0, offset, overscanCount }) {
    		const totalSize = this.getTotalSize();

    		if (totalSize === 0) {
    			return {};
    		}

    		const maxOffset = offset + containerSize;
    		let start = this.findNearestItem(offset);

    		if (start === undefined) {
    			throw Error(`Invalid offset ${offset} specified`);
    		}

    		const datum = this.getSizeAndPositionForIndex(start);
    		offset = datum.offset + datum.size;

    		let stop = start;

    		while (offset < maxOffset && stop < this.itemCount - 1) {
    			stop++;
    			offset += this.getSizeAndPositionForIndex(stop).size;
    		}

    		if (overscanCount) {
    			start = Math.max(0, start - overscanCount);
    			stop = Math.min(stop + overscanCount, this.itemCount - 1);
    		}

    		return {
    			start,
    			stop,
    		};
    	}

    	/**
    	 * Clear all cached values for items after the specified index.
    	 * This method should be called for any item that has changed its size.
    	 * It will not immediately perform any calculations; they'll be performed the next time getSizeAndPositionForIndex() is called.
    	 *
    	 * @param {number} index
    	 */
    	resetItem(index) {
    		this.lastMeasuredIndex = Math.min(this.lastMeasuredIndex, index - 1);
    	}

    	/**
    	 * Searches for the item (index) nearest the specified offset.
    	 *
    	 * If no exact match is found the next lowest item index will be returned.
    	 * This allows partially visible items (with offsets just before/above the fold) to be visible.
    	 *
    	 * @param {number} offset
    	 */
    	findNearestItem(offset) {
    		if (isNaN(offset)) {
    			throw Error(`Invalid offset ${offset} specified`);
    		}

    		// Our search algorithms find the nearest match at or below the specified offset.
    		// So make sure the offset is at least 0 or no match will be found.
    		offset = Math.max(0, offset);

    		const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
    		const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex);

    		if (lastMeasuredSizeAndPosition.offset >= offset) {
    			// If we've already measured items within this range just use a binary search as it's faster.
    			return this.binarySearch({
    				high: lastMeasuredIndex,
    				low:  0,
    				offset,
    			});
    		} else {
    			// If we haven't yet measured this high, fallback to an exponential search with an inner binary search.
    			// The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
    			// The overall complexity for this approach is O(log n).
    			return this.exponentialSearch({
    				index: lastMeasuredIndex,
    				offset,
    			});
    		}
    	}

    	/**
    	 * @private
    	 * @param {number} low
    	 * @param {number} high
    	 * @param {number} offset
    	 */
    	binarySearch({ low, high, offset }) {
    		let middle = 0;
    		let currentOffset = 0;

    		while (low <= high) {
    			middle = low + Math.floor((high - low) / 2);
    			currentOffset = this.getSizeAndPositionForIndex(middle).offset;

    			if (currentOffset === offset) {
    				return middle;
    			} else if (currentOffset < offset) {
    				low = middle + 1;
    			} else if (currentOffset > offset) {
    				high = middle - 1;
    			}
    		}

    		if (low > 0) {
    			return low - 1;
    		}

    		return 0;
    	}

    	/**
    	 * @private
    	 * @param {number} index
    	 * @param {number} offset
    	 */
    	exponentialSearch({ index, offset }) {
    		let interval = 1;

    		while (
    			index < this.itemCount &&
    			this.getSizeAndPositionForIndex(index).offset < offset
    			) {
    			index += interval;
    			interval *= 2;
    		}

    		return this.binarySearch({
    			high: Math.min(index, this.itemCount - 1),
    			low:  Math.floor(index / 2),
    			offset,
    		});
    	}
    }

    /* node_modules\svelte-tiny-virtual-list\src\VirtualList.svelte generated by Svelte v3.55.1 */

    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({
    	style: dirty[0] & /*items*/ 4,
    	index: dirty[0] & /*items*/ 4
    });

    const get_item_slot_context = ctx => ({
    	style: /*item*/ ctx[37].style,
    	index: /*item*/ ctx[37].index
    });

    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (331:2) {#each items as item (getKey ? getKey(item.index) : item.index)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let current;
    	const item_slot_template = /*#slots*/ ctx[21].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[20], get_item_slot_context);

    	return {
    		key: key_1,
    		first: null,
    		c() {
    			first = empty();
    			if (item_slot) item_slot.c();
    			this.first = first;
    		},
    		m(target, anchor) {
    			insert(target, first, anchor);

    			if (item_slot) {
    				item_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (item_slot) {
    				if (item_slot.p && (!current || dirty[0] & /*$$scope, items*/ 1048580)) {
    					update_slot_base(
    						item_slot,
    						item_slot_template,
    						ctx,
    						/*$$scope*/ ctx[20],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[20])
    						: get_slot_changes(item_slot_template, /*$$scope*/ ctx[20], dirty, get_item_slot_changes),
    						get_item_slot_context
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(first);
    			if (item_slot) item_slot.d(detaching);
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[21].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[20], get_header_slot_context);
    	let each_value = /*items*/ ctx[2];

    	const get_key = ctx => /*getKey*/ ctx[0]
    	? /*getKey*/ ctx[0](/*item*/ ctx[37].index)
    	: /*item*/ ctx[37].index;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const footer_slot_template = /*#slots*/ ctx[21].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[20], get_footer_slot_context);

    	return {
    		c() {
    			div1 = element("div");
    			if (header_slot) header_slot.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			if (footer_slot) footer_slot.c();
    			attr(div0, "class", "virtual-list-inner svelte-dwpad5");
    			attr(div0, "style", /*innerStyle*/ ctx[4]);
    			attr(div1, "class", "virtual-list-wrapper svelte-dwpad5");
    			attr(div1, "style", /*wrapperStyle*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);

    			if (header_slot) {
    				header_slot.m(div1, null);
    			}

    			append(div1, t0);
    			append(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append(div1, t1);

    			if (footer_slot) {
    				footer_slot.m(div1, null);
    			}

    			/*div1_binding*/ ctx[22](div1);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty[0] & /*$$scope*/ 1048576)) {
    					update_slot_base(
    						header_slot,
    						header_slot_template,
    						ctx,
    						/*$$scope*/ ctx[20],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[20])
    						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[20], dirty, get_header_slot_changes),
    						get_header_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*$$scope, items, getKey*/ 1048581) {
    				each_value = /*items*/ ctx[2];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*innerStyle*/ 16) {
    				attr(div0, "style", /*innerStyle*/ ctx[4]);
    			}

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty[0] & /*$$scope*/ 1048576)) {
    					update_slot_base(
    						footer_slot,
    						footer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[20],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[20])
    						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[20], dirty, get_footer_slot_changes),
    						get_footer_slot_context
    					);
    				}
    			}

    			if (!current || dirty[0] & /*wrapperStyle*/ 8) {
    				attr(div1, "style", /*wrapperStyle*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(header_slot, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(footer_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(header_slot, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(footer_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (header_slot) header_slot.d(detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (footer_slot) footer_slot.d(detaching);
    			/*div1_binding*/ ctx[22](null);
    		}
    	};
    }

    const thirdEventArg = (() => {
    	let result = false;

    	try {
    		const arg = Object.defineProperty({}, 'passive', {
    			get() {
    				result = { passive: true };
    				return true;
    			}
    		});

    		window.addEventListener('testpassive', arg, arg);
    		window.remove('testpassive', arg, arg);
    	} catch(e) {
    		
    	} /* */

    	return result;
    })();

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { height } = $$props;
    	let { width = '100%' } = $$props;
    	let { itemCount } = $$props;
    	let { itemSize } = $$props;
    	let { estimatedItemSize = null } = $$props;
    	let { stickyIndices = null } = $$props;
    	let { getKey = null } = $$props;
    	let { scrollDirection = DIRECTION.VERTICAL } = $$props;
    	let { scrollOffset = null } = $$props;
    	let { scrollToIndex = null } = $$props;
    	let { scrollToAlignment = null } = $$props;
    	let { scrollToBehaviour = 'instant' } = $$props;
    	let { overscanCount = 3 } = $$props;
    	const dispatchEvent = createEventDispatcher();

    	const sizeAndPositionManager = new SizeAndPositionManager({
    			itemCount,
    			itemSize,
    			estimatedItemSize: getEstimatedItemSize()
    		});

    	let mounted = false;
    	let wrapper;
    	let items = [];

    	let state = {
    		offset: scrollOffset || scrollToIndex != null && items.length && getOffsetForIndex(scrollToIndex) || 0,
    		scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
    	};

    	let prevState = state;

    	let prevProps = {
    		scrollToIndex,
    		scrollToAlignment,
    		scrollOffset,
    		itemCount,
    		itemSize,
    		estimatedItemSize
    	};

    	let styleCache = {};
    	let wrapperStyle = '';
    	let innerStyle = '';
    	refresh(); // Initial Load

    	onMount(() => {
    		$$invalidate(18, mounted = true);
    		wrapper.addEventListener('scroll', handleScroll, thirdEventArg);

    		if (scrollOffset != null) {
    			scrollTo(scrollOffset);
    		} else if (scrollToIndex != null) {
    			scrollTo(getOffsetForIndex(scrollToIndex));
    		}
    	});

    	onDestroy(() => {
    		if (mounted) wrapper.removeEventListener('scroll', handleScroll);
    	});

    	function propsUpdated() {
    		if (!mounted) return;
    		const scrollPropsHaveChanged = prevProps.scrollToIndex !== scrollToIndex || prevProps.scrollToAlignment !== scrollToAlignment;
    		const itemPropsHaveChanged = prevProps.itemCount !== itemCount || prevProps.itemSize !== itemSize || prevProps.estimatedItemSize !== estimatedItemSize;

    		if (itemPropsHaveChanged) {
    			sizeAndPositionManager.updateConfig({
    				itemSize,
    				itemCount,
    				estimatedItemSize: getEstimatedItemSize()
    			});

    			recomputeSizes();
    		}

    		if (prevProps.scrollOffset !== scrollOffset) {
    			$$invalidate(19, state = {
    				offset: scrollOffset || 0,
    				scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
    			});
    		} else if (typeof scrollToIndex === 'number' && (scrollPropsHaveChanged || itemPropsHaveChanged)) {
    			$$invalidate(19, state = {
    				offset: getOffsetForIndex(scrollToIndex, scrollToAlignment, itemCount),
    				scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
    			});
    		}

    		prevProps = {
    			scrollToIndex,
    			scrollToAlignment,
    			scrollOffset,
    			itemCount,
    			itemSize,
    			estimatedItemSize
    		};
    	}

    	function stateUpdated() {
    		if (!mounted) return;
    		const { offset, scrollChangeReason } = state;

    		if (prevState.offset !== offset || prevState.scrollChangeReason !== scrollChangeReason) {
    			refresh();
    		}

    		if (prevState.offset !== offset && scrollChangeReason === SCROLL_CHANGE_REASON.REQUESTED) {
    			scrollTo(offset);
    		}

    		prevState = state;
    	}

    	function refresh() {
    		const { offset } = state;

    		const { start, stop } = sizeAndPositionManager.getVisibleRange({
    			containerSize: scrollDirection === DIRECTION.VERTICAL ? height : width,
    			offset,
    			overscanCount
    		});

    		let updatedItems = [];
    		const totalSize = sizeAndPositionManager.getTotalSize();

    		if (scrollDirection === DIRECTION.VERTICAL) {
    			$$invalidate(3, wrapperStyle = `height:${height}px;width:${width};`);
    			$$invalidate(4, innerStyle = `flex-direction:column;height:${totalSize}px;`);
    		} else {
    			$$invalidate(3, wrapperStyle = `height:${height};width:${width}px`);
    			$$invalidate(4, innerStyle = `min-height:100%;width:${totalSize}px;`);
    		}

    		const hasStickyIndices = stickyIndices != null && stickyIndices.length !== 0;

    		if (hasStickyIndices) {
    			for (let i = 0; i < stickyIndices.length; i++) {
    				const index = stickyIndices[i];
    				updatedItems.push({ index, style: getStyle(index, true) });
    			}
    		}

    		if (start !== undefined && stop !== undefined) {
    			for (let index = start; index <= stop; index++) {
    				if (hasStickyIndices && stickyIndices.includes(index)) {
    					continue;
    				}

    				updatedItems.push({ index, style: getStyle(index, false) });
    			}

    			dispatchEvent('itemsUpdated', { start, end: stop });
    		}

    		$$invalidate(2, items = updatedItems);
    	}

    	function scrollTo(value) {
    		if ('scroll' in wrapper) {
    			wrapper.scroll({
    				[SCROLL_PROP[scrollDirection]]: value,
    				behavior: scrollToBehaviour
    			});
    		} else {
    			$$invalidate(1, wrapper[SCROLL_PROP_LEGACY[scrollDirection]] = value, wrapper);
    		}
    	}

    	function recomputeSizes(startIndex = 0) {
    		styleCache = {};
    		sizeAndPositionManager.resetItem(startIndex);
    		refresh();
    	}

    	function getOffsetForIndex(index, align = scrollToAlignment, _itemCount = itemCount) {
    		if (index < 0 || index >= _itemCount) {
    			index = 0;
    		}

    		return sizeAndPositionManager.getUpdatedOffsetForIndex({
    			align,
    			containerSize: scrollDirection === DIRECTION.VERTICAL ? height : width,
    			currentOffset: state.offset || 0,
    			targetIndex: index
    		});
    	}

    	function handleScroll(event) {
    		const offset = getWrapperOffset();
    		if (offset < 0 || state.offset === offset || event.target !== wrapper) return;

    		$$invalidate(19, state = {
    			offset,
    			scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED
    		});

    		dispatchEvent('afterScroll', { offset, event });
    	}

    	function getWrapperOffset() {
    		return wrapper[SCROLL_PROP_LEGACY[scrollDirection]];
    	}

    	function getEstimatedItemSize() {
    		return estimatedItemSize || typeof itemSize === 'number' && itemSize || 50;
    	}

    	function getStyle(index, sticky) {
    		if (styleCache[index]) return styleCache[index];
    		const { size, offset } = sizeAndPositionManager.getSizeAndPositionForIndex(index);
    		let style;

    		if (scrollDirection === DIRECTION.VERTICAL) {
    			style = `left:0;width:100%;height:${size}px;`;

    			if (sticky) {
    				style += `position:sticky;flex-grow:0;z-index:1;top:0;margin-top:${offset}px;margin-bottom:${-(offset + size)}px;`;
    			} else {
    				style += `position:absolute;top:${offset}px;`;
    			}
    		} else {
    			style = `top:0;width:${size}px;`;

    			if (sticky) {
    				style += `position:sticky;z-index:1;left:0;margin-left:${offset}px;margin-right:${-(offset + size)}px;`;
    			} else {
    				style += `position:absolute;height:100%;left:${offset}px;`;
    			}
    		}

    		return styleCache[index] = style;
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrapper = $$value;
    			$$invalidate(1, wrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('height' in $$props) $$invalidate(5, height = $$props.height);
    		if ('width' in $$props) $$invalidate(6, width = $$props.width);
    		if ('itemCount' in $$props) $$invalidate(7, itemCount = $$props.itemCount);
    		if ('itemSize' in $$props) $$invalidate(8, itemSize = $$props.itemSize);
    		if ('estimatedItemSize' in $$props) $$invalidate(9, estimatedItemSize = $$props.estimatedItemSize);
    		if ('stickyIndices' in $$props) $$invalidate(10, stickyIndices = $$props.stickyIndices);
    		if ('getKey' in $$props) $$invalidate(0, getKey = $$props.getKey);
    		if ('scrollDirection' in $$props) $$invalidate(11, scrollDirection = $$props.scrollDirection);
    		if ('scrollOffset' in $$props) $$invalidate(12, scrollOffset = $$props.scrollOffset);
    		if ('scrollToIndex' in $$props) $$invalidate(13, scrollToIndex = $$props.scrollToIndex);
    		if ('scrollToAlignment' in $$props) $$invalidate(14, scrollToAlignment = $$props.scrollToAlignment);
    		if ('scrollToBehaviour' in $$props) $$invalidate(15, scrollToBehaviour = $$props.scrollToBehaviour);
    		if ('overscanCount' in $$props) $$invalidate(16, overscanCount = $$props.overscanCount);
    		if ('$$scope' in $$props) $$invalidate(20, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*scrollToIndex, scrollToAlignment, scrollOffset, itemCount, itemSize, estimatedItemSize*/ 29568) {
    			{

    				propsUpdated();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 524288) {
    			{

    				stateUpdated();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*height, width, stickyIndices, mounted*/ 263264) {
    			{

    				if (mounted) recomputeSizes(0); // call scroll.reset;
    			}
    		}
    	};

    	return [
    		getKey,
    		wrapper,
    		items,
    		wrapperStyle,
    		innerStyle,
    		height,
    		width,
    		itemCount,
    		itemSize,
    		estimatedItemSize,
    		stickyIndices,
    		scrollDirection,
    		scrollOffset,
    		scrollToIndex,
    		scrollToAlignment,
    		scrollToBehaviour,
    		overscanCount,
    		recomputeSizes,
    		mounted,
    		state,
    		$$scope,
    		slots,
    		div1_binding
    	];
    }

    class VirtualList extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$f,
    			create_fragment$g,
    			safe_not_equal,
    			{
    				height: 5,
    				width: 6,
    				itemCount: 7,
    				itemSize: 8,
    				estimatedItemSize: 9,
    				stickyIndices: 10,
    				getKey: 0,
    				scrollDirection: 11,
    				scrollOffset: 12,
    				scrollToIndex: 13,
    				scrollToAlignment: 14,
    				scrollToBehaviour: 15,
    				overscanCount: 16,
    				recomputeSizes: 17
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get recomputeSizes() {
    		return this.$$.ctx[17];
    	}
    }

    /* src\components\Dropdown.svelte generated by Svelte v3.55.1 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[53] = list[i];
    	child_ctx[55] = i;
    	return child_ctx;
    }

    // (180:0) {#if showDropdown}
    function create_if_block$4(ctx) {
    	let div2;
    	let t0;
    	let div1;
    	let div0;
    	let t1;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*collapsable*/ ctx[17] && /*virtualList*/ ctx[7] && create_if_block_6(ctx);
    	let if_block1 = /*items*/ ctx[5].length && create_if_block_4(ctx);
    	let if_block2 = (/*hasEmptyList*/ ctx[19] || /*maxReached*/ ctx[2]) && create_if_block_3(ctx);
    	let if_block3 = /*inputValue*/ ctx[8] && /*creatable*/ ctx[1] && !/*maxReached*/ ctx[2] && create_if_block_1$2(ctx);

    	return {
    		c() {
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			attr(div0, "class", "sv-dropdown-content svelte-14fyqkc");
    			toggle_class(div0, "max-reached", /*maxReached*/ ctx[2]);
    			attr(div1, "class", "sv-dropdown-scroll svelte-14fyqkc");
    			attr(div1, "tabindex", "-1");
    			toggle_class(div1, "is-empty", !/*items*/ ctx[5].length);
    			attr(div2, "class", "sv-dropdown svelte-14fyqkc");
    			attr(div2, "aria-expanded", /*$hasDropdownOpened*/ ctx[27]);
    			toggle_class(div2, "is-virtual", /*virtualList*/ ctx[7]);
    			toggle_class(div2, "is-selected-dropdown", /*type*/ ctx[18] === "selected");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			if (if_block0) if_block0.m(div2, null);
    			append(div2, t0);
    			append(div2, div1);
    			append(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			/*div0_binding*/ ctx[44](div0);
    			/*div1_binding*/ ctx[45](div1);
    			append(div2, t2);
    			if (if_block3) if_block3.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div2, "mousedown", prevent_default(/*mousedown_handler*/ ctx[38]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*collapsable*/ ctx[17] && /*virtualList*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*items*/ ctx[5].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*items*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*hasEmptyList*/ ctx[19] || /*maxReached*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty[0] & /*maxReached*/ 4) {
    				toggle_class(div0, "max-reached", /*maxReached*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*items*/ 32) {
    				toggle_class(div1, "is-empty", !/*items*/ ctx[5].length);
    			}

    			if (/*inputValue*/ ctx[8] && /*creatable*/ ctx[1] && !/*maxReached*/ ctx[2]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_1$2(ctx);
    					if_block3.c();
    					if_block3.m(div2, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (!current || dirty[0] & /*$hasDropdownOpened*/ 134217728) {
    				attr(div2, "aria-expanded", /*$hasDropdownOpened*/ ctx[27]);
    			}

    			if (!current || dirty[0] & /*virtualList*/ 128) {
    				toggle_class(div2, "is-virtual", /*virtualList*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*type*/ 262144) {
    				toggle_class(div2, "is-selected-dropdown", /*type*/ ctx[18] === "selected");
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			/*div0_binding*/ ctx[44](null);
    			/*div1_binding*/ ctx[45](null);
    			if (if_block3) if_block3.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (184:2) {#if collapsable && virtualList}
    function create_if_block_6(ctx) {
    	let span;

    	let t_value = (/*type*/ ctx[18] === "selected"
    	? "Selected items"
    	: "Available items") + "";

    	let t;

    	return {
    		c() {
    			span = element("span");
    			t = text(t_value);
    			attr(span, "class", "sv-collapsable-title svelte-14fyqkc");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*type*/ 262144 && t_value !== (t_value = (/*type*/ ctx[18] === "selected"
    			? "Selected items"
    			: "Available items") + "")) set_data(t, t_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (189:4) {#if items.length}
    function create_if_block_4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*virtualList*/ ctx[7]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    // (215:6) {:else}
    function create_else_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*items*/ ctx[5];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*listIndex, dropdownIndex, items, itemComponent, renderer, disabledField, inputValue, disableHighlight*/ 75065) {
    				each_value = /*items*/ ctx[5];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    		i(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(each_1_anchor);
    		}
    	};
    }

    // (190:6) {#if virtualList}
    function create_if_block_5(ctx) {
    	let virtuallist;
    	let current;

    	let virtuallist_props = {
    		width: "100%",
    		height: /*vl_listHeight*/ ctx[25],
    		itemCount: /*items*/ ctx[5].length,
    		itemSize: /*vl_itemSize*/ ctx[20],
    		scrollToAlignment: "auto",
    		scrollToIndex: !/*multiple*/ ctx[9] && /*dropdownIndex*/ ctx[0]
    		? parseInt(/*dropdownIndex*/ ctx[0])
    		: null,
    		$$slots: {
    			item: [
    				create_item_slot,
    				({ style, index }) => ({ 51: style, 52: index }),
    				({ style, index }) => [0, (style ? 1048576 : 0) | (index ? 2097152 : 0)]
    			]
    		},
    		$$scope: { ctx }
    	};

    	virtuallist = new VirtualList({ props: virtuallist_props });
    	/*virtuallist_binding*/ ctx[41](virtuallist);

    	return {
    		c() {
    			create_component(virtuallist.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(virtuallist, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const virtuallist_changes = {};
    			if (dirty[0] & /*vl_listHeight*/ 33554432) virtuallist_changes.height = /*vl_listHeight*/ ctx[25];
    			if (dirty[0] & /*items*/ 32) virtuallist_changes.itemCount = /*items*/ ctx[5].length;
    			if (dirty[0] & /*vl_itemSize*/ 1048576) virtuallist_changes.itemSize = /*vl_itemSize*/ ctx[20];

    			if (dirty[0] & /*multiple, dropdownIndex*/ 513) virtuallist_changes.scrollToIndex = !/*multiple*/ ctx[9] && /*dropdownIndex*/ ctx[0]
    			? parseInt(/*dropdownIndex*/ ctx[0])
    			: null;

    			if (dirty[0] & /*dropdownIndex, items, itemComponent, renderer, listIndex, disabledField, inputValue, disableHighlight*/ 75065 | dirty[1] & /*$$scope, style, index*/ 36700160) {
    				virtuallist_changes.$$scope = { dirty, ctx };
    			}

    			virtuallist.$set(virtuallist_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(virtuallist.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(virtuallist.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			/*virtuallist_binding*/ ctx[41](null);
    			destroy_component(virtuallist, detaching);
    		}
    	};
    }

    // (216:8) {#each items as opt, i}
    function create_each_block$2(ctx) {
    	let div;
    	let switch_instance;
    	let t;
    	let div_data_pos_value;
    	let current;
    	var switch_value = /*itemComponent*/ ctx[16];

    	function switch_props(ctx) {
    		return {
    			props: {
    				formatter: /*renderer*/ ctx[3],
    				index: /*listIndex*/ ctx[10].map[/*i*/ ctx[55]],
    				isDisabled: /*opt*/ ctx[53][/*disabledField*/ ctx[13]],
    				item: /*opt*/ ctx[53],
    				inputValue: /*inputValue*/ ctx[8],
    				disableHighlight: /*disableHighlight*/ ctx[4]
    			}
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    		switch_instance.$on("hover", /*hover_handler_1*/ ctx[42]);
    		switch_instance.$on("select", /*select_handler_1*/ ctx[43]);
    	}

    	return {
    		c() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			t = space();
    			attr(div, "data-pos", div_data_pos_value = /*listIndex*/ ctx[10].map[/*i*/ ctx[55]]);
    			attr(div, "class", "sv-dd-item");
    			toggle_class(div, "sv-dd-item-active", /*listIndex*/ ctx[10].map[/*i*/ ctx[55]] == /*dropdownIndex*/ ctx[0]);
    			toggle_class(div, "sv-group-item", /*opt*/ ctx[53].$isGroupItem);
    			toggle_class(div, "sv-group-header", /*opt*/ ctx[53].$isGroupHeader);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (switch_instance) mount_component(switch_instance, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*renderer*/ 8) switch_instance_changes.formatter = /*renderer*/ ctx[3];
    			if (dirty[0] & /*listIndex*/ 1024) switch_instance_changes.index = /*listIndex*/ ctx[10].map[/*i*/ ctx[55]];
    			if (dirty[0] & /*items, disabledField*/ 8224) switch_instance_changes.isDisabled = /*opt*/ ctx[53][/*disabledField*/ ctx[13]];
    			if (dirty[0] & /*items*/ 32) switch_instance_changes.item = /*opt*/ ctx[53];
    			if (dirty[0] & /*inputValue*/ 256) switch_instance_changes.inputValue = /*inputValue*/ ctx[8];
    			if (dirty[0] & /*disableHighlight*/ 16) switch_instance_changes.disableHighlight = /*disableHighlight*/ ctx[4];

    			if (switch_value !== (switch_value = /*itemComponent*/ ctx[16])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    					switch_instance.$on("hover", /*hover_handler_1*/ ctx[42]);
    					switch_instance.$on("select", /*select_handler_1*/ ctx[43]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, t);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[0] & /*listIndex*/ 1024 && div_data_pos_value !== (div_data_pos_value = /*listIndex*/ ctx[10].map[/*i*/ ctx[55]])) {
    				attr(div, "data-pos", div_data_pos_value);
    			}

    			if (!current || dirty[0] & /*listIndex, dropdownIndex*/ 1025) {
    				toggle_class(div, "sv-dd-item-active", /*listIndex*/ ctx[10].map[/*i*/ ctx[55]] == /*dropdownIndex*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*items*/ 32) {
    				toggle_class(div, "sv-group-item", /*opt*/ ctx[53].$isGroupItem);
    			}

    			if (!current || dirty[0] & /*items*/ 32) {
    				toggle_class(div, "sv-group-header", /*opt*/ ctx[53].$isGroupHeader);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};
    }

    // (199:10) 
    function create_item_slot(ctx) {
    	let div;
    	let switch_instance;
    	let div_style_value;
    	let current;
    	var switch_value = /*itemComponent*/ ctx[16];

    	function switch_props(ctx) {
    		return {
    			props: {
    				formatter: /*renderer*/ ctx[3],
    				index: /*listIndex*/ ctx[10].map[/*index*/ ctx[52]],
    				isDisabled: /*items*/ ctx[5][/*index*/ ctx[52]][/*disabledField*/ ctx[13]],
    				item: /*items*/ ctx[5][/*index*/ ctx[52]],
    				inputValue: /*inputValue*/ ctx[8],
    				disableHighlight: /*disableHighlight*/ ctx[4]
    			}
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    		switch_instance.$on("hover", /*hover_handler*/ ctx[39]);
    		switch_instance.$on("select", /*select_handler*/ ctx[40]);
    	}

    	return {
    		c() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr(div, "slot", "item");
    			attr(div, "style", div_style_value = /*style*/ ctx[51]);
    			attr(div, "class", "sv-dd-item");
    			toggle_class(div, "sv-dd-item-active", /*index*/ ctx[52] == /*dropdownIndex*/ ctx[0]);
    			toggle_class(div, "sv-group-item", /*items*/ ctx[5][/*index*/ ctx[52]].$isGroupItem);
    			toggle_class(div, "sv-group-header", /*items*/ ctx[5][/*index*/ ctx[52]].$isGroupHeader);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (switch_instance) mount_component(switch_instance, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const switch_instance_changes = {};
    			if (dirty[0] & /*renderer*/ 8) switch_instance_changes.formatter = /*renderer*/ ctx[3];
    			if (dirty[0] & /*listIndex*/ 1024 | dirty[1] & /*index*/ 2097152) switch_instance_changes.index = /*listIndex*/ ctx[10].map[/*index*/ ctx[52]];
    			if (dirty[0] & /*items, disabledField*/ 8224 | dirty[1] & /*index*/ 2097152) switch_instance_changes.isDisabled = /*items*/ ctx[5][/*index*/ ctx[52]][/*disabledField*/ ctx[13]];
    			if (dirty[0] & /*items*/ 32 | dirty[1] & /*index*/ 2097152) switch_instance_changes.item = /*items*/ ctx[5][/*index*/ ctx[52]];
    			if (dirty[0] & /*inputValue*/ 256) switch_instance_changes.inputValue = /*inputValue*/ ctx[8];
    			if (dirty[0] & /*disableHighlight*/ 16) switch_instance_changes.disableHighlight = /*disableHighlight*/ ctx[4];

    			if (switch_value !== (switch_value = /*itemComponent*/ ctx[16])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    					switch_instance.$on("hover", /*hover_handler*/ ctx[39]);
    					switch_instance.$on("select", /*select_handler*/ ctx[40]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}

    			if (!current || dirty[1] & /*style*/ 1048576 && div_style_value !== (div_style_value = /*style*/ ctx[51])) {
    				attr(div, "style", div_style_value);
    			}

    			if (!current || dirty[0] & /*dropdownIndex*/ 1 | dirty[1] & /*index*/ 2097152) {
    				toggle_class(div, "sv-dd-item-active", /*index*/ ctx[52] == /*dropdownIndex*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*items*/ 32 | dirty[1] & /*index*/ 2097152) {
    				toggle_class(div, "sv-group-item", /*items*/ ctx[5][/*index*/ ctx[52]].$isGroupItem);
    			}

    			if (!current || dirty[0] & /*items*/ 32 | dirty[1] & /*index*/ 2097152) {
    				toggle_class(div, "sv-group-header", /*items*/ ctx[5][/*index*/ ctx[52]].$isGroupHeader);
    			}
    		},
    		i(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};
    }

    // (235:4) {#if hasEmptyList || maxReached}
    function create_if_block_3(ctx) {
    	let div;
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(/*listMessage*/ ctx[12]);
    			attr(div, "class", "empty-list-row svelte-14fyqkc");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*listMessage*/ 4096) set_data(t, /*listMessage*/ ctx[12]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (240:2) {#if inputValue && creatable && !maxReached}
    function create_if_block_1$2(ctx) {
    	let div1;
    	let div0;
    	let html_tag;
    	let raw_value = /*createLabel*/ ctx[14](/*inputValue*/ ctx[8]) + "";
    	let t;
    	let mounted;
    	let dispose;
    	let if_block = /*currentListLength*/ ctx[26] != /*dropdownIndex*/ ctx[0] && create_if_block_2(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			html_tag = new HtmlTag(false);
    			t = space();
    			if (if_block) if_block.c();
    			html_tag.a = t;
    			attr(div0, "class", "creatable-row svelte-14fyqkc");
    			toggle_class(div0, "active", /*currentListLength*/ ctx[26] == /*dropdownIndex*/ ctx[0]);
    			toggle_class(div0, "is-disabled", /*alreadyCreated*/ ctx[6].includes(/*inputValue*/ ctx[8]));
    			attr(div1, "class", "creatable-row-wrap svelte-14fyqkc");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			html_tag.m(raw_value, div0);
    			append(div0, t);
    			if (if_block) if_block.m(div0, null);

    			if (!mounted) {
    				dispose = [
    					listen(div0, "click", function () {
    						if (is_function(/*dispatch*/ ctx[28]('select', /*inputValue*/ ctx[8]))) /*dispatch*/ ctx[28]('select', /*inputValue*/ ctx[8]).apply(this, arguments);
    					}),
    					listen(div0, "mouseenter", function () {
    						if (is_function(/*dispatch*/ ctx[28]('hover', /*listIndex*/ ctx[10].last))) /*dispatch*/ ctx[28]('hover', /*listIndex*/ ctx[10].last).apply(this, arguments);
    					})
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*createLabel, inputValue*/ 16640 && raw_value !== (raw_value = /*createLabel*/ ctx[14](/*inputValue*/ ctx[8]) + "")) html_tag.p(raw_value);

    			if (/*currentListLength*/ ctx[26] != /*dropdownIndex*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*currentListLength, dropdownIndex*/ 67108865) {
    				toggle_class(div0, "active", /*currentListLength*/ ctx[26] == /*dropdownIndex*/ ctx[0]);
    			}

    			if (dirty[0] & /*alreadyCreated, inputValue*/ 320) {
    				toggle_class(div0, "is-disabled", /*alreadyCreated*/ ctx[6].includes(/*inputValue*/ ctx[8]));
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (247:6) {#if currentListLength != dropdownIndex}
    function create_if_block_2(ctx) {
    	let span;
    	let kbd0;
    	let t0;
    	let t1;
    	let kbd1;

    	return {
    		c() {
    			span = element("span");
    			kbd0 = element("kbd");
    			t0 = text(/*metaKey*/ ctx[15]);
    			t1 = text("+");
    			kbd1 = element("kbd");
    			kbd1.textContent = "Enter";
    			attr(kbd0, "class", "svelte-14fyqkc");
    			attr(kbd1, "class", "svelte-14fyqkc");
    			attr(span, "class", "shortcut svelte-14fyqkc");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, kbd0);
    			append(kbd0, t0);
    			append(span, t1);
    			append(span, kbd1);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*metaKey*/ 32768) set_data(t0, /*metaKey*/ ctx[15]);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showDropdown*/ ctx[21] && create_if_block$4(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (/*showDropdown*/ ctx[21]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showDropdown*/ 2097152) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let currentListLength;
    	let vl_listHeight;

    	let $hasDropdownOpened,
    		$$unsubscribe_hasDropdownOpened = noop,
    		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(27, $hasDropdownOpened = $$value)), hasDropdownOpened);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_hasDropdownOpened());
    	let { lazyDropdown } = $$props;
    	let { creatable } = $$props;
    	let { maxReached = false } = $$props;
    	let { dropdownIndex = 0 } = $$props;
    	let { renderer } = $$props;
    	let { disableHighlight } = $$props;
    	let { items = [] } = $$props;
    	let { alreadyCreated } = $$props;
    	let { virtualList } = $$props;
    	let { vlItemSize } = $$props;
    	let { vlHeight } = $$props;
    	let { inputValue } = $$props;
    	let { multiple } = $$props;
    	let { listIndex } = $$props;
    	let { hasDropdownOpened } = $$props;
    	$$subscribe_hasDropdownOpened();
    	let { listMessage } = $$props;
    	let { disabledField } = $$props;
    	let { createLabel } = $$props;
    	let { metaKey } = $$props;
    	let { itemComponent } = $$props;
    	let { collapsable } = $$props;
    	let { type } = $$props;
    	let { selectedOptionsLength } = $$props;

    	function scrollIntoView(params) {
    		if (virtualList) return;
    		const focusedEl = container.querySelector(`[data-pos="${dropdownIndex}"]`);
    		if (!focusedEl) return;
    		const focusedRect = focusedEl.getBoundingClientRect();
    		const menuRect = scrollContainer.getBoundingClientRect();
    		const overScroll = focusedEl.offsetHeight / 3;

    		const centerOffset = params && params.center
    		? scrollContainer.offsetHeight / 2
    		: 0;

    		switch (true) {
    			case focusedEl.offsetTop < scrollContainer.scrollTop:
    				$$invalidate(23, scrollContainer.scrollTop = focusedEl.offsetTop - overScroll + centerOffset, scrollContainer);
    				break;
    			case focusedEl.offsetTop + focusedRect.height > scrollContainer.scrollTop + menuRect.height:
    				$$invalidate(23, scrollContainer.scrollTop = focusedEl.offsetTop + focusedRect.height - scrollContainer.offsetHeight + overScroll + centerOffset, scrollContainer);
    				break;
    		}
    	}

    	function getDimensions() {
    		if (virtualList) {
    			return [scrollContainer.offsetHeight, vl_itemSize];
    		}

    		return [scrollContainer.offsetHeight, container.firstElementChild.offsetHeight];
    	}

    	const dispatch = createEventDispatcher();
    	let showDropdown;
    	let container;
    	let scrollContainer;
    	let isMounted = false;
    	let hasEmptyList = false;
    	let renderDropdown = !lazyDropdown;
    	let vl_height = vlHeight;
    	let vl_itemSize = vlItemSize;
    	let vl_autoMode = vlHeight === null && vlItemSize === null;
    	let refVirtualList;

    	function positionDropdown(val) {
    		if (!scrollContainer && !renderDropdown || virtualList && collapsable) return;
    		const outVp = isOutOfViewport(scrollContainer);

    		if (outVp.bottom && !outVp.top) {
    			$$invalidate(23, scrollContainer.parentElement.style.bottom = scrollContainer.parentElement.parentElement.clientHeight + 1 + 'px', scrollContainer);
    		} else if (!val || outVp.top) {
    			$$invalidate(23, scrollContainer.parentElement.style.bottom = '', scrollContainer); // FUTURE: debounce ....
    		}
    	}

    	function virtualListDimensionsResolver() {
    		if (!refVirtualList) return;

    		const pixelGetter = (el, prop) => {
    			const styles = window.getComputedStyle(el);
    			let { groups: { value, unit } } = styles[prop].match(/(?<value>\d+)(?<unit>[a-zA-Z]+)/);
    			value = parseFloat(value);

    			if (unit !== 'px') {
    				const el = unit === 'rem'
    				? document.documentElement
    				: scrollContainer.parentElement.parentElement;

    				const multipler = parseFloat(window.getComputedStyle(el).fontSize.match(/\d+/).shift());
    				value = multipler * value;
    			}

    			return value;
    		};

    		$$invalidate(37, vl_height = (pixelGetter(scrollContainer, 'maxHeight') - pixelGetter(scrollContainer, 'paddingTop') - pixelGetter(scrollContainer, 'paddingBottom')) * (collapsable && virtualList && type === "selected"
    		? 0.5
    		: 1));

    		// get item size (hacky style)
    		$$invalidate(23, scrollContainer.parentElement.style = 'opacity: 0; display: block', scrollContainer);

    		const firstItem = refVirtualList.$$.ctx[1].firstElementChild.firstElementChild;

    		if (firstItem) {
    			firstItem.style = '';
    			const firstSize = firstItem.getBoundingClientRect().height;
    			const secondItem = refVirtualList.$$.ctx[1].firstElementChild.firstElementChild.nextElementSibling;
    			let secondSize;

    			if (secondItem) {
    				secondItem.style = '';
    				secondSize = secondItem.getBoundingClientRect().height;
    			}

    			if (firstSize !== secondSize) {
    				const groupHeaderSize = items[0].$isGroupHeader ? firstSize : secondSize;
    				const regularItemSize = items[0].$isGroupHeader ? secondSize : firstSize;
    				$$invalidate(20, vl_itemSize = items.map(opt => opt.$isGroupHeader ? groupHeaderSize : regularItemSize));
    			} else {
    				$$invalidate(20, vl_itemSize = firstSize);
    			}
    		}

    		$$invalidate(23, scrollContainer.parentElement.style = '', scrollContainer);
    	}

    	let dropdownStateSubscription = () => {
    		
    	};

    	let onScrollHandler = null;

    	/** ************************************ lifecycle */
    	onMount(() => {
    		/** ************************************ flawless UX related tweak */
    		dropdownStateSubscription = hasDropdownOpened.subscribe(val => {
    			if (!renderDropdown && val) $$invalidate(36, renderDropdown = true);

    			tick().then(() => {
    				positionDropdown(val);
    				val && scrollIntoView({ center: true });
    			});

    			if (!onScrollHandler) onScrollHandler = () => positionDropdown(val);

    			// bind/unbind scroll listener
    			document[val ? 'addEventListener' : 'removeEventListener']('scroll', onScrollHandler, { passive: true });
    		});

    		$$invalidate(35, isMounted = true);
    	});

    	onDestroy(() => dropdownStateSubscription());

    	function mousedown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function hover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function select_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function virtuallist_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refVirtualList = $$value;
    			$$invalidate(24, refVirtualList);
    		});
    	}

    	function hover_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function select_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(22, container);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			scrollContainer = $$value;
    			$$invalidate(23, scrollContainer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('lazyDropdown' in $$props) $$invalidate(29, lazyDropdown = $$props.lazyDropdown);
    		if ('creatable' in $$props) $$invalidate(1, creatable = $$props.creatable);
    		if ('maxReached' in $$props) $$invalidate(2, maxReached = $$props.maxReached);
    		if ('dropdownIndex' in $$props) $$invalidate(0, dropdownIndex = $$props.dropdownIndex);
    		if ('renderer' in $$props) $$invalidate(3, renderer = $$props.renderer);
    		if ('disableHighlight' in $$props) $$invalidate(4, disableHighlight = $$props.disableHighlight);
    		if ('items' in $$props) $$invalidate(5, items = $$props.items);
    		if ('alreadyCreated' in $$props) $$invalidate(6, alreadyCreated = $$props.alreadyCreated);
    		if ('virtualList' in $$props) $$invalidate(7, virtualList = $$props.virtualList);
    		if ('vlItemSize' in $$props) $$invalidate(30, vlItemSize = $$props.vlItemSize);
    		if ('vlHeight' in $$props) $$invalidate(31, vlHeight = $$props.vlHeight);
    		if ('inputValue' in $$props) $$invalidate(8, inputValue = $$props.inputValue);
    		if ('multiple' in $$props) $$invalidate(9, multiple = $$props.multiple);
    		if ('listIndex' in $$props) $$invalidate(10, listIndex = $$props.listIndex);
    		if ('hasDropdownOpened' in $$props) $$subscribe_hasDropdownOpened($$invalidate(11, hasDropdownOpened = $$props.hasDropdownOpened));
    		if ('listMessage' in $$props) $$invalidate(12, listMessage = $$props.listMessage);
    		if ('disabledField' in $$props) $$invalidate(13, disabledField = $$props.disabledField);
    		if ('createLabel' in $$props) $$invalidate(14, createLabel = $$props.createLabel);
    		if ('metaKey' in $$props) $$invalidate(15, metaKey = $$props.metaKey);
    		if ('itemComponent' in $$props) $$invalidate(16, itemComponent = $$props.itemComponent);
    		if ('collapsable' in $$props) $$invalidate(17, collapsable = $$props.collapsable);
    		if ('type' in $$props) $$invalidate(18, type = $$props.type);
    		if ('selectedOptionsLength' in $$props) $$invalidate(32, selectedOptionsLength = $$props.selectedOptionsLength);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*items*/ 32) {
    			$$invalidate(26, currentListLength = items.length);
    		}

    		if ($$self.$$.dirty[0] & /*items, creatable, inputValue, virtualList, hasEmptyList*/ 524706 | $$self.$$.dirty[1] & /*isMounted, renderDropdown*/ 48) {
    			{
    				$$invalidate(19, hasEmptyList = items.length < 1 && (creatable ? !inputValue : true));

    				// required when changing item list 'on-the-fly' for VL
    				if (virtualList && vl_autoMode && isMounted && renderDropdown) {
    					if (hasEmptyList) $$invalidate(0, dropdownIndex = null);
    					$$invalidate(20, vl_itemSize = 0);
    					tick().then(virtualListDimensionsResolver).then(positionDropdown);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*vl_itemSize, items*/ 1048608 | $$self.$$.dirty[1] & /*vl_height*/ 64) {
    			$$invalidate(25, vl_listHeight = Math.min(vl_height, Array.isArray(vl_itemSize)
    			? vl_itemSize.reduce(
    					(res, num) => {
    						res += num;
    						return res;
    					},
    					0
    				)
    			: items.length * vl_itemSize));
    		}

    		if ($$self.$$.dirty[0] & /*collapsable, virtualList, type*/ 393344 | $$self.$$.dirty[1] & /*isMounted, renderDropdown, selectedOptionsLength*/ 50) {
    			{
    				if (collapsable && virtualList && type === "selected") {
    					$$invalidate(21, showDropdown = isMounted && renderDropdown && selectedOptionsLength > 1);
    				} else {
    					$$invalidate(21, showDropdown = isMounted && renderDropdown);
    				}
    			}
    		}
    	};

    	return [
    		dropdownIndex,
    		creatable,
    		maxReached,
    		renderer,
    		disableHighlight,
    		items,
    		alreadyCreated,
    		virtualList,
    		inputValue,
    		multiple,
    		listIndex,
    		hasDropdownOpened,
    		listMessage,
    		disabledField,
    		createLabel,
    		metaKey,
    		itemComponent,
    		collapsable,
    		type,
    		hasEmptyList,
    		vl_itemSize,
    		showDropdown,
    		container,
    		scrollContainer,
    		refVirtualList,
    		vl_listHeight,
    		currentListLength,
    		$hasDropdownOpened,
    		dispatch,
    		lazyDropdown,
    		vlItemSize,
    		vlHeight,
    		selectedOptionsLength,
    		scrollIntoView,
    		getDimensions,
    		isMounted,
    		renderDropdown,
    		vl_height,
    		mousedown_handler,
    		hover_handler,
    		select_handler,
    		virtuallist_binding,
    		hover_handler_1,
    		select_handler_1,
    		div0_binding,
    		div1_binding
    	];
    }

    class Dropdown extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$e,
    			create_fragment$f,
    			safe_not_equal,
    			{
    				lazyDropdown: 29,
    				creatable: 1,
    				maxReached: 2,
    				dropdownIndex: 0,
    				renderer: 3,
    				disableHighlight: 4,
    				items: 5,
    				alreadyCreated: 6,
    				virtualList: 7,
    				vlItemSize: 30,
    				vlHeight: 31,
    				inputValue: 8,
    				multiple: 9,
    				listIndex: 10,
    				hasDropdownOpened: 11,
    				listMessage: 12,
    				disabledField: 13,
    				createLabel: 14,
    				metaKey: 15,
    				itemComponent: 16,
    				collapsable: 17,
    				type: 18,
    				selectedOptionsLength: 32,
    				scrollIntoView: 33,
    				getDimensions: 34
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get scrollIntoView() {
    		return this.$$.ctx[33];
    	}

    	get getDimensions() {
    		return this.$$.ctx[34];
    	}
    }

    /* src\components\ItemClose.svelte generated by Svelte v3.55.1 */

    function create_fragment$e(ctx) {
    	let button;

    	return {
    		c() {
    			button = element("button");
    			button.innerHTML = `<svg height="16" width="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false" class="svelte-w7c5vi"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>`;
    			attr(button, "class", "sv-item-btn svelte-w7c5vi");
    			attr(button, "tabindex", "-1");
    			attr(button, "data-action", "deselect");
    			attr(button, "type", "button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(button);
    		}
    	};
    }

    class ItemClose extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$e, safe_not_equal, {});
    	}
    }

    const mouseDownAction = e => e.preventDefault();

    function itemActions(node, {item, index}) {

      function selectAction(e) {
        const eventType = e.target.closest('[data-action="deselect"]') ? 'deselect' : 'select';
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
      // !item.isSelected && 
      node.addEventListener('mouseenter', hoverAction);

      return {
        update(updated) {
          item = updated.item;
          index = updated.index;
        },
        destroy() {
          node.removeEventListener('mousedown', mouseDownAction);
          node.removeEventListener('click', selectAction);
          // !item.isSelected && 
          node.removeEventListener('mouseenter', hoverAction);
        }
      }
    }

    /* src\components\Item.svelte generated by Svelte v3.55.1 */

    function create_else_block(ctx) {
    	let div;
    	let html_tag;

    	let raw_value = (/*isSelected*/ ctx[3]
    	? `<div class="sv-item-content">${/*formatter*/ ctx[6](/*item*/ ctx[2], /*isSelected*/ ctx[3], /*inputValue*/ ctx[0])}</div>`
    	: highlightSearch(/*item*/ ctx[2], /*isSelected*/ ctx[3], /*inputValue*/ ctx[0], /*formatter*/ ctx[6], /*disableHighlight*/ ctx[7])) + "";

    	let t;
    	let div_title_value;
    	let itemActions_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*isSelected*/ ctx[3] && /*isMultiple*/ ctx[5] && create_if_block_1$1();

    	return {
    		c() {
    			div = element("div");
    			html_tag = new HtmlTag(false);
    			t = space();
    			if (if_block) if_block.c();
    			html_tag.a = t;
    			attr(div, "class", "sv-item");
    			attr(div, "title", div_title_value = /*item*/ ctx[2].$created ? 'Created item' : '');
    			toggle_class(div, "is-disabled", /*isDisabled*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append(div, t);
    			if (if_block) if_block.m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(itemActions_action = itemActions.call(null, div, {
    						item: /*item*/ ctx[2],
    						index: /*index*/ ctx[1]
    					})),
    					listen(div, "select", /*select_handler*/ ctx[9]),
    					listen(div, "deselect", /*deselect_handler*/ ctx[10]),
    					listen(div, "hover", /*hover_handler*/ ctx[11])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty & /*isSelected, formatter, item, inputValue, disableHighlight*/ 205) && raw_value !== (raw_value = (/*isSelected*/ ctx[3]
    			? `<div class="sv-item-content">${/*formatter*/ ctx[6](/*item*/ ctx[2], /*isSelected*/ ctx[3], /*inputValue*/ ctx[0])}</div>`
    			: highlightSearch(/*item*/ ctx[2], /*isSelected*/ ctx[3], /*inputValue*/ ctx[0], /*formatter*/ ctx[6], /*disableHighlight*/ ctx[7])) + "")) html_tag.p(raw_value);

    			if (/*isSelected*/ ctx[3] && /*isMultiple*/ ctx[5]) {
    				if (if_block) {
    					if (dirty & /*isSelected, isMultiple*/ 40) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1();
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*item*/ 4 && div_title_value !== (div_title_value = /*item*/ ctx[2].$created ? 'Created item' : '')) {
    				attr(div, "title", div_title_value);
    			}

    			if (itemActions_action && is_function(itemActions_action.update) && dirty & /*item, index*/ 6) itemActions_action.update.call(null, {
    				item: /*item*/ ctx[2],
    				index: /*index*/ ctx[1]
    			});

    			if (!current || dirty & /*isDisabled*/ 16) {
    				toggle_class(div, "is-disabled", /*isDisabled*/ ctx[4]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (18:0) {#if item.$isGroupHeader}
    function create_if_block$3(ctx) {
    	let div;
    	let b;
    	let t_value = /*item*/ ctx[2].label + "";
    	let t;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			b = element("b");
    			t = text(t_value);
    			attr(div, "class", "optgroup-header svelte-1e087o6");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, b);
    			append(b, t);

    			if (!mounted) {
    				dispose = listen(div, "mousedown", prevent_default(/*mousedown_handler*/ ctx[8]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty & /*item*/ 4 && t_value !== (t_value = /*item*/ ctx[2].label + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (33:2) {#if isSelected && isMultiple}
    function create_if_block_1$1(ctx) {
    	let itemclose;
    	let current;
    	itemclose = new ItemClose({});

    	return {
    		c() {
    			create_component(itemclose.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(itemclose, target, anchor);
    			current = true;
    		},
    		i(local) {
    			if (current) return;
    			transition_in(itemclose.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(itemclose.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(itemclose, detaching);
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[2].$isGroupHeader) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { inputValue } = $$props;
    	let { index = -1 } = $$props;
    	let { item = {} } = $$props;
    	let { isSelected = false } = $$props;
    	let { isDisabled = false } = $$props;
    	let { isMultiple = false } = $$props;
    	let { formatter = null } = $$props;
    	let { disableHighlight = false } = $$props;

    	function mousedown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function select_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function deselect_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function hover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('inputValue' in $$props) $$invalidate(0, inputValue = $$props.inputValue);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('item' in $$props) $$invalidate(2, item = $$props.item);
    		if ('isSelected' in $$props) $$invalidate(3, isSelected = $$props.isSelected);
    		if ('isDisabled' in $$props) $$invalidate(4, isDisabled = $$props.isDisabled);
    		if ('isMultiple' in $$props) $$invalidate(5, isMultiple = $$props.isMultiple);
    		if ('formatter' in $$props) $$invalidate(6, formatter = $$props.formatter);
    		if ('disableHighlight' in $$props) $$invalidate(7, disableHighlight = $$props.disableHighlight);
    	};

    	return [
    		inputValue,
    		index,
    		item,
    		isSelected,
    		isDisabled,
    		isMultiple,
    		formatter,
    		disableHighlight,
    		mousedown_handler,
    		select_handler,
    		deselect_handler,
    		hover_handler
    	];
    }

    class Item extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			inputValue: 0,
    			index: 1,
    			item: 2,
    			isSelected: 3,
    			isDisabled: 4,
    			isMultiple: 5,
    			formatter: 6,
    			disableHighlight: 7
    		});
    	}
    }

    /* src\Svelecte.svelte generated by Svelte v3.55.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[125] = list[i];
    	return child_ctx;
    }

    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});
    const get_control_end_slot_changes = dirty => ({});
    const get_control_end_slot_context = ctx => ({});

    // (704:4) 
    function create_icon_slot$2(ctx) {
    	let div;
    	let current;
    	const icon_slot_template = /*#slots*/ ctx[100].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[105], get_icon_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (icon_slot) icon_slot.c();
    			attr(div, "slot", "icon");
    			attr(div, "class", "icon-slot svelte-qplmia");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (icon_slot) {
    				icon_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (icon_slot) {
    				if (icon_slot.p && (!current || dirty[3] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						icon_slot,
    						icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[105],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[105])
    						: get_slot_changes(icon_slot_template, /*$$scope*/ ctx[105], dirty, get_icon_slot_changes),
    						get_icon_slot_context
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(icon_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (icon_slot) icon_slot.d(detaching);
    		}
    	};
    }

    // (705:4) 
    function create_control_end_slot(ctx) {
    	let div;
    	let current;
    	const control_end_slot_template = /*#slots*/ ctx[100]["control-end"];
    	const control_end_slot = create_slot(control_end_slot_template, ctx, /*$$scope*/ ctx[105], get_control_end_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (control_end_slot) control_end_slot.c();
    			attr(div, "slot", "control-end");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (control_end_slot) {
    				control_end_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (control_end_slot) {
    				if (control_end_slot.p && (!current || dirty[3] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						control_end_slot,
    						control_end_slot_template,
    						ctx,
    						/*$$scope*/ ctx[105],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[105])
    						: get_slot_changes(control_end_slot_template, /*$$scope*/ ctx[105], dirty, get_control_end_slot_changes),
    						get_control_end_slot_context
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(control_end_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(control_end_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (control_end_slot) control_end_slot.d(detaching);
    		}
    	};
    }

    // (708:4) {#if virtualList && collapsable && selectedItems.length}
    function create_if_block_1(ctx) {
    	let dropdown;
    	let current;

    	dropdown = new Dropdown({
    			props: {
    				renderer: /*itemRenderer*/ ctx[43],
    				disableHighlight: /*disableHighlight*/ ctx[10],
    				creatable: false,
    				virtualList: /*virtualList*/ ctx[19],
    				vlHeight: /*vlHeight*/ ctx[20],
    				vlItemSize: /*vlItemSize*/ ctx[21],
    				lazyDropdown: /*virtualList*/ ctx[19] || /*lazyDropdown*/ ctx[18],
    				multiple: /*multiple*/ ctx[1],
    				dropdownIndex: /*dropdownSelectedActiveIndex*/ ctx[37],
    				selectedOptionsLength: /*selectedOptions*/ ctx[30].length,
    				items: /*selectedItems*/ ctx[33],
    				listIndex: /*selectedListIndex*/ ctx[41],
    				inputValue: /*dropdownInputValue*/ ctx[42],
    				hasDropdownOpened: /*hasDropdownOpened*/ ctx[50],
    				listMessage: /*listMessage*/ ctx[44],
    				disabledField: /*disabledField*/ ctx[6],
    				metaKey: /*isIOS*/ ctx[38] ? '⌘' : 'Ctrl',
    				collapsable: /*collapsable*/ ctx[16],
    				itemComponent: /*dropdownItem*/ ctx[13],
    				type: "selected"
    			}
    		});

    	dropdown.$on("select", /*onCollapsableDeselect*/ ctx[53]);
    	dropdown.$on("hover", /*onCollapsableHover*/ ctx[55]);

    	return {
    		c() {
    			create_component(dropdown.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(dropdown, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const dropdown_changes = {};
    			if (dirty[1] & /*itemRenderer*/ 4096) dropdown_changes.renderer = /*itemRenderer*/ ctx[43];
    			if (dirty[0] & /*disableHighlight*/ 1024) dropdown_changes.disableHighlight = /*disableHighlight*/ ctx[10];
    			if (dirty[0] & /*virtualList*/ 524288) dropdown_changes.virtualList = /*virtualList*/ ctx[19];
    			if (dirty[0] & /*vlHeight*/ 1048576) dropdown_changes.vlHeight = /*vlHeight*/ ctx[20];
    			if (dirty[0] & /*vlItemSize*/ 2097152) dropdown_changes.vlItemSize = /*vlItemSize*/ ctx[21];
    			if (dirty[0] & /*virtualList, lazyDropdown*/ 786432) dropdown_changes.lazyDropdown = /*virtualList*/ ctx[19] || /*lazyDropdown*/ ctx[18];
    			if (dirty[0] & /*multiple*/ 2) dropdown_changes.multiple = /*multiple*/ ctx[1];
    			if (dirty[1] & /*dropdownSelectedActiveIndex*/ 64) dropdown_changes.dropdownIndex = /*dropdownSelectedActiveIndex*/ ctx[37];
    			if (dirty[0] & /*selectedOptions*/ 1073741824) dropdown_changes.selectedOptionsLength = /*selectedOptions*/ ctx[30].length;
    			if (dirty[1] & /*selectedItems*/ 4) dropdown_changes.items = /*selectedItems*/ ctx[33];
    			if (dirty[1] & /*selectedListIndex*/ 1024) dropdown_changes.listIndex = /*selectedListIndex*/ ctx[41];
    			if (dirty[1] & /*dropdownInputValue*/ 2048) dropdown_changes.inputValue = /*dropdownInputValue*/ ctx[42];
    			if (dirty[1] & /*listMessage*/ 8192) dropdown_changes.listMessage = /*listMessage*/ ctx[44];
    			if (dirty[0] & /*disabledField*/ 64) dropdown_changes.disabledField = /*disabledField*/ ctx[6];
    			if (dirty[1] & /*isIOS*/ 128) dropdown_changes.metaKey = /*isIOS*/ ctx[38] ? '⌘' : 'Ctrl';
    			if (dirty[0] & /*collapsable*/ 65536) dropdown_changes.collapsable = /*collapsable*/ ctx[16];
    			if (dirty[0] & /*dropdownItem*/ 8192) dropdown_changes.itemComponent = /*dropdownItem*/ ctx[13];
    			dropdown.$set(dropdown_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(dropdown, detaching);
    		}
    	};
    }

    // (737:2) {#if name && !hasAnchor}
    function create_if_block$2(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*selectedOptions*/ ctx[30];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(select, "id", /*__id*/ ctx[45]);
    			attr(select, "name", /*name*/ ctx[2]);
    			select.multiple = /*multiple*/ ctx[1];
    			attr(select, "class", "is-hidden svelte-qplmia");
    			attr(select, "tabindex", "-1");
    			select.required = /*required*/ ctx[4];
    			select.disabled = /*disabled*/ ctx[0];
    		},
    		m(target, anchor) {
    			insert(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			if (!mounted) {
    				dispose = action_destroyer(/*refSelectAction*/ ctx[46].call(null, select, /*refSelectActionParams*/ ctx[47]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedOptions, labelAsValue, currentLabelField, currentValueField*/ 1291845632) {
    				each_value = /*selectedOptions*/ ctx[30];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    				attr(select, "name", /*name*/ ctx[2]);
    			}

    			if (dirty[0] & /*multiple*/ 2) {
    				select.multiple = /*multiple*/ ctx[1];
    			}

    			if (dirty[0] & /*required*/ 16) {
    				select.required = /*required*/ ctx[4];
    			}

    			if (dirty[0] & /*disabled*/ 1) {
    				select.disabled = /*disabled*/ ctx[0];
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (739:4) {#each selectedOptions as opt}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[125][/*currentLabelField*/ ctx[27]] + "";
    	let t;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);

    			option.__value = option_value_value = /*opt*/ ctx[125][/*labelAsValue*/ ctx[24]
    			? /*currentLabelField*/ ctx[27]
    			: /*currentValueField*/ ctx[26]];

    			option.value = option.__value;
    			option.selected = true;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedOptions, currentLabelField*/ 1207959552 && t_value !== (t_value = /*opt*/ ctx[125][/*currentLabelField*/ ctx[27]] + "")) set_data(t, t_value);

    			if (dirty[0] & /*selectedOptions, labelAsValue, currentLabelField, currentValueField*/ 1291845632 && option_value_value !== (option_value_value = /*opt*/ ctx[125][/*labelAsValue*/ ctx[24]
    			? /*currentLabelField*/ ctx[27]
    			: /*currentValueField*/ ctx[26]])) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	let div1;
    	let control;
    	let t0;
    	let div0;
    	let t1;
    	let dropdown;
    	let t2;
    	let div1_class_value;
    	let current;

    	let control_props = {
    		renderer: /*itemRenderer*/ ctx[43],
    		disabled: /*disabled*/ ctx[0],
    		clearable: /*clearable*/ ctx[9],
    		searchable: /*searchable*/ ctx[8],
    		placeholder: /*placeholder*/ ctx[7],
    		multiple: /*multiple*/ ctx[1],
    		inputId: /*inputId*/ ctx[3] || /*__id*/ ctx[45],
    		resetOnBlur: /*resetOnBlur*/ ctx[11],
    		collapseSelection: /*collapseSelection*/ ctx[15]
    		? config.collapseSelectionFn.bind(/*_i18n*/ ctx[29])
    		: null,
    		inputValue: /*inputValue*/ ctx[48],
    		hasFocus: /*hasFocus*/ ctx[49],
    		hasDropdownOpened: /*hasDropdownOpened*/ ctx[50],
    		selectedOptions: /*selectedOptions*/ ctx[30],
    		isFetchingData: /*isFetchingData*/ ctx[28],
    		dndzone: /*dndzone*/ ctx[12],
    		currentValueField: /*currentValueField*/ ctx[26],
    		isAndroid: /*isAndroid*/ ctx[39],
    		collapsable: /*collapsable*/ ctx[16],
    		virtualList: /*virtualList*/ ctx[19],
    		itemComponent: /*controlItem*/ ctx[14],
    		$$slots: {
    			"control-end": [create_control_end_slot],
    			icon: [create_icon_slot$2]
    		},
    		$$scope: { ctx }
    	};

    	control = new Control({ props: control_props });
    	/*control_binding*/ ctx[101](control);
    	control.$on("deselect", /*onDeselect*/ ctx[52]);
    	control.$on("keydown", /*onKeyDown*/ ctx[56]);
    	control.$on("paste", /*onPaste*/ ctx[57]);
    	control.$on("consider", /*onDndEvent*/ ctx[58]);
    	control.$on("finalize", /*onDndEvent*/ ctx[58]);
    	control.$on("blur", /*blur_handler*/ ctx[102]);
    	let if_block0 = /*virtualList*/ ctx[19] && /*collapsable*/ ctx[16] && /*selectedItems*/ ctx[33].length && create_if_block_1(ctx);

    	let dropdown_props = {
    		selectedItemsLength: /*selectedItems*/ ctx[33].length,
    		renderer: /*itemRenderer*/ ctx[43],
    		disableHighlight: /*disableHighlight*/ ctx[10],
    		creatable: /*creatable*/ ctx[17],
    		maxReached: /*maxReached*/ ctx[34],
    		alreadyCreated: /*alreadyCreated*/ ctx[40],
    		virtualList: /*virtualList*/ ctx[19],
    		vlHeight: /*vlHeight*/ ctx[20],
    		vlItemSize: /*vlItemSize*/ ctx[21],
    		lazyDropdown: /*virtualList*/ ctx[19] || /*lazyDropdown*/ ctx[18],
    		multiple: /*multiple*/ ctx[1],
    		dropdownIndex: /*dropdownActiveIndex*/ ctx[25],
    		items: /*availableItems*/ ctx[32],
    		listIndex: /*listIndex*/ ctx[31],
    		collapsable: /*collapsable*/ ctx[16],
    		inputValue: /*dropdownInputValue*/ ctx[42],
    		hasDropdownOpened: /*hasDropdownOpened*/ ctx[50],
    		listMessage: /*listMessage*/ ctx[44],
    		disabledField: /*disabledField*/ ctx[6],
    		createLabel: /*_i18n*/ ctx[29].createRowLabel,
    		metaKey: /*isIOS*/ ctx[38] ? '⌘' : 'Ctrl',
    		itemComponent: /*dropdownItem*/ ctx[13],
    		type: "default"
    	};

    	dropdown = new Dropdown({ props: dropdown_props });
    	/*dropdown_binding*/ ctx[103](dropdown);
    	dropdown.$on("select", /*onSelect*/ ctx[51]);
    	dropdown.$on("hover", /*onHover*/ ctx[54]);
    	dropdown.$on("createoption", /*createoption_handler*/ ctx[104]);
    	let if_block1 = /*name*/ ctx[2] && !/*hasAnchor*/ ctx[5] && create_if_block$2(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			create_component(control.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			create_component(dropdown.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr(div0, "class", "sv-dropdown-container svelte-qplmia");
    			attr(div1, "class", div1_class_value = "" + (null_to_empty(`svelecte ${/*className*/ ctx[22]}`) + " svelte-qplmia"));
    			attr(div1, "style", /*style*/ ctx[23]);
    			toggle_class(div1, "is-disabled", /*disabled*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			mount_component(control, div1, null);
    			append(div1, t0);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t1);
    			mount_component(dropdown, div0, null);
    			append(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const control_changes = {};
    			if (dirty[1] & /*itemRenderer*/ 4096) control_changes.renderer = /*itemRenderer*/ ctx[43];
    			if (dirty[0] & /*disabled*/ 1) control_changes.disabled = /*disabled*/ ctx[0];
    			if (dirty[0] & /*clearable*/ 512) control_changes.clearable = /*clearable*/ ctx[9];
    			if (dirty[0] & /*searchable*/ 256) control_changes.searchable = /*searchable*/ ctx[8];
    			if (dirty[0] & /*placeholder*/ 128) control_changes.placeholder = /*placeholder*/ ctx[7];
    			if (dirty[0] & /*multiple*/ 2) control_changes.multiple = /*multiple*/ ctx[1];
    			if (dirty[0] & /*inputId*/ 8) control_changes.inputId = /*inputId*/ ctx[3] || /*__id*/ ctx[45];
    			if (dirty[0] & /*resetOnBlur*/ 2048) control_changes.resetOnBlur = /*resetOnBlur*/ ctx[11];

    			if (dirty[0] & /*collapseSelection, _i18n*/ 536903680) control_changes.collapseSelection = /*collapseSelection*/ ctx[15]
    			? config.collapseSelectionFn.bind(/*_i18n*/ ctx[29])
    			: null;

    			if (dirty[0] & /*selectedOptions*/ 1073741824) control_changes.selectedOptions = /*selectedOptions*/ ctx[30];
    			if (dirty[0] & /*isFetchingData*/ 268435456) control_changes.isFetchingData = /*isFetchingData*/ ctx[28];
    			if (dirty[0] & /*dndzone*/ 4096) control_changes.dndzone = /*dndzone*/ ctx[12];
    			if (dirty[0] & /*currentValueField*/ 67108864) control_changes.currentValueField = /*currentValueField*/ ctx[26];
    			if (dirty[1] & /*isAndroid*/ 256) control_changes.isAndroid = /*isAndroid*/ ctx[39];
    			if (dirty[0] & /*collapsable*/ 65536) control_changes.collapsable = /*collapsable*/ ctx[16];
    			if (dirty[0] & /*virtualList*/ 524288) control_changes.virtualList = /*virtualList*/ ctx[19];
    			if (dirty[0] & /*controlItem*/ 16384) control_changes.itemComponent = /*controlItem*/ ctx[14];

    			if (dirty[3] & /*$$scope*/ 4096) {
    				control_changes.$$scope = { dirty, ctx };
    			}

    			control.$set(control_changes);

    			if (/*virtualList*/ ctx[19] && /*collapsable*/ ctx[16] && /*selectedItems*/ ctx[33].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*virtualList, collapsable*/ 589824 | dirty[1] & /*selectedItems*/ 4) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
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

    			const dropdown_changes = {};
    			if (dirty[1] & /*selectedItems*/ 4) dropdown_changes.selectedItemsLength = /*selectedItems*/ ctx[33].length;
    			if (dirty[1] & /*itemRenderer*/ 4096) dropdown_changes.renderer = /*itemRenderer*/ ctx[43];
    			if (dirty[0] & /*disableHighlight*/ 1024) dropdown_changes.disableHighlight = /*disableHighlight*/ ctx[10];
    			if (dirty[0] & /*creatable*/ 131072) dropdown_changes.creatable = /*creatable*/ ctx[17];
    			if (dirty[1] & /*maxReached*/ 8) dropdown_changes.maxReached = /*maxReached*/ ctx[34];
    			if (dirty[1] & /*alreadyCreated*/ 512) dropdown_changes.alreadyCreated = /*alreadyCreated*/ ctx[40];
    			if (dirty[0] & /*virtualList*/ 524288) dropdown_changes.virtualList = /*virtualList*/ ctx[19];
    			if (dirty[0] & /*vlHeight*/ 1048576) dropdown_changes.vlHeight = /*vlHeight*/ ctx[20];
    			if (dirty[0] & /*vlItemSize*/ 2097152) dropdown_changes.vlItemSize = /*vlItemSize*/ ctx[21];
    			if (dirty[0] & /*virtualList, lazyDropdown*/ 786432) dropdown_changes.lazyDropdown = /*virtualList*/ ctx[19] || /*lazyDropdown*/ ctx[18];
    			if (dirty[0] & /*multiple*/ 2) dropdown_changes.multiple = /*multiple*/ ctx[1];
    			if (dirty[0] & /*dropdownActiveIndex*/ 33554432) dropdown_changes.dropdownIndex = /*dropdownActiveIndex*/ ctx[25];
    			if (dirty[1] & /*availableItems*/ 2) dropdown_changes.items = /*availableItems*/ ctx[32];
    			if (dirty[1] & /*listIndex*/ 1) dropdown_changes.listIndex = /*listIndex*/ ctx[31];
    			if (dirty[0] & /*collapsable*/ 65536) dropdown_changes.collapsable = /*collapsable*/ ctx[16];
    			if (dirty[1] & /*dropdownInputValue*/ 2048) dropdown_changes.inputValue = /*dropdownInputValue*/ ctx[42];
    			if (dirty[1] & /*listMessage*/ 8192) dropdown_changes.listMessage = /*listMessage*/ ctx[44];
    			if (dirty[0] & /*disabledField*/ 64) dropdown_changes.disabledField = /*disabledField*/ ctx[6];
    			if (dirty[0] & /*_i18n*/ 536870912) dropdown_changes.createLabel = /*_i18n*/ ctx[29].createRowLabel;
    			if (dirty[1] & /*isIOS*/ 128) dropdown_changes.metaKey = /*isIOS*/ ctx[38] ? '⌘' : 'Ctrl';
    			if (dirty[0] & /*dropdownItem*/ 8192) dropdown_changes.itemComponent = /*dropdownItem*/ ctx[13];
    			dropdown.$set(dropdown_changes);

    			if (/*name*/ ctx[2] && !/*hasAnchor*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (!current || dirty[0] & /*className*/ 4194304 && div1_class_value !== (div1_class_value = "" + (null_to_empty(`svelecte ${/*className*/ ctx[22]}`) + " svelte-qplmia"))) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (!current || dirty[0] & /*style*/ 8388608) {
    				attr(div1, "style", /*style*/ ctx[23]);
    			}

    			if (!current || dirty[0] & /*className, disabled*/ 4194305) {
    				toggle_class(div1, "is-disabled", /*disabled*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(control.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(control.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			/*control_binding*/ ctx[101](null);
    			destroy_component(control);
    			if (if_block0) if_block0.d();
    			/*dropdown_binding*/ ctx[103](null);
    			destroy_component(dropdown);
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    const formatterList = {
    	default(item) {
    		return item[this.label];
    	}
    };

    function addFormatter(name, formatFn) {
    	if (name instanceof Object) {
    		for (let prop in name) {
    			formatterList[prop] = name[prop];
    		}
    	} else {
    		formatterList[name] = formatFn;
    	}
    }
    const config = settings;

    function instance$c($$self, $$props, $$invalidate) {
    	let flatItems;
    	let maxReached;
    	let availableItems;
    	let currentListLength;
    	let listIndex;
    	let selectedFlatItems;
    	let selectedItems;
    	let selectedListIndex;
    	let listMessage;
    	let itemRenderer;
    	let dropdownInputValue;
    	let $inputValue;
    	let $hasDropdownOpened;
    	let $hasFocus;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { name = 'svelecte' } = $$props;
    	let { inputId = null } = $$props;
    	let { required = false } = $$props;
    	let { hasAnchor = false } = $$props;
    	let { disabled = settings.disabled } = $$props;
    	let { options = [] } = $$props;
    	let { valueField = settings.valueField } = $$props;
    	let { labelField = settings.labelField } = $$props;
    	let { groupLabelField = settings.groupLabelField } = $$props;
    	let { groupItemsField = settings.groupItemsField } = $$props;
    	let { disabledField = settings.disabledField } = $$props;
    	let { placeholder = 'Select' } = $$props;
    	let { searchable = settings.searchable } = $$props;
    	let { clearable = settings.clearable } = $$props;
    	let { renderer = null } = $$props;
    	let { disableHighlight = false } = $$props;
    	let { selectOnTab = settings.selectOnTab } = $$props;
    	let { resetOnBlur = settings.resetOnBlur } = $$props;
    	let { resetOnSelect = settings.resetOnSelect } = $$props;
    	let { resetOnCollapsableDeselect = settings.resetOnCollapsableDeselect } = $$props;
    	let { closeAfterSelect = settings.closeAfterSelect } = $$props;

    	let { dndzone = () => ({
    		noop: true,
    		destroy: () => {
    			
    		}
    	}) } = $$props;

    	let { validatorAction = null } = $$props;
    	let { dropdownItem = Item } = $$props;
    	let { controlItem = Item } = $$props;
    	let { multiple = settings.multiple } = $$props;
    	let { max = settings.max } = $$props;
    	let { collapseSelection = settings.collapseSelection } = $$props;
    	let { collapsable = false } = $$props;
    	let { creatable = settings.creatable } = $$props;
    	let { creatablePrefix = settings.creatablePrefix } = $$props;
    	let { allowEditing = settings.allowEditing } = $$props;
    	let { keepCreated = settings.keepCreated } = $$props;
    	let { delimiter = settings.delimiter } = $$props;
    	let { createFilter = null } = $$props;
    	let { createTransform = null } = $$props;
    	let { fetch = null } = $$props;
    	let { fetchMode = 'auto' } = $$props;
    	let { fetchCallback = settings.fetchCallback } = $$props;
    	let { fetchResetOnBlur = true } = $$props;
    	let { minQuery = settings.minQuery } = $$props;
    	let { lazyDropdown = settings.lazyDropdown } = $$props;
    	let { virtualList = settings.virtualList } = $$props;
    	let { vlHeight = settings.vlHeight } = $$props;
    	let { vlItemSize = settings.vlItemSize } = $$props;
    	let { searchField = null } = $$props;
    	let { sortField = null } = $$props;
    	let { disableSifter = false } = $$props;
    	let { class: className = 'svelecte-control' } = $$props;
    	let { style = null } = $$props;
    	let { i18n = null } = $$props;
    	let { readSelection = null } = $$props;
    	let { value = null } = $$props;
    	let { labelAsValue = false } = $$props;
    	let { valueAsObject = settings.valueAsObject } = $$props;

    	const focus = event => {
    		refControl.focusControl(event);
    	};

    	const getSelection = onlyValues => {
    		if (!selectedOptions.length) return multiple ? [] : null;

    		const _selection = selectedOptions.map(opt => onlyValues
    		? opt[labelAsValue ? currentLabelField : currentValueField]
    		: Object.assign({}, opt));

    		return multiple ? _selection : _selection[0];
    	};

    	const setSelection = (selection, triggerChangeEvent) => {
    		handleValueUpdate(selection);
    		triggerChangeEvent && emitChangeEvent();
    	};

    	const clearByParent = doDisable => {
    		clearSelection();
    		emitChangeEvent();

    		if (doDisable) {
    			$$invalidate(0, disabled = true);
    			$$invalidate(62, fetch = null);
    		}
    	};

    	const __id = `sv-select-${Math.random()}`.replace('.', '');
    	const dispatch = createEventDispatcher();

    	const itemConfig = {
    		optionsWithGroups: false,
    		isOptionArray: options && options.length && typeof options[0] !== 'object',
    		optionProps: [],
    		valueField,
    		labelField,
    		labelAsValue,
    		optLabel: groupLabelField,
    		optItems: groupItemsField
    	};

    	/* possibility to provide initial (selected) values in `fetch` mode **/
    	if (fetch && value && valueAsObject && (!options || options && options.length === 0)) {
    		options = Array.isArray(value) ? value : [value];
    	}

    	let isInitialized = false;
    	let refDropdown;
    	let refControl;
    	let ignoreHover = false;
    	let dropdownActiveIndex = null;
    	let dropdownSelectedActiveIndex = null;
    	let currentValueField = valueField || fieldInit('value', options, itemConfig);
    	let currentLabelField = labelField || fieldInit('label', options, itemConfig);
    	let isIOS = false;
    	let isAndroid = false;

    	let refSelectAction = validatorAction
    	? validatorAction.shift()
    	: () => ({
    			destroy: () => {
    				
    			}
    		});

    	let refSelectActionParams = validatorAction || [];
    	let refSelectElement = null;
    	itemConfig.valueField = currentValueField;
    	itemConfig.labelField = currentLabelField;

    	itemConfig.optionProps = value && valueAsObject && (multiple && Array.isArray(value)
    	? value.length > 0
    	: true)
    	? getFilterProps(multiple ? value.slice(0, 1).shift() : value)
    	: [currentValueField, currentLabelField];

    	/** ************************************ automatic init */
    	multiple = name && !multiple ? name.endsWith('[]') : multiple;

    	if (!createFilter) createFilter = defaultCreateFilter;

    	/** ************************************ Context definition */
    	const inputValue = writable('');

    	component_subscribe($$self, inputValue, value => $$invalidate(99, $inputValue = value));
    	const hasFocus = writable(false);
    	component_subscribe($$self, hasFocus, value => $$invalidate(113, $hasFocus = value));
    	const hasDropdownOpened = writable(false);
    	component_subscribe($$self, hasDropdownOpened, value => $$invalidate(112, $hasDropdownOpened = value));

    	/** ************************************ remote source */
    	let isFetchingData = false;

    	let initFetchOnly = fetchMode === 'init' || fetchMode === 'auto' && typeof fetch === 'string' && fetch.indexOf('[query]') === -1;
    	let fetchInitValue = initFetchOnly ? value : null;
    	let fetchUnsubscribe = null;

    	function cancelXhr() {
    		if (isInitialized && isFetchingData) {
    			xhr && ![0, 4].includes(xhr.readyState) && xhr.abort();
    			$$invalidate(28, isFetchingData = false);
    		}

    		return true;
    	}

    	function createFetch(fetch) {
    		if (fetchUnsubscribe) {
    			fetchUnsubscribe();
    			fetchUnsubscribe = null;
    		}

    		if (!fetch) return null;
    		cancelXhr();

    		// update fetchInitValue when fetch is changed, but we are in 'init' mode, ref #113
    		if (initFetchOnly && prevValue) fetchInitValue = prevValue;

    		const fetchSource = typeof fetch === 'string' ? fetchRemote(fetch) : fetch;

    		// reinit this if `fetch` property changes
    		$$invalidate(95, initFetchOnly = fetchMode === 'init' || fetchMode === 'auto' && typeof fetch === 'string' && fetch.indexOf('[query]') === -1);

    		const debouncedFetch = debounce(
    			query => {
    				if (query && !$inputValue.length) {
    					$$invalidate(28, isFetchingData = false);
    					return;
    				}

    				fetchSource(query, fetchCallback).then(data => {
    					if (!Array.isArray(data)) {
    						console.warn('[Svelecte]:Fetch - array expected, invalid property provided:', data);
    						data = [];
    					}

    					$$invalidate(59, options = data);
    				}).catch(() => {
    					$$invalidate(59, options = []);
    				}).finally(() => {
    					$$invalidate(28, isFetchingData = false);
    					$hasFocus && hasDropdownOpened.set(true);
    					$$invalidate(44, listMessage = _i18n.fetchEmpty);

    					tick().then(() => {
    						if (initFetchOnly && fetchInitValue) {
    							handleValueUpdate(fetchInitValue);
    							fetchInitValue = null;
    						}

    						dispatch('fetch', options);
    					});
    				});
    			},
    			500
    		);

    		if (initFetchOnly) {
    			if (typeof fetch === 'string' && fetch.indexOf('[parent]') !== -1) return null;
    			$$invalidate(28, isFetchingData = true);
    			$$invalidate(59, options = []);
    			debouncedFetch(null);
    			return null;
    		}

    		fetchUnsubscribe = inputValue.subscribe(value => {
    			cancelXhr(); // cancel previous run

    			if (!value) {
    				if (isInitialized && fetchResetOnBlur) {
    					$$invalidate(59, options = []);
    				}

    				return;
    			}

    			if (value && value.length < minQuery) return;
    			!initFetchOnly && hasDropdownOpened.set(false);
    			$$invalidate(28, isFetchingData = true);
    			debouncedFetch(value);
    		});

    		return debouncedFetch;
    	}

    	/** ************************************ component logic */
    	let prevValue = value;

    	let _i18n = config.i18n;

    	/** - - - - - - - - - - STORE - - - - - - - - - - - - - -*/
    	let selectedOptions = value !== null
    	? initSelection.call(options, value, valueAsObject, itemConfig)
    	: [];

    	let selectedKeys = selectedOptions.reduce(
    		(set, opt) => {
    			set.add(opt[currentValueField]);
    			return set;
    		},
    		new Set()
    	);

    	let alreadyCreated = [''];
    	let prevOptions = options;

    	/**
     * Dispatch change event on add options/remove selected items
     */
    	function emitChangeEvent() {
    		tick().then(() => {
    			dispatch('change', readSelection);

    			if (refSelectElement) {
    				refSelectElement.dispatchEvent(new Event('input')); // required for svelte-use-form
    				refSelectElement.dispatchEvent(new Event('change')); // typically you expect change event to be fired
    			}
    		});
    	}

    	/**
     * Dispatch createoption event when user creates a new entry (with 'creatable' feature)
     */
    	function emitCreateEvent(createdOpt) {
    		dispatch('createoption', createdOpt);
    	}

    	/**
     * update inner selection, when 'value' property is changed
     * 
     * @internal before 3.9.1 it was possible when `valueAsObject` was set to set value OUTSIDE defined options. Fix at
     * 3.9.1 broke manual value setter. Which has been resolved now through #128. Which disables pre 3.9.1 behavior
     *
     * FUTURE: to enable this behavior add property for it. Could be useful is some edge cases I would say.
     */
    	function handleValueUpdate(passedVal) {
    		clearSelection();

    		if (passedVal) {
    			let _selection = Array.isArray(passedVal) ? passedVal : [passedVal];

    			const valueProp = itemConfig.labelAsValue
    			? currentLabelField
    			: currentValueField;

    			_selection = _selection.reduce(
    				(res, val) => {
    					if (creatable && valueAsObject && val.$created) {
    						res.push(val);
    						return res;
    					}

    					const opt = flatItems.find(item => valueAsObject
    					? item[valueProp] == val[valueProp]
    					: item[valueProp] == val);

    					opt && res.push(opt);
    					return res;
    				},
    				[]
    			);

    			let success = _selection.every(selectOption) && (multiple
    			? passedVal.length === _selection.length
    			: _selection.length > 0);

    			if (!success) {
    				// this is run only when invalid 'value' is provided, like out of option array
    				console.warn('[Svelecte]: provided "value" property is invalid', passedVal);

    				$$invalidate(63, value = multiple ? [] : null);
    				$$invalidate(64, readSelection = value);
    				dispatch('invalidValue', passedVal);
    				return;
    			}

    			$$invalidate(64, readSelection = Array.isArray(passedVal)
    			? _selection
    			: _selection.shift());
    		}

    		$$invalidate(96, prevValue = passedVal);
    	}

    	/** 
     * Add given option to selection pool
     * Check if not already selected or max item selection reached
     * 
     * @returns bool
     */
    	function selectOption(opt) {
    		if (!opt || multiple && maxReached) return false;
    		if (selectedKeys.has(opt[currentValueField])) return;

    		if (typeof opt === 'string') {
    			if (!creatable) return;
    			opt = createFilter(opt, options);
    			if (alreadyCreated.includes(opt)) return;
    			!fetch && alreadyCreated.push(opt);
    			opt = createTransform(opt, creatablePrefix, currentValueField, currentLabelField);
    			opt.$created = true; // internal setter
    			if (keepCreated) $$invalidate(59, options = [...options, opt]);
    			emitCreateEvent(opt);
    		}

    		if (multiple) {
    			selectedOptions.push(opt);
    			$$invalidate(30, selectedOptions);
    			selectedKeys.add(opt[currentValueField]);
    		} else {
    			$$invalidate(30, selectedOptions = [opt]);
    			selectedKeys.clear();
    			selectedKeys.add(opt[currentValueField]);
    			$$invalidate(25, dropdownActiveIndex = options.indexOf(opt));
    		}

    		((((((((($$invalidate(97, flatItems), $$invalidate(59, options)), $$invalidate(93, itemConfig)), $$invalidate(94, isInitialized)), $$invalidate(118, prevOptions)), $$invalidate(65, valueField)), $$invalidate(26, currentValueField)), $$invalidate(66, labelField)), $$invalidate(27, currentLabelField)), $$invalidate(24, labelAsValue));
    		return true;
    	}

    	/**
     * Remove option/all options from selection pool
     */
    	function deselectOption(opt) {
    		if (opt.$created && backspacePressed && allowEditing) {
    			alreadyCreated.splice(alreadyCreated.findIndex(o => o === opt[labelAsValue ? currentLabelField : currentValueField]), 1);
    			$$invalidate(40, alreadyCreated);

    			if (keepCreated) {
    				options.splice(options.findIndex(o => o === opt), 1);
    				$$invalidate(59, options);
    			}

    			set_store_value(inputValue, $inputValue = opt[currentLabelField].replace(creatablePrefix, ''), $inputValue);
    		}

    		const id = opt[currentValueField];
    		selectedKeys.delete(id);
    		selectedOptions.splice(selectedOptions.findIndex(o => o[currentValueField] == id), 1);
    		$$invalidate(30, selectedOptions);
    		((((((((($$invalidate(97, flatItems), $$invalidate(59, options)), $$invalidate(93, itemConfig)), $$invalidate(94, isInitialized)), $$invalidate(118, prevOptions)), $$invalidate(65, valueField)), $$invalidate(26, currentValueField)), $$invalidate(66, labelField)), $$invalidate(27, currentLabelField)), $$invalidate(24, labelAsValue));
    	}

    	function clearSelection() {
    		selectedKeys.clear();
    		$$invalidate(30, selectedOptions = []);
    		$$invalidate(34, maxReached = false); // reset forcefully, related to #145
    		((((((((($$invalidate(97, flatItems), $$invalidate(59, options)), $$invalidate(93, itemConfig)), $$invalidate(94, isInitialized)), $$invalidate(118, prevOptions)), $$invalidate(65, valueField)), $$invalidate(26, currentValueField)), $$invalidate(66, labelField)), $$invalidate(27, currentLabelField)), $$invalidate(24, labelAsValue));
    	}

    	/**
     * Handle user action on select
     */
    	function onSelect(event, opt) {
    		opt = opt || event.detail;
    		if (disabled || opt[disabledField] || opt.$isGroupHeader) return;
    		selectOption(opt);
    		if (multiple && resetOnSelect || !multiple) set_store_value(inputValue, $inputValue = '', $inputValue);

    		if (!multiple || closeAfterSelect) {
    			set_store_value(hasDropdownOpened, $hasDropdownOpened = false, $hasDropdownOpened);
    		} else {
    			tick().then(() => {
    				$$invalidate(25, dropdownActiveIndex = maxReached
    				? null
    				: listIndex.next(dropdownActiveIndex - 1, true));
    			});
    		}

    		emitChangeEvent();
    	}

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

    	function onCollapsableDeselect(event, opt) {
    		if (resetOnCollapsableDeselect) set_store_value(inputValue, $inputValue = '', $inputValue);
    		onDeselect(event, opt);
    	}

    	/**
     * Dropdown hover handler - update active item
     */
    	function onHover(event) {
    		if (ignoreHover) {
    			ignoreHover = false;
    			return;
    		}

    		$$invalidate(25, dropdownActiveIndex = event.detail);
    	}

    	/**
     * Dropdown hover handler - update active item
     */
    	function onCollapsableHover(event) {
    		if (ignoreHover) {
    			ignoreHover = false;
    			return;
    		}

    		$$invalidate(37, dropdownSelectedActiveIndex = event.detail);
    	}

    	/** keyboard related props */
    	let backspacePressed = false;

    	/**
     * Keyboard navigation
     */
    	function onKeyDown(event) {
    		event = event.detail; // from dispatched event

    		if (creatable && delimiter.indexOf(event.key) > -1) {
    			$inputValue.length > 0 && onSelect(null, $inputValue); // prevent creating item with delimiter itself
    			event.preventDefault();
    			return;
    		}

    		const Tab = selectOnTab && $hasDropdownOpened && !event.shiftKey
    		? 'Tab'
    		: 'No-tab';

    		let ctrlKey = isIOS ? event.metaKey : event.ctrlKey;
    		let isPageEvent = ['PageUp', 'PageDown'].includes(event.key);

    		switch (event.key) {
    			case 'End':
    				if ($inputValue.length !== 0) return;
    				$$invalidate(25, dropdownActiveIndex = listIndex.first);
    			case 'PageDown':
    				if (isPageEvent) {
    					const [wrap, item] = refDropdown.getDimensions();
    					$$invalidate(25, dropdownActiveIndex = Math.ceil((item * dropdownActiveIndex + wrap) / item));
    				}
    			case 'ArrowUp':
    				event.preventDefault();
    				if (!$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened);
    					return;
    				}
    				$$invalidate(25, dropdownActiveIndex = listIndex.prev(dropdownActiveIndex));
    				tick().then(refDropdown.scrollIntoView);
    				ignoreHover = true;
    				break;
    			case 'Home':
    				if ($inputValue.length !== 0 || $inputValue.length === 0 && availableItems.length === 0) return;
    				$$invalidate(25, dropdownActiveIndex = listIndex.last);
    			case 'PageUp':
    				if (isPageEvent) {
    					const [wrap, item] = refDropdown.getDimensions(); // ref #26
    					$$invalidate(25, dropdownActiveIndex = Math.floor((item * dropdownActiveIndex - wrap) / item));
    				}
    			case 'ArrowDown':
    				event.preventDefault();
    				if (!$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened);
    					return;
    				}
    				$$invalidate(25, dropdownActiveIndex = listIndex.next(dropdownActiveIndex));
    				tick().then(refDropdown.scrollIntoView);
    				ignoreHover = true;
    				break;
    			case 'Escape':
    				if ($hasDropdownOpened) {
    					// prevent ESC bubble in this case (interfering with modal closing etc. (bootstrap))
    					event.preventDefault();

    					event.stopPropagation();
    				}
    				if (!$inputValue) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = false, $hasDropdownOpened);
    				}
    				cancelXhr();
    				set_store_value(inputValue, $inputValue = '', $inputValue);
    				break;
    			case Tab:
    			case 'Enter':
    				if (!$hasDropdownOpened) {
    					event.key !== Tab && dispatch('enterKey', event); // ref #125
    					return;
    				}
    				let activeDropdownItem = !ctrlKey ? availableItems[dropdownActiveIndex] : null;
    				if (creatable && $inputValue) {
    					activeDropdownItem = !activeDropdownItem || ctrlKey
    					? $inputValue
    					: activeDropdownItem;

    					ctrlKey = false;
    				}
    				!ctrlKey && activeDropdownItem && onSelect(null, activeDropdownItem);
    				!activeDropdownItem && selectedItems.length === 1 && onCollapsableDeselect(null, selectedItems[0]);
    				if (availableItems.length <= dropdownActiveIndex) {
    					$$invalidate(25, dropdownActiveIndex = currentListLength > 0
    					? currentListLength
    					: listIndex.first);
    				}
    				if (!activeDropdownItem && selectedOptions.length) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = false, $hasDropdownOpened);
    					event.key !== Tab && dispatch('enterKey', event); // ref #125
    					return;
    				}
    				event.preventDefault();
    				break;
    			case ' ':
    				if (!fetch && !$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened); // prevent form submit
    					event.preventDefault();
    				}
    				if (!multiple && selectedOptions.length) event.preventDefault();
    				break;
    			case 'Backspace':
    				backspacePressed = true;
    			case 'Delete':
    				if ($inputValue === '' && selectedOptions.length) {
    					ctrlKey
    					? onDeselect({})
    					: onDeselect(null, selectedOptions[selectedOptions.length - 1]); /** no detail prop */

    					event.preventDefault();
    				}
    				backspacePressed = false;
    			default:
    				if (!ctrlKey && !['Tab', 'Shift'].includes(event.key) && !$hasDropdownOpened && !isFetchingData) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened);
    				}
    				if (!multiple && selectedOptions.length && event.key !== 'Tab') {
    					event.preventDefault();
    					event.stopPropagation();
    				}
    		}
    	}

    	/**
     * Enable create items by pasting
     */
    	function onPaste(event) {
    		if (creatable) {
    			event.preventDefault();
    			const rx = new RegExp('([^' + delimiter + '\\n]+)', 'g');
    			const pasted = event.clipboardData.getData('text/plain').replace(/\//g, '\/').replace(/\t/g, ' ');
    			const matches = pasted.match(rx);

    			if (matches.length === 1 && pasted.indexOf(',') === -1) {
    				set_store_value(inputValue, $inputValue = matches.pop().trim(), $inputValue);
    			}

    			matches.forEach(opt => onSelect(null, opt.trim()));
    		}
    	} // do nothing otherwise

    	function onDndEvent(e) {
    		$$invalidate(30, selectedOptions = e.detail.items);
    	}

    	/** ************************************ component lifecycle related */
    	onMount(() => {
    		$$invalidate(94, isInitialized = true);

    		if (creatable) {
    			const valueProp = itemConfig.labelAsValue
    			? currentLabelField
    			: currentValueField;

    			$$invalidate(40, alreadyCreated = [''].concat(flatItems.map(opt => opt[valueProp]).filter(opt => opt)));
    		}

    		$$invalidate(25, dropdownActiveIndex = listIndex.first);

    		if (prevValue && !multiple) {
    			const prop = labelAsValue ? currentLabelField : currentValueField;
    			const selectedProp = valueAsObject ? prevValue[prop] : prevValue;
    			$$invalidate(25, dropdownActiveIndex = flatItems.findIndex(opt => opt[prop] === selectedProp));
    		}

    		$$invalidate(37, dropdownSelectedActiveIndex = selectedListIndex.first);
    		$$invalidate(38, isIOS = iOS());
    		$$invalidate(39, isAndroid = android());
    		if (name && !hasAnchor) refSelectElement = document.getElementById(__id);
    	});

    	function control_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refControl = $$value;
    			$$invalidate(36, refControl);
    		});
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function dropdown_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refDropdown = $$value;
    			$$invalidate(35, refDropdown);
    		});
    	}

    	function createoption_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('inputId' in $$props) $$invalidate(3, inputId = $$props.inputId);
    		if ('required' in $$props) $$invalidate(4, required = $$props.required);
    		if ('hasAnchor' in $$props) $$invalidate(5, hasAnchor = $$props.hasAnchor);
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('options' in $$props) $$invalidate(59, options = $$props.options);
    		if ('valueField' in $$props) $$invalidate(65, valueField = $$props.valueField);
    		if ('labelField' in $$props) $$invalidate(66, labelField = $$props.labelField);
    		if ('groupLabelField' in $$props) $$invalidate(67, groupLabelField = $$props.groupLabelField);
    		if ('groupItemsField' in $$props) $$invalidate(68, groupItemsField = $$props.groupItemsField);
    		if ('disabledField' in $$props) $$invalidate(6, disabledField = $$props.disabledField);
    		if ('placeholder' in $$props) $$invalidate(7, placeholder = $$props.placeholder);
    		if ('searchable' in $$props) $$invalidate(8, searchable = $$props.searchable);
    		if ('clearable' in $$props) $$invalidate(9, clearable = $$props.clearable);
    		if ('renderer' in $$props) $$invalidate(69, renderer = $$props.renderer);
    		if ('disableHighlight' in $$props) $$invalidate(10, disableHighlight = $$props.disableHighlight);
    		if ('selectOnTab' in $$props) $$invalidate(70, selectOnTab = $$props.selectOnTab);
    		if ('resetOnBlur' in $$props) $$invalidate(11, resetOnBlur = $$props.resetOnBlur);
    		if ('resetOnSelect' in $$props) $$invalidate(71, resetOnSelect = $$props.resetOnSelect);
    		if ('resetOnCollapsableDeselect' in $$props) $$invalidate(72, resetOnCollapsableDeselect = $$props.resetOnCollapsableDeselect);
    		if ('closeAfterSelect' in $$props) $$invalidate(73, closeAfterSelect = $$props.closeAfterSelect);
    		if ('dndzone' in $$props) $$invalidate(12, dndzone = $$props.dndzone);
    		if ('validatorAction' in $$props) $$invalidate(74, validatorAction = $$props.validatorAction);
    		if ('dropdownItem' in $$props) $$invalidate(13, dropdownItem = $$props.dropdownItem);
    		if ('controlItem' in $$props) $$invalidate(14, controlItem = $$props.controlItem);
    		if ('multiple' in $$props) $$invalidate(1, multiple = $$props.multiple);
    		if ('max' in $$props) $$invalidate(75, max = $$props.max);
    		if ('collapseSelection' in $$props) $$invalidate(15, collapseSelection = $$props.collapseSelection);
    		if ('collapsable' in $$props) $$invalidate(16, collapsable = $$props.collapsable);
    		if ('creatable' in $$props) $$invalidate(17, creatable = $$props.creatable);
    		if ('creatablePrefix' in $$props) $$invalidate(76, creatablePrefix = $$props.creatablePrefix);
    		if ('allowEditing' in $$props) $$invalidate(77, allowEditing = $$props.allowEditing);
    		if ('keepCreated' in $$props) $$invalidate(78, keepCreated = $$props.keepCreated);
    		if ('delimiter' in $$props) $$invalidate(79, delimiter = $$props.delimiter);
    		if ('createFilter' in $$props) $$invalidate(60, createFilter = $$props.createFilter);
    		if ('createTransform' in $$props) $$invalidate(61, createTransform = $$props.createTransform);
    		if ('fetch' in $$props) $$invalidate(62, fetch = $$props.fetch);
    		if ('fetchMode' in $$props) $$invalidate(80, fetchMode = $$props.fetchMode);
    		if ('fetchCallback' in $$props) $$invalidate(81, fetchCallback = $$props.fetchCallback);
    		if ('fetchResetOnBlur' in $$props) $$invalidate(82, fetchResetOnBlur = $$props.fetchResetOnBlur);
    		if ('minQuery' in $$props) $$invalidate(83, minQuery = $$props.minQuery);
    		if ('lazyDropdown' in $$props) $$invalidate(18, lazyDropdown = $$props.lazyDropdown);
    		if ('virtualList' in $$props) $$invalidate(19, virtualList = $$props.virtualList);
    		if ('vlHeight' in $$props) $$invalidate(20, vlHeight = $$props.vlHeight);
    		if ('vlItemSize' in $$props) $$invalidate(21, vlItemSize = $$props.vlItemSize);
    		if ('searchField' in $$props) $$invalidate(84, searchField = $$props.searchField);
    		if ('sortField' in $$props) $$invalidate(85, sortField = $$props.sortField);
    		if ('disableSifter' in $$props) $$invalidate(86, disableSifter = $$props.disableSifter);
    		if ('class' in $$props) $$invalidate(22, className = $$props.class);
    		if ('style' in $$props) $$invalidate(23, style = $$props.style);
    		if ('i18n' in $$props) $$invalidate(87, i18n = $$props.i18n);
    		if ('readSelection' in $$props) $$invalidate(64, readSelection = $$props.readSelection);
    		if ('value' in $$props) $$invalidate(63, value = $$props.value);
    		if ('labelAsValue' in $$props) $$invalidate(24, labelAsValue = $$props.labelAsValue);
    		if ('valueAsObject' in $$props) $$invalidate(88, valueAsObject = $$props.valueAsObject);
    		if ('$$scope' in $$props) $$invalidate(105, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*createTransform*/ 1073741824) {
    			if (!createTransform) $$invalidate(61, createTransform = defaultCreateTransform);
    		}

    		if ($$self.$$.dirty[2] & /*fetch*/ 1) {
    			createFetch(fetch);
    		}

    		if ($$self.$$.dirty[0] & /*disabled*/ 1) {
    			disabled && hasDropdownOpened.set(false);
    		}

    		if ($$self.$$.dirty[2] & /*i18n*/ 33554432) {
    			{
    				if (i18n && typeof i18n === 'object') {
    					$$invalidate(29, _i18n = Object.assign({}, config.i18n, i18n));
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*currentValueField, currentLabelField*/ 201326592 | $$self.$$.dirty[1] & /*options*/ 268435456 | $$self.$$.dirty[2] & /*valueField, labelField*/ 24 | $$self.$$.dirty[3] & /*isInitialized, itemConfig*/ 3) {
    			{
    				if (isInitialized && prevOptions !== options && options.length) {
    					const ivalue = fieldInit('value', options || null, itemConfig);
    					const ilabel = fieldInit('label', options || null, itemConfig);
    					if (!valueField && currentValueField !== ivalue) $$invalidate(93, itemConfig.valueField = $$invalidate(26, currentValueField = ivalue), itemConfig);
    					if (!labelField && currentLabelField !== ilabel) $$invalidate(93, itemConfig.labelField = $$invalidate(27, currentLabelField = ilabel), itemConfig);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*labelAsValue*/ 16777216) {
    			{
    				$$invalidate(93, itemConfig.labelAsValue = labelAsValue, itemConfig);
    			}
    		}

    		if ($$self.$$.dirty[1] & /*options*/ 268435456 | $$self.$$.dirty[3] & /*itemConfig*/ 1) {
    			$$invalidate(97, flatItems = flatList(options, itemConfig));
    		}

    		if ($$self.$$.dirty[0] & /*selectedOptions, multiple, currentLabelField, currentValueField*/ 1275068418 | $$self.$$.dirty[2] & /*valueAsObject*/ 67108864 | $$self.$$.dirty[3] & /*itemConfig, prevValue*/ 9) {
    			{
    				const _selectionArray = selectedOptions.map(opt => {
    					const { '$disabled': unused1, '$isGroupItem': unused2, ...obj } = opt;
    					return obj;
    				});

    				const _unifiedSelection = multiple
    				? _selectionArray
    				: _selectionArray.length ? _selectionArray[0] : null;

    				const valueProp = itemConfig.labelAsValue
    				? currentLabelField
    				: currentValueField;

    				if (!valueAsObject) {
    					$$invalidate(96, prevValue = multiple
    					? _unifiedSelection.map(opt => opt[valueProp])
    					: selectedOptions.length
    						? _unifiedSelection[valueProp]
    						: null);
    				} else {
    					$$invalidate(96, prevValue = _unifiedSelection);
    				}

    				$$invalidate(63, value = prevValue);
    				$$invalidate(64, readSelection = _unifiedSelection);
    			}
    		}

    		if ($$self.$$.dirty[2] & /*value*/ 2 | $$self.$$.dirty[3] & /*prevValue*/ 8) {
    			prevValue !== value && handleValueUpdate(value);
    		}

    		if ($$self.$$.dirty[0] & /*selectedOptions*/ 1073741824 | $$self.$$.dirty[2] & /*max*/ 8192) {
    			$$invalidate(34, maxReached = max && selectedOptions.length == max); // == is intentional, if string is provided
    		}

    		if ($$self.$$.dirty[0] & /*multiple*/ 2 | $$self.$$.dirty[1] & /*maxReached*/ 8 | $$self.$$.dirty[2] & /*disableSifter, searchField, sortField*/ 29360128 | $$self.$$.dirty[3] & /*flatItems, $inputValue, itemConfig*/ 81) {
    			$$invalidate(32, availableItems = maxReached
    			? []
    			: filterList(flatItems, disableSifter ? null : $inputValue, multiple ? selectedKeys : false, searchField, sortField, itemConfig));
    		}

    		if ($$self.$$.dirty[0] & /*creatable*/ 131072 | $$self.$$.dirty[1] & /*availableItems*/ 2 | $$self.$$.dirty[3] & /*$inputValue*/ 64) {
    			currentListLength = creatable && $inputValue
    			? availableItems.length
    			: availableItems.length - 1;
    		}

    		if ($$self.$$.dirty[0] & /*creatable*/ 131072 | $$self.$$.dirty[1] & /*availableItems*/ 2 | $$self.$$.dirty[3] & /*$inputValue, itemConfig*/ 65) {
    			$$invalidate(31, listIndex = indexList(availableItems, creatable && $inputValue, itemConfig));
    		}

    		if ($$self.$$.dirty[0] & /*virtualList, collapsable, selectedOptions*/ 1074331648 | $$self.$$.dirty[3] & /*itemConfig*/ 1) {
    			$$invalidate(98, selectedFlatItems = virtualList && collapsable
    			? flatList(selectedOptions, itemConfig)
    			: []);
    		}

    		if ($$self.$$.dirty[2] & /*disableSifter, searchField, sortField*/ 29360128 | $$self.$$.dirty[3] & /*selectedFlatItems, $inputValue, itemConfig*/ 97) {
    			$$invalidate(33, selectedItems = filterList(selectedFlatItems, disableSifter ? null : $inputValue, false, searchField, sortField, itemConfig));
    		}

    		if ($$self.$$.dirty[1] & /*selectedItems*/ 4 | $$self.$$.dirty[3] & /*itemConfig*/ 1) {
    			$$invalidate(41, selectedListIndex = indexList(selectedItems, false, itemConfig));
    		}

    		if ($$self.$$.dirty[0] & /*dropdownActiveIndex*/ 33554432 | $$self.$$.dirty[1] & /*listIndex*/ 1) {
    			{
    				if (dropdownActiveIndex === null) {
    					$$invalidate(25, dropdownActiveIndex = listIndex.first);
    				} else if (dropdownActiveIndex > listIndex.last) {
    					$$invalidate(25, dropdownActiveIndex = listIndex.last);
    				} else if (dropdownActiveIndex < listIndex.first) {
    					$$invalidate(25, dropdownActiveIndex = listIndex.first);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*_i18n, isFetchingData*/ 805306368 | $$self.$$.dirty[1] & /*maxReached, availableItems*/ 10 | $$self.$$.dirty[2] & /*max, minQuery, fetch*/ 2105345 | $$self.$$.dirty[3] & /*$inputValue, initFetchOnly*/ 68) {
    			$$invalidate(44, listMessage = maxReached
    			? _i18n.max(max)
    			: $inputValue.length && availableItems.length === 0 && minQuery <= 1
    				? _i18n.nomatch
    				: fetch
    					? minQuery <= 1
    						? initFetchOnly
    							? isFetchingData ? _i18n.fetchInit : _i18n.empty
    							: _i18n.fetchBefore
    						: _i18n.fetchQuery(minQuery, $inputValue.length)
    					: _i18n.empty);
    		}

    		if ($$self.$$.dirty[0] & /*currentLabelField*/ 134217728 | $$self.$$.dirty[2] & /*renderer*/ 128) {
    			$$invalidate(43, itemRenderer = typeof renderer === 'function'
    			? renderer
    			: formatterList[renderer] || formatterList.default.bind({ label: currentLabelField }));
    		}

    		if ($$self.$$.dirty[1] & /*createFilter, options*/ 805306368 | $$self.$$.dirty[3] & /*$inputValue*/ 64) {
    			$$invalidate(42, dropdownInputValue = createFilter($inputValue, options));
    		}
    	};

    	return [
    		disabled,
    		multiple,
    		name,
    		inputId,
    		required,
    		hasAnchor,
    		disabledField,
    		placeholder,
    		searchable,
    		clearable,
    		disableHighlight,
    		resetOnBlur,
    		dndzone,
    		dropdownItem,
    		controlItem,
    		collapseSelection,
    		collapsable,
    		creatable,
    		lazyDropdown,
    		virtualList,
    		vlHeight,
    		vlItemSize,
    		className,
    		style,
    		labelAsValue,
    		dropdownActiveIndex,
    		currentValueField,
    		currentLabelField,
    		isFetchingData,
    		_i18n,
    		selectedOptions,
    		listIndex,
    		availableItems,
    		selectedItems,
    		maxReached,
    		refDropdown,
    		refControl,
    		dropdownSelectedActiveIndex,
    		isIOS,
    		isAndroid,
    		alreadyCreated,
    		selectedListIndex,
    		dropdownInputValue,
    		itemRenderer,
    		listMessage,
    		__id,
    		refSelectAction,
    		refSelectActionParams,
    		inputValue,
    		hasFocus,
    		hasDropdownOpened,
    		onSelect,
    		onDeselect,
    		onCollapsableDeselect,
    		onHover,
    		onCollapsableHover,
    		onKeyDown,
    		onPaste,
    		onDndEvent,
    		options,
    		createFilter,
    		createTransform,
    		fetch,
    		value,
    		readSelection,
    		valueField,
    		labelField,
    		groupLabelField,
    		groupItemsField,
    		renderer,
    		selectOnTab,
    		resetOnSelect,
    		resetOnCollapsableDeselect,
    		closeAfterSelect,
    		validatorAction,
    		max,
    		creatablePrefix,
    		allowEditing,
    		keepCreated,
    		delimiter,
    		fetchMode,
    		fetchCallback,
    		fetchResetOnBlur,
    		minQuery,
    		searchField,
    		sortField,
    		disableSifter,
    		i18n,
    		valueAsObject,
    		focus,
    		getSelection,
    		setSelection,
    		clearByParent,
    		itemConfig,
    		isInitialized,
    		initFetchOnly,
    		prevValue,
    		flatItems,
    		selectedFlatItems,
    		$inputValue,
    		slots,
    		control_binding,
    		blur_handler,
    		dropdown_binding,
    		createoption_handler,
    		$$scope
    	];
    }

    class Svelecte extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$c,
    			create_fragment$c,
    			safe_not_equal,
    			{
    				name: 2,
    				inputId: 3,
    				required: 4,
    				hasAnchor: 5,
    				disabled: 0,
    				options: 59,
    				valueField: 65,
    				labelField: 66,
    				groupLabelField: 67,
    				groupItemsField: 68,
    				disabledField: 6,
    				placeholder: 7,
    				searchable: 8,
    				clearable: 9,
    				renderer: 69,
    				disableHighlight: 10,
    				selectOnTab: 70,
    				resetOnBlur: 11,
    				resetOnSelect: 71,
    				resetOnCollapsableDeselect: 72,
    				closeAfterSelect: 73,
    				dndzone: 12,
    				validatorAction: 74,
    				dropdownItem: 13,
    				controlItem: 14,
    				multiple: 1,
    				max: 75,
    				collapseSelection: 15,
    				collapsable: 16,
    				creatable: 17,
    				creatablePrefix: 76,
    				allowEditing: 77,
    				keepCreated: 78,
    				delimiter: 79,
    				createFilter: 60,
    				createTransform: 61,
    				fetch: 62,
    				fetchMode: 80,
    				fetchCallback: 81,
    				fetchResetOnBlur: 82,
    				minQuery: 83,
    				lazyDropdown: 18,
    				virtualList: 19,
    				vlHeight: 20,
    				vlItemSize: 21,
    				searchField: 84,
    				sortField: 85,
    				disableSifter: 86,
    				class: 22,
    				style: 23,
    				i18n: 87,
    				readSelection: 64,
    				value: 63,
    				labelAsValue: 24,
    				valueAsObject: 88,
    				focus: 89,
    				getSelection: 90,
    				setSelection: 91,
    				clearByParent: 92
    			},
    			null,
    			[-1, -1, -1, -1, -1]
    		);
    	}

    	get focus() {
    		return this.$$.ctx[89];
    	}

    	get getSelection() {
    		return this.$$.ctx[90];
    	}

    	get setSelection() {
    		return this.$$.ctx[91];
    	}

    	get clearByParent() {
    		return this.$$.ctx[92];
    	}
    }

    const dataset = {
      countryGroups: () => [
        {
          label: 'A',
          options: [{
            value: 'al',
            text: 'Albania'
          },
          {
            value: 'ad',
            text: 'Andorra'
          },
          {
            value: 'am',
            text: 'Armenia'
          },
          {
            value: 'a',
            text: 'Austria'
          },
          {
            value: 'az',
            text: 'Azerbaijan'
          }]
        },
        {
          label: 'B',
          options: [{
            value: 'by',
            text: 'Belarus'
          },
          {
            value: 'be',
            text: 'Belgium'
          },
          {
            value: 'ba',
            text: 'Bosnia and Herzegovina'
          },
          {
            value: 'bg',
            text: 'Bulgaria'
          }]
        },
        {
          label: 'C',
          options: [{
            value: 'hr',
            text: 'Croatia'
          },
          {
            value: 'cy',
            text: 'Cyprus'
          },
          {
            value: 'cz',
            text: 'Czechia'
          }]
        }
      ],
      countries: () => [
        {
          value: 'al',
          text: 'Albania'
        },
        {
          value: 'ad',
          text: 'Andorra'
        },
        {
          value: 'am',
          text: 'Armenia'
        },
        {
          value: 'a',
          text: 'Austria'
        },
        {
          value: 'az',
          text: 'Azerbaijan'
        },
        {
          value: 'by',
          text: 'Belarus'
        },
        {
          value: 'be',
          text: 'Belgium'
        },
        {
          value: 'ba',
          text: 'Bosnia and Herzegovina'
        },
        {
          value: 'bg',
          text: 'Bulgaria'
        },
        {
          value: 'hr',
          text: 'Croatia'
        },
        {
          value: 'cy',
          text: 'Cyprus'
        },
        {
          value: 'cz',
          text: 'Czechia'
        },
        {
          value: 'dk',
          text: 'Denmark'
        },
        {
          value: 'ee',
          text: 'Estonia'
        },
        {
          value: 'fi',
          text: 'Finland'
        },
        {
          value: 'fr',
          text: 'France'
        },
        {
          value: 'ge',
          text: 'Georgia'
        },
        {
          value: 'de',
          text: 'Germany'
        },
        {
          value: 'gr',
          text: 'Greece'
        },
        {
          value: 'hu',
          text: 'Hungary'
        },
        {
          value: 'is',
          text: 'Iceland'
        },
        {
          value: 'ie',
          text: 'Ireland'
        },
        {
          value: 'it',
          text: 'Italy'
        },
        {
          value: 'xk',
          text: 'Kosovo'
        },
        {
          value: 'lv',
          text: 'Latvia'
        },
        {
          value: 'li',
          text: 'Liechtenstein'
        },
        {
          value: 'lt',
          text: 'Lithuania'
        },
        {
          value: 'lu',
          text: 'Luxembourg'
        },
        {
          value: 'mt',
          text: 'Malta'
        },
        {
          value: 'md',
          text: 'Moldova'
        },
        {
          value: 'me',
          text: 'Montenegro'
        },
        {
          value: 'nl',
          text: 'Netherlands'
        },
        {
          value: 'mk',
          text: 'North Macedonia (formerly Macedonia)'
        },
        {
          value: 'no',
          text: 'Norway'
        },
        {
          value: 'pl',
          text: 'Poland'
        },
        {
          value: 'pt',
          text: 'Portugal'
        },
        {
          value: 'ro',
          text: 'Romania'
        },
        {
          value: 'ru',
          text: 'Russia'
        },
        {
          value: 'rs',
          text: 'Serbia'
        },
        {
          value: 'sk',
          text: 'Slovakia'
        },
        {
          value: 'sl',
          text: 'Slovenia'
        },
        {
          value: 'es',
          text: 'Spain'
        },
        {
          value: 'se',
          text: 'Sweden'
        },
        {
          value: 'ch',
          text: 'Switzerland'
        },
        {
          value: 'tr',
          text: 'Turkey'
        },
        {
          value: 'ua',
          text: 'Ukraine'
        },
        {
          value: 'uk',
          text: 'United Kingdom'
        },
      ],
      colors: () => [
        {
          value: 'aqua',
          text: 'Aqua',
          hex: '#00FFFF'
        },
        {
          value: 'black',
          text: 'Black',
          hex: '#000000'
        },
        {
          value: 'blue',
          text: 'Blue',
          hex: '#0000FF'
        },
        {
          value: 'gray',
          text: 'Gray',
          hex: '#808080'
        },
        {
          value: 'green',
          text: 'Green',
          hex: '#008000'
        },
        {
          value: 'fuchsia',
          text: 'Fuchsia',
          hex: '#FF00FF'
        },
        {
          value: 'lime',
          text: 'Lime',
          hex: '#00FF00'
        },
        {
          value: 'maroon',
          text: 'Maroon',
          hex: '#800000'
        },
        {
          value: 'navy',
          text: 'Navy',
          hex: '#000080'
        },
        {
          value: 'olive',
          text: 'Olive',
          hex: '#808000'
        },
        {
          value: 'purple',
          text: 'Purple',
          hex: '#800080'
        },
        {
          value: 'red',
          text: 'Red',
          hex: '#FF0000'
        },
        {
          value: 'silver',
          text: 'Silver',
          hex: '#C0C0C0'
        },
        {
          value: 'teal',
          text: 'Teal',
          hex: '#008080'
        },
        {
          value: 'yellow',
          text: 'Yellow',
          hex: '#FFFF00'
        },
        {
          value: 'white',
          text: 'White',
          hex: '#FFFFFF'
        }
      ]
    };

    /* docs\src\01-basic.svelte generated by Svelte v3.55.1 */

    function create_fragment$b(ctx) {
    	let label;
    	let t1;
    	let svelecte;
    	let updating_readSelection;
    	let updating_value;
    	let t2;
    	let div0;
    	let t3;
    	let code0;
    	let t5;
    	let b0;
    	let t6_value = JSON.stringify(/*selection*/ ctx[0]) + "";
    	let t6;
    	let t7;
    	let div1;
    	let t8;
    	let code1;
    	let t10;
    	let b1;
    	let t11;
    	let current;

    	function svelecte_readSelection_binding(value) {
    		/*svelecte_readSelection_binding*/ ctx[3](value);
    	}

    	function svelecte_value_binding(value) {
    		/*svelecte_value_binding*/ ctx[4](value);
    	}

    	let svelecte_props = {
    		options: /*options*/ ctx[2],
    		inputId: "country",
    		placeholder: "Select country"
    	};

    	if (/*selection*/ ctx[0] !== void 0) {
    		svelecte_props.readSelection = /*selection*/ ctx[0];
    	}

    	if (/*value*/ ctx[1] !== void 0) {
    		svelecte_props.value = /*value*/ ctx[1];
    	}

    	svelecte = new Svelecte({ props: svelecte_props });
    	binding_callbacks.push(() => bind(svelecte, 'readSelection', svelecte_readSelection_binding));
    	binding_callbacks.push(() => bind(svelecte, 'value', svelecte_value_binding));

    	return {
    		c() {
    			label = element("label");
    			label.textContent = "Select a country";
    			t1 = space();
    			create_component(svelecte.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			t3 = text("Current ");
    			code0 = element("code");
    			code0.textContent = "readSelection";
    			t5 = text(" value: ");
    			b0 = element("b");
    			t6 = text(t6_value);
    			t7 = space();
    			div1 = element("div");
    			t8 = text("Current ");
    			code1 = element("code");
    			code1.textContent = "value";
    			t10 = text(" value: ");
    			b1 = element("b");
    			t11 = text(/*value*/ ctx[1]);
    			attr(label, "for", "country");
    		},
    		m(target, anchor) {
    			insert(target, label, anchor);
    			insert(target, t1, anchor);
    			mount_component(svelecte, target, anchor);
    			insert(target, t2, anchor);
    			insert(target, div0, anchor);
    			append(div0, t3);
    			append(div0, code0);
    			append(div0, t5);
    			append(div0, b0);
    			append(b0, t6);
    			insert(target, t7, anchor);
    			insert(target, div1, anchor);
    			append(div1, t8);
    			append(div1, code1);
    			append(div1, t10);
    			append(div1, b1);
    			append(b1, t11);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const svelecte_changes = {};

    			if (!updating_readSelection && dirty & /*selection*/ 1) {
    				updating_readSelection = true;
    				svelecte_changes.readSelection = /*selection*/ ctx[0];
    				add_flush_callback(() => updating_readSelection = false);
    			}

    			if (!updating_value && dirty & /*value*/ 2) {
    				updating_value = true;
    				svelecte_changes.value = /*value*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			svelecte.$set(svelecte_changes);
    			if ((!current || dirty & /*selection*/ 1) && t6_value !== (t6_value = JSON.stringify(/*selection*/ ctx[0]) + "")) set_data(t6, t6_value);
    			if (!current || dirty & /*value*/ 2) set_data(t11, /*value*/ ctx[1]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(svelecte.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svelecte.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(label);
    			if (detaching) detach(t1);
    			destroy_component(svelecte, detaching);
    			if (detaching) detach(t2);
    			if (detaching) detach(div0);
    			if (detaching) detach(t7);
    			if (detaching) detach(div1);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let options = dataset.countries();
    	let selection = null;
    	let value = 'cz';

    	setTimeout(
    		() => {
    			$$invalidate(1, value = 'de');
    		},
    		4000
    	);

    	function svelecte_readSelection_binding(value) {
    		selection = value;
    		$$invalidate(0, selection);
    	}

    	function svelecte_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(1, value);
    	}

    	return [
    		selection,
    		value,
    		options,
    		svelecte_readSelection_binding,
    		svelecte_value_binding
    	];
    }

    class _01_basic extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});
    	}
    }

    /* docs\src\02-basicPlain.svelte generated by Svelte v3.55.1 */

    function create_fragment$a(ctx) {
    	let svelecte;
    	let updating_readSelection;
    	let updating_value;
    	let t0;
    	let div0;
    	let t1;
    	let label0;
    	let input0;
    	let t2;
    	let t3;
    	let label1;
    	let input1;
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let code0;
    	let t8;
    	let b0;
    	let t9_value = JSON.stringify(/*selection*/ ctx[1]) + "";
    	let t9;
    	let t10;
    	let br;
    	let t11;
    	let code1;
    	let t13;
    	let b1;
    	let t14;
    	let current;
    	let mounted;
    	let dispose;

    	function svelecte_readSelection_binding(value) {
    		/*svelecte_readSelection_binding*/ ctx[4](value);
    	}

    	function svelecte_value_binding(value) {
    		/*svelecte_value_binding*/ ctx[5](value);
    	}

    	let svelecte_props = {
    		options: /*options*/ ctx[3],
    		labelAsValue: /*labelAsValue*/ ctx[0],
    		multiple: true,
    		placeholder: "Select country"
    	};

    	if (/*selection*/ ctx[1] !== void 0) {
    		svelecte_props.readSelection = /*selection*/ ctx[1];
    	}

    	if (/*value*/ ctx[2] !== void 0) {
    		svelecte_props.value = /*value*/ ctx[2];
    	}

    	svelecte = new Svelecte({ props: svelecte_props });
    	binding_callbacks.push(() => bind(svelecte, 'readSelection', svelecte_readSelection_binding));
    	binding_callbacks.push(() => bind(svelecte, 'value', svelecte_value_binding));

    	return {
    		c() {
    			create_component(svelecte.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			t1 = text("Pick\r\n  ");
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text(" value");
    			t3 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t4 = text(" label");
    			t5 = space();
    			div1 = element("div");
    			t6 = text("Current ");
    			code0 = element("code");
    			code0.textContent = "readSelection";
    			t8 = text(" value: ");
    			b0 = element("b");
    			t9 = text(t9_value);
    			t10 = space();
    			br = element("br");
    			t11 = text("\r\n  Current ");
    			code1 = element("code");
    			code1.textContent = "value";
    			t13 = text(" value: ");
    			b1 = element("b");
    			t14 = text(/*value*/ ctx[2]);
    			attr(input0, "type", "radio");
    			input0.__value = false;
    			input0.value = input0.__value;
    			/*$$binding_groups*/ ctx[7][0].push(input0);
    			attr(input1, "type", "radio");
    			attr(input1, "id", "");
    			input1.__value = true;
    			input1.value = input1.__value;
    			/*$$binding_groups*/ ctx[7][0].push(input1);
    			attr(div0, "class", "float-right");
    		},
    		m(target, anchor) {
    			mount_component(svelecte, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div0, anchor);
    			append(div0, t1);
    			append(div0, label0);
    			append(label0, input0);
    			input0.checked = input0.__value === /*labelAsValue*/ ctx[0];
    			append(label0, t2);
    			append(div0, t3);
    			append(div0, label1);
    			append(label1, input1);
    			input1.checked = input1.__value === /*labelAsValue*/ ctx[0];
    			append(label1, t4);
    			insert(target, t5, anchor);
    			insert(target, div1, anchor);
    			append(div1, t6);
    			append(div1, code0);
    			append(div1, t8);
    			append(div1, b0);
    			append(b0, t9);
    			append(div1, t10);
    			append(div1, br);
    			append(div1, t11);
    			append(div1, code1);
    			append(div1, t13);
    			append(div1, b1);
    			append(b1, t14);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "change", /*input0_change_handler*/ ctx[6]),
    					listen(input1, "change", /*input1_change_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			const svelecte_changes = {};
    			if (dirty & /*labelAsValue*/ 1) svelecte_changes.labelAsValue = /*labelAsValue*/ ctx[0];

    			if (!updating_readSelection && dirty & /*selection*/ 2) {
    				updating_readSelection = true;
    				svelecte_changes.readSelection = /*selection*/ ctx[1];
    				add_flush_callback(() => updating_readSelection = false);
    			}

    			if (!updating_value && dirty & /*value*/ 4) {
    				updating_value = true;
    				svelecte_changes.value = /*value*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			svelecte.$set(svelecte_changes);

    			if (dirty & /*labelAsValue*/ 1) {
    				input0.checked = input0.__value === /*labelAsValue*/ ctx[0];
    			}

    			if (dirty & /*labelAsValue*/ 1) {
    				input1.checked = input1.__value === /*labelAsValue*/ ctx[0];
    			}

    			if ((!current || dirty & /*selection*/ 2) && t9_value !== (t9_value = JSON.stringify(/*selection*/ ctx[1]) + "")) set_data(t9, t9_value);
    			if (!current || dirty & /*value*/ 4) set_data(t14, /*value*/ ctx[2]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(svelecte.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svelecte.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(svelecte, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div0);
    			/*$$binding_groups*/ ctx[7][0].splice(/*$$binding_groups*/ ctx[7][0].indexOf(input0), 1);
    			/*$$binding_groups*/ ctx[7][0].splice(/*$$binding_groups*/ ctx[7][0].indexOf(input1), 1);
    			if (detaching) detach(t5);
    			if (detaching) detach(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let options = dataset.countries().map(opt => opt.text);
    	let labelAsValue = false;
    	let selection = [];
    	let value = ['Czechia', 'Germany'];
    	const $$binding_groups = [[]];

    	function svelecte_readSelection_binding(value) {
    		selection = value;
    		$$invalidate(1, selection);
    	}

    	function svelecte_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(2, value);
    	}

    	function input0_change_handler() {
    		labelAsValue = this.__value;
    		$$invalidate(0, labelAsValue);
    	}

    	function input1_change_handler() {
    		labelAsValue = this.__value;
    		$$invalidate(0, labelAsValue);
    	}

    	return [
    		labelAsValue,
    		selection,
    		value,
    		options,
    		svelecte_readSelection_binding,
    		svelecte_value_binding,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler
    	];
    }

    class _02_basicPlain extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});
    	}
    }

    /* docs\src\03-groups.svelte generated by Svelte v3.55.1 */

    function create_fragment$9(ctx) {
    	let svelecte;
    	let current;

    	svelecte = new Svelecte({
    			props: {
    				options: /*options*/ ctx[0],
    				groupLabelField: "groupHeader",
    				groupItemsField: "items"
    			}
    		});

    	return {
    		c() {
    			create_component(svelecte.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(svelecte, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(svelecte.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svelecte.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(svelecte, detaching);
    		}
    	};
    }

    function instance$9($$self) {
    	const options = [
    		{
    			groupHeader: 'A',
    			items: [
    				{ value: 'al', text: 'Albania' },
    				{ value: 'ad', text: 'Andorra' },
    				{ value: 'am', text: 'Armenia' },
    				{ value: 'a', text: 'Austria' },
    				{ value: 'az', text: 'Azerbaijan' }
    			]
    		},
    		{
    			groupHeader: 'B',
    			items: [
    				{ value: 'by', text: 'Belarus' },
    				{ value: 'be', text: 'Belgium' },
    				{
    					value: 'ba',
    					text: 'Bosnia and Herzegovina'
    				},
    				{ value: 'bg', text: 'Bulgaria' }
    			]
    		},
    		{
    			groupHeader: 'C',
    			items: [
    				{ value: 'hr', text: 'Croatia' },
    				{ value: 'cy', text: 'Cyprus' },
    				{ value: 'cz', text: 'Czechia' }
    			]
    		}
    	];

    	return [options];
    }

    class _03_groups extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});
    	}
    }

    /* docs\src\04-item-rendering.svelte generated by Svelte v3.55.1 */

    function create_fragment$8(ctx) {
    	let svelecte;
    	let current;

    	svelecte = new Svelecte({
    			props: {
    				options: /*options*/ ctx[0],
    				renderer: "color-blocks",
    				placeholder: "Select color"
    			}
    		});

    	return {
    		c() {
    			create_component(svelecte.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(svelecte, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i(local) {
    			if (current) return;
    			transition_in(svelecte.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svelecte.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(svelecte, detaching);
    		}
    	};
    }

    function colorRenderer(item, isSelected) {
    	if (isSelected) {
    		return `<div class="color-item" style="background-color: ${item.hex}">
        Selected color
      </div>`;
    	}

    	return `<span class="color-item" style="background-color: ${item.hex};">
      </span>${item.text}`;
    }

    function instance$8($$self) {
    	let options = dataset.colors();

    	// add custom renderer
    	addFormatter('color-blocks', colorRenderer);

    	// alternatively you can use object syntax
    	addFormatter({ 'color-blocks': colorRenderer });

    	return [options];
    }

    class _04_item_rendering extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});
    	}
    }

    /* docs\src\05-slot.svelte generated by Svelte v3.55.1 */

    function create_icon_slot$1(ctx) {
    	let b;
    	let t;

    	return {
    		c() {
    			b = element("b");
    			t = text(/*iconSlot*/ ctx[1]);
    			attr(b, "slot", "icon");
    		},
    		m(target, anchor) {
    			insert(target, b, anchor);
    			append(b, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*iconSlot*/ 2) set_data(t, /*iconSlot*/ ctx[1]);
    		},
    		d(detaching) {
    			if (detaching) detach(b);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	let svelecte;
    	let updating_value;
    	let current;

    	function svelecte_value_binding(value) {
    		/*svelecte_value_binding*/ ctx[3](value);
    	}

    	let svelecte_props = {
    		options: /*options*/ ctx[2],
    		placeholder: "Pick your color, even the black 😉",
    		$$slots: { icon: [create_icon_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*iconValue*/ ctx[0] !== void 0) {
    		svelecte_props.value = /*iconValue*/ ctx[0];
    	}

    	svelecte = new Svelecte({ props: svelecte_props });
    	binding_callbacks.push(() => bind(svelecte, 'value', svelecte_value_binding));

    	return {
    		c() {
    			create_component(svelecte.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(svelecte, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const svelecte_changes = {};

    			if (dirty & /*$$scope, iconSlot*/ 18) {
    				svelecte_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*iconValue*/ 1) {
    				updating_value = true;
    				svelecte_changes.value = /*iconValue*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			svelecte.$set(svelecte_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(svelecte.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svelecte.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(svelecte, detaching);
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let iconSlot;
    	let options = dataset.colors();
    	let iconValue = null;

    	function svelecte_value_binding(value) {
    		iconValue = value;
    		$$invalidate(0, iconValue);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*iconValue*/ 1) {
    			$$invalidate(1, iconSlot = iconValue ? iconValue === 'black' ? '💀' : '👍' : '👉');
    		}
    	};

    	return [iconValue, iconSlot, options, svelecte_value_binding];
    }

    class _05_slot extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});
    	}
    }

    /* docs\src\06-fetch.svelte generated by Svelte v3.55.1 */

    function create_fragment$6(ctx) {
    	let svelecte;
    	let updating_value;
    	let t0;
    	let div;
    	let b;
    	let t2;
    	let span;
    	let t3;
    	let input0;
    	let t4;
    	let label0;
    	let input1;
    	let t5;
    	let t6;
    	let label1;
    	let input2;
    	let t7;
    	let t8;
    	let pre;
    	let t9_value = JSON.stringify(/*selectionWork*/ ctx[2]) + "";
    	let t9;
    	let current;
    	let mounted;
    	let dispose;

    	function svelecte_value_binding(value) {
    		/*svelecte_value_binding*/ ctx[4](value);
    	}

    	let svelecte_props = {
    		resetOnBlur: /*resetOnBlur*/ ctx[0],
    		fetchResetOnBlur: /*fetchResetOnBlur*/ ctx[1],
    		valueAsObject: true,
    		minQuery: /*minQueryValue*/ ctx[3],
    		multiple: true,
    		placeholder: "Start typing ('re' for example)",
    		fetch: "https://jsonplaceholder.typicode.com/users/?email_like=[query]"
    	};

    	if (/*selectionWork*/ ctx[2] !== void 0) {
    		svelecte_props.value = /*selectionWork*/ ctx[2];
    	}

    	svelecte = new Svelecte({ props: svelecte_props });
    	binding_callbacks.push(() => bind(svelecte, 'value', svelecte_value_binding));

    	return {
    		c() {
    			create_component(svelecte.$$.fragment);
    			t0 = space();
    			div = element("div");
    			b = element("b");
    			b.textContent = "Selected:";
    			t2 = space();
    			span = element("span");
    			t3 = text("Min. query length:");
    			input0 = element("input");
    			t4 = space();
    			label0 = element("label");
    			input1 = element("input");
    			t5 = text(" Reset on blur");
    			t6 = space();
    			label1 = element("label");
    			input2 = element("input");
    			t7 = text(" Reset search results on empty input");
    			t8 = space();
    			pre = element("pre");
    			t9 = text(t9_value);
    			attr(input0, "type", "number");
    			attr(input0, "min", "1");
    			attr(input0, "step", "1");
    			attr(input0, "class", "small-input svelte-1go3b6d");
    			attr(input1, "type", "checkbox");
    			attr(input1, "name", "");
    			attr(input1, "id", "rob");
    			attr(label0, "for", "rob");
    			attr(label0, "class", "mr-2");
    			attr(input2, "type", "checkbox");
    			attr(input2, "name", "");
    			attr(input2, "id", "frob");
    			attr(label1, "for", "frob");
    			attr(span, "class", "float-right");
    			attr(pre, "class", "mt-2");
    		},
    		m(target, anchor) {
    			mount_component(svelecte, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, b);
    			append(div, t2);
    			append(div, span);
    			append(span, t3);
    			append(span, input0);
    			set_input_value(input0, /*minQueryValue*/ ctx[3]);
    			append(span, t4);
    			append(span, label0);
    			append(label0, input1);
    			input1.checked = /*resetOnBlur*/ ctx[0];
    			append(label0, t5);
    			append(span, t6);
    			append(span, label1);
    			append(label1, input2);
    			input2.checked = /*fetchResetOnBlur*/ ctx[1];
    			append(label1, t7);
    			append(div, t8);
    			append(div, pre);
    			append(pre, t9);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen(input1, "change", /*input1_change_handler*/ ctx[6]),
    					listen(input2, "change", /*input2_change_handler*/ ctx[7])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			const svelecte_changes = {};
    			if (dirty & /*resetOnBlur*/ 1) svelecte_changes.resetOnBlur = /*resetOnBlur*/ ctx[0];
    			if (dirty & /*fetchResetOnBlur*/ 2) svelecte_changes.fetchResetOnBlur = /*fetchResetOnBlur*/ ctx[1];
    			if (dirty & /*minQueryValue*/ 8) svelecte_changes.minQuery = /*minQueryValue*/ ctx[3];

    			if (!updating_value && dirty & /*selectionWork*/ 4) {
    				updating_value = true;
    				svelecte_changes.value = /*selectionWork*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			svelecte.$set(svelecte_changes);

    			if (dirty & /*minQueryValue*/ 8 && to_number(input0.value) !== /*minQueryValue*/ ctx[3]) {
    				set_input_value(input0, /*minQueryValue*/ ctx[3]);
    			}

    			if (dirty & /*resetOnBlur*/ 1) {
    				input1.checked = /*resetOnBlur*/ ctx[0];
    			}

    			if (dirty & /*fetchResetOnBlur*/ 2) {
    				input2.checked = /*fetchResetOnBlur*/ ctx[1];
    			}

    			if ((!current || dirty & /*selectionWork*/ 4) && t9_value !== (t9_value = JSON.stringify(/*selectionWork*/ ctx[2]) + "")) set_data(t9, t9_value);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(svelecte.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svelecte.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(svelecte, detaching);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let resetOnBlur = true;
    	let fetchResetOnBlur = true;

    	/**
     * NOTE: We do not define initial value for `options` property. Initial options are created from `value` property.
     * To make this conversion automatic, `valueAsObject` must be set to `true`
     */
    	let selectionWork = [
    		{
    			"id": 10,
    			"name": "Clementina DuBuque",
    			"username": "Moriah.Stanton",
    			"email": "Rey.Padberg@karina.biz",
    			"address": {
    				"street": "Kattie Turnpike",
    				"suite": "Suite 198",
    				"city": "Lebsackbury",
    				"zipcode": "31428-2261",
    				"geo": { "lat": "-38.2386", "lng": "57.2232" }
    			},
    			"phone": "024-648-3804",
    			"website": "ambrose.net",
    			"company": {
    				"name": "Hoeger LLC",
    				"catchPhrase": "Centralized empowering task-force",
    				"bs": "target end-to-end models"
    			}
    		}
    	];

    	let minQueryValue = 2;

    	function svelecte_value_binding(value) {
    		selectionWork = value;
    		$$invalidate(2, selectionWork);
    	}

    	function input0_input_handler() {
    		minQueryValue = to_number(this.value);
    		$$invalidate(3, minQueryValue);
    	}

    	function input1_change_handler() {
    		resetOnBlur = this.checked;
    		$$invalidate(0, resetOnBlur);
    	}

    	function input2_change_handler() {
    		fetchResetOnBlur = this.checked;
    		$$invalidate(1, fetchResetOnBlur);
    	}

    	return [
    		resetOnBlur,
    		fetchResetOnBlur,
    		selectionWork,
    		minQueryValue,
    		svelecte_value_binding,
    		input0_input_handler,
    		input1_change_handler,
    		input2_change_handler
    	];
    }

    class _06_fetch extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});
    	}
    }

    /* docs\src\07-playground.svelte generated by Svelte v3.55.1 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[72] = list[i];
    	child_ctx[74] = i;
    	return child_ctx;
    }

    // (216:8) 
    function create_icon_slot(ctx) {
    	let b;
    	let t;

    	return {
    		c() {
    			b = element("b");
    			t = text(/*slot*/ ctx[20]);
    			attr(b, "slot", "icon");
    		},
    		m(target, anchor) {
    			insert(target, b, anchor);
    			append(b, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*slot*/ 1048576) set_data(t, /*slot*/ ctx[20]);
    		},
    		d(detaching) {
    			if (detaching) detach(b);
    		}
    	};
    }

    // (260:14) {#each availableRenderers[remoteValue] || [] as item, i}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[72] + "";
    	let t;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[72];
    			option.value = option.__value;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*remoteValue*/ 4 && t_value !== (t_value = /*item*/ ctx[72] + "")) set_data(t, t_value);

    			if (dirty[0] & /*remoteValue*/ 4 && option_value_value !== (option_value_value = /*item*/ ctx[72])) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	let div7;
    	let div1;
    	let h4;
    	let t1;
    	let div0;
    	let svelecte0;
    	let updating_value;
    	let t2;
    	let t3_value = JSON.stringify(/*myValue*/ ctx[3]) + "";
    	let t3;
    	let t4;
    	let p0;
    	let t6;
    	let ul;
    	let li0;
    	let button0;
    	let t8;
    	let li1;
    	let button1;
    	let t10;
    	let p1;
    	let t14;
    	let div6;
    	let fieldset7;
    	let legend0;
    	let t16;
    	let div5;
    	let div2;
    	let fieldset0;
    	let legend1;
    	let t18;
    	let label0;
    	let input0;
    	let t19;
    	let br0;
    	let t20;
    	let label1;
    	let input1;
    	let t21;
    	let br1;
    	let t22;
    	let button2;
    	let t24;
    	let fieldset1;
    	let legend2;
    	let t26;
    	let svelecte1;
    	let updating_readSelection;
    	let t27;
    	let p2;
    	let t32;
    	let fieldset2;
    	let legend3;
    	let t34;
    	let select0;
    	let option0;
    	let select0_disabled_value;
    	let t36;
    	let div3;
    	let fieldset3;
    	let legend4;
    	let t38;
    	let label2;
    	let input2;
    	let t39;
    	let t40;
    	let span0;
    	let input3;
    	let input3_disabled_value;
    	let t41;
    	let br3;
    	let t42;
    	let label3;
    	let input4;
    	let input4_disabled_value;
    	let t43;
    	let t44;
    	let hr;
    	let t45;
    	let label4;
    	let input5;
    	let t46;
    	let t47;
    	let fieldset4;
    	let legend5;
    	let t49;
    	let label5;
    	let input6;
    	let t50;
    	let br4;
    	let t51;
    	let span1;
    	let input7;
    	let input7_disabled_value;
    	let t52;
    	let span2;
    	let input8;
    	let input8_disabled_value;
    	let t53;
    	let br5;
    	let t54;
    	let span3;
    	let label6;
    	let input9;
    	let t55;
    	let br6;
    	let t56;
    	let span4;
    	let label7;
    	let input10;
    	let t57;
    	let br7;
    	let t58;
    	let div4;
    	let fieldset5;
    	let legend6;
    	let t60;
    	let input11;
    	let br8;
    	let t61;
    	let label8;
    	let input12;
    	let t62;
    	let br9;
    	let t63;
    	let label9;
    	let input13;
    	let t64;
    	let br10;
    	let t65;
    	let label10;
    	let input14;
    	let t66;
    	let kbd;
    	let t68;
    	let fieldset6;
    	let legend7;
    	let t70;
    	let span5;
    	let t72;
    	let select1;
    	let option1;
    	let option2;
    	let current;
    	let mounted;
    	let dispose;
    	const svelecte0_spread_levels = [/*settings*/ ctx[19], { name: "select" }, { valueAsObject: true }];

    	function svelecte0_value_binding(value) {
    		/*svelecte0_value_binding*/ ctx[29](value);
    	}

    	let svelecte0_props = {
    		$$slots: { icon: [create_icon_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < svelecte0_spread_levels.length; i += 1) {
    		svelecte0_props = assign(svelecte0_props, svelecte0_spread_levels[i]);
    	}

    	if (/*myValue*/ ctx[3] !== void 0) {
    		svelecte0_props.value = /*myValue*/ ctx[3];
    	}

    	svelecte0 = new Svelecte({ props: svelecte0_props });
    	binding_callbacks.push(() => bind(svelecte0, 'value', svelecte0_value_binding));
    	/*svelecte0_binding*/ ctx[30](svelecte0);

    	function svelecte1_readSelection_binding(value) {
    		/*svelecte1_readSelection_binding*/ ctx[36](value);
    	}

    	let svelecte1_props = {
    		options: /*optionsList*/ ctx[22],
    		style: "width: 195px"
    	};

    	if (/*dataSrc*/ ctx[0] !== void 0) {
    		svelecte1_props.readSelection = /*dataSrc*/ ctx[0];
    	}

    	svelecte1 = new Svelecte({ props: svelecte1_props });
    	binding_callbacks.push(() => bind(svelecte1, 'readSelection', svelecte1_readSelection_binding));
    	svelecte1.$on("change", /*change_handler_2*/ ctx[37]);
    	let each_value = /*availableRenderers*/ ctx[21][/*remoteValue*/ ctx[2]] || [];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			div7 = element("div");
    			div1 = element("div");
    			h4 = element("h4");
    			h4.textContent = "• Complex playground •";
    			t1 = space();
    			div0 = element("div");
    			create_component(svelecte0.$$.fragment);
    			t2 = text("\n      Current value: ");
    			t3 = text(t3_value);
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "Complete playground with almost options available. Try for example:";
    			t6 = space();
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			button0.textContent = "collapsible multiselection";
    			t8 = space();
    			li1 = element("li");
    			button1 = element("button");
    			button1.textContent = "creatable (create your tags)";
    			t10 = space();
    			p1 = element("p");

    			p1.innerHTML = `⚠ When searching through items, AND is used as logical operator when space is entered. If you would like
      to use OR, you have to start your search query by &quot;<code>|| </code>&quot; prefix. The space on 3rd position 
      is also very important here.`;

    			t14 = space();
    			div6 = element("div");
    			fieldset7 = element("fieldset");
    			legend0 = element("legend");
    			legend0.textContent = "Customize";
    			t16 = space();
    			div5 = element("div");
    			div2 = element("div");
    			fieldset0 = element("fieldset");
    			legend1 = element("legend");
    			legend1.textContent = "Control";
    			t18 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t19 = text(" Disabled");
    			br0 = element("br");
    			t20 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t21 = text(" Use virtual list");
    			br1 = element("br");
    			t22 = space();
    			button2 = element("button");
    			button2.textContent = "Clear selection";
    			t24 = space();
    			fieldset1 = element("fieldset");
    			legend2 = element("legend");
    			legend2.textContent = "Options";
    			t26 = space();
    			create_component(svelecte1.$$.fragment);
    			t27 = space();
    			p2 = element("p");

    			p2.innerHTML = `Options with <small class="label label-primary">API</small> label<br/>
              to demonstrate AJAX fetch.`;

    			t32 = space();
    			fieldset2 = element("fieldset");
    			legend3 = element("legend");
    			legend3.textContent = "Rendering";
    			t34 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Default";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t36 = space();
    			div3 = element("div");
    			fieldset3 = element("fieldset");
    			legend4 = element("legend");
    			legend4.textContent = "Multiple";
    			t38 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t39 = text(" Multiple");
    			t40 = space();
    			span0 = element("span");
    			input3 = element("input");
    			t41 = space();
    			br3 = element("br");
    			t42 = space();
    			label3 = element("label");
    			input4 = element("input");
    			t43 = text(" Collapse selection");
    			t44 = space();
    			hr = element("hr");
    			t45 = space();
    			label4 = element("label");
    			input5 = element("input");
    			t46 = text(" Inline width");
    			t47 = space();
    			fieldset4 = element("fieldset");
    			legend5 = element("legend");
    			legend5.textContent = "Creatable";
    			t49 = space();
    			label5 = element("label");
    			input6 = element("input");
    			t50 = text(" Creatable");
    			br4 = element("br");
    			t51 = space();
    			span1 = element("span");
    			input7 = element("input");
    			t52 = space();
    			span2 = element("span");
    			input8 = element("input");
    			t53 = space();
    			br5 = element("br");
    			t54 = space();
    			span3 = element("span");
    			label6 = element("label");
    			input9 = element("input");
    			t55 = text(" Allow editing");
    			br6 = element("br");
    			t56 = space();
    			span4 = element("span");
    			label7 = element("label");
    			input10 = element("input");
    			t57 = text(" Keep created options");
    			br7 = element("br");
    			t58 = space();
    			div4 = element("div");
    			fieldset5 = element("fieldset");
    			legend6 = element("legend");
    			legend6.textContent = "UI";
    			t60 = text("\n            Placeholder ");
    			input11 = element("input");
    			br8 = element("br");
    			t61 = space();
    			label8 = element("label");
    			input12 = element("input");
    			t62 = text(" Searchable");
    			br9 = element("br");
    			t63 = space();
    			label9 = element("label");
    			input13 = element("input");
    			t64 = text(" Clearable");
    			br10 = element("br");
    			t65 = space();
    			label10 = element("label");
    			input14 = element("input");
    			t66 = text(" Select on ");
    			kbd = element("kbd");
    			kbd.textContent = "Tab";
    			t68 = space();
    			fieldset6 = element("fieldset");
    			legend7 = element("legend");
    			legend7.textContent = "Styling";
    			t70 = space();
    			span5 = element("span");
    			span5.textContent = "CSS class";
    			t72 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "svelecte-control (default)";
    			option2 = element("option");
    			option2.textContent = "red style (custom)";
    			attr(p0, "class", "mt-2");
    			attr(button0, "class", "btn btn-sm");
    			attr(button1, "class", "btn btn-sm");
    			attr(div0, "class", "form-row example-wrap svelte-19xmbht");
    			toggle_class(div0, "flexible-svelecte", /*isFlexWidth*/ ctx[6]);
    			attr(p1, "class", "mt-2");
    			attr(div1, "class", "column col-xl-12 col-5");
    			attr(legend0, "class", "svelte-19xmbht");
    			attr(legend1, "class", "svelte-19xmbht");
    			attr(input0, "type", "checkbox");
    			attr(input1, "type", "checkbox");
    			attr(button2, "class", "btn mt-2");
    			attr(fieldset0, "class", "svelte-19xmbht");
    			attr(legend2, "class", "svelte-19xmbht");
    			attr(p2, "class", "mb-0");
    			attr(fieldset1, "class", "svelte-19xmbht");
    			attr(legend3, "class", "svelte-19xmbht");
    			option0.__value = "";
    			option0.value = option0.__value;
    			select0.disabled = select0_disabled_value = !/*remoteValue*/ ctx[2] || !/*availableRenderers*/ ctx[21][/*remoteValue*/ ctx[2]].length;
    			attr(fieldset2, "class", "svelte-19xmbht");
    			attr(div2, "class", "col");
    			attr(legend4, "class", "svelte-19xmbht");
    			attr(input2, "type", "checkbox");
    			attr(input3, "class", "input-sm svelte-19xmbht");
    			attr(input3, "type", "number");
    			attr(input3, "placeholder", "limit");
    			input3.disabled = input3_disabled_value = !/*settings*/ ctx[19].multiple;
    			attr(input3, "min", "0");
    			attr(span0, "class", "tooltip");
    			attr(span0, "data-tooltip", "Limit selection count");
    			attr(input4, "type", "checkbox");
    			input4.disabled = input4_disabled_value = !/*settings*/ ctx[19].multiple;
    			attr(label3, "class", "tooltip");
    			attr(label3, "data-tooltip", "Show only selection sum string");
    			attr(input5, "type", "checkbox");
    			attr(fieldset3, "class", "svelte-19xmbht");
    			attr(legend5, "class", "svelte-19xmbht");
    			attr(input6, "type", "checkbox");
    			attr(input7, "class", "input-sm input-short svelte-19xmbht");
    			attr(input7, "placeholder", "Item prefix");
    			input7.disabled = input7_disabled_value = !/*settings*/ ctx[19].creatable;
    			attr(span1, "class", "tooltip");
    			attr(span1, "data-tooltip", "prefix that is shown\nwhen creating new items");
    			attr(input8, "class", "input-sm input-short svelte-19xmbht");
    			attr(input8, "placeholder", "Delimiter");
    			input8.disabled = input8_disabled_value = !/*settings*/ ctx[19].creatable;
    			attr(span2, "class", "tooltip");
    			attr(span2, "data-tooltip", "Delimiter character for new items\n(when pasting etc.)");
    			attr(input9, "type", "checkbox");
    			attr(span3, "class", "tooltip");
    			attr(span3, "data-tooltip", "Edit created item when backspace is pressed\n(normally remove selected item)");
    			attr(input10, "type", "checkbox");
    			attr(span4, "class", "tooltip");
    			attr(span4, "data-tooltip", "Keep created item in options dropdown");
    			attr(fieldset4, "class", "svelte-19xmbht");
    			attr(div3, "class", "col");
    			attr(legend6, "class", "svelte-19xmbht");
    			attr(input11, "class", "input-sm");
    			attr(input12, "type", "checkbox");
    			attr(input13, "type", "checkbox");
    			attr(input14, "type", "checkbox");
    			attr(fieldset5, "class", "svelte-19xmbht");
    			attr(legend7, "class", "svelte-19xmbht");
    			option1.__value = "svelecte-control";
    			option1.value = option1.__value;
    			option2.__value = "svelecte-control custom-css";
    			option2.value = option2.__value;
    			if (/*classSelection*/ ctx[4] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[65].call(select1));
    			attr(fieldset6, "class", "svelte-19xmbht");
    			attr(div4, "class", "col");
    			attr(div5, "class", "columns");
    			attr(fieldset7, "class", "svelte-19xmbht");
    			attr(div6, "class", "column col-xl-12 col-7");
    			attr(div7, "class", "columns");
    		},
    		m(target, anchor) {
    			insert(target, div7, anchor);
    			append(div7, div1);
    			append(div1, h4);
    			append(div1, t1);
    			append(div1, div0);
    			mount_component(svelecte0, div0, null);
    			append(div0, t2);
    			append(div0, t3);
    			append(div0, t4);
    			append(div0, p0);
    			append(div0, t6);
    			append(div0, ul);
    			append(ul, li0);
    			append(li0, button0);
    			append(ul, t8);
    			append(ul, li1);
    			append(li1, button1);
    			append(div1, t10);
    			append(div1, p1);
    			append(div7, t14);
    			append(div7, div6);
    			append(div6, fieldset7);
    			append(fieldset7, legend0);
    			append(fieldset7, t16);
    			append(fieldset7, div5);
    			append(div5, div2);
    			append(div2, fieldset0);
    			append(fieldset0, legend1);
    			append(fieldset0, t18);
    			append(fieldset0, label0);
    			append(label0, input0);
    			input0.checked = /*disabled*/ ctx[12];
    			append(label0, t19);
    			append(fieldset0, br0);
    			append(fieldset0, t20);
    			append(fieldset0, label1);
    			append(label1, input1);
    			input1.checked = /*virtualList*/ ctx[18];
    			append(label1, t21);
    			append(fieldset0, br1);
    			append(fieldset0, t22);
    			append(fieldset0, button2);
    			append(div2, t24);
    			append(div2, fieldset1);
    			append(fieldset1, legend2);
    			append(fieldset1, t26);
    			mount_component(svelecte1, fieldset1, null);
    			append(fieldset1, t27);
    			append(fieldset1, p2);
    			append(div2, t32);
    			append(div2, fieldset2);
    			append(fieldset2, legend3);
    			append(fieldset2, t34);
    			append(fieldset2, select0);
    			append(select0, option0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select0, null);
    			}

    			append(div5, t36);
    			append(div5, div3);
    			append(div3, fieldset3);
    			append(fieldset3, legend4);
    			append(fieldset3, t38);
    			append(fieldset3, label2);
    			append(label2, input2);
    			input2.checked = /*multiple*/ ctx[1];
    			append(label2, t39);
    			append(fieldset3, t40);
    			append(fieldset3, span0);
    			append(span0, input3);
    			set_input_value(input3, /*max*/ ctx[7]);
    			append(fieldset3, t41);
    			append(fieldset3, br3);
    			append(fieldset3, t42);
    			append(fieldset3, label3);
    			append(label3, input4);
    			input4.checked = /*collapseSelection*/ ctx[8];
    			append(label3, t43);
    			append(fieldset3, t44);
    			append(fieldset3, hr);
    			append(fieldset3, t45);
    			append(fieldset3, label4);
    			append(label4, input5);
    			input5.checked = /*isFlexWidth*/ ctx[6];
    			append(label4, t46);
    			append(div3, t47);
    			append(div3, fieldset4);
    			append(fieldset4, legend5);
    			append(fieldset4, t49);
    			append(fieldset4, label5);
    			append(label5, input6);
    			input6.checked = /*creatable*/ ctx[13];
    			append(label5, t50);
    			append(fieldset4, br4);
    			append(fieldset4, t51);
    			append(fieldset4, span1);
    			append(span1, input7);
    			set_input_value(input7, /*creatablePrefix*/ ctx[14]);
    			append(fieldset4, t52);
    			append(fieldset4, span2);
    			append(span2, input8);
    			set_input_value(input8, /*delimiter*/ ctx[17]);
    			append(span2, t53);
    			append(fieldset4, br5);
    			append(fieldset4, t54);
    			append(fieldset4, span3);
    			append(span3, label6);
    			append(label6, input9);
    			input9.checked = /*allowEditing*/ ctx[15];
    			append(label6, t55);
    			append(span3, br6);
    			append(fieldset4, t56);
    			append(fieldset4, span4);
    			append(span4, label7);
    			append(label7, input10);
    			input10.checked = /*keepCreated*/ ctx[16];
    			append(label7, t57);
    			append(span4, br7);
    			append(div5, t58);
    			append(div5, div4);
    			append(div4, fieldset5);
    			append(fieldset5, legend6);
    			append(fieldset5, t60);
    			append(fieldset5, input11);
    			set_input_value(input11, /*settings*/ ctx[19].placeholder);
    			append(fieldset5, br8);
    			append(fieldset5, t61);
    			append(fieldset5, label8);
    			append(label8, input12);
    			input12.checked = /*searchable*/ ctx[9];
    			append(label8, t62);
    			append(fieldset5, br9);
    			append(fieldset5, t63);
    			append(fieldset5, label9);
    			append(label9, input13);
    			input13.checked = /*clearable*/ ctx[10];
    			append(label9, t64);
    			append(fieldset5, br10);
    			append(fieldset5, t65);
    			append(fieldset5, label10);
    			append(label10, input14);
    			input14.checked = /*selectOnTab*/ ctx[11];
    			append(label10, t66);
    			append(label10, kbd);
    			append(div4, t68);
    			append(div4, fieldset6);
    			append(fieldset6, legend7);
    			append(fieldset6, t70);
    			append(fieldset6, span5);
    			append(fieldset6, t72);
    			append(fieldset6, select1);
    			append(select1, option1);
    			append(select1, option2);
    			select_option(select1, /*classSelection*/ ctx[4]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button0, "click", /*onPresetCollapsible*/ ctx[24]),
    					listen(button1, "click", /*onPresetCreatableOnly*/ ctx[25]),
    					listen(input0, "change", /*change_handler*/ ctx[31]),
    					listen(input0, "change", /*input0_change_handler*/ ctx[32]),
    					listen(input1, "change", /*change_handler_1*/ ctx[33]),
    					listen(input1, "change", /*input1_change_handler*/ ctx[34]),
    					listen(button2, "click", /*click_handler*/ ctx[35]),
    					listen(select0, "change", /*change_handler_3*/ ctx[38]),
    					listen(select0, "blur", /*blur_handler*/ ctx[28]),
    					listen(input2, "change", /*change_handler_4*/ ctx[39]),
    					listen(input2, "change", /*input2_change_handler*/ ctx[40]),
    					listen(input3, "input", /*input_handler*/ ctx[41]),
    					listen(input3, "input", /*input3_input_handler*/ ctx[42]),
    					listen(input4, "change", /*change_handler_5*/ ctx[43]),
    					listen(input4, "change", /*input4_change_handler*/ ctx[44]),
    					listen(input5, "change", /*input5_change_handler*/ ctx[45]),
    					listen(input6, "change", /*change_handler_6*/ ctx[46]),
    					listen(input6, "change", /*input6_change_handler*/ ctx[47]),
    					listen(input7, "input", /*input_handler_1*/ ctx[48]),
    					listen(input7, "input", /*input7_input_handler*/ ctx[49]),
    					listen(input8, "input", /*input_handler_2*/ ctx[50]),
    					listen(input8, "input", /*input8_input_handler*/ ctx[51]),
    					listen(input9, "change", /*change_handler_7*/ ctx[52]),
    					listen(input9, "change", /*input9_change_handler*/ ctx[53]),
    					listen(input10, "change", /*change_handler_8*/ ctx[54]),
    					listen(input10, "change", /*input10_change_handler*/ ctx[55]),
    					listen(input11, "input", /*input_handler_3*/ ctx[56]),
    					listen(input11, "input", /*input11_input_handler*/ ctx[57]),
    					listen(input12, "change", /*change_handler_9*/ ctx[58]),
    					listen(input12, "change", /*input12_change_handler*/ ctx[59]),
    					listen(input13, "change", /*change_handler_10*/ ctx[60]),
    					listen(input13, "change", /*input13_change_handler*/ ctx[61]),
    					listen(input14, "change", /*change_handler_11*/ ctx[62]),
    					listen(input14, "change", /*input14_change_handler*/ ctx[63]),
    					listen(select1, "change", /*change_handler_12*/ ctx[64]),
    					listen(select1, "change", /*select1_change_handler*/ ctx[65]),
    					listen(select1, "blur", /*blur_handler_1*/ ctx[27])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			const svelecte0_changes = (dirty[0] & /*settings*/ 524288)
    			? get_spread_update(svelecte0_spread_levels, [
    					get_spread_object(/*settings*/ ctx[19]),
    					svelecte0_spread_levels[1],
    					svelecte0_spread_levels[2]
    				])
    			: {};

    			if (dirty[0] & /*slot*/ 1048576 | dirty[2] & /*$$scope*/ 8192) {
    				svelecte0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty[0] & /*myValue*/ 8) {
    				updating_value = true;
    				svelecte0_changes.value = /*myValue*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			svelecte0.$set(svelecte0_changes);
    			if ((!current || dirty[0] & /*myValue*/ 8) && t3_value !== (t3_value = JSON.stringify(/*myValue*/ ctx[3]) + "")) set_data(t3, t3_value);

    			if (!current || dirty[0] & /*isFlexWidth*/ 64) {
    				toggle_class(div0, "flexible-svelecte", /*isFlexWidth*/ ctx[6]);
    			}

    			if (dirty[0] & /*disabled*/ 4096) {
    				input0.checked = /*disabled*/ ctx[12];
    			}

    			if (dirty[0] & /*virtualList*/ 262144) {
    				input1.checked = /*virtualList*/ ctx[18];
    			}

    			const svelecte1_changes = {};

    			if (!updating_readSelection && dirty[0] & /*dataSrc*/ 1) {
    				updating_readSelection = true;
    				svelecte1_changes.readSelection = /*dataSrc*/ ctx[0];
    				add_flush_callback(() => updating_readSelection = false);
    			}

    			svelecte1.$set(svelecte1_changes);

    			if (dirty[0] & /*availableRenderers, remoteValue*/ 2097156) {
    				each_value = /*availableRenderers*/ ctx[21][/*remoteValue*/ ctx[2]] || [];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty[0] & /*remoteValue*/ 4 && select0_disabled_value !== (select0_disabled_value = !/*remoteValue*/ ctx[2] || !/*availableRenderers*/ ctx[21][/*remoteValue*/ ctx[2]].length)) {
    				select0.disabled = select0_disabled_value;
    			}

    			if (dirty[0] & /*multiple*/ 2) {
    				input2.checked = /*multiple*/ ctx[1];
    			}

    			if (!current || dirty[0] & /*settings*/ 524288 && input3_disabled_value !== (input3_disabled_value = !/*settings*/ ctx[19].multiple)) {
    				input3.disabled = input3_disabled_value;
    			}

    			if (dirty[0] & /*max*/ 128 && to_number(input3.value) !== /*max*/ ctx[7]) {
    				set_input_value(input3, /*max*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*settings*/ 524288 && input4_disabled_value !== (input4_disabled_value = !/*settings*/ ctx[19].multiple)) {
    				input4.disabled = input4_disabled_value;
    			}

    			if (dirty[0] & /*collapseSelection*/ 256) {
    				input4.checked = /*collapseSelection*/ ctx[8];
    			}

    			if (dirty[0] & /*isFlexWidth*/ 64) {
    				input5.checked = /*isFlexWidth*/ ctx[6];
    			}

    			if (dirty[0] & /*creatable*/ 8192) {
    				input6.checked = /*creatable*/ ctx[13];
    			}

    			if (!current || dirty[0] & /*settings*/ 524288 && input7_disabled_value !== (input7_disabled_value = !/*settings*/ ctx[19].creatable)) {
    				input7.disabled = input7_disabled_value;
    			}

    			if (dirty[0] & /*creatablePrefix*/ 16384 && input7.value !== /*creatablePrefix*/ ctx[14]) {
    				set_input_value(input7, /*creatablePrefix*/ ctx[14]);
    			}

    			if (!current || dirty[0] & /*settings*/ 524288 && input8_disabled_value !== (input8_disabled_value = !/*settings*/ ctx[19].creatable)) {
    				input8.disabled = input8_disabled_value;
    			}

    			if (dirty[0] & /*delimiter*/ 131072 && input8.value !== /*delimiter*/ ctx[17]) {
    				set_input_value(input8, /*delimiter*/ ctx[17]);
    			}

    			if (dirty[0] & /*allowEditing*/ 32768) {
    				input9.checked = /*allowEditing*/ ctx[15];
    			}

    			if (dirty[0] & /*keepCreated*/ 65536) {
    				input10.checked = /*keepCreated*/ ctx[16];
    			}

    			if (dirty[0] & /*settings*/ 524288 && input11.value !== /*settings*/ ctx[19].placeholder) {
    				set_input_value(input11, /*settings*/ ctx[19].placeholder);
    			}

    			if (dirty[0] & /*searchable*/ 512) {
    				input12.checked = /*searchable*/ ctx[9];
    			}

    			if (dirty[0] & /*clearable*/ 1024) {
    				input13.checked = /*clearable*/ ctx[10];
    			}

    			if (dirty[0] & /*selectOnTab*/ 2048) {
    				input14.checked = /*selectOnTab*/ ctx[11];
    			}

    			if (dirty[0] & /*classSelection*/ 16) {
    				select_option(select1, /*classSelection*/ ctx[4]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(svelecte0.$$.fragment, local);
    			transition_in(svelecte1.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svelecte0.$$.fragment, local);
    			transition_out(svelecte1.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div7);
    			/*svelecte0_binding*/ ctx[30](null);
    			destroy_component(svelecte0);
    			destroy_component(svelecte1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function fetchCallback(resp) {
    	return resp.map(user => {
    		return {
    			id: user.id,
    			name: user.name,
    			email: user.email,
    			street: `${user.address.street} ${user.address.suite}`,
    			city: user.address.city
    		};
    	});
    }

    function fetchRenderer(item, isSelected) {
    	return isSelected
    	? `<figure class="avatar avatar-sm" data-initial="${item.name.split(' ').map(w => w[0]).slice(0, 2).join('')}" style="background-color: #2ed020;"></figure>
          ${item.name}`
    	: `<div class="avatar-item">
        <figure class="avatar avatar-bg" data-initial="${item.name.split(' ').map(w => w[0]).slice(0, 2).join('')}" style="background-color: #aaa;"></figure>
        <div class="ml-2">
          ${item.name}<br><small>${item.email}</small>
        </div>
      </div>`;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let slot;
    	let myValue = null;
    	let dataSrc = null;
    	let classSelection = 'svelecte-control';

    	let availableRenderers = {
    		opts: ['caps', 'dotted', 'color-blocks'], // defined in example 09
    		// defined in example 09
    		// defined in example 04
    		countries: ['caps'],
    		groups: ['caps'],
    		colors: ['caps', 'dotted', 'color-blocks'], // defined in example 09
    		// defined in example 09
    		// defined in example 04
    		json: [], // no additional renderers,
    		tags: []
    	};

    	const remotes = {
    		colors: 'https://my-json-server.typicode.com/mskocik/svelecte-docs/colors?value_like=[query]',
    		json: 'https://jsonplaceholder.typicode.com/users/'
    	};

    	const slots = {
    		opts: '🎨',
    		countries: '🌍',
    		groups: '🔠',
    		colors: '⚡',
    		json: '🙋',
    		tags: '🔖'
    	};

    	let cmp;
    	let isFlexWidth = false;
    	let { multiple, max, collapseSelection, placeholder, searchable, clearable, selectOnTab, disabled, creatable, creatablePrefix, allowEditing, keepCreated, delimiter, virtualList, style, searchField } = config;

    	let settings = {
    		searchable: true,
    		placeholder: 'Pick some option variant 👉',
    		options: [],
    		disabled: true
    	};

    	let optionsList = [
    		{ value: 'opts', text: '🎨 Colors' },
    		{ value: 'countries', text: '🌍 Countries' },
    		{
    			value: 'groups',
    			text: '🔠 Country (groups)'
    		},
    		{
    			value: 'colors',
    			text: '⚡ Colors <small class="label label-primary">API</small>'
    		},
    		{
    			value: 'json',
    			text: '🙋 Users <small class="label label-primary">API</small>'
    		},
    		{ value: 'tags', text: '🔖 Empty list' }
    	];

    	let remoteValue = null;
    	let prevRemoteValue = remoteValue;

    	function setRemote() {
    		searchField = null;

    		if (remoteValue === 'opts') {
    			$$invalidate(19, settings = {
    				multiple,
    				max,
    				collapseSelection,
    				searchable,
    				clearable,
    				selectOnTab,
    				disabled,
    				creatable,
    				creatablePrefix,
    				allowEditing,
    				keepCreated,
    				delimiter,
    				virtualList,
    				style,
    				class: classSelection,
    				options: dataset.colors(),
    				fetch: null,
    				placeholder: 'Pick your color'
    			});
    		} else if (!remoteValue) {
    			$$invalidate(19, settings = {
    				placeholder: 'Pick some option variant 👉',
    				options: [],
    				disabled: true
    			});
    		} else if (remoteValue === 'countries') {
    			$$invalidate(19, settings = {
    				multiple,
    				max,
    				collapseSelection,
    				searchable,
    				clearable,
    				selectOnTab,
    				disabled,
    				creatable,
    				creatablePrefix,
    				allowEditing,
    				keepCreated,
    				delimiter,
    				virtualList,
    				style,
    				class: classSelection,
    				options: dataset.countries(),
    				fetch: null,
    				placeholder: 'Choose your favourite European country'
    			});
    		} else if (remoteValue === 'groups') {
    			$$invalidate(19, settings = {
    				multiple,
    				max,
    				collapseSelection,
    				searchable,
    				clearable,
    				selectOnTab,
    				disabled,
    				creatable,
    				creatablePrefix,
    				allowEditing,
    				keepCreated,
    				delimiter,
    				virtualList,
    				style,
    				class: classSelection,
    				options: dataset.countryGroups(),
    				fetch: null,
    				placeholder: 'Select from country group'
    			});
    		} else if (['json', 'colors'].includes(remoteValue)) {
    			$$invalidate(19, settings = {
    				multiple,
    				max,
    				collapseSelection,
    				searchable,
    				clearable,
    				selectOnTab,
    				disabled,
    				creatable,
    				creatablePrefix,
    				allowEditing,
    				keepCreated,
    				delimiter,
    				virtualList,
    				style,
    				searchField: remoteValue === 'json' ? ['name', 'email'] : null,
    				class: classSelection,
    				fetch: remotes[remoteValue],
    				fetchCallback: remoteValue === 'json' ? fetchCallback : null,
    				placeholder: remoteValue === 'json'
    				? 'Select from prefetched list'
    				: 'Search for color',
    				renderer: remoteValue === 'json' ? 'avatar' : null,
    				options: []
    			});
    		} else if (remoteValue === 'tags') {
    			$$invalidate(19, settings = {
    				multiple,
    				max,
    				collapseSelection,
    				searchable,
    				clearable,
    				selectOnTab,
    				placeholder,
    				disabled,
    				creatable,
    				creatablePrefix,
    				allowEditing,
    				keepCreated,
    				delimiter,
    				virtualList,
    				style,
    				class: classSelection,
    				fetch: null,
    				fetchCallback: null,
    				renderer: null,
    				options: []
    			});
    		}
    	}

    	function s(prop, value) {
    		$$invalidate(19, settings[prop] = value !== null ? value : !settings[prop], settings);
    		$$invalidate(19, settings);
    	}

    	function onPresetCollapsible() {
    		$$invalidate(1, multiple = true);
    		$$invalidate(8, collapseSelection = true);
    		$$invalidate(6, isFlexWidth = true);
    		$$invalidate(0, dataSrc = optionsList[1]);
    		const countries = dataset.countries();

    		setTimeout(() => {
    			$$invalidate(3, myValue = [countries[2], countries[7]]);
    		});

    		setTimeout(
    			() => {
    				document.querySelector('#example-7 input').focus();
    			},
    			300
    		);
    	}

    	function onPresetCreatableOnly() {
    		$$invalidate(13, creatable = true);
    		$$invalidate(1, multiple = true);
    		$$invalidate(7, max = 0);
    		$$invalidate(6, isFlexWidth = false);
    		$$invalidate(0, dataSrc = optionsList[optionsList.length - 1]);
    		$$invalidate(12, disabled = false);
    		placeholder = 'Create!';

    		setTimeout(
    			() => {
    				document.querySelector('#example-7 input').focus();
    			},
    			300
    		);
    	}

    	addFormatter('avatar', fetchRenderer);

    	function blur_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function svelecte0_value_binding(value) {
    		myValue = value;
    		(((($$invalidate(3, myValue), $$invalidate(26, prevRemoteValue)), $$invalidate(2, remoteValue)), $$invalidate(1, multiple)), $$invalidate(0, dataSrc));
    	}

    	function svelecte0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cmp = $$value;
    			$$invalidate(5, cmp);
    		});
    	}

    	const change_handler = e => s('disabled', e.target.checked);

    	function input0_change_handler() {
    		disabled = this.checked;
    		$$invalidate(12, disabled);
    	}

    	const change_handler_1 = e => s('virtualList', e.target.checked);

    	function input1_change_handler() {
    		virtualList = this.checked;
    		$$invalidate(18, virtualList);
    	}

    	const click_handler = () => {
    		$$invalidate(3, myValue = settings.multiple ? [] : null);
    	};

    	function svelecte1_readSelection_binding(value) {
    		dataSrc = value;
    		$$invalidate(0, dataSrc);
    	}

    	const change_handler_2 = () => {
    		$$invalidate(3, myValue = multiple ? [] : null);
    	};

    	const change_handler_3 = e => s('renderer', e.target.value);
    	const change_handler_4 = e => s('multiple', e.target.checked);

    	function input2_change_handler() {
    		multiple = this.checked;
    		$$invalidate(1, multiple);
    	}

    	const input_handler = e => s('max', parseInt(e.target.value));

    	function input3_input_handler() {
    		max = to_number(this.value);
    		$$invalidate(7, max);
    	}

    	const change_handler_5 = e => s('collapseSelection', e.target.checked);

    	function input4_change_handler() {
    		collapseSelection = this.checked;
    		$$invalidate(8, collapseSelection);
    	}

    	function input5_change_handler() {
    		isFlexWidth = this.checked;
    		$$invalidate(6, isFlexWidth);
    	}

    	const change_handler_6 = e => s('creatable', e.target.checked);

    	function input6_change_handler() {
    		creatable = this.checked;
    		$$invalidate(13, creatable);
    	}

    	const input_handler_1 = e => s('creatablePrefix', e.target.value);

    	function input7_input_handler() {
    		creatablePrefix = this.value;
    		$$invalidate(14, creatablePrefix);
    	}

    	const input_handler_2 = e => s('delimiter', e.target.value);

    	function input8_input_handler() {
    		delimiter = this.value;
    		$$invalidate(17, delimiter);
    	}

    	const change_handler_7 = e => s('allowEditing', e.target.checked);

    	function input9_change_handler() {
    		allowEditing = this.checked;
    		$$invalidate(15, allowEditing);
    	}

    	const change_handler_8 = e => s('keepCreated', e.target.checked);

    	function input10_change_handler() {
    		keepCreated = this.checked;
    		$$invalidate(16, keepCreated);
    	}

    	const input_handler_3 = e => s('placeholder', e.target.value);

    	function input11_input_handler() {
    		settings.placeholder = this.value;
    		$$invalidate(19, settings);
    	}

    	const change_handler_9 = e => s('searchable', e.target.checked);

    	function input12_change_handler() {
    		searchable = this.checked;
    		$$invalidate(9, searchable);
    	}

    	const change_handler_10 = e => s('clearable', e.target.checked);

    	function input13_change_handler() {
    		clearable = this.checked;
    		$$invalidate(10, clearable);
    	}

    	const change_handler_11 = e => s('selectOnTab', e.target.checked);

    	function input14_change_handler() {
    		selectOnTab = this.checked;
    		$$invalidate(11, selectOnTab);
    	}

    	const change_handler_12 = e => s('class', e.target.value);

    	function select1_change_handler() {
    		classSelection = select_value(this);
    		$$invalidate(4, classSelection);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*dataSrc*/ 1) {
    			{
    				$$invalidate(2, remoteValue = dataSrc ? dataSrc.value : null);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*remoteValue*/ 4) {
    			$$invalidate(20, slot = slots[remoteValue] || '🚫');
    		}

    		if ($$self.$$.dirty[0] & /*prevRemoteValue, remoteValue, multiple*/ 67108870) {
    			{
    				if (prevRemoteValue !== remoteValue) {
    					$$invalidate(3, myValue = multiple ? [] : null);
    					setRemote();
    					$$invalidate(26, prevRemoteValue = remoteValue);
    				}
    			}
    		}
    	};

    	return [
    		dataSrc,
    		multiple,
    		remoteValue,
    		myValue,
    		classSelection,
    		cmp,
    		isFlexWidth,
    		max,
    		collapseSelection,
    		searchable,
    		clearable,
    		selectOnTab,
    		disabled,
    		creatable,
    		creatablePrefix,
    		allowEditing,
    		keepCreated,
    		delimiter,
    		virtualList,
    		settings,
    		slot,
    		availableRenderers,
    		optionsList,
    		s,
    		onPresetCollapsible,
    		onPresetCreatableOnly,
    		prevRemoteValue,
    		blur_handler_1,
    		blur_handler,
    		svelecte0_value_binding,
    		svelecte0_binding,
    		change_handler,
    		input0_change_handler,
    		change_handler_1,
    		input1_change_handler,
    		click_handler,
    		svelecte1_readSelection_binding,
    		change_handler_2,
    		change_handler_3,
    		change_handler_4,
    		input2_change_handler,
    		input_handler,
    		input3_input_handler,
    		change_handler_5,
    		input4_change_handler,
    		input5_change_handler,
    		change_handler_6,
    		input6_change_handler,
    		input_handler_1,
    		input7_input_handler,
    		input_handler_2,
    		input8_input_handler,
    		change_handler_7,
    		input9_change_handler,
    		change_handler_8,
    		input10_change_handler,
    		input_handler_3,
    		input11_input_handler,
    		change_handler_9,
    		input12_change_handler,
    		change_handler_10,
    		input13_change_handler,
    		change_handler_11,
    		input14_change_handler,
    		change_handler_12,
    		select1_change_handler
    	];
    }

    class _07_playground extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {}, null, [-1, -1, -1]);
    	}
    }

    const OPTION_LIST = [
      'options', 'value',
      // form-related
      'name', 'required', 'disabled',
      // basic
      'value-field', 'label-field', 'disabled-field', 'placeholder',
      // UI, UX
      'searchable', 'clearable', 'renderer', 'disable-highlight', 'select-on-tab', 'reset-on-blur', 'reset-on-select',
      // multiple
      'multiple', 'max', 'collapse-selection',
      // creating
      'creatable', 'creatable-prefix', 'allow-editing', 'keepCreated', 'delimiter',
      // remote
      'fetch', 'fetch-reset-on-blur', 'min-query',
      // perf & virtual list
      'lazy-dropdown', 'virtual-list', 'vl-height', 'vl-item-size',
      // sifter
      'search-field', 'sort-field', 'disable-sifter',
      // others
      'label-as-value'
    ];

    function formatValueProp(value, delimiter) {
      return value ? value.split(delimiter).map(item => {
        const _v = parseInt(item);
        return isNaN(_v) ? (item !== 'null' ? item : null) : _v;
      }) : ''
    }

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
        case 'required':
        case 'disabled':
        case 'searchable':
        case 'clearable':
        case 'disable-highlight':
        case 'select-on-tab':
        case 'reset-on-blur':
        case 'reset-on-select':
        case 'multiple':
        case 'collapse-selection':
        case 'creatable':
        case 'allow-editing':
        case 'keep-created':
        case 'fetch-reset-on-blur':
        case 'lazy-dropdown':
        case 'virtual-list':
        case 'disable-sifter':
        case 'label-as-value':
          return value !== null && value !== 'false';
        case 'max':
          return isNaN(parseInt(value)) ? 0 : parseInt(value);
        case 'min-query':
          return isNaN(parseInt(value)) ? config.minQuery : parseInt(value);
      }
      return value;
    }

    function formatProp(name) {
      if (name.includes('-')) return name.split('-').reduce((res, w, i) => {
        if (i) w = w[0].toUpperCase() + w.substr(1);
        return res+w;
      }, '');
      return name;
    }

    let volatileEmitChange = false;


    /**
     * Connect Custom Component attributes to Svelte Component properties
     * @param {string} name Name of the Custom Component
     */
    class SvelecteElement extends HTMLElement {
      constructor() {
        super();
        this.svelecte = undefined;
        this.anchorSelect = null;
        this._fetchOpts = null;
        this._selfSetValue = false;

        /** ************************************ public API */
        const baseProps = {
          'name': {
            get() {
              this.getAttribute('name');
            },
            set(value) {
              this.setAttribute('name', value);
            }
          },
          'selection': {
            get() {
              return this.svelecte
                ? this.svelecte.getSelection()
                : null;
            }
          },
          'value': {
            get() {
              return this.svelecte
                ? this.svelecte.getSelection(true)
                : null;
            },
            set(value) {
              const delim = this.getAttribute('value-delimiter') || ',';
              this.setAttribute('value', Array.isArray(value) ? value.join(delim) : value);
            }
          },
          'options': {
            get() {
              return this.hasAttribute('options')
                ? JSON.parse(this.getAttribute('options'))
                : (this._fetchOpts || []);
            },
            set(value) {
              this.setAttribute('options', Array.isArray(value) ? JSON.stringify(value) : value);
            }
          },
          'hasAnchor': {
            get() {
              return this.anchorSelect ? true : false;
            }
          },
          'form': {
            get() {
              return this.closest('form');
            }
          },
          'emitChange': {
            get() {
              volatileEmitChange = true;
              return this;
            }
          },
          'valueField': {
            get() {
              return this.getAttribute('value-field') || config.valueField;
            },
            set(value) {
              this.setAttribute('value-field', value);
            }
          },
          'labelField': {
            get() {
              return this.getAttribute('label-field') || config.labelField;
            },
            set(value) {
              this.setAttribute('label-field', value);
            }
          },
          'delimiter': {
            get() {
              return this.getAttribute('delimiter') || config.delimiter;
            },
            set(value) {
              this.setAttribute('delimiter', value);
            }
          },
          'lazyDropdown': {
            get() {
              return this.hasAttribute('lazy-dropdown')
                ? true
                : config.lazyDropdown;
            },
            set() {
              console.warn('⚠ this setter has no effect after component has been created');
            }
          },
          'placeholder': {
            get() {
              return this.getAttribute('placeholder') || config.placeholder;
            },
            set(value) {
              this.setAttribute('placeholder', value);
            }
          },
          'max': {
            get() {
              return this.getAttribute('max') || config.max;
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
          },
          'minQuery': {
            get() {
              return this.getAttribute('min-query') || config.minQuery;
            },
            set(value) {
              try {
                value = parseInt(value);
                if (value < 1) value = 1;
              } catch (e) {
                value = config.minQuery;
              }
              this.setAttribute('min-query', value);
            }
          },
          'creatablePrefix': {
            get() {
              return this.getAttribute('creatable-prefix') || config.creatablePrefix
            },
            set(value) {
              this.setAttribute('creatable-prefix', value);
            }
          },
          'renderer': {
            get() {
              return this.getAttribute('renderer') || 'default';
            },
            set(value) {
              if (value) {
                this.setAttribute('renderer', value);
              } else {
                this.removeAttribute('renderer');
              }
            }
          }
        };
        const boolProps = ['searchable','clearable','disable-highlight', 'required', 'select-on-tab','reset-on-blur','reset-on-select',
          'multiple','collapse-selection','creatable','allow-editing','keep-created','fetch-reset-on-blur',
          'virtual-list','disable-sifter','label-as-value', 'disabled'
        ].reduce((res, propName) => {
          const formatted = formatProp(propName);
          res[formatted] = {
            get() {
              const hasProp = this.hasAttribute(propName);
              const notFalse = hasProp ? this.getAttribute(propName) !== 'false' : true;
              return !hasProp ? config[formatted] : notFalse;
            },
            set(value) {
              if (!value) {
                if (this.hasAttribute(propName)) {
                  this.removeAttribute(propName);
                } else {
                  // set directly to false, when config default is true
                  this.svelecte && this.svelecte.$set({ [formatted]: value });
                }
              } else {
                this.setAttribute(propName, value = '' );
              }
            }
          };
          return res;
        }, {});

        Object.defineProperties(this, Object.assign({}, baseProps, boolProps));
      }

      focus() {
        !this.disabled && this.querySelector('input').focus();
      }

      static get observedAttributes() {
        return OPTION_LIST;
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (this.svelecte && oldValue !== newValue) {
          if (name === 'value') {
            if (!this._selfSetValue) {
              newValue
                ? this.svelecte.setSelection(formatValue(name, newValue), volatileEmitChange)
                : this.svelecte.clearByParent(this.parent ? true : false);
            }
            this._selfSetValue = false;
            volatileEmitChange = false;
            this.anchorSelect && setTimeout(() => {
              const value = this.svelecte.getSelection(true);
              this.anchorSelect.innerHTML = (Array.isArray(value) ? (value.length ? value : [null]) : [value]).reduce((res, item) => {
                if (!item) {
                  res+= '<option value="" selected="">Empty</option>';
                  return res;
                }
                res+= `<option value="${item}" selected>${item}</option>`;
                return res;
              }, '');
            });
            return;
          }
          this.svelecte.$set({ [formatProp(name)]: formatValue(name, newValue) });
        }
      } 

      connectedCallback() {
        setTimeout(() => { this.render(); });
      }

      render() {
        if (this.svelecte) return;
        let props = {};
        for (const attr of OPTION_LIST) {
          if (this.hasAttribute(attr)) {
            props[formatProp(attr)] = attr !== 'value'
              ? formatValue(attr, this.getAttribute(attr))
              : formatValueProp(this.getAttribute('value'), this.getAttribute('value-delimiter') || ',');
          }
        }
        if (this.hasAttribute('i18n')) {
          const i18nObj = JSON.parse(this.getAttribute('i18n'));
          if (i18nObj.createRowLabel) {
            const labelText = i18nObj.createRowLabel;
            i18nObj.createRowLabel = value => labelText.replace('#value', value);
          }
          props.i18n = i18nObj;
        }
        if (this.hasAttribute('class')) {
          props.class = this.getAttribute('class');
        }
        if (this.hasAttribute('parent')) {
          this.parent = document.getElementById(this.getAttribute('parent'));
          if (!this.parent.value && this.svelecte) {
            return;
          }      const parentValue = this.parent.value || this.parent.getAttribute('value'); // for 'fetch'ed parent, value is always null
          if (parentValue) {
            props.disabled = false;
            props.fetch = this.getAttribute('fetch').replace('[parent]', parentValue);
          } else {
            delete props['fetch'];
            props.disabled = true;
          }
          this.parentCallback = e => {
            if (!e.target.selection || (Array.isArray(e.target.selection) && !e.target.selection.length)) {
              this.svelecte.clearByParent(true);
              return;
            }
            !this.parent.disabled && this.removeAttribute('disabled');
            if (this.hasAttribute('fetch')) {
              this.svelecte.clearByParent(true);
              const fetchUrl = this.getAttribute('fetch').replace('[parent]', e.target.value);
              this.svelecte.$set({ fetch: fetchUrl, disabled: false });
            }
          };
          this.parent.addEventListener('change', this.parentCallback);
        }
        const anchorSelect = this.querySelector('select');
        if (anchorSelect) {
          props['hasAnchor'] = true;
          anchorSelect.style = 'opacity: 0; position: absolute; z-index: -2; top: 0; height: 38px';
          anchorSelect.tabIndex = -1; // just to be sure
          this.anchorSelect = anchorSelect;
          this.anchorSelect.multiple = props.multiple || anchorSelect.name.includes('[]');
          (Array.isArray(props.value) ? props.value : [props.value || null]).forEach(val => {
            this.anchorSelect.innerHTML += `<option value="${val || ''}" selected>${val || 'No value'}</option>`;
          });
        }
        this.svelecte = new Svelecte({
          target: this,
          anchor: anchorSelect,
          props,
        });
        // event listeners
        this.svelecte.$on('change', e => {
          const value = this.svelecte.getSelection(true);
          this._selfSetValue = true;
          this.value = value;
          setTimeout(() => {
            this._selfSetValue = false;
          }, 100);
          // Custom-element related
          if (this.anchorSelect) {
            this.anchorSelect.innerHTML = (Array.isArray(value) ? (value.length ? value : [null]) : [value]).reduce((res, item) => {
              if (!item) {
                res+= '<option value="" selected="">Empty</option>';
                return res;
              }
              res+= `<option value="${item}" selected>${item}</option>`;
              return res;
            }, '');
            this.anchorSelect.dispatchEvent(new Event('change'));
          }
          this.dispatchEvent(e);
        });
        this.svelecte.$on('fetch', e => {
          this._fetchOpts = e.detail;
          this.dispatchEvent(e);
        });
        this.svelecte.$on('createoption', e => {
          this.dispatchEvent(e);
        });
        return true;
      }

      disconnectedCallback() {
        this.svelecte && this.svelecte.$destroy();
        this.parent && this.parent.removeEventListener('change', this.parentCallback);
      }
    }

    function registerSvelecte(name) {
      window.customElements.define(name || 'el-svelecte', SvelecteElement);
    }

    /* docs\src\08-custom-element.svelte generated by Svelte v3.55.1 */

    function create_fragment$4(ctx) {
    	let div2;
    	let form;
    	let t0;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let t6;
    	let select1;
    	let option5;
    	let option6;
    	let t8;
    	let option6_disabled_value;
    	let option7;
    	let t10;
    	let button;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div2 = element("div2");
    			form = element("form");
    			t0 = text("Create new\r\n    ");
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Select options";
    			option1 = element("option");
    			option1.textContent = "Colors";
    			option2 = element("option");
    			option2.textContent = "Countries";
    			option3 = element("option");
    			option3.textContent = "Groups";
    			option4 = element("option");
    			option4.textContent = "Tags (cretable)";
    			t6 = space();
    			select1 = element("select");
    			option5 = element("option");
    			option5.textContent = "Default renderer";
    			option6 = element("option");
    			t8 = text("Dotted (color only)");
    			option7 = element("option");
    			option7.textContent = "Caps (all letters uppercase)";
    			t10 = space();
    			button = element("button");
    			button.textContent = "Add Svelecte";
    			option0.__value = "";
    			option0.value = option0.__value;
    			option1.__value = "colors";
    			option1.value = option1.__value;
    			option2.__value = "countries";
    			option2.value = option2.__value;
    			option3.__value = "countryGroups";
    			option3.value = option3.__value;
    			option4.__value = "tags";
    			option4.value = option4.__value;
    			select0.required = true;
    			if (/*optionList*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[4].call(select0));
    			option5.__value = "";
    			option5.value = option5.__value;
    			option6.__value = "dotted";
    			option6.value = option6.__value;
    			option6.disabled = option6_disabled_value = /*optionList*/ ctx[0] !== 'colors';
    			option7.__value = "caps";
    			option7.value = option7.__value;
    			if (/*optionRenderer*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[5].call(select1));
    			attr(button, "class", "btn");
    			attr(button, "type", "submit");
    			attr(form, "action", "");
    		},
    		m(target, anchor) {
    			insert(target, div2, anchor);
    			append(div2, form);
    			append(form, t0);
    			append(form, select0);
    			append(select0, option0);
    			append(select0, option1);
    			append(select0, option2);
    			append(select0, option3);
    			append(select0, option4);
    			select_option(select0, /*optionList*/ ctx[0]);
    			append(form, t6);
    			append(form, select1);
    			append(select1, option5);
    			append(select1, option6);
    			append(option6, t8);
    			append(select1, option7);
    			select_option(select1, /*optionRenderer*/ ctx[1]);
    			append(form, t10);
    			append(form, button);
    			/*div2_binding*/ ctx[6](div2);

    			if (!mounted) {
    				dispose = [
    					listen(select0, "change", /*select0_change_handler*/ ctx[4]),
    					listen(select1, "change", /*select1_change_handler*/ ctx[5]),
    					listen(form, "submit", prevent_default(/*onSubmit*/ ctx[3]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*optionList*/ 1) {
    				select_option(select0, /*optionList*/ ctx[0]);
    			}

    			if (dirty & /*optionList*/ 1 && option6_disabled_value !== (option6_disabled_value = /*optionList*/ ctx[0] !== 'colors')) {
    				option6.disabled = option6_disabled_value;
    			}

    			if (dirty & /*optionRenderer*/ 2) {
    				select_option(select1, /*optionRenderer*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div2);
    			/*div2_binding*/ ctx[6](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let container;
    	let optionList;
    	let optionRenderer;
    	config.clearable = true;

    	/** here we register svelecte as custom element */
    	registerSvelecte('el-svelecte');

    	/** define some custom renderers */
    	addFormatter('dotted', item => `<span style="background-color:${item.hex}" class="color"></span> ${item.text}`);

    	addFormatter('caps', item => item.text.toUpperCase());

    	function onSubmit() {
    		/** here the svelecte is defined */
    		const el = document.createElement('el-svelecte');

    		el.options = optionList === 'tags' ? [] : dataset[optionList]();
    		el.renderer = optionRenderer;

    		if (optionList === 'tags') {
    			el.creatable = true;
    			el.multiple = true;
    		}

    		el.onchange = e => console.log('change event', e);

    		/** that's all! */
    		container.insertBefore(el, container.lastElementChild);

    		const rmBtn = document.createElement('button');
    		rmBtn.className = 'btn float-right ml-2';
    		rmBtn.style = 'z-index: 1; position: relative';
    		rmBtn.textContent = 'Remove select';

    		rmBtn.onclick = () => {
    			container.removeChild(el);
    			container.removeChild(rmBtn);
    		};

    		container.insertBefore(rmBtn, container.lastElementChild);
    		container.insertBefore(el, container.lastElementChild);
    		$$invalidate(0, optionList = '');
    		$$invalidate(1, optionRenderer = '');
    	}

    	function select0_change_handler() {
    		optionList = select_value(this);
    		$$invalidate(0, optionList);
    	}

    	function select1_change_handler() {
    		optionRenderer = select_value(this);
    		($$invalidate(1, optionRenderer), $$invalidate(0, optionList));
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*optionList, optionRenderer*/ 3) {
    			{
    				if (optionList !== 'colors' && optionRenderer === 'dotted') {
    					$$invalidate(1, optionRenderer = null);
    				}
    			}
    		}
    	};

    	return [
    		optionList,
    		optionRenderer,
    		container,
    		onSubmit,
    		select0_change_handler,
    		select1_change_handler,
    		div2_binding
    	];
    }

    class _08_custom_element extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});
    	}
    }

    /* docs\src\09-custom-dependent.svelte generated by Svelte v3.55.1 */

    function create_if_block$1(ctx) {
    	let pre;
    	let t;

    	return {
    		c() {
    			pre = element("pre");
    			t = text(/*payload*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, pre, anchor);
    			append(pre, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*payload*/ 1) set_data(t, /*payload*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(pre);
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	let form;
    	let el_svelecte0;
    	let t0;
    	let el_svelecte1;
    	let t1;
    	let div0;
    	let t3;
    	let el_svelecte2;
    	let select;
    	let t4;
    	let small;
    	let t16;
    	let div1;
    	let t18;
    	let mounted;
    	let dispose;
    	let if_block = /*payload*/ ctx[0] && create_if_block$1(ctx);

    	return {
    		c() {
    			form = element("form");
    			el_svelecte0 = element("el-svelecte");
    			t0 = space();
    			el_svelecte1 = element("el-svelecte");
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "Server-side rendered inner select:";
    			t3 = space();
    			el_svelecte2 = element("el-svelecte");
    			select = element("select");
    			t4 = space();
    			small = element("small");

    			small.innerHTML = `This <code>&lt;el-svelecte&gt;</code> has nested (anchored) <code>&lt;select&gt;</code>, when you <em>need</em> to have it rendered server-side. This setup is specific, 
    because inner select needs to have <code>name</code> and <code>required</code> (if applicable) properties specified manually. (They are not inherited from el-svelecte parent)`;

    			t16 = space();
    			div1 = element("div");
    			div1.innerHTML = `<button type="submit" class="btn btn-success">Send form</button>`;
    			t18 = space();
    			if (if_block) if_block.c();
    			set_custom_element_data(el_svelecte0, "name", "parent_value");
    			set_custom_element_data(el_svelecte0, "placeholder", "Select parent value");
    			set_custom_element_data(el_svelecte0, "options", `[{"value":"posts","text":"Posts"},{"value":"users","text":"Users"},{"value":"comments","text":"Comments"}]`);
    			set_custom_element_data(el_svelecte0, "id", "is-parent");
    			set_custom_element_data(el_svelecte0, "required", "required");
    			set_custom_element_data(el_svelecte1, "name", "child_value");
    			set_custom_element_data(el_svelecte1, "parent", "is-parent");
    			set_custom_element_data(el_svelecte1, "required", "required");
    			set_custom_element_data(el_svelecte1, "placeholder", "Pick from child select");
    			set_custom_element_data(el_svelecte1, "fetch", "https://jsonplaceholder.typicode.com/[parent]");
    			attr(select, "id", "anchored");
    			attr(select, "name", "demo");
    			select.multiple = true;
    			set_custom_element_data(el_svelecte2, "options", `[{"id":"posts","label":"Posts", "prop": "Posts"},{"id":"users","label":"Users", "prop": "Users"},{"id":"comments","label":"Comments", "prop": "Comment"}]`);
    			set_style(el_svelecte2, "margin-bottom", "0");
    			set_custom_element_data(el_svelecte2, "lazy-dropdown", "false");
    			set_custom_element_data(el_svelecte2, "multiple", "");
    			set_custom_element_data(el_svelecte2, "reset-on-select", "false");
    			attr(div1, "class", "mt-2");
    			attr(form, "action", "");
    		},
    		m(target, anchor) {
    			insert(target, form, anchor);
    			append(form, el_svelecte0);
    			append(form, t0);
    			append(form, el_svelecte1);
    			append(form, t1);
    			append(form, div0);
    			append(form, t3);
    			append(form, el_svelecte2);
    			append(el_svelecte2, select);
    			append(form, t4);
    			append(form, small);
    			append(form, t16);
    			append(form, div1);
    			append(form, t18);
    			if (if_block) if_block.m(form, null);

    			if (!mounted) {
    				dispose = [
    					listen(el_svelecte1, "change", /*change_handler*/ ctx[2]),
    					listen(select, "change", /*change_handler_1*/ ctx[3]),
    					listen(form, "submit", prevent_default(/*onSubmit*/ ctx[1]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*payload*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(form, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(form);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let payload = null;

    	function onSubmit(e) {
    		const object = {};
    		const formData = new FormData(e.target);

    		formData.forEach((value, key) => {
    			if (object[key]) {
    				object[key] += ', ' + value;
    				return;
    			}

    			object[key] = value;
    		});

    		$$invalidate(0, payload = JSON.stringify(object, null, 2));
    	}

    	const change_handler = e => console.log('D', e.detail);
    	const change_handler_1 = e => console.log(e.target.selectedOptions);
    	return [payload, onSubmit, change_handler, change_handler_1];
    }

    class _09_custom_dependent extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* docs\src\10-custom-remote.svelte generated by Svelte v3.55.1 */

    function create_if_block(ctx) {
    	let pre;
    	let t;

    	return {
    		c() {
    			pre = element("pre");
    			t = text(/*payload*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, pre, anchor);
    			append(pre, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*payload*/ 1) set_data(t, /*payload*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(pre);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let form;
    	let el_svelecte;
    	let t0;
    	let div;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block = /*payload*/ ctx[0] && create_if_block(ctx);

    	return {
    		c() {
    			form = element("form");
    			el_svelecte = element("el-svelecte");
    			t0 = space();
    			div = element("div");
    			div.innerHTML = `<button type="submit" class="btn btn-success">Send form</button>`;
    			t2 = space();
    			if (if_block) if_block.c();
    			set_custom_element_data(el_svelecte, "name", "selection");
    			set_custom_element_data(el_svelecte, "multiple", "");
    			set_custom_element_data(el_svelecte, "required", "");
    			set_custom_element_data(el_svelecte, "placeholder", "Search for color");
    			set_custom_element_data(el_svelecte, "fetch", "https://my-json-server.typicode.com/mskocik/svelecte-docs/colors?value_like=[query]");
    			attr(div, "class", "mt-2");
    			attr(form, "action", "");
    		},
    		m(target, anchor) {
    			insert(target, form, anchor);
    			append(form, el_svelecte);
    			append(form, t0);
    			append(form, div);
    			append(form, t2);
    			if (if_block) if_block.m(form, null);

    			if (!mounted) {
    				dispose = [
    					listen(el_svelecte, "change", /*resetPayload*/ ctx[2]),
    					listen(form, "submit", prevent_default(/*onSubmit*/ ctx[1]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (/*payload*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(form, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(form);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let payload = null;

    	function onSubmit(e) {
    		const object = {};
    		const formData = new FormData(e.target);

    		formData.forEach((value, key) => {
    			if (object[key]) {
    				object[key] += ', ' + value;
    				return;
    			}

    			object[key] = value;
    		});

    		$$invalidate(0, payload = JSON.stringify(object, null, 2));
    	}

    	function resetPayload(e) {
    		$$invalidate(0, payload = null);
    	}

    	return [payload, onSubmit, resetPayload];
    }

    class _10_custom_remote extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* docs\src\11-vue.svelte generated by Svelte v3.55.1 */

    function create_fragment$1(ctx) {
    	let div1;

    	return {
    		c() {
    			div1 = element("div");
    			div1.innerHTML = `<div id="vue"></div>`;
    			attr(div1, "class", "example-wrap");
    			set_style(div1, "border-color", "#41b883");
    			set_style(div1, "box-shadow", "0 0 10px #41b883 inset");
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    		}
    	};
    }

    function colorCreateFilter(val) {
    	return (val.substr(0, 1).toUpperCase() + val.substr(1).toLowerCase()).trim();
    }

    function instance$1($$self) {
    	onMount(() => {
    		tick().then(() => {
    			new Vue({
    					el: '#vue',
    					data: {
    						placeholder: 'Select or create color',
    						selected: [],
    						opts: JSON.stringify(dataset.colors())
    					},
    					methods: {
    						onChange(e) {
    							this.selected = e.target.value;
    						},
    						show(e) {
    							console.log(e.detail);
    						}
    					},
    					mounted() {
    						setTimeout(
    							() => {
    								/** this is needed, because it's custom-element */
    								this.$refs.el.svelecte.$$set({ createFilter: colorCreateFilter });
    							},
    							500
    						);
    					},
    					template: `<div>
          <h6>Vue 2 example</h6>
          <div>
            <el-svelecte :options="opts"  @change="onChange" @createoption="show"
              :value="selected"
              :placeholder="placeholder"
              renderer="color-blocks"
              multiple creatable
              label-as-value
              ref="el"
            ></el-svelecte>
          </div>
          <div>Selection: {{ selected }}</div>
        </div> `
    				});
    		});
    	});

    	return [];
    }

    class _11_vue extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* docs\src\13-collapsable.svelte generated by Svelte v3.55.1 */

    function create_fragment(ctx) {
    	let label;
    	let t1;
    	let svelecte;
    	let updating_readSelection;
    	let updating_value;
    	let current;

    	function svelecte_readSelection_binding(value) {
    		/*svelecte_readSelection_binding*/ ctx[3](value);
    	}

    	function svelecte_value_binding(value) {
    		/*svelecte_value_binding*/ ctx[4](value);
    	}

    	let svelecte_props = {
    		options: /*options*/ ctx[2],
    		inputId: "country-collapsable",
    		multiple: true,
    		collapsable: true,
    		virtualList: true,
    		placeholder: "Select countries"
    	};

    	if (/*selection*/ ctx[0] !== void 0) {
    		svelecte_props.readSelection = /*selection*/ ctx[0];
    	}

    	if (/*value*/ ctx[1] !== void 0) {
    		svelecte_props.value = /*value*/ ctx[1];
    	}

    	svelecte = new Svelecte({ props: svelecte_props });
    	binding_callbacks.push(() => bind(svelecte, 'readSelection', svelecte_readSelection_binding));
    	binding_callbacks.push(() => bind(svelecte, 'value', svelecte_value_binding));

    	return {
    		c() {
    			label = element("label");
    			label.textContent = "Select a country";
    			t1 = space();
    			create_component(svelecte.$$.fragment);
    			attr(label, "for", "country-collapsable");
    		},
    		m(target, anchor) {
    			insert(target, label, anchor);
    			insert(target, t1, anchor);
    			mount_component(svelecte, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const svelecte_changes = {};

    			if (!updating_readSelection && dirty & /*selection*/ 1) {
    				updating_readSelection = true;
    				svelecte_changes.readSelection = /*selection*/ ctx[0];
    				add_flush_callback(() => updating_readSelection = false);
    			}

    			if (!updating_value && dirty & /*value*/ 2) {
    				updating_value = true;
    				svelecte_changes.value = /*value*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			svelecte.$set(svelecte_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(svelecte.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(svelecte.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(label);
    			if (detaching) detach(t1);
    			destroy_component(svelecte, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let options = dataset.countries();
    	let selection = null;
    	let value = ['cz', 'de', 'sk'];

    	function svelecte_readSelection_binding(value) {
    		selection = value;
    		$$invalidate(0, selection);
    	}

    	function svelecte_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(1, value);
    	}

    	return [
    		selection,
    		value,
    		options,
    		svelecte_readSelection_binding,
    		svelecte_value_binding
    	];
    }

    class _13_collapsable extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    [_01_basic, _02_basicPlain, _03_groups, _04_item_rendering, _05_slot, _06_fetch, _07_playground, _08_custom_element, _09_custom_dependent, _10_custom_remote, _11_vue, _13_collapsable]
      .forEach(
        (component, index) => new component({
          target: document.getElementById(`example-${index +1}`),
        })
      );

    /** FETCH example sources */
    const promises = [];
    document.querySelectorAll('pre[data-src]')
      .forEach(codeBlock => promises.push(
        fetch(`src/${codeBlock.dataset.src}.svelte`)
          .then(resp => resp.text())
          .then(html => {
            const codeEl = document.createElement('code');
            codeEl.className = 'svelte';
            codeEl.innerText = html.replaceAll(/(<\/?script>)/g, '<!-- $1 -->');        codeBlock.appendChild(codeEl);
          })
      ));
    Promise.all(promises).then(() => hljs.highlightAll());

})();
