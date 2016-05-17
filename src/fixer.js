import Element from './element';
import defaults from './defaults';
import {getScrolledPosition} from './utils';
import debounce from 'debounce';
import throttle from 'throttleit';

/**
 * Class representing a fixer.
 */
class Fixer {

  /**
   * Create fixer.
   */
  constructor () {
    // array of the registered elements to fix
    this.elements = [];

    // listen to the page load and scroll
    let onScroll = throttle(() => this.listenScroll(getScrolledPosition()), 16);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('load', onScroll);

    // listen to the page resize and recalculate elements width
    let onResize = debounce(() => this.recalculateElementsWidth(getScrolledPosition()), 100);
    window.addEventListener('resize', onResize);
  }

  /**
   * Adding an element to Fixer.
   * @param {String|HTMLElement|jQuery} selector
   * @param {defaults=} options
   * @return {Fixer}
   */
  addElement (selector, options) {
    let element = null;

    // TODO: check if some element is using position of this one

    if (selector) {
      element = new Element(selector, options);

      if (element.node && element.node.tagName) {
        this.elements.push(element);
        this.listenScroll(getScrolledPosition());
      }
      else {
        throw new Error("Can't add element '" + selector);
      }
    }
    else {
      throw new Error("Please, provide selector or node to add new Fixer element");
    }

    return this;
  }

  /**
   * Function listening scroll.
   * @param {scrolled} scrolled Document scrolled values in pixels
   */
  listenScroll (scrolled) {
    let i = this.elements.length;

    while (i--) {
      let element = this.elements[i];
      let stackHeight = this.getStackHeight(element);

      if (element.position == "top") {
        if (element.offset.top <= scrolled.top + stackHeight && element.fixed === false) {
          element.fix(stackHeight);
        }
        else if (element.offset.top >= scrolled.top + stackHeight) {
          element.unFix();
        }
      }
      else if (element.position == "bottom") {
        if (element.offset.bottom >= scrolled.top - stackHeight + document.documentElement.offsetHeight && element.fixed === false) {
          element.fix(stackHeight);
        }
        else if (element.offset.bottom <= scrolled.top - stackHeight + document.documentElement.offsetHeight) {
          element.unFix();
        }
      }
    }
  }

  /**
   * Get stack height for an element.
   * @param {Element} element
   */
  getStackHeight (element) {
    let sum = 0;
    let i = this.elements.length;
    let item;

    while (i--) {
      item = this.elements[i];

      if (element.position === item.position && (element.position === "top" ? item.offset.top < element.offset.top : item.offset.bottom > element.offset.bottom)) {
        sum += item.height || 0;
      }
    }

    return sum;
  }

  /**
   * Recalculate width of the fixed elements (on resize).
   * @param {scrolled} scrolled Document scrolled height in pixels
   */
  recalculateElementsWidth (scrolled) {
    let i = this.elements.length;
    let item;

    while (i--) {
      item = this.elements[i];

      if (
        item.fixed &&                   // if element is fixed
        item.placeholder &&             // if element have placeholder
        item.placeholder.offsetWidth && // if placeholder have width value
        item.node.offsetWidth !== item.placeholder.offsetWidth
      ) {
        // TODO: check calculating of width with different css box-sizing values
        // set the value of an element width equal to the width its placeholder
        item.node.style.width = item.placeholder.offsetWidth - item.styles.paddingLeft - item.styles.paddingRight + 'px';
      }
    }

    // call listenScroll method to check all elements position
    this.listenScroll(scrolled);
  };
}

export default Fixer;