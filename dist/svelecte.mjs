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
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
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
class HtmlTag {
    constructor(anchor = null) {
        this.a = anchor;
        this.e = this.n = null;
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            this.e = element(target.nodeName);
            this.t = target;
            this.h(html);
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
const itemHtml = document.createElement('div');
itemHtml.className = 'sv-item-content';

function highlightSearch(item, isSelected, $inputValue, formatter) {
  itemHtml.innerHTML = formatter ? formatter(item, isSelected) : item;
  if ($inputValue == '' || item.isSelected) return itemHtml.outerHTML;

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
      const endbit = middlebit.splitText(regex.length);
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
  valueField: null,
  labelField: null,
  required: false,
  placeholder: 'Select',
  searchable: true,
  disabled: false,
  // ui
  clearable: false,
  selectOnTab: false,
  // multi
  multiple: false,
  max: 0,
  collapseSelection: false, // enable collapsible multiple selection
  // html
  name: null, // if name is defined, <select> element is created as well
  // create
  creatable: false,
  creatablePrefix: '*',
  delimiter: ',',
  // virtual list
  virtualList: false,
  vlItemSize: null,
  vlHeight: null,
  // sifter
  sortRemoteResults: true,
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
  const exclude = ['isSelected', 'isDisabled' ,'selected', 'disabled', '$isGroupHeader', '$isGroupItem'];
  return Object.keys(object).filter(prop => !exclude.includes(prop));
}

function filterList(options, inputValue, excludeSelected, sifterSearchField, sifterSortField, config) {
  if (!inputValue) {
    if (excludeSelected) {
      options = options
        .filter(opt => !opt.isSelected)
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
    return options;
  }
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

/* src\Svelecte\components\Input.svelte generated by Svelte v3.25.0 */

function create_fragment(ctx) {
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
			t1 = text(/*shadowText*/ ctx[7]);
			attr(input, "type", "text");
			attr(input, "class", "inputBox svelte-mtw92l");
			input.disabled = /*disabled*/ ctx[1];
			input.readOnly = input_readonly_value = !/*searchable*/ ctx[0];
			attr(input, "style", /*inputStyle*/ ctx[9]);
			attr(input, "placeholder", /*placeholderText*/ ctx[6]);
			attr(div, "class", "shadow-text svelte-mtw92l");
			add_render_callback(() => /*div_elementresize_handler*/ ctx[21].call(div));
		},
		m(target, anchor) {
			insert(target, input, anchor);
			/*input_binding*/ ctx[19](input);
			set_input_value(input, /*$inputValue*/ ctx[8]);
			insert(target, t0, anchor);
			insert(target, div, anchor);
			append(div, t1);
			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[21].bind(div));

			if (!mounted) {
				dispose = [
					listen(input, "input", /*input_input_handler*/ ctx[20]),
					listen(input, "focus", /*focus_handler*/ ctx[16]),
					listen(input, "blur", /*blur_handler*/ ctx[17]),
					listen(input, "keydown", /*onKeyDown*/ ctx[10]),
					listen(input, "keyup", /*onKeyUp*/ ctx[11]),
					listen(input, "paste", /*paste_handler*/ ctx[18])
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

			if (dirty & /*inputStyle*/ 512) {
				attr(input, "style", /*inputStyle*/ ctx[9]);
			}

			if (dirty & /*placeholderText*/ 64) {
				attr(input, "placeholder", /*placeholderText*/ ctx[6]);
			}

			if (dirty & /*$inputValue*/ 256 && input.value !== /*$inputValue*/ ctx[8]) {
				set_input_value(input, /*$inputValue*/ ctx[8]);
			}

			if (dirty & /*shadowText*/ 128) set_data(t1, /*shadowText*/ ctx[7]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(input);
			/*input_binding*/ ctx[19](null);
			if (detaching) detach(t0);
			if (detaching) detach(div);
			div_resize_listener();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let $inputValue,
		$$unsubscribe_inputValue = noop,
		$$subscribe_inputValue = () => ($$unsubscribe_inputValue(), $$unsubscribe_inputValue = subscribe(inputValue, $$value => $$invalidate(8, $inputValue = $$value)), inputValue);

	let $hasDropdownOpened,
		$$unsubscribe_hasDropdownOpened = noop,
		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(25, $hasDropdownOpened = $$value)), hasDropdownOpened);

	$$self.$$.on_destroy.push(() => $$unsubscribe_inputValue());
	$$self.$$.on_destroy.push(() => $$unsubscribe_hasDropdownOpened());
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
		disableEventBubble = ["Enter", "Escape"].includes(e.key) && $hasDropdownOpened;
		dispatch("keydown", e);
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
		bubble($$self, event);
	}

	function blur_handler(event) {
		bubble($$self, event);
	}

	function paste_handler(event) {
		bubble($$self, event);
	}

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			inputRef = $$value;
			$$invalidate(4, inputRef);
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
		if ("placeholder" in $$props) $$invalidate(13, placeholder = $$props.placeholder);
		if ("searchable" in $$props) $$invalidate(0, searchable = $$props.searchable);
		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
		if ("multiple" in $$props) $$invalidate(14, multiple = $$props.multiple);
		if ("inputValue" in $$props) $$subscribe_inputValue($$invalidate(2, inputValue = $$props.inputValue));
		if ("hasDropdownOpened" in $$props) $$subscribe_hasDropdownOpened($$invalidate(3, hasDropdownOpened = $$props.hasDropdownOpened));
		if ("selectedOptions" in $$props) $$invalidate(15, selectedOptions = $$props.selectedOptions);
	};

	let isSingleFilled;
	let placeholderText;
	let shadowText;
	let widthAddition;
	let inputStyle;

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*selectedOptions, multiple*/ 49152) {
			 $$invalidate(23, isSingleFilled = selectedOptions.length > 0 && multiple === false);
		}

		if ($$self.$$.dirty & /*selectedOptions, placeholder*/ 40960) {
			 $$invalidate(6, placeholderText = selectedOptions.length > 0 ? "" : placeholder);
		}

		if ($$self.$$.dirty & /*$inputValue, placeholderText*/ 320) {
			 $$invalidate(7, shadowText = $inputValue || placeholderText);
		}

		if ($$self.$$.dirty & /*selectedOptions*/ 32768) {
			 $$invalidate(24, widthAddition = selectedOptions.length === 0 ? 19 : 12);
		}

		if ($$self.$$.dirty & /*isSingleFilled, shadowWidth, widthAddition*/ 25165856) {
			 $$invalidate(9, inputStyle = `width: ${isSingleFilled ? 2 : shadowWidth + widthAddition}px`);
		}
	};

	return [
		searchable,
		disabled,
		inputValue,
		hasDropdownOpened,
		inputRef,
		shadowWidth,
		placeholderText,
		shadowText,
		$inputValue,
		inputStyle,
		onKeyDown,
		onKeyUp,
		focus,
		placeholder,
		multiple,
		selectedOptions,
		focus_handler,
		blur_handler,
		paste_handler,
		input_binding,
		input_input_handler,
		div_elementresize_handler
	];
}

class Input extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
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

/* src\Svelecte\components\Item.svelte generated by Svelte v3.25.0 */

