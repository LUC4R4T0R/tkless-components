/**
 * @overview ccmjs-based web component for a fill in task
 * @author Tea Kless <tea.kless@web.de> 2022
 * @license The MIT License (MIT)
 *
 * @version 2.0.0
 * -added configurable oncheck property
 */

( () => {
  const component = {
    name: 'fill_in_task',
    version: [ 3,1,0 ],
    ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.4.2.min.js',

    config: {
//    content: [ "ccm.component", "https://ccmjs.github.io/tkless-components/table/versions/ccm.table-5.1.0.js" ],
//    check: true,
      css: [ "ccm.load", "https://ccmjs.github.io/tkless-components/fill_in_task/resources/default.css" ],
      helper: [ "ccm.load", { "url": "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.2.min.mjs" } ],
      html: {
        main: {
          "inner": [
            {
              "tag": "form",
              "onsubmit": "%onSubmit%",
              "inner": [
                {
                  "id": "app"
                },
                {
                  "id": "fill-in-task-buttons",
                  "inner": [
                    {
                      "id": "fill-in-task-progress-bar"
                    },
                    {
                      "tag": "input",
                      "type": "submit",
                      "value": "Check",
                      "class": "fill-in-task-btn",
                      "id": "fill-in-task-compare"
                    },
                    {
                      "tag": "button",
                      "type": "button",
                      "inner": "Retry",
                      "class": "fill-in-task-btn",
                      "id": "fill-in-task-retry",
                      "onclick": "%onRetry%"
                    },
                    {
                      "tag": "button",
                      "type": "button",
                      "inner": "Correction",
                      "class": "fill-in-task-btn",
                      "id": "fill-in-task-correction",
                      "onclick": "%onCorrection%"
                    },
                    {
                      "tag": "button",
                      "type": "button",
                      "inner": "Generate Chart",
                      "class": "fill-in-task-btn",
                      "id": "fill-in-task-onfinish",
                      "onclick": "%onFinish%"
                    },
                    {
                      "tag": "input",
                      "type": "submit",
                      "value": "Solution",
                      "class": "fill-in-task-btn",
                      "id": "fill-in-task-solution"
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
//    "logger": [ "ccm.instance", "https://ccmjs.github.io/akless-components/log/versions/ccm.log-5.0.1.min.js", [ "ccm.get", "https://ccmjs.github.io/akless-components/log/resources/configs.min.js", "greedy" ] ],
//    onstart: event => console.log( event ),
//    onfinish: function ( data ) { console.log( data );  },
//    onsolution: ( { inputs, instance } ) => { console.log( inputs ) },
      oncheck: ( { inputs, highlight,  instance } ) => {
        let correct = 0; const total = Object.keys( instance.solution ).length;
        for ( let key in inputs ) {
          let elem = instance.element.querySelector( '[name="'+ key +'"]' );
          if ( inputs[ key ] !== instance.solution[ key ] || inputs[ key ] === undefined ) {
            highlight ( elem, false );
          }
          else {
            highlight ( elem, true );
            correct++
          }
        }

        return { correct, total }
      },
//    retry: true,
      /*sample_solution: [ "ccm.instance", "https://ccmjs.github.io/tkless-components/table/versions/ccm.table-5.1.0.js", [
        "ccm.load", "https://ccmjs.github.io/tkless-components/table/resources/resources.mjs#demo"
      ] ],*/
//    show_solution: true,
      /*solution: {
        "1-4": "4",
        "1-5": "7,00",
        "2-4": "1",
        "2-5": "8,57",
        "3-4": "4",
        "3-5": "60,6"
      }*/
    },

    Instance: function () {

      /**
       * shortcut to help functions
       * @type {Object.<string,Function>}
       */
      let $;
      let data = {};

      let has_feedback = false, $main;

      /**
       * when all dependencies are solved after creation and before the app starts
       * @returns {Promise<void>}
       */
      this.ready = async () => {

        // set shortcut to help functions
        $ = Object.assign( {}, this.ccm.helper, this.helper ); $.use( this.ccm );

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

        if (  this.user && !this.user.isLoggedIn() ) this.user.login();

        if ( this.data ) {
          const key = this.user ? [ this.data.key, this.user.getValue().key ] : this.data.key;
          data = await this.data.store.get( key );
        }

        if ( !data || !data.attempts ) data = { attempts: 0 };

        // render main HTML
        $.setContent( this.element, $main = $.html( this.html.main, {
          onSubmit: event => {
            event.preventDefault();
            if ( this.check ) {
              if ( !has_feedback )
                events.onCheck();
              else if ( this.show_solution )
                events.onSolution();
            }
            else if ( this.show_solution )
              events.onSolution();
          },
          onRetry: events.onRetry,
          onFinish: events.onFinish,
          onCorrection: events.onCorrection
        } ) );

        updateButtons();

        // render content that contains input fields
        const $app = $main.querySelector( '#app' );
        if ( $.isComponent( this.content ) ) {
          const instance = await this.content.start( { shadow: 'none', root: $app } );
          if ( !!instance.element.querySelector( 'form' ) ) {
            let div = document.createElement( 'div' );
            div.appendChild( instance.element.querySelector( 'form > div' ) );
            $.replace( instance.element.querySelector( 'form' ), div  );
          }
        }
        else
          $.setContent( $app, $.html( this.content ) );

        if ( this.onstart ) this.onstart( { instance: this } );

      };

      this.getValue = () => {
        return $.clone( data );
      }

      /**
       * contains all event handlers
       * @type {Object.<string,Function>}
       */
      const events = {
        onCheck: () => {
          if ( this.solution ) {
            let form_data = $.formData( this.element );
            //disable all input/select fields
            this.element.querySelector( 'input' ) && this.element.querySelectorAll( 'input' ). forEach( input =>  { input.disabled = true; } );
            this.element.querySelector( 'select' ) && this.element.querySelectorAll( 'select' ). forEach( select =>  { select.disabled = true; } );

            const result = this.oncheck( { inputs: form_data, highlight: highlight, instance: this } );

            $.progressBar( { elem: this.element.querySelector( '#fill-in-task-progress-bar' ), color: result.correct === result.total ? undefined : 'red', actual: true } );
            has_feedback = true;
            updateButtons();
          }
        },
        onRetry: () => {
          has_feedback = false;
          this.start();
        },
        onCorrection: async () => {
          has_feedback = false;
          const result = $.formData( this.element );
          await this.start();
          $.fillForm( this.element, result );
        },
        onSolution: () => {
          if ( this.sample_solution && $.isInstance( this.sample_solution ) ) {
            $.append( $main, $.html( { 'tag': 'fieldset', 'id': 'fill-in-task-fieldset', 'inner': {'tag': 'legend', "inner": "Solution" } } ));
            $.append( $main.querySelector( 'fieldset' ), this.sample_solution.root );
            setDisabled('fill-in-task-solution', true );
          }

          let form_data = $.formData( this.element );
          //disable all input/select fields
          this.element.querySelector( 'input' ) && this.element.querySelectorAll( 'input' ). forEach( input =>  { input.disabled = true; } );
          this.element.querySelector( 'select' ) && this.element.querySelectorAll( 'select' ). forEach( select =>  { select.disabled = true; } );

          this.onsolution && this.onsolution( { inputs: form_data, instance: this } );
        },
        onFinish: () => {  $.onFinish( this );  }
      };

      const highlight = ( elem, correct ) => {
        has_feedback = true;
        const newClass = correct ? 'fill-in-task-correct': 'fill-in-task-incorrect';
        elem.classList.add( newClass );
      };

      const updateButtons = () => {

        // set status for buttons
        setHidden( 'fill-in-task-compare', !this.check );
        setHidden( 'fill-in-task-solution', !this.show_solution );
        setHidden( 'fill-in-task-retry', !this.check || this.correction );
        setHidden( 'fill-in-task-correction', !this.check || !this.correction );
        setHidden( 'fill-in-task-onfinish', !this.onfinish );
        setDisabled( 'fill-in-task-onfinish', this.check && !has_feedback );
        setDisabled( 'fill-in-task-compare', has_feedback );
        setDisabled( 'fill-in-task-retry', !has_feedback );
        setDisabled( 'fill-in-task-correction', !has_feedback );
        setDisabled( 'fill-in-task-solution', this.check && !has_feedback );

      };

      const setDisabled = ( id, disabled ) =>
        this.element.querySelector( '#' + id )[ ( disabled ? 'set' : 'remove' ) + 'Attribute' ]( 'disabled', true );

      const setHidden = ( id, hidden ) =>
        this.element.querySelector( '#' + id ).classList[ hidden ? 'add' : 'remove' ]( 'hidden' );

    }

  };
  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
