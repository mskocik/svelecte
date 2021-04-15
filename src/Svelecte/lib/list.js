import Sifter from './sifter';


export function flatList(options, config) {
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
  })
}

function getFilterProps(object) {
  if (object.options) object = object.options[0];
  const exclude = ['isSelected', 'isDisabled' ,'selected', 'disabled', '$isGroupHeader', '$isGroupItem'];
  return Object.keys(object).filter(prop => !exclude.includes(prop));
}

export function filterList(options, inputValue, excludeSelected, sifterSearchField, sifterSortField, config) {
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
        })
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
  if (inputValue.startsWith('||')) {
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
