<script>
import { onMount } from "svelte";


  let payload = null;

  function onSubmit(e) {
    const success = Nette.validateForm(e.target);
    if (!success) {
      payload = null; return
    };
    const object = {};
    const formData = new FormData(e.target);
    formData.forEach((value, key) => {
      if (object[key]) {
        object[key] += ', ' + value;
        return;
      }
      object[key] = value
    });
    payload = JSON.stringify(object, null, 2);
  }

  onMount(() => {
    /**
 * Live Form Validation for Nette Forms 3.0
 *
 * @author Robert Pösel, zakrava, Radek Ježdík, MartyIX, David Grudl
 * @version 2.0-dev
 * @url https://github.com/Robyer/nette-live-form-validation/
 * 
 * CUSTOM MODIFICATIONS:
 * 
 * Added custom validators:
 * Case insensitive comparison (multibyte characters supported)
 * - Nette.validators.BaseComponentsFormCustomValidator_ciEqual
 * - Nette.validators.BaseComponentsFormCustomValidator_ciNotEqual
 */

(function (global, factoryLiveValidation, factoryNetteForm) {

if (typeof define === 'function' && define.amd) {
    // AMD
    define(function () {
        return {
            LiveForm: factoryLiveValidation(global),
            Nette: factoryNetteForm(global)
        }
    })
} else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = {
        LiveForm: factoryLiveValidation(global),
        Nette: factoryNetteForm(global)
    }
} else {
    global.LiveForm = factoryLiveValidation(global);
    // Browser globals (root is window)
    var init = !global.Nette || !global.Nette.noInit;
    global.Nette = factoryNetteForm(global);
    if (init) {
        global.Nette.initOnLoad();
    }
}


}(typeof window !== 'undefined' ? window : this, function (window) {
'use strict'


var LiveForm = {
    options: {
        // CSS class of control's parent where error/valid class should be added; or "false" to use control directly
        showMessageClassOnParent: false,

        // CSS class of control's parent where error/valid message should be added (fallback to direct parent if not found); or "false" to use control's direct parent
        messageParentClass: false,

        // CSS class for an invalid control
        controlErrorClass: 'is-invalid',

        // CSS class for a valid control
        controlValidClass: 'is-valid',

        // CSS class for an error message
        messageErrorClass: 'invalid-tooltip',

        // control with this CSS class will show error/valid message even when control itself is hidden (useful for controls which are hidden and wrapped into special component)
        enableHiddenMessageClass: 'selectized',

        // control with this CSS class will have disabled live validation
        disableLiveValidationClass: ['no-live-validation'],

        // control with this CSS class will not show valid message
        disableShowValidClass: 'no-show-valid',

        // tag that will hold the error/valid message
        messageTag: 'div',

        // message element id = control id + this postfix
        messageIdPostfix: '_message',

        // show this html before error message itself
        messageErrorPrefix: '&nbsp;<i class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></i>&nbsp;',

        // show all errors when submitting form; or use "false" to show only first error
        showAllErrors: true,

        // show message when valid
        showValid: false,

        // delay in ms before validating on keyup/keydown; or use "false" to disable it
        wait: false,

        // vertical screen offset in px to scroll after focusing element with error (useful when using fixed navbar menu which may otherwise obscure the element in focus); or use "false" for default behavior
        focusScreenOffsetY: 50
    },
    lastEventType: null,
    forms: {}
};

LiveForm.setOptions = function (userOptions) {
    for (var prop in userOptions) {
        if (Object.prototype.hasOwnProperty.call(this.options, prop)) {
            this.options[prop] = userOptions[prop];
        }
    }
}

// Allow setting options before loading the script just by creating global LiveFormOptions object with options.
if (typeof window.LiveFormOptions !== 'undefined') {
    LiveForm.setOptions(window.LiveFormOptions);
}

LiveForm.isSpecialKey = function (k) {
    // http://stackoverflow.com/questions/7770561/jquery-javascript-reject-control-keys-on-keydown-event
    return (k == 20 /* Caps lock */
        || k == 16 /* Shift */
        || k == 9 /* Tab */
        || k == 27 /* Escape Key */
        || k == 17 /* Control Key */
        || k == 91 /* Windows Command Key */
        || k == 19 /* Pause Break */
        || k == 18 /* Alt Key */
        || k == 93 /* Right Click Point Key */
        || (k >= 35 && k <= 40) /* Home, End, Arrow Keys */
        || k == 45 /* Insert Key */
        || (k >= 33 && k <= 34) /*Page Down, Page Up */
        || (k >= 112 && k <= 123) /* F1 - F12 */
        || (k >= 144 && k <= 145)); /* Num Lock, Scroll Lock */
}

/**
 * Handlers for all the events that trigger validation
 * YOU CAN CHANGE these handlers (ie. to use jQuery events instead)
 */
LiveForm.setupHandlers = function (el) {
    if (this.hasClass(el, this.options.disableLiveValidationClass) || el.tagName === 'BUTTON')
        return;

    // Check if element was already initialized
    if (el.getAttribute("data-lfv-initialized"))
        return;

    // Remember we initialized this element so we won't do it again
    el.setAttribute('data-lfv-initialized', 'true');

    var self = this;

    var handler = function (event) {
        event = event || window.event;
        self.lastEventType = event.type;
        if (event.type === 'blur' && event.target.dataset.provide) {
          setTimeout(() => {
            Nette.validateControl(event.target ? event.target : event.srcElement);
          }, 150);
          return;
        };
        Nette.validateControl(event.target ? event.target : event.srcElement);
    };


    el.addEventListener('change', handler);
    el.addEventListener('blur', handler);
    el.addEventListener('keydown', function (event) {
        if (!self.isSpecialKey(event.which) && (self.options.wait === false || self.options.wait >= 200)) {
            // Hide validation span tag.
            self.removeClass(self.getGroupElement(this), self.options.controlErrorClass);
            self.removeClass(self.getGroupElement(this), self.options.controlValidClass);
            var messageEl = self.getMessageElement(this);
            messageEl.innerHTML = '';
            messageEl.className = '';

            // Cancel timeout to run validation handler
            if (self.timeout) {
                clearTimeout(self.timeout);
            }
        }
    });
    el.addEventListener('keyup', function (event) {
        if (self.options.wait !== false) {
            event = event || window.event;
            if (event.keyCode !== 9) {
                if (self.timeout) clearTimeout(self.timeout);
                self.timeout = setTimeout(function () {
                    handler(event);
                }, self.options.wait);
            }
        }
    });
};

LiveForm.processServerErrors = function (el) {
    if (this.hasClass(el, this.options.disableLiveValidationClass) || el.tagName === 'BUTTON' ||  el.dataset.lfvInitialized == 'true') return;
    var messageEl = this.getMessageElement(el);
    var parentEl = this.getMessageParent(el); // This is parent element which contain the error elements

    var errors = [];

    // Find existing error elements by class (from server-validation)
    var errorEls = parentEl.getElementsByClassName(this.options.messageErrorClass);
    for (var i = errorEls.length - 1; i > -1; i--) {
        // Don't touch our main message element
        if (errorEls[i] == messageEl)
            continue;

        // Remove only direct children
        var errorParent = errorEls[i].parentNode;
        if (errorParent == parentEl) {
            errors.push(errorEls[i].outerHTML);
            errorParent.removeChild(errorEls[i]);
        }
    }

    // Wrap all server errors into one element
    if (errors.length > 0) {
        messageEl.innerHTML = errors.join("");
    }
};

LiveForm.addError = function (el, message) {
    // Ignore elements with disabled live validation
    if (this.hasClass(el, this.options.disableLiveValidationClass))
        return;

    var groupEl = this.getGroupElement(el);
    this.setFormProperty(el.form, "hasError", true);
    this.addClass(groupEl, this.options.controlErrorClass);

    if (this.options.showValid) {
        this.removeClass(groupEl, this.options.controlValidClass);
    }

    if (!message) {
        message = '&nbsp;';
    } else {
        message = this.options.messageErrorPrefix + message;
    }

    var messageEl = this.getMessageElement(el);
    messageEl.innerHTML = message;
    messageEl.className = this.options.messageErrorClass;
};

LiveForm.removeError = function (el) {
    // We don't want to remove any errors during onLoadValidation
    if (this.getFormProperty(el.form, "onLoadValidation"))
        return;

    var groupEl = this.getGroupElement(el);
    this.removeClass(groupEl, this.options.controlErrorClass);

    var id = el.getAttribute('data-lfv-message-id');
    if (id) {
        var messageEl = this.getMessageElement(el);
        messageEl.innerHTML = '';
        messageEl.className = '';
    }

    if (this.options.showValid) {
        if (this.showValid(el))
            this.addClass(groupEl, this.options.controlValidClass);
        else
            this.removeClass(groupEl, this.options.controlValidClass);
    }
};

LiveForm.showValid = function (el) {
    if (el.type) {
        var type = el.type.toLowerCase();
        if (type == 'checkbox' || type == 'radio') {
            return false;
        }
    }

    var rules = JSON.parse(el.getAttribute('data-nette-rules'));
    if (rules === null || rules.length == 0) {
        return false;
    }

    if (Nette.getEffectiveValue(el) == '') {
        return false;
    }

    if (this.hasClass(el, this.options.disableShowValidClass)) {
        return false;
    }

    return true;
};

LiveForm.getGroupElement = function (el) {
    if (this.options.showMessageClassOnParent === false)
        return el;

    var groupEl = el;

    while (!this.hasClass(groupEl, this.options.showMessageClassOnParent)) {
        groupEl = groupEl.parentNode;

        if (groupEl === null) {
            return el;
        }
    }

    return groupEl;
}

LiveForm.getMessageId = function (el) {
    var tmp = el.id + this.options.messageIdPostfix;

    // For elements without ID, or multi elements (with same name), we must generate whole ID ourselves
    if (el.name && (!el.id || !el.form.elements[el.name].tagName)) {
        // Strip possible [] from name
        var name = el.name.match(/\[\]$/) ? el.name.match(/(.*)\[\]$/)[1] : el.name;
        // Generate new ID based on form ID, element name and messageIdPostfix from options
        tmp = (el.form.id ? el.form.id : 'frm') + '-' + name + this.options.messageIdPostfix;
    }

    // We want unique ID which doesn't exist yet
    var id = tmp,
        i = 0;
    while (document.getElementById(id)) {
        id = id + '_' + ++i;
    }

    return id;
}

LiveForm.getMessageElement = function (el) {
    // For multi elements (with same name) work only with first element attributes
    if (el.name && el.name.match(/\[\]$/)) {
        el = el.form.elements[el.name].tagName ? el : el.form.elements[el.name][0];
    }

    var id = el.getAttribute('data-lfv-message-id');
    if (!id) {
        // ID is not specified yet, let's create a new one
        id = this.getMessageId(el);

        // Remember this id for next use
        el.setAttribute('data-lfv-message-id', id);
    }

    var messageEl = document.getElementById(id);
    if (!messageEl) {
        // Message element doesn't exist, lets create a new one
        messageEl = document.createElement(this.options.messageTag);
        messageEl.id = id;
        if (el.style.display == 'none' && !this.hasClass(el, this.options.enableHiddenMessageClass)) {
            messageEl.style.display = 'none';
        }

        var parentEl = this.getMessageParent(el);
        if (parentEl === el.parentNode) {
            parentEl.insertBefore(messageEl, el.nextSibling);
        } else if (parentEl) {
            typeof parentEl.append === 'function' ? parentEl.append(messageEl) : parentEl.appendChild(messageEl);
        }
    }

    return messageEl;
};

LiveForm.getMessageParent = function (el) {
    var parentEl = el.parentNode;
    var parentFound = false;

    if (this.options.messageParentClass !== false) {
        parentFound = true;
        while (!this.hasClass(parentEl, this.options.messageParentClass)) {
            parentEl = parentEl.parentNode;

            if (parentEl === null) {
                // We didn't found wanted parent, so use element's direct parent
                parentEl = el.parentNode;
                parentFound = false;
                break;
            }
        }
    }

    // Don't append error message to radio/checkbox input's label, but along label
    if (el.type) {
        var type = el.type.toLowerCase();
        if ((type == 'checkbox' || type == 'radio') && parentEl.tagName == 'LABEL') {
            parentEl = parentEl.parentNode;
        }
    }

    // For multi elements (with same name) use parent's parent as parent (if wanted one is not found)
    if (!parentFound && el.name && !el.form.elements[el.name].tagName) {
        parentEl = parentEl.parentNode;
    }

    return parentEl;
}

LiveForm.addClass = function (el, className) {
  el.classList.add(className);
};

LiveForm.hasClass = function (el, className) {
  return Array.isArray(className) ? className.some(cl => el.classList.contains(cl)) : el.classList.contains(className);
};

LiveForm.removeClass = function (el, className) {
  el.classList.remove(className);
};

LiveForm.getFormProperty = function (form, propertyName) {
    if (form == null || this.forms[form.id] == null)
        return false;

    return this.forms[form.id][propertyName];
};

LiveForm.setFormProperty = function (form, propertyName, value) {
    if (form == null)
        return;

    if (this.forms[form.id] == null)
        this.forms[form.id] = {};

    this.forms[form.id][propertyName] = value;
};

return LiveForm;

////////////////////////////   modified netteForms.js   ///////////////////////////////////

/**
 * NetteForms - simple form validation.
 *
 * This file is part of the Nette Framework (https://nette.org)
 * Copyright (c) 2004 David Grudl (https://davidgrudl.com)
 */
/*
(function(global, factory) {
    if (!global.JSON) {
        return;
    }
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory(global);
        });
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(global);
    } else {
        var init = !global.Nette || !global.Nette.noInit;
        global.Nette = factory(global);
        if (init) {
            global.Nette.initOnLoad();
        }
    }
}(typeof window !== 'undefined' ? window : this, function(window) {
*/

}, function (window) {
'use strict';

var Nette = {};
var preventFiltering = {};
var formToggles = {};

// LiveForm: original netteForms.js code
// Nette.formErrors = [];
Nette.version = '3.0';


/**
 * Function to execute when the DOM is fully loaded.
 * @private
 */
Nette.onDocumentReady = function (callback) {
    if (document.readyState !== 'loading') {
        callback.call(this);
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};


/**
 * Attaches a handler to an event for the element.
 */
Nette.addEvent = function (element, on, callback) {
    if (element.addEventListener) {
        element.addEventListener(on, callback);
    } else if (on === 'DOMContentLoaded') {
        element.attachEvent('onreadystatechange', function () {
            if (element.readyState === 'complete') {
                callback.call(this);
            }
        });
    } else {
        element.attachEvent('on' + on, getHandler(callback));
    }
};

/**
 * Returns the value of form element.
 */
Nette.getValue = function (elem) {
    var i;
    if (!elem) {
        return null;

    } else if (!elem.tagName) { // RadioNodeList, HTMLCollection, array
        return elem[0] ? Nette.getValue(elem[0]) : null;

    } else if (elem.type === 'radio') {
        var elements = elem.form.elements; // prevents problem with name 'item' or 'namedItem'
        for (i = 0; i < elements.length; i++) {
            if (elements[i].name === elem.name && elements[i].checked) {
                return elements[i].value;
            }
        }
        return null;

    } else if (elem.type === 'file') {
        return elem.files || elem.value;

    } else if (elem.tagName.toLowerCase() === 'select') {
        var index = elem.selectedIndex,
            options = elem.options,
            values = [];

        if (elem.type === 'select-one') {
            return index < 0 ? null : options[index].value;
        }

        for (i = 0; i < options.length; i++) {
            if (options[i].selected) {
                values.push(options[i].value);
            }
        }
        return values;

    } else if (elem.name && elem.name.match(/\[\]$/)) { // multiple elements []
        elements = elem.form.elements[elem.name].tagName ? [elem] : elem.form.elements[elem.name];
        values = [];

        for (i = 0; i < elements.length; i++) {
            // LiveForm: original netteForms.js code
            /*if (elements[i].type !== 'checkbox' || elements[i].checked) {
                values.push(elements[i].value);
            }*/
            // LiveForm: addition
            var value = elements[i].value;
            if (elements[i].type === 'checkbox' && elements[i].checked) {
                values.push(value);
            } else if (elements[i].type !== 'checkbox' && value !== '') {
                values.push(value);
            }
        }
        return values;

    } else if (elem.type === 'checkbox') {
        return elem.checked;

    } else if (elem.tagName.toLowerCase() === 'textarea') {
        return elem.value.replace('\r', '');

    } else {
        return elem.value.replace('\r', '').replace(/^\s+|\s+$/g, '');
    }
};


/**
 * Returns the effective value of form element.
 */
Nette.getEffectiveValue = function (elem, filter) {
    var val = Nette.getValue(elem);
    if (elem.getAttribute) {
        if (val === elem.getAttribute('data-nette-empty-value')) {
            val = '';
        }
    }
    if (filter && preventFiltering[elem.name] === undefined) {
        preventFiltering[elem.name] = true;
        var ref = {value: val};
        Nette.validateControl(elem, null, true, ref);
        val = ref.value;
        delete preventFiltering[elem.name];
    }
    return val;
};


/**
 * Validates form element against given rules.
 */
Nette.validateControl = function (elem, rules, onlyCheck, value, emptyOptional) {
    // LiveForm: addition
    // Fix for CheckboxList - validation rules are present always only on first input
    if (elem.name && elem.name.match(/\[\]$/) && elem.type.toLowerCase() == 'checkbox') {
        elem = elem.form.elements[elem.name].tagName ? elem : elem.form.elements[elem.name][0];
    }
    elem = elem.tagName ? elem : elem[0]; // RadioNodeList
    rules = rules || JSON.parse(elem.getAttribute('data-nette-rules') || '[]');
    value = value === undefined ? {value: Nette.getEffectiveValue(elem)} : value;
    emptyOptional = emptyOptional || !Nette.validateRule(elem, ':filled', null, value);
    for (var id = 0, len = rules.length; id < len; id++) {
        var rule = rules[id],
            op = rule.op.match(/(~)?([^?]+)/),
            curElem = rule.control ? elem.form.elements.namedItem(rule.control) : elem;

        rule.neg = op[1];
        rule.op = op[2];
        rule.condition = !!rule.rules;

        if (!curElem) {
            continue;
        } else if (emptyOptional && !rule.condition && rule.op !== ':filled') {
            continue;
        }

        curElem = curElem.tagName ? curElem : curElem[0]; // RadioNodeList
        var success = Nette.validateRule(curElem, rule.op, rule.arg, elem === curElem ? value : undefined);
        if (success === null) {
            continue;
        } else if (rule.neg) {
            success = !success;
        }

        if (rule.condition && success) {
            if (!Nette.validateControl(elem, rule.rules, onlyCheck, value, rule.op === ':blank' ? false : emptyOptional)) {
                return false;
            }
        } else if (!rule.condition && !success) {
            if (Nette.isDisabled(curElem)) {
                continue;
            }
            if (!onlyCheck) {
                var arr = Array.isArray(rule.arg) ? rule.arg : [rule.arg],
                    message = rule.msg.replace(/%(value|\d+)/g, function (foo, m) {
                        return Nette.getValue(m === 'value' ? curElem : elem.form.elements.namedItem(arr[m].control));
                    });
                Nette.addError(curElem, message);
            }
            return false;
        }
    }

    if (elem.type === 'number' && !elem.validity.valid) {
        if (!onlyCheck) {
            Nette.addError(elem, 'Please enter a valid value.');
        }
        return false;
    }

    // LiveForm: addition
    if (!onlyCheck) {
        LiveForm.removeError(elem);
    }

    return true;
};


/**
 * Validates whole form.
 */
Nette.validateForm = function (sender, onlyCheck) {
    var form = sender.form || sender,
        scope = false;

    // LiveForm: addition
    LiveForm.setFormProperty(form, "hasError", false);

    // LiveForm: original netteForms.js code
    // Nette.formErrors = [];

    if (form['nette-submittedBy'] && form['nette-submittedBy'].getAttribute('formnovalidate') !== null) {
        var scopeArr = JSON.parse(form['nette-submittedBy'].getAttribute('data-nette-validation-scope') || '[]');
        if (scopeArr.length) {
            scope = new RegExp('^(' + scopeArr.join('-|') + '-)');
        } else {
            // LiveForm: original netteForms.js code
            // Nette.showFormErrors(form, []);
            return true;
        }
    }

    var radios = {}, i, elem;
    // LiveForm: addition
    var success = true;

    for (i = 0; i < form.elements.length; i++) {
        elem = form.elements[i];

        if (elem.tagName && !(elem.tagName.toLowerCase() in {input: 1, select: 1, textarea: 1, button: 1})) {
            continue;

        } else if (elem.type === 'radio') {
            if (radios[elem.name]) {
                continue;
            }
            radios[elem.name] = true;
        }

        if ((scope && !elem.name.replace(/]\[|\[|]|$/g, '-').match(scope)) || Nette.isDisabled(elem)) {
            continue;
        }

        // LiveForm: addition
        success = Nette.validateControl(elem) && success;
        if (!success && !LiveForm.options.showAllErrors) {
            break;
        }
        // LiveForm: original netteForms.js code
        /*if (!Nette.validateControl(elem, null, onlyCheck) && !Nette.formErrors.length) {
            return false;
        }*/
    }

    // LiveForm: change
    return success;

    // LiveForm: original netteForms.js code
    /*var success = !Nette.formErrors.length;
    Nette.showFormErrors(form, Nette.formErrors);
    return success;*/
};


/**
 * Check if input is disabled.
 */
Nette.isDisabled = function (elem) {
    if (elem.type === 'radio') {
        for (var i = 0, elements = elem.form.elements; i < elements.length; i++) {
            if (elements[i].name === elem.name && !elements[i].disabled) {
                return false;
            }
        }
        return true;
    }
    return elem.disabled;
};


// LiveForm: change
/**
 * Display error message.
 */
Nette.addError = function (elem, message) {
    // LiveForm: addition
    var noLiveValidation = LiveForm.hasClass(elem, LiveForm.options.disableLiveValidationClass);
    // User explicitly disabled live-validation so we want to show simple alerts
    if (noLiveValidation) {
        // notify errors for elements with disabled live validation (but only errors and not during onLoadValidation)
        if (message && !LiveForm.getFormProperty(elem.form, "hasError") && !LiveForm.getFormProperty(elem.form, "onLoadValidation")) {
            alert(message);
        }
    }
    if (elem.focus && !LiveForm.getFormProperty(elem.form, "hasError")) {
        if (!LiveForm.focusing) {
            LiveForm.focusing = true;
            elem.focus();
            setTimeout(function () {
                LiveForm.focusing = false;

                // Scroll by defined offset (if enabled)
                // NOTE: We use it with setTimetout because IE9 doesn't always catch instant scrollTo request
                var focusOffsetY = LiveForm.options.focusScreenOffsetY;
                if (focusOffsetY !== false && elem.getBoundingClientRect().top < focusOffsetY) {
                    window.scrollBy(0, elem.getBoundingClientRect().top - focusOffsetY);
                }
            }, 10);
        }
    }
    if (!noLiveValidation) {
        LiveForm.addError(elem, message);
    }
};


// LiveForm: original netteForms.js code
/*/!**
 * Adds error message to the queue.
 *!/
Nette.addError = function(elem, message) {
    Nette.formErrors.push({
        element: elem,
        message: message
    });
};*/


// LiveForm: original netteForms.js code
/*/!**
 * Display error messages.
 *!/
Nette.showFormErrors = function(form, errors) {
    var messages = [],
        focusElem;
    for (var i = 0; i < errors.length; i++) {
        var elem = errors[i].element,
            message = errors[i].message;
        if (messages.indexOf(message) < 0) {
            messages.push(message);
            if (!focusElem && elem.focus) {
                focusElem = elem;
            }
        }
    }
    if (messages.length) {
        alert(messages.join('\n'));
        if (focusElem) {
            focusElem.focus();
        }
    }
};*/


/**
 * Validates single rule.
 */
Nette.validateRule = function (elem, op, arg, value) {
    value = value === undefined ? {value: Nette.getEffectiveValue(elem, true)} : value;

    if (op.charAt(0) === ':') {
        op = op.substr(1);
    }
    op = op.replace('::', '_');
    op = op.replace(/\\/g, '');

    var arr = Array.isArray(arg) ? arg.slice(0) : [arg];
    for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] && arr[i].control) {
            var control = elem.form.elements.namedItem(arr[i].control);
            arr[i] = control === elem ? value.value : Nette.getEffectiveValue(control, true);
        }
    }
    return Nette.validators[op]
        ? Nette.validators[op](elem, Array.isArray(arg) ? arr : arr[0], value.value, value)
        : null;
};


Nette.validators = {
    filled: function (elem, arg, val) {
        if (elem.type === 'number' && elem.validity.badInput) {
            return true;
        }
        return val !== '' && val !== false && val !== null
            && (!Array.isArray(val) || !!val.length)
            && (!window.FileList || !(val instanceof window.FileList) || val.length);
    },

    blank: function (elem, arg, val) {
        return !Nette.validators.filled(elem, arg, val);
    },

    valid: function (elem) {
        return Nette.validateControl(elem, null, true);
    },

    equal: function (elem, arg, val) {
        if (arg === undefined) {
            return null;
        }

        function toString(val) {
            if (typeof val === 'number' || typeof val === 'string') {
                return '' + val;
            } else {
                return val === true ? '1' : '';
            }
        }

        val = Array.isArray(val) ? val : [val];
        arg = Array.isArray(arg) ? arg : [arg];
        loop:
            for (var i1 = 0, len1 = val.length; i1 < len1; i1++) {
                for (var i2 = 0, len2 = arg.length; i2 < len2; i2++) {
                    if (toString(val[i1]) === toString(arg[i2])) {
                        continue loop;
                    }
                }
                return false;
            }
        return true;
    },

    notEqual: function (elem, arg, val) {
        return arg === undefined ? null : !Nette.validators.equal(elem, arg, val);
    },

    minLength: function (elem, arg, val) {
        if (elem.type === 'number') {
            if (elem.validity.tooShort) {
                return false;
            } else if (elem.validity.badInput) {
                return null;
            }
        }
        return val.length >= arg;
    },

    maxLength: function (elem, arg, val) {
        if (elem.type === 'number') {
            if (elem.validity.tooLong) {
                return false;
            } else if (elem.validity.badInput) {
                return null;
            }
        }
        return val.length <= arg;
    },

    length: function (elem, arg, val) {
        if (elem.type === 'number') {
            if (elem.validity.tooShort || elem.validity.tooLong) {
                return false;
            } else if (elem.validity.badInput) {
                return null;
            }
        }
        arg = Array.isArray(arg) ? arg : [arg, arg];
        return (arg[0] === null || val.length >= arg[0]) && (arg[1] === null || val.length <= arg[1]);
    },

    email: function (elem, arg, val) {
        return (/^("([ !#-[\]-~]|\\[ -~])+"|[-a-z0-9!#$%&'*+/=?^_`{|}~]+(\.[-a-z0-9!#$%&'*+/=?^_`{|}~]+)*)@([0-9a-z\u00C0-\u02FF\u0370-\u1EFF]([-0-9a-z\u00C0-\u02FF\u0370-\u1EFF]{0,61}[0-9a-z\u00C0-\u02FF\u0370-\u1EFF])?\.)+[a-z\u00C0-\u02FF\u0370-\u1EFF]([-0-9a-z\u00C0-\u02FF\u0370-\u1EFF]{0,17}[a-z\u00C0-\u02FF\u0370-\u1EFF])?$/i).test(val);
    },

    url: function (elem, arg, val, value) {
      console.log('validate', val);
        if (!(/^[a-z\d+.-]+:/).test(val)) {
            val = 'http://' + val;
        }
        if ((/^https?:\/\/((([-_0-9a-z\u00C0-\u02FF\u0370-\u1EFF]+\.)*[0-9a-z\u00C0-\u02FF\u0370-\u1EFF]([-0-9a-z\u00C0-\u02FF\u0370-\u1EFF]{0,61}[0-9a-z\u00C0-\u02FF\u0370-\u1EFF])?\.)?[a-z\u00C0-\u02FF\u0370-\u1EFF]([-0-9a-z\u00C0-\u02FF\u0370-\u1EFF]{0,17}[a-z\u00C0-\u02FF\u0370-\u1EFF])?|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\[[0-9a-f:]{3,39}\])(:\d{1,5})?(\/\S*)?$/i).test(val)) {
            value.value = val;
            return true;
        }
        return false;
    },

    regexp: function (elem, arg, val) {
        var parts = typeof arg === 'string' ? arg.match(/^\/(.*)\/([imu]*)$/) : false;
        try {
            return parts && (new RegExp(parts[1], parts[2].replace('u', ''))).test(val);
        } catch (e) {
        } // eslint-disable-line no-empty
    },

    pattern: function (elem, arg, val, value, caseInsensitive) {
        if (typeof arg !== 'string') {
            return null;
        }

        try {
            try {
                var regExp = new RegExp('^(?:' + arg + ')$', caseInsensitive ? 'ui' : 'u');
            } catch (e) {
                regExp = new RegExp('^(?:' + arg + ')$', caseInsensitive ? 'i' : '');
            }

            if (window.FileList && val instanceof FileList) {
                for (var i = 0; i < val.length; i++) {
                    if (!regExp.test(val[i].name)) {
                        return false;
                    }
                }

                return true;
            }
            return regExp.test(val);
        } catch (e) {
        } // eslint-disable-line no-empty
    },

    patternCaseInsensitive: function (elem, arg, val) {
        return Nette.validators.pattern(elem, arg, val, null, true);
    },

    numeric: function (elem, arg, val) {
        if (elem.type === 'number' && elem.validity.badInput) {
            return false;
        }
        return (/^[0-9]+$/).test(val);
    },

    integer: function (elem, arg, val) {
        if (elem.type === 'number' && elem.validity.badInput) {
            return false;
        }
        return (/^-?[0-9]+$/).test(val);
    },

    'float': function (elem, arg, val, value) {
        if (elem.type === 'number' && elem.validity.badInput) {
            return false;
        }
        val = val.replace(/ +/g, '').replace(/,/g, '.');
        if ((/^-?[0-9]*\.?[0-9]+$/).test(val)) {
            value.value = val;
            return true;
        }
        return false;
    },

    min: function (elem, arg, val) {
        if (elem.type === 'number') {
            if (elem.validity.rangeUnderflow) {
                return false;
            } else if (elem.validity.badInput) {
                return null;
            }
        }
        return arg === null || parseFloat(val) >= arg;
    },

    max: function (elem, arg, val) {
        if (elem.type === 'number') {
            if (elem.validity.rangeOverflow) {
                return false;
            } else if (elem.validity.badInput) {
                return null;
            }
        }
        return arg === null || parseFloat(val) <= arg;
    },

    range: function (elem, arg, val) {
        if (elem.type === 'number') {
            if (elem.validity.rangeUnderflow || elem.validity.rangeOverflow) {
                return false;
            } else if (elem.validity.badInput) {
                return null;
            }
        }
        return Array.isArray(arg) ?
            ((arg[0] === null || parseFloat(val) >= arg[0]) && (arg[1] === null || parseFloat(val) <= arg[1])) : null;
    },

    submitted: function (elem) {
        return elem.form['nette-submittedBy'] === elem;
    },

    fileSize: function (elem, arg, val) {
        if (window.FileList) {
            for (var i = 0; i < val.length; i++) {
                if (val[i].size > arg) {
                    return false;
                }
            }
        }
        return true;
    },

    image: function (elem, arg, val) {
        if (window.FileList && val instanceof window.FileList) {
            for (var i = 0; i < val.length; i++) {
                var type = val[i].type;
                if (type && type !== 'image/gif' && type !== 'image/png' && type !== 'image/jpeg') {
                    return false;
                }
            }
        }
        return true;
    },

    'static': function (elem, arg) {
        return arg;
    },

    BaseComponentsFormCustomValidator_ciEqual: function (elem, arg, val) {
      if (arg === undefined) {
        return null;
      }

      function toString(val) {
        if (typeof val === 'number' || typeof val === 'string') {
          return '' + val;
        } else {
          return val === true ? '1' : '';
        }
      }

      function ciEquals(a, b) {
        return typeof a === 'string' && typeof b === 'string'
          ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
          : a === b;
      }

      val = Array.isArray(val) ? val : [val];
      arg = Array.isArray(arg) ? arg : [arg];
      loop:
      for (var i1 = 0, len1 = val.length; i1 < len1; i1++) {
        for (var i2 = 0, len2 = arg.length; i2 < len2; i2++) {
          if (ciEquals(toString(val[i1]), toString(arg[i2]))) {
            continue loop;
          }
        }
        return false;
      }
      return true;
    },

    BaseComponentsFormCustomValidator_ciNotEqual: function (elem, arg, val) {
      return arg === undefined ? null : !Nette.validators.BaseComponentsFormCustomValidator_ciEqual(elem, arg, val);
    }
};


/**
 * Process all toggles in form.
 */
Nette.toggleForm = function (form, elem) {
    var i;
    formToggles = {};
    for (i = 0; i < form.elements.length; i++) {
        if (form.elements[i].tagName.toLowerCase() in {input: 1, select: 1, textarea: 1, button: 1}) {
            Nette.toggleControl(form.elements[i], null, null, !elem);
        }
    }

    for (i in formToggles) {
        Nette.toggle(i, formToggles[i], elem);
    }
};


/**
 * Process toggles on form element.
 */
Nette.toggleControl = function (elem, rules, success, firsttime, value) {
    rules = rules || JSON.parse(elem.getAttribute('data-nette-rules') || '[]');
    value = value === undefined ? {value: Nette.getEffectiveValue(elem)} : value;

    var has = false,
        handled = [],
        handler = function () {
            Nette.toggleForm(elem.form, elem);
        },
        curSuccess;

    for (var id = 0, len = rules.length; id < len; id++) {
        var rule = rules[id],
            op = rule.op.match(/(~)?([^?]+)/),
            curElem = rule.control ? elem.form.elements.namedItem(rule.control) : elem;

        if (!curElem) {
            continue;
        }

        curSuccess = success;
        if (success !== false) {
            rule.neg = op[1];
            rule.op = op[2];
            curSuccess = Nette.validateRule(curElem, rule.op, rule.arg, elem === curElem ? value : undefined);
            if (curSuccess === null) {
                continue;

            } else if (rule.neg) {
                curSuccess = !curSuccess;
            }
            if (!rule.rules) {
                success = curSuccess;
            }
        }
        if ((rule.rules && Nette.toggleControl(elem, rule.rules, curSuccess, firsttime, value)) || rule.toggle) {
            has = true;
            if (firsttime) {
                var name = curElem.tagName ? curElem.name : curElem[0].name,
                    els = curElem.tagName ? curElem.form.elements : curElem;

                for (var i = 0; i < els.length; i++) {
                    if (els[i].name === name && handled.indexOf(els[i]) < 0) {
                        els[i].addEventListener('change', handler);
                        handled.push(els[i]);
                    }
                }
            }
            for (var id2 in rule.toggle || []) {
                if (Object.prototype.hasOwnProperty.call(rule.toggle, id2)) {
                    formToggles[id2] = formToggles[id2] || (rule.toggle[id2] ? curSuccess : !curSuccess);
                }
            }
        }
    }
    return has;
};


/**
 * Displays or hides HTML element.
 */
Nette.toggle = function (id, visible, srcElement) { // eslint-disable-line no-unused-vars
  var elem = document.getElementById(id);
  if (elem) {
    elem.style.display = visible ? '' : 'none';
  }
};


/**
 * Setup handlers.
 */
Nette.initForm = function (form) {
    Nette.toggleForm(form);

    if (form.noValidate) {
        return;
    }

    form.noValidate = true;

    // LiveForm: addition
    LiveForm.forms[form.id] = {
        hasError: false,
        onLoadValidation: false
    };

    form.addEventListener('submit', function (e) {
        if (!Nette.validateForm(form)) {
            e.stopPropagation();
            e.preventDefault();
        }
    });

    // LiveForm: addition
    for (var i = 0; i < form.elements.length; i++) {
        LiveForm.setupHandlers(form.elements[i]);
        LiveForm.processServerErrors(form.elements[i]);
    }
};

/**
 * @private
 */
Nette.initOnLoad = function () {
    Nette.addEvent(document, 'DOMContentLoaded', function () {
        // LiveForm: original netteForms.js code
        /*
                for (var i = 0; i < document.forms.length; i++) {
                    var form = document.forms[i];
                    for (var j = 0; j < form.elements.length; j++) {
                        if (form.elements[j].getAttribute('data-nette-rules')) {
                            Nette.initForm(form);
                            break;
                        }
                    }
                }
                Nette.addEvent(document.body, 'click', function(e) {
                    var target = e.target || e.srcElement;
                    if (target.form && target.type in {submit: 1, image: 1}) {
                        target.form['nette-submittedBy'] = target;
                    }
                });
        */
        // LiveForm: addition
        Nette.init();
    });
};

// LiveForm: addition
/**
 * Init function to be called in case usage as module
 *
 * @public
 */
Nette.init = function () {
    for (var i = 0; i < document.forms.length; i++) {
        var form = document.forms[i];
        for (var j = 0; j < form.elements.length; j++) {
            if (form.elements[j].getAttribute('data-nette-rules')) {
                Nette.initForm(form);

                if (LiveForm.hasClass(form, 'validate-on-load')) {
                    // This is not so nice way, but I don't want to spoil validateForm, validateControl and other methods with another parameter
                    LiveForm.setFormProperty(form, "onLoadValidation", true);
                    Nette.validateForm(form);
                    LiveForm.setFormProperty(form, "onLoadValidation", false);
                }

                break;
            }
        }
    }

    Nette.addEvent(document.body, 'click', function (e) {
        var target = e.target || e.srcElement;
        if (target.form && target.type in {submit: 1, image: 1}) {
            target.form['nette-submittedBy'] = target;
        }
    });
};


/**
 * Determines whether the argument is an array.
 */
Nette.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
};


/**
 * Search for a specified value within an array.
 */
Nette.inArray = function (arr, val) {
    if ([].indexOf) {
        return arr.indexOf(val) > -1;
    } else {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === val) {
                return true;
            }
        }
        return false;
    }
};


/**
 * Converts string to web safe characters [a-z0-9-] text.
 */
Nette.webalize = function (s) {
    s = s.toLowerCase();
    var res = '', i, ch;
    for (i = 0; i < s.length; i++) {
        ch = Nette.webalizeTable[s.charAt(i)];
        res += ch ? ch : s.charAt(i);
    }
    return res.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};

Nette.webalizeTable = {\u00e1: 'a', \u00e4: 'a', \u010d: 'c', \u010f: 'd', \u00e9: 'e', \u011b: 'e', \u00ed: 'i', \u013e: 'l', \u0148: 'n', \u00f3: 'o', \u00f4: 'o', \u0159: 'r', \u0161: 's', \u0165: 't', \u00fa: 'u', \u016f: 'u', \u00fd: 'y', \u017e: 'z'};

return Nette;
}));

  })

  let netteRules = '[{"op":":filled","msg":"This field is required."}]';
