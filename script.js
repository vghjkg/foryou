const songs = [
  {
    title: "About You",
    artist: "The 1975",
    src: "about.mp3",
    cover: "about.jpg"
  },
   {
    title: "Do You Like Me?",
    artist: "Daniel Caesar",
    src: "daniel.mp3",
    cover: "daniel.jpg"
  },
  {
    title: "Right Here",
    artist: "Justin Bieber",
    src: "justin.mp3",
    cover: "justin.jpg"
  },
  {
    title: "THINGS & SUCH",
    artist: "partynextdoor",
    src: "party.mp3",
    cover: "party.jpg"
  }
];

let index = 0;
let isPlaying = false;

const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const cover = document.getElementById("cover");
const playlistEl = document.getElementById('playlist');
const playlistItems = playlistEl ? playlistEl.querySelectorAll('li') : [];

function loadSong(i) {
  audio.src = songs[i].src;
  title.textContent = songs[i].title;
  artist.textContent = songs[i].artist;
  cover.src = songs[i].cover;

  // update active playlist item
  playlistItems.forEach(li => li.classList.toggle('active', Number(li.dataset.index) === i));
}

playBtn.onclick = () => {
  if (!isPlaying) {
    audio.play();
    playBtn.textContent = "⏸";
  } else {
    audio.pause();
    playBtn.textContent = "▶";
  }
  isPlaying = !isPlaying;
};

nextBtn.onclick = () => {
  index = (index + 1) % songs.length;
  loadSong(index);
  audio.play();
  playBtn.textContent = "⏸";
  isPlaying = true;
};

prevBtn.onclick = () => {
  index = (index - 1 + songs.length) % songs.length;
  loadSong(index);
  audio.play();
  playBtn.textContent = "⏸";
  isPlaying = true;
};

loadSong(index);

// click on playlist item to play
playlistItems.forEach(li => {
  li.addEventListener('click', () => {
    const i = Number(li.dataset.index);
    if (!isNaN(i)) {
      index = i;
      loadSong(index);
      audio.play();
      playBtn.textContent = "⏸";
      isPlaying = true;
    }
  });
});

// when song ends, go to next
audio.addEventListener('ended', () => {
  nextBtn.click();
});

/* === SWIPE SUPPORT (TOUCH & MOUSE) === */
const coverContainer = document.querySelector('.cover');
let dragging = false;
let startX = 0;
let currentX = 0;
const threshold = 60; // px to consider a swipe

function setCoverTransition(enabled) {
  if (enabled) {
    cover.style.transition = 'transform 400ms ease, opacity 250ms ease';
  } else {
    cover.style.transition = 'none';
  }
}

function handleStart(x) {
  dragging = true;
  startX = x;
  currentX = x;
  setCoverTransition(false);
}

function handleMove(x) {
  if (!dragging) return;
  currentX = x;
  const delta = currentX - startX;
  cover.style.transform = `translateX(${delta}px)`;
}

function handleEnd() {
  if (!dragging) return;
  dragging = false;
  setCoverTransition(true);
  const delta = currentX - startX;
  if (Math.abs(delta) > threshold) {
    if (delta < 0) {
      swipeTo('left');
    } else {
      swipeTo('right');
    }
  } else {
    cover.style.transform = 'translateX(0)';
  }
}

function swipeTo(direction) {
  const outX = direction === 'left' ? -window.innerWidth : window.innerWidth;
  // slide out
  cover.style.transform = `translateX(${outX}px)`;
  cover.style.opacity = '0';

  setTimeout(() => {
    // change index
    index = direction === 'left' ? (index + 1) % songs.length : (index - 1 + songs.length) % songs.length;
    // load new song and position incoming image off-screen
    setCoverTransition(false);
    loadSong(index);
    cover.style.transform = `translateX(${ -outX }px)`;
    cover.style.opacity = '0';
    // force reflow then animate in
    requestAnimationFrame(() => {
      setCoverTransition(true);
      cover.style.transform = 'translateX(0)';
      cover.style.opacity = '1';
    });
    if (isPlaying) audio.play();
  }, 320);
}

// touch events
coverContainer && coverContainer.addEventListener('touchstart', e => handleStart(e.touches[0].clientX), {passive: true});
coverContainer && coverContainer.addEventListener('touchmove', e => handleMove(e.touches[0].clientX), {passive: true});
coverContainer && coverContainer.addEventListener('touchend', e => handleEnd());

// mouse events for desktop
coverContainer && coverContainer.addEventListener('mousedown', e => { e.preventDefault(); handleStart(e.clientX); });
window.addEventListener('mousemove', e => { if (dragging) handleMove(e.clientX); });
window.addEventListener('mouseup', e => { if (dragging) handleEnd(); });