import { LitElement, html } from '@polymer/lit-element';
import './noattr-demo.js';
import './prevnext-demo.js';
import './property-demo.js';
import '../helium-animated-pages.js';
import { FadeIn, FadeOut } from '../sample-animations/fade-animations.js';

class DemoElement extends LitElement {

  _render({ _mainAnimationClasses }) {
    return html `
      ${FadeIn}
      ${FadeOut}
      <style>
        :host {
          font-family: sans-serif;
        }
        section[name="page1"] {
          background-color: #bbbbbb;
        }
        section[name="page2"] {
          background-color: lightblue;
        }
        section[name="page3"] {
          background-color: lightgreen;
        }
      </style>
      <section>
        <h2>Select a page</h2>
        <select onchange="${(e) => this._selectMainPage(e)}">
          <option value="">Select page...</option>
          <option value="noattr">No attrForSelected Demo</option>
          <option value="prevnext">selectPrevious()/selectNext() Demo</option>
          <option value="property">Using the 'selected' property</option>
          <option value="page1">Page 1</option>
          <option value="page2">Page 2</option>
          <option value="page3">Page 3</option>
        </select>
      </section>
      <helium-animated-pages id="main" attrForSelected="name"
        animationClasses="${_mainAnimationClasses}">
        <noattr-demo name="noattr"></noattr-demo>
        <prevnext-demo name="prevnext"></prevnext-demo>
        <property-demo name="property"></property-demo>
        <section name="page1">Page 1</section>
        <section name="page2">Page 2</section>
        <section name="page3">Page 3</section>
      </helium-animated-pages>
    `;
  }

  static get properties() {
    return {
      _mainAnimationClasses: Object
    };
  }

  constructor() {
    super();
    this._mainAnimationClasses = {
      default: {
        in: 'page-fadeIn',
        out: 'page-fadeOut'
      }
    };
  }

  _selectMainPage(e) {
    if (e.target.value) {
      this.shadowRoot.querySelector('#main').select(e.target.value);
    }
  }

}
window.customElements.define('demo-element', DemoElement);
