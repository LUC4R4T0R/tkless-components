"use strict";

/**
 * @overview <i>ccmjs</i>-based web component for PDF viewer
 * @see https://github.com/mozilla/pdf.js/
 * @author Tea Kless <tea.kless@web.de> 2020
 * @author André Kless <andre.kless@web.de> 2021-2022
 * @author Luca Ringhausen <luca.ringhausen@h-brs.de> 2022 (text- & annotation-layer features)
 * @license The MIT License (MIT)
 * @version latest (8.0.0)
 * @changes
 * version 8.1.0 (??.12.2022):
 * - added support for the annotation-layer (annotations & links)
 * version 8.0.0 (24.11.2022):
 * - Uses ccmjs v27.4.2 as default.
 * - Dark mode not set by default.
 * - Uses helper.mjs v8.4.1 as default.
 * - No logger support. Use the callbacks instead.
 * - Changed parameters of the onchange callback.
 * - Added onready and onstart callback.
 * - The static texts are in German by default.
 * - Configuration property "textLayer" has been renamed to "text_layer".
 * - Bugfix for rendering a PDF page when another page hasn't finished rendering yet.
 * - PDF.js setup has been updated.
 * - Event handlers are a public property of the app instance.
 * - Updated prevent right-click to download a PDF page.
 * - If no initial PDF page is set, the PDF will be loaded without rendering a PDF page.
 * - <code>await</code> is no longer used to wait for a PDF page to be rendered.
 * - When switching the PDF page, only the HTML template of the control bar with the buttons is updated, not the entire main HTML template.
 * - Bugfix for calculating the rendered size of the PDF page.
 * (for older version changes see ccm.pdf_viewer-7.3.0.js)
 */

