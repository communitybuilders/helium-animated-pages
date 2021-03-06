import { LitElement, html } from '@polymer/lit-element';

/**
 * A light spiritual succesor to neon-animated-pages using only css animations
 *
 * @customElement
 * @polymer
 * @extends LitElement
 */
class HeliumAnimatedPages extends LitElement {
  _render(props) {
    return html `
      <style>
        :host {
          position: absolute;
        	width: 100%;
        	height: 100%;
        	perspective: var(--helium-animation-perspective, 1200px);
        	transform-style: preserve-3d;
        }
        ::slotted(*) {
          width: 100%;
        	height: 100%;
        	position: absolute;
        	top: 0;
        	left: 0;
        	visibility: var(--helium-children-visible, visible);
          will-change: visibility;
        	overflow: hidden;
        	backface-visibility: hidden;
        	transform: translate3d(0, 0, 0);
        }
        ::slotted(:not([active])) {
          visibility: hidden;
          --helium-children-visible: hidden;
          z-index: -1;
        }
      </style>
      <slot></slot>
    `;
  }

  static get properties() {
    return {
      /**
       * This property is required for the animations to run, it maps which
       * animations to run depending on what the transition will be.
       *
       * The properties of this object each represent a different transition
       * rule, the transition rules can be of one of the following types (in
       * order of priority, all the examples asume you have at least two pages
       * which identify respectively as `page1` and `page2`):
       * - `from_to`: The most specific kind of transition.
       *   It defines an animation which will run when both the newly selected
       *   page and the previously selected page match with the rule. For
       *   example: `page1_page2`.
       * - `_to ` is a special subtype of this rule when there was no
       *   previously selected page. For example: `_page1`
       * - `*_to`: It defines an animation which will run when only the newly
       *   selected page matches this rule. For example: `*_page2`
       * - `from_*`: It defines an animation which will run when only the
       *   previously selected page matches this rule. For example: `page1_*`
       * - `default`: It defines an animation which will run when none of the
       *   other rules apply.
       *
       * Any transition rule should be an object with this format:
       * ```javascript
       * {
       *   in: 'inbound_css_animation_class_name',
       *   out: 'outbound_css_animation_class_name'
       * }
       * ```
       */
      animationClasses: Object,
      /**
       * If set, it will be the name of the attribute used to identify
       * different pages added inside the instance of `helium-animated-pages`
       * (otherwise a the index of the children page will be used). Any page
       * without this attribute will be ignored and if two pages are found with
       * the same value for the attribute only the first one will be selectable.
       */
      attrForSelected: String,
      /**
       * This property will get the state of the animation,
       * whether it's currently in the middle of an animation or not.
       * @readonly
       */
      isAnimating: Boolean,
      /**
       * The index or value of the attribute of the currently
       * selected node, it's only the index if `attrForSelected` isn't defined.
       * Modifying this property achieves the same results as invoking
       * the `select(next)` method.
       * Just be warned, if you use this property with a downwards only binding and
       * also try to use any of the selection methods you might get state
       * inconsistencies.
       */
      selected: String,
      /**
       * The currently selected item's DOM node.
       * @readonly
       */
      selectedItem: Object,
      _selected: String,
      _animationEvent: String,
      _animating: Boolean,
      _inAnimationEnded: Boolean,
      _outAnimationEnded: Boolean,
      _inPage: Object,
      _outPage: Object,
      _inAnimationBound: Object,
      _outAnimationBound: Object,
      _currentClasses: Object,
    };
  }

  constructor() {
    super();
    const animations = {
      "animation": "animationend",
      "OAnimation": "oAnimationEnd",
      "MozAnimation": "animationend",
      "WebkitAnimation": "webkitAnimationEnd",
    };
    for (const a in animations) {
      if (this.style[a] !== undefined) {
        this._animationEvent = animations[a];
        break;
      }
    }
    this._inAnimationBound = this._inAnimation.bind(this);
    this._outAnimationBound = this._outAnimation.bind(this);
  }

  get isAnimating() {
    return this._animating;
  }

  get selected() {
    return this._selected;
  }

  set selected(next) {
    if (!this.animationClasses) {
      throw new Error('animationClasses must be defined');
    }
    // Do nothing if the animation is running
    if (this._animating) return;

    const stringMode = this._isStringMode(next);
    if (stringMode && !this.attrForSelected) {
      throw new Error('attrForSelected must be defined if next is a string');
    }

    this._inPage = stringMode ?
      this.querySelector(`[${this.attrForSelected}="${next}"]`) :
      this.children[next];
    this._outPage = this.selectedItem;

    if (!this._inPage) {
      const msg = stringMode ?
        `No page found with ${this.attrForSelected}="${next}"` :
        `No page found with index ${next}`;
      throw new Error(msg);
    }

    // Do nothing if the same page is being selected
    if (this._inPage === this._outPage) return;

    const prev = this._outPage && stringMode ?
      this._outPage.getAttribute(this.attrForSelected) :
      this._outPage ? Array.from(this.children).indexOf(this._outPage) :
      '';

    this._selected = this.attrForSelected ?
      this._inPage.getAttribute(this.attrForSelected) :
      next;
    this._currentClasses = this._animationClasses(next, prev);
    this._beginAnimation();
  }

