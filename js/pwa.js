(() => {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('/service-worker.js').catch(err => console.warn('Service worker registration failed:', err)));
  }
  const installButton = document.getElementById('installApp');
  let installPrompt;
  if (!installButton) return;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!installPrompt) {
      alert('Jika tombol instalasi tidak tersedia, buka menu browser lalu pilih Install app atau Add to Home screen.');
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });
  window.addEventListener('appinstalled', () => { installButton.hidden = true; installButton.textContent = 'Aplikasi terpasang ✓'; });
})();
