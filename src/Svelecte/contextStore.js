import { onDestroy } from 'svelte';
import { debug, init } from 'svelte/internal';
import { writable, derived } from 'svelte/store';
import Sifter from './lib/sifter';
import { debounce, xhr } from './lib/utils';

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

const initStore = (options, initialSettings, fetchRemote) => {
  console.log('init store', fetchRemote);
  const internalSelection = new Set();
  const selectionToggle = setToggleHelper.bind(internalSelection);

  let valueField = initialSettings.valueField;
  let labelField = initialSettings.labelField;
  let maxItems = initialSettings.max;
  let isMultiple = initialSettings.multiple;
  let searchMode = 'auto';  // FUTURE: implement
  let isCreatable = initialSettings.creatable;
  let searchField = initialSettings.searchField;
  let sortField = initialSettings.sortField;
  let sifterSearchField = initialSettings.searchField;
  let sifterSortField = initialSettings.sortField;
  let optionsWithGroups = false;

  const settings = initSettings(initialSettings);

  const settingsUnsubscribe = settings.subscribe(val => {
    maxItems = val.max;
    isMultiple = val.multiple;
    isCreatable = val.creatable;
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
  
  const dropdownMessages = {
    empty: 'No options',
    nomatch: 'No matching options',
    get max() { return `Maximum items (${maxItems}) selected` },
    fetchBefore: 'Type to search',
    fetchWait: 'Stop typing to search',
    fetchEmpty: 'No data related to your search'
  }

  const inputValue = writable('');
  const isFetchingData = writable(false);
  const hasFocus = writable(false);
  const hasDropdownOpened = writable(false);
  const hasRemoteData = fetchRemote ? true : false;
  const listMessage = writable(fetchRemote ? dropdownMessages.fetchBefore : dropdownMessages.empty); // default

  const opts = writable([]);
  const updateOpts = options => {
    optionsWithGroups = options.some(opt => opt.options);
    opts.set(options);
    // init selection
    options.forEach(opt => opt.isSelected && internalSelection.add(opt));
    if (searchMode === 'auto') {
      sifterSearchField = getFilterProps(options.length > 1 ? options[0] : { [labelField]: ''});
      sifterSortField = optionsWithGroups
      ? false
      : (sortField || [{ field: labelField, direction: 'asc'}]);
    }
  }
  
  updateOpts(options);

  // TODO: think and rethink this
  if (hasRemoteData) {
    const debouncedFetch = debounce(query => {
      fetchRemote(query)
        .then(data => {
          // TODO: resolve, if we will show previously selected option in list, doesn't make sense to me
          internalSelection.size && internalSelection.forEach(s => {
            data.forEach((o, i) => {
              if (o.value === s.value) data.splice(i, 1);
            });
            data.push(s);
          });
          opts.set(data);
          // opts.update(data => data);
        })
        .catch(() => opts.update(() => []))
        .finally(() => {
          isFetchingData.set(false);
          hasDropdownOpened.set(true);
          listMessage.set(dropdownMessages.fetchEmpty);
        });
    }, 300);
    /** ************************************ define search-triggered fetch */
    onDestroy(
      inputValue.subscribe(value => {
        if (xhr && xhr.readyState !== 4) {  // cancel previously run 
          xhr.abort();
        };
        if (!value) {
          listMessage.set(dropdownMessages.fetchBefore);
          return;
        }
        isFetchingData.set(true);
        listMessage.set(dropdownMessages.fetchWait);
        hasDropdownOpened.set(false);
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

  /** ************************************ filtered results */
  // NOTE: this is dependant on data source (remote or not)
  const matchingOptions = hasRemoteData 
    ? derived(opts, ($opts, set) => {
      set($opts.filter(item => !item.isSelected));
    })
    : derived([flatOptions, opts, inputValue, settings], 
    ([$flatOptions, $opts, $inputValue, $settings], set) => {
      // set empty when max is reached
      if ($settings.max && internalSelection.size === $settings.max) {
        listMessage.set(dropdownMessages.max);
        set([]);
        return;
      }
      if ($inputValue === '') {
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
      const sifter = new Sifter($flatOptions);
      if (optionsWithGroups) {  // disable sorting 
        sifter.getSortFunction = () => null;
      }
      const result = sifter.search($inputValue, {
        fields: sifterSearchField,
        sort: sifterSortField,
        conjunction: 'and'
      });
      let mapped = result.items.map(item => $flatOptions[item.id])
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
    : derived([matchingOptions, flatOptions, inputValue, settings], ([$matchingOptions, $flatOptions, $inputValue, $settings], set) => {
    const flatList = $inputValue !== ''
      ? $matchingOptions.reduce((res, opt) => {
          if (opt.options) {
            res.push(...opt.options);
            return res;
          }
          res.push(opt);
          return res;
        }, [])
      : ($settings.multiple ? $flatOptions.filter(o => !o.isSelected) : $flatOptions);
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