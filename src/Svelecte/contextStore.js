// import { onDestroy } from 'svelte';
import { writable, derived } from 'svelte/store';
import Sifter from './lib/sifter';
// import { debounce, xhr } from './lib/utils';

const key = {};

function getFilterProps(object) {
  if (object.options) object = object.options[0];
  const exclude = ['value', 'isSelected', 'isDisabled' ,'selected', 'disabled'];
  return Object.keys(object).filter(prop => !exclude.includes(prop));
}

function setToggleHelper(o) {
  if (this.has(o)) {
    !o.isSelected && this.delete(o);
    return false;
  }
  o.isSelected && this.add(o);
  return true;
}

const initStore = (options, initialSettings, dropdownMessages) => {
  const internalSelection = new Set();
  const selectionToggle = setToggleHelper.bind(internalSelection);

  let valueField = initialSettings.currentValueField;
  let labelField = initialSettings.currentLabelField;
  let maxItems = initialSettings.max;
  let isMultiple = initialSettings.multiple;
  let searchMode = 'auto';  // FUTURE: implement
  let isCreatable = initialSettings.creatable;
  let searchField = initialSettings.searchField;
  let sortField = initialSettings.sortField;
  let optionsWithGroups = false;
  let sifterSearchField = initialSettings.searchField;
  let sifterSortField = initialSettings.sortField;
  let sifterSortRemote = initialSettings.sortRemote ? true : false;

  const settings = initSettings(initialSettings);

  const settingsUnsubscribe = settings.subscribe(val => {
    maxItems = val.max;
    isMultiple = val.multiple;
    isCreatable = val.creatable;
    sifterSortRemote = val.sortRemote;
    valueField = val.currentValueField;
    labelField = val.currentLabelField;
    if (!isMultiple && internalSelection.size > 1) {
      opts.update(opts => opts.map(o => { o.isSelected = false; return o }));
    }
    if (isMultiple && maxItems && internalSelection.size > maxItems) {
      let i = 0;
      const reset = o => { 
        if (o.isSelected) {
          if (i >= maxItems) o.isSelected = false;
          i++;
        }
        return o;
      };
      opts.update(opts => opts.map(reset));
    }
    if (val.searchField && searchField !== val.searchField) {
      searchField = val.searchField;
    }
    if (val.sortField && sortField !== val.sortField) {
      sortField = val.sortField;
    }
  });
  
  const inputValue = writable('');
  const isFetchingData = writable(false);
  const hasFocus = writable(false);
  const hasDropdownOpened = writable(false);
  const listMessage = writable(dropdownMessages.empty);``

  const opts = writable([]);
  let _flatOptions = []; // for performance gain, set manually in 'updateOpts'
  const updateOpts = (options) => {
    optionsWithGroups = options.some(opt => opt.options);
    
    if (searchMode === 'auto') {
      sifterSearchField = getFilterProps(options.length > 0 ? options[0] : { [labelField]: ''});
      sifterSortField = optionsWithGroups
        ? false
        : (sortField || [{ field: labelField, direction: 'asc'}]);
    }

    _flatOptions = options.reduce((res, opt) => {
      if (opt.options) {
        res.push(...opt.options);
        return res;
      }
      res.push(opt);
      return res;
    }, []);
    opts.set(options);
    // init selection
    options.forEach(opt => opt.isSelected && internalSelection.add(opt));
  }
  
  updateOpts(options);  // init options

  /** ************************************ filtered results */
  const matchingOptions = derived([opts, inputValue, settings], 
    ([$opts, $inputValue, $settings], set) => {
      // set dropdown list empty when max is reached
      if ($settings.max && internalSelection.size === $settings.max) {
        listMessage.set(dropdownMessages.max.replace(':maxItems', $settings.max));
        set([]);
        return;
      }
      if ($inputValue === '' || !sifterSortRemote) {
        return $settings.multiple
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
      const sifter = new Sifter(_flatOptions);
      if (optionsWithGroups) {  // disable sorting 
        sifter.getSortFunction = () => null;
      }
      const result = sifter.search($inputValue, {
        fields: sifterSearchField,
        sort: sifterSortField,
        conjunction: 'and'
      });
      let mapped = result.items.map(item => _flatOptions[item.id])
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
            })
            subopts.length && res.push({ label: opt.label, options: subopts });
          }
          return res;
        }, [])
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
    : derived([matchingOptions, inputValue, settings], ([$matchingOptions, $inputValue, $settings], set) => {
    const flatList = $inputValue !== ''
      ? $matchingOptions.reduce((res, opt) => {
          if (opt.options) {
            res.push(...opt.options);
            return res;
          }
          res.push(opt);
          return res;
        }, [])
      : ($settings.multiple ? _flatOptions.filter(o => !o.isSelected) : _flatOptions);
    set(flatList.filter(o => !o.isDisabled));
  });

  /** ************************************ selection set */
  const selectedOptions = derived([opts, settings], ([$opts, $settings], set) => {
    if (!$settings.multiple) internalSelection.clear();
    $opts.forEach(o => {
      if (o.options) {
        !o.isDisabled && o.options.forEach(selectionToggle);
        return;
      }
      selectionToggle(o);
    });
    set(Array.from(internalSelection));
  }, Array.from(internalSelection))

  /***************************************************************/
  /**                    options exposed API                     */
  /***************************************************************/

  const selectOption = option => {
    if (maxItems && internalSelection.size === maxItems) return;
    opts.update(list => {
      if (!isMultiple) {
        internalSelection.forEach(opt => {
          opt.isSelected = false;
          isCreatable && opt._created && list.splice(list.indexOf(opt), 1);
        });
      }
      if (typeof option === 'string') {
        option = {
          [labelField]: option,
          [valueField]: encodeURIComponent(option),
          isSelected: false,
          _created: true,
        }
        list.push(option);
      }
      option.isSelected = true;
      return list;
    });
  };
  const deselectOption = option => opts.update(list => {
    internalSelection.delete(option);
    option.isSelected = false;
    if (option._created) {
      list.splice(list.indexOf(option), 1);
    } 
    return list;
  });
  const clearSelection = () => opts.update(list => {
    const toClear = [];
    list.forEach(opt => {
      if (opt.options) {
        opt.options.forEach(o => o.isSelected = false);
      } else {
        opt.isSelected = false;
        if (opt._created) {
          internalSelection.delete(opt);
          toClear.push(list.indexOf(opt));
        }
      }
    });
    toClear.length && toClear.reverse().forEach(idx => list.splice(idx, 1));
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
    set(isCreatable && $inputValue ? $flatMatching.length : $flatMatching.length - 1);
  });

  return {
    /** context stores */
    hasFocus,
    hasDropdownOpened,
    inputValue,
    isFetchingData,
    listMessage,
    settings,
    /** options:actions **/
    selectOption,
    deselectOption,
    clearSelection,
    settingsUnsubscribe,
    /** options:getters **/
    listLength,
    listIndexMap,
    matchingOptions,
    flatMatching,
    currentListLength,
    selectedOptions,
    /** options: update */
    updateOpts
  }
}

const initSettings = (initialSettings) => {
  const settings = writable(initialSettings || {});
  settings.updateOne = (name, value) => {
    settings.update(_val => {
      _val[name] = value;
      return _val;
    });
  }
  return settings;
}

export { key, initStore, initSettings };