( () => {

  /**
   * <i>ccmjs</i>-based web component for PDF Viewer.
   * @namespace WebComponent
   * @type {object}
   * @property {string} name - Unique identifier of the component.
   * @property {number[]} [version] - Version of the component according to Semantic Versioning 2.0 (default: latest version).
   * @property {string} ccm - URL of the (interchangeable) ccmjs version used at the time of publication.
   * @property {app_config} config - Default app configuration.
   * @property {Class} Instance - Class from which app instances are created.
   */
  const component = {
    name: 'pdf_viewer',
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.4.2.min.js',
    config: {
      "css": [ "ccm.load",
        "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/styles-latest.min.css",
        "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-icons.min.css",
        { "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-fonts.min.css", "context": "head" },
      ],
//    "dark": "auto",
      "downloadable": true,
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.1.min.mjs" ],
      "html": [ "ccm.load", "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/templates-latest.mjs" ],
//    "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/versions/ccm.lang-1.1.0.min.js", {
//      "translations": {
//        "de": [ "ccm.load", "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/resources.mjs#de" ],
//        "en": [ "ccm.load", "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/resources.mjs#en" ]
//      }
//    } ],
//    "onchange": event => console.log( event ),
//    "onready": event => console.log( event ),
//    "onstart": event => console.log( event ),
      "page": 1,
      "pdf": "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/demo/de/slides.pdf",
      "pdfjs": {
        "lib": [ "ccm.load", "https://ccmjs.github.io/tkless-components/libs/pdfjs-2/pdf.min.js" ],
        "worker": [ "ccm.load", "https://ccmjs.github.io/tkless-components/libs/pdfjs-2/pdf.worker.min.js" ],
        "namespace": "pdfjs-dist/build/pdf"
      },
//    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-3.0.0.min.js" ],
      "text": [ "ccm.load", "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/resources.mjs#de" ],
      "text_layer": true,
      "annotation_layer": true,
      "force_target_blank": true
    },
    /**
     * @class
     * @memberOf WebComponent
     */
    Instance: function () {

      /**
       * Shortcut to helper functions
       * @private
       * @type {Object.<string,function>}
       */
      let $;

      /**
       * PDF file
       * @private
       * @type {Object}
       */
      let file;

      /**
       * Current page
       * @private
       * @type {number}
       */
      let page_nr;

      /**
       * last performed event
       * @type {string}
       */
      let last_event;

      /**
       * Indicates whether a PDF page has not yet been fully rendered.
       * @type {boolean}
       */
      let rendering = false;

      /**
       * Indicates whether the current PDF page has already changed again while rendering a PDF page.
       * @type {boolean}
       */
      let pending = false;

      /**
       * When the instance is created, when all dependencies have been resolved and before the dependent sub-instances are initialized and ready. Allows dynamic post-configuration of the instance.
       * @async
       * @readonly
       * @function
       */
      this.init = async () => {

        // Merge all helper functions and offer them via a single variable.
        $ = Object.assign( {}, this.ccm.helper, this.helper ); $.use( this.ccm );

        // Setup PDF.js library.
        window[ this.pdfjs.namespace ].GlobalWorkerOptions.workerSrc = this.pdfjs.worker;
        this.pdfjs = pdfjsLib;

      };

      /**
       * When the instance is created and after all dependent sub-instances are initialized and ready. Allows the first official actions of the instance that should only happen once.
       * @async
       * @readonly
       * @function
       */
      this.ready = async () => {

        // Define routes.
        this.routing && this.routing.define( { page: number => { page_nr = number; renderPage(); } } );

        // Add keyboard control.
        this.element.addEventListener( 'keydown', event => {
          switch ( event.key ) {
            case 'ArrowLeft':  this.events.onPrev();  break;
            case 'ArrowRight': this.events.onNext();  break;
            case 'ArrowUp':    this.events.onFirst(); break;
            case 'ArrowDown':  this.events.onLast();  break;
          }
        } );

        // Add touch control.
        $.touchControl( this.element, { onLeft: this.events.onPrev, onRight: this.events.onNext } );

        // Setup dark mode.
        this.dark === 'auto' && this.element.classList.add( 'dark_auto' );
        this.dark === true && this.element.classList.add( 'dark_mode' );

        // Trigger 'ready' event.
        this.onready && await this.onready( { instance: this } );

      }

      /**
       * Starts the app. The initial page of the PDF is visualized in the webpage area.
       * @async
       * @readonly
       * @function
       */
      this.start = async () => {

        // Load PDF.
        try {
          file = await this.pdfjs.getDocument( this.pdf ).promise;
        }
        catch ( exception ) {
          if ( exception.name !== 'PasswordException' ) return $.setContent( this.element, '' );
          try { file = await this.pdfjs.getDocument( { url: this.pdf, password: prompt( this.text.protected ) } ).promise; } catch ( e ) {}
          if ( !file ) return $.setContent( this.element, this.text.denied );
        }

        if(file){
          this.linkService = new PDFLinkService();
          this.linkService.setDocument(file, null);
          this.linkService.setCcmInstance(this);
        }

        // Render main HTML structure.
        render();

        // Render language selection.
        this.lang && !this.lang.getContext() && $.append( this.element.querySelector( 'header' ), this.lang.root );

        // Prevent the PDF from being downloadable by right-clicking on the canvas element.
        !this.downloadable && this.element.querySelector( 'canvas' ).addEventListener( 'contextmenu', event => event.preventDefault() );

        // Trigger 'start' event.
        this.onstart && await this.onstart( { instance: this } );

        // Render current PDF page.
        if ( !this.page ) return;
        page_nr = this.page;
        if ( this.routing && this.routing.get() )
          await this.routing.refresh();
        else
          renderPage();

      };

      /**
       * Contains all event handlers.
       * @namespace AppEvents
       * @readonly
       * @type {Object.<string,function>}
       */
      this.events = {

        /** When 'first page' button is clicked. */
        onFirst: () => {
          if ( page_nr <= 1 ) return;
          if ( this.onchange && this.onchange( { name: last_event = 'first', page: page_nr, instance: this, before: true } ) ) return;
          this.goTo( page_nr = 1 );
        },

        /** When 'previous page' button is clicked. */
        onPrev: () => {
          if ( page_nr <= 1 ) return;
          if ( this.onchange && this.onchange( { name: last_event = 'prev', page: page_nr, instance: this, before: true } ) ) return;
          this.goTo( --page_nr );
        },

        /**
         * When a specific page number has been entered.
         * @param {Event} event - event data from 'onchange' event of input field, which is used to jump directly to a specific page.
         */
        onJump: event => {
          const page = parseInt( event.target.value );
          event.target.value = '';
          if ( !page || page < 1 || page > file.numPages || page === page_nr ) return;
          if ( this.onchange && this.onchange( { name: last_event = 'jump', page: page_nr, instance: this, before: true } ) ) return;
          this.goTo( page );
        },

        /** When 'next page' button is clicked. */
        onNext: () => {
          if ( page_nr >= file.numPages ) return;
          if ( this.onchange && this.onchange( { name: last_event = 'next', page: page_nr, instance: this, before: true } ) ) return;
          this.goTo( ++page_nr );
        },

        /** When 'last page' button is clicked. */
        onLast: () => {
          if ( page_nr >= file.numPages ) return;
          if ( this.onchange && this.onchange( { name: last_event = 'last', page: page_nr, instance: this, before: true } ) ) return;
          this.goTo( page_nr = file.numPages );
        },

        /** When 'download' button is clicked. */
        onDownload: () => this.onchange && this.onchange( { name: 'download', instance: this } )

      };

      /**
       * Goes to a specific PDF page.
       * @param {number} page - PDF page number
       */
      this.goTo = page => {
        if ( page < 1 || page > file.numPages ) return;         // Invalid page number? => Abort
        page_nr = page;                                         // Update current page number.
        this.routing && this.routing.set( 'page-' + page_nr );  // Update app route.
        renderPage();                                           // Render PDF page.
      };

      this.pdfGoTo = page => {
        if ( this.onchange && this.onchange( { name: last_event = 'pdfjump', page: page, instance: this, before: true } ) ) return;
        this.goTo(page);
      };

      /**
       * Returns current page number.
       * @returns {number}
       */
      this.getPage = () => page_nr;

      /**
       * Returns the number of PDF pages.
       * @returns {number}
       */
      this.getPages = () => file.numPages;

      /** When an observed responsive breakpoint triggers. */
      this.onbreakpoint = this.refresh = () => renderPage();

      /**
       * Renders an HTML template.
       * @param {string} [template = "main"] - ID of the HTML template ("main" or "controls").
       */
      const render = ( template = 'main' ) => {
        this.html.render( this.html[ template ]( this, page_nr, file.numPages ), template === 'controls' ? this.element.querySelector( '#controls' ) : this.element );
        this.lang && this.lang.translate();
      }

      /** Renders current PDF page. */
      const renderPage = () => {

        /**
         * HTML element of the PDF page.
         * @type {Element}
         */
        const page_elem = this.element.querySelector( '#page' );

        // No page element? => abort
        if ( !page_elem ) return;

        // Workaround: Wait until the CSS is active in the DOM so that the available width can be determined correctly.
        if ( getComputedStyle( this.element ).display !== 'flex' ) return setTimeout( renderPage, 100 );

        // Wait if rendering of another PDF page is not finished yet.
        if ( rendering ) return pending = true; rendering = true;

        // Get the available width for the PDF page.
        const desiredWidth = page_elem.clientWidth;

        file.getPage( page_nr ).then( page => {       // Get current PDF page.
          render( 'controls' );                       // Update slide controls.

          // Scale page viewport.
          const viewport = page.getViewport( { scale: 1 } );
          const scale = desiredWidth / viewport.width;
          const scaledViewport = page.getViewport( { scale: scale } );

          const outputScale = window.devicePixelRatio || 1;       // Support HiDPI-screens.
          const canvas = this.element.querySelector( 'canvas' );  // Select <canvas> element.
          const context = canvas.getContext( '2d' );              // Get <canvas> context.

          // Scale <canvas> element.
          canvas.width = Math.floor( scaledViewport.width * outputScale );
          canvas.height = Math.floor( scaledViewport.height * outputScale );
          canvas.style.width = Math.floor( scaledViewport.width ) + 'px';
          canvas.style.height = canvas.parentElement.style.height = Math.floor( scaledViewport.height ) + 'px';

          // Render page in <canvas> element.
          const transform = outputScale !== 1 ? [ outputScale, 0, 0, outputScale, 0, 0 ] : null;
          const renderContext = {
            canvasContext: context,
            transform: transform,
            viewport: scaledViewport
          };
          page.render( renderContext ).promise.then( async () => {

            // Render text layer on top of PDF page.
            if ( this.text_layer ) {
              const text_layer = this.element.querySelector( '#text-layer' );
              text_layer.innerHTML = '';
              text_layer.style.width = canvas.clientWidth + 'px';
              text_layer.style.height = canvas.clientHeight + 'px';
              this.pdfjs.renderTextLayer( {
                textContent: await page.getTextContent(),
                container: text_layer,
                viewport: scaledViewport
              } );
            }
            if(this.annotation_layer){
              page.getAnnotations()
                  .then(annotationData => {
                    const annotation_layer = this.element.querySelector( '#annotation-layer' );
                    annotation_layer.innerHTML = '';
                    annotation_layer.style.width = canvas.clientWidth + 'px';
                    annotation_layer.style.height = canvas.clientHeight + 'px';
                    this.pdfjs.AnnotationLayer.render({
                      viewport: scaledViewport,
                      div: annotation_layer,
                      annotations: annotationData,
                      page: page,
                      linkService: this.linkService
                    });
                  });
            }

            // Rendering of PDF page is finished.
            rendering = false;

            // Current page has already changed? => Update PDF page.
            if ( pending ) { pending = false; renderPage(); } else this.onchange && this.onchange( { name: 'goto', page: page_nr, instance: this } );

          } );
        } );
      };

    }
  };
  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();

/**
 * App configuration.
 * @typedef {object} app_config
 * @prop {array} css - CSS dependencies
 * @prop {boolean|string} [dark] - Dark mode (true, false or "auto")
 * @prop {boolean} [downloadable=true] - Downloadable slides
 * @prop {array} helper - Dependency on helper functions
 * @prop {array} html - HTML template dependencies
 * @prop {array} [lang] - Dependency on component for multilingualism
 * @prop {function} [onchange] - When switching to another PDF page.
 * @prop {function} [onready] - Is called once before the first start of the app.
 * @prop {function} [onstart] - When the app has finished starting.
 * @prop {number} [page=1] - Initially displayed PDF page. Not set: PDF is loaded without displaying a page.
 * @prop {string} pdf - URL of the PDF file
 * @prop {object} pdfjs - Settings for the PDF.js library
 * @prop {array} pdfjs.lib - URL of the PDF.js library
 * @prop {array} pdfjs.worker - URL of the PDF.js worker file
 * @prop {string} pdfjs.namespace - Name from the global namespace of the PDF.js library
 * @prop {array} [routing] - Dependency on component for routing
 * @prop {boolean} text - Contains the static texts (tooltips of buttons).
 * @prop {boolean} [text_layer=true] - Texts on a PDF page can be marked and copied.
 * @prop {boolean} [text_layer=true] - Texts on a PDF page can be marked and copied.
 * @prop {boolean} [text_layer=true] - Texts on a PDF page can be marked and copied.
 */

/*
 * The following section is an excerpt of the sourcecode of pdf.js by the Mozilla foundation.
 * It was slightly modified to fit the needs of ccm.
 */

/* Copyright 2012-2015 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const DEFAULT_LINK_REL = "noopener noreferrer nofollow";

const LinkTarget = {
  NONE: 0, // Default value.
  SELF: 1,
  BLANK: 2,
  PARENT: 3,
  TOP: 4,
};

const NullCharactersRegExp = /\x00/g;
const InvisibleCharactersRegExp = /[\x01-\x1F]/g;

/**
 * @param {string} str
 * @param {boolean} [replaceInvisible]
 */
function removeNullCharacters(str, replaceInvisible = false) {
  if (typeof str !== "string") {
    console.error(`The argument must be a string.`);
    return str;
  }
  if (replaceInvisible) {
    str = str.replace(InvisibleCharactersRegExp, " ");
  }
  return str.replace(NullCharactersRegExp, "");
}

/**
 * Helper function to parse query string (e.g. ?param1=value&param2=...).
 * @param {string}
 * @returns {Map}
 */
function parseQueryString(query) {
  const params = new Map();
  for (const [key, value] of new URLSearchParams(query)) {
    params.set(key.toLowerCase(), value);
  }
  return params;
}

const addLinkAttributes = (link, { url, target = "", rel, enabled = true } = {}) =>  {
  if (!url || typeof url !== "string") {
    throw new Error('A valid "url" parameter must provided.');
  }

  const urlNullRemoved = removeNullCharacters(url);
  if (enabled) {
    link.href = link.title = urlNullRemoved;
  } else {
    link.href = "";
    link.title = `Disabled: ${urlNullRemoved}`;
    link.onclick = () => {
      return false;
    };
  }

  let targetStr = ""; // LinkTarget.NONE
  switch (target) {
    case LinkTarget.NONE:
      break;
    case LinkTarget.SELF:
      targetStr = "_self";
      break;
    case LinkTarget.BLANK:
      targetStr = "_blank";
      break;
    case LinkTarget.PARENT:
      targetStr = "_parent";
      break;
    case LinkTarget.TOP:
      targetStr = "_top";
      break;
  }
  link.target = targetStr;

  link.rel = typeof rel === "string" ? rel : DEFAULT_LINK_REL;
};

class PDFLinkService {
  #pagesRefCache = new Map();

  /**
   * @param {PDFLinkServiceOptions} options
   */
  constructor({
                eventBus,
                externalLinkTarget = null,
                externalLinkRel = null,
                ignoreDestinationZoom = false,
              } = {}) {
    this.eventBus = eventBus;
    this.externalLinkTarget = externalLinkTarget;
    this.externalLinkRel = externalLinkRel;
    this.externalLinkEnabled = true;
    this._ignoreDestinationZoom = ignoreDestinationZoom;

    this.baseUrl = null;
    this.pdfDocument = null;
    this.pdfViewer = null;
    this.pdfHistory = null;
  }

  setCcmInstance(instance){
    this.ccmInstance = instance;
  }

  setDocument(pdfDocument, baseUrl = null) {
    this.baseUrl = baseUrl;
    this.pdfDocument = pdfDocument;
    this.#pagesRefCache.clear();
  }

  /**
   * @type {number}
   */
  get pagesCount() {
    return this.pdfDocument ? this.pdfDocument.numPages : 0;
  }

  /**
   * @type {number}
   */
  get page() {
    return this.ccmInstance?.getPage();
  }

  /**
   * @param {number} value
   */
  set page(value) {
    this.ccmInstance?.pdfGoTo(value);
  }

  /**
   * @type {number}
   */
  get rotation() {
    console.info('pdf rotation not implemented!');
  }

  /**
   * @param {number} value
   */
  set rotation(value) {
    console.info('pdf rotation not implemented!');
  }

  #goToDestinationHelper(rawDest, namedDest = null, explicitDest) {
    // Dest array looks like that: <page-ref> </XYZ|/FitXXX> <args..>
    const destRef = explicitDest[0];
    let pageNumber;

    if (typeof destRef === "object" && destRef !== null) {
      pageNumber = this._cachedPageNumber(destRef);

      if (!pageNumber) {
        // Fetch the page reference if it's not yet available. This could
        // only occur during loading, before all pages have been resolved.
        this.pdfDocument
            .getPageIndex(destRef)
            .then(pageIndex => {
              this.cachePageRef(pageIndex + 1, destRef);
              this.#goToDestinationHelper(rawDest, namedDest, explicitDest);
            })
            .catch((e) => {
              console.error(
                  `PDFLinkService.#goToDestinationHelper: "${destRef}" is not ` +
                  `a valid page reference, for dest="${rawDest}".`
              );
            });
        return;
      }
    } else if (Number.isInteger(destRef)) {
      pageNumber = destRef + 1;
    } else {
      console.error(
          `PDFLinkService.#goToDestinationHelper: "${destRef}" is not ` +
          `a valid destination reference, for dest="${rawDest}".`
      );
      return;
    }
    if (!pageNumber || pageNumber < 1 || pageNumber > this.pagesCount) {
      console.error(
          `PDFLinkService.#goToDestinationHelper: "${pageNumber}" is not ` +
          `a valid page number, for dest="${rawDest}".`
      );
      return;
    }

    this.ccmInstance?.pdfGoTo(pageNumber);
  }

  /**
   * This method will, when available, also update the browser history.
   *
   * @param {string|Array} dest - The named, or explicit, PDF destination.
   */
  async goToDestination(dest) {
    if (!this.pdfDocument) {
      return;
    }
    let namedDest, explicitDest;
    if (typeof dest === "string") {
      namedDest = dest;
      explicitDest = await this.pdfDocument.getDestination(dest);
    } else {
      namedDest = null;
      explicitDest = await dest;
    }
    if (!Array.isArray(explicitDest)) {
      console.error(
          `PDFLinkService.goToDestination: "${explicitDest}" is not ` +
          `a valid destination array, for dest="${dest}".`
      );
      return;
    }
    this.#goToDestinationHelper(dest, namedDest, explicitDest);
  }

  /**
   * This method will, when available, also update the browser history.
   *
   * @param {number} val - The page number.
   */
  goToPage(val) {
    if (!this.pdfDocument) {
      return;
    }
    const pageNumber = val | 0;
    if (
        !(
            Number.isInteger(pageNumber) &&
            pageNumber > 0 &&
            pageNumber <= this.pagesCount
        )
    ) {
      console.error(`PDFLinkService.goToPage: "${val}" is not a valid page.`);
      return;
    }

    this.ccmInstance?.pdfGoTo(pageNumber);
  }

  /**
   * Wrapper around the `addLinkAttributes` helper function.
   * @param {HTMLAnchorElement} link
   * @param {string} url
   * @param {boolean} [newWindow]
   */
  addLinkAttributes(link, url, newWindow = false) {
    addLinkAttributes(link, {
      url,
      target: (this.ccmInstance?.force_target_blank || newWindow) ? LinkTarget.BLANK : this.externalLinkTarget,
      rel: this.externalLinkRel,
      enabled: this.externalLinkEnabled,
    });
  }

  /**
   * @param {string|Array} dest - The PDF destination object.
   * @returns {string} The hyperlink to the PDF object.
   */
  getDestinationHash(dest) {
    if (typeof dest === "string") {
      if (dest.length > 0) {
        return this.getAnchorUrl("#" + escape(dest));
      }
    } else if (Array.isArray(dest)) {
      const str = JSON.stringify(dest);
      if (str.length > 0) {
        return this.getAnchorUrl("#" + escape(str));
      }
    }
    return this.getAnchorUrl("");
  }

  /**
   * Prefix the full url on anchor links to make sure that links are resolved
   * relative to the current URL instead of the one defined in <base href>.
   * @param {string} anchor - The anchor hash, including the #.
   * @returns {string} The hyperlink to the PDF object.
   */
  getAnchorUrl(anchor) {
    return (this.baseUrl || "") + anchor;
  }

  /**
   * @param {string} hash
   */
  setHash(hash) {
    if (!this.pdfDocument) {
      return;
    }
    let pageNumber, dest;
    if (hash.includes("=")) {
      const params = parseQueryString(hash);
      if (params.has("search")) {
        this.eventBus.dispatch("findfromurlhash", {
          source: this,
          query: params.get("search").replace(/"/g, ""),
          phraseSearch: params.get("phrase") === "true",
        });
      }
      // borrowing syntax from "Parameters for Opening PDF Files"
      if (params.has("page")) {
        pageNumber = params.get("page") | 0 || 1;
      }
      if (params.has("zoom")) {
        // Build the destination array.
        const zoomArgs = params.get("zoom").split(","); // scale,left,top
        const zoomArg = zoomArgs[0];
        const zoomArgNumber = parseFloat(zoomArg);

        if (!zoomArg.includes("Fit")) {
          // If the zoomArg is a number, it has to get divided by 100. If it's
          // a string, it should stay as it is.
          dest = [
            null,
            { name: "XYZ" },
            zoomArgs.length > 1 ? zoomArgs[1] | 0 : null,
            zoomArgs.length > 2 ? zoomArgs[2] | 0 : null,
            zoomArgNumber ? zoomArgNumber / 100 : zoomArg,
          ];
        } else {
          if (zoomArg === "Fit" || zoomArg === "FitB") {
            dest = [null, { name: zoomArg }];
          } else if (
              zoomArg === "FitH" ||
              zoomArg === "FitBH" ||
              zoomArg === "FitV" ||
              zoomArg === "FitBV"
          ) {
            dest = [
              null,
              { name: zoomArg },
              zoomArgs.length > 1 ? zoomArgs[1] | 0 : null,
            ];
          } else if (zoomArg === "FitR") {
            if (zoomArgs.length !== 5) {
              console.error(
                  'PDFLinkService.setHash: Not enough parameters for "FitR".'
              );
            } else {
              dest = [
                null,
                { name: zoomArg },
                zoomArgs[1] | 0,
                zoomArgs[2] | 0,
                zoomArgs[3] | 0,
                zoomArgs[4] | 0,
              ];
            }
          } else {
            console.error(
                `PDFLinkService.setHash: "${zoomArg}" is not a valid zoom value.`
            );
          }
        }
      }
      if (dest) {
        this.ccmInstance.pdfGoTo(pageNumber||this.page)
      } else if (pageNumber) {
        this.page = pageNumber; // simple page
      }
      if (params.has("pagemode")) {
        this.eventBus.dispatch("pagemode", {
          source: this,
          mode: params.get("pagemode"),
        });
      }
      // Ensure that this parameter is *always* handled last, in order to
      // guarantee that it won't be overridden (e.g. by the "page" parameter).
      if (params.has("nameddest")) {
        this.goToDestination(params.get("nameddest"));
      }
    } else {
      // Named (or explicit) destination.
      dest = unescape(hash);
      try {
        dest = JSON.parse(dest);

        if (!Array.isArray(dest)) {
          // Avoid incorrectly rejecting a valid named destination, such as
          // e.g. "4.3" or "true", because `JSON.parse` converted its type.
          dest = dest.toString();
        }
      } catch (ex) {}

      if (
          typeof dest === "string" ||
          PDFLinkService.#isValidExplicitDestination(dest)
      ) {
        this.goToDestination(dest);
        return;
      }
      console.error(
          `PDFLinkService.setHash: "${unescape(
              hash
          )}" is not a valid destination.`
      );
    }
  }

  /**
   * @param {string} action
   */
  executeNamedAction(action) {
    // See PDF reference, table 8.45 - Named action
    switch (action) {
      case "GoBack":
        this.pdfHistory?.back();
        break;

      case "GoForward":
        this.pdfHistory?.forward();
        break;

      case "NextPage":
        this.ccmInstance?.pdfGoTo(this.ccmInstance.getPage() + 1);
        break;

      case "PrevPage":
        this.ccmInstance?.pdfGoTo(this.ccmInstance.getPage() - 1);
        break;

      case "LastPage":
        this.page = this.pagesCount;
        break;

      case "FirstPage":
        this.page = 1;
        break;

      default:
        break; // No action according to spec
    }

    this.eventBus.dispatch("namedaction", {
      source: this,
      action,
    });
  }

  /**
   * @param {number} pageNum - page number.
   * @param {Object} pageRef - reference to the page.
   */
  cachePageRef(pageNum, pageRef) {
    if (!pageRef) {
      return;
    }
    const refStr =
        pageRef.gen === 0 ? `${pageRef.num}R` : `${pageRef.num}R${pageRef.gen}`;
    this.#pagesRefCache.set(refStr, pageNum);
  }

  /**
   * @ignore
   */
  _cachedPageNumber(pageRef) {
    if (!pageRef) {
      return null;
    }
    const refStr =
        pageRef.gen === 0 ? `${pageRef.num}R` : `${pageRef.num}R${pageRef.gen}`;
    return this.#pagesRefCache.get(refStr) || null;
  }

  /**
   * @param {number} pageNumber
   */
  isPageVisible(pageNumber) {
    return this.pdfViewer.isPageVisible(pageNumber);
  }

  /**
   * @param {number} pageNumber
   */
  isPageCached(pageNumber) {
    return this.pdfViewer.isPageCached(pageNumber);
  }

  static #isValidExplicitDestination(dest) {
    if (!Array.isArray(dest)) {
      return false;
    }
    const destLength = dest.length;
    if (destLength < 2) {
      return false;
    }
    const page = dest[0];
    if (
        !(
            typeof page === "object" &&
            Number.isInteger(page.num) &&
            Number.isInteger(page.gen)
        ) &&
        !(Number.isInteger(page) && page >= 0)
    ) {
      return false;
    }
    const zoom = dest[1];
    if (!(typeof zoom === "object" && typeof zoom.name === "string")) {
      return false;
    }
    let allowNull = true;
    switch (zoom.name) {
      case "XYZ":
        if (destLength !== 5) {
          return false;
        }
        break;
      case "Fit":
      case "FitB":
        return destLength === 2;
      case "FitH":
      case "FitBH":
      case "FitV":
      case "FitBV":
        if (destLength !== 3) {
          return false;
        }
        break;
      case "FitR":
        if (destLength !== 6) {
          return false;
        }
        allowNull = false;
        break;
      default:
        return false;
    }
    for (let i = 2; i < destLength; i++) {
      const param = dest[i];
      if (!(typeof param === "number" || (allowNull && param === null))) {
        return false;
      }
    }
    return true;
  }
}
