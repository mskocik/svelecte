import Sifter from './sifter';

let sifter = null;
let optionsWithGroups = false;
let indexMapping = {
  map: [],
  first: null,
  last: null,
  hasCreateRow: false,
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

// TODO: implement customization of this
let sifterSearchField = ['text'];
let sifterSortField = [{ field: 'text', direction: 'asc'}];

export function flatList(options) {
  const flatOpts = options.reduce((res, opt) => {
    if (opt.options && opt.options.length) {
      optionsWithGroups = true;
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
  sifter = new Sifter(flatOpts);
  return flatOpts;
}

export function filterList(options, inputValue, excludeSelected) {
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
  /**
   * Sifter is used for searching to provide rich filter functionality.
   * But it degradate nicely, when optgroups are present
  */
  if (optionsWithGroups) {  // disable sorting 
    sifter.getSortFunction = () => null;
  }
  const result = sifter.search(inputValue, {
    fields: sifterSearchField,
    sort: sifterSortField,
    conjunction: 'and'
  });
  const mapped = optionsWithGroups
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
    : result.items.mapped(item => options[item.id])
  return mapped;
}

export function indexList(options, includeCreateRow) {
  const map = optionsWithGroups
    ? options.reduce((res, opt, index) => {
      res.push(opt.$isGroupHeader ? '' : index);
      return res;
    }, [])
    : Object.keys(options);
  indexMapping.hasCreateRow = !!includeCreateRow;
  indexMapping.map = map;
  indexMapping.first = map[0] !== '' ? 0 : 1;
  indexMapping.last = map.length ? map.length - (includeCreateRow ? 0 : 1) : 0;
  return indexMapping;
}

function getFilterProps(object) {
  if (object.options) object = object.options[0];
  const exclude = ['value', 'isSelected', 'isDisabled' ,'selected', 'disabled'];
  return Object.keys(object).filter(prop => !exclude.includes(prop));
}