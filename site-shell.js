// Both public pages mount this shell and the same components.js result markup.
const mount = document.getElementById('site-mount');
if (mount) {
  const demo = document.body.dataset.mode === 'demo';
  document.body.classList.toggle('demo-page', demo);
  mount.outerHTML = `
    <header class="masthead">
      <a href="./" class="brand" aria-label="Jungle King home">jungle king<span aria-hidden="true">.</span></a>
      <nav class="page-navigation" aria-label="Pages">
        <a class="page-button" href="./" id="nav-scan" ${!demo ? 'aria-current="page"' : ''}>Scanner</a>
        <a class="page-button" href="demo.html" id="nav-demo" ${demo ? 'aria-current="page"' : ''}>Demo</a>
      </nav>
      <div class="language-controls" role="group" aria-label="Language / 語言"><button class="text-button" id="language-en" aria-pressed="true">EN</button><span aria-hidden="true">/</span><button class="text-button" id="language-zh" aria-pressed="false" lang="zh-Hant">繁中</button></div>
    </header>
    <main>
      ${demo ? `<section class="demo-controls" aria-labelledby="demo-title">
        <div class="demo-heading"><div><p class="eyebrow" id="demo-label">DEMO / CHOOSE AN ANIMAL</p><h2 id="demo-title">Explore the experience.</h2></div><p id="demo-note">Sample results. No camera or recognition required.</p></div>
        <div class="demo-animals" id="demo-animals" role="group" aria-label="Choose an animal"></div>
        <div class="demo-actions"><div class="demo-views" role="group" aria-label="Preview screen"><button class="page-button" id="demo-show-scanner" aria-pressed="false">Scan screen</button><button class="page-button" id="demo-show-result" aria-pressed="true">Animal result</button></div><div class="demo-paging"><button class="text-button" id="demo-previous" disabled>← Previous animal</button><button class="text-button" id="demo-next" disabled>Next animal →</button></div></div>
      </section>` : ''}
      <section class="workspace" id="scan-workspace" aria-label="Scan and animal profile">
        <div class="scanner-card">
          <div class="scanner-copy"><p class="eyebrow" id="scan-eyebrow">A CLOSER LOOK</p><div class="card-top"><h1 id="scan-title">Scan a piece.</h1></div><p class="scan-description" id="scan-description">Every piece has a story. Place one Jungle King piece in the frame to meet its animal.</p></div>
          <div class="scanner-view">
            <div class="camera-stage" id="camera-stage"><video id="camera" autoplay playsinline muted hidden aria-label="Live camera view"></video><div class="stage-art" id="stage-art"><svg class="camera-symbol" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M9 14h8l3-5h8l3 5h8v24H9z"/><circle cx="24" cy="26" r="7"/></svg><p id="stage-caption">Centre one piece</p></div><div class="scan-brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span class="camera-tag" id="camera-tag" hidden>Camera off</span></div>
            <div class="camera-controls"><button class="button primary" id="start-camera">Enable camera</button><button class="text-button" id="stop-camera" hidden disabled>Stop camera</button></div>
            <div id="trained-controls" hidden><button class="button primary" id="scan-trained" disabled>Scan piece</button><button class="text-button" id="stop-recognition" disabled>Pause scanning</button></div>
            <p class="preparation-note" id="preparation-note">Connecting the recognition model…</p><p class="scan-status" id="scan-status" role="status" aria-live="polite"></p>
          </div>
        </div>
        <div id="profile-mount"></div>
      </section>
    </main>
    <footer class="site-footer"><a href="https://www.llab.co/" target="_blank" rel="noopener">llab design ltd ↗</a><span>jungle king.</span></footer>`;
}
