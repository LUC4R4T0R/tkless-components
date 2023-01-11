"use strict";

/**
 * @overview ccmjs-based web component for recording audio
 * @author Luca Ringhausen <luca.ringhausen@h-brs.de> 2022
 * @license The MIT License (MIT)
 * @version latest (1.0.0)
 */

( () => {
    const component = {
        name: 'audio_player',
        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-27.4.2.min.js',
        config: {
            "css": [ "ccm.load",
                "https://ccmjs.github.io/tkless-components/audio_player/resources/styles-v1.min.css",
                "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-icons.min.css",
                { "url": "https://ccmjs.github.io/tkless-components/libs/bootstrap-5/css/bootstrap-fonts.min.css", "context": "head" },
            ],
            "dark": false,
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-8.4.1.min.mjs" ],
            "html": [ "ccm.load", "https://ccmjs.github.io/tkless-components/audio_player/resources/templates-v1.min.mjs" ],
//          "lang": [ "ccm.start", "https://ccmjs.github.io/akless-components/lang/versions/ccm.lang-1.1.0.min.js" ],
//          "onchange": ( { name, instance, before } ) => { console.log( name, instance.slide_nr, !!before ) },
//          "onready": event => console.log( event ),
//          "onstart": instance => { console.log( 'start', instance.slide_nr ) },
//          "onloadeddata": ({name, instance, data}) => console.log(event),
//          "onplaybackfinished": ({name, instance, data}) => console.log(event),
            "audio": null // blob, url or callback->url
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

                this.audioElement = new Audio();
                this.playing = false;
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

            this.isPlaying = () => {
                return this.playing;
            }

            /**
             * starts the app
             * @returns {Promise<void>}
             */
            this.start = async () => {
                await this.loadAudio(this.audio, true);

                await render();

                this.playbackProgressElement = this.element.querySelector('#progress>input');
                this.playbackCurrentTimeElement = this.element.querySelector('#time>#current');
                this.playbackMaxTimeElement = this.element.querySelector('#time>#max');
                this.playbackVolumeElement = this.element.querySelector('#volume>input');

                this.audioElement.addEventListener('play', () => {
                    this.playing = true;
                    render();
                });

                this.audioElement.addEventListener('pause', () => {
                    this.playing = false;
                    render();
                });

                this.audioElement.addEventListener('ended', async (event) => {
                    this.playing = false;
                    if(this.onplaybackfinished) await this.onplaybackfinished({name: 'playbackfinished', instance: this, data: event});
                    render();
                });

                this.playbackVolumeElement.value = this.audioElement.volume;
                this.audioElement.addEventListener('volumechange', (event) => {
                    this.playbackVolumeElement.value = event.target.volume;
                    render();
                });

                setPlayBackProgress(this.audioElement.currentTime);
                this.audioElement.addEventListener('timeupdate', (event) => {
                    setPlayBackProgress(event.target.currentTime);
                    render();
                });

                setPlayBackDuration(this.audioElement.duration);
                this.audioElement.addEventListener('durationchange', (event) => {
                    setPlayBackDuration(event.target.duration);
                    render();
                });

                this.audioElement.addEventListener('emptied', (event) => {
                    setPlayBackProgress(event.target.currentTime);
                    setPlayBackDuration(event.target.duration);
                    render();
                });

                this.audioElement.addEventListener('loadeddata', async (event) => {
                    const eventObj = {name: 'loadeddata', instance: this, data: event, autoPlay: this.controlledByAutoPlay};
                    if(this.controlledByAutoPlay){
                        this.controlledByAutoPlay = false;
                    }
                    if(this.onloadeddata) await this.onloadeddata(eventObj);
                });

                // trigger 'onstart' callback
                this.onstart && await this.onstart( { instance: this } );

            };

            this.loadAudio = async (audio, skipRender = false, controlledByAutoPlay = false) => {
                this.audio = audio;
                if(typeof audio === 'function') audio = await audio();
                if(audio instanceof Blob) this.audioURL = URL.createObjectURL(audio);
                else this.audioURL = audio;
                await this.setAudioURL(this.audioURL, skipRender, controlledByAutoPlay);
            }

            this.setAudioURL = async (url, skipRender = false, controlledByAutoPlay = false) => {
                this.playing = false;
                this.controlledByAutoPlay = controlledByAutoPlay;
                this.audioElement.src = url;
                if(!skipRender) await render();
            }

            this.isAudioReady = () => {
                if(!this.audioElement) return false;
                return this.audioElement.readyState > 0;
            }

            this.startPlayback = async () => {
                if(this.isAudioReady()) {
                    if (this.audioElement.currentTime === this.audioElement.duration) this.setProgress(0);
                    await this.audioElement.play()
                }
            };

            this.pausePlayback = () => {
                this.audioElement.pause();
            };

            this.getVolume = () => {
                return this.audioElement.volume;
            };

            this.setVolume = (volume) => {
                this.audioElement.volume = volume;
            };

            this.setProgress = (progress) => {
                this.audioElement.currentTime = progress;
            };

            this.mute = () => {
                this.playbackMuted = true;
                this.prevPlaybackVolume = this.audioElement.volume;
                this.setVolume(0);
            };

            this.unMute = () => {
                this.playbackMuted = false;
                if(this.prevPlaybackVolume === 0){
                    this.setVolume(1);
                }else {
                    this.setVolume(this.prevPlaybackVolume);
                }
            };

            this.enableAutoPlay = () => {
                this.autoPlay = true;
            };

            this.disableAutoPlay = () => {
                this.autoPlay = false;
            };

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
             * renders/updates content
             * @returns {Promise<void>}
             */
            const render = async () => {

                // render main HTML template and translate content
                this.html.render( this.html.main( this, events ), this.element );
                this.lang && this.lang.translate();

                //typeof content !== 'number' && this.onchange && this.onchange( { instance: this } );

            };

            const setPlayBackDuration = (seconds) => {
                if(isNaN(seconds) || seconds < 0) seconds = 0;
                this.playbackProgressElement.max = seconds;
                this.playbackMaxTimeElement.textContent = this.getTimeString(seconds);
            };

            const setPlayBackProgress = (seconds) => {
                if(isNaN(seconds) || seconds < 0) seconds = 0;
                this.playbackProgressElement.value = seconds;
                this.playbackCurrentTimeElement.textContent = this.getTimeString(seconds);
            };

            /**
             * contains all event handlers
             * @type {Object.<string,Function>}
             */
            const events = {
                onPause: () => {
                    this.pausePlayback();
                    render();
                },

                onPlay: () => {
                    this.startPlayback();
                    render();
                },

                onMute: () => {
                    this.mute();
                    render();
                },

                onUnMute: () => {
                    this.unMute();
                    render();
                },

                onChangeProgress: (event) => {
                    this.setProgress(event.target.value);
                    render();
                },

                onChangeVolume: (event) => {
                    this.setVolume(event.target.value);
                    render();
                },

                onEnableAutoPlay: () => {
                    this.enableAutoPlay();
                    render();
                },

                onDisableAutoPlay: () => {
                    this.disableAutoPlay();
                    render();
                }
            };

        }
    };
    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||[""])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){(c="latest"?window.ccm:window.ccm[c]).component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();