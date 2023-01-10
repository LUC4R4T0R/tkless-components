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
    if(true){
        return html`
        <div id="bar">
          <div id="play" class="button" @click=${events.onPlay} ?hidden=${instance.playing} ?disabled="${!instance.isAudioReady()}" role="button">
            <i class="bi bi-play" ></i>
          </div>
          <div id="pause" class="button" @click=${events.onPause} ?hidden=${!instance.playing} ?disabled="${!instance.isAudioReady()}" role="button">
            <i class="bi bi-pause"></i>
          </div>
          <div id="time" >
            <span id="current"></span>
            <span>&nbsp;/&nbsp;</span>
            <span id="max"></span>
          </div>
          <div id="progress" >
            <input type="range" class="form-range" min="0" step="0.01" @change="${events.onChangeProgress}" ?disabled="${!instance.isAudioReady()}"  >
          </div>
          <div id="mute" class="button" @click=${events.onMute} ?hidden=${instance.playbackMuted} role="button">
            <i class="bi bi-volume-up"></i>
          </div>
          <div id="unmute" class="button" @click=${events.onUnMute} ?hidden=${!instance.playbackMuted} role="button">
            <i class="bi bi-volume-mute"></i>
          </div>
          <div id="volume" >
            <input type="range" class="form-range" min="0" max="1" step="0.01" @change="${events.onChangeVolume}" ">
          </div>
        </div>
      `;
    }else if(!instance.audioFile){
        return '';
    }
    return html`<span class="error">There was an error loading the audio player!</span>`;
}