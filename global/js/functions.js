/**
 * vanilla js function collection
 */
const functions = {
  /**
   * @description send an ajax request
   * @param {string} url request url
   * @param {object} params parameters as key->value pairs
   */
  ajax: (url, params, requestHeader = [], responseType = 'json') => {
    // const settings = Object.assign({}, {
    //   params: {},
    //   requestHeader: [],
    //   responseType: 'json',
    // }, typeof options === 'object' ? options : {});

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          if (responseType == 'json') {
            const response = JSON.parse(xhr.responseText);
            response.status ? resolve(JSON.parse(xhr.responseText)) : reject(JSON.parse(xhr.responseText));
          } else {
            resolve(xhr.responseText);
          }
        }
      };

      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      requestHeader.map((v, k) => xhr.setRequestHeader(k, v));

      const paramString = Object.entries(params).reduce((paramArr, param) => {
        const paramName = param[0],
          paramValue = param[1];

        if (paramValue instanceof Array) {
          paramValue.map((value, key) => paramArr.push(paramName + `[${key}]=` + encodeURIComponent(value)));
        } else {
          paramArr.push(paramName + '=' + encodeURIComponent(param[1]));
        }

        return paramArr;
      }, []).join('&');

      xhr.send(paramString);
    });
  },

  /**
   * @description splits an into equal chunks
   * @returns a multidimensional array
   * @param {array} arr
   * @param {number} chunkSize
   */
  chunkArray: (arr, chunkSize) => {
    const chunkArr = [...arr];
    let results = [];

    while (chunkArr.length) {
      results.push(chunkArr.splice(0, chunkSize))
    }

    return results;
  },

  /**
   * @description Element.prototype.closest polyfill
   * @param {node} el - the element to start the search with
   * @param {string} selector - css selector
   */
  closest: (el, selector) => {
    if (window.Element && !Element.prototype.closest) {
      const matches = document.querySelectorAll(selector);
      let i;

      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
      } while ((i < 0) && (el = el.parentElement));
      return el;
    } else {
      return el.closest(selector);
    }
  },

  /**
   * @description takes a float number string with comma seperator and converts it into decimal string
   * @param {string} value float number as string with comma seperator
   * @returns {string} float number string
   */
  commaNumberToDecimal: (value) => {
    return value.replace(/\s/g, '').replace(/,/g, '.').replace(/\.(?=[^.]*\.)/g, '');
  },

  /**
   * @description returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
   * where each x is replaced with a random hexadecimal digit from 0 to f, and y is replaced with a random hexadecimal digit from 8 to b.
   * from https://gist.github.com/jed/982883
   * @param {number=} a - optional random number from 0 to 15
   */
  createUUID: a => {
    const uuid = a => a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
    return uuid(a);
  },

  /**
   * @description converts a CSV string into an array
   */
  csvToArray: (strData, strDelimiter) => {
    // Check to see if the delimiter is defined. If not, then default to comma.
    strDelimiter = strDelimiter || ',';

    // Create a regular expression to parse the CSV values
    const objPattern = new RegExp((
      // Delimiters
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

      // Quoted fields
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

      // Standard fields
      "([^\"\\" + strDelimiter + "\\r\\n]*))"
    ), "gi");


    // Create an array to hold our data. Give the array a default empty first row.
    let arrData = [
      []
    ];

    // Create an array to hold our individual pattern matching groups
    let arrMatches = null;

    // Keep looping over the regular expression matches until we can no longer find a match
    while (arrMatches = objPattern.exec(strData)) {

      // Get the delimiter that was found
      const strMatchedDelimiter = arrMatches[1];

      // Check to see if the given delimiter has a length (is not the start of string) and if it matches field delimiter.
      // If id does not, then we know that this delimiter is a row delimiter.
      if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
        // Since we have reached a new row of data, add an empty row to our data array.
        arrData.push([]);
      }

      let strMatchedValue;
      // check to see which kind of value was captur ed (quoted or unquoted).
      if (arrMatches[2]) {
        // We found a quoted value. When we capture this value, unescape any double quotes.
        strMatchedValue = arrMatches[2].replace(new RegExp('\"\"', 'g'), '\"');
      } else {
        // non-quoted value found
        strMatchedValue = arrMatches[3];
      }

      // Now that we have our value string, let's add it to the data array
      arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data
    return (arrData);
  },

  /**
   * @description takes a YMDHMS date time string (sql date time string) and converts it into an ISO 6801 date time string
   * this fixes the issue with certain browsers not recognizing 'yyyy-mm-dd hh:mm:ss'
   * @param {string} tsql required input format: 'yyyy-mm-dd hh:mm:ss'
   * @returns {string} ISO 6801 date time string
   */
  dateTimeToISO: tsql => {
    return tsql.replace(' ', 'T');
  },

  /**
   * deep clones objects or array
   * @param {object|array} source
   * @returns {object|array}
   */
  deepClone(source) {
    // If the source isn't an Object or Array, throw an error.
    if (!(source instanceof Object) || source instanceof Date || source instanceof String) {
      throw 'Only Objects or Arrays are supported.'
    }

    // Set the target data type before copying.
    const target = source instanceof Array ? [] : {};

    for (let prop in source) {
      // Make sure the property isn't on the protoype
      if (source instanceof Object && !(source instanceof Array) && !(source.hasOwnProperty(prop))) {
        continue;
      }

      // If the current property is an Array or Object, recursively clone it, else copy it's value
      if (source[prop] instanceof Object && !(source[prop] instanceof Date) && !(source[prop] instanceof String)) {
        target[prop] = deepClone(source[prop])
      } else {
        target[prop] = source[prop]
      }
    }

    return target;
  },

  /**
   * @description Performs a deep merge of a `source` object into a `target` object
   * @param {object} target
   * @param {object} source
   * @param {boolean} replaceAtIndex if set to true, will have any source array's elements overwrite those of the target array at the same index.
   * @examples
     deepMerge({a: [1, 2]}, {a: [3, 4]}, false) // {a: [1, 2, 3, 4]}
     deepMerge({a: [1, 2]}, {a: [3, 4]}, true) // {a: [3, 4]}
   * @returns object
   */
  deepMerge(target, source, replaceAtIndex = false) {
    const merge = function (target, source) {
      target = ((obj) => {
        let cloneObj;
        try {
          cloneObj = JSON.parse(JSON.stringify(obj));
        } catch (err) {
          // If the stringify fails due to circular reference, the merge defaults
          // to a less-safe assignment that may still mutate elements in the target.
          // You can change this part to throw an error for a truly safe deep merge.
          cloneObj = Object.assign({}, obj);
        }
        return cloneObj;
      })(target);

      const isObject = (obj) => obj && typeof obj === "object";

      if (!isObject(target) || !isObject(source))
        return source;

      Object.keys(source).forEach(key => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (Array.isArray(targetValue) && Array.isArray(sourceValue))
          if (replaceAtIndex) {
            target[key] = targetValue.map((x, i) => sourceValue.length <= i ?
              x :
              merge(x, sourceValue[i], replaceAtIndex));
            if (sourceValue.length > targetValue.length)
              target[key] = target[key].concat(sourceValue.slice(targetValue.length));
          } else {
            target[key] = targetValue.concat(sourceValue);
          }
        else if (isObject(targetValue) && isObject(sourceValue))
          target[key] = merge(Object.assign({}, targetValue), sourceValue, replaceAtIndex);
        else
          target[key] = sourceValue;
      });

      return target;
    }

    return merge(target, source);
  },

  /**
   * @description sets the expiring date of a cookie to Thu, 01 Jan 1970 00:00:01 GMT
   * @param {string} cookieName the name of the cookie
   */
  expireCookie: cookieName => {
    setCookie(cookieName, '', null, -1);
  },

  /**
   * @description forces two flatpickr instances for min and max dates to keep a certain date difference (e.g. no negative date ranges).
   * use this in/as the onClose callback of the flatpickr instances
   * @param {flatpickr} startDatePicker
   * @param {flatpickr} endDatePicker
   * @param {flatpickr} currentPicker
   * @param {number} minDayDifference
   */
  forceDatePickerRange: (startDatePicker, endDatePicker, currentPicker, minDayDifference = 1) => {
    const newDate = currentPicker.parseDate(currentPicker.altInput.value, currentPicker.config.altFormat);
    const otherPicker = currentPicker == startDatePicker ? endDatePicker : startDatePicker;

    if (!newDate || !otherPicker.selectedDates.length) return;
    const otherDate = moment(otherPicker.selectedDates[0]);

    const startDate = moment(currentPicker == startDatePicker ? newDate : otherDate);
    const endDate = moment(currentPicker == startDatePicker ? otherDate : newDate);

    // if the selected/entered date is not at least 1 day ahead of the start date, set the start date
    if (moment(endDate).diff(startDate, 'days') <= minDayDifference) {
      otherPicker.setDate(newDate.fp_incr((currentPicker == endDatePicker ? -1 * minDayDifference : minDayDifference)));
    }

    currentPicker.setDate(newDate);
  },

  /**
   * @description get the value of a cookie
   * @param {string} cookieName the name of the cookie
   * @returns {string|null} cookie string or null
   */
  getCookie: cookieName => {
    let match = document.cookie.match(RegExp('(?:^|;\\s*)' + cookieName + '=([^;]*)'));
    return match ? match[1] : null;
  },

  /**
   * @description takes a date and returns a string containing either a short date or, if today, just the time
   * @param {Date} d
   * @returns {string}
   */
  getCreationDateString: d => {
    if (isToday(d)) return getDateString(d, '%HH:%mm');
    if (isCurrentYear(d)) return new Intl.DateTimeFormat(getLanguageISO(), {
      day: '2-digit',
      month: 'short'
    }).format(d);
    return new Intl.DateTimeFormat(getLanguageISO(), {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  },

  /**
   * @description takes a date and returns it as string
   * @param {date|number} d the date to convert; either Date object or unix timestamp
   * @param {string=} format the output string format
   * @returns {string} date string
   */
  getDateString: (d, format = '%Y-%m-%d') => {
    let dateObj = d instanceof Date ? d : new Date(d);
    const fullYear = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1;
    if (month < 10) month = '0' + month;
    let day = dateObj.getDate();
    if (day < 10) day = '0' + day;
    let hours = dateObj.getHours();
    if (hours < 10) hours = '0' + hours;
    let min = dateObj.getMinutes();
    if (min < 10) min = '0' + min;
    let sec = dateObj.getSeconds();
    if (sec < 10) sec = '0' + sec;

    return format
      .replace('%Y', fullYear)
      .replace('%mm', min)
      .replace('%m', month)
      .replace('%d', day)
      .replace('%HH', hours)
      .replace('%ss', sec);
  },

  /**
   * @description takes a date and returns a string that says e.g. '4 days ago'
   * @param {date} elapsedDate Date object or string thats converts to a Date object
   * @param {object=} translations text translations with %s as placeholder for the amount of days|months|...
   * @returns {string} the text that says how much time elapsed since elapsedDate
   */
  getElapsedTimeText: (elapsedDate, translations) => {
    const texts = Object.assign({}, {
      day: '%s day ago',
      days: '%s days ago',
      hour: '%s hour ago',
      hours: '%s hours ago',
      minute: '%s minute ago',
      minutes: '%s minutes ago',
      justNow: 'just now'
    }, translations);

    const elapsed = new Date(elapsedDate).getTime();
    const now = new Date().getTime();
    const diff = now - elapsed;
    const seconds = diff / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (days > 6) return false;
    if (days >= 1 && days < 2) return texts.day.replace('%s', Math.floor(days));
    if (days > 1) return texts.days.replace('%s', Math.floor(days));
    if (hours >= 1 && hours < 2) return texts.hour.replace('%s', Math.floor(hours));
    if (hours > 1) return texts.hours.replace('%s', Math.floor(hours));
    if (minutes >= 1 && minutes < 2) return texts.minute.replace('%s', Math.floor(minutes));
    if (minutes > 1) return texts.minutes.replace('%s', Math.floor(minutes));
    return texts.justNow;
  },

  getFileIcon: extension => {
    let fileName = 'icon-';

    switch (extension) {
      case 'pdf':
        fileName += 'pdf';
        break;
      case 'doc':
        fileName += 'doc';
        break;
      case 'docx':
        fileName += 'doc';
        break;
      case 'ppt':
        fileName += 'ppt';
        break;
      case 'pptx':
        fileName += 'ppt';
        break;
      case 'xls':
        fileName += 'xls';
        break;
      case 'xlsx':
        fileName += 'xls';
        break;
      case 'txt':
        fileName += 'txt';
        break;
      case 'jpg':
        fileName += 'img';
        break;
      case 'jpeg':
        fileName += 'img';
        break;
      case 'png':
        fileName += 'img';
        break;
      case 'gif':
        fileName += 'img';
        break;
      case 'bmp':
        fileName += 'img';
        break;
      case 'svg':
        fileName += 'img';
        break;
      default:
        return '';
    }

    return `<img src="/projects/application/dist/images/icons/files/${fileName}.svg" alt="File icon">`
  },

  /**
   * @description: extracts the file extension from a file name string
   * String.lastIndexOf() method returns the last occurrence of the specified value ('.' in this case). Returns -1 if the value is not found.
   * The return values of lastIndexOf for parameter 'filename' and '.hiddenfile' are -1 and 0 respectively.
   * Zero-fill right shift operator (»>) will transform -1 to 4294967295 and -2 to 4294967294, here is one trick to insure the filename unchanged in those edge cases.
   * String.prototype.slice() extracts file extension from the index that was calculated above.
   * If the index is more than the length of the filename, the result is "".
   * @param {string} filename
   * @returns {string}
   */
  getFileExtension: filename => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
  },

  /**
   * @description: extracts the file extension from a file name string
   * @param {string} filename
   * @returns {string}
   */
  getFileName: filename => {
    return filename.slice(0, (filename.lastIndexOf(".") - 1 >>> 0) + 1);
  },

  /**
   * @description: measures the width of an input element's value
   * @param {node} inputElement
   * @returns {number} px
   */
  getInputValueWidth: inputElement => {
    const computedInputStyle = window.getComputedStyle(inputElement);
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = `${computedInputStyle.fontSize} ${computedInputStyle.fontFamily}`;
    return context.measureText(inputElement.value).width;
  },

  /**
   * @description read the language from meta tag (e.g. en)
   * @returns {string}
   */
  getLanguageShort: _ => {
    return document.querySelector('meta[name="language"]').getAttribute('content');
  },

  /**
   * @description read the ISO language from meta tag (e.g. en-US)
   * @returns {string}
   */
  getLanguageISO: _ => {
    return document.querySelector('meta[name="language-iso"]').getAttribute('content');
  },

  /**
   * @description takes an element and returns its scrollable parent
   * @param {node} node
   * @returns {node}
   */
  getScrollParent: node => {
    const regex = /(auto|scroll)/;
    const parents = (_node, ps) => {
      if (_node.parentNode === null) {
        return ps;
      }
      return parents(_node.parentNode, ps.concat([_node]));
    };

    const style = (_node, prop) => getComputedStyle(_node, null).getPropertyValue(prop);
    const overflow = _node => style(_node, 'overflow') + style(_node, 'overflow-y') + style(_node, 'overflow-x');
    const scroll = _node => regex.test(overflow(_node));

    /* eslint-disable consistent-return */
    const scrollParent = (_node) => {
      if (!(_node instanceof HTMLElement || _node instanceof SVGElement)) {
        return;
      }

      const ps = parents(_node.parentNode, []);

      for (let i = 0; i < ps.length; i += 1) {
        if (scroll(ps[i])) {
          return ps[i];
        }
      }

      return document.scrollingElement || document.documentElement;
    };

    return scrollParent(node);
    /* eslint-enable consistent-return */
  },

  /**
   * @description get all GET parameters from URL string
   * @param {string} url the url to get the parameters from
   * @returns {object} {paramName: paramValue, paramName, paramValue, ...}
   */
  getUrlParams: url => {
    let hashes = url.slice(url.indexOf('?') + 1).split('&');

    return hashes.reduce((params, hash) => {
      let [key, val] = hash.split('=');
      return Object.assign(params, {
        [key]: decodeURIComponent(val)
      });
    }, {})
  },

  /**
   * @description get the values of an object by keys
   * @param {object} obj the object
   * @param {array} keys an array with keys
   * @returns {array} array with all values of the param object
   */
  getValuesByKeys: (obj, keys) => {
    return keys.reduce((prev, curr) => {
      const v = obj[curr];
      if (v && prev.indexOf(v) == -1) prev.push(v);
      return prev;
    }, [])
  },

  /**
   * @description converts a hex value into an rgb value
   * @param {string} hex hexadecimal color code
   * @param {float|null} alpha alpha value for RGBA
   * @param {boolean} returnString if true, returns rgb/rgba string, otherwise returns array
   * @returns {array|string} RGB color string
   */
  hexToRgb: (hex, alpha = null, returnString = false) => {
    let rgb = hex
      .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1).match(/.{2}/g)
      .map(x => parseInt(x, 16));

    if (returnString) {
      return alpha !== null ? `rgba(${rgb.join(',')},${alpha})` : `rgb(${rgb.join(',')})`;
    }

    if (alpha) {
      return rgb.push(alpha);
    }

    return rgb;
  },

  /**
   * @description interpolate between two colors, returns an array
   * @param {string} color1 RGB-color string, e.g. "rgb(94, 79, 162)"
   * @param {string} color2 RGB-color string, e.g. "rgb(94, 79, 162)"
   * @param {number} steps number of steps between the two colors
   * @returns {array} interpolated colors [[r, g, b], [r, g, b], ...]
   */
  interpolateColors: (color1, color2, steps) => {
    let stepFactor = steps <= 1 ? 0.5 : 1 / (steps - 1),
      interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);

    for (let i = 0; i < steps; i++) {
      interpolatedColorArray.push(
        ((c1, c2, factor) => {
          let result = color1.slice();

          for (var j = 0; j < 3; j++) {
            result[j] = Math.round(result[j] + factor * (c2[j] - c1[j]));
          }
          return result;
        })(color1, color2, stepFactor * i)
      );
    }

    return interpolatedColorArray;
  },

  /**
   * @description tests wheather the passed date is in current year
   * @param {Date} d
   * @returns {boolean}
   */
  isCurrentYear: d => {
    const today = new Date();
    return today.getFullYear() === d.getFullYear();
  },

  /**
   * @description checks whether an element is (partly) in viewport
   * @param {object} element the element to test
   * @returns {Boolean}
   */
  isElementVisible: (element, show) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    const windowWidth = (window.innerWidth || document.documentElement.clientWidth);

    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return (vertInView && horInView);
  },

  /**
   * @description test whether a string has valid email format
   * @param {string} str the string to test
   * @returns the match result array or NULL
   */
  isEmail: str => {
    return str.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null;
  },

  /**
   * @description tests wheather an element in in the viewport (only y-axis!)
   * @param {node} el the element to test
   * @param {node} [settings.scrollElement = window] the scrollable element
   * @param {string} [settings.area = 'any'] defines the part of the element that should to be in the viewport
   * @param {number} [settings.expandTop = 0] virtually expands the element to the top
   * @param {number} [settings.expandBottom = 0] virtually expands the element to the bottom
   */
  isInView: (el, options) => {
    const settings = Object.assign({}, {
      scrollElement: window,
      area: 'any',
      expandTop: 0,
      expandBottom: 0
    }, typeof options === 'object' ? options : {});

    let top = el.offsetTop;
    let height = el.offsetHeight;

    while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
    }

    let reachedTop, passedTop, topVisible, reachedBottom, passedBottom, bottomVisible;

    if (settings.scrollElement == window) {
      reachedTop = top - settings.expandTop < window.pageYOffset + window.innerHeight;
      passedTop = top - settings.expandTop < window.pageYOffset;
      topVisible = reachedTop && !passedTop;

      reachedBottom = top + settings.expandBottom + height < window.pageYOffset + window.innerHeight;
      passedBottom = top + settings.expandBottom + height < window.pageYOffset;
      bottomVisible = reachedBottom && !passedBottom;
    } else {
      const outerContainer = settings.scrollElement;
      let outerContainerTop = outerContainer.offsetTop;
      let outerContainerOffsetParent = outerContainer;

      while (outerContainerOffsetParent.offsetParent) {
        outerContainerOffsetParent = outerContainerOffsetParent.offsetParent;
        outerContainerTop += outerContainerOffsetParent.offsetTop;
      }

      reachedTop = top - settings.expandTop < outerContainer.scrollTop + outerContainerTop + outerContainer.getBoundingClientRect().height;
      passedTop = top - settings.expandTop < outerContainer.scrollTop + outerContainerTop;
      topVisible = reachedTop && !passedTop;

      reachedBottom = top + settings.expandBottom + height < outerContainer.scrollTop + outerContainerTop + outerContainer.getBoundingClientRect().height;
      passedBottom = top + settings.expandBottom + height < outerContainer.scrollTop + outerContainerTop;
      bottomVisible = reachedBottom && !passedBottom;
    }

    switch (settings.area) {
      case 'top':
        return topVisible;
      case 'bottom':
        return bottomVisible;
      case 'full':
        return topVisible && bottomVisible;
      case 'any':
        return reachedTop && !passedBottom;
    }
  },

  /**
   * @description checks wheather 2 arrays are equal. Works on one-dimensional arrays.
   * @param {Array} arr1
   * @param {Array} arr1
   * @returns {boolean} is equal or not
   */
  isEqualArray: (arr1, arr2) => {
    const sortedArr1 = arr1.slice().sort();
    const sortedArr2 = arr2.slice().sort();
    return sortedArr1.length === sortedArr2.length && sortedArr1.every((value, index) => value === sortedArr2[index]);
  },

  /**
   * @description tests wheather the passed date is today or not
   * @param {Date} d
   * @returns {boolean}
   */
  isToday: d => {
    const today = new Date()
    return d.getDate() == today.getDate() &&
      d.getMonth() == today.getMonth() &&
      d.getFullYear() == today.getFullYear()
  },

  /**
   * @description test whether the user's device is a touch device or not
   * @returns boolean
   */
  isTouchDevice: _ => {
    return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
  },

  /**
   * @description takes an object and returns its contents as GET param string
   * @param {object} obj the object to transform
   * @returns {string} GET param string
   */
  objectToGetParam: obj => {
    return Object.entries(obj).map(([key, val]) => `${key}=${encodeURIComponent(val)}`).join('&')
  },

  /**
   * @description returns N random values from an array
   * @param {array} arr the array to choose form
   * @param {number} num the amount of values to return
   * @param {boolean} allowDuplicates if true, duplicate values are allowed
   * @returns {array} array of random values
   */
  randomValuesFromArray: (arr = [], num = 1, allowDuplicates = false) => {
    let picked = [];
    arr = arr.slice(0);

    while (arr.length && picked.length < num) {
      picked = [...picked, ...arr.splice(Math.random() * arr.length, 1)];
    }

    return picked;
  },

  /**
   * @description removes all non-numeric characters from a string and retuns the result
   * @param {string} str the string to work with
   * @returns {string} string of digits
   */
  removeNonNumericChars: str => {
    return str.split('').filter(char => !isNaN(parseInt(char))).join('');
  },

  /**
   * @description scroll an element into viewport
   * @param {node} element the target element
   * @param {string} position position of the target element within the viewport
   * @param {number} offset offet in px
   * @param {boolean} force if false, it won't scroll if the target element is (partly) visible
   * @param {node} scrollElement use this if the scrollable container is not window
   */
  scrollIntoView: (element, position = 'center', offset = 0, force = true, scrollElement = window) => {
    element = element || document.body;
    const dimensions = element.getBoundingClientRect();
    const topOutOfView = window.pageYOffset > window.pageYOffset + dimensions.y;
    const bottomOutOfView = window.pageYOffset + dimensions.y > window.pageYOffset + window.innerHeight;
    position = dimensions.height > window.innerHeight ? 'top' : position;
    const yScroll = typeof scrollElement.pageYOffset === 'undefined' ? scrollElement.scrollTop : scrollElement.pageYOffset;

    if (!topOutOfView && !bottomOutOfView && !force) return;

    switch (position) {
      case 'top':
        // scrollTo not support in IE
        if (scrollElement.scrollTo) {
          scrollElement.scrollTo(0, yScroll + dimensions.y - offset);
        } else {
          scrollElement.scrollTop = yScroll + dimensions.y - offset;
        }
        break;
      case 'center':
        // scrollTo not support in IE
        if (scrollElement.scrollTo) {
          scrollElement.scrollTo(0, (yScroll + dimensions.y) - ((scrollElement.innerHeight - dimensions.height) / 2) - offset);
        } else {
          scrollElement.scrollTop = (yScroll + dimensions.y) - ((scrollElement.innerHeight - dimensions.height) / 2) - offset;
        }
        break;
      case 'bottom':
        // scrollTo not support in IE
        if (scrollElement.scrollTo) {
          scrollElement.scrollTo(0, yScroll - (scrollElement.innerHeight - dimensions.height - dimensions.y) - offset);
        } else {
          scrollElement.scrollTo = yScroll - (scrollElement.innerHeight - dimensions.height - dimensions.y) - offset;
        }
        break;
    }
  },

  /**
   * @description scrolls an element into the viewport
   * @param {node} el the element to scroll to
   * @param {node} [settings.scrollElement = window] the scrollable element
   * @param {string} [settings.position = 'center'] position in relation to the scrollElement. 'before'|'top'|'bottom'|'after'|'center'
   * @param {number} [settings.offset = 0] adds an offset to the element
   */
  scrollToElement: (el, options) => {
    const settings = Object.assign({}, {
      scrollElement: window,
      position: 'center',
      offset: 0
    }, typeof options === 'object' ? options : {});

    let topPos = el.offsetTop;
    let height = el.offsetHeight;

    while (el.offsetParent) {
      el = el.offsetParent;
      topPos += el.offsetTop;
    }

    let before, top, bottom, after, center, outerContainerTop;

    if (settings.scrollElement == window) {
      before = topPos - settings.offset + height;
      top = topPos - settings.offset;
      bottom = topPos + settings.offset - (window.innerHeight) + height;
      after = topPos - settings.offset - (window.innerHeight);
      center = height >= window.innerHeight ?
        top :
        topPos - settings.offset - (window.innerHeight / 2) + (height / 2);
    } else {
      const outerContainer = settings.scrollElement;
      let outerContainerTop = outerContainer.offsetTop;
      let outerContainerOffsetParent = outerContainer;

      while (outerContainerOffsetParent.offsetParent) {
        outerContainerOffsetParent = outerContainerOffsetParent.offsetParent;
        outerContainerTop += outerContainerOffsetParent.offsetTop;
      }

      before = topPos - settings.offset - (outerContainerTop) + height;
      top = topPos - settings.offset - (outerContainerTop);
      bottom = topPos - settings.offset - (outerContainerTop + outerContainer.getBoundingClientRect().height) + height;
      after = topPos - settings.offset - (outerContainerTop + outerContainer.getBoundingClientRect().height);
      center = height >= outerContainer.getBoundingClientRect().height ?
        top :
        topPos - settings.offset - (outerContainerTop) - (outerContainer.getBoundingClientRect().height / 2) + (height / 2);
    }

    const targetY = (_ => {
      switch (settings.position) {
        case 'before':
          return before;
        case 'top':
          return top;
        case 'bottom':
          return bottom;
        case 'after':
          return after;
        default:
          return center;
      }
    })();

    settings.scrollElement.scrollTo(0, targetY);
  },

  /**
   * @description sets a cookie
   * @param {string} cookieName
   * @param {*} cookieValue
   * @param {Date} expireDate default is Fri, 31 Dec 9999 23:59:59
   * @param {number} expireDays expireDate must be Null in order to use this option
   */
  setCookie: (cookieName, cookieValue = 1, expireDate = new Date('Fri, 31 Dec 9999 23:59:59'), expireDays = null) => {
    if (expireDate === null) {
      expireDate = new Date();
      expireDate.setTime(expireDate.getTime() + (expireDays * 24 * 60 * 60 * 1000));
    }

    document.cookie = `${cookieName}=${cookieValue}; expires="${expireDate.toUTCString()}; path=/`;
  },

  /**
   * @description a simplified version of PHP sprintf
   * @param {string} format
   * @param {array} values
   */
  sprintf: (format, values) => {
    return values.reduce((p, c) => p.replace(/%s/, c), format);
  }
}

