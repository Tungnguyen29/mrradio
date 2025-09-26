// app.js
(() => {
  const https://audio-lss.vov.vn/han/live/vov1/audio/manifest.m3u8 = null; // optional default stream
  const player = document.getElementById('player');
  const playBtn = document.getElementById('play');
  const pauseBtn = document.getElementById('pause');
  const stations = document.getElementById('stations');
  const volume = document.getElementById('volume');
  const stationName = document.getElementById('station-name');
  const track = document.getElementById('track');
  const cover = document.getElementById('cover');

  // If you set https://audio-lss.vov.vn/han/live/vov1/audio/manifest.m3u8 above, uncomment:
  if (https://audio-lss.vov.vn/han/live/vov1/audio/manifest.m3u8) {
    const opt = document.createElement('option');
    opt.value = https://audio-lss.vov.vn/han/live/vov1/audio/manifest.m3u8;
    opt.textContent = 'Đài mặc định';
    stations.appendChild(opt);
  }

  // Helper: set stream and play
  function setStream(url) {
    if (!url) return;
    player.src = url;
    player.load();
    stationName.textContent = `Đài: ${url}`;
  }

  // Play / Pause handlers
  playBtn.addEventListener('click', async () => {
    if (!player.src) {
      const sel = stations.value;
      if (!sel) {
        alert('Vui lòng chọn đài trước khi phát.');
        return;
      }
      setStream(sel);
    }
    try {
      await player.play(); // must be user gesture on iOS
      track.textContent = 'Trạng thái: đang phát';
      updateMediaSession();
      playBtn.disabled = true;
      pauseBtn.disabled = false;
    } catch (err) {
      console.error('Không thể phát:', err);
      alert('Phát thất bại — kiểm tra URL stream hoặc CORS/HTTPS.');
    }
  });

  pauseBtn.addEventListener('click', () => {
    player.pause();
    track.textContent = 'Trạng thái: dừng';
    playBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  // Disable pause at start
  pauseBtn.disabled = true;

  // Change station by select
  stations.addEventListener('change', () => {
    const val = stations.value;
    if (!val) return;
    setStream(val);
    // auto-play only if already playing
    if (!player.paused) {
      player.play().catch(()=>{});
    }
  });

  // Volume
  volume.addEventListener('input', () => {
    player.volume = parseFloat(volume.value);
  });

  // Update now playing from stream metadata if possible
  player.addEventListener('playing', () => {
    // Many streams include ICY metadata — browsers rarely expose it.
    // We update UI conservatively:
    track.textContent = 'Trạng thái: đang phát';
  });

  player.addEventListener('pause', () => {
    track.textContent = 'Trạng thái: dừng';
  });

  player.addEventListener('error', (e) => {
    console.error('Audio error', e);
    track.textContent = 'Lỗi phát. Kiểm tra nguồn stream.';
  });

  // Media Session API (nếu có) — hiển thị metadata trên lock screen / control center
  function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const src = player.src || '';
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Radio trực tuyến',
      artist: src,
      album: 'Radio Nền',
      artwork: [
        { src: cover.src, sizes: '192x192', type: 'image/png' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => {
      player.play().catch(()=>{});
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      player.pause();
    });
    // skip handlers left null (not applicable)
  }

  // Register service worker for PWA assets caching (optional)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('SW register failed:', err);
      });
    });
  }

  // initial
  if (https://audio-lss.vov.vn/han/live/vov1/audio/manifest.m3u8) {
    setStream(https://audio-lss.vov.vn/han/live/vov1/audio/manifest.m3u8);
  }
})();
