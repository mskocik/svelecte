
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
    'use strict';

    function noop() { }
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
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
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
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
            ctx: null,
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
      const bounding = elem.getBoundingClientRect();
      const out = {};

      out.top = bounding.top < 0 || bounding.top - bounding.height < 0;
      out.left = bounding.left < 0;
      out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
      out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
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
          
          xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                const resp = JSON.parse(xhr.response);
                resolve(cb ? cb(resp) : resp.data || resp.items || resp.options || resp);
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
        const firstItem = options[0].options ? options[0].options[0] : options[0];
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

    const settings = {
      // html
      disabled: false,
      // basic
      valueField: null,
      labelField: null,
      disabledField: '$disabled',
      placeholder: 'Select',
      // ui
      searchable: true,
      clearable: false,
      selectOnTab: false,
      resetOnBlur: true,
      fetchResetOnBlur: true,
      // multi
      multiple: false,
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
        fetchBefore: 'Type to search',
        fetchEmpty: 'No data related to your search',
        collapsedSelection: count => `${count} selected`
      },
      collapseSelectionFn: function(selectionCount, selection) {
        return settings.i18n.collapsedSelection(selectionCount);
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

    function flatList(options, config) {
      const flatOpts = options.reduce((res, opt, i) => {
        if (config.isOptionArray) {
          res.push({
            [config.valueField]: i,
            [config.labelField]: opt
          });
          return res;
        }
        if (opt.options && opt.options.length) {
          config.optionsWithGroups = true;
          res.push({ label: opt.label, $isGroupHeader: true });
          res.push(...opt.options.map(_opt => {
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

    /* src\components\Input.svelte generated by Svelte v3.43.1 */

    function create_fragment$g(ctx) {
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
    			t1 = text(/*shadowText*/ ctx[9]);
    			attr(input, "type", "text");
    			attr(input, "class", "inputBox svelte-mtw92l");
    			input.disabled = /*disabled*/ ctx[1];
    			input.readOnly = input_readonly_value = !/*searchable*/ ctx[0];
    			attr(input, "style", /*inputStyle*/ ctx[8]);
    			attr(input, "placeholder", /*placeholderText*/ ctx[5]);
    			attr(div, "class", "shadow-text svelte-mtw92l");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[24].call(div));
    		},
    		m(target, anchor) {
    			insert(target, input, anchor);
    			/*input_binding*/ ctx[22](input);
    			set_input_value(input, /*$inputValue*/ ctx[6]);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, t1);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[24].bind(div));

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[23]),
    					listen(input, "focus", /*focus_handler*/ ctx[18]),
    					listen(input, "blur", /*blur_handler*/ ctx[19]),
    					listen(input, "keydown", /*onKeyDown*/ ctx[10]),
    					listen(input, "keyup", /*onKeyUp*/ ctx[11]),
    					listen(input, "paste", /*paste_handler*/ ctx[20]),
    					listen(input, "change", stop_propagation(/*change_handler*/ ctx[21]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*disabled*/ 2) {
    				input.disabled = /*disabled*/ ctx[1];
    			}

    			if (dirty & /*searchable*/ 1 && input_readonly_value !== (input_readonly_value = !/*searchable*/ ctx[0])) {
    				input.readOnly = input_readonly_value;
    			}

    			if (dirty & /*inputStyle*/ 256) {
    				attr(input, "style", /*inputStyle*/ ctx[8]);
    			}

    			if (dirty & /*placeholderText*/ 32) {
    				attr(input, "placeholder", /*placeholderText*/ ctx[5]);
    			}

    			if (dirty & /*$inputValue*/ 64 && input.value !== /*$inputValue*/ ctx[6]) {
    				set_input_value(input, /*$inputValue*/ ctx[6]);
    			}

    			if (dirty & /*shadowText*/ 512) set_data(t1, /*shadowText*/ ctx[9]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(input);
    			/*input_binding*/ ctx[22](null);
    			if (detaching) detach(t0);
    			if (detaching) detach(div);
    			div_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let isSingleFilled;
    	let placeholderText;
    	let shadowText;
    	let widthAddition;
    	let inputStyle;

    	let $hasDropdownOpened,
    		$$unsubscribe_hasDropdownOpened = noop,
    		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(26, $hasDropdownOpened = $$value)), hasDropdownOpened);

    	let $inputValue,
    		$$unsubscribe_inputValue = noop,
    		$$subscribe_inputValue = () => ($$unsubscribe_inputValue(), $$unsubscribe_inputValue = subscribe(inputValue, $$value => $$invalidate(6, $inputValue = $$value)), inputValue);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_hasDropdownOpened());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_inputValue());
    	const focus = () => inputRef.focus();
    	let { placeholder } = $$props;
    	let { searchable } = $$props;
    	let { disabled } = $$props;
    	let { multiple } = $$props;
    	let { inputValue } = $$props;
    	$$subscribe_inputValue();
    	let { hasDropdownOpened } = $$props;
    	$$subscribe_hasDropdownOpened();
    	let { selectedOptions } = $$props;
    	let inputRef = null;
    	let shadowWidth = 0;
    	const dispatch = createEventDispatcher();
    	let disableEventBubble = false;

    	function onKeyDown(e) {
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
    			$$invalidate(7, inputRef);
    		});
    	}

    	function input_input_handler() {
    		$inputValue = this.value;
    		inputValue.set($inputValue);
    	}

    	function div_elementresize_handler() {
    		shadowWidth = this.clientWidth;
    		$$invalidate(4, shadowWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('placeholder' in $$props) $$invalidate(13, placeholder = $$props.placeholder);
    		if ('searchable' in $$props) $$invalidate(0, searchable = $$props.searchable);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ('multiple' in $$props) $$invalidate(14, multiple = $$props.multiple);
    		if ('inputValue' in $$props) $$subscribe_inputValue($$invalidate(2, inputValue = $$props.inputValue));
    		if ('hasDropdownOpened' in $$props) $$subscribe_hasDropdownOpened($$invalidate(3, hasDropdownOpened = $$props.hasDropdownOpened));
    		if ('selectedOptions' in $$props) $$invalidate(15, selectedOptions = $$props.selectedOptions);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*selectedOptions, multiple*/ 49152) {
    			$$invalidate(17, isSingleFilled = selectedOptions.length > 0 && multiple === false);
    		}

    		if ($$self.$$.dirty & /*selectedOptions, placeholder*/ 40960) {
    			$$invalidate(5, placeholderText = selectedOptions.length > 0 ? '' : placeholder);
    		}

    		if ($$self.$$.dirty & /*$inputValue, placeholderText*/ 96) {
    			$$invalidate(9, shadowText = $inputValue || placeholderText);
    		}

    		if ($$self.$$.dirty & /*selectedOptions*/ 32768) {
    			$$invalidate(16, widthAddition = selectedOptions.length === 0 ? 19 : 12);
    		}

    		if ($$self.$$.dirty & /*isSingleFilled, shadowWidth, widthAddition*/ 196624) {
    			$$invalidate(8, inputStyle = `width: ${isSingleFilled ? 2 : shadowWidth + widthAddition}px`);
    		}
    	};

    	return [
    		searchable,
    		disabled,
    		inputValue,
    		hasDropdownOpened,
    		shadowWidth,
    		placeholderText,
    		$inputValue,
    		inputRef,
    		inputStyle,
    		shadowText,
    		onKeyDown,
    		onKeyUp,
    		focus,
    		placeholder,
    		multiple,
    		selectedOptions,
    		widthAddition,
    		isSingleFilled,
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

    		init(this, options, instance$f, create_fragment$g, safe_not_equal, {
    			focus: 12,
    			placeholder: 13,
    			searchable: 0,
    			disabled: 1,
    			multiple: 14,
    			inputValue: 2,
    			hasDropdownOpened: 3,
    			selectedOptions: 15
    		});
    	}

    	get focus() {
    		return this.$$.ctx[12];
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

    /* src\components\Item.svelte generated by Svelte v3.43.1 */

    function create_else_block$2(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = highlightSearch(/*item*/ ctx[2], /*isSelected*/ ctx[3], /*inputValue*/ ctx[0], /*formatter*/ ctx[6], /*disableHighlight*/ ctx[7]) + "";
    	let t;
    	let div_title_value;
    	let itemActions_action;
    	let mounted;
    	let dispose;
    	let if_block = /*isSelected*/ ctx[3] && /*isMultiple*/ ctx[5] && create_if_block_1$2();

    	return {
    		c() {
    			div = element("div");
    			html_tag = new HtmlTag();
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
    			if (dirty & /*item, isSelected, inputValue, formatter, disableHighlight*/ 205 && raw_value !== (raw_value = highlightSearch(/*item*/ ctx[2], /*isSelected*/ ctx[3], /*inputValue*/ ctx[0], /*formatter*/ ctx[6], /*disableHighlight*/ ctx[7]) + "")) html_tag.p(raw_value);

    			if (/*isSelected*/ ctx[3] && /*isMultiple*/ ctx[5]) {
    				if (if_block) ; else {
    					if_block = create_if_block_1$2();
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*item*/ 4 && div_title_value !== (div_title_value = /*item*/ ctx[2].$created ? 'Created item' : '')) {
    				attr(div, "title", div_title_value);
    			}

    			if (itemActions_action && is_function(itemActions_action.update) && dirty & /*item, index*/ 6) itemActions_action.update.call(null, {
    				item: /*item*/ ctx[2],
    				index: /*index*/ ctx[1]
    			});

    			if (dirty & /*isDisabled*/ 16) {
    				toggle_class(div, "is-disabled", /*isDisabled*/ ctx[4]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    // (17:0) {#if item.$isGroupHeader}
    function create_if_block$5(ctx) {
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
    			attr(div, "class", "optgroup-header svelte-10st0l2");
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
    		d(detaching) {
    			if (detaching) detach(div);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (29:0) {#if isSelected && isMultiple}
    function create_if_block_1$2(ctx) {
    	let a;

    	return {
    		c() {
    			a = element("a");
    			a.innerHTML = `<svg height="16" width="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>`;
    			attr(a, "href", "#deselect");
    			attr(a, "class", "sv-item-btn");
    			attr(a, "tabindex", "-1");
    			attr(a, "data-action", "deselect");
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[2].$isGroupHeader) return create_if_block$5;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	return {
    		c() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},
    		p(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$e($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$e, create_fragment$f, safe_not_equal, {
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

    /* src\components\Control.svelte generated by Svelte v3.43.1 */

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	return child_ctx;
    }

    const get_icon_slot_changes$1 = dirty => ({});
    const get_icon_slot_context$1 = ctx => ({});

    // (68:4) {#if selectedOptions.length }
    function create_if_block_2$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*multiple*/ ctx[5] && /*collapseSelection*/ ctx[6] && /*doCollapse*/ ctx[13]) return 0;
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

    // (71:6) {:else}
    function create_else_block$1(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*selectedOptions*/ ctx[10];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
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
    			if (dirty[0] & /*renderer, selectedOptions, multiple, $inputValue*/ 33828) {
    				each_value = /*selectedOptions*/ ctx[10];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
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

    // (69:6) {#if multiple && collapseSelection && doCollapse}
    function create_if_block_3$1(ctx) {
    	let t_value = /*collapseSelection*/ ctx[6](/*selectedOptions*/ ctx[10].length, /*selectedOptions*/ ctx[10]) + "";
    	let t;

    	return {
    		c() {
    			t = text(t_value);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*collapseSelection, selectedOptions*/ 1088 && t_value !== (t_value = /*collapseSelection*/ ctx[6](/*selectedOptions*/ ctx[10].length, /*selectedOptions*/ ctx[10]) + "")) set_data(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (72:6) {#each selectedOptions as opt}
    function create_each_block$4(ctx) {
    	let item;
    	let current;

    	item = new Item({
    			props: {
    				formatter: /*renderer*/ ctx[2],
    				item: /*opt*/ ctx[32],
    				isSelected: true,
    				isMultiple: /*multiple*/ ctx[5],
    				inputValue: /*$inputValue*/ ctx[15]
    			}
    		});

    	item.$on("deselect", /*deselect_handler*/ ctx[26]);

    	return {
    		c() {
    			create_component(item.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const item_changes = {};
    			if (dirty[0] & /*renderer*/ 4) item_changes.formatter = /*renderer*/ ctx[2];
    			if (dirty[0] & /*selectedOptions*/ 1024) item_changes.item = /*opt*/ ctx[32];
    			if (dirty[0] & /*multiple*/ 32) item_changes.isMultiple = /*multiple*/ ctx[5];
    			if (dirty[0] & /*$inputValue*/ 32768) item_changes.inputValue = /*$inputValue*/ ctx[15];
    			item.$set(item_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(item, detaching);
    		}
    	};
    }

    // (89:4) {#if clearable && selectedOptions.length && !disabled}
    function create_if_block_1$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div = element("div");
    			div.innerHTML = `<svg class="indicator-icon svelte-1kcptsp" height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>`;
    			attr(div, "aria-hidden", "true");
    			attr(div, "class", "indicator-container close-icon svelte-1kcptsp");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen(div, "mousedown", prevent_default(/*mousedown_handler_1*/ ctx[25])),
    					listen(div, "click", /*click_handler*/ ctx[30])
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

    // (97:4) {#if clearable}
    function create_if_block$4(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "indicator-separator svelte-1kcptsp");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    function create_fragment$e(ctx) {
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
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[22].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[21], get_icon_slot_context$1);
    	let if_block0 = /*selectedOptions*/ ctx[10].length && create_if_block_2$1(ctx);

    	let input_props = {
    		disabled: /*disabled*/ ctx[3],
    		searchable: /*searchable*/ ctx[1],
    		placeholder: /*placeholder*/ ctx[4],
    		multiple: /*multiple*/ ctx[5],
    		inputValue: /*inputValue*/ ctx[7],
    		hasDropdownOpened: /*hasDropdownOpened*/ ctx[9],
    		selectedOptions: /*selectedOptions*/ ctx[10]
    	};

    	input = new Input({ props: input_props });
    	/*input_binding*/ ctx[27](input);
    	input.$on("focus", /*onFocus*/ ctx[18]);
    	input.$on("blur", /*onBlur*/ ctx[19]);
    	input.$on("keydown", /*keydown_handler*/ ctx[28]);
    	input.$on("paste", /*paste_handler*/ ctx[29]);
    	let if_block1 = /*clearable*/ ctx[0] && /*selectedOptions*/ ctx[10].length && !/*disabled*/ ctx[3] && create_if_block_1$1(ctx);
    	let if_block2 = /*clearable*/ ctx[0] && create_if_block$4();

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
    			div1.innerHTML = `<svg width="20" height="20" class="indicator-icon svelte-1kcptsp" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg>`;
    			attr(div0, "class", "sv-content sv-input-row svelte-1kcptsp");
    			toggle_class(div0, "has-multiSelection", /*multiple*/ ctx[5]);
    			attr(div1, "aria-hidden", "true");
    			attr(div1, "class", "indicator-container svelte-1kcptsp");
    			attr(div2, "class", "indicator svelte-1kcptsp");
    			toggle_class(div2, "is-loading", /*isFetchingData*/ ctx[11]);
    			attr(div3, "class", "sv-control svelte-1kcptsp");
    			toggle_class(div3, "is-active", /*$hasFocus*/ ctx[16]);
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
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(div1, "mousedown", prevent_default(/*mousedown_handler_2*/ ctx[24])),
    					listen(div3, "mousedown", prevent_default(/*mousedown_handler*/ ctx[23])),
    					listen(div3, "click", prevent_default(/*focusControl*/ ctx[12]))
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (icon_slot) {
    				if (icon_slot.p && (!current || dirty[0] & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						icon_slot,
    						icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[21],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[21])
    						: get_slot_changes(icon_slot_template, /*$$scope*/ ctx[21], dirty, get_icon_slot_changes$1),
    						get_icon_slot_context$1
    					);
    				}
    			}

    			if (/*selectedOptions*/ ctx[10].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*selectedOptions*/ 1024) {
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
    			if (dirty[0] & /*inputValue*/ 128) input_changes.inputValue = /*inputValue*/ ctx[7];
    			if (dirty[0] & /*hasDropdownOpened*/ 512) input_changes.hasDropdownOpened = /*hasDropdownOpened*/ ctx[9];
    			if (dirty[0] & /*selectedOptions*/ 1024) input_changes.selectedOptions = /*selectedOptions*/ ctx[10];
    			input.$set(input_changes);

    			if (dirty[0] & /*multiple*/ 32) {
    				toggle_class(div0, "has-multiSelection", /*multiple*/ ctx[5]);
    			}

    			if (/*clearable*/ ctx[0] && /*selectedOptions*/ ctx[10].length && !/*disabled*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div2, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*clearable*/ ctx[0]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block$4();
    					if_block2.c();
    					if_block2.m(div2, t4);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*isFetchingData*/ 2048) {
    				toggle_class(div2, "is-loading", /*isFetchingData*/ ctx[11]);
    			}

    			if (dirty[0] & /*$hasFocus*/ 65536) {
    				toggle_class(div3, "is-active", /*$hasFocus*/ ctx[16]);
    			}

    			if (dirty[0] & /*disabled*/ 8) {
    				toggle_class(div3, "is-disabled", /*disabled*/ ctx[3]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			transition_in(if_block0);
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(icon_slot, local);
    			transition_out(if_block0);
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			if (icon_slot) icon_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			/*input_binding*/ ctx[27](null);
    			destroy_component(input);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $inputValue,
    		$$unsubscribe_inputValue = noop,
    		$$subscribe_inputValue = () => ($$unsubscribe_inputValue(), $$unsubscribe_inputValue = subscribe(inputValue, $$value => $$invalidate(15, $inputValue = $$value)), inputValue);

    	let $hasDropdownOpened,
    		$$unsubscribe_hasDropdownOpened = noop,
    		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(31, $hasDropdownOpened = $$value)), hasDropdownOpened);

    	let $hasFocus,
    		$$unsubscribe_hasFocus = noop,
    		$$subscribe_hasFocus = () => ($$unsubscribe_hasFocus(), $$unsubscribe_hasFocus = subscribe(hasFocus, $$value => $$invalidate(16, $hasFocus = $$value)), hasFocus);

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
    	let { inputValue } = $$props;
    	$$subscribe_inputValue();
    	let { hasFocus } = $$props;
    	$$subscribe_hasFocus();
    	let { hasDropdownOpened } = $$props;
    	$$subscribe_hasDropdownOpened();
    	let { selectedOptions } = $$props;
    	let { isFetchingData } = $$props;

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
    				$$invalidate(13, doCollapse = false);
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
    				$$invalidate(13, doCollapse = true);
    			},
    			100
    		);
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

    	function deselect_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refInput = $$value;
    			$$invalidate(14, refInput);
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
    		if ('resetOnBlur' in $$props) $$invalidate(20, resetOnBlur = $$props.resetOnBlur);
    		if ('collapseSelection' in $$props) $$invalidate(6, collapseSelection = $$props.collapseSelection);
    		if ('inputValue' in $$props) $$subscribe_inputValue($$invalidate(7, inputValue = $$props.inputValue));
    		if ('hasFocus' in $$props) $$subscribe_hasFocus($$invalidate(8, hasFocus = $$props.hasFocus));
    		if ('hasDropdownOpened' in $$props) $$subscribe_hasDropdownOpened($$invalidate(9, hasDropdownOpened = $$props.hasDropdownOpened));
    		if ('selectedOptions' in $$props) $$invalidate(10, selectedOptions = $$props.selectedOptions);
    		if ('isFetchingData' in $$props) $$invalidate(11, isFetchingData = $$props.isFetchingData);
    		if ('$$scope' in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	return [
    		clearable,
    		searchable,
    		renderer,
    		disabled,
    		placeholder,
    		multiple,
    		collapseSelection,
    		inputValue,
    		hasFocus,
    		hasDropdownOpened,
    		selectedOptions,
    		isFetchingData,
    		focusControl,
    		doCollapse,
    		refInput,
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
    			instance$d,
    			create_fragment$e,
    			safe_not_equal,
    			{
    				clearable: 0,
    				searchable: 1,
    				renderer: 2,
    				disabled: 3,
    				placeholder: 4,
    				multiple: 5,
    				resetOnBlur: 20,
    				collapseSelection: 6,
    				inputValue: 7,
    				hasFocus: 8,
    				hasDropdownOpened: 9,
    				selectedOptions: 10,
    				isFetchingData: 11,
    				focusControl: 12
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get focusControl() {
    		return this.$$.ctx[12];
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

    /* node_modules\svelte-tiny-virtual-list\src\VirtualList.svelte generated by Svelte v3.43.1 */
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	return child_ctx;
    }

    const get_item_slot_changes = dirty => ({
    	style: dirty[0] & /*items*/ 4,
    	index: dirty[0] & /*items*/ 4
    });

    const get_item_slot_context = ctx => ({
    	style: /*item*/ ctx[36].style,
    	index: /*item*/ ctx[36].index
    });

    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    // (318:2) {#each items as item (getKey ? getKey(item.index) : item.index)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let current;
    	const item_slot_template = /*#slots*/ ctx[20].item;
    	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[19], get_item_slot_context);

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
    				if (item_slot.p && (!current || dirty[0] & /*$$scope, items*/ 524292)) {
    					update_slot_base(
    						item_slot,
    						item_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(item_slot_template, /*$$scope*/ ctx[19], dirty, get_item_slot_changes),
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

    function create_fragment$d(ctx) {
    	let div1;
    	let t0;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t1;
    	let current;
    	const header_slot_template = /*#slots*/ ctx[20].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[19], get_header_slot_context);
    	let each_value = /*items*/ ctx[2];

    	const get_key = ctx => /*getKey*/ ctx[0]
    	? /*getKey*/ ctx[0](/*item*/ ctx[36].index)
    	: /*item*/ ctx[36].index;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const footer_slot_template = /*#slots*/ ctx[20].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[19], get_footer_slot_context);

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
    			attr(div0, "class", "virtual-list-inner svelte-1he1ex4");
    			attr(div0, "style", /*innerStyle*/ ctx[4]);
    			attr(div1, "class", "virtual-list-wrapper svelte-1he1ex4");
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

    			/*div1_binding*/ ctx[21](div1);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (header_slot) {
    				if (header_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot_base(
    						header_slot,
    						header_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(header_slot_template, /*$$scope*/ ctx[19], dirty, get_header_slot_changes),
    						get_header_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*$$scope, items, getKey*/ 524293) {
    				each_value = /*items*/ ctx[2];
    				group_outros();
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*innerStyle*/ 16) {
    				attr(div0, "style", /*innerStyle*/ ctx[4]);
    			}

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
    					update_slot_base(
    						footer_slot,
    						footer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[19], dirty, get_footer_slot_changes),
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
    			/*div1_binding*/ ctx[21](null);
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

    function instance$c($$self, $$props, $$invalidate) {
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
    		$$invalidate(17, mounted = true);
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
    			$$invalidate(18, state = {
    				offset: scrollOffset || 0,
    				scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
    			});
    		} else if (typeof scrollToIndex === 'number' && (scrollPropsHaveChanged || itemPropsHaveChanged)) {
    			$$invalidate(18, state = {
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
    			$$invalidate(4, innerStyle = `width:${totalSize}px;`);
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

    			dispatchEvent('itemsUpdated', { startIndex: start, stopIndex: stop });
    		}

    		$$invalidate(2, items = updatedItems);
    	}

    	function scrollTo(value) {
    		$$invalidate(1, wrapper[SCROLL_PROP[scrollDirection]] = value, wrapper);
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

    		$$invalidate(18, state = {
    			offset,
    			scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED
    		});

    		dispatchEvent('afterScroll', { offset, event });
    	}

    	function getWrapperOffset() {
    		return wrapper[SCROLL_PROP[scrollDirection]];
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
    		if ('overscanCount' in $$props) $$invalidate(15, overscanCount = $$props.overscanCount);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*scrollToIndex, scrollToAlignment, scrollOffset, itemCount, itemSize, estimatedItemSize*/ 29568) {
    			propsUpdated();
    		}

    		if ($$self.$$.dirty[0] & /*state*/ 262144) {
    			stateUpdated();
    		}

    		if ($$self.$$.dirty[0] & /*mounted, height, width, stickyIndices*/ 132192) {
    			if (mounted) recomputeSizes(height); // call scroll.reset;
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
    			instance$c,
    			create_fragment$d,
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
    				overscanCount: 15,
    				recomputeSizes: 16
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get recomputeSizes() {
    		return this.$$.ctx[16];
    	}
    }

    /* src\components\Dropdown.svelte generated by Svelte v3.43.1 */

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[44] = list[i];
    	child_ctx[46] = i;
    	return child_ctx;
    }

    // (145:0) {#if isMounted && renderDropdown}
    function create_if_block$3(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*items*/ ctx[5].length && create_if_block_4(ctx);
    	let if_block1 = /*$inputValue*/ ctx[17] && /*creatable*/ ctx[1] && !/*maxReached*/ ctx[2] && create_if_block_2(ctx);
    	let if_block2 = (/*hasEmptyList*/ ctx[14] || /*maxReached*/ ctx[2]) && create_if_block_1(ctx);

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr(div0, "class", "sv-dropdown-content svelte-mhc3oe");
    			toggle_class(div0, "max-reached", /*maxReached*/ ctx[2]);
    			attr(div1, "class", "sv-dropdown svelte-mhc3oe");
    			attr(div1, "aria-expanded", /*$hasDropdownOpened*/ ctx[23]);
    			attr(div1, "tabindex", "-1");
    			toggle_class(div1, "is-virtual", /*virtualList*/ ctx[7]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append(div0, t1);
    			if (if_block2) if_block2.m(div0, null);
    			/*div0_binding*/ ctx[36](div0);
    			/*div1_binding*/ ctx[37](div1);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div1, "mousedown", prevent_default(/*mousedown_handler*/ ctx[30]));
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (/*items*/ ctx[5].length) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*items*/ 32) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_4(ctx);
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

    			if (/*$inputValue*/ ctx[17] && /*creatable*/ ctx[1] && !/*maxReached*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div0, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*hasEmptyList*/ ctx[14] || /*maxReached*/ ctx[2]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty[0] & /*maxReached*/ 4) {
    				toggle_class(div0, "max-reached", /*maxReached*/ ctx[2]);
    			}

    			if (!current || dirty[0] & /*$hasDropdownOpened*/ 8388608) {
    				attr(div1, "aria-expanded", /*$hasDropdownOpened*/ ctx[23]);
    			}

    			if (dirty[0] & /*virtualList*/ 128) {
    				toggle_class(div1, "is-virtual", /*virtualList*/ ctx[7]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			/*div0_binding*/ ctx[36](null);
    			/*div1_binding*/ ctx[37](null);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (151:2) {#if items.length}
    function create_if_block_4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_5, create_else_block];
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

    // (173:4) {:else}
    function create_else_block(ctx) {
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
    			if (dirty[0] & /*listIndex, dropdownIndex, renderer, items, disabledField, $inputValue, disableHighlight*/ 135737) {
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

    // (152:4) {#if virtualList}
    function create_if_block_5(ctx) {
    	let virtuallist;
    	let current;

    	let virtuallist_props = {
    		width: "100%",
    		height: /*vl_listHeight*/ ctx[21],
    		itemCount: /*items*/ ctx[5].length,
    		itemSize: /*vl_itemSize*/ ctx[16],
    		scrollToAlignment: "auto",
    		scrollToIndex: /*items*/ ctx[5].length && /*isMounted*/ ctx[13]
    		? /*dropdownIndex*/ ctx[0]
    		: null,
    		$$slots: {
    			item: [
    				create_item_slot,
    				({ style, index }) => ({ 42: style, 43: index }),
    				({ style, index }) => [0, (style ? 2048 : 0) | (index ? 4096 : 0)]
    			]
    		},
    		$$scope: { ctx }
    	};

    	virtuallist = new VirtualList({ props: virtuallist_props });
    	/*virtuallist_binding*/ ctx[33](virtuallist);

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
    			if (dirty[0] & /*vl_listHeight*/ 2097152) virtuallist_changes.height = /*vl_listHeight*/ ctx[21];
    			if (dirty[0] & /*items*/ 32) virtuallist_changes.itemCount = /*items*/ ctx[5].length;
    			if (dirty[0] & /*vl_itemSize*/ 65536) virtuallist_changes.itemSize = /*vl_itemSize*/ ctx[16];

    			if (dirty[0] & /*items, isMounted, dropdownIndex*/ 8225) virtuallist_changes.scrollToIndex = /*items*/ ctx[5].length && /*isMounted*/ ctx[13]
    			? /*dropdownIndex*/ ctx[0]
    			: null;

    			if (dirty[0] & /*dropdownIndex, renderer, listIndex, items, disabledField, $inputValue, disableHighlight*/ 135737 | dirty[1] & /*$$scope, style, index*/ 71680) {
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
    			/*virtuallist_binding*/ ctx[33](null);
    			destroy_component(virtuallist, detaching);
    		}
    	};
    }

    // (174:6) {#each items as opt, i}
    function create_each_block$2(ctx) {
    	let div;
    	let item;
    	let t;
    	let div_data_pos_value;
    	let current;

    	item = new Item({
    			props: {
    				formatter: /*renderer*/ ctx[3],
    				index: /*listIndex*/ ctx[9].map[/*i*/ ctx[46]],
    				isDisabled: /*opt*/ ctx[44][/*disabledField*/ ctx[12]],
    				item: /*opt*/ ctx[44],
    				inputValue: /*$inputValue*/ ctx[17],
    				disableHighlight: /*disableHighlight*/ ctx[4]
    			}
    		});

    	item.$on("hover", /*hover_handler_1*/ ctx[34]);
    	item.$on("select", /*select_handler_1*/ ctx[35]);

    	return {
    		c() {
    			div = element("div");
    			create_component(item.$$.fragment);
    			t = space();
    			attr(div, "data-pos", div_data_pos_value = /*listIndex*/ ctx[9].map[/*i*/ ctx[46]]);
    			toggle_class(div, "sv-dd-item-active", /*listIndex*/ ctx[9].map[/*i*/ ctx[46]] == /*dropdownIndex*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(item, div, null);
    			append(div, t);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const item_changes = {};
    			if (dirty[0] & /*renderer*/ 8) item_changes.formatter = /*renderer*/ ctx[3];
    			if (dirty[0] & /*listIndex*/ 512) item_changes.index = /*listIndex*/ ctx[9].map[/*i*/ ctx[46]];
    			if (dirty[0] & /*items, disabledField*/ 4128) item_changes.isDisabled = /*opt*/ ctx[44][/*disabledField*/ ctx[12]];
    			if (dirty[0] & /*items*/ 32) item_changes.item = /*opt*/ ctx[44];
    			if (dirty[0] & /*$inputValue*/ 131072) item_changes.inputValue = /*$inputValue*/ ctx[17];
    			if (dirty[0] & /*disableHighlight*/ 16) item_changes.disableHighlight = /*disableHighlight*/ ctx[4];
    			item.$set(item_changes);

    			if (!current || dirty[0] & /*listIndex*/ 512 && div_data_pos_value !== (div_data_pos_value = /*listIndex*/ ctx[9].map[/*i*/ ctx[46]])) {
    				attr(div, "data-pos", div_data_pos_value);
    			}

    			if (dirty[0] & /*listIndex, dropdownIndex*/ 513) {
    				toggle_class(div, "sv-dd-item-active", /*listIndex*/ ctx[9].map[/*i*/ ctx[46]] == /*dropdownIndex*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(item);
    		}
    	};
    }

    // (161:8) 
    function create_item_slot(ctx) {
    	let div;
    	let item;
    	let div_style_value;
    	let current;

    	item = new Item({
    			props: {
    				formatter: /*renderer*/ ctx[3],
    				index: /*listIndex*/ ctx[9].map[/*index*/ ctx[43]],
    				isDisabled: /*items*/ ctx[5][/*index*/ ctx[43]][/*disabledField*/ ctx[12]],
    				item: /*items*/ ctx[5][/*index*/ ctx[43]],
    				inputValue: /*$inputValue*/ ctx[17],
    				disableHighlight: /*disableHighlight*/ ctx[4]
    			}
    		});

    	item.$on("hover", /*hover_handler*/ ctx[31]);
    	item.$on("select", /*select_handler*/ ctx[32]);

    	return {
    		c() {
    			div = element("div");
    			create_component(item.$$.fragment);
    			attr(div, "slot", "item");
    			attr(div, "style", div_style_value = /*style*/ ctx[42]);
    			toggle_class(div, "sv-dd-item-active", /*index*/ ctx[43] == /*dropdownIndex*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(item, div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const item_changes = {};
    			if (dirty[0] & /*renderer*/ 8) item_changes.formatter = /*renderer*/ ctx[3];
    			if (dirty[0] & /*listIndex*/ 512 | dirty[1] & /*index*/ 4096) item_changes.index = /*listIndex*/ ctx[9].map[/*index*/ ctx[43]];
    			if (dirty[0] & /*items, disabledField*/ 4128 | dirty[1] & /*index*/ 4096) item_changes.isDisabled = /*items*/ ctx[5][/*index*/ ctx[43]][/*disabledField*/ ctx[12]];
    			if (dirty[0] & /*items*/ 32 | dirty[1] & /*index*/ 4096) item_changes.item = /*items*/ ctx[5][/*index*/ ctx[43]];
    			if (dirty[0] & /*$inputValue*/ 131072) item_changes.inputValue = /*$inputValue*/ ctx[17];
    			if (dirty[0] & /*disableHighlight*/ 16) item_changes.disableHighlight = /*disableHighlight*/ ctx[4];
    			item.$set(item_changes);

    			if (!current || dirty[1] & /*style*/ 2048 && div_style_value !== (div_style_value = /*style*/ ctx[42])) {
    				attr(div, "style", div_style_value);
    			}

    			if (dirty[0] & /*dropdownIndex*/ 1 | dirty[1] & /*index*/ 4096) {
    				toggle_class(div, "sv-dd-item-active", /*index*/ ctx[43] == /*dropdownIndex*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			destroy_component(item);
    		}
    	};
    }

    // (189:2) {#if $inputValue && creatable && !maxReached}
    function create_if_block_2(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;
    	let if_block = /*currentListLength*/ ctx[22] !== /*dropdownIndex*/ ctx[0] && create_if_block_3();

    	return {
    		c() {
    			div = element("div");
    			span = element("span");
    			t0 = text("Create '");
    			t1 = text(/*$inputValue*/ ctx[17]);
    			t2 = text("'");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr(div, "class", "creatable-row svelte-mhc3oe");
    			toggle_class(div, "active", /*currentListLength*/ ctx[22] === /*dropdownIndex*/ ctx[0]);
    			toggle_class(div, "is-disabled", /*alreadyCreated*/ ctx[6].includes(/*$inputValue*/ ctx[17]));
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, span);
    			append(span, t0);
    			append(span, t1);
    			append(span, t2);
    			append(div, t3);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen(div, "click", function () {
    					if (is_function(/*dispatch*/ ctx[24]('select', /*$inputValue*/ ctx[17]))) /*dispatch*/ ctx[24]('select', /*$inputValue*/ ctx[17]).apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*$inputValue*/ 131072) set_data(t1, /*$inputValue*/ ctx[17]);

    			if (/*currentListLength*/ ctx[22] !== /*dropdownIndex*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block_3();
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*currentListLength, dropdownIndex*/ 4194305) {
    				toggle_class(div, "active", /*currentListLength*/ ctx[22] === /*dropdownIndex*/ ctx[0]);
    			}

    			if (dirty[0] & /*alreadyCreated, $inputValue*/ 131136) {
    				toggle_class(div, "is-disabled", /*alreadyCreated*/ ctx[6].includes(/*$inputValue*/ ctx[17]));
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (195:6) {#if currentListLength !== dropdownIndex}
    function create_if_block_3(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			span.innerHTML = `<kbd class="svelte-mhc3oe">Ctrl</kbd>+<kbd class="svelte-mhc3oe">Enter</kbd>`;
    			attr(span, "class", "shortcut svelte-mhc3oe");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (200:2) {#if hasEmptyList || maxReached}
    function create_if_block_1(ctx) {
    	let div;
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(/*listMessage*/ ctx[11]);
    			attr(div, "class", "empty-list-row svelte-mhc3oe");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*listMessage*/ 2048) set_data(t, /*listMessage*/ ctx[11]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*isMounted*/ ctx[13] && /*renderDropdown*/ ctx[15] && create_if_block$3(ctx);

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
    			if (/*isMounted*/ ctx[13] && /*renderDropdown*/ ctx[15]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*isMounted, renderDropdown*/ 40960) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
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

    function instance$b($$self, $$props, $$invalidate) {
    	let currentListLength;
    	let vl_listHeight;

    	let $inputValue,
    		$$unsubscribe_inputValue = noop,
    		$$subscribe_inputValue = () => ($$unsubscribe_inputValue(), $$unsubscribe_inputValue = subscribe(inputValue, $$value => $$invalidate(17, $inputValue = $$value)), inputValue);

    	let $hasDropdownOpened,
    		$$unsubscribe_hasDropdownOpened = noop,
    		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(23, $hasDropdownOpened = $$value)), hasDropdownOpened);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_inputValue());
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
    	$$subscribe_inputValue();
    	let { listIndex } = $$props;
    	let { hasDropdownOpened } = $$props;
    	$$subscribe_hasDropdownOpened();
    	let { listMessage } = $$props;
    	let { disabledField } = $$props;

    	function scrollIntoView(params) {
    		if (virtualList) return;
    		const focusedEl = container.querySelector(`[data-pos="${dropdownIndex}"]`);
    		if (!focusedEl) return;
    		const focusedRect = focusedEl.getBoundingClientRect();
    		const menuRect = scrollContainer.getBoundingClientRect();
    		const overScroll = focusedEl.offsetHeight / 3;

    		switch (true) {
    			case focusedEl.offsetTop < scrollContainer.scrollTop:
    				$$invalidate(19, scrollContainer.scrollTop = focusedEl.offsetTop - overScroll, scrollContainer);
    				break;
    			case focusedEl.offsetTop + focusedRect.height > scrollContainer.scrollTop + menuRect.height:
    				$$invalidate(19, scrollContainer.scrollTop = focusedEl.offsetTop + focusedRect.height - scrollContainer.offsetHeight + overScroll, scrollContainer);
    				break;
    		}
    	}

    	const dispatch = createEventDispatcher();
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
    		if (!scrollContainer && !renderDropdown) return;
    		const outVp = isOutOfViewport(scrollContainer);

    		if (outVp.bottom && !outVp.top) {
    			$$invalidate(19, scrollContainer.style.bottom = scrollContainer.parentElement.clientHeight + 1 + 'px', scrollContainer);
    		} else if (!val || outVp.top) {
    			$$invalidate(19, scrollContainer.style.bottom = '', scrollContainer); // FUTURE: debounce ....
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
    				: scrollContainer.parentElement;

    				const multipler = parseFloat(window.getComputedStyle(el).fontSize.match(/\d+/).shift());
    				value = multipler * value;
    			}

    			return value;
    		};

    		$$invalidate(29, vl_height = pixelGetter(scrollContainer, 'maxHeight') - pixelGetter(scrollContainer, 'paddingTop') - pixelGetter(scrollContainer, 'paddingBottom'));

    		// get item size (hacky style)
    		$$invalidate(19, scrollContainer.style = 'opacity: 0; display: block', scrollContainer);

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
    				$$invalidate(16, vl_itemSize = items.map(opt => opt.$isGroupHeader ? groupHeaderSize : regularItemSize));
    			} else {
    				$$invalidate(16, vl_itemSize = firstSize);
    			}
    		}

    		$$invalidate(19, scrollContainer.style = '', scrollContainer);
    	}

    	let dropdownStateSubscription = () => {
    		
    	};

    	/** ************************************ lifecycle */
    	onMount(() => {
    		/** ************************************ flawless UX related tweak */
    		dropdownStateSubscription = hasDropdownOpened.subscribe(val => {
    			if (!renderDropdown && val) $$invalidate(15, renderDropdown = true);
    			tick().then(() => positionDropdown(val));

    			// bind/unbind scroll listener
    			document[val ? 'addEventListener' : 'removeEventListener']('scroll', () => positionDropdown(val), { passive: true });
    		});

    		$$invalidate(13, isMounted = true);
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
    			$$invalidate(20, refVirtualList);
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
    			$$invalidate(18, container);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			scrollContainer = $$value;
    			$$invalidate(19, scrollContainer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('lazyDropdown' in $$props) $$invalidate(25, lazyDropdown = $$props.lazyDropdown);
    		if ('creatable' in $$props) $$invalidate(1, creatable = $$props.creatable);
    		if ('maxReached' in $$props) $$invalidate(2, maxReached = $$props.maxReached);
    		if ('dropdownIndex' in $$props) $$invalidate(0, dropdownIndex = $$props.dropdownIndex);
    		if ('renderer' in $$props) $$invalidate(3, renderer = $$props.renderer);
    		if ('disableHighlight' in $$props) $$invalidate(4, disableHighlight = $$props.disableHighlight);
    		if ('items' in $$props) $$invalidate(5, items = $$props.items);
    		if ('alreadyCreated' in $$props) $$invalidate(6, alreadyCreated = $$props.alreadyCreated);
    		if ('virtualList' in $$props) $$invalidate(7, virtualList = $$props.virtualList);
    		if ('vlItemSize' in $$props) $$invalidate(26, vlItemSize = $$props.vlItemSize);
    		if ('vlHeight' in $$props) $$invalidate(27, vlHeight = $$props.vlHeight);
    		if ('inputValue' in $$props) $$subscribe_inputValue($$invalidate(8, inputValue = $$props.inputValue));
    		if ('listIndex' in $$props) $$invalidate(9, listIndex = $$props.listIndex);
    		if ('hasDropdownOpened' in $$props) $$subscribe_hasDropdownOpened($$invalidate(10, hasDropdownOpened = $$props.hasDropdownOpened));
    		if ('listMessage' in $$props) $$invalidate(11, listMessage = $$props.listMessage);
    		if ('disabledField' in $$props) $$invalidate(12, disabledField = $$props.disabledField);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*items*/ 32) {
    			$$invalidate(22, currentListLength = items.length);
    		}

    		if ($$self.$$.dirty[0] & /*items, creatable, $inputValue, virtualList, isMounted, renderDropdown, hasEmptyList*/ 188578) {
    			{
    				$$invalidate(14, hasEmptyList = items.length < 1 && (creatable ? !$inputValue : true));

    				// required when changing item list 'on-the-fly' for VL
    				if (virtualList && vl_autoMode && isMounted && renderDropdown) {
    					if (hasEmptyList) $$invalidate(0, dropdownIndex = null);
    					$$invalidate(16, vl_itemSize = 0);
    					tick().then(virtualListDimensionsResolver);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*vl_height, vl_itemSize, items*/ 536936480) {
    			$$invalidate(21, vl_listHeight = Math.min(vl_height, Array.isArray(vl_itemSize)
    			? vl_itemSize.reduce(
    					(res, num) => {
    						res += num;
    						return res;
    					},
    					0
    				)
    			: items.length * vl_itemSize));
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
    		listIndex,
    		hasDropdownOpened,
    		listMessage,
    		disabledField,
    		isMounted,
    		hasEmptyList,
    		renderDropdown,
    		vl_itemSize,
    		$inputValue,
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
    		scrollIntoView,
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
    			instance$b,
    			create_fragment$c,
    			safe_not_equal,
    			{
    				lazyDropdown: 25,
    				creatable: 1,
    				maxReached: 2,
    				dropdownIndex: 0,
    				renderer: 3,
    				disableHighlight: 4,
    				items: 5,
    				alreadyCreated: 6,
    				virtualList: 7,
    				vlItemSize: 26,
    				vlHeight: 27,
    				inputValue: 8,
    				listIndex: 9,
    				hasDropdownOpened: 10,
    				listMessage: 11,
    				disabledField: 12,
    				scrollIntoView: 28
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get scrollIntoView() {
    		return this.$$.ctx[28];
    	}
    }

    /* src\Svelecte.svelte generated by Svelte v3.43.1 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[91] = list[i];
    	return child_ctx;
    }

    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (531:4) 
    function create_icon_slot$2(ctx) {
    	let div;
    	let current;
    	const icon_slot_template = /*#slots*/ ctx[69].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[73], get_icon_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (icon_slot) icon_slot.c();
    			attr(div, "slot", "icon");
    			attr(div, "class", "icon-slot svelte-1545w4u");
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
    				if (icon_slot.p && (!current || dirty[2] & /*$$scope*/ 2048)) {
    					update_slot_base(
    						icon_slot,
    						icon_slot_template,
    						ctx,
    						/*$$scope*/ ctx[73],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[73])
    						: get_slot_changes(icon_slot_template, /*$$scope*/ ctx[73], dirty, get_icon_slot_changes),
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

    // (543:2) {#if name && !hasAnchor}
    function create_if_block$2(ctx) {
    	let select;
    	let each_value = /*selectedOptions*/ ctx[22];
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

    			attr(select, "name", /*name*/ ctx[2]);
    			select.multiple = /*multiple*/ ctx[0];
    			attr(select, "class", "is-hidden svelte-1545w4u");
    			attr(select, "tabindex", "-1");
    			select.required = /*required*/ ctx[3];
    			select.disabled = /*disabled*/ ctx[1];
    		},
    		m(target, anchor) {
    			insert(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedOptions, currentValueField, currentLabelField*/ 7340032) {
    				each_value = /*selectedOptions*/ ctx[22];
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

    			if (dirty[0] & /*multiple*/ 1) {
    				select.multiple = /*multiple*/ ctx[0];
    			}

    			if (dirty[0] & /*required*/ 8) {
    				select.required = /*required*/ ctx[3];
    			}

    			if (dirty[0] & /*disabled*/ 2) {
    				select.disabled = /*disabled*/ ctx[1];
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(select);
    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (545:4) {#each selectedOptions as opt}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*opt*/ ctx[91][/*currentLabelField*/ ctx[21]] + "";
    	let t;
    	let option_value_value;

    	return {
    		c() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*opt*/ ctx[91][/*currentValueField*/ ctx[20]];
    			option.value = option.__value;
    			option.selected = true;
    		},
    		m(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*selectedOptions, currentLabelField*/ 6291456 && t_value !== (t_value = /*opt*/ ctx[91][/*currentLabelField*/ ctx[21]] + "")) set_data(t, t_value);

    			if (dirty[0] & /*selectedOptions, currentValueField*/ 5242880 && option_value_value !== (option_value_value = /*opt*/ ctx[91][/*currentValueField*/ ctx[20]])) {
    				option.__value = option_value_value;
    				option.value = option.__value;
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(option);
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	let div;
    	let control;
    	let t0;
    	let dropdown;
    	let t1;
    	let div_class_value;
    	let current;

    	let control_props = {
    		renderer: /*itemRenderer*/ ctx[30],
    		disabled: /*disabled*/ ctx[1],
    		clearable: /*clearable*/ ctx[8],
    		searchable: /*searchable*/ ctx[7],
    		placeholder: /*placeholder*/ ctx[6],
    		multiple: /*multiple*/ ctx[0],
    		resetOnBlur: /*resetOnBlur*/ ctx[10],
    		collapseSelection: /*collapseSelection*/ ctx[11]
    		? config.collapseSelectionFn
    		: null,
    		inputValue: /*inputValue*/ ctx[32],
    		hasFocus: /*hasFocus*/ ctx[33],
    		hasDropdownOpened: /*hasDropdownOpened*/ ctx[34],
    		selectedOptions: /*selectedOptions*/ ctx[22],
    		isFetchingData: /*isFetchingData*/ ctx[28],
    		$$slots: { icon: [create_icon_slot$2] },
    		$$scope: { ctx }
    	};

    	control = new Control({ props: control_props });
    	/*control_binding*/ ctx[70](control);
    	control.$on("deselect", /*onDeselect*/ ctx[36]);
    	control.$on("keydown", /*onKeyDown*/ ctx[38]);
    	control.$on("paste", /*onPaste*/ ctx[39]);

    	let dropdown_props = {
    		renderer: /*itemRenderer*/ ctx[30],
    		disableHighlight: /*disableHighlight*/ ctx[9],
    		creatable: /*creatable*/ ctx[12],
    		maxReached: /*maxReached*/ ctx[25],
    		alreadyCreated: /*alreadyCreated*/ ctx[29],
    		virtualList: /*creatable*/ ctx[12] ? false : /*virtualList*/ ctx[14],
    		vlHeight: /*vlHeight*/ ctx[15],
    		vlItemSize: /*vlItemSize*/ ctx[16],
    		lazyDropdown: /*lazyDropdown*/ ctx[13],
    		dropdownIndex: /*dropdownActiveIndex*/ ctx[19],
    		items: /*availableItems*/ ctx[24],
    		listIndex: /*listIndex*/ ctx[23],
    		inputValue: /*inputValue*/ ctx[32],
    		hasDropdownOpened: /*hasDropdownOpened*/ ctx[34],
    		listMessage: /*listMessage*/ ctx[31],
    		disabledField: /*disabledField*/ ctx[5]
    	};

    	dropdown = new Dropdown({ props: dropdown_props });
    	/*dropdown_binding*/ ctx[71](dropdown);
    	dropdown.$on("select", /*onSelect*/ ctx[35]);
    	dropdown.$on("hover", /*onHover*/ ctx[37]);
    	dropdown.$on("createoption", /*createoption_handler*/ ctx[72]);
    	let if_block = /*name*/ ctx[2] && !/*hasAnchor*/ ctx[4] && create_if_block$2(ctx);

    	return {
    		c() {
    			div = element("div");
    			create_component(control.$$.fragment);
    			t0 = space();
    			create_component(dropdown.$$.fragment);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr(div, "class", div_class_value = "" + (null_to_empty(`svelecte ${/*className*/ ctx[17]}`) + " svelte-1545w4u"));
    			attr(div, "style", /*style*/ ctx[18]);
    			toggle_class(div, "is-disabled", /*disabled*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(control, div, null);
    			append(div, t0);
    			mount_component(dropdown, div, null);
    			append(div, t1);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const control_changes = {};
    			if (dirty[0] & /*itemRenderer*/ 1073741824) control_changes.renderer = /*itemRenderer*/ ctx[30];
    			if (dirty[0] & /*disabled*/ 2) control_changes.disabled = /*disabled*/ ctx[1];
    			if (dirty[0] & /*clearable*/ 256) control_changes.clearable = /*clearable*/ ctx[8];
    			if (dirty[0] & /*searchable*/ 128) control_changes.searchable = /*searchable*/ ctx[7];
    			if (dirty[0] & /*placeholder*/ 64) control_changes.placeholder = /*placeholder*/ ctx[6];
    			if (dirty[0] & /*multiple*/ 1) control_changes.multiple = /*multiple*/ ctx[0];
    			if (dirty[0] & /*resetOnBlur*/ 1024) control_changes.resetOnBlur = /*resetOnBlur*/ ctx[10];

    			if (dirty[0] & /*collapseSelection*/ 2048) control_changes.collapseSelection = /*collapseSelection*/ ctx[11]
    			? config.collapseSelectionFn
    			: null;

    			if (dirty[0] & /*selectedOptions*/ 4194304) control_changes.selectedOptions = /*selectedOptions*/ ctx[22];
    			if (dirty[0] & /*isFetchingData*/ 268435456) control_changes.isFetchingData = /*isFetchingData*/ ctx[28];

    			if (dirty[2] & /*$$scope*/ 2048) {
    				control_changes.$$scope = { dirty, ctx };
    			}

    			control.$set(control_changes);
    			const dropdown_changes = {};
    			if (dirty[0] & /*itemRenderer*/ 1073741824) dropdown_changes.renderer = /*itemRenderer*/ ctx[30];
    			if (dirty[0] & /*disableHighlight*/ 512) dropdown_changes.disableHighlight = /*disableHighlight*/ ctx[9];
    			if (dirty[0] & /*creatable*/ 4096) dropdown_changes.creatable = /*creatable*/ ctx[12];
    			if (dirty[0] & /*maxReached*/ 33554432) dropdown_changes.maxReached = /*maxReached*/ ctx[25];
    			if (dirty[0] & /*alreadyCreated*/ 536870912) dropdown_changes.alreadyCreated = /*alreadyCreated*/ ctx[29];
    			if (dirty[0] & /*creatable, virtualList*/ 20480) dropdown_changes.virtualList = /*creatable*/ ctx[12] ? false : /*virtualList*/ ctx[14];
    			if (dirty[0] & /*vlHeight*/ 32768) dropdown_changes.vlHeight = /*vlHeight*/ ctx[15];
    			if (dirty[0] & /*vlItemSize*/ 65536) dropdown_changes.vlItemSize = /*vlItemSize*/ ctx[16];
    			if (dirty[0] & /*lazyDropdown*/ 8192) dropdown_changes.lazyDropdown = /*lazyDropdown*/ ctx[13];
    			if (dirty[0] & /*dropdownActiveIndex*/ 524288) dropdown_changes.dropdownIndex = /*dropdownActiveIndex*/ ctx[19];
    			if (dirty[0] & /*availableItems*/ 16777216) dropdown_changes.items = /*availableItems*/ ctx[24];
    			if (dirty[0] & /*listIndex*/ 8388608) dropdown_changes.listIndex = /*listIndex*/ ctx[23];
    			if (dirty[1] & /*listMessage*/ 1) dropdown_changes.listMessage = /*listMessage*/ ctx[31];
    			if (dirty[0] & /*disabledField*/ 32) dropdown_changes.disabledField = /*disabledField*/ ctx[5];
    			dropdown.$set(dropdown_changes);

    			if (/*name*/ ctx[2] && !/*hasAnchor*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty[0] & /*className*/ 131072 && div_class_value !== (div_class_value = "" + (null_to_empty(`svelecte ${/*className*/ ctx[17]}`) + " svelte-1545w4u"))) {
    				attr(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*style*/ 262144) {
    				attr(div, "style", /*style*/ ctx[18]);
    			}

    			if (dirty[0] & /*className, disabled*/ 131074) {
    				toggle_class(div, "is-disabled", /*disabled*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(control.$$.fragment, local);
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(control.$$.fragment, local);
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			/*control_binding*/ ctx[70](null);
    			destroy_component(control);
    			/*dropdown_binding*/ ctx[71](null);
    			destroy_component(dropdown);
    			if (if_block) if_block.d();
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
    		formatterList = Object.assign(formatterList, name);
    	} else {
    		formatterList[name] = formatFn;
    	}
    }


    const config = settings;

    function instance$a($$self, $$props, $$invalidate) {
    	let flatItems;
    	let maxReached;
    	let availableItems;
    	let currentListLength;
    	let listIndex;
    	let listMessage;
    	let itemRenderer;
    	let $inputValue;
    	let $hasDropdownOpened;
    	let $hasFocus;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { name = 'svelecte' } = $$props;
    	let { required = false } = $$props;
    	let { hasAnchor = false } = $$props;
    	let { disabled = settings.disabled } = $$props;
    	let { options = [] } = $$props;
    	let { valueField = settings.valueField } = $$props;
    	let { labelField = settings.labelField } = $$props;
    	let { disabledField = settings.disabledField } = $$props;
    	let { placeholder = 'Select' } = $$props;
    	let { searchable = settings.searchable } = $$props;
    	let { clearable = settings.clearable } = $$props;
    	let { renderer = null } = $$props;
    	let { disableHighlight = false } = $$props;
    	let { selectOnTab = settings.selectOnTab } = $$props;
    	let { resetOnBlur = settings.resetOnBlur } = $$props;
    	let { multiple = settings.multiple } = $$props;
    	let { max = settings.max } = $$props;
    	let { collapseSelection = settings.collapseSelection } = $$props;
    	let { creatable = settings.creatable } = $$props;
    	let { creatablePrefix = settings.creatablePrefix } = $$props;
    	let { allowEditing = settings.allowEditing } = $$props;
    	let { keepCreated = settings.keepCreated } = $$props;
    	let { delimiter = settings.delimiter } = $$props;
    	let { fetch = null } = $$props;
    	let { fetchMode = 'auto' } = $$props;
    	let { fetchCallback = settings.fetchCallback } = $$props;
    	let { fetchResetOnBlur = true } = $$props;
    	let { lazyDropdown = settings.lazyDropdown } = $$props;
    	let { virtualList = settings.virtualList } = $$props;
    	let { vlHeight = settings.vlHeight } = $$props;
    	let { vlItemSize = settings.vlItemSize } = $$props;
    	let { searchField = null } = $$props;
    	let { sortField = null } = $$props;
    	let { disableSifter = false } = $$props;
    	let { class: className = 'svelecte-control' } = $$props;
    	let { style = null } = $$props;
    	let { selection = null } = $$props;
    	let { value = null } = $$props;
    	let { labelAsValue = false } = $$props;

    	const focus = event => {
    		refControl.focusControl(event);
    	};

    	const getSelection = onlyValues => {
    		if (!selection) return multiple ? [] : null;

    		return multiple
    		? onlyValues
    			? value
    			: selection.map(opt => Object.assign({}, opt))
    		: onlyValues ? value : Object.assign({}, selection);
    	};

    	const setSelection = (selection, triggerChangeEvent) => {
    		_selectByValues(selection);
    		triggerChangeEvent && emitChangeEvent();
    	};

    	const clearByParent = doDisable => {
    		clearSelection();
    		emitChangeEvent();

    		if (doDisable) {
    			$$invalidate(1, disabled = true);
    			$$invalidate(41, fetch = null);
    		}
    	};

    	const dispatch = createEventDispatcher();

    	const itemConfig = {
    		optionsWithGroups: false,
    		isOptionArray: options && options.length && typeof options[0] !== 'object',
    		optionProps: [],
    		valueField,
    		labelField,
    		labelAsValue
    	};

    	let isInitialized = false;
    	let initialValue = value;
    	let refDropdown;
    	let refControl;
    	let ignoreHover = false;
    	let dropdownActiveIndex = null;
    	let fetchUnsubscribe = null;
    	let currentValueField = valueField || fieldInit('value', options, itemConfig);
    	let currentLabelField = labelField || fieldInit('label', options, itemConfig);
    	itemConfig.valueField = currentValueField;
    	itemConfig.labelField = currentLabelField;

    	itemConfig.optionProps = selection && (multiple && Array.isArray(selection)
    	? selection.length > 0
    	: true)
    	? getFilterProps(multiple ? selection.slice(0, 1).shift() : selection)
    	: [currentValueField, currentLabelField];

    	/** ************************************ automatic init */
    	multiple = name && !multiple ? name.endsWith('[]') : multiple;

    	/** ************************************ Context definition */
    	const inputValue = writable('');

    	component_subscribe($$self, inputValue, value => $$invalidate(68, $inputValue = value));
    	const hasFocus = writable(false);
    	component_subscribe($$self, hasFocus, value => $$invalidate(79, $hasFocus = value));
    	const hasDropdownOpened = writable(false);
    	component_subscribe($$self, hasDropdownOpened, value => $$invalidate(78, $hasDropdownOpened = value));
    	let isFetchingData = false;

    	function createFetch(fetch) {
    		if (fetchUnsubscribe) {
    			fetchUnsubscribe();
    			fetchUnsubscribe = null;
    		}

    		if (!fetch) return null;
    		const fetchSource = typeof fetch === 'string' ? fetchRemote(fetch) : fetch;
    		const initFetchOnly = fetchMode === 'init' || fetchMode === 'auto' && typeof fetch === 'string' && fetch.indexOf('[query]') === -1;

    		const debouncedFetch = debounce(
    			query => {
    				fetchSource(query, fetchCallback).then(data => {
    					$$invalidate(40, options = data);
    				}).catch(() => $$invalidate(40, options = [])).finally(() => {
    					$$invalidate(28, isFetchingData = false);
    					$hasFocus && hasDropdownOpened.set(true);
    					$$invalidate(31, listMessage = config.i18n.fetchEmpty);
    					tick().then(() => dispatch('fetch', options));
    				});
    			},
    			500
    		);

    		if (initFetchOnly) {
    			if (typeof fetch === 'string' && fetch.indexOf('[parent]') !== -1) return null;
    			$$invalidate(28, isFetchingData = true);
    			debouncedFetch(null);
    			return null;
    		}

    		fetchUnsubscribe = inputValue.subscribe(value => {
    			if (xhr && xhr.readyState !== 4) {
    				// cancel previously run
    				xhr.abort();
    			}

    			

    			if (!value) {
    				if (isInitialized && fetchResetOnBlur) {
    					$$invalidate(40, options = []);
    				}

    				return;
    			}

    			$$invalidate(28, isFetchingData = true);
    			hasDropdownOpened.set(false);
    			debouncedFetch(value);
    		});

    		return debouncedFetch;
    	}

    	/** ************************************ component logic */
    	let prevSelection = selection;

    	/** - - - - - - - - - - STORE - - - - - - - - - - - - - -*/
    	let selectedOptions = selection
    	? Array.isArray(selection) ? selection : [selection]
    	: [];

    	let selectedKeys = selectedOptions.reduce(
    		(set, opt) => {
    			set.add(opt[currentValueField]);
    			return set;
    		},
    		new Set()
    	);

    	let alreadyCreated = [];
    	let prevOptions = options;

    	/**
     * Dispatch change event on add options/remove selected items
     */
    	function emitChangeEvent() {
    		tick().then(() => {
    			dispatch('change', selection);
    		});
    	}

    	/**
     * Dispatch createoption event when user creates a new entry (with 'creatable' feature)
     */
    	function emitCreateEvent(createdOpt) {
    		dispatch('createoption', createdOpt);
    	}

    	/**
     * Internal helper for passed value array. Should be used for CE
     */
    	function _selectByValues(values) {
    		if (!Array.isArray(values)) values = [values];
    		if (values && values.length && values[0] instanceof Object) values = values.map(opt => opt[currentValueField]);
    		const newAddition = [];

    		values.forEach(val => {
    			availableItems.some(opt => {
    				if (val == opt[currentValueField]) {
    					newAddition.push(opt);
    					return true;
    				}

    				return false;
    			});
    		});

    		newAddition.forEach(selectOption);
    	}

    	/** 
     * Add given option to selection pool
     * Check if not already selected or max item selection reached
     */
    	function selectOption(opt) {
    		if (multiple && maxReached) return;
    		if (selectedKeys.has(opt[currentValueField])) return;

    		if (typeof opt === 'string') {
    			if (alreadyCreated.includes(opt)) return;
    			alreadyCreated.push(opt);

    			opt = {
    				[currentValueField]: encodeURIComponent(opt),
    				[currentLabelField]: `${creatablePrefix}${opt}`,
    				'$created': true
    			};

    			if (keepCreated) $$invalidate(40, options = [...options, opt]);
    			emitCreateEvent(opt);
    		}

    		if (multiple) {
    			selectedOptions.push(opt);
    			$$invalidate(22, selectedOptions);
    			selectedKeys.add(opt[currentValueField]);
    		} else {
    			$$invalidate(22, selectedOptions = [opt]);
    			selectedKeys.clear();
    			selectedKeys.add(opt[currentValueField]);
    		}

    		((((((((($$invalidate(67, flatItems), $$invalidate(40, options)), $$invalidate(64, itemConfig)), $$invalidate(65, isInitialized)), $$invalidate(84, prevOptions)), $$invalidate(44, valueField)), $$invalidate(20, currentValueField)), $$invalidate(45, labelField)), $$invalidate(21, currentLabelField)), $$invalidate(59, labelAsValue));
    	}

    	/**
     * Remove option/all options from selection pool
     */
    	function deselectOption(opt) {
    		if (opt.$created && backspacePressed && allowEditing) {
    			alreadyCreated.splice(alreadyCreated.findIndex(o => o[currentValueField] === opt[currentValueField]), 1);
    			$$invalidate(29, alreadyCreated);

    			if (keepCreated) {
    				options.splice(options.findIndex(o => o === opt), 1);
    				$$invalidate(40, options);
    			}

    			set_store_value(inputValue, $inputValue = opt[currentLabelField].replace(creatablePrefix, ''), $inputValue);
    		}

    		const id = opt[currentValueField];
    		selectedKeys.delete(id);
    		selectedOptions.splice(selectedOptions.findIndex(o => o[currentValueField] == id), 1);
    		$$invalidate(22, selectedOptions);
    		((((((((($$invalidate(67, flatItems), $$invalidate(40, options)), $$invalidate(64, itemConfig)), $$invalidate(65, isInitialized)), $$invalidate(84, prevOptions)), $$invalidate(44, valueField)), $$invalidate(20, currentValueField)), $$invalidate(45, labelField)), $$invalidate(21, currentLabelField)), $$invalidate(59, labelAsValue));
    	}

    	function clearSelection() {
    		selectedKeys.clear();
    		$$invalidate(22, selectedOptions = []);
    		((((((((($$invalidate(67, flatItems), $$invalidate(40, options)), $$invalidate(64, itemConfig)), $$invalidate(65, isInitialized)), $$invalidate(84, prevOptions)), $$invalidate(44, valueField)), $$invalidate(20, currentValueField)), $$invalidate(45, labelField)), $$invalidate(21, currentLabelField)), $$invalidate(59, labelAsValue));
    	}

    	/**
     * Handle user action on select
     */
    	function onSelect(event, opt) {
    		opt = opt || event.detail;
    		if (disabled || opt[disabledField] || opt.$isGroupHeader) return;
    		selectOption(opt);
    		set_store_value(inputValue, $inputValue = '', $inputValue);

    		if (!multiple) {
    			set_store_value(hasDropdownOpened, $hasDropdownOpened = false, $hasDropdownOpened);
    		} else {
    			tick().then(() => {
    				$$invalidate(19, dropdownActiveIndex = maxReached
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

    	/**
     * Dropdown hover handler - update active item
     */
    	function onHover(event) {
    		if (ignoreHover) {
    			ignoreHover = false;
    			return;
    		}

    		$$invalidate(19, dropdownActiveIndex = event.detail);
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

    		switch (event.key) {
    			case 'End':
    				if ($inputValue.length !== 0) return;
    			case 'PageDown':
    				$$invalidate(19, dropdownActiveIndex = listIndex.first);
    			case 'ArrowUp':
    				if (!$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened);
    					return;
    				}
    				event.preventDefault();
    				$$invalidate(19, dropdownActiveIndex = listIndex.prev(dropdownActiveIndex));
    				tick().then(refDropdown.scrollIntoView);
    				ignoreHover = true;
    				break;
    			case 'Home':
    				if ($inputValue.length !== 0 || $inputValue.length === 0 && availableItems.length === 0) return;
    			case 'PageUp':
    				$$invalidate(19, dropdownActiveIndex = listIndex.last);
    			case 'ArrowDown':
    				if (!$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened); // ref #26
    					return;
    				}
    				event.preventDefault();
    				$$invalidate(19, dropdownActiveIndex = listIndex.next(dropdownActiveIndex));
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
    				set_store_value(inputValue, $inputValue = '', $inputValue);
    				break;
    			case Tab:
    			case 'Enter':
    				if (!$hasDropdownOpened) return;
    				let activeDropdownItem = availableItems[dropdownActiveIndex];
    				if (creatable && $inputValue) {
    					activeDropdownItem = !activeDropdownItem || event.ctrlKey
    					? $inputValue
    					: activeDropdownItem;
    				}
    				activeDropdownItem && onSelect(null, activeDropdownItem);
    				if (availableItems.length <= dropdownActiveIndex) {
    					$$invalidate(19, dropdownActiveIndex = currentListLength > 0
    					? currentListLength
    					: listIndex.first);
    				}
    				event.preventDefault();
    				break;
    			case ' ':
    				if (!$hasDropdownOpened) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened); // prevent form submit
    					event.preventDefault();
    				}
    				break;
    			case 'Backspace':
    				backspacePressed = true;
    			case 'Delete':
    				if ($inputValue === '' && selectedOptions.length) {
    					event.ctrlKey
    					? onDeselect({})
    					: onDeselect(null, selectedOptions[selectedOptions.length - 1]); /** no detail prop */

    					event.preventDefault();
    				}
    				backspacePressed = false;
    			default:
    				if (!event.ctrlKey && !['Tab', 'Shift'].includes(event.key) && !$hasDropdownOpened && !isFetchingData) {
    					set_store_value(hasDropdownOpened, $hasDropdownOpened = true, $hasDropdownOpened);
    				}
    				if (!multiple && selectedOptions.length && event.key !== 'Tab') event.preventDefault();
    		}
    	}

    	/**
     * Enable create items by pasting
     */
    	function onPaste(event) {
    		if (creatable) {
    			event.preventDefault();
    			const rx = new RegExp('([^' + delimiter + '\\n]+)', 'g');
    			const pasted = event.clipboardData.getData('text/plain').replaceAll('/', '\/');
    			const matches = pasted.match(rx);

    			if (matches.length === 1 && pasted.indexOf(',') === -1) {
    				set_store_value(inputValue, $inputValue = matches.pop().trim(), $inputValue);
    			}

    			matches.forEach(opt => onSelect(null, opt.trim()));
    		}
    	} // do nothing otherwise

    	/** ************************************ component lifecycle related */
    	onMount(() => {
    		$$invalidate(65, isInitialized = true);
    		if (initialValue) _selectByValues(initialValue);

    		if (creatable) {
    			const valueProp = itemConfig.labelAsValue
    			? currentLabelField
    			: currentValueField;

    			$$invalidate(29, alreadyCreated = flatItems.map(opt => opt[valueProp]).filter(opt => opt));
    		}

    		$$invalidate(19, dropdownActiveIndex = listIndex.first);

    		if (prevSelection && !multiple) {
    			$$invalidate(19, dropdownActiveIndex = flatItems.findIndex(opt => opt[currentValueField] === prevSelection[currentValueField]));
    		}
    	});

    	function control_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refControl = $$value;
    			$$invalidate(27, refControl);
    		});
    	}

    	function dropdown_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			refDropdown = $$value;
    			$$invalidate(26, refDropdown);
    		});
    	}

    	function createoption_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('required' in $$props) $$invalidate(3, required = $$props.required);
    		if ('hasAnchor' in $$props) $$invalidate(4, hasAnchor = $$props.hasAnchor);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ('options' in $$props) $$invalidate(40, options = $$props.options);
    		if ('valueField' in $$props) $$invalidate(44, valueField = $$props.valueField);
    		if ('labelField' in $$props) $$invalidate(45, labelField = $$props.labelField);
    		if ('disabledField' in $$props) $$invalidate(5, disabledField = $$props.disabledField);
    		if ('placeholder' in $$props) $$invalidate(6, placeholder = $$props.placeholder);
    		if ('searchable' in $$props) $$invalidate(7, searchable = $$props.searchable);
    		if ('clearable' in $$props) $$invalidate(8, clearable = $$props.clearable);
    		if ('renderer' in $$props) $$invalidate(46, renderer = $$props.renderer);
    		if ('disableHighlight' in $$props) $$invalidate(9, disableHighlight = $$props.disableHighlight);
    		if ('selectOnTab' in $$props) $$invalidate(47, selectOnTab = $$props.selectOnTab);
    		if ('resetOnBlur' in $$props) $$invalidate(10, resetOnBlur = $$props.resetOnBlur);
    		if ('multiple' in $$props) $$invalidate(0, multiple = $$props.multiple);
    		if ('max' in $$props) $$invalidate(48, max = $$props.max);
    		if ('collapseSelection' in $$props) $$invalidate(11, collapseSelection = $$props.collapseSelection);
    		if ('creatable' in $$props) $$invalidate(12, creatable = $$props.creatable);
    		if ('creatablePrefix' in $$props) $$invalidate(49, creatablePrefix = $$props.creatablePrefix);
    		if ('allowEditing' in $$props) $$invalidate(50, allowEditing = $$props.allowEditing);
    		if ('keepCreated' in $$props) $$invalidate(51, keepCreated = $$props.keepCreated);
    		if ('delimiter' in $$props) $$invalidate(52, delimiter = $$props.delimiter);
    		if ('fetch' in $$props) $$invalidate(41, fetch = $$props.fetch);
    		if ('fetchMode' in $$props) $$invalidate(53, fetchMode = $$props.fetchMode);
    		if ('fetchCallback' in $$props) $$invalidate(54, fetchCallback = $$props.fetchCallback);
    		if ('fetchResetOnBlur' in $$props) $$invalidate(55, fetchResetOnBlur = $$props.fetchResetOnBlur);
    		if ('lazyDropdown' in $$props) $$invalidate(13, lazyDropdown = $$props.lazyDropdown);
    		if ('virtualList' in $$props) $$invalidate(14, virtualList = $$props.virtualList);
    		if ('vlHeight' in $$props) $$invalidate(15, vlHeight = $$props.vlHeight);
    		if ('vlItemSize' in $$props) $$invalidate(16, vlItemSize = $$props.vlItemSize);
    		if ('searchField' in $$props) $$invalidate(56, searchField = $$props.searchField);
    		if ('sortField' in $$props) $$invalidate(57, sortField = $$props.sortField);
    		if ('disableSifter' in $$props) $$invalidate(58, disableSifter = $$props.disableSifter);
    		if ('class' in $$props) $$invalidate(17, className = $$props.class);
    		if ('style' in $$props) $$invalidate(18, style = $$props.style);
    		if ('selection' in $$props) $$invalidate(42, selection = $$props.selection);
    		if ('value' in $$props) $$invalidate(43, value = $$props.value);
    		if ('labelAsValue' in $$props) $$invalidate(59, labelAsValue = $$props.labelAsValue);
    		if ('$$scope' in $$props) $$invalidate(73, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*fetch*/ 1024) {
    			/** ************************************ remote source */
    			// $: initFetchOnly = fetchMode === 'init' || (typeof fetch === 'string' && fetch.indexOf('[query]') === -1);
    			createFetch(fetch);
    		}

    		if ($$self.$$.dirty[0] & /*currentValueField, currentLabelField*/ 3145728 | $$self.$$.dirty[1] & /*options, valueField, labelField*/ 25088 | $$self.$$.dirty[2] & /*isInitialized, itemConfig*/ 12) {
    			{
    				if (isInitialized && prevOptions !== options && options.length) {
    					const ivalue = fieldInit('value', options || null, itemConfig);
    					const ilabel = fieldInit('label', options || null, itemConfig);
    					if (!valueField && currentValueField !== ivalue) $$invalidate(64, itemConfig.valueField = $$invalidate(20, currentValueField = ivalue), itemConfig);
    					if (!labelField && currentLabelField !== ilabel) $$invalidate(64, itemConfig.labelField = $$invalidate(21, currentLabelField = ilabel), itemConfig);
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*labelAsValue*/ 268435456) {
    			{
    				$$invalidate(64, itemConfig.labelAsValue = labelAsValue, itemConfig);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*selectedOptions, multiple, currentLabelField, currentValueField*/ 7340033 | $$self.$$.dirty[2] & /*itemConfig, prevSelection*/ 20) {
    			{
    				const _selectionArray = selectedOptions.map(opt => {
    					const obj = {};
    					itemConfig.optionProps.forEach(prop => obj[prop] = opt[prop]);
    					return obj;
    				});

    				const _unifiedSelection = multiple
    				? _selectionArray
    				: _selectionArray.length ? _selectionArray[0] : null;

    				const valueProp = itemConfig.labelAsValue
    				? currentLabelField
    				: currentValueField;

    				$$invalidate(43, value = multiple
    				? _unifiedSelection.map(opt => opt[valueProp])
    				: selectedOptions.length
    					? _unifiedSelection[valueProp]
    					: null);

    				$$invalidate(66, prevSelection = _unifiedSelection);
    				$$invalidate(42, selection = prevSelection);
    			}
    		}

    		if ($$self.$$.dirty[1] & /*selection*/ 2048 | $$self.$$.dirty[2] & /*prevSelection*/ 16) {
    			{
    				if (prevSelection !== selection) {
    					clearSelection();

    					if (selection) {
    						Array.isArray(selection)
    						? selection.forEach(selectOption)
    						: selectOption(selection);
    					}

    					$$invalidate(66, prevSelection = selection);
    				}
    			}
    		}

    		if ($$self.$$.dirty[1] & /*options*/ 512 | $$self.$$.dirty[2] & /*itemConfig*/ 4) {
    			$$invalidate(67, flatItems = flatList(options, itemConfig));
    		}

    		if ($$self.$$.dirty[0] & /*selectedOptions*/ 4194304 | $$self.$$.dirty[1] & /*max*/ 131072) {
    			$$invalidate(25, maxReached = max && selectedOptions.length === max);
    		}

    		if ($$self.$$.dirty[0] & /*maxReached, multiple*/ 33554433 | $$self.$$.dirty[1] & /*disableSifter, searchField, sortField*/ 234881024 | $$self.$$.dirty[2] & /*flatItems, $inputValue, itemConfig*/ 100) {
    			$$invalidate(24, availableItems = maxReached
    			? []
    			: filterList(flatItems, disableSifter ? null : $inputValue, multiple ? selectedKeys : false, searchField, sortField, itemConfig));
    		}

    		if ($$self.$$.dirty[0] & /*creatable, availableItems*/ 16781312 | $$self.$$.dirty[2] & /*$inputValue*/ 64) {
    			currentListLength = creatable && $inputValue
    			? availableItems.length
    			: availableItems.length - 1;
    		}

    		if ($$self.$$.dirty[0] & /*availableItems, creatable*/ 16781312 | $$self.$$.dirty[2] & /*$inputValue, itemConfig*/ 68) {
    			$$invalidate(23, listIndex = indexList(availableItems, creatable && $inputValue, itemConfig));
    		}

    		if ($$self.$$.dirty[0] & /*dropdownActiveIndex, listIndex*/ 8912896) {
    			{
    				if (dropdownActiveIndex === null) {
    					$$invalidate(19, dropdownActiveIndex = listIndex.first);
    				} else if (dropdownActiveIndex > listIndex.last) {
    					$$invalidate(19, dropdownActiveIndex = listIndex.last);
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*maxReached, availableItems*/ 50331648 | $$self.$$.dirty[1] & /*max, fetch*/ 132096 | $$self.$$.dirty[2] & /*$inputValue*/ 64) {
    			$$invalidate(31, listMessage = maxReached
    			? config.i18n.max(max)
    			: $inputValue.length && availableItems.length === 0
    				? config.i18n.nomatch
    				: fetch ? config.i18n.fetchBefore : config.i18n.empty);
    		}

    		if ($$self.$$.dirty[0] & /*currentLabelField*/ 2097152 | $$self.$$.dirty[1] & /*renderer*/ 32768) {
    			$$invalidate(30, itemRenderer = typeof renderer === 'function'
    			? renderer
    			: formatterList[renderer] || formatterList.default.bind({ label: currentLabelField }));
    		}
    	};

    	return [
    		multiple,
    		disabled,
    		name,
    		required,
    		hasAnchor,
    		disabledField,
    		placeholder,
    		searchable,
    		clearable,
    		disableHighlight,
    		resetOnBlur,
    		collapseSelection,
    		creatable,
    		lazyDropdown,
    		virtualList,
    		vlHeight,
    		vlItemSize,
    		className,
    		style,
    		dropdownActiveIndex,
    		currentValueField,
    		currentLabelField,
    		selectedOptions,
    		listIndex,
    		availableItems,
    		maxReached,
    		refDropdown,
    		refControl,
    		isFetchingData,
    		alreadyCreated,
    		itemRenderer,
    		listMessage,
    		inputValue,
    		hasFocus,
    		hasDropdownOpened,
    		onSelect,
    		onDeselect,
    		onHover,
    		onKeyDown,
    		onPaste,
    		options,
    		fetch,
    		selection,
    		value,
    		valueField,
    		labelField,
    		renderer,
    		selectOnTab,
    		max,
    		creatablePrefix,
    		allowEditing,
    		keepCreated,
    		delimiter,
    		fetchMode,
    		fetchCallback,
    		fetchResetOnBlur,
    		searchField,
    		sortField,
    		disableSifter,
    		labelAsValue,
    		focus,
    		getSelection,
    		setSelection,
    		clearByParent,
    		itemConfig,
    		isInitialized,
    		prevSelection,
    		flatItems,
    		$inputValue,
    		slots,
    		control_binding,
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
    			instance$a,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				name: 2,
    				required: 3,
    				hasAnchor: 4,
    				disabled: 1,
    				options: 40,
    				valueField: 44,
    				labelField: 45,
    				disabledField: 5,
    				placeholder: 6,
    				searchable: 7,
    				clearable: 8,
    				renderer: 46,
    				disableHighlight: 9,
    				selectOnTab: 47,
    				resetOnBlur: 10,
    				multiple: 0,
    				max: 48,
    				collapseSelection: 11,
    				creatable: 12,
    				creatablePrefix: 49,
    				allowEditing: 50,
    				keepCreated: 51,
    				delimiter: 52,
    				fetch: 41,
    				fetchMode: 53,
    				fetchCallback: 54,
    				fetchResetOnBlur: 55,
    				lazyDropdown: 13,
    				virtualList: 14,
    				vlHeight: 15,
    				vlItemSize: 16,
    				searchField: 56,
    				sortField: 57,
    				disableSifter: 58,
    				class: 17,
    				style: 18,
    				selection: 42,
    				value: 43,
    				labelAsValue: 59,
    				focus: 60,
    				getSelection: 61,
    				setSelection: 62,
    				clearByParent: 63
    			},
    			null,
    			[-1, -1, -1, -1]
    		);
    	}

    	get focus() {
    		return this.$$.ctx[60];
    	}

    	get getSelection() {
    		return this.$$.ctx[61];
    	}

    	get setSelection() {
    		return this.$$.ctx[62];
    	}

    	get clearByParent() {
    		return this.$$.ctx[63];
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

    /* docs\src\01-basic.svelte generated by Svelte v3.43.1 */

    function create_fragment$a(ctx) {
    	let svelecte;
    	let updating_selection;
    	let updating_value;
    	let t0;
    	let div0;
    	let t1;
    	let code0;
    	let t3;
    	let b0;
    	let t4_value = JSON.stringify(/*selection*/ ctx[0]) + "";
    	let t4;
    	let t5;
    	let div1;
    	let t6;
    	let code1;
    	let t8;
    	let b1;
    	let t9;
    	let current;

    	function svelecte_selection_binding(value) {
    		/*svelecte_selection_binding*/ ctx[3](value);
    	}

    	function svelecte_value_binding(value) {
    		/*svelecte_value_binding*/ ctx[4](value);
    	}

    	let svelecte_props = {
    		options: /*options*/ ctx[2],
    		placeholder: "Select country"
    	};

    	if (/*selection*/ ctx[0] !== void 0) {
    		svelecte_props.selection = /*selection*/ ctx[0];
    	}

    	if (/*value*/ ctx[1] !== void 0) {
    		svelecte_props.value = /*value*/ ctx[1];
    	}

    	svelecte = new Svelecte({ props: svelecte_props });
    	binding_callbacks.push(() => bind(svelecte, 'selection', svelecte_selection_binding));
    	binding_callbacks.push(() => bind(svelecte, 'value', svelecte_value_binding));

    	return {
    		c() {
    			create_component(svelecte.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			t1 = text("Current ");
    			code0 = element("code");
    			code0.textContent = "selection";
    			t3 = text(" value: ");
    			b0 = element("b");
    			t4 = text(t4_value);
    			t5 = space();
    			div1 = element("div");
    			t6 = text("Current ");
    			code1 = element("code");
    			code1.textContent = "value";
    			t8 = text(" value: ");
    			b1 = element("b");
    			t9 = text(/*value*/ ctx[1]);
    		},
    		m(target, anchor) {
    			mount_component(svelecte, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div0, anchor);
    			append(div0, t1);
    			append(div0, code0);
    			append(div0, t3);
    			append(div0, b0);
    			append(b0, t4);
    			insert(target, t5, anchor);
    			insert(target, div1, anchor);
    			append(div1, t6);
    			append(div1, code1);
    			append(div1, t8);
    			append(div1, b1);
    			append(b1, t9);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const svelecte_changes = {};

    			if (!updating_selection && dirty & /*selection*/ 1) {
    				updating_selection = true;
    				svelecte_changes.selection = /*selection*/ ctx[0];
    				add_flush_callback(() => updating_selection = false);
    			}

    			if (!updating_value && dirty & /*value*/ 2) {
    				updating_value = true;
    				svelecte_changes.value = /*value*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			svelecte.$set(svelecte_changes);
    			if ((!current || dirty & /*selection*/ 1) && t4_value !== (t4_value = JSON.stringify(/*selection*/ ctx[0]) + "")) set_data(t4, t4_value);
    			if (!current || dirty & /*value*/ 2) set_data(t9, /*value*/ ctx[1]);
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
    			if (detaching) detach(t5);
    			if (detaching) detach(div1);
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let options = dataset.countries();
    	let selection = null;
    	let value = null;

    	function svelecte_selection_binding(value) {
    		selection = value;
    		$$invalidate(0, selection);
    	}

    	function svelecte_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(1, value);
    	}

    	return [selection, value, options, svelecte_selection_binding, svelecte_value_binding];
    }

    class _01_basic extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, {});
    	}
    }

    /* docs\src\02-basicPlain.svelte generated by Svelte v3.43.1 */

    function create_fragment$9(ctx) {
    	let svelecte;
    	let updating_selection;
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

    	function svelecte_selection_binding(value) {
    		/*svelecte_selection_binding*/ ctx[4](value);
    	}

    	function svelecte_value_binding(value) {
    		/*svelecte_value_binding*/ ctx[5](value);
    	}

    	let svelecte_props = {
    		options: /*options*/ ctx[3],
    		labelAsValue: /*labelAsValue*/ ctx[0],
    		placeholder: "Select country"
    	};

    	if (/*selection*/ ctx[1] !== void 0) {
    		svelecte_props.selection = /*selection*/ ctx[1];
    	}

    	if (/*value*/ ctx[2] !== void 0) {
    		svelecte_props.value = /*value*/ ctx[2];
    	}

    	svelecte = new Svelecte({ props: svelecte_props });
    	binding_callbacks.push(() => bind(svelecte, 'selection', svelecte_selection_binding));
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
    			code0.textContent = "selection";
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

    			if (!updating_selection && dirty & /*selection*/ 2) {
    				updating_selection = true;
    				svelecte_changes.selection = /*selection*/ ctx[1];
    				add_flush_callback(() => updating_selection = false);
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

    function instance$8($$self, $$props, $$invalidate) {
    	let options = dataset.countries().map(opt => opt.text);
    	let labelAsValue = false;
    	let selection = null;
    	let value = null;
    	const $$binding_groups = [[]];

    	function svelecte_selection_binding(value) {
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
    		svelecte_selection_binding,
    		svelecte_value_binding,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler
    	];
    }

    class _02_basicPlain extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$8, create_fragment$9, safe_not_equal, {});
    	}
    }

    /* docs\src\03-groups.svelte generated by Svelte v3.43.1 */

    function create_fragment$8(ctx) {
    	let svelecte;
    	let current;

    	svelecte = new Svelecte({
    			props: { options: dataset.countryGroups() }
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

    class _03_groups extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, null, create_fragment$8, safe_not_equal, {});
    	}
    }

    /* docs\src\04-item-rendering.svelte generated by Svelte v3.43.1 */

    function create_fragment$7(ctx) {
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

    function instance$7($$self) {
    	let options = dataset.colors();
    	addFormatter('color-blocks', colorRenderer);
    	return [options];
    }

    class _04_item_rendering extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});
    	}
    }

    /* docs\src\05-slot.svelte generated by Svelte v3.43.1 */

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

    function create_fragment$6(ctx) {
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

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});
    	}
    }

    /* docs\src\06-fetch.svelte generated by Svelte v3.43.1 */

    function create_fragment$5(ctx) {
    	let svelecte;
    	let updating_selection;
    	let t0;
    	let div;
    	let b;
    	let t2;
    	let span;
    	let label0;
    	let input0;
    	let t3;
    	let t4;
    	let label1;
    	let input1;
    	let t5;
    	let t6;
    	let pre;
    	let t7_value = JSON.stringify(/*selectionWork*/ ctx[2]) + "";
    	let t7;
    	let current;
    	let mounted;
    	let dispose;

    	function svelecte_selection_binding(value) {
    		/*svelecte_selection_binding*/ ctx[4](value);
    	}

    	let svelecte_props = {
    		options: /*initialOptions*/ ctx[3],
    		resetOnBlur: /*resetOnBlur*/ ctx[0],
    		fetchResetOnBlur: /*fetchResetOnBlur*/ ctx[1],
    		multiple: true,
    		placeholder: "Start typing ('re' for example)",
    		fetch: "https://jsonplaceholder.typicode.com/users/?email_like=[query]"
    	};

    	if (/*selectionWork*/ ctx[2] !== void 0) {
    		svelecte_props.selection = /*selectionWork*/ ctx[2];
    	}

    	svelecte = new Svelecte({ props: svelecte_props });
    	binding_callbacks.push(() => bind(svelecte, 'selection', svelecte_selection_binding));

    	return {
    		c() {
    			create_component(svelecte.$$.fragment);
    			t0 = space();
    			div = element("div");
    			b = element("b");
    			b.textContent = "Selected:";
    			t2 = space();
    			span = element("span");
    			label0 = element("label");
    			input0 = element("input");
    			t3 = text(" Reset on blur");
    			t4 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t5 = text(" Reset search results on empty input");
    			t6 = space();
    			pre = element("pre");
    			t7 = text(t7_value);
    			attr(input0, "type", "checkbox");
    			attr(input0, "name", "");
    			attr(input0, "id", "rob");
    			attr(label0, "for", "rob");
    			attr(label0, "class", "mr-2");
    			attr(input1, "type", "checkbox");
    			attr(input1, "name", "");
    			attr(input1, "id", "frob");
    			attr(label1, "for", "frob");
    			attr(span, "class", "float-right");
    			attr(pre, "class", "mt-1");
    		},
    		m(target, anchor) {
    			mount_component(svelecte, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, div, anchor);
    			append(div, b);
    			append(div, t2);
    			append(div, span);
    			append(span, label0);
    			append(label0, input0);
    			input0.checked = /*resetOnBlur*/ ctx[0];
    			append(label0, t3);
    			append(span, t4);
    			append(span, label1);
    			append(label1, input1);
    			input1.checked = /*fetchResetOnBlur*/ ctx[1];
    			append(label1, t5);
    			append(div, t6);
    			append(div, pre);
    			append(pre, t7);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(input0, "change", /*input0_change_handler*/ ctx[5]),
    					listen(input1, "change", /*input1_change_handler*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			const svelecte_changes = {};
    			if (dirty & /*resetOnBlur*/ 1) svelecte_changes.resetOnBlur = /*resetOnBlur*/ ctx[0];
    			if (dirty & /*fetchResetOnBlur*/ 2) svelecte_changes.fetchResetOnBlur = /*fetchResetOnBlur*/ ctx[1];

    			if (!updating_selection && dirty & /*selectionWork*/ 4) {
    				updating_selection = true;
    				svelecte_changes.selection = /*selectionWork*/ ctx[2];
    				add_flush_callback(() => updating_selection = false);
    			}

    			svelecte.$set(svelecte_changes);

    			if (dirty & /*resetOnBlur*/ 1) {
    				input0.checked = /*resetOnBlur*/ ctx[0];
    			}

    			if (dirty & /*fetchResetOnBlur*/ 2) {
    				input1.checked = /*fetchResetOnBlur*/ ctx[1];
    			}

    			if ((!current || dirty & /*selectionWork*/ 4) && t7_value !== (t7_value = JSON.stringify(/*selectionWork*/ ctx[2]) + "")) set_data(t7, t7_value);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let resetOnBlur = true;
    	let fetchResetOnBlur = true;

    	let initialOptions = [
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

    	let selectionWork = [initialOptions[0]];

    	function svelecte_selection_binding(value) {
    		selectionWork = value;
    		$$invalidate(2, selectionWork);
    	}

    	function input0_change_handler() {
    		resetOnBlur = this.checked;
    		$$invalidate(0, resetOnBlur);
    	}

    	function input1_change_handler() {
    		fetchResetOnBlur = this.checked;
    		$$invalidate(1, fetchResetOnBlur);
    	}

    	return [
    		resetOnBlur,
    		fetchResetOnBlur,
    		selectionWork,
    		initialOptions,
    		svelecte_selection_binding,
    		input0_change_handler,
    		input1_change_handler
    	];
    }

    class _06_fetch extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* docs\src\07-playground.svelte generated by Svelte v3.43.1 */

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

    function create_fragment$4(ctx) {
    	let div7;
    	let div1;
    	let h4;
    	let t1;
    	let div0;
    	let svelecte0;
    	let updating_selection;
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
    	let updating_selection_1;
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
    	const svelecte0_spread_levels = [/*settings*/ ctx[19], { name: "select" }];

    	function svelecte0_selection_binding(value) {
    		/*svelecte0_selection_binding*/ ctx[29](value);
    	}

    	let svelecte0_props = {
    		$$slots: { icon: [create_icon_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < svelecte0_spread_levels.length; i += 1) {
    		svelecte0_props = assign(svelecte0_props, svelecte0_spread_levels[i]);
    	}

    	if (/*myValue*/ ctx[3] !== void 0) {
    		svelecte0_props.selection = /*myValue*/ ctx[3];
    	}

    	svelecte0 = new Svelecte({ props: svelecte0_props });
    	binding_callbacks.push(() => bind(svelecte0, 'selection', svelecte0_selection_binding));
    	/*svelecte0_binding*/ ctx[30](svelecte0);

    	function svelecte1_selection_binding(value) {
    		/*svelecte1_selection_binding*/ ctx[36](value);
    	}

    	let svelecte1_props = {
    		options: /*optionsList*/ ctx[22],
    		style: "width: 195px"
    	};

    	if (/*dataSrc*/ ctx[0] !== void 0) {
    		svelecte1_props.selection = /*dataSrc*/ ctx[0];
    	}

    	svelecte1 = new Svelecte({ props: svelecte1_props });
    	binding_callbacks.push(() => bind(svelecte1, 'selection', svelecte1_selection_binding));
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
    			? get_spread_update(svelecte0_spread_levels, [get_spread_object(/*settings*/ ctx[19]), svelecte0_spread_levels[1]])
    			: {};

    			if (dirty[0] & /*slot*/ 1048576 | dirty[2] & /*$$scope*/ 8192) {
    				svelecte0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selection && dirty[0] & /*myValue*/ 8) {
    				updating_selection = true;
    				svelecte0_changes.selection = /*myValue*/ ctx[3];
    				add_flush_callback(() => updating_selection = false);
    			}

    			svelecte0.$set(svelecte0_changes);
    			if ((!current || dirty[0] & /*myValue*/ 8) && t3_value !== (t3_value = JSON.stringify(/*myValue*/ ctx[3]) + "")) set_data(t3, t3_value);

    			if (dirty[0] & /*isFlexWidth*/ 64) {
    				toggle_class(div0, "flexible-svelecte", /*isFlexWidth*/ ctx[6]);
    			}

    			if (dirty[0] & /*disabled*/ 4096) {
    				input0.checked = /*disabled*/ ctx[12];
    			}

    			if (dirty[0] & /*virtualList*/ 262144) {
    				input1.checked = /*virtualList*/ ctx[18];
    			}

    			const svelecte1_changes = {};

    			if (!updating_selection_1 && dirty[0] & /*dataSrc*/ 1) {
    				updating_selection_1 = true;
    				svelecte1_changes.selection = /*dataSrc*/ ctx[0];
    				add_flush_callback(() => updating_selection_1 = false);
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

    function instance$4($$self, $$props, $$invalidate) {
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
    			cmp.setSelection([countries[2], countries[7]]);
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

    	function svelecte0_selection_binding(value) {
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

    	function svelecte1_selection_binding(value) {
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
    		svelecte0_selection_binding,
    		svelecte0_binding,
    		change_handler,
    		input0_change_handler,
    		change_handler_1,
    		input1_change_handler,
    		click_handler,
    		svelecte1_selection_binding,
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {}, null, [-1, -1, -1]);
    	}
    }

    const OPTION_LIST = [
      'options', 'value',
      // form-related
      'name', 'required', 'disabled',
      // basic
      'value-field', 'label-field', 'disabled-field', 'placeholder',
      // UI, UX
      'searchable', 'clearable', 'renderer', 'disable-highlight', 'select-on-tab', 'reset-on-blur',
      // multiple
      'multiple', 'max', 'collapse-selection',
      // creating
      'creatable', 'creatablePrefix', 'allow-editing', 'keepCreated', 'delimiter',
      // remote
      'fetch', 'fetch-reset-on-blur',
      // perf & virtual list
      'lazy-dropdown', 'virtual-list', 'vl-height', 'vl-item-size',
      // sifter
      'search-field', 'sort-field', 'disable-sifter',
      // others
      'label-as-value'
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
        case 'value':
          return value ? value.split(',').map(item => {
            const _v = parseInt(item);
            return isNaN(_v) ? item : _v;
          }) : '';
        case 'renderer':
          return value || 'default';
        case 'searchable':
        case 'clearable':
        case 'disable-highlight':
        case 'select-on-tab':
        case 'reset-on-blur':
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

        /** ************************************ public API */
        const baseProps = {
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
              this.setAttribute('value', Array.isArray(value) ? value.join(',') : value);
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
              console.log('⚠ this setter has no effect after component has been created');
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
        const boolProps = ['searchable','clearable','disable-highlight','select-on-tab','reset-on-blur',
          'multiple','collapse-selection','creatable','allow-editing','keep-created','fetch-reset-on-blur',
          'virtual-list','disable-sifter','label-as-value'
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
                  this.svelecte.$set({ [formatted]: value });
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
            newValue ? this.svelecte.setSelection(formatValue(name, newValue), volatileEmitChange) : this.svelecte.clearByParent(this.parent ? true : false);
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
          console.log('prop', name, oldValue, newValue);
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
            props[formatProp(attr)] = formatValue(attr, this.getAttribute(attr));
          }
        }
        if (this.hasAttribute('class')) {
          props.class = this.getAttribute('class');
        }
        if (this.hasAttribute('parent')) {
          delete props['fetch'];
          props.disabled = true;
          this.parent = document.getElementById(this.getAttribute('parent'));
          if (!this.parent.value && this.svelecte) {
            return;
          }      this.parentCallback = e => {
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
          this.setAttribute('value', Array.isArray(value) ? value.join(',') : value);
          this.dispatchEvent(e);
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

    /* docs\src\08-custom-element.svelte generated by Svelte v3.43.1 */

    function create_fragment$3(ctx) {
    	let div;
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
    			div = element("div");
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
    			insert(target, div, anchor);
    			append(div, form);
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
    			/*div_binding*/ ctx[6](div);

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
    			if (detaching) detach(div);
    			/*div_binding*/ ctx[6](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
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

    	function div_binding($$value) {
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
    		div_binding
    	];
    }

    class _08_custom_element extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
    	}
    }

    /* docs\src\09-custom-dependent.svelte generated by Svelte v3.43.1 */

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

    function create_fragment$2(ctx) {
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
    			set_custom_element_data(el_svelecte0, "required", "");
    			set_custom_element_data(el_svelecte1, "name", "child_value");
    			set_custom_element_data(el_svelecte1, "parent", "is-parent");
    			set_custom_element_data(el_svelecte1, "required", "");
    			set_custom_element_data(el_svelecte1, "placeholder", "Pick from child select");
    			set_custom_element_data(el_svelecte1, "fetch", "https://jsonplaceholder.typicode.com/[parent]");
    			attr(select, "id", "anchored");
    			attr(select, "name", "demo");
    			select.multiple = true;
    			set_custom_element_data(el_svelecte2, "options", `[{"id":"posts","label":"Posts", "prop": "Posts"},{"id":"users","label":"Users", "prop": "Users"},{"id":"comments","label":"Comments", "prop": "Comment"}]`);
    			set_style(el_svelecte2, "margin-bottom", "0");
    			set_custom_element_data(el_svelecte2, "lazy-dropdown", "false");
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
    					listen(select, "change", /*change_handler*/ ctx[2]),
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

    	const change_handler = e => console.log(e.target.selectedOptions);
    	return [payload, onSubmit, change_handler];
    }

    class _09_custom_dependent extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
    	}
    }

    /* docs\src\10-custom-remote.svelte generated by Svelte v3.43.1 */

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

    function create_fragment$1(ctx) {
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
    				dispose = listen(form, "submit", prevent_default(/*onSubmit*/ ctx[1]));
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
    			dispose();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
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

    	return [payload, onSubmit];
    }

    class _10_custom_remote extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* docs\src\11-vue.svelte generated by Svelte v3.43.1 */

    function create_fragment(ctx) {
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

    function instance($$self) {
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
    					template: `<div>
          <h6>Vue 2 example</h6>
          <div>
            <el-svelecte :options="opts"  @change="onChange" @createoption="show"
              :value="selected"
              :placeholder="placeholder"
              multiple creatable
              label-as-value
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
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    [_01_basic, _02_basicPlain, _03_groups, _04_item_rendering, _05_slot, _06_fetch, _07_playground, _08_custom_element, _09_custom_dependent, _10_custom_remote, _11_vue]
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
//# sourceMappingURL=app.js.map