export default functions;

const ajax = functions.ajax;
const chunkArray = functions.chunkArray;
const closest = functions.closest;
const commaNumberToDecimal = functions.commaNumberToDecimal;
const createUUID = functions.createUUID;
const csvToArray = functions.csvToArray;
const dateTimeToISO = functions.dateTimeToISO;
const deepClone = functions.deepClone;
const deepMerge = functions.deepMerge;
const expireCookie = functions.expireCookie;
const forceDatePickerRange = functions.forceDatePickerRange;
const getCookie = functions.getCookie;
const getCreationDateString = functions.getCreationDateString;
const getDateString = functions.getDateString;
const getElapsedTimeText = functions.getElapsedTimeText;
const getFileExtension = functions.getFileExtension;
const getFileIcon = functions.getFileIcon;
const getFileName = functions.getFileName;
const getInputValueWidth = functions.getInputValueWidth;
const getLanguageShort = functions.getLanguageShort;
const getLanguageISO = functions.getLanguageISO;
const getScrollParent = functions.getScrollParent;
const getUrlParams = functions.getUrlParams;
const getValuesByKeys = functions.getValuesByKeys;
const hexToRgb = functions.hexToRgb;
const interpolateColors = functions.interpolateColors;
const isCurrentYear = functions.isCurrentYear;
const isElementVisible = functions.isElementVisible;
const isEmail = functions.isEmail;
const isEqualArray = functions.isEqualArray;
const isInView = functions.isInView;
const isToday = functions.isToday;
const isTouchDevice = functions.isTouchDevice;
const objectToGetParam = functions.objectToGetParam;
const randomValuesFromArray = functions.randomValuesFromArray;
const removeNonNumericChars = functions.removeNonNumericChars;
const scrollIntoView = functions.scrollIntoView;
const scrollToElement = functions.scrollToElement;
const setCookie = functions.setCookie;
const sprintf = functions.sprintf;

export {
  functions,
  ajax,
  chunkArray,
  closest,
  commaNumberToDecimal,
  createUUID,
  csvToArray,
  dateTimeToISO,
  deepClone,
  deepMerge,
  expireCookie,
  forceDatePickerRange,
  getCookie,
  getCreationDateString,
  getDateString,
  getElapsedTimeText,
  getFileIcon,
  getFileExtension,
  getFileName,
  getInputValueWidth,
  getLanguageShort,
  getLanguageISO,
  getScrollParent,
  getUrlParams,
  getValuesByKeys,
  hexToRgb,
  isCurrentYear,
  interpolateColors,
  isElementVisible,
  isEmail,
  isEqualArray,
  isInView,
  isToday,
  isTouchDevice,
  objectToGetParam,
  randomValuesFromArray,
  removeNonNumericChars,
  scrollIntoView,
  scrollToElement,
  setCookie,
  sprintf
};