function create_else_block(ctx) {
	let div;
	let html_tag;
	let raw_value = highlightSearch(/*item*/ ctx[2], /*isSelected*/ ctx[3], /*inputValue*/ ctx[0], /*formatter*/ ctx[6]) + "";
	let t;
	let div_title_value;
	let itemActions_action;
	let mounted;
	let dispose;
	let if_block = /*isSelected*/ ctx[3] && /*isMultiple*/ ctx[5] && create_if_block_1();

	return {
		c() {
			div = element("div");
			t = space();
			if (if_block) if_block.c();
			html_tag = new HtmlTag(t);
			attr(div, "class", "sv-item");
			attr(div, "title", div_title_value = /*item*/ ctx[2]._created ? "Created item" : "");
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
					listen(div, "select", /*select_handler*/ ctx[8]),
					listen(div, "deselect", /*deselect_handler*/ ctx[9]),
					listen(div, "hover", /*hover_handler*/ ctx[10])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*item, isSelected, inputValue, formatter*/ 77 && raw_value !== (raw_value = highlightSearch(/*item*/ ctx[2], /*isSelected*/ ctx[3], /*inputValue*/ ctx[0], /*formatter*/ ctx[6]) + "")) html_tag.p(raw_value);

			if (/*isSelected*/ ctx[3] && /*isMultiple*/ ctx[5]) {
				if (if_block) ; else {
					if_block = create_if_block_1();
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*item*/ 4 && div_title_value !== (div_title_value = /*item*/ ctx[2]._created ? "Created item" : "")) {
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

// (16:0) {#if item.$isGroupHeader}
function create_if_block(ctx) {
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
				dispose = listen(div, "mousedown", prevent_default(/*mousedown_handler*/ ctx[7]));
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

// (28:0) {#if isSelected && isMultiple}
function create_if_block_1(ctx) {
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

function create_fragment$1(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*item*/ ctx[2].$isGroupHeader) return create_if_block;
		return create_else_block;
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

function instance$1($$self, $$props, $$invalidate) {
	let { inputValue } = $$props; // value only
	let { index = -1 } = $$props;
	let { item = {} } = $$props;
	let { isSelected = false } = $$props;
	let { isDisabled = false } = $$props;
	let { isMultiple = false } = $$props;
	let { formatter = null } = $$props;

	function mousedown_handler(event) {
		bubble($$self, event);
	}

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
		if ("inputValue" in $$props) $$invalidate(0, inputValue = $$props.inputValue);
		if ("index" in $$props) $$invalidate(1, index = $$props.index);
		if ("item" in $$props) $$invalidate(2, item = $$props.item);
		if ("isSelected" in $$props) $$invalidate(3, isSelected = $$props.isSelected);
		if ("isDisabled" in $$props) $$invalidate(4, isDisabled = $$props.isDisabled);
		if ("isMultiple" in $$props) $$invalidate(5, isMultiple = $$props.isMultiple);
		if ("formatter" in $$props) $$invalidate(6, formatter = $$props.formatter);
	};

	return [
		inputValue,
		index,
		item,
		isSelected,
		isDisabled,
		isMultiple,
		formatter,
		mousedown_handler,
		select_handler,
		deselect_handler,
		hover_handler
	];
}

class Item extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
			inputValue: 0,
			index: 1,
			item: 2,
			isSelected: 3,
			isDisabled: 4,
			isMultiple: 5,
			formatter: 6
		});
	}
}

/* src\Svelecte\components\Control.svelte generated by Svelte v3.25.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[31] = list[i];
	return child_ctx;
}

const get_icon_slot_changes = dirty => ({});
const get_icon_slot_context = ctx => ({});

// (67:4) {#if selectedOptions.length }
function create_if_block_2(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_3, create_else_block$1];
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

// (70:6) {:else}
function create_else_block$1(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*selectedOptions*/ ctx[10];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
			if (dirty[0] & /*renderer, selectedOptions, multiple, $inputValue*/ 66596) {
				each_value = /*selectedOptions*/ ctx[10];
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

// (68:6) {#if multiple && collapseSelection && doCollapse}
function create_if_block_3(ctx) {
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

// (71:6) {#each selectedOptions as opt}
function create_each_block(ctx) {
	let item;
	let current;

	item = new Item({
			props: {
				formatter: /*renderer*/ ctx[2],
				item: /*opt*/ ctx[31],
				isSelected: true,
				isMultiple: /*multiple*/ ctx[5],
				inputValue: /*$inputValue*/ ctx[16]
			}
		});

	item.$on("deselect", /*deselect_handler*/ ctx[25]);

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
			if (dirty[0] & /*selectedOptions*/ 1024) item_changes.item = /*opt*/ ctx[31];
			if (dirty[0] & /*multiple*/ 32) item_changes.isMultiple = /*multiple*/ ctx[5];
			if (dirty[0] & /*$inputValue*/ 65536) item_changes.inputValue = /*$inputValue*/ ctx[16];
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

// (88:4) {#if clearable && selectedOptions.length && !disabled}
function create_if_block_1$1(ctx) {
	let div;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<svg class="indicator-icon svelte-1b02hfu" height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>`;
			attr(div, "aria-hidden", "true");
			attr(div, "class", "indicator-container close-icon svelte-1b02hfu");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (!mounted) {
				dispose = [
					listen(div, "mousedown", prevent_default(/*mousedown_handler_1*/ ctx[24])),
					listen(div, "click", /*click_handler*/ ctx[29])
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

// (96:4) {#if clearable}
function create_if_block$1(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			attr(span, "class", "indicator-separator svelte-1b02hfu");
		},
		m(target, anchor) {
			insert(target, span, anchor);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
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
	let current;
	let mounted;
	let dispose;
	const icon_slot_template = /*#slots*/ ctx[21].icon;
	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[20], get_icon_slot_context);
	let if_block0 = /*selectedOptions*/ ctx[10].length && create_if_block_2(ctx);

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
	/*input_binding*/ ctx[26](input);
	input.$on("focus", /*onFocus*/ ctx[18]);
	input.$on("blur", /*onBlur*/ ctx[19]);
	input.$on("keydown", /*keydown_handler*/ ctx[27]);
	input.$on("paste", /*paste_handler*/ ctx[28]);
	let if_block1 = /*clearable*/ ctx[0] && /*selectedOptions*/ ctx[10].length && !/*disabled*/ ctx[3] && create_if_block_1$1(ctx);
	let if_block2 = /*clearable*/ ctx[0] && create_if_block$1();

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
			div1.innerHTML = `<svg width="20" class="indicator-icon svelte-1b02hfu" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path></svg>`;
			attr(div0, "class", "sv-content sv-input-row svelte-1b02hfu");
			toggle_class(div0, "has-multiSelection", /*multiple*/ ctx[5]);
			attr(div1, "aria-hidden", "true");
			attr(div1, "class", "indicator-container svelte-1b02hfu");
			attr(div2, "class", "indicator svelte-1b02hfu");
			toggle_class(div2, "is-loading", /*isFetchingData*/ ctx[11]);
			attr(div3, "class", "sv-control svelte-1b02hfu");
			toggle_class(div3, "is-active", /*$hasFocus*/ ctx[15]);
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
					listen(div1, "mousedown", prevent_default(/*mousedown_handler_2*/ ctx[23])),
					listen(div3, "mousedown", prevent_default(/*mousedown_handler*/ ctx[22])),
					listen(div3, "click", prevent_default(/*focusControl*/ ctx[12]))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (icon_slot) {
				if (icon_slot.p && dirty[0] & /*$$scope*/ 1048576) {
					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[20], dirty, get_icon_slot_changes, get_icon_slot_context);
				}
			}

			if (/*selectedOptions*/ ctx[10].length) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty[0] & /*selectedOptions*/ 1024) {
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
					if_block2 = create_if_block$1();
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

			if (dirty[0] & /*$hasFocus*/ 32768) {
				toggle_class(div3, "is-active", /*$hasFocus*/ ctx[15]);
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
			/*input_binding*/ ctx[26](null);
			destroy_component(input);
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let $hasFocus,
		$$unsubscribe_hasFocus = noop,
		$$subscribe_hasFocus = () => ($$unsubscribe_hasFocus(), $$unsubscribe_hasFocus = subscribe(hasFocus, $$value => $$invalidate(15, $hasFocus = $$value)), hasFocus);

	let $hasDropdownOpened,
		$$unsubscribe_hasDropdownOpened = noop,
		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(30, $hasDropdownOpened = $$value)), hasDropdownOpened);

	let $inputValue,
		$$unsubscribe_inputValue = noop,
		$$subscribe_inputValue = () => ($$unsubscribe_inputValue(), $$unsubscribe_inputValue = subscribe(inputValue, $$value => $$invalidate(16, $inputValue = $$value)), inputValue);

	$$self.$$.on_destroy.push(() => $$unsubscribe_hasFocus());
	$$self.$$.on_destroy.push(() => $$unsubscribe_hasDropdownOpened());
	$$self.$$.on_destroy.push(() => $$unsubscribe_inputValue());
	let { $$slots: slots = {}, $$scope } = $$props;
	let { clearable } = $$props;
	let { searchable } = $$props;
	let { renderer } = $$props;
	let { disabled } = $$props;
	let { placeholder } = $$props;
	let { multiple } = $$props;
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

	let doCollapse = true;
	let refInput = undefined;

	function onFocus() {
		set_store_value(hasFocus, $hasFocus = true);
		set_store_value(hasDropdownOpened, $hasDropdownOpened = true);

		setTimeout(
			() => {
				$$invalidate(13, doCollapse = false);
			},
			150
		);
	}

	function onBlur() {
		set_store_value(hasFocus, $hasFocus = false);
		set_store_value(hasDropdownOpened, $hasDropdownOpened = false);
		set_store_value(inputValue, $inputValue = ""); // reset

		setTimeout(
			() => {
				$$invalidate(13, doCollapse = true);
			},
			100
		);
	}

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
			$$invalidate(14, refInput);
		});
	}

	function keydown_handler(event) {
		bubble($$self, event);
	}

	function paste_handler(event) {
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
		if ("collapseSelection" in $$props) $$invalidate(6, collapseSelection = $$props.collapseSelection);
		if ("inputValue" in $$props) $$subscribe_inputValue($$invalidate(7, inputValue = $$props.inputValue));
		if ("hasFocus" in $$props) $$subscribe_hasFocus($$invalidate(8, hasFocus = $$props.hasFocus));
		if ("hasDropdownOpened" in $$props) $$subscribe_hasDropdownOpened($$invalidate(9, hasDropdownOpened = $$props.hasDropdownOpened));
		if ("selectedOptions" in $$props) $$invalidate(10, selectedOptions = $$props.selectedOptions);
		if ("isFetchingData" in $$props) $$invalidate(11, isFetchingData = $$props.isFetchingData);
		if ("$$scope" in $$props) $$invalidate(20, $$scope = $$props.$$scope);
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
		$hasFocus,
		$inputValue,
		dispatch,
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
				collapseSelection: 6,
				inputValue: 7,
				hasFocus: 8,
				hasDropdownOpened: 9,
				selectedOptions: 10,
				isFetchingData: 11,
				focusControl: 12
			},
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

/* src\Svelecte\dependency\VirtualList.svelte generated by Svelte v3.25.0 */
const get_footer_slot_changes = dirty => ({});
const get_footer_slot_context = ctx => ({});

const get_item_slot_changes = dirty => ({
	style: dirty[0] & /*items*/ 2,
	index: dirty[0] & /*items*/ 2
});

const get_item_slot_context = ctx => ({
	style: /*item*/ ctx[35].style,
	index: /*item*/ ctx[35].index
});

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[35] = list[i];
	return child_ctx;
}

const get_header_slot_changes = dirty => ({});
const get_header_slot_context = ctx => ({});

// (322:2) {#each items as item (item.index)}
function create_each_block$1(key_1, ctx) {
	let first;
	let current;
	const item_slot_template = /*#slots*/ ctx[17].item;
	const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[16], get_item_slot_context);

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
		p(ctx, dirty) {
			if (item_slot) {
				if (item_slot.p && dirty[0] & /*$$scope, items*/ 65538) {
					update_slot(item_slot, item_slot_template, ctx, /*$$scope*/ ctx[16], dirty, get_item_slot_changes, get_item_slot_context);
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

function create_fragment$3(ctx) {
	let div1;
	let t0;
	let div0;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t1;
	let current;
	const header_slot_template = /*#slots*/ ctx[17].header;
	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[16], get_header_slot_context);
	let each_value = /*items*/ ctx[1];
	const get_key = ctx => /*item*/ ctx[35].index;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$1(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
	}

	const footer_slot_template = /*#slots*/ ctx[17].footer;
	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[16], get_footer_slot_context);

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
			attr(div0, "style", /*innerStyle*/ ctx[3]);
			attr(div1, "class", "virtual-list-wrapper svelte-1he1ex4");
			attr(div1, "style", /*wrapperStyle*/ ctx[2]);
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

			/*div1_binding*/ ctx[18](div1);
			current = true;
		},
		p(ctx, dirty) {
			if (header_slot) {
				if (header_slot.p && dirty[0] & /*$$scope*/ 65536) {
					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[16], dirty, get_header_slot_changes, get_header_slot_context);
				}
			}

			if (dirty[0] & /*$$scope, items*/ 65538) {
				const each_value = /*items*/ ctx[1];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
				check_outros();
			}

			if (!current || dirty[0] & /*innerStyle*/ 8) {
				attr(div0, "style", /*innerStyle*/ ctx[3]);
			}

			if (footer_slot) {
				if (footer_slot.p && dirty[0] & /*$$scope*/ 65536) {
					update_slot(footer_slot, footer_slot_template, ctx, /*$$scope*/ ctx[16], dirty, get_footer_slot_changes, get_footer_slot_context);
				}
			}

			if (!current || dirty[0] & /*wrapperStyle*/ 4) {
				attr(div1, "style", /*wrapperStyle*/ ctx[2]);
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
			/*div1_binding*/ ctx[18](null);
		}
	};
}

const thirdEventArg = (() => {
	let result = false;

	try {
		const arg = Object.defineProperty({}, "passive", {
			get() {
				result = { passive: true };
				return true;
			}
		});

		window.addEventListener("testpassive", arg, arg);
		window.remove("testpassive", arg, arg);
	} catch(e) {
		
	} /* */

	return result;
})();

function instance$3($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { height } = $$props;
	let { width = "100%" } = $$props;
	let { itemCount } = $$props;
	let { itemSize } = $$props;
	let { estimatedItemSize = null } = $$props;
	let { stickyIndices = null } = $$props;
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
	let wrapperStyle = "";
	let innerStyle = "";
	refresh(); // Initial Load

	onMount(() => {
		$$invalidate(19, mounted = true);
		wrapper.addEventListener("scroll", handleScroll, thirdEventArg);

		if (scrollOffset != null) {
			scrollTo(scrollOffset);
		} else if (scrollToIndex != null) {
			scrollTo(getOffsetForIndex(scrollToIndex));
		}
	});

	onDestroy(() => {
		if (mounted) wrapper.removeEventListener("scroll", handleScroll);
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
			$$invalidate(20, state = {
				offset: scrollOffset || 0,
				scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED
			});
		} else if (typeof scrollToIndex === "number" && (scrollPropsHaveChanged || itemPropsHaveChanged)) {
			$$invalidate(20, state = {
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
			$$invalidate(2, wrapperStyle = `height:${height}px;width:${width};`);
			$$invalidate(3, innerStyle = `flex-direction:column;height:${totalSize}px;`);
		} else {
			$$invalidate(2, wrapperStyle = `height:${height};width:${width}px`);
			$$invalidate(3, innerStyle = `width:${totalSize}px;`);
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

			dispatchEvent("itemsUpdated", { startIndex: start, stopIndex: stop });
		}

		$$invalidate(1, items = updatedItems);
	}

	function scrollTo(value) {
		$$invalidate(0, wrapper[SCROLL_PROP[scrollDirection]] = value, wrapper);
	}

	function recomputeSizes(startIndex = 0) {
		styleCache = {};
		sizeAndPositionManager.resetItem(startIndex);
		refresh();
	}

	function getOffsetForIndex(index, align = scrollToAlignment, _itemCount = itemCount) {
		if (!state) return 0;

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

		$$invalidate(20, state = {
			offset,
			scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED
		});

		dispatchEvent("afterScroll", { offset, event });
	}

	function getWrapperOffset() {
		return wrapper[SCROLL_PROP[scrollDirection]];
	}

	function getEstimatedItemSize() {
		return estimatedItemSize || typeof itemSize === "number" && itemSize || 50;
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
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			wrapper = $$value;
			$$invalidate(0, wrapper);
		});
	}

	$$self.$$set = $$props => {
		if ("height" in $$props) $$invalidate(4, height = $$props.height);
		if ("width" in $$props) $$invalidate(5, width = $$props.width);
		if ("itemCount" in $$props) $$invalidate(6, itemCount = $$props.itemCount);
		if ("itemSize" in $$props) $$invalidate(7, itemSize = $$props.itemSize);
		if ("estimatedItemSize" in $$props) $$invalidate(8, estimatedItemSize = $$props.estimatedItemSize);
		if ("stickyIndices" in $$props) $$invalidate(9, stickyIndices = $$props.stickyIndices);
		if ("scrollDirection" in $$props) $$invalidate(10, scrollDirection = $$props.scrollDirection);
		if ("scrollOffset" in $$props) $$invalidate(11, scrollOffset = $$props.scrollOffset);
		if ("scrollToIndex" in $$props) $$invalidate(12, scrollToIndex = $$props.scrollToIndex);
		if ("scrollToAlignment" in $$props) $$invalidate(13, scrollToAlignment = $$props.scrollToAlignment);
		if ("overscanCount" in $$props) $$invalidate(14, overscanCount = $$props.overscanCount);
		if ("$$scope" in $$props) $$invalidate(16, $$scope = $$props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*scrollToIndex, scrollToAlignment, scrollOffset, itemCount, itemSize, estimatedItemSize*/ 14784) {
			 propsUpdated();
		}

		if ($$self.$$.dirty[0] & /*state*/ 1048576) {
			 stateUpdated();
		}

		if ($$self.$$.dirty[0] & /*mounted, height, width, stickyIndices*/ 524848) {
			 if (mounted) recomputeSizes(height); // call scroll.reset;
		}
	};

	return [
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
			instance$3,
			create_fragment$3,
			safe_not_equal,
			{
				height: 4,
				width: 5,
				itemCount: 6,
				itemSize: 7,
				estimatedItemSize: 8,
				stickyIndices: 9,
				scrollDirection: 10,
				scrollOffset: 11,
				scrollToIndex: 12,
				scrollToAlignment: 13,
				overscanCount: 14,
				recomputeSizes: 15
			},
			[-1, -1]
		);
	}

	get recomputeSizes() {
		return this.$$.ctx[15];
	}
}

/* src\Svelecte\components\Dropdown.svelte generated by Svelte v3.25.0 */

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[40] = list[i];
	child_ctx[42] = i;
	return child_ctx;
}

// (150:2) {#if items.length}
function create_if_block_3$1(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_4, create_else_block$2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*virtualList*/ ctx[6]) return 0;
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

// (171:4) {:else}
function create_else_block$2(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*items*/ ctx[4];
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
			if (dirty[0] & /*listIndex, dropdownIndex, renderer, items, $inputValue*/ 524569) {
				each_value = /*items*/ ctx[4];
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

// (151:4) {#if virtualList}
function create_if_block_4(ctx) {
	let virtuallist;
	let current;

	let virtuallist_props = {
		width: "100%",
		height: /*vl_listHeight*/ ctx[18],
		itemCount: /*items*/ ctx[4].length,
		itemSize: /*vl_itemSize*/ ctx[15],
		scrollToAlignment: "auto",
		scrollToIndex: /*items*/ ctx[4].length && /*isMounted*/ ctx[13]
		? /*dropdownIndex*/ ctx[0]
		: null,
		$$slots: {
			item: [
				create_item_slot,
				({ index, style }) => ({ 38: index, 39: style }),
				({ index, style }) => [0, (index ? 128 : 0) | (style ? 256 : 0)]
			]
		},
		$$scope: { ctx }
	};

	virtuallist = new VirtualList({ props: virtuallist_props });
	/*virtuallist_binding*/ ctx[28](virtuallist);

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
			if (dirty[0] & /*vl_listHeight*/ 262144) virtuallist_changes.height = /*vl_listHeight*/ ctx[18];
			if (dirty[0] & /*items*/ 16) virtuallist_changes.itemCount = /*items*/ ctx[4].length;
			if (dirty[0] & /*vl_itemSize*/ 32768) virtuallist_changes.itemSize = /*vl_itemSize*/ ctx[15];

			if (dirty[0] & /*items, isMounted, dropdownIndex*/ 8209) virtuallist_changes.scrollToIndex = /*items*/ ctx[4].length && /*isMounted*/ ctx[13]
			? /*dropdownIndex*/ ctx[0]
			: null;

			if (dirty[0] & /*dropdownIndex, renderer, listIndex, items, $inputValue*/ 524569 | dirty[1] & /*$$scope, style, index*/ 4480) {
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
			/*virtuallist_binding*/ ctx[28](null);
			destroy_component(virtuallist, detaching);
		}
	};
}

// (172:6) {#each items as opt, i}
function create_each_block$2(ctx) {
	let div;
	let item;
	let t;
	let div_data_pos_value;
	let current;

	item = new Item({
			props: {
				formatter: /*renderer*/ ctx[3],
				index: /*listIndex*/ ctx[8].map[/*i*/ ctx[42]],
				isDisabled: /*opt*/ ctx[40].isDisabled,
				item: /*opt*/ ctx[40],
				inputValue: /*$inputValue*/ ctx[19]
			}
		});

	item.$on("hover", /*hover_handler_1*/ ctx[29]);
	item.$on("select", /*select_handler_1*/ ctx[30]);

	return {
		c() {
			div = element("div");
			create_component(item.$$.fragment);
			t = space();
			attr(div, "data-pos", div_data_pos_value = /*listIndex*/ ctx[8].map[/*i*/ ctx[42]]);
			toggle_class(div, "sv-dd-item-active", /*listIndex*/ ctx[8].map[/*i*/ ctx[42]] === /*dropdownIndex*/ ctx[0]);
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
			if (dirty[0] & /*listIndex*/ 256) item_changes.index = /*listIndex*/ ctx[8].map[/*i*/ ctx[42]];
			if (dirty[0] & /*items*/ 16) item_changes.isDisabled = /*opt*/ ctx[40].isDisabled;
			if (dirty[0] & /*items*/ 16) item_changes.item = /*opt*/ ctx[40];
			if (dirty[0] & /*$inputValue*/ 524288) item_changes.inputValue = /*$inputValue*/ ctx[19];

			if (dirty[1] & /*$$scope*/ 4096) {
				item_changes.$$scope = { dirty, ctx };
			}

			item.$set(item_changes);

			if (!current || dirty[0] & /*listIndex*/ 256 && div_data_pos_value !== (div_data_pos_value = /*listIndex*/ ctx[8].map[/*i*/ ctx[42]])) {
				attr(div, "data-pos", div_data_pos_value);
			}

			if (dirty[0] & /*listIndex, dropdownIndex*/ 257) {
				toggle_class(div, "sv-dd-item-active", /*listIndex*/ ctx[8].map[/*i*/ ctx[42]] === /*dropdownIndex*/ ctx[0]);
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

// (160:8) <div slot="item" let:index let:style {style} class:sv-dd-item-active={index == dropdownIndex}>
function create_item_slot(ctx) {
	let div;
	let item;
	let div_style_value;
	let current;

	item = new Item({
			props: {
				formatter: /*renderer*/ ctx[3],
				index: /*listIndex*/ ctx[8].map[/*index*/ ctx[38]],
				isDisabled: /*items*/ ctx[4][/*index*/ ctx[38]].isDisabled,
				item: /*items*/ ctx[4][/*index*/ ctx[38]],
				inputValue: /*$inputValue*/ ctx[19]
			}
		});

	item.$on("hover", /*hover_handler*/ ctx[26]);
	item.$on("select", /*select_handler*/ ctx[27]);

	return {
		c() {
			div = element("div");
			create_component(item.$$.fragment);
			attr(div, "slot", "item");
			attr(div, "style", div_style_value = /*style*/ ctx[39]);
			toggle_class(div, "sv-dd-item-active", /*index*/ ctx[38] == /*dropdownIndex*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(item, div, null);
			current = true;
		},
		p(ctx, dirty) {
			const item_changes = {};
			if (dirty[0] & /*renderer*/ 8) item_changes.formatter = /*renderer*/ ctx[3];
			if (dirty[0] & /*listIndex*/ 256 | dirty[1] & /*index*/ 128) item_changes.index = /*listIndex*/ ctx[8].map[/*index*/ ctx[38]];
			if (dirty[0] & /*items*/ 16 | dirty[1] & /*index*/ 128) item_changes.isDisabled = /*items*/ ctx[4][/*index*/ ctx[38]].isDisabled;
			if (dirty[0] & /*items*/ 16 | dirty[1] & /*index*/ 128) item_changes.item = /*items*/ ctx[4][/*index*/ ctx[38]];
			if (dirty[0] & /*$inputValue*/ 524288) item_changes.inputValue = /*$inputValue*/ ctx[19];

			if (dirty[1] & /*$$scope*/ 4096) {
				item_changes.$$scope = { dirty, ctx };
			}

			item.$set(item_changes);

			if (!current || dirty[1] & /*style*/ 256 && div_style_value !== (div_style_value = /*style*/ ctx[39])) {
				attr(div, "style", div_style_value);
			}

			if (dirty[0] & /*dropdownIndex*/ 1 | dirty[1] & /*index*/ 128) {
				toggle_class(div, "sv-dd-item-active", /*index*/ ctx[38] == /*dropdownIndex*/ ctx[0]);
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

// (186:2) {#if $inputValue && creatable && !maxReached}
function create_if_block_1$2(ctx) {
	let div;
	let span;
	let t0;
	let t1;
	let t2;
	let t3;
	let mounted;
	let dispose;
	let if_block = /*currentListLength*/ ctx[17] !== /*dropdownIndex*/ ctx[0] && create_if_block_2$1();

	return {
		c() {
			div = element("div");
			span = element("span");
			t0 = text("Create '");
			t1 = text(/*$inputValue*/ ctx[19]);
			t2 = text("'");
			t3 = space();
			if (if_block) if_block.c();
			attr(div, "class", "creatable-row svelte-mhc3oe");
			toggle_class(div, "active", /*currentListLength*/ ctx[17] === /*dropdownIndex*/ ctx[0]);
			toggle_class(div, "is-disabled", /*alreadyCreated*/ ctx[5].includes(/*$inputValue*/ ctx[19]));
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
					if (is_function(/*dispatch*/ ctx[21]("select", /*$inputValue*/ ctx[19]))) /*dispatch*/ ctx[21]("select", /*$inputValue*/ ctx[19]).apply(this, arguments);
				});

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty[0] & /*$inputValue*/ 524288) set_data(t1, /*$inputValue*/ ctx[19]);

			if (/*currentListLength*/ ctx[17] !== /*dropdownIndex*/ ctx[0]) {
				if (if_block) ; else {
					if_block = create_if_block_2$1();
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty[0] & /*currentListLength, dropdownIndex*/ 131073) {
				toggle_class(div, "active", /*currentListLength*/ ctx[17] === /*dropdownIndex*/ ctx[0]);
			}

			if (dirty[0] & /*alreadyCreated, $inputValue*/ 524320) {
				toggle_class(div, "is-disabled", /*alreadyCreated*/ ctx[5].includes(/*$inputValue*/ ctx[19]));
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

// (192:6) {#if currentListLength !== dropdownIndex}
function create_if_block_2$1(ctx) {
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

// (197:2) {#if hasEmptyList || maxReached}
function create_if_block$2(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*listMessage*/ ctx[10]);
			attr(div, "class", "empty-list-row svelte-mhc3oe");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*listMessage*/ 1024) set_data(t, /*listMessage*/ ctx[10]);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment$4(ctx) {
	let div1;
	let div0;
	let t0;
	let t1;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*items*/ ctx[4].length && create_if_block_3$1(ctx);
	let if_block1 = /*$inputValue*/ ctx[19] && /*creatable*/ ctx[1] && !/*maxReached*/ ctx[2] && create_if_block_1$2(ctx);
	let if_block2 = (/*hasEmptyList*/ ctx[14] || /*maxReached*/ ctx[2]) && create_if_block$2(ctx);

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
			attr(div1, "aria-expanded", /*$hasDropdownOpened*/ ctx[20]);
			attr(div1, "tabindex", "-1");
			toggle_class(div1, "is-virtual", /*virtualList*/ ctx[6]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			if (if_block0) if_block0.m(div0, null);
			append(div0, t0);
			if (if_block1) if_block1.m(div0, null);
			append(div0, t1);
			if (if_block2) if_block2.m(div0, null);
			/*div0_binding*/ ctx[31](div0);
			/*div1_binding*/ ctx[32](div1);
			current = true;

			if (!mounted) {
				dispose = listen(div1, "mousedown", prevent_default(/*mousedown_handler*/ ctx[25]));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*items*/ ctx[4].length) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty[0] & /*items*/ 16) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_3$1(ctx);
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

			if (/*$inputValue*/ ctx[19] && /*creatable*/ ctx[1] && !/*maxReached*/ ctx[2]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_1$2(ctx);
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
					if_block2 = create_if_block$2(ctx);
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

			if (!current || dirty[0] & /*$hasDropdownOpened*/ 1048576) {
				attr(div1, "aria-expanded", /*$hasDropdownOpened*/ ctx[20]);
			}

			if (dirty[0] & /*virtualList*/ 64) {
				toggle_class(div1, "is-virtual", /*virtualList*/ ctx[6]);
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
			/*div0_binding*/ ctx[31](null);
			/*div1_binding*/ ctx[32](null);
			mounted = false;
			dispose();
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let $inputValue,
		$$unsubscribe_inputValue = noop,
		$$subscribe_inputValue = () => ($$unsubscribe_inputValue(), $$unsubscribe_inputValue = subscribe(inputValue, $$value => $$invalidate(19, $inputValue = $$value)), inputValue);

	let $hasDropdownOpened,
		$$unsubscribe_hasDropdownOpened = noop,
		$$subscribe_hasDropdownOpened = () => ($$unsubscribe_hasDropdownOpened(), $$unsubscribe_hasDropdownOpened = subscribe(hasDropdownOpened, $$value => $$invalidate(20, $hasDropdownOpened = $$value)), hasDropdownOpened);

	$$self.$$.on_destroy.push(() => $$unsubscribe_inputValue());
	$$self.$$.on_destroy.push(() => $$unsubscribe_hasDropdownOpened());
	let { creatable } = $$props;
	let { maxReached = false } = $$props;
	let { dropdownIndex = 0 } = $$props;
	let { renderer } = $$props;
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

	function scrollIntoView(params) {
		if (virtualList) return;
		const focusedEl = container.querySelector(`[data-pos="${dropdownIndex}"]`);
		if (!focusedEl) return;
		const focusedRect = focusedEl.getBoundingClientRect();
		const menuRect = scrollContainer.getBoundingClientRect();
		const overScroll = focusedEl.offsetHeight / 3;

		switch (true) {
			case focusedEl.offsetTop < scrollContainer.scrollTop:
				$$invalidate(12, scrollContainer.scrollTop = focusedEl.offsetTop - overScroll, scrollContainer);
				break;
			case focusedEl.offsetTop + focusedRect.height > scrollContainer.scrollTop + menuRect.height:
				$$invalidate(12, scrollContainer.scrollTop = focusedEl.offsetTop + focusedRect.height - scrollContainer.offsetHeight + overScroll, scrollContainer);
				break;
		}
	}

	const dispatch = createEventDispatcher();
	let container;
	let scrollContainer;
	let isMounted = false;
	let hasEmptyList = false;
	let vl_height = vlHeight;
	let vl_itemSize = vlItemSize;
	let vl_autoMode = vlHeight === null && vlItemSize === null;
	let refVirtualList;

	function positionDropdown(val) {
		if (!scrollContainer) return;
		const outVp = isOutOfViewport(scrollContainer);

		if (outVp.bottom && !outVp.top) {
			$$invalidate(12, scrollContainer.style.bottom = scrollContainer.parentElement.clientHeight + 1 + "px", scrollContainer);
		} else if (!val || outVp.top) {
			$$invalidate(12, scrollContainer.style.bottom = "", scrollContainer); // FUTURE: debounce ....
		}
	}

	function virtualListDimensionsResolver() {
		if (!refVirtualList) return;

		const pixelGetter = (el, prop) => {
			const styles = window.getComputedStyle(el);
			let { groups: { value, unit } } = styles[prop].match(/(?<value>\d+)(?<unit>[a-zA-Z]+)/);
			value = parseFloat(value);

			if (unit !== "px") {
				const el = unit === "rem"
				? document.documentElement
				: scrollContainer.parentElement;

				const multipler = parseFloat(window.getComputedStyle(el).fontSize.match(/\d+/).shift());
				value = multipler * value;
			}

			return value;
		};

		$$invalidate(33, vl_height = pixelGetter(scrollContainer, "maxHeight") - pixelGetter(scrollContainer, "paddingTop") - pixelGetter(scrollContainer, "paddingBottom"));

		// get item size (hacky style)
		$$invalidate(12, scrollContainer.style = "opacity: 0; display: block", scrollContainer);

		const firstItem = refVirtualList.$$.ctx[0].firstElementChild.firstElementChild;

		if (firstItem) {
			firstItem.style = "";
			const firstSize = firstItem.getBoundingClientRect().height;
			const secondItem = refVirtualList.$$.ctx[0].firstElementChild.firstElementChild.nextElementSibling;
			let secondSize;

			if (secondItem) {
				secondItem.style = "";
				secondSize = secondItem.getBoundingClientRect().height;
			}

			if (firstSize !== secondSize) {
				const groupHeaderSize = items[0].$isGroupHeader ? firstSize : secondSize;
				const regularItemSize = items[0].$isGroupHeader ? secondSize : firstSize;
				$$invalidate(15, vl_itemSize = items.map(opt => opt.$isGroupHeader ? groupHeaderSize : regularItemSize));
			} else {
				$$invalidate(15, vl_itemSize = firstSize);
			}
		}

		$$invalidate(12, scrollContainer.style = "", scrollContainer);
	}

	let dropdownStateSubscription;

	/** ************************************ lifecycle */
	onMount(() => {
		/** ************************************ flawless UX related tweak */
		dropdownStateSubscription = hasDropdownOpened.subscribe(val => {
			tick().then(() => positionDropdown(val));

			// bind/unbind scroll listener
			document[val ? "addEventListener" : "removeEventListener"]("scroll", () => positionDropdown(val), { passive: true });
		});

		$$invalidate(13, isMounted = true);
	});

	onDestroy(() => dropdownStateSubscription());

	function mousedown_handler(event) {
		bubble($$self, event);
	}

	function hover_handler(event) {
		bubble($$self, event);
	}

	function select_handler(event) {
		bubble($$self, event);
	}

	function virtuallist_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			refVirtualList = $$value;
			$$invalidate(16, refVirtualList);
		});
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
			$$invalidate(11, container);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			scrollContainer = $$value;
			$$invalidate(12, scrollContainer);
		});
	}

	$$self.$$set = $$props => {
		if ("creatable" in $$props) $$invalidate(1, creatable = $$props.creatable);
		if ("maxReached" in $$props) $$invalidate(2, maxReached = $$props.maxReached);
		if ("dropdownIndex" in $$props) $$invalidate(0, dropdownIndex = $$props.dropdownIndex);
		if ("renderer" in $$props) $$invalidate(3, renderer = $$props.renderer);
		if ("items" in $$props) $$invalidate(4, items = $$props.items);
		if ("alreadyCreated" in $$props) $$invalidate(5, alreadyCreated = $$props.alreadyCreated);
		if ("virtualList" in $$props) $$invalidate(6, virtualList = $$props.virtualList);
		if ("vlItemSize" in $$props) $$invalidate(22, vlItemSize = $$props.vlItemSize);
		if ("vlHeight" in $$props) $$invalidate(23, vlHeight = $$props.vlHeight);
		if ("inputValue" in $$props) $$subscribe_inputValue($$invalidate(7, inputValue = $$props.inputValue));
		if ("listIndex" in $$props) $$invalidate(8, listIndex = $$props.listIndex);
		if ("hasDropdownOpened" in $$props) $$subscribe_hasDropdownOpened($$invalidate(9, hasDropdownOpened = $$props.hasDropdownOpened));
		if ("listMessage" in $$props) $$invalidate(10, listMessage = $$props.listMessage);
	};

	let currentListLength;
	let vl_listHeight;

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*items*/ 16) {
			 $$invalidate(17, currentListLength = items.length);
		}

		if ($$self.$$.dirty[0] & /*items, creatable, $inputValue, virtualList, isMounted, hasEmptyList*/ 548946) {
			 {
				$$invalidate(14, hasEmptyList = items.length < 1 && (creatable ? !$inputValue : true));

				// required when changing item list 'on-the-fly' for VL
				if (virtualList && isMounted && vl_autoMode) {
					if (hasEmptyList) $$invalidate(0, dropdownIndex = null);
					$$invalidate(15, vl_itemSize = 0);
					tick().then(virtualListDimensionsResolver);
				}

				console.log(">>v", virtualList);
			}
		}

		if ($$self.$$.dirty[0] & /*vl_itemSize, items*/ 32784 | $$self.$$.dirty[1] & /*vl_height*/ 4) {
			 $$invalidate(18, vl_listHeight = Math.min(vl_height, Array.isArray(vl_itemSize)
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
		items,
		alreadyCreated,
		virtualList,
		inputValue,
		listIndex,
		hasDropdownOpened,
		listMessage,
		container,
		scrollContainer,
		isMounted,
		hasEmptyList,
		vl_itemSize,
		refVirtualList,
		currentListLength,
		vl_listHeight,
		$inputValue,
		$hasDropdownOpened,
		dispatch,
		vlItemSize,
		vlHeight,
		scrollIntoView,
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
			instance$4,
			create_fragment$4,
			safe_not_equal,
			{
				creatable: 1,
				maxReached: 2,
				dropdownIndex: 0,
				renderer: 3,
				items: 4,
				alreadyCreated: 5,
				virtualList: 6,
				vlItemSize: 22,
				vlHeight: 23,
				inputValue: 7,
				listIndex: 8,
				hasDropdownOpened: 9,
				listMessage: 10,
				scrollIntoView: 24
			},
			[-1, -1]
		);
	}

	get scrollIntoView() {
		return this.$$.ctx[24];
	}
}

/* src\Svelecte\Svelecte.svelte generated by Svelte v3.25.0 */

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[77] = list[i];
	return child_ctx;
}

const get_icon_slot_changes$1 = dirty => ({});
const get_icon_slot_context$1 = ctx => ({});

// (488:4) <div slot="icon" class="icon-slot">
function create_icon_slot(ctx) {
	let div;
	let current;
	const icon_slot_template = /*#slots*/ ctx[55].icon;
	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[58], get_icon_slot_context$1);

	return {
		c() {
			div = element("div");
			if (icon_slot) icon_slot.c();
			attr(div, "slot", "icon");
			attr(div, "class", "icon-slot svelte-1h9htsj");
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
				if (icon_slot.p && dirty[1] & /*$$scope*/ 134217728) {
					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[58], dirty, get_icon_slot_changes$1, get_icon_slot_context$1);
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

// (499:2) {#if name && !anchor}
function create_if_block$3(ctx) {
	let select;
	let each_value = Array.from(/*selectedOptions*/ ctx[21]);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	return {
		c() {
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(select, "name", /*name*/ ctx[7]);
			select.multiple = /*multiple*/ ctx[1];
			attr(select, "class", "is-hidden svelte-1h9htsj");
			attr(select, "tabindex", "-1");
			select.required = /*required*/ ctx[8];
			select.disabled = /*disabled*/ ctx[0];
		},
		m(target, anchor) {
			insert(target, select, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedOptions, currentValueField, currentLabelField*/ 2883584) {
				each_value = Array.from(/*selectedOptions*/ ctx[21]);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty[0] & /*name*/ 128) {
				attr(select, "name", /*name*/ ctx[7]);
			}

			if (dirty[0] & /*multiple*/ 2) {
				select.multiple = /*multiple*/ ctx[1];
			}

			if (dirty[0] & /*required*/ 256) {
				select.required = /*required*/ ctx[8];
			}

			if (dirty[0] & /*disabled*/ 1) {
				select.disabled = /*disabled*/ ctx[0];
			}
		},
		d(detaching) {
			if (detaching) detach(select);
			destroy_each(each_blocks, detaching);
		}
	};
}

// (501:4) {#each Array.from(selectedOptions) as opt}
function create_each_block$3(ctx) {
	let option;
	let t_value = /*opt*/ ctx[77][/*currentLabelField*/ ctx[19]] + "";
	let t;
	let option_value_value;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*opt*/ ctx[77][/*currentValueField*/ ctx[18]];
			option.value = option.__value;
			option.selected = true;
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedOptions, currentLabelField*/ 2621440 && t_value !== (t_value = /*opt*/ ctx[77][/*currentLabelField*/ ctx[19]] + "")) set_data(t, t_value);

			if (dirty[0] & /*selectedOptions, currentValueField*/ 2359296 && option_value_value !== (option_value_value = /*opt*/ ctx[77][/*currentValueField*/ ctx[18]])) {
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
	let div;
	let control;
	let t0;
	let dropdown;
	let t1;
	let div_class_value;
	let current;

	let control_props = {
		renderer: /*itemRenderer*/ ctx[27],
		disabled: /*disabled*/ ctx[0],
		clearable: /*clearable*/ ctx[5],
		searchable: /*searchable*/ ctx[4],
		placeholder: /*placeholder*/ ctx[3],
		multiple: /*multiple*/ ctx[1],
		collapseSelection: /*collapseSelection*/ ctx[6]
		? config.collapseSelectionFn
		: null,
		inputValue: /*inputValue*/ ctx[28],
		hasFocus: /*hasFocus*/ ctx[29],
		hasDropdownOpened: /*hasDropdownOpened*/ ctx[30],
		selectedOptions: Array.from(/*selectedOptions*/ ctx[21]),
		isFetchingData: /*isFetchingData*/ ctx[20],
		$$slots: { icon: [create_icon_slot] },
		$$scope: { ctx }
	};

	control = new Control({ props: control_props });
	/*control_binding*/ ctx[56](control);
	control.$on("deselect", /*onDeselect*/ ctx[32]);
	control.$on("keydown", /*onKeyDown*/ ctx[34]);
	control.$on("paste", /*onPaste*/ ctx[35]);

	let dropdown_props = {
		renderer: /*itemRenderer*/ ctx[27],
		creatable: /*creatable*/ ctx[9],
		maxReached: /*maxReached*/ ctx[24],
		alreadyCreated: /*alreadyCreated*/ ctx[22],
		virtualList: /*creatable*/ ctx[9] ? false : /*virtualList*/ ctx[10],
		vlHeight: /*vlHeight*/ ctx[11],
		vlItemSize: /*vlItemSize*/ ctx[12],
		dropdownIndex: /*dropdownActiveIndex*/ ctx[17],
		items: /*availableItems*/ ctx[25],
		listIndex: /*listIndex*/ ctx[26],
		inputValue: /*inputValue*/ ctx[28],
		hasDropdownOpened: /*hasDropdownOpened*/ ctx[30],
		listMessage: /*listMessage*/ ctx[23]
	};

	dropdown = new Dropdown({ props: dropdown_props });
	/*dropdown_binding*/ ctx[57](dropdown);
	dropdown.$on("select", /*onSelect*/ ctx[31]);
	dropdown.$on("hover", /*onHover*/ ctx[33]);
	let if_block = /*name*/ ctx[7] && !/*anchor*/ ctx[2] && create_if_block$3(ctx);

	return {
		c() {
			div = element("div");
			create_component(control.$$.fragment);
			t0 = space();
			create_component(dropdown.$$.fragment);
			t1 = space();
			if (if_block) if_block.c();
			attr(div, "class", div_class_value = "" + (null_to_empty(`svelecte ${/*className*/ ctx[13]}`) + " svelte-1h9htsj"));
			attr(div, "style", /*style*/ ctx[14]);
			toggle_class(div, "is-disabled", /*disabled*/ ctx[0]);
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
			if (dirty[0] & /*itemRenderer*/ 134217728) control_changes.renderer = /*itemRenderer*/ ctx[27];
			if (dirty[0] & /*disabled*/ 1) control_changes.disabled = /*disabled*/ ctx[0];
			if (dirty[0] & /*clearable*/ 32) control_changes.clearable = /*clearable*/ ctx[5];
			if (dirty[0] & /*searchable*/ 16) control_changes.searchable = /*searchable*/ ctx[4];
			if (dirty[0] & /*placeholder*/ 8) control_changes.placeholder = /*placeholder*/ ctx[3];
			if (dirty[0] & /*multiple*/ 2) control_changes.multiple = /*multiple*/ ctx[1];

			if (dirty[0] & /*collapseSelection*/ 64) control_changes.collapseSelection = /*collapseSelection*/ ctx[6]
			? config.collapseSelectionFn
			: null;

			if (dirty[0] & /*selectedOptions*/ 2097152) control_changes.selectedOptions = Array.from(/*selectedOptions*/ ctx[21]);
			if (dirty[0] & /*isFetchingData*/ 1048576) control_changes.isFetchingData = /*isFetchingData*/ ctx[20];

			if (dirty[1] & /*$$scope*/ 134217728) {
				control_changes.$$scope = { dirty, ctx };
			}

			control.$set(control_changes);
			const dropdown_changes = {};
			if (dirty[0] & /*itemRenderer*/ 134217728) dropdown_changes.renderer = /*itemRenderer*/ ctx[27];
			if (dirty[0] & /*creatable*/ 512) dropdown_changes.creatable = /*creatable*/ ctx[9];
			if (dirty[0] & /*maxReached*/ 16777216) dropdown_changes.maxReached = /*maxReached*/ ctx[24];
			if (dirty[0] & /*alreadyCreated*/ 4194304) dropdown_changes.alreadyCreated = /*alreadyCreated*/ ctx[22];
			if (dirty[0] & /*creatable, virtualList*/ 1536) dropdown_changes.virtualList = /*creatable*/ ctx[9] ? false : /*virtualList*/ ctx[10];
			if (dirty[0] & /*vlHeight*/ 2048) dropdown_changes.vlHeight = /*vlHeight*/ ctx[11];
			if (dirty[0] & /*vlItemSize*/ 4096) dropdown_changes.vlItemSize = /*vlItemSize*/ ctx[12];
			if (dirty[0] & /*dropdownActiveIndex*/ 131072) dropdown_changes.dropdownIndex = /*dropdownActiveIndex*/ ctx[17];
			if (dirty[0] & /*availableItems*/ 33554432) dropdown_changes.items = /*availableItems*/ ctx[25];
			if (dirty[0] & /*listIndex*/ 67108864) dropdown_changes.listIndex = /*listIndex*/ ctx[26];
			if (dirty[0] & /*listMessage*/ 8388608) dropdown_changes.listMessage = /*listMessage*/ ctx[23];
			dropdown.$set(dropdown_changes);

			if (/*name*/ ctx[7] && !/*anchor*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (!current || dirty[0] & /*className*/ 8192 && div_class_value !== (div_class_value = "" + (null_to_empty(`svelecte ${/*className*/ ctx[13]}`) + " svelte-1h9htsj"))) {
				attr(div, "class", div_class_value);
			}

			if (!current || dirty[0] & /*style*/ 16384) {
				attr(div, "style", /*style*/ ctx[14]);
			}

			if (dirty[0] & /*className, disabled*/ 8193) {
				toggle_class(div, "is-disabled", /*disabled*/ ctx[0]);
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
			/*control_binding*/ ctx[56](null);
			destroy_component(control);
			/*dropdown_binding*/ ctx[57](null);
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

function instance$5($$self, $$props, $$invalidate) {
	let $hasFocus;
	let $inputValue;
	let $hasDropdownOpened;
	let { $$slots: slots = {}, $$scope } = $$props;
	let { options = [] } = $$props;
	let { valueField = settings.valueField } = $$props;
	let { labelField = settings.labelField } = $$props;
	let { placeholder = "Select" } = $$props;
	let { searchable = settings.searchable } = $$props;
	let { disabled = settings.disabled } = $$props;
	let { renderer = null } = $$props;
	let { clearable = settings.clearable } = $$props;
	let { selectOnTab = settings.selectOnTab } = $$props;
	let { multiple = settings.multiple } = $$props;
	let { max = settings.max } = $$props;
	let { collapseSelection = settings.collapseSelection } = $$props;
	let { name = null } = $$props;
	let { required = false } = $$props;
	let { anchor = null } = $$props;
	let { creatable = settings.creatable } = $$props;
	let { creatablePrefix = settings.creatablePrefix } = $$props;
	let { delimiter = settings.delimiter } = $$props;
	let { fetch = null } = $$props;
	let { fetchMode = "auto" } = $$props;
	let { fetchCallback = null } = $$props;
	let { virtualList = settings.virtualList } = $$props;
	let { vlHeight = settings.vlHeight } = $$props;
	let { vlItemSize = settings.vlItemSize } = $$props;
	let { searchField = null } = $$props;
	let { sortField = null } = $$props;

	// styling
	let { class: className = "svelecte-control" } = $$props;

	let { style = null } = $$props;
	let { selection = null } = $$props;
	let { value = null } = $$props;
	let { labelAsValue = false } = $$props;

	const getSelection = onlyValues => {
		if (!selection) return multiple ? [] : null;

		return multiple
		? selection.map(opt => onlyValues
			? opt[currentValueField]
			: Object.assign({}, opt))
		: onlyValues
			? selection[currentValueField]
			: Object.assign({}, selection);
	};

	const setSelection = selection => _selectByValues(selection);

	const clearByParent = doDisable => {
		clearSelection();
		emitChangeEvent();
		if (doDisable) $$invalidate(0, disabled = true);
		$$invalidate(37, fetch = null);
	};

	const dispatch = createEventDispatcher();

	const itemConfig = {
		optionsWithGroups: false,
		isOptionArray: options && options.length && typeof options[0] !== "object",
		optionProps: [],
		valueField,
		labelField,
		labelAsValue
	};

	let isInitialized = false;
	let refDropdown;
	let refControl;
	let ignoreHover = false;
	let dropdownActiveIndex = null;
	let fetchUnsubscribe = null;
	let currentValueField = valueField || fieldInit("value", options, itemConfig);
	let currentLabelField = labelField || fieldInit("label", options, itemConfig);
	itemConfig.valueField = currentValueField;
	itemConfig.labelField = currentLabelField;

	/** ************************************ automatic init */
	multiple = name && !multiple ? name.endsWith("[]") : multiple;

	/** ************************************ Context definition */
	const inputValue = writable("");

	component_subscribe($$self, inputValue, value => $$invalidate(66, $inputValue = value));
	const hasFocus = writable(false);
	component_subscribe($$self, hasFocus, value => $$invalidate(64, $hasFocus = value));
	const hasDropdownOpened = writable(false);
	component_subscribe($$self, hasDropdownOpened, value => $$invalidate(68, $hasDropdownOpened = value));
	let isFetchingData = false;

	function createFetch(fetch) {
		if (fetchUnsubscribe) {
			fetchUnsubscribe();
			fetchUnsubscribe = null;
		}

		if (!fetch) return null;
		const fetchSource = typeof fetch === "string" ? fetchRemote(fetch) : fetch;
		const initFetchOnly = fetchMode === "init" || fetchMode === "auto" && typeof fetch === "string" && fetch.indexOf("[query]") === -1;

		const debouncedFetch = debounce(
			query => {
				fetchSource(query, fetchCallback).then(data => {
					$$invalidate(36, options = data);
				}).catch(() => $$invalidate(36, options = [])).finally(() => {
					$$invalidate(20, isFetchingData = false);
					$hasFocus && hasDropdownOpened.set(true);
					$$invalidate(23, listMessage = config.i18n.fetchEmpty);
					tick().then(() => dispatch("fetch", options));
				});
			},
			500
		);

		if (initFetchOnly) {
			if (typeof fetch === "string" && fetch.indexOf("[parent]") !== -1) return null;
			$$invalidate(20, isFetchingData = true);
			debouncedFetch(null);
			return null;
		}

		fetchUnsubscribe = inputValue.subscribe(value => {
			if (xhr && xhr.readyState !== 4) {
				// cancel previously run 
				xhr.abort();
			}

			

			if (!value) {
				$$invalidate(23, listMessage = config.i18n.fetchBefore);
				return;
			}

			$$invalidate(20, isFetchingData = true);
			hasDropdownOpened.set(false);
			debouncedFetch(value);
		});

		return debouncedFetch;
	}

	/** ************************************ component logic */
	value && _selectByValues(value); // init values if passed

	let prevSelection = selection;

	/** - - - - - - - - - - STORE - - - - - - - - - - - - - -*/
	let selectedOptions = new Set();

	let alreadyCreated = [];
	let prevOptions = options;

	/**
 * Dispatch change event on add options/remove selected items
 */
	function emitChangeEvent() {
		tick().then(() => {
			dispatch("change", selection);
		});
	}

	/**
 * Internal helper for passed value array. Should be used for CE
 */
	function _selectByValues(values) {
		if (!Array.isArray(values)) values = [values];
		if (values && values.length && values[0] instanceof Object) values = values.map(opt => opt[currentValueField]);
		clearSelection();
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
 */
	function selectOption(opt) {
		if (maxReached) return;

		if (typeof opt === "string") {
			if (alreadyCreated.includes(opt)) return;
			alreadyCreated.push(opt);

			opt = {
				[currentLabelField]: `${creatablePrefix}${opt}`,
				[currentValueField]: encodeURIComponent(opt),
				isSelected: true,
				_created: true
			};

			$$invalidate(36, options = [...options, opt]);
		}

		opt.isSelected = true;
		if (!multiple) selectedOptions.clear();
		!selectedOptions.has(opt) && selectedOptions.add(opt);
		$$invalidate(21, selectedOptions);
		((((((((($$invalidate(65, flatItems), $$invalidate(36, options)), $$invalidate(59, itemConfig)), $$invalidate(60, isInitialized)), $$invalidate(71, prevOptions)), $$invalidate(40, valueField)), $$invalidate(18, currentValueField)), $$invalidate(41, labelField)), $$invalidate(19, currentLabelField)), $$invalidate(51, labelAsValue));
	}

	/**
 * Remove option/all options from selection pool
 */
	function deselectOption(opt) {
		selectedOptions.delete(opt);
		opt.isSelected = false;
		$$invalidate(21, selectedOptions);
		((((((((($$invalidate(65, flatItems), $$invalidate(36, options)), $$invalidate(59, itemConfig)), $$invalidate(60, isInitialized)), $$invalidate(71, prevOptions)), $$invalidate(40, valueField)), $$invalidate(18, currentValueField)), $$invalidate(41, labelField)), $$invalidate(19, currentLabelField)), $$invalidate(51, labelAsValue));
	}

	function clearSelection() {
		selectedOptions.forEach(deselectOption);
	}

	/**
 * Handle user action on select
 */
	function onSelect(event, opt) {
		opt = opt || event.detail;
		if (disabled || opt.isDisabled || opt.$isGroupHeader) return;
		selectOption(opt);
		set_store_value(inputValue, $inputValue = "");

		if (!multiple) {
			set_store_value(hasDropdownOpened, $hasDropdownOpened = false);
		} else {
			tick().then(() => {
				$$invalidate(17, dropdownActiveIndex = maxReached
				? null
				: listIndex.next(dropdownActiveIndex - 1, true));
			});
		}
	}

	function onDeselect(event, opt) {
		if (disabled) return;
		opt = opt || event.detail;

		if (opt) {
			deselectOption(opt);
		} else {
			// apply for 'x' when clearable:true || ctrl+backspace || ctrl+delete
			selectedOptions.forEach(deselectOption);
		}

		tick().then(refControl.focusControl);

		tick().then(() => {
			$$invalidate(17, dropdownActiveIndex = listIndex.next(dropdownActiveIndex - 1));
		});
	}

	/**
 * Dropdown hover handler - update active item
 */
	function onHover(event) {
		if (ignoreHover) {
			ignoreHover = false;
			return;
		}

		$$invalidate(17, dropdownActiveIndex = event.detail);
	}

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
		? "Tab"
		: "No-tab";

		switch (event.key) {
			case "End":
				if ($inputValue.length !== 0) return;
			case "PageDown":
				$$invalidate(17, dropdownActiveIndex = listIndex.first);
			case "ArrowUp":
				if (!$hasDropdownOpened) {
					set_store_value(hasDropdownOpened, $hasDropdownOpened = true);
					return;
				}
				event.preventDefault();
				$$invalidate(17, dropdownActiveIndex = listIndex.prev(dropdownActiveIndex));
				tick().then(refDropdown.scrollIntoView);
				ignoreHover = true;
				break;
			case "Home":
				if ($inputValue.length !== 0) return;
			case "PageUp":
				$$invalidate(17, dropdownActiveIndex = listIndex.last);
			case "ArrowDown":
				if (!$hasDropdownOpened) {
					set_store_value(hasDropdownOpened, $hasDropdownOpened = true);
					return;
				}
				event.preventDefault();
				$$invalidate(17, dropdownActiveIndex = listIndex.next(dropdownActiveIndex));
				tick().then(refDropdown.scrollIntoView);
				ignoreHover = true;
				break;
			case "Escape":
				if ($hasDropdownOpened) {
					// prevent ESC bubble in this case (interfering with modal closing etc. (bootstrap))
					event.preventDefault();

					event.stopPropagation();
				}
				if (!$inputValue) {
					set_store_value(hasDropdownOpened, $hasDropdownOpened = false);
				}
				set_store_value(inputValue, $inputValue = "");
				break;
			case Tab:
			case "Enter":
				if (!$hasDropdownOpened) return;
				let activeDropdownItem = availableItems[dropdownActiveIndex];
				if (creatable && $inputValue) {
					activeDropdownItem = !activeDropdownItem || event.ctrlKey
					? $inputValue
					: activeDropdownItem;
				}
				activeDropdownItem && onSelect(null, activeDropdownItem);
				if (availableItems.length <= dropdownActiveIndex) {
					$$invalidate(17, dropdownActiveIndex = currentListLength > 0
					? currentListLength
					: listIndex.first);
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
				if ($inputValue === "" && selectedOptions.size) {
					event.ctrlKey
					? onDeselect({})
					: onDeselect(null, [...selectedOptions].pop()); /** no detail prop */
				}
			default:
				if (!event.ctrlKey && !["Tab", "Shift"].includes(event.key) && !$hasDropdownOpened && !isFetchingData) {
					set_store_value(hasDropdownOpened, $hasDropdownOpened = true);
				}
				if (!multiple && selectedOptions.length && event.key !== "Tab") event.preventDefault();
		}
	}

	/**
 * Enable create items by pasting
 */
	function onPaste(event) {
		if (creatable) {
			event.preventDefault();
			const rx = new RegExp("([^" + delimiter + "\\n]+)", "g");
			const pasted = event.clipboardData.getData("text/plain").replaceAll("/", "/");
			const matches = pasted.match(rx);

			if (matches.length === 1 && pasted.indexOf(",") === -1) {
				set_store_value(inputValue, $inputValue = matches.pop().trim());
			}

			matches.forEach(opt => onSelect(null, opt.trim()));
		}
	} // do nothing otherwise

	/** ************************************ component lifecycle related */
	onMount(() => {
		$$invalidate(60, isInitialized = true);

		// Lazy calling of scrollIntoView function, which is required
		// TODO: resolve, probably already fixed
		// if (val <= dropdownActiveIndex) dropdownActiveIndex = val;
		// if (dropdownActiveIndex < 0) dropdownActiveIndex = listIndexMap.first;
		if (creatable) {
			const valueProp = itemConfig.labelAsValue
			? currentLabelField
			: currentValueField;

			$$invalidate(22, alreadyCreated = flatItems.map(opt => opt[valueProp]).filter(opt => opt));
		}

		$$invalidate(17, dropdownActiveIndex = listIndex.first);

		if (prevSelection && !multiple) {
			$$invalidate(17, dropdownActiveIndex = flatItems.findIndex(opt => opt[currentValueField] === prevSelection[currentValueField]));
			tick().then(() => refDropdown && refDropdown.scrollIntoView({}));
		}

		if (anchor) anchor.classList.add("anchored-select");
	});

	function control_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			refControl = $$value;
			$$invalidate(16, refControl);
		});
	}

	function dropdown_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			refDropdown = $$value;
			$$invalidate(15, refDropdown);
		});
	}

	$$self.$$set = $$props => {
		if ("options" in $$props) $$invalidate(36, options = $$props.options);
		if ("valueField" in $$props) $$invalidate(40, valueField = $$props.valueField);
		if ("labelField" in $$props) $$invalidate(41, labelField = $$props.labelField);
		if ("placeholder" in $$props) $$invalidate(3, placeholder = $$props.placeholder);
		if ("searchable" in $$props) $$invalidate(4, searchable = $$props.searchable);
		if ("disabled" in $$props) $$invalidate(0, disabled = $$props.disabled);
		if ("renderer" in $$props) $$invalidate(42, renderer = $$props.renderer);
		if ("clearable" in $$props) $$invalidate(5, clearable = $$props.clearable);
		if ("selectOnTab" in $$props) $$invalidate(43, selectOnTab = $$props.selectOnTab);
		if ("multiple" in $$props) $$invalidate(1, multiple = $$props.multiple);
		if ("max" in $$props) $$invalidate(44, max = $$props.max);
		if ("collapseSelection" in $$props) $$invalidate(6, collapseSelection = $$props.collapseSelection);
		if ("name" in $$props) $$invalidate(7, name = $$props.name);
		if ("required" in $$props) $$invalidate(8, required = $$props.required);
		if ("anchor" in $$props) $$invalidate(2, anchor = $$props.anchor);
		if ("creatable" in $$props) $$invalidate(9, creatable = $$props.creatable);
		if ("creatablePrefix" in $$props) $$invalidate(45, creatablePrefix = $$props.creatablePrefix);
		if ("delimiter" in $$props) $$invalidate(46, delimiter = $$props.delimiter);
		if ("fetch" in $$props) $$invalidate(37, fetch = $$props.fetch);
		if ("fetchMode" in $$props) $$invalidate(47, fetchMode = $$props.fetchMode);
		if ("fetchCallback" in $$props) $$invalidate(48, fetchCallback = $$props.fetchCallback);
		if ("virtualList" in $$props) $$invalidate(10, virtualList = $$props.virtualList);
		if ("vlHeight" in $$props) $$invalidate(11, vlHeight = $$props.vlHeight);
		if ("vlItemSize" in $$props) $$invalidate(12, vlItemSize = $$props.vlItemSize);
		if ("searchField" in $$props) $$invalidate(49, searchField = $$props.searchField);
		if ("sortField" in $$props) $$invalidate(50, sortField = $$props.sortField);
		if ("class" in $$props) $$invalidate(13, className = $$props.class);
		if ("style" in $$props) $$invalidate(14, style = $$props.style);
		if ("selection" in $$props) $$invalidate(38, selection = $$props.selection);
		if ("value" in $$props) $$invalidate(39, value = $$props.value);
		if ("labelAsValue" in $$props) $$invalidate(51, labelAsValue = $$props.labelAsValue);
		if ("$$scope" in $$props) $$invalidate(58, $$scope = $$props.$$scope);
	};

	let flatItems;
	let maxReached;
	let availableItems;
	let currentListLength;
	let listIndex;
	let listMessage;
	let itemRenderer;

	$$self.$$.update = () => {
		if ($$self.$$.dirty[1] & /*fetch*/ 64) {
			/** ************************************ remote source */
			// $: initFetchOnly = fetchMode === 'init' || (typeof fetch === 'string' && fetch.indexOf('[query]') === -1);
			 createFetch(fetch);
		}

		if ($$self.$$.dirty[0] & /*currentValueField, currentLabelField*/ 786432 | $$self.$$.dirty[1] & /*isInitialized, options, itemConfig, valueField, labelField*/ 805307936) {
			 {
				if (isInitialized && prevOptions !== options) {
					const ivalue = fieldInit("value", options || null, itemConfig);
					const ilabel = fieldInit("label", options || null, itemConfig);
					if (!valueField && currentValueField !== ivalue) $$invalidate(59, itemConfig.valueField = $$invalidate(18, currentValueField = ivalue), itemConfig);
					if (!labelField && currentLabelField !== ilabel) $$invalidate(59, itemConfig.labelField = $$invalidate(19, currentLabelField = ilabel), itemConfig);
				}
			}
		}

		if ($$self.$$.dirty[1] & /*labelAsValue*/ 1048576) {
			 {
				$$invalidate(59, itemConfig.labelAsValue = labelAsValue, itemConfig);
			}
		}

		if ($$self.$$.dirty[0] & /*selectedOptions, multiple, currentLabelField, currentValueField, anchor*/ 2883590 | $$self.$$.dirty[1] & /*itemConfig, value*/ 268435712 | $$self.$$.dirty[2] & /*prevSelection*/ 2) {
			 {
				const _selectionArray = Array.from(selectedOptions).map(opt => {
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

				dispatch("change", _unifiedSelection);

				$$invalidate(39, value = multiple
				? _unifiedSelection.map(opt => opt[valueProp])
				: selectedOptions.size
					? _unifiedSelection[valueProp]
					: null);

				$$invalidate(63, prevSelection = _unifiedSelection);
				$$invalidate(38, selection = prevSelection);

				// Custom-element related
				if (anchor) {
					$$invalidate(
						2,
						anchor.innerHTML = (Array.isArray(value) ? value : [value]).reduce(
							(res, item) => {
								if (!item) {
									res = "<option value=\"\" selected=\"\"></option>";
									return res;
								}

								
								res += `<option value="${item}" selected>${item}</option>`;
								return res;
							},
							""
						),
						anchor
					);

					anchor.dispatchEvent(new Event("change"));
				}
			}
		}

		if ($$self.$$.dirty[1] & /*selection*/ 128 | $$self.$$.dirty[2] & /*prevSelection*/ 2) {
			 {
				if (prevSelection !== selection) {
					clearSelection();

					if (selection) {
						Array.isArray(selection)
						? selection.forEach(selectOption)
						: selectOption(selection);
					}

					$$invalidate(63, prevSelection = selection);
				}
			}
		}

		if ($$self.$$.dirty[1] & /*options, itemConfig*/ 268435488) {
			 $$invalidate(65, flatItems = flatList(options, itemConfig));
		}

		if ($$self.$$.dirty[0] & /*selectedOptions*/ 2097152 | $$self.$$.dirty[1] & /*max*/ 8192) {
			 $$invalidate(24, maxReached = max && selectedOptions.size === max);
		}

		if ($$self.$$.dirty[0] & /*maxReached, multiple*/ 16777218 | $$self.$$.dirty[1] & /*searchField, sortField, itemConfig*/ 269221888 | $$self.$$.dirty[2] & /*flatItems, $inputValue*/ 24) {
			 $$invalidate(25, availableItems = maxReached
			? []
			: filterList(flatItems, $inputValue, multiple, searchField, sortField, itemConfig));
		}

		if ($$self.$$.dirty[0] & /*creatable, availableItems*/ 33554944 | $$self.$$.dirty[2] & /*$inputValue*/ 16) {
			 currentListLength = creatable && $inputValue
			? availableItems.length
			: availableItems.length - 1;
		}

		if ($$self.$$.dirty[0] & /*availableItems, creatable*/ 33554944 | $$self.$$.dirty[1] & /*itemConfig*/ 268435456 | $$self.$$.dirty[2] & /*$inputValue*/ 16) {
			 $$invalidate(26, listIndex = indexList(availableItems, creatable && $inputValue, itemConfig));
		}

		if ($$self.$$.dirty[0] & /*dropdownActiveIndex, listIndex*/ 67239936) {
			 {
				if (dropdownActiveIndex === null) {
					$$invalidate(17, dropdownActiveIndex = listIndex.first);
				} else if (dropdownActiveIndex > listIndex.last) {
					$$invalidate(17, dropdownActiveIndex = listIndex.last);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*maxReached*/ 16777216 | $$self.$$.dirty[1] & /*max*/ 8192) {
			 $$invalidate(23, listMessage = maxReached ? config.i18n.max(max) : config.i18n.empty);
		}

		if ($$self.$$.dirty[0] & /*currentLabelField*/ 524288 | $$self.$$.dirty[1] & /*renderer*/ 2048) {
			 $$invalidate(27, itemRenderer = typeof renderer === "function"
			? renderer
			: formatterList[renderer] || formatterList.default.bind({ label: currentLabelField }));
		}
	};

	return [
		disabled,
		multiple,
		anchor,
		placeholder,
		searchable,
		clearable,
		collapseSelection,
		name,
		required,
		creatable,
		virtualList,
		vlHeight,
		vlItemSize,
		className,
		style,
		refDropdown,
		refControl,
		dropdownActiveIndex,
		currentValueField,
		currentLabelField,
		isFetchingData,
		selectedOptions,
		alreadyCreated,
		listMessage,
		maxReached,
		availableItems,
		listIndex,
		itemRenderer,
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
		delimiter,
		fetchMode,
		fetchCallback,
		searchField,
		sortField,
		labelAsValue,
		getSelection,
		setSelection,
		clearByParent,
		slots,
		control_binding,
		dropdown_binding,
		$$scope
	];
}

class Svelecte extends SvelteComponent {
	constructor(options) {
		super();

		init(
			this,
			options,
			instance$5,
			create_fragment$5,
			safe_not_equal,
			{
				options: 36,
				valueField: 40,
				labelField: 41,
				placeholder: 3,
				searchable: 4,
				disabled: 0,
				renderer: 42,
				clearable: 5,
				selectOnTab: 43,
				multiple: 1,
				max: 44,
				collapseSelection: 6,
				name: 7,
				required: 8,
				anchor: 2,
				creatable: 9,
				creatablePrefix: 45,
				delimiter: 46,
				fetch: 37,
				fetchMode: 47,
				fetchCallback: 48,
				virtualList: 10,
				vlHeight: 11,
				vlItemSize: 12,
				searchField: 49,
				sortField: 50,
				class: 13,
				style: 14,
				selection: 38,
				value: 39,
				labelAsValue: 51,
				getSelection: 52,
				setSelection: 53,
				clearByParent: 54
			},
			[-1, -1, -1]
		);
	}

	get getSelection() {
		return this.$$.ctx[52];
	}

	get setSelection() {
		return this.$$.ctx[53];
	}

	get clearByParent() {
		return this.$$.ctx[54];
	}
}

export default Svelecte;
export { addFormatter, config };
