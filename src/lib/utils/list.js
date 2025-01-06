import Sifter from './sifter.js';

/**
 * @typedef {object} ComponentConfig
 * @property {boolean} optionsWithGroups
 * @property {string} valueField
 * @property {string} labelField
 * @property {string} optLabel
 * @property {string} optItems
 * @property {string[]} optionProps
 */

/**
 * @typedef {object} SortDef
 * @property {string} field
 * @property {'asc'|'desc'} [direction]
 *
 * @typedef {object} SearchProps
 * @property {string|string[]} [fields]
 * @property {string|SortDef[]} [sort]
 * @property {boolean} [keepSelectionInList]
 * @property {boolean} [nesting]
 * @property {'or'} [conjunction]
 * @property {boolean} [skipSort]
 * @property {boolean} [startOnly]
 * @property {boolean} [wordsOnly]
 * @property {boolean} [disabled]
 */

/**
 * @param {string} valueField
 * @param {string} labelField
 * @param {string} optLabel
 * @param {string} optItems
 * @returns {ComponentConfig}
 */
export function createConfig(valueField, labelField, optLabel, optItems) {
  return {
    optionProps: [],
    optionsWithGroups: false,
    valueField,
    labelField,
    optLabel,
    optItems
  }
}

/**
 * @param {array} options
 * @param {array|null|object} initialValue
 * @param {boolean} valueAsObject
 * @param {string} valueField
 */
export function initSelection(options, initialValue, valueAsObject, valueField) {
  let initialValue_array = Array.isArray(initialValue)
    ? initialValue
    : [initialValue];

  if (valueAsObject) {
    initialValue_array = initialValue_array.map(opt => opt[valueField]);
  }

  /** @type {object[]} */
  const initialSelection = options.reduce((res, opt) => {
    if (initialValue_array.includes(opt[valueField])) {
      opt.$selected = true;
      res.push(opt);
    }
    return res;
  }, []);

  return initialSelection
    .sort((a, b) => initialValue_array.indexOf(a[valueField]) < initialValue_array.indexOf(b[valueField]) ? -1 : 1)
}

/**
 *
 * @param {object[]|string[]} options
 * @param {string?} valueField
 * @param {string?} labelField
 * @returns {object[]}
 */
export function ensureObjectArray(options, valueField, labelField) {
  return typeof options[0] === 'object'
    ? JSON.parse(JSON.stringify(options))
    : options.map(arrayValue => ({
      [valueField || 'value']: arrayValue,
      [labelField || 'text']: arrayValue
    }));
}

/**
 *
 * @param {object[]} options
 * @param {ComponentConfig} config
 * @returns
 */
export function flatList(options, config) {
  const flatOpts = options.reduce((res, opt, i) => {
    if (opt[config.optItems]) {
      if (opt[config.optItems].length === 0) return res;
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

/**
 * @param {object[]} options
 * @param {ComponentConfig} config
 */
function updateOptionProps(options, config) {
  options.some(opt => {
    if (opt.$isGroupHeader) return false;
    config.optionProps = getFilterProps(opt);
    return true;
  })
}

/**
 *
 * @param {object} object
 * @returns {string[]}
 */
export function getFilterProps(object) {
  const exclude = ['$disabled', '$isGroupHeader', '$isGroupItem', '$created', '$selected'];
  return Object.keys(object).filter(prop => !exclude.includes(prop));
}

/**
 *
 * @param {object[]} options
 * @param {?string} inputValue
 * @param {?Set} excludeSelected
 * @param {ComponentConfig} config
 * @param {SearchProps} searchProps
 * @returns {object[]}
 */
export function filterList(options, inputValue, excludeSelected, config, searchProps = {}) {
  if (!searchProps.keepSelectionInList && excludeSelected) {
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
      })
  }
  if (searchProps.disabled || !inputValue) return options;

  const sifter = new Sifter(options);
  /**
   * Sifter is used for searching to provide rich filter functionality.
   * But it degradate nicely, when optgroups are present
  */
  if (config.optionsWithGroups || searchProps.skipSort) {  // disable sorting
    sifter.getSortFunction = () => null;
  }
  let conjunction = 'and';
  if (inputValue.includes('|')) {
    conjunction = 'or';
    inputValue = inputValue.split('|').map(word => word.trim()).join(' ');
  }

  const result = sifter.search(inputValue, {
    fields: searchProps.fields || config.optionProps,
    sort: searchProps.sort || createSifterSortField(config.labelField),
    conjunction: searchProps.conjunction || conjunction,
    nesting: searchProps.nesting || false,
    wordsOnly: searchProps.wordsOnly || false,
    startOnly: searchProps.startOnly || false
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
    : result.items.map(item => options[item.id])
  return mapped;
}

function createSifterSortField(prop) {
  return [{ field: prop, direction: 'asc'}];
}

/**
 * Automatic setter for 'valueField' or 'labelField' when they are not set
 *
 * @param {string} type
 * @param {array} options
 * @param {string?} groupItemsField
 */
export function fieldInit(type, options, groupItemsField) {
  const isValue = type === 'value';
  let val = isValue  ? 'value' : 'text';              // selectize style defaults
  if (options && options.length) {
    // @ts-ignore
    const firstItem = options[0][groupItemsField] ? options[0][groupItemsField][0] : options[0];
    if (!firstItem || typeof firstItem === 'string') return val;
    const autoAddItem = isValue ? 0 : 1;
    const guessList = isValue
      ? ['id', 'value', 'ID']
      : ['name', 'title', 'label'];
    // @ts-ignore
    val = Object.keys(firstItem).filter(prop => guessList.includes(prop))
      .concat([Object.keys(firstItem)[autoAddItem]])  // auto add field (used as fallback) if empty list is returned
      .shift();
  }
  return val;
}
