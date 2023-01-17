"use strict";

/**
 * @overview <i>ccmjs</i>-based web component for a table.
 * @author Tea Kless <tea.kless@web.de>, 2018-2022
 * @author André Kless <andre.kless@h-brs.de>, 2022
 * @license The MIT License (MIT)
 * @version 7.0.0
 * @changes
 * version 7.0.0 (14.12.2022)
 * - reimplementation by akless
 * (for older version changes see ccm.table-6.0.0.js)
 */

( () => {

  /**
   * <i>ccmjs</i>-based web component for a table.
   * @namespace WebComponent
   * @type {object}
   * @property {string} name - Unique identifier of the component.
   * @property {number[]} [version] - Version of the component according to Semantic Versioning 2.0 (default: latest version).
   * @property {string} ccm - URL of the (interchangeable) ccmjs version used at the time of publication.
   * @property {app_config} config - Default app configuration.
   * @property {Class} Instance - Class from which app instances are created.
   */
  const component = {
    name: 'table',
    version: [ 7, 0, 0 ],
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.4.2.min.js',
    config: {
      // "addable": true,
      "css": [ "ccm.load",
        "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap.min.css",
        "https://ccmjs.github.io/tkless-components/table/resources/styles-v1.min.css"
      ],
      "col_heads": [ "header-1", "header-2", "header-3" ],
      "col_settings": [
        { "type": "text", "placeholder": "Type in here..." },
        { "type": "number", "placeholder": "Your Rating...", "min": 1, "max": 5 },
        { "type": "checkbox", "disabled": true }
      ],
      "data": { "values": [ [ "A", 1, false ], [ "B", 2, true ] ] },
      // "deletable": true,
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.2.min.mjs" ],
      "html": [ "ccm.load", "https://ccmjs.github.io/tkless-components/table/resources/templates-v1.min.mjs" ],
      // "movable": true,
      // "onchange": event => console.log( event ),
      // "onclick":  event => console.log( event ),
      "onfinish": { "log": true },
      // "onready":  event => console.log( event ),
      // "onrender": event => {
      //   if ( event.before ) {
      //     const values = event.instance.getValue().values;
      //     values[ 0 ][ 0 ] += '!';
      //     return values;
      //   }
      //   console.log( event )
      // },
      // "onstart":  event => console.log( event ),
      "text": [ "ccm.load", "https://ccmjs.github.io/tkless-components/table/resources/resources-v1.min.mjs#en" ]
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
       * App state data (table values)
       * @private
       * @type {app_state}
       */
      let data;

      /**
       * When the instance is created, when all dependencies have been resolved and before the dependent sub-instances are initialized and ready. Allows dynamic post-configuration of the instance.
       * @async
       * @readonly
       * @function
       */
      this.init = async () => {

        // Merge all helper functions and offer them via a single variable.
        $ = Object.assign( {}, this.ccm.helper, this.helper ); $.use( this.ccm );

      };

      /**
       * When the instance is created and after all dependent sub-instances are initialized and ready.
       * Allows the first official actions of the instance that should only happen once.
       * @async
       * @readonly
       * @function
       */
      this.ready = async () => {

        // Trigger 'ready' event.
        this.onready && await this.onready( { instance: this } );

      };

      /**
       * Starts the app. The current app state is visualized in the webpage area.
       * @async
       * @readonly
       * @function
       */
      this.start = async () => {

        // Load app state data from source.
        data = await $.dataset( this.data );

        // Set default app state data.
        if ( !data.values ) data.values = [];

        // Update webpage area.
        render();

        // Trigger 'start' event.
        this.onstart && await this.onstart( { instance: this } );

      };

      /**
       * Returns the current app state.
       * @readonly
       * @function
       * @returns {app_state} A deep copy of the app state data.
       */
      this.getValue = () => $.clone( data );

      /**
       * Contains all event handlers.
       * @namespace AppEvents
       * @readonly
       * @type {Object.<string,function>}
       */
      this.events = {

        /**
         * When the button to add a table row is clicked.
         * @function
         * @memberOf AppEvents
         */
        onAddRow: () => {
          if ( !this.addable ) return;
          data.values.push( Array( this.col_settings.length ).fill( '' ) );
          render();
          this.onchange && this.onchange( { instance: this, name: 'create' } );
        },

        /**
         * When a table value has changed.
         * @function
         * @param {Event} e - Event object
         * @memberOf AppEvents
         */
        onChange: e => {
          const [ row, col ] = e.target.name.split( '-' );
          data.values[ row-1 ][ col-1 ] = e.target.value;
          render();
          this.onchange && this.onchange( { instance: this, name: 'update', row: row-1, col: col-1, value: e.target.value } );
        },

        /**
         * When a table cell is clicked.
         * @function
         * @param {number} row - Table row index
         * @param {number} col - Table column index
         * @memberOf AppEvents
         */
        onClick: ( row, col ) => this.onclick && this.onclick( { instance: this, row, col } ),

        /**
         * When the button to delete a table row is clicked.
         * @function
         * @param {number} i - Row index
         * @memberOf AppEvents
         */
        onDeleteRow: i => {
          if ( !this.deletable ) return;
          data.values.splice( i, 1 );
          render();
          this.onchange && this.onchange( { instance: this, name: 'delete', row: i } );
        },

        /**
         * When the button is clicked to move a table row down one.
         * @function
         * @param {number} i - Row index
         * @memberOf AppEvents
         */
        onMoveDown: i => {
          if ( !this.movable ) return;
          [ data.values[ i ], data.values[ i+1 ] ] = [ data.values[ i+1 ], data.values[ i ] ];
          render();
          this.onchange && this.onchange( { instance: this, name: 'move', row: i, dir: false } );
        },

        /**
         * When the button is clicked to move a table row up one.
         * @function
         * @param {number} i - Row index
         * @memberOf AppEvents
         */
        onMoveUp: i => {
          if ( !this.movable ) return;
          [ data.values[ i-1 ], data.values[ i ] ] = [ data.values[ i ], data.values[ i-1 ] ];
          render();
          this.onchange && this.onchange( { instance: this, name: 'move', row: i, dir: true } );
        },

        /**
         * When the button to submit the table values is clicked.
         * @function
         * @param {Event} e - Event object
         * @memberOf AppEvents
         */
        onSubmit: e => {
          e.preventDefault();
          $.onFinish( this );
        }

      };

      /**
       * Updates the webpage area with the current app state data.
       * @private
       * @function
       */
      const render = () => {
        const values = this.onrender && this.onrender( { instance: this, before: true } ) || $.clone( data.values );
        this.html.render( this.html.main( this, values ), this.element );
        const col_settings = $.clone( this.col_settings );
        this.element.querySelectorAll( '[name]' ).forEach( input => {
          const [ _, col ] = input.name.split( '-' );
          const col_setting = col_settings[ Number.parseInt( col ) - 1 ];
          delete col_setting.type; delete col_setting.options;
          Object.keys( col_setting ).forEach( key => input.setAttribute( key, col_setting[ key ] ) );
        } );
        this.onrender && this.onrender( { instance: this } );
      };

    }
  };
  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();

/**
 * App configuration.
 * @typedef {object} app_config
 * @prop {boolean} addable - Indicates whether rows can be added.
 * @prop {array} css - CSS dependencies
 * @prop {string[]} col_heads - Labels for the table columns
 * @prop {object[]} col_settings - Settings for the table columns
 * @prop {object} [data] - Source of app state data (contains the table values).
 * @prop {boolean} deletable - Indicates whether rows can be deleted.
 * @prop {array} helper - Dependency on helper functions
 * @prop {array} html - HTML template dependencies
 * @prop {boolean} movable - Indicates whether rows can be moved.
 * @prop {function} [onchange] - When a table value changes or when a row is moved, added or removed.
 * @prop {function} [onclick] - When a table cell is clicked.
 * @prop {function|object} [onfinish] - When the finish button is clicked. Sets the finish actions.
 * @prop {function} [onready] - Is called once before the first start of the app.
 * @prop {function} [onrender] - Before and after the table is rendered. The table values can be adjusted before they are displayed.
 * @prop {function} [onstart] - When the app has finished starting.
 * @prop {Object.<string,string>} text - Button labels
 */

/**
 * App state data.
 * @typedef {object} app_state
 * @prop {(string|number|boolean)[][]} values - Table values
 * @example
 * {
 *   "values": [ [ "A", 1, false ], [ "B", 2, true ] ]
 * }
 */
