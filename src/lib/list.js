import Sifter from './sifter';

export function initSelection(initialValue, valueAsObject, config) {
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
        }
      }
      res.push(val);
    };
    return res;
  }, []);

  return initialSelection
    .sort((a, b) => _initialValue.indexOf(a[valueField]) < _initialValue.indexOf(b[valueField]) ? -1 : 1)
}

export function flatList(options, config) {
  const flatOpts = options.reduce((res, opt, i) => {
    if (config.isOptionArray) {
      res.push({
        [config.valueField]: i,
        [config.labelField]: opt
      });
      return res;
    }
    if (opt[config.optItems] && Array.isArray(opt[config.optItems])) {
      // we're skipping empty group
      if (opt[config.optItems].length) {
        config.optionsWithGroups = true;
        res.push({ label: opt[config.optLabel], $isGroupHeader: true });
        res.push(...opt[config.optItems].map(_opt => {
          _opt.$isGroupItem = true;
          return _opt;
        }));
      }
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
  })
}

export function getFilterProps(object) {
  if (object.options) object = object.options[0];
  const exclude = ['$disabled', '$isGroupHeader', '$isGroupItem'];
  return Object.keys(object).filter(prop => !exclude.includes(prop));
}

export function filterList(options, inputValue, excludeSelected, sifterSearchField, sifterSortField, config) {
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
      })
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
    : result.items.map(item => options[item.id])
  return mapped;
}

function createSifterSortField(prop) {
  return [{ field: prop, direction: 'asc'}];
}

export function indexList(options, includeCreateRow, config)  {
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