</script>


<form action="" on:submit|preventDefault={onSubmit} novalidate>
  <el-svelecte
    name="parent_value" placeholder="Select parent value"
    options={`[{"value":"posts","text":"Posts"},{"value":"users","text":"Users"},{"value":"comments","text":"Comments"}]`}
    id="is-parent" required>
  </el-svelecte>
  <el-svelecte name="child_value" parent="is-parent" required placeholder="Pick from child select"
    fetch="https://jsonplaceholder.typicode.com/[parent]" on:change={e => console.log('D', e.detail)}>
  </el-svelecte>
  <!-- server-side rendered -->
  <div>Server-side rendered inner select:</div>
  <el-svelecte options={`[{"id":"posts","label":"Posts", "prop": "Posts"},{"id":"users","label":"Users", "prop": "Users"},{"id":"comments","label":"Comments", "prop": "Comment"}]`}
    style="margin-bottom: 0"
    lazy-dropdown="false"
    multiple
    reset-on-select="false"
  >
    <select id="anchored" name="demo" multiple on:change={e => console.log(e.target.selectedOptions)}
      data-nette-rules={netteRules}
    ></select>
  </el-svelecte>
  <small>This <code>&lt;el-svelecte&gt;</code> has nested (anchored) <code>&lt;select&gt;</code>, when you <em>need</em> to have it rendered server-side. This setup is specific, 
    because inner select needs to have <code>name</code> and <code>required</code> (if applicable) properties specified manually. (They are not inherited from el-svelecte parent)</small>
  <div class="mt-2">
    <button type="submit" class="btn btn-success">Send form</button>
  </div>
  {#if payload}
    <pre>{payload}</pre>
  {/if}
</form>