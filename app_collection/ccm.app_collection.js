/**
 * @overview ccmjs-based web component for an app collection
 * @author Tea Kless <tea.kless@web.de> 2020
 * @author André Kless <andre.kless@web.de> 2022
 * @license The MIT License (MIT)
 * @version latest (2.5.1)
 * @changes
 * version 2.5.1 (30.11.2022):
 * - uses ccmjs v27.4.2 as default
 * - uses helper.mjs v8.4.2 as default
 * version 2.5.0 (26.09.2022):
 * - an entry in the app collection can lead to an external URL
 * - an entry in the app collection can initiate writing to an email address
 * - disabled dark mode as default
 * version 2.4.0 (07.03.2022):
 * - individual section color
 * version 2.3.0 (25.02.2022):
 * - uses ccmjs v27.3.1 as default
 * - uses helper.mjs v8.1.0 as default
 * - apps in the app collection can also be given by app url or embed code
 * version 2.2.0 (11.02.2022): controllable dark mode
 * version 2.1.0 (08.02.2022): content of clicked entry can contain multiple apps
 * version 2.0.0 (24.01.2022): reimplementation by akless
 */

( () => {
  const component = {
    name: 'app_collection',
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.4.2.min.js',
    config: {
//    "color": "limegreen",
      "css": [ "ccm.load", "https://ccmjs.github.io/tkless-components/app_collection/resources/styles.min.css" ],
//    "dark": "auto",
      "footer": [],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.2.min.mjs" ],
      "html": [ "ccm.load", "https://ccmjs.github.io/tkless-components/app_collection/resources/templates.mjs" ],
//    "icon": [ "ccm.load", "https://ccmjs.github.io/tkless-components/app_collection/resources/app.svg" ],
//    "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/versions/ccm.lang-1.1.0.min.js" ],
//    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-5.0.1.min.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.min.js", "greedy" ] ],
//    "routing": [ "ccm.instance", "https://ccmjs.github.io/akless-components/routing/versions/ccm.routing-3.0.0.min.js" ],
      "sections": [],
//    "title": "",
//    "user": [ "ccm.start", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.7.2.min.js" ]
    },
    Instance: function () {

      /**
       * shortcut to help functions
       * @type {Object.<string,Function>}
       */
      let $;

      /**
       * when all dependencies are solved after creation and before the app starts
       * @returns {Promise<void>}
       */
      this.ready = async () => {

        // set shortcut to help functions
        $ = Object.assign( {}, this.ccm.helper, this.helper ); $.use( this.ccm );

        // define routes
        this.routing && this.routing.define( { home: ( i, j ) => render( parseInt( i ), parseInt( j ) ) } );

        // setup dark mode
        this.dark === 'auto' && this.element.classList.add( 'dark_auto' );
        this.dark === true && this.element.classList.add( 'dark_mode' );

        // set individual section color
        this.color && this.element.style.setProperty( '--section-bg', this.color );

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );

      };

      /**
       * starts the app
       * @returns {Promise<void>}
       */
      this.start = async () => {

        // logging of 'start' event
        this.logger && this.logger.log( 'start' );

        // render main HTML template
        this.html.render( this.html.main( this, onClick ), this.element );

        // render content
        if ( this.routing && this.routing.get() )
          await this.routing.refresh();
        else
          await render();

        // translate content and render language selection
        if ( this.lang ) {
          this.lang.translate();
          !this.lang.getContext() && $.append( this.element.querySelector( 'header > div:last-child' ), this.lang.root );
        }

        // render user login/logout button
        this.user && $.append( this.element.querySelector( 'header > div:last-child' ), this.user.root );

      };

      /**
       * when an entry is clicked
       * @param {number} [i] - number of clicked footer entry or section (1,..,n)
       * @param {number} [j] - number of clicked entry in the section (1,..,m)
       * @returns {Promise<void>}
       */
      const onClick = async ( i, j ) => {
        const entry = i && ( !j ? this.footer[ i - 1 ] : this.sections[ i - 1 ].entries[ j - 1 ] );
        if ( entry && !entry.ignore ) return;
        if ( entry && typeof entry.ignore === 'string' && entry.ignore.startsWith( 'http' ) && !( await $.appDependency( entry.ignore ) ) )
          window.open( entry.ignore );
        else if ( entry && typeof entry.ignore === 'string' && entry.ignore.startsWith( 'mailto' ) )
          window.location.href = entry.ignore;
        else {
          this.routing && this.routing.set( 'home' + ( i ? '-' + i + ( j ? '-' + j : '' ) : '' ) );
          await render( i, j );
        }
      };

      /**
       * renders home or content of a clicked entry
       * @param {number} [i] - number of clicked footer entry or section (1,..,n)
       * @param {number} [j] - number of clicked entry in the section (1,..,m)
       * @returns {Promise<void>}
       */
      const render = async ( i, j ) => {
        let element = this.element.querySelector( 'main' );
        $.setContent( element, $.loading() );
        this.html.render( this.html.headline( this.title, i && ( this[ j ? 'sections' : 'footer' ][ i - 1 ].title ), j && this.sections[ i - 1 ].entries[ j - 1 ].title ), this.element.querySelector( '#headline' ) );

        // render home
        if ( !i ) {
          $.replace( element, element = element.cloneNode() );            // resets lit-html template
          this.html.render( this.html.home( this, onClick ), element );
        }
        // render content of clicked entry
        else {
          const entry = !j ? this.footer[ i - 1 ] : this.sections[ i - 1 ].entries[ j - 1 ];
          if ( !Array.isArray( entry.ignore ) || $.isDependency( entry.ignore ) ) entry.ignore = [ entry.ignore ];
          entry.ignore = await Promise.all( entry.ignore.map( app => $.isInstance( app ) ? app : $.appDependency( app ).then( app => $.solveDependency( app, this ) ) ) );
          element.innerHTML = '';
          entry.ignore.forEach( content => $.append( element, $.isInstance( content ) ? content.root : $.html( content ) ) );
        }

      };

    }
  };
  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
