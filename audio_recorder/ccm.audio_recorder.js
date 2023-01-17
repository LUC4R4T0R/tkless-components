"use strict";

/**
 * @overview ccmjs-based web component for recording audio
 * @author Luca Ringhausen <luca.ringhausen@h-brs.de> 2022
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 */

( () => {
    const component = {
        name: 'audio_recorder',
        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.4.2.min.js',
        config: {
            "css": [ "ccm.load",
                "https://ccmjs.github.io/tkless-components/audio_recorder/resources/styles-v1.min.css",
                "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-icons.min.css",
                { "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-fonts.min.css", "context": "head" },
            ],
            "dark": false,
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.1.min.mjs" ],
            "html": [ "ccm.load", "https://ccmjs.github.io/tkless-components/audio_recorder/resources/templates-v1.min.mjs" ],
//          "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/versions/ccm.lang-1.1.0.min.js" ],
//          "onchange": ( { name, instance, before } ) => { console.log( name, instance.slide_nr, !!before ) },
//          "onready": event => console.log( event ),
//          "onstart": instance => { console.log( 'start', instance.slide_nr ) },
//          "onrecordingstarted": ({name: 'recordingstarted', 'before': true}) => { console.log('recording started') },
            "onrecordingcreated": blob => { console.log('a new recording has been created:', blob) }
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

                // pass setting for dark mode to child instances
                if ( this.lang ) this.lang.dark = this.dark;

                determineFileFormat();

                this.recordingTime = 0;
                this.microphoneEnabled = false;
            };

            /**
             * when all dependencies are solved after creation and before the app starts
             * @returns {Promise<void>}
             */
            this.ready = async () => {

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
                await this.ccm.load("https://cwilso.github.io/volume-meter/volume-meter.js");
                this.enableAudioRecorder();

                await render();

                // render language selection and user login/logout
                const header = this.element.querySelector( 'header' );
                if ( header ) {
                    header && this.lang && !this.lang.getContext() && $.append( header, this.lang.root );
                    header && this.user && $.append( header, this.user.root );
                }

                // trigger 'onstart' callback
                this.onstart && await this.onstart( { instance: this } );

            };

            /**
             * determines file format & codec by
             */
            const determineFileFormat = () => {
                this.mimeType = '';
                this.fileSuffix = '';
                if(MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')){
                    this.mimeType = 'audio/ogg;codecs=opus';
                    this.fileSuffix = '.ogg';
                }else if(MediaRecorder.isTypeSupported('audio/ogg;codecs=vorbis')){
                    this.mimeType = 'audio/ogg;codecs=vorbis';
                    this.fileSuffix = '.ogg';
                }else if(MediaRecorder.isTypeSupported('audio/webm;codecs=opus')){
                    this.mimeType = 'audio/webm;codecs=opus';
                    this.fileSuffix = '.webm';
                }else if(MediaRecorder.isTypeSupported('audio/webm;codecs=vorbis')){
                    this.mimeType = 'audio/webm;codecs=vorbis';
                    this.fileSuffix = '.webm';
                }else {
                    console.error('No suitable file format could be determined! Please try to use a newer browser.');
                }
            }

            this.startRecording = async () => {
                await this.onrecordingstarted({name: 'recordingstarted', 'before': true});
                this.mediaRecorder.start();
                startAudioLevelMeter();
                resetRecordingTimer();
                startRecordingTimer();
            }

            this.stopRecording = () => {
                this.mediaRecorder.stop();
                stopAudioLevelMeter();
                stopRecordingTimer();
            }

            this.pauseRecording = () => {
                this.mediaRecorder.pause();
                stopAudioLevelMeter();
                stopRecordingTimer();
                updateRecordingTime();
            }

            this.resumeRecording = () => {
                this.mediaRecorder.resume();
                startAudioLevelMeter();
                startRecordingTimer();
            }

            this.resetRecorder = () => {
                if(this.mediaRecorder.state === 'recording' || this.mediaRecorder.state === 'paused') this.stopRecording();
                resetRecordingTimer();
                updateRecordingTime();
            }

            this.displayRecordingTime = (seconds) => {
                this.element.querySelector('#recording-time>#current').textContent = this.getTimeString(seconds);
            };

            const updateRecordingTime = () => {
                if(!this.recordingTime && !this.recordingStart) this.displayRecordingTime(0);
                else this.displayRecordingTime(((this.recordingStart ? Date.now() - this.recordingStart : 0) + this.recordingTime) / 1000);
            };

            const startRecordingTimer = () => {
                this.recordingStart = Date.now();
                this.recordingTimeInterval = setInterval(updateRecordingTime, 1000);
            }

            const stopRecordingTimer = () => {
                clearInterval(this.recordingTimeInterval);
                this.recordingTime += Date.now() - this.recordingStart;
                this.recordingStart = undefined;
            }

            const resetRecordingTimer = () => {
                this.recordingTime = 0;
            }

            let rafID = null;
            const drawAudioMeterLoop = (time) => {
                if(this.enableAudioVolumeMeter) {
                    setAudioVolumeMeterLevel(this.audioMeter.volume * 2, this.audioMeter.clipping);
                    rafID = window.requestAnimationFrame(drawAudioMeterLoop);
                }
            }

            const setAudioVolumeMeterLevel = (level) => {
                this.audioLevelElement.style.clipPath = 'inset(0 '+((1-level)*100)+'% 0 0)';
                this.audioLevelElement.style.webkitClipPath = 'inset(0 '+((1-level)*100)+'% 0 0)';
            }

            const initAudioLevelMeter = () => {
                this.audioContext = new AudioContext();
                const mediaStreamSource = this.audioContext.createMediaStreamSource(this.audioStream);
                this.audioMeter = createAudioMeter(this.audioContext);
                mediaStreamSource.connect(this.audioMeter);
            }

            const startAudioLevelMeter = () => {
                if(!this.audioMeter) initAudioLevelMeter();
                this.enableAudioVolumeMeter = true;
                drawAudioMeterLoop();
            }

            const stopAudioLevelMeter = () => {
                this.enableAudioVolumeMeter = false;
                setAudioVolumeMeterLevel(0);
            }

            /**
             * returns app state data
             * @returns {Object}
             */
            this.getValue = () => { return {} };

            this.getTimeString = (sec_num) => {
                var hours   = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));

                if (seconds < 10) {seconds = "0"+seconds;}
                return (hours !== 0 ? hours+':' : '')+minutes+':'+seconds;
            };

            /**
             * initializes recording functionality
             */
            this.enableAudioRecorder = () => {
                navigator.mediaDevices.getUserMedia({audio: true})
                    .then(async stream => {
                        this.microphoneEnabled = true;
                        this.audioStream = stream;


                        this.mediaRecorder = new MediaRecorder(stream, {mimeType: this.mimeType});

                        this.mediaRecorder.addEventListener("dataavailable", async event => {
                            await this.onrecordingcreated(event.data);
                            render();
                        });
                        await render();
                        updateRecordingTime();
                    })
                    .catch(e => {
                        if(e.name === 'NotFoundError') alert('No microphone available!');
                    } );
            }

            /**
             * renders/updates content
             * @returns {Promise<void>}
             */
            const render = async () => {

                // render main HTML template and translate content
                this.html.render( this.html.main( this, events ), this.element );
                this.lang && this.lang.translate();

                this.audioLevelElement = this.element.querySelector('#audio-level-meter>.meter>.level>.inner');

                //typeof content !== 'number' && this.onchange && this.onchange( { instance: this } );

            };


            /**
             * contains all event handlers
             * @type {Object.<string,Function>}
             */
            const events = {
                onStartRecording: () => {
                    this.startRecording();
                    render(true);
                },

                onPauseResumeRecording: () => {
                    if(this.mediaRecorder.state === 'recording'){
                        this.pauseRecording();
                    }
                    else{
                        this.resumeRecording();
                    }
                    render();
                },

                onStopRecording: () => {
                    this.stopRecording();
                    render();
                }
            };

        }
    };
    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();