import{html,render}from"https://ccmjs.github.io/tkless-components/libs/lit/lit.js";export{render};export function main(instance,events,page_nr,pages){return html`
    <main>
      <header></header>
      <div id="page">
        <canvas></canvas>
        <div id="text-layer"></div>
      </div>
      <div>
        <nav id="controls" ?data-hidden=${pages<=1}>
          <div id="first" title="${instance.text.first}" data-lang="first-title" @click=${events.onFirst}>
            <i class="bi bi-skip-start" ?disabled=${page_nr===1}></i>
          </div>
          <div id="prev" title="${instance.text.prev}" data-lang="prev-title" @click=${events.onPrev}>
            <i class="bi bi-caret-left" ?disabled=${page_nr===1}></i>
          </div>
          <div id="jump">
            <input type="text" size="${pages.toString().length}" title="${instance.text.jump}" placeholder="${page_nr} / ${pages}" data-lang="jump-title" @change=${events.onJump}>
          </div>
          <div id="next" title="${instance.text.next}" data-lang="next-title" @click=${events.onNext}>
            <i class="bi bi-caret-right" ?disabled=${page_nr===pages}></i>
          </div>
          <div id="last" title="${instance.text.last}" data-lang="last-title" @click=${events.onLast}>
            <i class="bi bi-skip-end" ?disabled=${page_nr===pages}></i>
          </div>
        </nav>
        <nav id="extra">
          <a href="${instance.pdf}" download target="_blank" title="${instance.text.download||""}" data-lang="download-title" ?data-hidden=${!instance.downloadable}>
            <i class="bi bi-cloud-download"></i>
          </a>
        </nav>
      </div>
    </main>
  `}
//# sourceMappingURL=templates.min.mjs.map