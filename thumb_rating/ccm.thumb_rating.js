/**
 * @overview  <i>ccm</i> component for rating
 * @author Tea Kless <tea.kless@web.de> 2017
 * @license The MIT License (MIT)
 */

( function () {

  var ccm_version = '8.0.0';
  var ccm_url     = '../libs/ccm.js';

  var component_name = 'thumb_rating';
  var component_obj  = {

    /*-------------------------------------------- public component members --------------------------------------------*/

    /**
     * @summary component index
     * @type {ccm.types.index}
     */
    index: component_name,

    /**
     * @summary default instance configuration
     * @type {ccm.components.rating.types.config}
     */
    config: {
      user:  [ 'ccm.instance', 'https://akless.github.io/ccm-components/user/ccm.user.min.js'],
      data:  {
        store: [ 'ccm.store', '../thumb_rating/datastore.json' ],
        key: 'demo'
      },
      style: [ 'ccm.load', '../thumb_rating/style.css' ],
      icons: [ 'ccm.load', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css' ]
    },

    /*-------------------------------------------- public component classes --------------------------------------------*/

    /**
     * @summary constructor for creating <i>ccm</i> instances out of this component
     * @class
     */
    Instance: function () {

      /*------------------------------------- private and public instance members --------------------------------------*/

      /**
       * @summary own context
       * @private
       */
      var self = this;

      /**
       * @summary contains privatized config members
       * @type {ccm.components.rating.types.config}
       * @private
       */
      var my;

      /*------------------------------------------- public instance methods --------------------------------------------*/

      /**
       * @summary initialize <i>ccm</i> instance
       * @description
       * Called one-time when this <i>ccm</i> instance is created, all dependencies are solved and before dependent <i>ccm</i> components, instances and datastores are initialized.
       * This method will be removed by <i>ccm</i> after the one-time call.
       * @param {function} callback - callback when this instance is initialized
       */
      this.init = function ( callback ) {

        // listen to change event of ccm realtime datastore => (re)render own content
        self.data.store.onChange = function () { self.start(); };

        // perform callback
        callback();

      };

      /**
       * @summary when <i>ccm</i> instance is ready
       * @description
       * Called one-time when this <i>ccm</i> instance and dependent <i>ccm</i> components, instances and datastores are initialized and ready.
       * This method will be removed by <i>ccm</i> after the one-time call.
       * @param {function} callback - callback when this instance is ready
       * @ignore
       */
      this.ready = function ( callback ) {

        // privatize security relevant config members
        my = self.ccm.helper.privatize( self );

        // listen to login/logout event => (re)render own content
        if ( self.user ) self.user.addObserver( function () { self.start(); } );

        // perform callback
        callback();

      };

      /**
       * @summary render content in own website area
       * @param {function} [callback] - callback when content is rendered
       */
      this.start = function ( callback ) {
        document.head.appendChild( self.ccm.helper.html( {
          tag:   'style',
          inner: "@font-face { font-family: 'FontAwesome'; src: url('../libs/font-awesome/fonts/fontawesome-webfont.eot?v=4.7.0'); src: url('../libs/font-awesome/fonts/fontawesome-webfont.eot?#iefix&v=4.7.0') format('embedded-opentype'), url('../libs/font-awesome/fonts/fontawesome-webfont.woff2?v=4.7.0') format('woff2'), url('../libs/font-awesome/fonts/fontawesome-webfont.woff?v=4.7.0') format('woff'), url('../libs/font-awesome/fonts/fontawesome-webfont.ttf?v=4.7.0') format('truetype'), url('../libs/font-awesome/fonts/fontawesome-webfont.svg?v=4.7.0#fontawesomeregular') format('svg'); font-weight: normal; font-style: normal; }"
        } ) );

        // get dataset for rendering
        self.ccm.helper.dataset( my.data.store, my.data.key, function ( dataset ) {

          // render main html structure
          self.ccm.helper.setContent( self.element, self.ccm.helper.html( { class: 'rating' } ) );

          renderThumbs();

          // perform callback
          if ( callback ) callback();

          function renderThumbs() {

            // set default like and dislike property
            if ( !dataset.likes    ) dataset.likes    = {};
            if ( !dataset.dislikes ) dataset.dislikes = {};

            var rating = self.element.querySelector( '.rating' );

            rating.innerHTML =
              '<div class="likes fa fa-lg fa-thumbs-up">' +
              '<div>' + Object.keys( dataset.likes ).length + '</div>' +
              '</div>' +
              '<div class="dislikes fa fa-lg fa-thumbs-down">' +
              '<div>' + Object.keys( dataset.dislikes ).length + '</div>' +
              '</div>';

            // ccm instance for user authentication not exists? => abort
            if ( !self.user ) return;

            /**
             * website area for likes and dislikes
             * @type {{likes: ccm.types.element, dislikes: ccm.types.element}}
             */
            var div = {

              likes:    self.element.querySelector( '.likes' ),
              dislikes: self.element.querySelector( '.dislikes' )

            };

            // add class for user specific interactions
            rating.classList.add( 'user' );



            // user is logged in?
            if ( self.user.isLoggedIn() ) {

              /**
               * username
               * @type {string}
               */
              var user = self.user.data().key;

              // highlight button if already voted
              if ( dataset.likes   [ user ] ) div[ 'likes'    ].classList.add( 'selected' );

              if ( dataset.dislikes[ user ] ) div[ 'dislikes' ].classList.add( 'selected' );

            }

            // set click events for like and dislike buttons
            click( 'likes', 'dislikes' );
            click( 'dislikes', 'likes' );

            /**
             * set click event for like or dislike button
             * @param {string} index - button index ('likes' or 'dislikes')
             * @param {string} other - opposite of index value
             */
            function click( index, other ) {

                // set click event
                div[ index ].addEventListener( 'click',  function () {

                  // login user if not logged in
                  self.user.login( function () {
                    /**
                     * username
                     * @type {string}
                     */
                    var user = self.user.data().key;

                    // has already voted?
                    if ( dataset[ index ][ user ] ) {

                      // revert vote
                      delete dataset[ index ][ user ];

                    }
                    // not voted
                    else {

                      // proceed voting
                      dataset[ index ][ user ] = true;

                      // revert voting of opposite category
                      delete dataset[ other ][ user ];

                    }

                    // update dataset for rendering => (re)render own content
                    my.data.store.set( dataset, function () { self.start(); console.log(dataset); } );

                  } );

                } );
            }
          }

        } );

      };

    }
  };

  var namespace = window.ccm && ccm.components[ component_name ]; if ( namespace ) { if ( namespace.ccm_version ) ccm_version = namespace.ccm_version; if ( namespace.ccm_url ) ccm_url = namespace.ccm_url; }
  if ( !window.ccm || !ccm[ ccm_version ] ) { var tag = document.createElement( 'script' ); document.head.appendChild( tag ); tag.onload = register; tag.src = ccm_url; } else register();
  function register() { ccm[ ccm_version ].component( component_obj ); }
}() );