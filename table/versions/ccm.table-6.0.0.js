/**
 * @overview ccm component for table generating
 * @author Tea Kless <tea.kless@web.de>, 2018-2022
 * @license The MIT License (MIT)
 * @changes
 *  @version 6.0.0
 * -(30.11.2022)
 *   updated on newest ccm version ccm v27.4.2
 *  @version 5.2.0
 * -(31.05.2022)
 *   onchnage event returns event object
 *  @version 5.1.0
 * -(10.03.2022)
 *   possibility to set default values over col settings
 *   as cell inner text and not as a value of a disabled input field
 *   updated on newest ccm version ccm v27.3.1
 *  @version 5.0.0
 * -(14.02.2022)
 *   updated on newest ccm version ccm v27.2.0
 *  @version 4.0.0
 * -(21.05.2019)
 *   onrender event for table cells
 *   self.data(ccm v20.7.0) instead of my.data
 * @version 3.0.0
 *  (29.04.2019) onclick event for table cells
 *  @version 2.2.0
 *  (29.04.2019) contains changes from vimp
 * @version 2.1.0
 *  selectable input field
 *  uses ccm v20.0.0
 */

( function () {

  const self = {

    /**
     * unique self name
     * @type {string}
     */
    name: 'table',
    version: [ 6,0,0 ],

    /**
     * recommended used framework version
     * @type {string}
     */
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.4.2.min.js',

    /**
     * default instance configuration
     * @type {object}
     */
    config: {
      templates: [ "ccm.load", "https://ccmjs.github.io/tkless-components/table/resources/templates.html" ],
      html: {
        "table": {
          "inner": {
            "tag": "form",
            "onsubmit": "%submit%",
            "inner": {
              "id": "container",
              "inner": [
                {
                  "class": "table-responsive",
                  "inner": {
                    "tag": "table",
                    "class": "table table-striped",
                    "inner":[
                      { "tag": "thead" },
                      { "tag": "tbody" }
                    ]
                  }
                },
                {
                  "id": "buttons",
                  "class":"d-flex justify-content-between"
                }
              ]
            }
          }
        },
        "table_row": { "tag": "tr" },
        "table_cell": { "tag": "td" },
        "table_head": { "tag": "th" },
        "input": {
          "tag": "input",
          "type": "text",
          "onchange": "%change%"
        },
        "textarea": {
          "tag": "textarea",
          "onchange": "%change%"
        },
        "select": {
          "tag": "select",
          "onchange": "%change%",
          "inner": []
        },
        "add": {
          "class": "btn btn-outline-success",
          "typ": "button",
          "onclick": "%add%",
          "inner": [
            {
              "tag": "span",
              "inner": "&#43; Row"
            }
          ]
        },
        "submit": {
          "tag": "button",
          "class": "btn btn-primary pull-right",
          "typ": "submit",
          "inner": "Submit"
        }
      },
      //add_row: true,
      //table_col: 3,
      //table_head: [ "header-1", "header-2", "header-3" ],
      //col_settings: [
      //  { "type": "number", "placeholder": "Tel: 049..." },
      //  { "disabled": "true", "inner": "max.musterman@mail.com" },
      //  { "type": "date", "foo": "bar" }
      //],
      //data: [ "ccm.get", "resources/configs.js", "demo" ],
      //submit: true,
      //onfinish
      //onchange
      //cell_onrender: function ( event ) { console.log( this, event ); }
      //cell_onclick: function ( target, value, self  ){ console.log( target, value, self ); },
      //filter_values
      css: [ "ccm.load", "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css",
        "https://ccmjs.github.io/tkless-components/table/resources/default.css"
      ],
      helper: [ "ccm.load", { "url": "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.2.mjs" } ]
    },

    Instance: function () {
      const self = this;
      /**
       * shortcut to help functions
       * @type {Object.<string,function>}
       */
      let $, data, table, row, col = 0;

      this.ready = async () => {
        // set shortcut to help functions
        $ = self.ccm.helper;

        // set shortcut to help functions
        $ = Object.assign( {}, this.ccm.helper, this.helper ); $.use( this.ccm );

        // logging of 'ready' event
        this.logger && this.logger.log( 'ready', $.privatize( this, true ) );
      };

      /**
       * starts the instance
       * @param {function} [callback] - called after all synchronous and asynchronous operations are complete
       */
      this.start = async () => {

        data  = await $.dataset( self.data );
        // support different forms of data structure
        uniformData();

        if ( !generateTable() )
          $.setContent( self.element, "Nothing to display" );
        else {
          $.setContent( self.element, generateTable() );

          self.col_settings && $.fillForm( self.element, dataToFormdataInput(), self.ccm );

          renderAddRowButton(); // add new row via button
          renderSubmitButton(); // submit button
          filterValues();
        }

      };

      const renderSubmitButton = () => {
        self.submit && self.col_settings && table.querySelector( '#buttons' ).appendChild( $.html ( self.html.submit ) );
      };

      const renderAddRowButton = () => {
        if ( self.add_row && self.col_settings )
          $.setContent( table.querySelector( '#buttons' ), (
            $.html( self.html.add, {
                add: () => addTableRow( row++, col )
              }
            ) ) );
      };

      const generateTable = () => {

        if ( !self.col_settings && !data ) return;

        table = $.html ( self.html.table, {
          submit: event => {
            event && event.preventDefault();
            event.stopPropagation();
            $.onFinish( self );
            return false; // prevent page reload
          }
        } );
        self.table_head && $.setContent( table.querySelector( 'thead' ), addTableHead() );

        if ( !self.table_col ) {
          if ( Array.isArray( $.deepValue( data, 'values.0' ) ) )
            self.table_col = data.values[ 0 ].length;
          else if ( !data.values )
            self.table_head ? self.table_col = self.table_head.length : self.table_col = self.col_settings.length;
        }

        row = data.values ? data.values.length: 1;

        for ( let i = 0 ; i < row; i++ )
          addTableRow( i, col, data.values );


        return table;
      };

      const addTableHead = () => {
        const table_row = $.html(self.html.table_row);

        for ( let j = 0 ; j < self.table_col; j++ ) {
          const table_head = $.html( self.html.table_head );
          $.setContent( table_head, self.table_head[ j ] );
          table_row.appendChild( table_head );
        }

        return table_row;
      };

      const addTableRow = ( i, j, values ) => {
        const table_row = $.html ( self.html.table_row );

        if ( self.table_col ) {
          for ( let j = 0 ; j < self.table_col; j++ ) {
            col = j;
            const table_cell = $.html ( self.html.table_cell );

            if ( !self.col_settings && values )
              $.setContent( table_cell, i < values.length && values[ i ][ j ] !== undefined ? values[ i ][ j ] : '' );
            else {
              let input;
              if ( self.col_settings && self.col_settings[ j ] ) {
                switch ( self.col_settings[ j ].type ) {
                  case 'textarea':
                    input = $.clone( self.html[ 'textarea' ] );
                    break;
                  case 'select':
                    input = $.clone( self.html[ 'select' ] );
                    break;
                  case 'none':
                    input = undefined;
                    values && $.setContent( table_cell, i < values.length && values[ i ][ j ] !== undefined ? values[ i ][ j ] : '' );
                    break;
                  default:
                    input = $.clone( self.html[ 'input' ] );
                    break;
                }
              }
              //const input = $.clone( my.html[ my.col_settings && my.col_settings[ j ] && my.col_settings[ j ].type === 'textarea' ? 'textarea' : 'input' ] );
              if ( input !== undefined ) {
                input.name = ( i + 1 ) + '-' + ( j + 1 );

                // consider column properties
                self.col_settings && considerColSettings( j, input );

                table_cell.appendChild( $.html( input, {
                  // onchange event for input fields
                  change: ( event ) => {
                    const target = event.target;
                    self.onchange && self.onchange( { instance: self, target: target } );
                  }
                } ) );
              }

            }

            // set click event of table cells only if no coll_settings was set
            if ( self.cell_onclick && !self.col_settings ) {
              table_cell.onclick = () => self.cell_onclick( table_cell, table_cell.innerHTML, self );
              table_cell.style.cursor = 'pointer';
            }

            // set onrender event of table cells only if no coll_settings was set
            self.cell_onrender && !my.col_settings && self.cell_onrender.call( self, { data: data, i: i, j:j, cell: table_cell } );

            table_row.appendChild( table_cell );

          }
        }
        table.querySelector( 'tbody' ).appendChild( table_row );
      };

      const considerColSettings = ( col, input ) => {
        // set input tag property for each input => each input tag of one column has same properties
        for ( const key in self.col_settings[ col ] ) {
          switch ( key ) {
            case 'type':
              if ( self.col_settings[ col ][ key ] !== 'textarea' )
                input.type = self.col_settings[ col ][ key ];
              break;
            case 'placeholder':
              input.placeholder = self.col_settings[ col ][ key ];
              break;
            case 'options':
              const option = self.col_settings[ col ][ key ];
              for ( let i=0; i<option.length; i++ ){
                input.inner.push( { "tag": "option", "inner": option[ i ] } );
              }
              break;
            default:
              input[ key ] =  self.col_settings[ col ][ key ];
              break;
          }
        }
      }

      const filterValues = () => {
        if ( self.filter_values && !self.col_settings ) {
          const search_elem = $.html( self.templates.search, {
            search: () => {
              let input, filter, table, tr;
              input = self.element.querySelector( '#search-input' );
              filter = input.value.toUpperCase();
              table = self.element.querySelector( 'tbody' );
              tr = table.querySelectorAll( 'tr' );
              for ( let i = 0; i < tr.length; i++ ) {
                let filtered = false;
                let tds = tr[i].querySelectorAll("td");
                for( let t = 0; t < tds.length; t++ ) {
                  let td = tds[t];
                  if ( td ) {
                    if ( td.innerHTML.toUpperCase().indexOf(filter) > -1 ) {
                      filtered = true;
                    }
                  }
                }
                if( filtered === true ) {
                  tr[i].style.display = '';
                }
                else {
                  tr[i].style.display = 'none';
                }
              }
            }
          } );
          $.prepend( self.element, search_elem );
        }

      };

      const dataToFormdataInput = () => {
        if ( !data || !Array.isArray( data.values ) || data.values.length === 0 ) return;

        const start_values = {};
        for ( let i = 0; i < data.values.length; i++ ){
          for ( let j = 0; j < data.values[ i ].length; j++ ) {
            let key = ( i + 1 )+"-"+ ( j + 1);
            start_values[ key ] = data.values[ i ][ j ];
          }
        }
        return start_values;
      };

      /** brings given data to uniform data structure - @author André Kless <andre.kless@web.de>, 2018 */
      const uniformData =  () => {
        if ( !data ) return;
        if ( Array.isArray( data ) )
          data = { values: data };
        if ( Array.isArray( data.values ) && data.values.length > 0 && $.isObject( data.values[ 0 ] ) ) {
          const values = [];
          data.values.map( obj => {
            const row = [];
            for ( const key in obj )
              if ( typeof obj[ key ] !== 'object' )
                row.push( obj[ key ] );
            values.push( row );
          } );
          data.values = values;
        }
      };

      /** reads the table values and transform it to result data */
      const prepareFormData = () => {

        let form_data = $.formData( self.element.querySelector( 'table' ) );

        const result = [];

        for ( const key in form_data ) {
          const coord = key.split( '-' );
          const row = coord[ 0 ] - 1;
          const col = coord[ 1 ] - 1;
          if ( !result[ row ] ) result[ row ] = [];
          result[ row ][ col ] = form_data[ key ];
        }

        return { values: result };
      }

      this.getValue = () => {
        return prepareFormData();
      };

    }

  };

  let b="ccm."+self.name+(self.version?"-"+self.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=self;(b=window.ccm&&window.ccm.components[self.name])&&b.ccm&&(self.ccm=b.ccm);"string"===typeof self.ccm&&(self.ccm={url:self.ccm});let c=(self.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(self);else{var a=document.createElement("script");document.head.appendChild(a);self.ccm.integrity&&a.setAttribute("integrity",self.ccm.integrity);self.ccm.crossorigin&&a.setAttribute("crossorigin",self.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(self);document.head.removeChild(a)};a.src=self.ccm.url}
} )();
