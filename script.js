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

shareUrl.value = window.location.href;

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
    if (!query.trim()) return;
    
    loading.classList.add('active');
    error.classList.remove('active');
    resultsSection.classList.remove('active');
    
    try {
        const encodedQuery = encodeURIComponent(query);
        const apiUrl = `https://api.deline.my.id/downloader/ytplay?q=${encodedQuery}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        loading.classList.remove('active');
        
        if (data.status && data.result) {
            displayResult(data.result);
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

function displayResult(result) {
    resultsSection.innerHTML = `
        <div class="result-card">
            <div class="thumbnail">
                <img src="${result.thumbnail}" alt="${result.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            </div>
            <div class="result-info">
                <h3>${result.title}</h3>
                <div class="result-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>YouTube</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-file-audio"></i>
                        <span>${result.audio ? result.audio.quality : 'Audio'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-hdd"></i>
                        <span>${result.audio ? result.audio.filesize : ''}</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn btn-primary play-btn" data-src="${result.audio ? result.audio.download : ''}" data-title="${result.title}" data-channel="YouTube" data-image="${result.thumbnail}">
                        <i class="fas fa-play"></i> Putar
                    </button>
                    <button class="btn btn-secondary lyrics-btn" data-title="${result.title}" data-artist="YouTube">
                        <i class="fas fa-scroll"></i> Lirik
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.querySelector('.play-btn').addEventListener('click', function() {
        playMusic(
            this.getAttribute('data-src'),
            this.getAttribute('data-title'),
            this.getAttribute('data-channel'),
            this.getAttribute('data-image')
        );
    });

    document.querySelector('.lyrics-btn').addEventListener('click', function() {
        searchLyrics(this.getAttribute('data-title'), this.getAttribute('data-artist'));
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
    const lines = lyrics.split('\n').filter(line => line.trim());
    lyricsContent.innerHTML = lines.map(line => 
        `<div class="lyrics-line">${line}</div>`
    ).join('');
}

function playMusic(src, title, channel, image) {
    if (isPlaying) audio.pause();
    
    audio.src = src;
    audio.load();
    
    playerThumbnail.src = image;
    playerTitle.textContent = title;
    playerChannel.textContent = channel;
    
    currentTrack = { src, title, channel, image };
    initializeAudioEvents();
    
    playerSection.classList.add('active');
    
    setTimeout(() => {
        audio.play().catch(err => {
            console.error('Play error:', err);
            showError('Error memutar audio. Silakan coba lagi.');
        });
    }, 100);
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
    if (isNaN(seconds)) return '0:00';
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
            lyricsLines.forEach((line, index) => {
                line.classList.toggle('active', index === Math.floor(progressPercent / 100 * lyricsLines.length));
            });
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
    
    switch(platform) {
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

shareBtn.addEventListener('click', () => {
    shareModal.classList.add('active');
});

closeShare.addEventListener('click', () => {
    shareModal.classList.remove('active');
});

copyUrl.addEventListener('click', () => {
    navigator.clipboard.writeText(shareUrl.value)
        .then(() => {
            showNotification('URL berhasil disalin!');
        })
        .catch(err => {
            console.error('Gagal menyalin URL: ', err);
            showError('Gagal menyalin URL');
        });
});

shareWhatsApp.addEventListener('click', () => {
    shareWebsite('whatsapp');
});

shareFacebook.addEventListener('click', () => {
    shareWebsite('facebook');
});

shareTwitter.addEventListener('click', () => {
    shareWebsite('twitter');
});

shareTelegram.addEventListener('click', () => {
    shareWebsite('telegram');
});

shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
        shareModal.classList.remove('active');
    }
});

playPauseBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!currentTrack) {
        showError('Tidak ada lagu yang dipilih');
        return;
    }
    
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play().catch(err => {
            console.error('Play error:', err);
            showError('Gagal memutar audio');
        });
    }
});

prevBtn.addEventListener('click', function() {
    if (!currentTrack) return;
    audio.currentTime = 0;
    if (!isPlaying) audio.play();
});

nextBtn.addEventListener('click', function() {
    if (!currentTrack) return;
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updatePlayPauseButton();
    progress.style.width = '0%';
    currentTimeEl.textContent = '0:00';
});

progressBar.addEventListener('click', function(e) {
    if (!audio.duration || !currentTrack) return;
    const width = this.clientWidth;
    const clickX = e.offsetX;
    audio.currentTime = (clickX / width) * audio.duration;
});

volumeSlider.addEventListener('input', function() {
    audio.volume = this.value / 100;
});

themeSwitcher.addEventListener('click', function() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('light-theme', !isDarkTheme);
    themeSwitcher.innerHTML = isDarkTheme ? 
        '<i class="fas fa-moon"></i> Dark Mode' : 
        '<i class="fas fa-sun"></i> Light Mode';
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
    btn.addEventListener('click', function() {
        searchInput.value = this.getAttribute('data-query');
        searchMusic(this.getAttribute('data-query'));
    });
});

window.addEventListener('DOMContentLoaded', () => {
    searchMusic('surat cinta untuk starla');
    initializeAudioEvents();
    audio.volume = 0.5;
});

window.addEventListener('beforeunload', () => {
    if (isPlaying) audio.pause();
});
