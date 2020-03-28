/**
 * @overview ccm component for exam
 * @author Tea Kless <tea.kless@web.de> 2019
 * @license The MIT License (MIT)
 */

( function () {

  const component = {

    name: 'qa_pool',

    ccm: 'https://ccmjs.github.io/ccm/ccm.js',

    config: {
      "html": [ "ccm.load", "resources/templates.html" ],
      "libs": [ 'ccm.load', { "context": "head", "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap-4/css/bootstrap.css" },
        "https://ccmjs.github.io/tkless-components/libs/bootstrap-4/css/bootstrap.css",
        {  "url": "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp", "type": "css" },
        {  "url": "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp", "type": "css", "context": "head" },
        "resources/default.css"
      ],
      "submit": [ "ccm.component", "https://ccmjs.github.io/akless-components/submit/versions/ccm.submit-8.0.0.js", {
        "data": {
          "store": [
            "ccm.store"
          ]
        },
        "entries": [
          {
            "name": "css",
            "type": "hidden"
          },
          {
            "name": "data",
            "type": "hidden"
          },
          {
            "name": "data.key",
            "type": "key"
          },
          {
            "name": "onfinish",
            "type": "hidden"
          },
          {
            "name": "user",
            "type": "hidden"
          },
          "<div class=\"page-header mb-4\"><h2>Settings <small class=\"text-primary\">New QA Task</small></h2></div>",
          {
            "label": "Title",
            "name": "title",
            "type": "text",
            "info": "Title of your Task.",
            "required": true
          },
          "<br><br>",
          {
            "label": "Question",
            "name": "text",
            "type": "text",
            "info": "Enter the text of the question here. Add or remove questions with the plus and minus buttons."
          },
          {
            "label": "Type",
            "name": "input",
            "type": "radio",
            "info": "Select single choice if only one answer or multiple choice if multiple answers can be selected.",
            "items": [
              {
                "label": "Single Choice",
                "value": "radio"
              },
              {
                "label": "Multiple Choice",
                "value": "checkbox"
              }
            ]
          },
          {
            "label": "Description",
            "name": "description",
            "type": "textarea",
            "info": "Enter the description of the question here."
          },
          {
            "label": "Random Answers",
            "name": "random",
            "type": "checkbox",
            "info": "When enabled, the answers to the questions are presented in random order."
          },
          {
            "label": "Answers",
            "name": "answers",
            "type": "several",
            "items": [
              {
                "label": "Answer",
                "name": "text",
                "type": "text",
                "info": "Enter the text of the answer here. Add or remove answers with the plus and minus buttons."
              },
              {
                "label": "Correct",
                "name": "correct",
                "type": "checkbox",
                "info": "Indicates if the answer is a correct answer."
              },
              {
                "label": "Comment",
                "name": "comment",
                "type": "text",
                "info": "A comment can give an indication of why a response is right or wrong. The comment is displayed during automatic feedback."
              }

            ]
          }
        ],
        "ignore": {
          "defaults": {
            "html": {
              "start": {
                "id": "start",
                "inner": {
                  "tag": "button",
                  "inner": "Start",
                  "onclick": "%%"
                }
              },
              "question": {
                "id": "%id%",
                "class": "question",
                "inner": [
                  {
                    "class": "title",
                    "inner": [
                      {
                        "inner": "Question"
                      },
                      {
                        "inner": "%nr%/%count%"
                      },
                      {
                        "inner": "%text%"
                      }
                    ]
                  },
                  {
                    "class": "description",
                    "inner": "%description%"
                  },
                  {
                    "class": "answers"
                  }
                ]
              },
              "answer": {
                "id": "%id%",
                "class": "answer %class%",
                "inner": {
                  "class": "entry",
                  "inner": [
                    {
                      "class": "text",
                      "inner": {
                        "tag": "label",
                        "inner": "%text%",
                        "for": "%id%-input"
                      }
                    },
                    {
                      "class": "comment"
                    }
                  ]
                }
              },
              "comment": {
                "class": "tooltip",
                "onclick": "%click%",
                "inner": [
                  "i",
                  {
                    "tag": "div",
                    "class": "tooltiptext",
                    "inner": {
                      "inner": {
                        "inner": "%comment%"
                      }
                    }
                  }
                ]
              },
              "timer": {
                "tag": "span",
                "inner": "%%"
              }
            },
            "css": [
              "ccm.load",
              "https://ccmjs.github.io/akless-components/quiz/resources/weblysleek.css",
              {
                "context": "head",
                "url": "https://ccmjs.github.io/akless-components/libs/weblysleekui/font.css"
              }
            ],
            "feedback": true,
            "user": [
              "ccm.instance",
              "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.0.0.js",
              {
                "realm": "guest",
                "title": "Guest Mode: Please enter any username"
              }
            ],
            "data": {
              "login": true,
              "store": [
                "ccm.store",
                {
                  "name": "ws_result_data",
                  "url": "https://ccm2.inf.h-brs.de"
                }
              ],
              "user": true
            },
            "onfinish": {
              "alert": "Saved!",
              "login": true,
              "store": true
            }
          }
        },
        "style": [ "ccm.load", "resources/submit.css" ]
      } ],
      "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-4.0.1.mjs" ],
      "data": {
        "store": [ "ccm.store", { "name": "qa_pool_data", "url": "https://ccm2.inf.h-brs.de" } ],
        "key": "demo_qa_pool"
      },
      "modal": [ "ccm.component", "https://ccmjs.github.io/tkless-components/modal/versions/ccm.modal-2.0.0.js" ],
      "live_poll": {
        "url": "https://ccmjs.github.io/akless-components/live_poll/versions/ccm.live_poll-2.3.2.js",
        "store": [ "ccm.store", { "url": "wss://ccm2.inf.h-brs.de", "name": "exam_live_poll" } ],
      },
      "quiz": {
        "url": "https://ccmjs.github.io/akless-components/quiz/versions/ccm.quiz-4.1.0.js",
        "store": [ "ccm.store", { "url": "https://ccm2.inf.h-brs.de", "name": "exam_quiz" } ],
      },
      "handover_app": [ "ccm.component", "https://ccmjs.github.io/akless-components/handover_app/versions/ccm.handover_app-2.0.0.js" ],
      "user": [ "ccm.instance", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.3.0.js", {
        "realm": "guest",
        "guest": true
      } ],
      "swap": [ 'ccm.load', "https://SortableJS.github.io/Sortable/Sortable.js" ]
    },

    Instance: function () {
      let $;
      let self = this;

      this.ready = async () => {

        // set shortcut to help functions
        $ = Object.assign( {}, this.ccm.helper, this.helper );

        if ( this.logger ) this.logger.log( 'ready', $.clone ( this ) );

      };

      this.start = async () => {

        let data = await $.dataset( self.data );

        if ( self.logger ) self.logger.log( 'start', $.clone( data ) );

        if ( !data.tasks ) data.tasks = [];

        let main_elem = $.html( self.html.main );
        renderTasks();
        renderFooter();
        $.setContent( self.element, main_elem );

        function renderTasks() {
          $.setContent( main_elem.querySelector( '.list-group' ), '' );
          for( let i = 0; i < data.tasks.length; i++ ) {
            const list_item = $.html( self.html.list_item, {
              title: data.tasks[ i ].title,
              id: "id_"+ i,
              trigger_select: function ( event ) {
                if( event.target === list_item.querySelector( 'input[type=checkbox]' ) )
                  return;
                const change_event = new Event('change');
                list_item.querySelector( 'input[type=checkbox]' ).checked = !list_item.querySelector( 'input[type=checkbox]' ).checked;
                list_item.querySelector( 'input[type=checkbox]' ).dispatchEvent( change_event );
              },
              edit_task: async () => {
                await renderQASettings( i );
              },
              delete_task: async ( event ) => {
                event.stopPropagation();
                await self.modal.start( {
                  modal_title: data.tasks[ i ].title,
                  modal_content: "Are you sure you want to delete this Task?",
                  footer: [ {
                    "caption": "Delete",
                    "style": "danger btn-sm",
                    "onclick": async function ( ) {
                      data.tasks.splice( i, 1 );
                      // update dataset for rendering
                      await self.data.store.set( data );
                      renderTasks();
                      this.close();
                    }
                  }],
                } );
              },
              select_item: function ( ) {
                selectQA( this, list_item );
                },
              livepoll: async ( event ) => {
                event.stopPropagation();
                await handOverLivePoll( data.tasks[ i ] );
              }
            } );
            main_elem.querySelector( '.list-group' ).appendChild( list_item );
          }
        }

        function renderFooter() {
          const footer_buttons = $.html ( self.html.footer,  {
            new_task_item: async function () { await renderQASettings(); },
            quiz: async function () {
              if ( [...self.element.querySelectorAll( '[type=checkbox]:checked' ) ].length === 0 )
                return alert( "Please select questions!" );
              await renderQuizSettings();
            }
          } );
          main_elem.querySelector( 'footer' ).appendChild( footer_buttons );

          data.tasks.length === 0  && main_elem.querySelector( '#quiz' ).remove();
        }

        async function renderQASettings( qa_data ) {
          let submit_inst;

          if ( qa_data !== undefined ) {
            submit_inst = await self.submit.start({
              root: main_elem,
              data: data.tasks[ qa_data ]
            });
          }
          else
            submit_inst = await self.submit.start( {
              root: main_elem
            } );

          const buttons = $.html( self.html.submit_buttons, {
            action_1: async ()=> {
              const result = submit_inst.getValue();
              const new_data =  {
                "type": "quiz",
                "title": result.title,
                "text": result.text,
                "description": result.description,
                "input": result.input,
                "random": result.random,
                "answers": result.answers
              };
              qa_data !== undefined ? data.tasks[ qa_data ] = new_data : data.tasks.push( new_data );

              // update dataset for rendering
              await self.data.store.set( data );
              await self.start()
            },
            label_1: "Save and Back to List",
            action_2: async () => { await self.start(); },
            label_2: "Don't Save and Back to List"
          } );
          submit_inst.element.appendChild( buttons );
        }

        /*
        * param qa => question-answer-item
        */
        async function handOverLivePoll( qa ) {
          const key = $.generateKey();
          await self.live_poll.store.set( {
            key: key,
            answers: qa.answers.map( answer => typeof answer === 'string' ? answer : answer.text ),
            question: qa.text
          } );

          await self.modal.start( {
            modal_title: "Handover Live Poll",
            modal_content: ( await self.handover_app.start( {
              component_url: self.live_poll.url,
              data: {
                store: [ "ccm.store", {
                  app: {
                    key: 'app',
                    user: [ 'ccm.instance', self.user.component.url, JSON.parse( self.user.config ) ],
                    data: {
                      store: [ "ccm.store", self.live_poll.store.source() ],
                      key: key
                    }
                  }
                } ],
                key: 'app'
              },
              qr_code: [ "ccm.load", "https://ccmjs.github.io/akless-components/libs/qrcode-generator/qrcode.min.js" ]
            } ) ).root,
            footer: [ {
              "caption": "Close",
              "style": "warning",
              "onclick": () => { this.close(); }
            } ]
          } );
        }

        async function renderQuizSettings() {

          // get selected questions
          let questions = [];
          [...self.element.querySelectorAll( '[type=checkbox]:checked' ) ].forEach( checkbox => {
            const task = data.tasks[ checkbox.id.split('_')[1] ];
            task.id = checkbox.id.split('_')[1];
            questions.push( task );
          }  );

          // get template for buttons and initialize click events
          const buttons = $.html( self.html.submit_buttons, {
            action_1: async () => {
              const sorted_questions = [];

              if ( submit_inst.getValue().radio === 'manually' ) {
                const elem = self.element.querySelector( '#questions' );
                elem.querySelectorAll( '[ data-i ]' ).forEach( list_item => {
                  sorted_questions.push( data.tasks[ list_item.getAttribute( 'data-i' ) ] );
                } );
              }

              //TODO set onfinish by quiz
              await self.modal.start( {
                modal_title: "Handover Quiz",
                modal_content: ( await self.handover_app.start( {
                  component_url: self.quiz.url,
                  data: {
                    store: [ "ccm.store", {
                      app: {
                        key: 'app',
                        css: [ "ccm.load", "https://ccmjs.github.io/akless-components/quiz/resources/weblysleek.css",
                          { "context": "head", "url": "https://ccmjs.github.io/akless-components/quiz/resources/weblysleek.css" }
                        ],
                        user: [ 'ccm.instance', self.user.component.url, JSON.parse( self.user.config ) ],
                        questions: $.clone( sorted_questions.length ? sorted_questions : questions ),
                        shuffle: submit_inst.getValue().radio === 'shuffle' && 'shuffle',
                        navigation: true,
                        feedback: true,
                        'placeholder.submit': 'Check'
                      }
                    } ],
                    key: 'app'
                  }
                } ) ).root,
                footer: [ {
                  "caption": "Close",
                  "style": "warning",
                  "onclick": function () { this.close(); }
                } ] } );
            },
            label_1: "Handover Quiz",
            action_2: async ()=> {
              await self.start();
            },
            label_2: "Back to List",
          } );

          const submit_inst = await self.submit.start({
            root: main_elem,
            entries: [
              {
                "name": "css",
                "type": "hidden"
              },
              "<div class=\"page-header\"><h2 class='mb-4'>Settings <small class=\"text-primary\">Quiz</small></h2></div>",
              {
                "label": "Shuffle Questions",
                "name": "radio",
                "type": "radio",
                "info": "When enabled, the questions are shuffled so that their order is random at each startup.",
                "items": [
                  {
                    "label": "Automatically",
                    "value": "shuffle",
                    "checked": true
                  },
                  {
                    "label": "Manually",
                    "value": "manually"
                  }
                ]
              }
            ],
            onchange: function () {
              if ( submit_inst.getValue().radio === 'manually' ){
                renderQuestionList( questions, submit_inst );
              } else
                self.element.querySelector( '#questions' ) && $.setContent( self.element.querySelector( '#questions' ), '' );
            }
          });

          submit_inst.element.appendChild( buttons );

        }

        function renderQuestionList( questions, submit_inst ) {

          const questions_elem = $.html( self.html.question_list );

          for( let entry in questions ) {
            let elem = $.html( self.html.questions, {
              nr: Number( entry)  + 1,
              data: questions[ entry ].id,
              quiz_title: questions[ entry ].title
            } );
            questions_elem.appendChild( elem );
          }

          submit_inst.element.insertBefore( questions_elem, submit_inst.element.querySelector( '#buttons' ) );

          const h5 =  $.html( '<small id="h5"  class="badge badge-info mt-4">Drag and drop the element in the desired order.</small>' );

          questions_elem.insertBefore( h5,  submit_inst.element.querySelector( '#questions > li' ) );


          Sortable.create( questions_elem, {
            animation: 100,
            group: 'list-1',
            draggable: '.list-group-item',
            handle: '.list-group-item',
            sort: true,
            filter: '.sortable-disabled',
            chosenClass: 'active' }
            );
        }

        function selectQA( element, list_item ) {
          element.checked === true ? ( list_item.querySelector( '.hook' ).style.display = 'block'): ( list_item.querySelector( '.hook' ).style.display = 'none');
        }

        function handleDragDrop() {
          let dragSrcEl = null;
          let dropSrcEl = null;
          const div = self.element.querySelectorAll('#questions > div');
          [].forEach.call( div, function( entry ) {
            entry.addEventListener('dragstart', handleDragStart, false);
            entry.addEventListener('dragenter', handleDragEnter, false);
            entry.addEventListener('dragover', handleDragOver, false);
            entry.addEventListener('dragleave', handleDragLeave, false);
            entry.addEventListener('drop', handleDrop, false);
            entry.addEventListener('dragend', handleDragEnd, false);
          });

          function handleDragOver(e) {
            if (e.preventDefault) {
              e.preventDefault(); // Necessary. Allows us to drop.
            }
            e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

            [].forEach.call( div, function( entry ) {
              entry.querySelector( 'input' ).style[ 'background-color' ] = 'unset';
            } );
            e.target.closest( 'div[draggable]' ).querySelector( 'input' ).style[ 'background-color' ] = '#80808059';
            return false;
          }

          function handleDragEnter(e) {
            // this / e.target is the current hover target.
            //e.target.querySelector( '.input-group' ).classList.add('over');
          }

          function handleDragLeave(e) {
            dragSrcEl.querySelector( 'input' ).style[ 'background-color' ] = 'unset';
          }

          function handleDragEnd(e) {
            dropSrcEl.querySelector( 'input' ).style[ 'background-color' ] = 'unset';
          }

          function handleDragStart(e) {
            // Target (this) element is the source node.
            e.target.querySelector( 'input' ).style[ 'background-color' ] = '#80808059';
            e.target.querySelector( 'input' ).style[ 'z-index' ]='100';

            dragSrcEl = e.target;

            e.dataTransfer.effectAllowed = 'move';
            //e.dataTransfer.setData('html', e.target.innerHTML);
          }

          function handleDrop(e) {
            // this/e.target is current target element.

            if (e.stopPropagation) {
              e.stopPropagation(); // Stops some browsers from redirecting.
            }

            dropSrcEl = e.target.closest( 'div[draggable]' );
            dropSrcEl.querySelector( 'input' ).style[ 'background-color' ] = 'unset';

            // Don't do anything if dropping the same column we're dragging.
            if ( dropSrcEl && dragSrcEl !== dropSrcEl ) {

              const tmp = dragSrcEl.innerHTML;
              dragSrcEl.innerHTML = dropSrcEl.innerHTML;
              dropSrcEl.innerHTML = tmp;

              /*
              const id = dragSrcEl.id;
              dragSrcEl.id = dropSrcEl.id;
              dropSrcEl.id = id;
               */

              // Set the source column's HTML to the HTML of the column dropped on.
              //dragSrcEl = e.target.innerHTML;
              //$.replace( dropSrcEl, dragSrcEl.cloneNode( true ) );
              //$.replace( dragSrcEl, dropSrcEl );
              //e.target.closest( 'div[draggable]' ).innerHTML = e.dataTransfer.getData('html');

            }

            return false;
          }
        }
      };

    }

  };

  let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();
