"use strict";

/**
 * @overview <i>ccmjs</i>-based web component for PDF viewer
 * @see https://github.com/mozilla/pdf.js/
 * @author Tea Kless <tea.kless@web.de> 2020
 * @author André Kless <andre.kless@web.de> 2021-2022
 * @author Luca Ringhausen <luca.ringhausen@h-brs.de> 2022 (text- & annotation-layer features)
 * @license The MIT License (MIT)
 * @version latest (8.1.0)
 * @changes
 * version 8.1.0 (14.12.2022):
 * - added support for the annotation-layer (annotations & links, implemented by Luca Ringhausen)
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
      "annotation_layer": [ "ccm.load", "https://ccmjs.github.io/tkless-components/libs/pdfjs-2/PDFLinkService.min.js" ],
      "css": [ "ccm.load",
        "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/styles-v3.min.css",
        "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-icons.min.css",
        { "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-fonts.min.css", "context": "head" },
      ],
//    "dark": "auto",
      "downloadable": true,
      "force_target_blank": true,
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.1.min.mjs" ],
      "html": [ "ccm.load", "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/templates-v3.min.mjs" ],
      "images_path": "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/images/",
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
      "text": [ "ccm.load", "https://ccmjs.github.io/tkless-components/pdf_viewer/resources/resources-v3.min.mjs#de" ],
      "text_layer": true
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

        this.enableControls = true;

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

        // Initialize PDFLinkService.
        if ( this.annotation_layer && file ) {
          this.linkService = new this.annotation_layer();
          this.linkService.setDocument( file, null );
          this.linkService.setCcmInstance( this );
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
          if ( this.onchange && this.onchange( { name: last_event = 'jump', page: page, instance: this, before: true } ) ) return;
          if ( !page || page < 1 || page > file.numPages || page === page_nr ) return;
          this.goTo( page );
        },

        /** When 'next page' button is clicked. */
        onNext: (event) => {
          if ( page_nr >= file.numPages ) return;
          if ( this.onchange && this.onchange( { name: last_event = 'next', page: page_nr, instance: this, before: true, data: event} ) ) return;
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

      this.enable = () => {
        this.enableControls = true;
        render('controls');
      }

      this.disable = () => {
        this.enableControls = false;
        console.log('disabling');
        render('controls');
      }

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

            // Render annotation layer on top of PDF page.
            this.annotation_layer && page.getAnnotations().then( annotationData => {
              const annotation_layer = this.element.querySelector( '#annotation-layer' );
              annotation_layer.innerHTML = '';
              annotation_layer.style.width = canvas.clientWidth + 'px';
              annotation_layer.style.height = canvas.clientHeight + 'px';
              this.pdfjs.AnnotationLayer.render( {
                viewport: scaledViewport,
                div: annotation_layer,
                annotations: annotationData,
                page: page,
                linkService: this.linkService,
                imageResourcesPath: this.images_path
              } );
            } );

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
 * @prop {array} [annotation_layer] - Links on a PDF page can be opened. Dependency to the PDFLinkService.
 * @prop {array} css - CSS dependencies
 * @prop {boolean|string} [dark] - Dark mode (true, false or "auto")
 * @prop {boolean} [downloadable=true] - Downloadable slides
 * @prop {string} images_path - Path under which the annotation icons can be found.
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
 */