  get selectedItem() {
    if(this._selected || this._selected === 0) {
      return this.attrForSelected ?
        this.querySelector(`[${this.attrForSelected}="${this._selected}"]`) :
        this.children[this._selected];
    }
    return null;
  }

  /**
   * select - Makes a transition into the page identified with next.
   *
   * - If `next` is a string the new page will be searched depending on
   *   `attrForSelected`. It will throw an error if `attrForSelected` isn't
   *   defined.
   * - If `next` is a number the new page will be searched by index. It must be
   *   a positive integer or else it will throw an error.
   *
   * If no page is found corresponding to the identifier or `animationClasses`
   * isn't defined it will throw an error.
   *
   * If an animation is running or the new page is the same as the previous
   * page it will do nothing.
   *
   * @param  {string|number} next next page index or attribute value
   * @returns {undefined}
   */
  select(next) {
    this.selected = next;
  }

  /**
   * selectNext - Makes a transition to the page which is the next sibling of
   * the currently selected page.
   * If the current page is undefined or is the last children the first
   * children will be selected.
   * An error will be thrown if there are no children or if `animationClasses`
   * isn't defined.
   * If an animation is running or the new page is the same as the previous
   * page it will do nothing.
   *
   * @returns {undefined}
   */
  selectNext() {
    const children = Array.from(this.children);
    if (!children || children.length === 0) {
      throw new Error('This component has no children to animate');
    }
    const selectedItem = this.selectedItem;
    let prevIndex = children.indexOf(selectedItem);
    let nextIndex = prevIndex + 1 >= children.length ? 0 : prevIndex + 1;
    this.selected = nextIndex;
  }

  /**
   * selectPrevious - Makes a transition to the page which is the previous sibling
   * of the currently selected page.
   *
   * If the current page is undefined or is the first children the last
   * children will be selected.
   * An error will be thrown if there are no children or if `animationClasses`
   * isn't defined.
   * If an animation is running or the new page is the same as the previous
   * page it will do nothing.
   *
   * @returns {undefined}
   */
  selectPrevious() {
    const children = Array.from(this.children);
    if (!children || children.length === 0) {
      throw new Error('This component has no children to animate');
    }
    const selectedItem = this.selectedItem;
    let prevIndex = children.indexOf(selectedItem);
    let nextIndex = prevIndex - 1 < 0 ? children.length - 1 : prevIndex - 1;
    this.selected = nextIndex;
  }

  _beginAnimation() {
    this._animating = true;
    this._inPage.addEventListener(this._animationEvent, this._inAnimationBound);
    if (this._outPage) {
      this._outPage.addEventListener(this._animationEvent, this._outAnimationBound);
      this._outPage.classList.add(this._currentClasses.out);
    } else {
      this._outAnimationEnded = true;
    }
    this._inPage.classList.add(this._currentClasses.in);
    this._inPage.setAttribute('active', true);
  }

  _animationClasses(next, prev) {
    const fullId = `${prev}_${next}`;
    const toId = `*_${next}`;
    const fromId = `${prev}_*`;
    if (fullId in this.animationClasses) {
      return this.animationClasses[fullId];
    } else if (toId in this.animationClasses) {
      return this.animationClasses[toId];
    } else if (fromId in this.animationClasses) {
      return this.animationClasses[fromId];
    } else {
      return this.animationClasses.default;
    }
  }

  _inAnimation(e) {
    this._inPage.removeEventListener(this._animationEvent, this._inAnimationBound);
    this._inAnimationEnded = true;
    this._onAnimationEnd();
  }

  _outAnimation(e) {
    this._outPage.removeEventListener(this._animationEvent, this._outAnimationBound);
    this._outAnimationEnded = true;
    this._onAnimationEnd();
  }

  _onAnimationEnd() {
    if (this._inAnimationEnded && this._outAnimationEnded) {
      this._inAnimationEnded = false;
      this._outAnimationEnded = false;
      this._animating = false;
      this._inPage.classList.remove(this._currentClasses.in);
      if (this._outPage) {
        this._outPage.removeAttribute('active');
        this._outPage.classList.remove(this._currentClasses.out);
      }
      this._inPage = null;
      this._outPage = null;
      this._currentClasses = null;
    }
  }

  _isStringMode(next) {
    const type = typeof next;
    switch (type) {
      case 'string':
        return true
        break;
      case 'number':
        if (next >= 0 && Number.isInteger(next)) {
          return false;
        }
      default:
        throw new Error('next must be a string or a positive integer');
    }
  }
}
window.customElements.define('helium-animated-pages', HeliumAnimatedPages);
