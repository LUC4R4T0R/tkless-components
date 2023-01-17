/**
 * @overview HTML templates of ccmjs-based web component for audio recorder
 * @author Luca Ringhausen <luca.ringhausen@h-brs.de> 2022
 * @version latest (v1)
 */

import { html, render } from 'https://ccmjs.github.io/tkless-components/libs/lit/lit.js';
export { render };

/**
 * returns the main HTML template
 * @param {Object} instance - ccmjs-based instance for audio recorder with commentary
 * @param {Object.<string,Function>} events - contains all event handlers
 * @returns {TemplateResult} main HTML template
 */
export function main( instance, events ) {
    if(instance.mediaRecorder){
        return html`
        <div id="bar">
          <div id="start-recording" class="button ${instance.mediaRecorder.state === 'recording' ? 'recording' : ''}"
               @click=${events.onStartRecording} role="button" title="Start Recording">
            <i class="bi bi-record"></i>
          </div>
          <div id="stop-recording" class="button" @click=${events.onStopRecording} role="button" title="Stop Recording">
            <i class="bi bi-stop"></i>
          </div>
          <div id="pause-recording" class="button ${instance.mediaRecorder.state === 'paused' ? 'paused' : ''}"
               @click=${events.onPauseResumeRecording}
               ?hidden="${!['recording', 'paused'].includes(instance.mediaRecorder.state)}" role="button"
               title="${instance.mediaRecorder.state === 'paused' ? 'Resume Recording' : 'Pause Recording'}">
            <i class="bi bi-pause"></i>
          </div>
          <div id="recording-time">
            <span id="current"></span>
          </div>
          <div id="audio-level-meter">
            <div class="meter">
              <div class="level">
                <div class="inner"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }else if(!instance.microphoneEnabled){
        return html`<span class="error microphone-error">Access to microphone was not permitted. <i class="bi bi-arrow-repeat" @click="${instance.enableAudioRecorder}"></i></span>`
    }
    return html`<span class="error">There was an error loading the audio recorder!</span>`;
}