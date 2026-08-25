/* =========================
   1. ELEMENTS DEL PLAYER
   ========================= */

// Tracks de la pàgina
const tracks =
    Array.from(
        document.querySelectorAll(".release-track")
    );

// Player
const player =
    document.getElementById("player");

const audio =
    document.getElementById("audio-player");

const playerTitle =
    document.getElementById("player-title");

// Botons
const playButton =
    document.getElementById("play-button");

const prevButton =
    document.getElementById("prev-button");

const nextButton =
    document.getElementById("next-button");

const shuffleButton =
    document.getElementById("shuffle-button");

const closeButton =
    document.getElementById("close-player");

// Temps + barra
const currentTime =
    document.getElementById("current-time");

const totalTime =
    document.getElementById("total-time");

const progressBar =
    document.getElementById("progress-bar");


/* =========================
   2. ESTAT DEL PLAYER
   ========================= */

let currentTrack = 0;

let shuffle = false;

let shufflePool = [];


/* =========================
   3. FORMAT DEL TEMPS
   ========================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return (
        minutes +
        ":" +
        secs
            .toString()
            .padStart(2, "0")
    );
}

/* =========================
   SHUFFLE POOL
   ========================= */

function resetShufflePool() {

    shufflePool =
        tracks
            .map((track, index) => index)
            .filter(index => index !== currentTrack);
}


/* =========================
   4. CARREGAR TRACK
   ========================= */

function loadTrack(
    index,
    autoplay = true
) {

    currentTrack = index;

    const track =
        tracks[currentTrack];

    const title =
        track.dataset.title;

    const audioFile =
        track.dataset.audio;

    // Carregar àudio
    audio.src = audioFile;
    audio.load();

    // Nom del track
    playerTitle.textContent =
        title;

    // Reiniciar temps i barra
    currentTime.textContent =
        "0:00";

    totalTime.textContent =
        "0:00";

    progressBar.value = 0;

    progressBar.style.setProperty(
        "--progress",
        "0%"
    );

    // Mostrar player
    player.classList.add("open");

    document.body.classList.add(
        "player-open"
    );

    // Reproduir
    if (autoplay) {

        audio.play();

        playButton.classList.add(
            "playing"
        );
    }
}


/* =========================
   5. PLAY / PAUSE
   ========================= */

playButton.addEventListener(
    "click",
    () => {

        // Si encara no hem carregat res
        if (!audio.src) {

            loadTrack(0);

            return;
        }

        // PLAY
        if (audio.paused) {

            audio.play();

            playButton.classList.add(
                "playing"
            );
        }

        // PAUSE
        else {

            audio.pause();

            playButton.classList.remove(
                "playing"
            );
        }
    }
);


/* =========================
   6. PREVIOUS
   ========================= */

prevButton.addEventListener(
    "click",
    () => {

        let index =
            currentTrack - 1;

        // Si som al primer,
        // tornar a l'últim
        if (index < 0) {

            index =
                tracks.length - 1;
        }

        loadTrack(index);
    }
);


/* =========================
   7. NEXT
   ========================= */

nextButton.addEventListener(
    "click",
    nextTrack
);


function nextTrack() {

    let index;

    /* SHUFFLE */
    if (
        shuffle &&
        tracks.length > 1
    ) {

        // Si ja hem gastat tots els tracks,
        // començar una nova ronda
        if (shufflePool.length === 0) {
            resetShufflePool();
        }

        // Escollir una posició aleatòria
        // dins dels tracks que encara no han sonat
        const randomPosition =
            Math.floor(
                Math.random() *
                shufflePool.length
            );

        // Extreure'l de la bossa
        // perquè no pugui repetir-se
        index =
            shufflePool.splice(
                randomPosition,
                1
            )[0];
    }

    /* ORDRE NORMAL */
    else {

        index =
            currentTrack + 1;

        if (
            index >= tracks.length
        ) {
            index = 0;
        }
    }

    loadTrack(index);
}


/* =========================
   8. SHUFFLE
   ========================= */

shuffleButton.addEventListener(
    "click",
    () => {

        shuffle = !shuffle;

        shuffleButton.classList.toggle(
            "active",
            shuffle
        );

        if (shuffle) {
            resetShufflePool();
        }
    }
);

/* =========================
   9. CLOSE
   ========================= */

closeButton.addEventListener(
    "click",
    () => {

        // Parar àudio
        audio.pause();

        audio.currentTime = 0;

        // Amagar player
        player.classList.remove(
            "open"
        );

        document.body.classList.remove(
            "player-open"
        );

        // Estat visual PLAY
        playButton.classList.remove(
            "playing"
        );

        // Reiniciar barra
        currentTime.textContent =
            "0:00";

        progressBar.value = 0;

        progressBar.style.setProperty(
            "--progress",
            "0%"
        );
    }
);


/* =========================
   10. CLICK SOBRE UN TRACK
   ========================= */

tracks.forEach(
    (track, index) => {

        track
            .querySelector(".track-main")
            .addEventListener(
                "click",
                () => {

                    loadTrack(index);
                }
            );
    }
);


/* =========================
   11. DURACIÓ TOTAL DEL TRACK
   ========================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        totalTime.textContent =
            formatTime(
                audio.duration
            );
    }
);


/* =========================
   12. ACTUALITZAR TEMPS + BARRA
   ========================= */

audio.addEventListener(
    "timeupdate",
    () => {

        // Temps actual
        currentTime.textContent =
            formatTime(
                audio.currentTime
            );

        if (!audio.duration) {
            return;
        }

        // Percentatge reproduït
        const progress =
            (
                audio.currentTime /
                audio.duration
            ) * 100;

        // Posició del slider
        progressBar.value =
            progress;

        // Part negra de la barra
        progressBar.style.setProperty(
            "--progress",
            `${progress}%`
        );
    }
);


/* =========================
   13. MOURE LA BARRA MANUALMENT
   ========================= */

progressBar.addEventListener(
    "input",
    () => {

        if (!audio.duration) {
            return;
        }

        const progress =
            parseFloat(
                progressBar.value
            );

        // Convertir % a segons
        audio.currentTime =
            (
                progress / 100
            ) * audio.duration;

        // Actualitzar visualment
        progressBar.style.setProperty(
            "--progress",
            `${progress}%`
        );
    }
);


/* =========================
   14. QUAN ACABA EL TRACK
   ========================= */

audio.addEventListener(
    "ended",
    nextTrack
);