import objectAssign from "object-assign";

/**
 * Get actual width and height of the document.
 * @return {Object}
 */
export function getDocumentSize () {
  let body = document.body;
  let html = document.documentElement;
  let {width, height} = document;

  if (typeof width === "undefined" && typeof height === "undefined" && body && html) {
    width = Math.max( body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth );
    height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
  }
  else if (!body && !html) {
    throw new Error("Can't calculate document size. Make sure that the method is called when the document is ready.");
  }

  return { width, height };
}

/**
 * Get width and height of the screen (viewport).
 * @return {Object}
 */
export function getScreenSize () {
  let body = document.body;
  let html = document.documentElement;
  let {width, height} = window.screen;

  if (typeof width === "undefined" && typeof height === "undefined" && window && body && html) {
    width = window.innerWidth || html.clientWidth || body.clientWidth;
    height = window.innerHeight || html.clientHeight || body.clientHeight;
  }
  else if (!body && !html) {
    throw new Error("Can't calculate screen size. Make sure that the method is called when the document is ready.");
  }

  return { width, height }
}

/**
 * Defining an element.
 * @param {String|jQuery|HTMLElement|Function} element
 * @return {HTMLElement}
 */
export function defineElement (element) {
  if (typeof element === "string") {
    element = document.querySelector(element);
  }
  else if (
    (typeof element === "object" && element !== null && typeof element.jquery !== "undefined" && element.length) ||
    (typeof $ === "object" && element instanceof $ && element.length)
  ) {
    element = element[0];
  }

  return element;
}

/**
 * Calculating browser styles for an element.
 * @param {HTMLElement} element
 */
export function calculateStyles (element) {
  const styles = window.getComputedStyle(element, null);

  return objectAssign({}, {
    position: styles.position,
    top: styles.top,
    zIndex: styles.zIndex,
    float: styles.float,
    clear: styles.clear,
    display: styles.display,
    marginTop: styles.marginTop,
    marginRight: styles.marginRight,
    marginBottom: styles.marginBottom,
    marginLeft: styles.marginLeft,
    width: styles.width,
    maxWidth: styles.maxWidth
  });
}

/**
 * Calculating offsets of the element from each side of the document.
 * @param {HTMLElement} element
 * @param {Object=} styles
 *
 * @typedef {Object} Offset
 * @property {Number} top
 * @property {Number} bottom
 * @property {Number} left
 * @property {Number} right
 *
 * @return {Offset}
 */
export function calculateOffset (element, styles) {
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const marginLeft = styles ? parseInt(styles.marginLeft) : 0;

  return {
    top: rect.top + scrollTop,
    bottom: rect.bottom + scrollTop,
    left: rect.left + scrollLeft - marginLeft,
    right: rect.right + scrollLeft - marginLeft
  };
}

/**
 * Getting scrollbar position.
 *
 * @typedef {Object} Scrolled
 * @property {Number} top
 * @property {Number} left
 *
 * @return {Scrolled}
 */
export function getScrolledPosition () {
  return {
    top: window.pageYOffset || document.documentElement.scrollTop,
    left: window.pageXOffset || document.documentElement.scrollLeft
  }
}

/**
 * Set styles for the node of an element.
 * @param {HTMLElement} element
 * @param {Object} properties
 */
export function setStyle (element, properties) {
  objectAssign(element.style, properties);
}

/**
 * Add className for element node.
 * @param {HTMLElement} element
 * @param {String} className
 */
export function addClass(element, className) {
  if (document.documentElement.classList && !element.classList.contains(className)) {
    element.classList.add(className);
  }
  else if (element.className.indexOf(className) === -1) {
    element.className += " " + className;
  }
}

/**
 * Remove className from element node.
 * @param {HTMLElement} element
 * @param {String} className
 */
export function removeClass(element, className) {
  if (document.documentElement.classList) {
    element.classList.remove(className)
  } else {
    element.className = element.className.replace(className, "");
  }
}

/**
 * Checks does object contains provided value.
 * @param {Object} object
 * @param {*} value
 */
export function objectHasValue (object, value) {
  for (var key in object) {
    if (object.hasOwnProperty(key) && object[key] === value) {
      return true;
    }
  }

  return false;
}

/**
 * Create cross-browser event.
 * @param {String} type
 * @return {Event}
 */
export function createEvent (type) {
  let event = null;

  try {
    event = new Event(type);
  }
  catch (error) {
    let doesntBubble = false;
    let isntCancelable = false;

    event = document.createEvent("Event");
    event.initEvent(type, doesntBubble, isntCancelable);
  }

  return event;
}