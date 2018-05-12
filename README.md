> ## 🛠 Status: In Development
> `<animated-pages>` is still a work in progress, I don't even know if this will be the final name for the element yet.
>
> But feel free to try it out and give me your feedback on what you think could be improved, so far it works for some scenarios but not yet for every scenario you could use `<neon-animated-pages>` for.
>
> See the list of Known Issues and TODOs, below, for updates.

# `<animated-pages>`

This is a spiritual successor to the now deprecated [`<neon-animated-pages>`](https://www.webcomponents.org/element/PolymerElements/neon-animation/elements/neon-animated-pages).

It works with css animations and only depends on [lit-element](https://github.com/Polymer/lit-element) so you don't have to worry about including any heavy js libraries.

This component takes care of the logic behind triggering the animations so that you can focus on making your views and your animations (or just use the animations included here if you don't want to bother with those either 😉.)

To begin using it just follow this simple steps:

1. Install it:

  `npm i --save animated-pages` (it's not currently published yet 😅)

1. Import the script:

  In html:
  ```html
    <!-- Don't forget to include webcomponents loader -->
    <script src="node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
    <!-- type="moodule" is essential -->
    <script type="module" src="node_modules/animated-pages/animated-pages.js"></script>
  ```
  In a js module:
  ```javascript
    import 'animated-pages/animated-pages.js';
  ```

1. Create an instance of `<animated-pages>` in your HTML page, or via any framework that [supports rendering Custom Elements](https://custom-elements-everywhere.com/) and start using it:

  ```html
    <style>
      /* define your animation keyframes and classes
        (you can use the ones provided too)
        these must be defined context that contains
        <animated-pages> */
      /* these only use the standard css animation to keep
       example code short */
      .page-fadeIn {
      	animation: fadeIn .7s ease both;
      }
      @keyframes fadeIn {
      	from { opacity: 0.3; }
      	to { }
      }
      .page-fadeOut {
      	animation: fadeOut .7s ease both;
      }
      @keyframes fadeOut {
      	from { }
      	to { opacity: 0.0; }
      }
    </style>
    <section>
      <h2>Select a page</h2>
      <select id="selector">
        <option value="page1">Page 1</option>
        <option value="page2">Page 2</option>
        <option value="page3">Page 3</option>
      </select>
    </section>
    <!-- attrForSelected is used to say which attribute
      identifies the pages-->
    <animated-pages id="pages" attrForSelected="name">
      <!-- The pages can be almost anything -->
      <section name="page1">Page 1</section>
      <div name="page2">Page 2</div>
      <!-- It is recommended that custom elements
        used as a page all extend an element like pwa-starter-kit's
        page-view-element
        https://github.com/Polymer/pwa-starter-kit/blob/master/src/components/page-view-element.js-->
      <custom-element name="page3"></custom-element>
    </animated-pages>
    <script>
      // example way of changing pages, you could use a router
      // or any other way you want
      document.querySelector('#selector').addEventListener('change',
      (e)=>{
        // Change selected page
        document.querySelector('#pages').select(e.target.value);
      });

      // defining the "rules" for which css classes to apply on
      // diferent page transitions (a guide on this is coming soon)
      document.querySelector('#pages').animationClasses = {
        default: {
          in: 'page-fadeIn',
          out: 'page-fadeOut'
        }
      };
    </script>
  ```

## Known Issues
- Selecting the same page results on it disappearing
- Selecting an invalid page might have unexpected results

## TODOs
- [ ] choose a real name for this package
- [ ] add numeric index selection without the need for attrForSelected
- [ ] add customizable 'active' attribute
- [ ] add class mode in addition to attribute mode

## Credits
Almost all sample animations and the overall flow of the page selection are based on an article by [Pedro Botelho@Codrops](https://tympanus.net/codrops/2013/05/07/a-collection-of-page-transitions/).
