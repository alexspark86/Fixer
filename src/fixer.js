import Element from './element';
import defaults from './defaults';
import {getScrolledPosition} from './utils';

/**
 * Class representing a fixer.
 */
class Fixer {

  /**
   * Create a fixer.
   */
  constructor () {
    // array of the registered elements to fix
    this.elements = [];

    // listen to the page load and scroll
    window.onload = window.onscroll = () => this.listenScroll(getScrolledPosition());

    // listen to the page resize and recalculate elements width
    window.onresize = () => this.recalculateElementsWidth(getScrolledPosition());
  }

  /**
   * Adding element to Fixer.
   * @param {defaults} options
   * @return {Element|boolean}
   */
  addElement (options) {
    let element = null;

    // TODO: check if some element is using position of this one

    if (options) {
      element = new Element(options);

      if (element.element && element.element.tagName) {
        this.elements.push(element);
        this.listenScroll(getScrolledPosition());
      }
      else {
        throw new Error("Can't add element '" + options.element +"', please check the options", options);
      }
    }
    else {
      throw new Error("Please, provide options to add new Fixer element");
    }

    return element;
  }

  /**
   * Function listening scroll.
   * @param {number} scrolled Document scrolled height in pixels
   */
  listenScroll (scrolled) {
    let i = this.elements.length;

    while (i--) {
      let element = this.elements[i];
      let height = this.getHeight(element);

      if (element.position == "top") {
        if (element.offset.top <= scrolled.top + height && element.fixed === false) {
          element.fix(height);
        }
        else if (element.offset.top >= scrolled.top + height) {
          element.unFix();
        }
      }
      else if (element.position == "bottom") {
        if (element.offset.bottom >= scrolled.top - height + document.documentElement.offsetHeight && element.fixed === false) {
          element.fix(height);
        }
        else if (element.offset.bottom <= scrolled.top - height + document.documentElement.offsetHeight) {
          element.unFix();
        }
      }
    }
  }

  /**
   * Getting height for an element
   */
  getHeight (element) {
    return this.elements.reduce((sum, item) => {
      if (element.position === item.position && (element.position === "top" ? item.offset.top < element.offset.top : item.offset.bottom > element.offset.bottom)) {
        return sum + (+item.height || 0);
      }

      return sum;
    }, 0);
  }

  /**
   * Recalculating width of the fixed elements (on resize).
   * @param {number} scrolled Document scrolled height in pixels
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
        item.element.offsetWidth !== item.placeholder.offsetWidth
      ) {
        // TODO: check calculating of width with different css box-sizing values
        // set the value of an element width equal to the width its placeholder
        item.element.style.width = item.placeholder.offsetWidth - item.styles.paddingLeft - item.styles.paddingRight + 'px';
      }
    }

    // call listenScroll method to check all elements position
    this.listenScroll(scrolled);
  };
}

export default Fixer;