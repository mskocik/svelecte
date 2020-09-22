import { onDestroy } from 'svelte';
import { writable, derived } from 'svelte/store';
import Sifter from './lib/sifter';
import { debounce } from './lib/utils';

const key = {};

function getFilterProps(object) {
  if (object.options) object = object.options[0];
  const exclude = ['value', 'isSelected', 'isDisabled' ,'selected', 'disabled'];
  return Object.keys(object).filter(prop => !exclude.includes(prop));
}

function setToggleHelper(o) {
  if (this.has(o)) {
    !o.isSelected && this.delete(o);
  } else {
    o.isSelected && this.add(o);
  }
}

const initStore = (options, _settings, fetchRemote) => {
  console.log('init', options.length);
  const settings = _settings;
  const dropdownMessages = {
    empty: 'No options',
    nomatch: 'No matching options',
    get max() { return `Maximum items (${settings.max}) selected` },
    fetchBefore: 'Type to search',
    fetchWait: 'Stop typing to search',
    fetchRemote: 'Fetching results...',
    fetchEmpty: 'No data related to your search'
  }

  const inputValue = writable('');
  const isFetchingData = writable(false);
  const hasFocus = writable(false);
  const hasDropdownOpened = writable(false);
  const hasRemoteData = fetchRemote ? true : false;
  const listMessage = writable(fetchRemote ? dropdownMessages.fetchBefore : dropdownMessages.empty); // default

  // automatically select all object fields for sifter filter
  // FUTURE: make this configurable  
  const sifterFilterFields = getFilterProps(options.length > 1 ? options[1] : ['text']);
  const _sifterDefaultSort = [{ field: 'text', direction: 'asc'}];

  const opts = writable(options);

  const internalSelection = new Set();
  const selectionToggle = setToggleHelper.bind(internalSelection);
  // init selection
  options.forEach(opt => opt.isSelected && internalSelection.add(opt));

  // TODO: think and rethink this
  if (hasRemoteData) {
    const debouncedFetch = debounce(query => {
      isFetchingData.set(true);
      listMessage.set(dropdownMessages.fetchRemote);
      fetchRemote(query)
        .then(data => {
          internalSelection.size && internalSelection.forEach(s => {
            data.forEach((o, i) => {
              if (o.value === s.value) data.splice(i, 1);
            });
            data.push(s);
          });
          opts.set(data);
          opts.update(data => data);
        })
        .catch(() => opts.update(() => []))
        .finally(() => {
          isFetchingData.set(false);
          listMessage.set(dropdownMessages.fetchEmpty);
        });
    }, 300);
    /** ************************************ define search-triggered fetch */
    onDestroy(
      inputValue.subscribe(value => {
        if (!value) {
          hasRemoteData && listMessage.set(dropdownMessages.fetchBefore);
          return;
        }
        listMessage.set(dropdownMessages.fetchWait);
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

  /** ************************************ sifter sort function (disabled when groups are present) */
  const optionsWithGroups = options.some(opt => opt.options);
  let sifterFilterSort = settings.searchMode === 'auto' && optionsWithGroups
    ? false
    : _sifterDefaultSort;

  /** ************************************ filtered results */
  // NOTE: this is dependant on data source (remote or not)
  const matchingOptions = hasRemoteData ? opts : derived([flatOptions, opts, inputValue], 
    ([$flatOptions, $opts, $inputValue], set) => {
      // set empty when max is reached
      if (settings.max && internalSelection.size === settings.max) {
        listMessage.set(dropdownMessages.max);
        set([]);
        return;
      }
      if ($inputValue === '') {
        return settings.multiple
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
        fields: sifterFilterFields,
        sort: sifterFilterSort,
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
    : derived([matchingOptions, flatOptions, inputValue], ([$matchingOptions, $flatOptions, $inputValue], set) => {
    const flatList = $inputValue !== ''
      ? $matchingOptions.reduce((res, opt) => {
          if (opt.options) {
            res.push(...opt.options);
            return res;
          }
          res.push(opt);
          return res;
        }, [])
      : (settings.multiple ? $flatOptions.filter(o => !o.isSelected) : $flatOptions);
    set(flatList.filter(o => !o.isDisabled));
  });

  /** ************************************ selection set */
  const selectedOptions = derived(opts, ($opts, set) => {
    if (!settings.multiple) internalSelection.clear();
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
    if (settings.max && internalSelection.size === settings.max) return;
    opts.update(list => {
      if (!settings.multiple) {
        internalSelection.forEach(opt => {
          opt.isSelected = false;
          settings.creatable && opt._created && list.splice(list.indexOf(opt), 1);
        });
      }
      if (typeof option === 'string') {
        option = {
          text: option,
          value: encodeURIComponent(option),
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
    option.isSelected = false;
    if (option._created) {
      internalSelection.delete(option);
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
    set(settings.creatable && $inputValue ? $flatMatching.length : $flatMatching.length - 1);
  });

  return {
    /** context stores */
    hasFocus,
    hasDropdownOpened,
    inputValue,
    isFetchingData,
    listMessage,
    /** options:actions **/
    selectOption,
    deselectOption,
    clearSelection,
    /** options:getters **/
    listLength,
    listIndexMap,
    matchingOptions,
    flatMatching,
    currentListLength,
    selectedOptions,
    _set: opts.set
  }
}

export { key, initStore };