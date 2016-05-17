import {defineElement, calculateStyles, calculateOffset} from './utils';

/**
 * @typedef {Object} defaults
 * @property {String} position Screen side to fix an element ('top'|'bottom'|'top bottom')
 * @property {Boolean} placeholder Indicates whether placeholder is needed
 * @property {string} placeholderClass Classname to generate the placeholder
 * @property {string} fixedClass Classname to add for a fixed element
 * @property {HTMLElement|string} limiter Selector or node of the limiter for an element
 */
let defaults = {
  position: 'top',
  placeholder: true,
  placeholderClass: 'fixer-placeholder',
  fixedClass: '_fixed',
  limiter: null
};

/**
 * Class representing an element.
 * 
 * @class
 * @property {String} position Position to fix
 * @property {HTMLElement} node Node element
 * @property {HTMLElement} placeholder Placeholder node
 * @property {HTMLElement} limiter Limiter node
 * @property {Boolean} fixed Current fixed state
 * @property {Number} height Element's height
 * @property {Offset} offset Calculated offsets of the element from each side of the document
 * @property {Number} stackOffset
 * @property {Object} styles Saved initial styles
 */
export default class Element {

  /**
   * Create an element.
   * @param {string|HTMLElement} selector
   * @param {defaults} options
   */
  constructor (selector, options) {
    Object.assign(defaults, options);

    Object.assign(this, {
        node: defineElement(selector),
        limiter: defineElement(defaults.limiter),
        position: defaults.position,
        fixed: false
      });

    if (this.node && this.node.tagName) {
      // saving styles of element
      this.styles = calculateStyles(this.node);

      // saving top and left offsets of element
      this.offset = calculateOffset(this.node, this.styles);

      // saving element height
      this.height = this.node.offsetHeight;

      // creating placeholder if needed
      defaults.placeholder ? this.placeholder = this.createPlaceholder() : null;
    }
  }

  /**
   * Create placeholder node.
   * @return {HTMLElement}
   */
  createPlaceholder () {
    var placeholder = document.createElement('span');

    placeholder.className = defaults.placeholderClass;
    placeholder.style.width = this.node.offsetWidth + 'px';
    placeholder.style.height = this.node.offsetHeight + 'px';
    placeholder.style.maxWidth = this.styles.maxWidth;
    placeholder.style.marginTop = this.styles.marginTop;
    placeholder.style.marginRight = this.styles.marginRight;
    placeholder.style.marginBottom = this.styles.marginBottom;
    placeholder.style.marginLeft = this.styles.marginLeft;
    placeholder.style.float = this.styles.float;
    placeholder.style.clear = this.styles.clear;
    placeholder.style.zIndex = '-1'; // for buggy Safari
    placeholder.style.display = 'none';

    this.node.parentNode.insertBefore(placeholder, this.node.nextSibling);

    return placeholder;
  }

  /**
   * Fix an element's node.
   * @param {number} offset
   */
  fix (offset) {
    var element = this.node;
    var placeholder = this.placeholder;

    element.style.width = this.styles.width;  // set width before change position
    element.style.position = 'fixed';
    element.style[this.position] = offset + 'px';
    element.style.zIndex = this.styles.zIndex == 'auto' ? '100' : this.styles.zIndex;

    if (document.documentElement.classList && !element.classList.contains(defaults.fixedClass)) {
      element.classList.add(defaults.fixedClass);
    }
    else if (element.className.indexOf(defaults.fixedClass) == -1) {
      element.className += ' ' + defaults.fixedClass;
    }

    if (this.styles.float !== 'none') {
      element.style.left = this.offset.left - parseInt(this.styles.marginLeft) + 'px';
    }

    if (this.centering) {
      element.style.left = 0;
      element.style.right = 0;
    }

    if (placeholder) {
      placeholder.style.display = this.styles.display;
    }

    this.fixed = true;
  }

  /**
   * Unfix an element's node (return its state to initial) and update properties.
   */
  unFix () {
    var element = this.node;
    var placeholder = this.placeholder;

    element.style.width = '';  // set width before change position
    element.style.position = this.styles.position;
    element.style.top = this.styles.top;
    element.style.zIndex = this.styles.zIndex;
    element.style.marginTop = this.styles.marginTop;

    if (document.documentElement.classList) {
      element.classList.remove(defaults.fixedClass)
    } else {
      element.className = element.className.replace(defaults.fixedClass, '');
    }

    if (placeholder) {
      placeholder.style.display = 'none';
    }

    this.fixed = false;
  };

  /**
   * Hide node of an element.
   */
  hide () {
    this.node.style.display = 'none';
  }

  /**
   * Show node of an element (return its initial display style).
   */
  show () {
    this.node.style.display = this.styles.display;
  }
}