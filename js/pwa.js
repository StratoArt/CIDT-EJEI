(() => {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          updateViaCache: 'none'
        });
        // Check for a newer worker whenever the app opens.
        await registration.update();
      } catch (err) {
        console.warn('Service worker registration/update failed:', err);
      }
    });
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
  window.addEventListener('appinstalled', () => {
    installButton.hidden = true;
    installButton.textContent = 'Aplikasi terpasang ✓';
  });
})();
