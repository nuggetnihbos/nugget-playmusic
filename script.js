const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const resultsSection = document.getElementById('resultsSection');
const playerSection = document.getElementById('playerSection');
const playerThumbnail = document.getElementById('playerThumbnail');
const playerTitle = document.getElementById('playerTitle');
const playerChannel = document.getElementById('playerChannel');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = document.getElementById('playPauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const volumeSlider = document.getElementById('volumeSlider');
const equalizer = document.getElementById('equalizer');
const lyricsSection = document.getElementById('lyricsSection');
const lyricsContent = document.getElementById('lyricsContent');
const themeSwitcher = document.getElementById('themeSwitcher');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const shareBtn = document.getElementById('shareBtn');
const shareModal = document.getElementById('shareModal');
const shareUrl = document.getElementById('shareUrl');
const copyUrl = document.getElementById('copyUrl');
const closeShare = document.getElementById('closeShare');
const shareWhatsApp = document.getElementById('shareWhatsApp');
const shareFacebook = document.getElementById('shareFacebook');
const shareTwitter = document.getElementById('shareTwitter');
const shareTelegram = document.getElementById('shareTelegram');

const audio = new Audio();
let isPlaying = false;
let currentTrack = null;
let audioEventsInitialized = false;
let isDarkTheme = true;

const PLACEHOLDER_IMG = 'https://via.placeholder.com/300x200?text=No+Image';
shareUrl.value = window.location.href;

function toAbsolute(url) {
    try {
        return new URL(url, location.href).href;
    } catch (e) {
        return url || '';
    }
}

function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

function initializeAudioEvents() {
    if (audioEventsInitialized) return;
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleAudioEnd);
    audio.addEventListener('canplay', handleAudioCanPlay);
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    audioEventsInitialized = true;
}

function handleAudioCanPlay() {
    showNotification('Audio siap diputar');
}

function handleAudioError(e) {
    console.error('Error audio:', e);
    showError('Error memutar audio. Silakan coba lagu lain.');
    isPlaying = false;
    updatePlayPauseButton();
}

function handleAudioPlay() {
    isPlaying = true;
    updatePlayPauseButton();
    equalizer.style.display = 'flex';
    document.querySelectorAll('.result-card').forEach(card => card.classList.remove('playing'));
    const currentCard = document.querySelector(`[data-src="${audio.src}"]`);
    if (currentCard) {
        const card = currentCard.closest('.result-card');
        if (card) card.classList.add('playing');
    }
}

function handleAudioPause() {
    isPlaying = false;
    updatePlayPauseButton();
    equalizer.style.display = 'none';
}

function showError(message) {
    error.textContent = message;
    error.classList.add('active');
    setTimeout(() => error.classList.remove('active'), 3000);
}

