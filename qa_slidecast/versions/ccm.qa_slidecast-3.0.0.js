/**
 * @overview ccmjs-based web component for slidecast with commentary
 * @author Tea Kless <tea.kless@web.de> 2020
 * @author André Kless <andre.kless@web.de> 2021-2022
 * @license The MIT License (MIT)
 * @version 3.0.0
 * @changes
 * version 3.0.0 (15.02.2022):
 * - uses ccmjs v27.3.1 as default
 * - uses helper.mjs v8.1.0 as default
 * - support for app URL's and embed code of all DMS versions
 * - pass setting for dark mode to child instances
 * (for older version changes see ccm.qa_slidecast-2.2.0.js)
 */

( () => {
  const component = {
    name: 'qa_slidecast',
    version: [ 3, 0 ,0 ],
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.3.1.min.js',
    config: {
//    "comment": [ "ccm.component", "https://ccmjs.github.io/tkless-components/comment/versions/ccm.comment-7.2.0.min.js" ],
      "css": [ "ccm.load",
        "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/styles.min.css",
        "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-icons.min.css",
        { "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-fonts.min.css", "context": "head" },
      ],
      "dark": "auto",
//    "description": true,
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-8.1.0.min.mjs" ],
      "html": [ "ccm.load", "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/templates.mjs" ],
//    "ignore": { "slides": [] },
//    "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/versions/ccm.lang-1.1.0.min.js" ],
//    "onchange": ( { name, instance, before } ) => { console.log( name, instance.slide_nr, !!before ) },
//    "onstart": instance => { console.log( 'start', instance.slide_nr ) },
      "open": "both",
      "pdf_viewer": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/pdf_viewer/versions/ccm.pdf_viewer-7.2.0.min.js" ],
//    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-3.0.0.min.js" ],
      "slide_nr": 1,
      "ignore": {},
      "text": [ "ccm.load", "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/resources.mjs#text_en" ],
      "youtube": [ "ccm.component", "https://ccmjs.github.io/akless-components/youtube/versions/ccm.youtube-2.1.1.js" ]
    },
    Instance: function () {

      /**
       * shortcut to help functions
       * @type {Object.<string,Function>}
       */
      let $;

      /**
       * when the instance is created, when all dependencies have been resolved and before the dependent sub-instances are initialized and ready
       * @returns {Promise<void>}
       */
      this.init = async () => {

        // set shortcut to help functions
        $ = Object.assign( {}, this.ccm.helper, this.helper ); $.use( this.ccm );

        // set unique key for app state data of commentary
        if ( this.comment && !this.comment.config.data.key ) this.comment.config.data.key = $.generateKey();

        // disable routing of PDF viewer
        delete this.pdf_viewer.routing;

        // pass setting for dark mode to child instances
        if ( this.lang ) this.lang.dark = this.dark;
        this.pdf_viewer.dark = this.dark;

      };

      /**
       * when all dependencies are solved after creation and before the app starts
       * @returns {Promise<void>}
       */
      this.ready = async () => {

        // recalibrate controls of PDF viewer
        this.pdf_viewer.onchange = async event => {
          if ( this.onchange && await this.onchange( { name: event.name, instance: this, before: true } ) ) return;
          if ( event.before ) {
            let slide;
            switch ( event.name ) {
              case 'first': slide = 1;                         break;
              case 'prev':  slide = this.slide_nr - 1;         break;
              case 'jump':  slide = event.page;                break;
              case 'next':  slide = this.slide_nr + 1;         break;
              case 'last':  slide = this.ignore.slides.length; break;
            }
            if ( !( slide >= 1 && slide <= this.ignore.slides.length && slide !== this.slide_nr ) ) return;
            this.slide_nr = slide;
            this.routing && this.routing.set( 'slide-' + slide );  // update route
            await render();
          }
          if ( this.onchange && await this.onchange( { name: event.name, instance: this } ) ) return;
          return true;
        };

        // define routes and log 'ready' event
        this.routing && this.routing.define( { slide: number => { this.slide_nr = number; render(); } } );
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

        // setup dark mode
        this.dark === 'auto' && this.element.classList.add( 'dark_auto' );
        this.dark === true && this.element.classList.add( 'dark_mode' );

      };

      /**
       * starts the app
       * @returns {Promise<void>}
       */
      this.start = async () => {

        this.logger && this.logger.log( 'start', this.getValue() );  // logging of 'start' event
        await this.pdf_viewer.start();                               // start PDF viewer

        // set default slides data
        if ( !this.ignore.slides ) {
          this.ignore.slides = [];
          for ( let page = 1; page <= this.pdf_viewer.getPages(); page++ )
            this.ignore.slides.push( { content: page } );
        }

        // render slide
        if ( this.routing && this.routing.get() )
          await this.routing.refresh();
        else
          await render();

        // render language selection and user login/logout
        const header = this.element.querySelector( 'header' );
        if ( header ) {
          header && this.lang && !this.lang.getContext() && $.append( header, this.lang.root );
          header && this.user && $.append( header, this.user.root );
        }

        // trigger 'onstart' callback
        this.onstart && await this.onstart( this );

      };

      /**
       * returns app state data
       * @returns {Object}
       */
      this.getValue = () => { return { slide_nr: this.slide_nr, slides: $.clone( this.ignore.slides ) } };

      /**
       * renders/updates content
       * @param {boolean} [skip] - skip rendering of inner apps
       * @returns {Promise<void>}
       */
      const render = async skip => {

        /**
         * slide data
         * @type {Object}
         */
        const slide_data = this.ignore.slides[ this.slide_nr - 1 ] || {};

        // render main HTML template and translate content
        this.html.render( this.html.main( this, events ), this.element );
        this.lang && this.lang.translate();

        // render PDF Viewer
        const viewer_element = this.element.querySelector( '#viewer' );
        !viewer_element.innerHTML && $.setContent( viewer_element, this.pdf_viewer.root );

        // rendering of inner apps can be skipped
        if ( skip ) return;

        /**
         * slide element
         * @type {Element}
         */
        const slide_element = this.pdf_viewer.element.querySelector( '#page' );

        // render slide
        const content = await $.appDependency( slide_data.content ) || slide_data.content;
        switch ( typeof content ) {
          case 'number':
            $.setContent( slide_element, '<canvas>' );
            await this.pdf_viewer.goTo( content );
            delete slide_data._content;
            break;
          case 'string':
            const ends_with = content.split( '.' ).pop();
            switch ( ends_with ) {
              case 'apng':
              case 'gif':
              case 'jpg':
              case 'jpeg':
              case 'jfif':
              case 'pjpeg':
              case 'pjp':
              case 'png':
              case 'svg':
                if ( !slide_data._content ) slide_data._content = $.html( this.html.image, content );
                break;
              case 'mp4':
              case 'ogg':
              case 'webm':
                if ( !slide_data._content ) slide_data._content = $.html( this.html.video, content );
                break;
              default:
                if ( content.includes( 'youtu' ) ) {
                  if ( !slide_data._content ) {
                    const video = content.split( '/' ).pop().split( '?v=' ).pop().split( '&' ).shift();
                    const app = await this.youtube.start( { video: video, dark: this.dark } );
                    slide_data._content = app.root;
                  }
                }
                else {
                  $.setContent( slide_element, content );
                  delete slide_data._content;
                }
            }
            break;
          default:
            if ( $.isDependency( content ) ) {
              if ( !slide_data._content )
                slide_data._content = ( await $.solveDependency( content ) ).root;
            }
            else {
              $.setContent( slide_element, content );
              delete slide_data._content;
            }
        }
        slide_data._content && $.setContent( slide_element, slide_data._content );

        // update controls of PDF viewer
        const update = ( selector, condition ) => this.pdf_viewer.element.querySelector( selector )[ ( condition ? 'set' : 'remove' ) + 'Attribute' ]( 'disabled', true );
        update( '#first > *', this.slide_nr <= 1 );
        update( '#prev > *', this.slide_nr <= 1 );
        this.pdf_viewer.element.querySelector( '#jump input' ).setAttribute( 'placeholder', this.slide_nr + ' / ' + this.ignore.slides.length );
        update( '#next > *', this.slide_nr >= this.ignore.slides.length );
        update( '#last > *', this.slide_nr >= this.ignore.slides.length );

        // render description
        const description_element = this.element.querySelector( '#description' );
        if ( slide_data.description && !slide_data._description ) {
          const description = await $.appDependency( slide_data.description ) || slide_data.description;
          if ( $.isDependency( description ) ) {
            slide_data._description = ( await $.solveDependency( description ) ).root;
          }
          else if ( typeof slide_data.description !== 'string' ) {
            $.setContent( slide_element, slide_data.description );
            delete slide_data._description;
          }
          else
            $.setContent( description_element, $.html( '<article>%%</article>', slide_data.description ) );
        }
        slide_data._description && $.setContent( description_element, slide_data._description );

        // render comments
        if ( this.comment && slide_data.commentary !== false ) {
          if ( !slide_data.comments )
            slide_data.comments = await this.comment.start( {
              dark: this.dark,
              'data.key': this.comment.config.data.key + '-' + slide_data.key
            } );
          $.setContent( this.element.querySelector( '#comments' ), slide_data.comments.root );
        }

      };

      /**
       * contains all event handlers
       * @type {Object.<string,Function>}
       */
      const events = {

        /** when the button to display the description of a slide is clicked */
        onDescription: () => {
          const slide_data = this.ignore.slides[ this.slide_nr - 1 ];
          if ( !slide_data.description ) return;
          switch ( this.open ) {
            case '': this.open = 'description'; break;
            case 'description': this.open = ''; break;
            case 'comments': this.open = 'both'; break;
            case 'both': this.open = 'comments'; break;
          }
          render( true );
        },

        /** when the button to display the comments of a slide is clicked */
        onComments: () => {
          const slide_data = this.ignore.slides[ this.slide_nr - 1 ];
          if ( !this.comment || slide_data.commentary === false ) return;
          switch ( this.open ) {
            case '': this.open = 'comments'; break;
            case 'description': this.open = 'both'; break;
            case 'comments': this.open = ''; break;
            case 'both': this.open = 'description'; break;
          }
          render( true );
        }

      };

    }
  };
  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();