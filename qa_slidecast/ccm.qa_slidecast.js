"use strict";

/**
 * @overview ccmjs-based web component for slidecast with commentary
 * @author Tea Kless <tea.kless@web.de> 2020
 * @author André Kless <andre.kless@web.de> 2021-2022
 * @author Luca Ringhausen <luca.ringhausen@h-brs.de> 2022 (text-layer feature)
 * @license The MIT License (MIT)
 * @version latest (4.1.0)
 * @changes
 * version 4.1.0 (14.12.2022):
 * - uses ccm.pdf_viewer.js v8.1.0 as default (support of annotation layer)
 * version 4.0.0 (24.11.2022):
 * - Uses ccmjs v27.4.2 as default.
 * - Uses helper.mjs v8.4.1 as default.
 * - Uses ccm.pdf_viewer.js v8.0.0 as default.
 * - Dark mode not set by default.
 * - No logger support. Use the callbacks instead.
 * - Bugfix for switching between slide and video.
 * (for older version changes see ccm.qa_slidecast-3.0.1.js)
 */

( () => {
  const component = {
    name: 'qa_slidecast',
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.4.2.min.js',
    config: {
//    "comment": [ "ccm.component", "https://ccmjs.github.io/tkless-components/comment/versions/ccm.comment-7.2.0.min.js" ],
      "css": [ "ccm.load",
        "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/styles-v1.min.css",
        "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-icons.min.css",
        { "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-fonts.min.css", "context": "head" },
      ],
      "dark": false,
//    "description": true,
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.1.min.mjs" ],
      "html": [ "ccm.load", "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/templates-v1.min.mjs" ],
//    "ignore": { "slides": [] },
//    "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/versions/ccm.lang-1.1.0.min.js" ],
//    "onchange": ( { name, instance, before } ) => { console.log( name, instance.slide_nr, !!before ) },
//    "onready": event => console.log( event ),
//    "onstart": instance => { console.log( 'start', instance.slide_nr ) },
      "open": "both",
      "pdf_viewer": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/pdf_viewer/versions/ccm.pdf_viewer-8.1.0.min.js" ],
      "audio_player": [ "ccm.instance", "https://ccmjs.github.io/tkless-components/audio_player/versions/ccm.audio_player-1.0.0.min.js" ],
//    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-3.0.0.min.js" ],
      "slide_nr": 1,
      "ignore": {},
      "text": [ "ccm.load", "https://ccmjs.github.io/tkless-components/qa_slidecast/resources/resources-latest.min.mjs#text_en" ],
//    "youtube": [ "ccm.component", "https://ccmjs.github.io/akless-components/youtube/versions/ccm.youtube-2.1.1.js" ],
      "edit_mode": false,
//    "audio_recorder": ["ccm.instance", "https://ccmjs.github.io/tkless-components/audio_recorder/versions/ccm.audio_recorder-1.0.0.js"]
      "auto_play": true
    },
    Instance: function () {

      /**
       * shortcut to help functions
       * @type {Object.<string,Function>}
       */
      let $;

      /**
       * page element of PDF Viewer
       * @type {Element}
       */
      let page_element;

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
        this.pdf_viewer.onchange = event => {
          if ( event.before ) {
            if ( this.onchange && this.onchange( { name: event.name, instance: this, before: true } ) ) return;
            let slide;
            switch ( event.name ) {
              case 'jump':
              case 'goto':  slide = event.page;                break;
              case 'first': slide = 1;                         break;
              case 'prev':  slide = this.slide_nr - 1;         break;
              case 'next':  slide = this.slide_nr + 1;         break;
              case 'last':  slide = this.ignore.slides.length; break;
            }
            this.audio_recorder.resetRecorder();
            if ( !( slide >= 1 && slide <= this.ignore.slides.length && slide !== this.slide_nr ) ) return;
            this.slide_nr = slide;
            this.routing && this.routing.set( 'slide-' + slide );  // update route
            render(false, event.data?.autoPlay);
          }
          else {
            updateControls();
            event.page && this.onchange && this.onchange( { instance: this } );
          }
          return true;
        };

        this.audio_player.onplaybackfinished = event => {
          if(this.auto_play && !this.ignore.slides[this.slide_nr - 1].wait) this.pdf_viewer.events.onNext({autoPlay: true});
        };

        this.audio_player.onloadeddata = event => {
          if(event.autoPlay) this.audio_player.startPlayback();
        };

        if(this.edit_mode) {
          this.audio_recorder.onrecordingstarted = () => {
            this.pdf_viewer.disable();
          };

          this.audio_recorder.onrecordingcreated = (blob) => {
            this.ignore.slides[this.slide_nr - 1].newAudio = blob;
            this.audio_player.loadAudio(this.ignore.slides[this.slide_nr - 1].newAudio);
            this.pdf_viewer.enable();
            render(true);
          };
        }

        // define routes and log 'ready' event
        this.routing && this.routing.define( { slide: number => { this.slide_nr = number; render(); } } );

        // setup dark mode
        this.dark === 'auto' && this.element.classList.add( 'dark_auto' );
        this.dark === true && this.element.classList.add( 'dark_mode' );

        // trigger 'onready' callback
        this.onready && await this.onready( { instance: this } );

      };

      /**
       * starts the app
       * @returns {Promise<void>}
       */
      this.start = async () => {

        // load PDF without render to get total number of pages
        delete this.pdf_viewer.page; await this.pdf_viewer.start();

        // remember page element of PDF Viewer
        page_element = this.pdf_viewer.element.querySelector( '#page' );

        // set default slides data
        if ( !this.ignore.slides ) {
          this.ignore.slides = [];
          for ( let page = 1; page <= this.pdf_viewer.getPages(); page++ )
            this.ignore.slides.push( { key: page, content: page } );
        }

        //load audio_player
        await this.audio_player.start({ dark: this.dark });

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

        //initialize editMode
        if(this.edit_mode){
          await this.audio_recorder.start( { dark: this.dark } );
        }

        // trigger 'onstart' callback
        this.onstart && await this.onstart( { instance: this } );

      };

      /**
       * returns app state data
       * @returns {Object}
       */
      this.getValue = () => { return { slide_nr: this.slide_nr, slides: $.clone( this.ignore.slides ) } };

      this.enableAutoPlay = () => {
        this.auto_play = true;
      };

      this.disableAutoPlay = () => {
        this.auto_play = false;
      };

      /**
       * renders/updates content
       * @param {boolean} [skip] - skip rendering of inner apps
       * @param {boolean} [controlledByAutoPlay] - skip rendering of inner apps
       * @returns {Promise<void>}
       */
      const render = async (skip, controlledByAutoPlay = false) => {

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

        //render audio player
        const audio_player_element = this.element.querySelector( '#audio-player' );
        !audio_player_element.innerHTML && $.setContent( audio_player_element, this.audio_player.root );
        this.audio_player.loadAudio(slide_data.newAudio ?? slide_data.audio, false, controlledByAutoPlay);

        //render audio_recorder
        if(this.edit_mode){
          const audio_recorder_element = this.element.querySelector( '#audio-recorder' );
          !audio_recorder_element.innerHTML && $.setContent(audio_recorder_element, this.audio_recorder.root );
        }

        /**
         * <main> element of PDF Viewer
         * @type {Element}
         */
        const main_element = this.pdf_viewer.element.querySelector( 'main' );

        // render slide
        const content = await $.appDependency( slide_data.content ) || slide_data.content;
        switch ( typeof content ) {
          case 'number':
            $.setContent( main_element, page_element );
            this.pdf_viewer.goTo( content );
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
                  $.setContent( main_element, content );
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
              $.setContent( main_element, content );
              delete slide_data._content;
            }
        }
        slide_data._content && $.setContent( main_element, slide_data._content );

        // update controls of PDF viewer
        typeof content !== 'number' && updateControls();

        // render description
        const description_element = this.element.querySelector( '#description' );
        if ( slide_data.description && !slide_data._description ) {
          const description = await $.appDependency( slide_data.description ) || slide_data.description;
          if ( $.isDependency( description ) ) {
            slide_data._description = ( await $.solveDependency( description ) ).root;
          }
          else if ( typeof slide_data.description !== 'string' ) {
            $.setContent( main_element, slide_data.description );
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

        // trigger 'onchange' callback
        typeof content !== 'number' && this.onchange && this.onchange( { instance: this } );

      };

      /** updates controls of PDF viewer */
      const updateControls = () => {
        const update = ( selector, condition ) => this.pdf_viewer.element.querySelector( selector )[ ( condition ? 'set' : 'remove' ) + 'Attribute' ]( 'disabled', true );
        update( '#first > *', this.slide_nr <= 1 );
        update( '#prev > *', this.slide_nr <= 1 );
        this.pdf_viewer.element.querySelector( '#jump input' ).setAttribute( 'placeholder', this.slide_nr + ' / ' + this.ignore.slides.length );
        update( '#next > *', this.slide_nr >= this.ignore.slides.length );
        update( '#last > *', this.slide_nr >= this.ignore.slides.length );
      }

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
        },

        onRevertRecording: () => {
          this.audio_recorder.resetRecorder();
          this.ignore.slides[this.slide_nr - 1].newAudio = undefined;
          render();
        },

        onDeleteRecording: () => {
          this.ignore.slides[ this.slide_nr - 1 ].audio = '';
          events.onRevertRecording();
        },

        onEnableAutoPlay: () => {
          this.enableAutoPlay();
          render(true);
        },

        onDisableAutoPlay: () => {
          this.disableAutoPlay();
          render(true);
        }

      };

    }
  };
  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();