async function searchMusic(query) {
    if (!query || !query.trim()) return;
    loading.classList.add('active');
    error.classList.remove('active');
    resultsSection.classList.remove('active');
    try {
        const encodedQuery = encodeURIComponent(query);
        const apiUrl = `https://api.deline.web.id/downloader/ytplay?q=${encodedQuery}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        loading.classList.remove('active');
        if (data.status && data.result) {
            displayResult([data.result]);
            resultsSection.classList.add('active');
            showNotification(`Ditemukan: ${data.result.title}`);
        } else {
            throw new Error('No results found');
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        loading.classList.remove('active');
        showError('Terjadi kesalahan. Silakan coba lagi.');
    }
}

function displayResult(results) {
    resultsSection.innerHTML = '';
    results.forEach(result => {
        const srcAbs = toAbsolute(result.dlink || '');
        const thumb = result.thumbnail || PLACEHOLDER_IMG;
        const card = document.createElement('div');
        card.className = 'result-card';
        const thumbWrap = document.createElement('div');
        thumbWrap.className = 'thumbnail';
        const img = document.createElement('img');
        img.src = thumb;
        img.alt = result.title || '';
        img.onerror = function () {
            this.src = PLACEHOLDER_IMG;
        };
        thumbWrap.appendChild(img);
        const info = document.createElement('div');
        info.className = 'result-info';
        const h3 = document.createElement('h3');
        h3.textContent = result.title || '';
        const meta = document.createElement('div');
        meta.className = 'result-meta';
        const metaArtist = document.createElement('div');
        metaArtist.className = 'meta-item';
        metaArtist.innerHTML = `<i class="fas fa-user"></i><span>${result.pick?.quality || ''}</span>`;
        const metaDuration = document.createElement('div');
        metaDuration.className = 'meta-item';
        metaDuration.innerHTML = `<i class="fas fa-clock"></i><span>${result.pick?.size || 'N/A'}</span>`;
        const metaPop = document.createElement('div');
        metaPop.className = 'meta-item';
        metaPop.innerHTML = `<i class="fas fa-fire"></i><span>${result.pick?.ext || 'N/A'}</span>`;
        meta.appendChild(metaArtist);
        meta.appendChild(metaDuration);
        meta.appendChild(metaPop);
        const actions = document.createElement('div');
        actions.className = 'actions';
        const playBtn = document.createElement('button');
        playBtn.className = 'btn btn-primary play-btn';
        playBtn.setAttribute('data-src', srcAbs);
        playBtn.setAttribute('data-title', result.title || '');
        playBtn.setAttribute('data-channel', result.pick?.quality || '');
        playBtn.setAttribute('data-image', thumb);
        playBtn.innerHTML = `<i class="fas fa-play"></i> Putar`;
        playBtn.addEventListener('click', function () {
            playMusic(this.getAttribute('data-src'), this.getAttribute('data-title'), this.getAttribute('data-channel'), this.getAttribute('data-image'));
        });
        const spotifyLink = document.createElement('a');
        spotifyLink.className = 'btn btn-secondary';
        spotifyLink.href = result.url || '#';
        spotifyLink.target = '_blank';
        spotifyLink.rel = 'noopener noreferrer';
        spotifyLink.innerHTML = `<i class="fab fa-youtube"></i> YouTube`;
        const lyricsBtn = document.createElement('button');
        lyricsBtn.className = 'btn btn-secondary lyrics-btn';
        lyricsBtn.setAttribute('data-title', result.title || '');
        lyricsBtn.setAttribute('data-artist', '');
        lyricsBtn.innerHTML = `<i class="fas fa-scroll"></i> Lirik`;
        lyricsBtn.addEventListener('click', function () {
            searchLyrics(this.getAttribute('data-title'), this.getAttribute('data-artist'));
        });
        actions.appendChild(playBtn);
        actions.appendChild(spotifyLink);
        actions.appendChild(lyricsBtn);
        info.appendChild(h3);
        info.appendChild(meta);
        info.appendChild(actions);
        card.appendChild(thumbWrap);
        card.appendChild(info);
        resultsSection.appendChild(card);
    });
}

async function searchLyrics(title, artist) {
    lyricsContent.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Mencari lirik...</p>';
    lyricsSection.classList.add('active');
    try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
        if (!response.ok) throw new Error('Lirik tidak ditemukan');
        const data = await response.json();
        displayLyrics(data.lyrics);
        showNotification('Lirik berhasil ditemukan');
    } catch (err) {
        lyricsContent.innerHTML = '<p>Lirik tidak ditemukan untuk lagu ini.</p>';
    }
}

function displayLyrics(lyrics) {
    if (!lyrics) {
        lyricsContent.innerHTML = '<p>Lirik tidak tersedia.</p>';
        return;
    }
    const lines = lyrics.split('\n').filter(line => line.trim());
    lyricsContent.innerHTML = lines.map(line => `<div class="lyrics-line">${line}</div>`).join('');
}

function playMusic(src, title, channel, image) {
    const srcAbs = toAbsolute(src);
    if (!srcAbs) {
        showError('Sumber audio tidak valid');
        return;
    }
    if (currentTrack && currentTrack.src === srcAbs) {
        if (audio.paused) {
            audio.play().catch(err => {
                console.error('Play error:', err);
                showError('Gagal memutar audio');
            });
        } else {
            audio.pause();
        }
        return;
    }
    currentTrack = {
        src: srcAbs,
        title: title || '',
        channel: channel || '',
        image: image || PLACEHOLDER_IMG
    };
    audio.src = srcAbs;
    playerThumbnail.src = currentTrack.image;
    playerTitle.textContent = currentTrack.title;
    playerChannel.textContent = currentTrack.channel;
    initializeAudioEvents();
    playerSection.classList.add('active');
    audio.play().catch(err => {
        console.error('Play error:', err);
        showError('Error memutar audio. Silakan coba lagi.');
    });
}

function updateDuration() {
    durationEl.textContent = formatTime(audio.duration);
}

function handleAudioEnd() {
    isPlaying = false;
    updatePlayPauseButton();
    progress.style.width = '0%';
    currentTimeEl.textContent = '0:00';
    showNotification('Lagu selesai diputar');
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateProgress() {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        const lyricsLines = document.querySelectorAll('.lyrics-line');
        if (lyricsLines.length > 0) {
            const idx = Math.floor((audio.currentTime / audio.duration) * lyricsLines.length);
            lyricsLines.forEach((line, i) => line.classList.toggle('active', i === idx));
        }
    }
}

function updatePlayPauseButton() {
    playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function shareWebsite(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Coba nugget - play music! dengarkan banyak music tanpa iklan yang mengganggu.");
    let shareUrl;
    switch (platform) {
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
            break;
        default:
            return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    showNotification(`Membagikan ke ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
}

shareBtn.addEventListener('click', () => shareModal.classList.add('active'));
closeShare.addEventListener('click', () => shareModal.classList.remove('active'));
copyUrl.addEventListener('click', () => {
    navigator.clipboard.writeText(shareUrl.value).then(() => showNotification('URL berhasil disalin!')).catch(err => {
        console.error('Gagal menyalin URL: ', err);
        showError('Gagal menyalin URL');
    });
});

shareWhatsApp.addEventListener('click', () => shareWebsite('whatsapp'));
shareFacebook.addEventListener('click', () => shareWebsite('facebook'));
shareTwitter.addEventListener('click', () => shareWebsite('twitter'));
shareTelegram.addEventListener('click', () => shareWebsite('telegram'));

shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) shareModal.classList.remove('active');
});

playPauseBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!currentTrack) {
        showError('Tidak ada lagu yang dipilih');
        return;
    }
    if (audio.paused) {
        audio.play().catch(err => {
            console.error('Play error:', err);
            showError('Gagal memutar audio');
        });
    } else {
        audio.pause();
    }
});

prevBtn.addEventListener('click', function () {
    if (!currentTrack) return;
    audio.currentTime = 0;
    if (audio.paused) audio.play().catch(() => {});
});

nextBtn.addEventListener('click', function () {
    if (!currentTrack) return;
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updatePlayPauseButton();
    progress.style.width = '0%';
    currentTimeEl.textContent = '0:00';
});

progressBar.addEventListener('click', function (e) {
    if (!audio.duration || !currentTrack) return;
    const rect = this.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    audio.currentTime = (clickX / this.clientWidth) * audio.duration;
});

volumeSlider.addEventListener('input', function () {
    audio.volume = Math.min(1, Math.max(0, this.value / 100));
});

themeSwitcher.addEventListener('click', function () {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('light-theme', !isDarkTheme);
    themeSwitcher.innerHTML = isDarkTheme ? '<i class="fas fa-moon"></i> Dark Mode' : '<i class="fas fa-sun"></i> Light Mode';
    showNotification(`Mode ${isDarkTheme ? 'Gelap' : 'Terang'} diaktifkan`);
});

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) searchMusic(query);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) searchMusic(query);
    }
});

document.querySelectorAll('.quick-search-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        const q = this.getAttribute('data-query') || '';
        searchInput.value = q;
        if (q) searchMusic(q);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    initializeAudioEvents();
    audio.volume = 0.5;
    searchMusic('surat cinta untuk starla');
});

window.addEventListener('beforeunload', () => {
    if (!audio.paused) audio.pause();
});
