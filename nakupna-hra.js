// Product data
const products = {
    "Jablko": 0.5,
    "Mlieko": 0.8,
    "Chlieb": 1.2,
    "Syr": 1.5,
    "Jogurt": 1.0,
    "Rohlík": 0.3
};

// Product images - lokálne súbory
const productImages = {
    "Jablko": "apple.png",
    "Mlieko": "milk.png",
    "Chlieb": "bread.png",
    "Syr": "cheese.png",
    "Jogurt": "yogurt.png",
    "Rohlík": "roll.png"
};

// Tutorial texts
const tutorials = {
    training: `
        V tréningovom režime sa učíš robiť presné nákupy:

        1. Tvojím cieľom je nakúpiť presne za sumu, ktorá je zobrazená hore.

        2. Klikni na tlačidlo "Pridať" vedľa produktu, ktorý chceš pridať do košíka.

        3. Sleduj aktuálnu sumu v košíku.

        4. Keď si myslíš, že tvoj nákup zodpovedá cieľovej sume, klikni na "Hotovo".

        5. Ak chceš začať odznova, klikni na "Reštartovať".

        Tento režim je bez bodov - slúži len na precvičenie nakupovania za presnú sumu. Ak spravíš chybu, môžeš to skúsiť znova koľkokrát chceš.

        Tip: Pamätaj si ceny produktov a premysli dopredu, ktorú kombináciu použiješ!
    `,
    stars: `
        V režime "Na body" sa snažíš získať čo najviac hviezd:

        1. Tvojím cieľom je nakúpiť presne za sumu, ktorá je zobrazená hore.

        2. Za každý úspešný nákup získaš hviezdy (maximálne 5).

        3. Za každú chybu v aktuálnom leveli strácaš jednu hviezdu.

        4. Môžeš sa pokúšať znova, kým nenakúpiš správne.

        5. Po úspešnom nákupe postupuješ do ďalšieho levelu.

        6. S vyšším levelom sa zvyšuje obtiažnosť - budeš mať obmedzený počet kusov, ktoré môžeš z každého produktu pridať.

        Tip: Rozvážne premýšľaj! Lepšie je urobiť jeden správny nákup než veľa chýb.
    `,
    duel: `
        V súbojovom režime hrajú dvaja hráči proti sebe:

        1. Každý hráč sa postupne snaží nakúpiť presne za zobrazenú sumu.

        2. Po nesprávnom nákupe okamžite prichádza na rad ďalší hráč - nemáš druhý pokus!

        3. Za každý správny nákup získavaš body (maximálne 5).

        4. Hra prebieha v 4 leveloch, každý hráč má jeden pokus v každom leveli.

        5. Na konci sa zobrazia výsledky a víťaz.

        6. S vyšším levelom sa zvyšuje obtiažnosť - budeš mať obmedzený počet kusov z každého produktu.

        Tip: Poriadne si premysli svoj nákup, pretože po chybe nemáš možnosť opravy!
    `,
    time: `
        V režime "Na čas" závodíš s časom:

        1. Tvojím cieľom je nakúpiť presne za zobrazenú sumu skôr, než vyprší časový limit.

        2. Začínaš s 60 sekundami, v každom ďalšom leveli získaš 5 sekúnd navyše.

        3. Za každý úspešný nákup dostávaš body:
           - Za každých 5 sekúnd zostávajúceho času dostaneš 1 bod (max. 10)
           - Plus body za aktuálny level

        4. Za nesprávny nákup strácaš 10 sekúnd a musíš to skúsiť znova.

        5. Ak čas vyprší, hra končí.

        Tip: Pracuj rýchlo, ale presne. Čím viac času ti zostane, tým viac bodov získaš!
    `
};

// Game states for different modes
const gameStates = {
    training: {
        cart: {},
        total: 0,
        target: 0
    },
    stars: {
        cart: {},
        total: 0,
        target: 0,
        level: 1,
        score: 0,
        mistakes: 0
    },
    duel: {
        cart: {},
        total: 0,
        target: 0,
        players: ['Hráč 1', 'Hráč 2'],
        currentPlayer: 0,
        playerScores: [0, 0],
        playerMistakes: [0, 0],
        level: 1
    },
    time: {
        cart: {},
        total: 0,
        target: 0,
        level: 1,
        score: 0,
        timeLeft: 60,
        timerInterval: null,
        timerActive: false
    }
};

// Current game mode
let currentMode = null;

// Sound elements
const soundClick = document.getElementById('sound-click');
const soundSuccess = document.getElementById('sound-success');
const soundError = document.getElementById('sound-error');

// Helper functions
function roundToTwo(num) {
    return Math.round(num * 100) / 100;
}

function playSound(sound) {
    try {
        sound.currentTime = 0;
        sound.play().catch(e => {
            console.log('Zvuk sa nepodarilo prehrať:', e);
        });
    } catch (e) {
        console.log('Chyba pri prehrávaní zvuku:', e);
    }
}

function showNotification(message, type = 'info', duration = 2000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

function showModal(title, content, buttons = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalTitle = document.createElement('div');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = title;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.textContent = content;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.className = btn.class || 'btn-primary';
        button.addEventListener('click', () => {
            overlay.remove();
            if (btn.callback) btn.callback();
        });
        buttonContainer.appendChild(button);
    });
    
    modal.appendChild(modalTitle);
    modal.appendChild(modalContent);
    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    return {
        close: () => overlay.remove()
    };
}

function showTutorial(mode) {
    showModal(
        `Návod - ${getTutorialTitle(mode)}`,
        tutorials[mode],
        [{
            text: 'Zavrieť',
            class: 'btn-primary'
        }]
    );
}

function getTutorialTitle(mode) {
    switch(mode) {
        case 'training': return 'Tréningový režim';
        case 'stars': return 'Na body';
        case 'duel': return 'Súboj';
        case 'time': return 'Na čas';
        default: return 'Návod';
    }
}

function generateTargetPrice() {
    // Generate possible sums with combinations of products
    const possibleSums = [];
    
    for (let a = 0; a <= 2; a++) {
        for (let b = 0; b <= 2; b++) {
            for (let c = 0; c <= 2; c++) {
                for (let d = 0; d <= 2; d++) {
                    for (let e = 0; e <= 2; e++) {
                        for (let f = 0; f <= 2; f++) {
                            const sum = roundToTwo(
                                a * products['Jablko'] +
                                b * products['Mlieko'] +
                                c * products['Chlieb'] +
                                d * products['Syr'] +
                                e * products['Jogurt'] +
                                f * products['Rohlík']
                            );
                            
                            if (sum >= 2.5 && sum <= 6.0) {
                                possibleSums.push(sum);
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Choose a random sum from possible sums
    return possibleSums[Math.floor(Math.random() * possibleSums.length)];
}

function getMaxAllowed(level) {
    if (level <= 2) return 2;
    return 1;
}

function populateProductContainer(containerId, mode) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(products).forEach(productName => {
        const product = document.createElement('div');
        product.className = 'product';
        
        const img = document.createElement('img');
        img.src = productImages[productName];
        img.alt = productName;
        
        const name = document.createElement('div');
        name.className = 'product-name';
        name.textContent = productName;
        
        const price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = `${products[productName].toFixed(2)} €`;
        
        const btn = document.createElement('button');
        btn.className = 'btn-primary';
        btn.textContent = 'Pridať';
        btn.addEventListener('click', () => addToCart(productName, mode));
        
        product.appendChild(img);
        product.appendChild(name);
        product.appendChild(price);
        product.appendChild(btn);
        
        container.appendChild(product);
    });
}

// Funkcia na pridanie produktu do košíka
function addToCart(productName, mode) {
    const state = gameStates[mode];
    
    // Ak ide o tréningový režim, nebudeme kontrolovať maximálny počet kusov
    if (mode !== 'training') {
        const maxAllowed = getMaxAllowed(state.level);
        if (state.cart[productName] >= maxAllowed) {
            showModal(
                "⚠️ Obmedzenie", 
                `Maximálny počet kusov z ${productName.toLowerCase()} je ${maxAllowed}.`,
                [{
                    text: 'OK',
                    class: 'btn-primary'
                }]
            );
            return;
        }
    }
    
    // Pridanie produktu do košíka
    if (!state.cart[productName]) {
        state.cart[productName] = 0;
    }
    state.cart[productName]++;
    
    // Aktualizácia celkovej sumy
    state.total = roundToTwo(state.total + products[productName]);
    
    // Prehranie zvuku
    playSound(soundClick);
    
    // Aktualizácia UI
    updateGameUI(mode);
}

// Funkcia na aktualizáciu herného rozhrania
function updateGameUI(mode) {
    const state = gameStates[mode];
    
    // Aktualizácia celkovej sumy
    const totalElement = document.getElementById(`${mode}-total`);
    if (totalElement) {
        totalElement.textContent = `Suma: ${state.total.toFixed(2)} €`;
    }
    
    // Aktualizácia obsahu košíka
    const cartElement = document.getElementById(`${mode}-cart`);
    if (cartElement) {
        if (Object.keys(state.cart).length === 0) {
            cartElement.textContent = 'Košík je prázdny.';
        } else {
            cartElement.innerHTML = '';
            
            Object.entries(state.cart).forEach(([product, count]) => {
                const item = document.createElement('div');
                item.textContent = `${product}: ${count}x`;
                cartElement.appendChild(item);
            });
        }
    }
    
    // Aktualizácia informácií na základe herného režimu
    if (mode === 'stars') {
        document.getElementById('stars-level').textContent = `Level: ${state.level}`;
        document.getElementById('stars-score').textContent = `Skóre: ${state.score}`;
        document.getElementById('stars-mistakes').textContent = `Chyby: ${state.mistakes}`;
        
        // Aktualizácia hviezdičiek
        const stars = Math.max(0, Math.min(5, 5 - state.mistakes));
        document.getElementById('stars-rating').innerHTML = 
            `<span class="star-rating">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span>`;
    }
    
    if (mode === 'duel') {
        document.getElementById('duel-player-info').textContent = 
            `${state.players[state.currentPlayer]} - Level ${state.level}`;
    }
    
    if (mode === 'time') {
        document.getElementById('time-level').textContent = `Level: ${state.level}`;
        document.getElementById('time-score').textContent = `Skóre: ${state.score}`;
        
        const timeCounter = document.getElementById('time-counter');
        timeCounter.textContent = `Čas: ${state.timeLeft}s`;
        
        // Zmena farby časovača podľa zostávajúceho času
        timeCounter.className = 'info-item time-counter';
        if (state.timeLeft <= 10) {
            timeCounter.classList.add('time-danger');
        } else if (state.timeLeft <= 20) {
            timeCounter.classList.add('time-warning');
        }
    }
}

// Kontrola nákupu v tréningovom režime
function checkTrainingPurchase() {
    const state = gameStates['training'];
    
    if (roundToTwo(state.total) === state.target) {
        playSound(soundSuccess);
        showModal(
            "✅ Správne", 
            `Trafili ste cieľ ${state.target.toFixed(2)} €.`,
            [{
                text: 'Nový cieľ',
                class: 'btn-success',
                callback: resetTrainingGame
            }]
        );
    } else {
        playSound(soundError);
        showModal(
            "❌ Nesprávne", 
            `Tvoja suma je ${state.total.toFixed(2)} €, cieľ bol ${state.target.toFixed(2)} €.`,
            [{
                text: 'Skúsiť znova',
                class: 'btn-primary'
            }]
        );
    }
}

// Kontrola nákupu v režime na body (hviezdičky)
function checkStarsPurchase() {
    const state = gameStates['stars'];
    
    if (roundToTwo(state.total) === state.target) {
        playSound(soundSuccess);
        
        // Výpočet získaných bodov (max 5, mínus počet chýb)
        const points = Math.max(0, 5 - state.mistakes);
        state.score += points;
        
        showModal(
            "✅ Správne!", 
            `Nakúpil si presne za ${state.target.toFixed(2)} €.\nZískavaš ${points} bodov.`,
            [{
                text: 'Ďalší level',
                class: 'btn-success',
                callback: () => startNextStarsLevel()
            }]
        );
    } else {
        playSound(soundError);
        state.mistakes++;
        
        updateGameUI('stars');
        
        const message = state.total > state.target 
            ? "❌ Prekročil si sumu!" 
            : "ℹ️ Ešte to nesedí. Skús znova.";
            
        showModal(
            "Chyba", 
            message,
            [{
                text: 'Skúsiť znova',
                class: 'btn-primary'
            }]
        );
    }
}

// Kontrola nákupu v režime súboj
function checkDuelPurchase() {
    const state = gameStates['duel'];
    const player = state.currentPlayer;
    
    if (roundToTwo(state.total) === state.target) {
        playSound(soundSuccess);
        
        // Získanie bodov (max 5)
        const points = 5 - state.playerMistakes[player];
        state.playerScores[player] += Math.max(0, points);
        
        showModal(
            "✅ Správne!", 
            `Nakúpil si presne za ${state.target.toFixed(2)} €.\nZískavaš ${Math.max(0, points)} bodov.`,
            [{
                text: 'Ďalej',
                class: 'btn-success',
                callback: nextDuelPlayer
            }]
        );
    } else {
        playSound(soundError);
        state.playerMistakes[player]++;
        
        showModal(
            "❌ Nesprávne", 
            `Tvoja suma: ${state.total.toFixed(2)} €, cieľ: ${state.target.toFixed(2)} €`,
            [{
                text: 'Ďalej',
                class: 'btn-primary',
                callback: nextDuelPlayer
            }]
        );
    }
}

// Kontrola nákupu v časovom režime
function checkTimePurchase() {
    const state = gameStates['time'];
    
    if (roundToTwo(state.total) === state.target) {
        // Zastavenie časovača
        state.timerActive = false;
        clearInterval(state.timerInterval);
        
        playSound(soundSuccess);
        
        // Výpočet bodov podľa zostávajúceho času a levelu
        const timePoints = Math.min(10, Math.floor(state.timeLeft / 5));
        const levelPoints = state.level;
        const totalPoints = timePoints + levelPoints;
        
        state.score += totalPoints;
        
        showModal(
            "✅ Správne!", 
            `Nakúpil si presne za ${state.target.toFixed(2)} €.\nZostávajúci čas: ${state.timeLeft} sekúnd\nZískavaš ${totalPoints} bodov!`,
            [{
                text: 'Ďalší level',
                class: 'btn-success',
                callback: startNextTimeLevel
            }]
        );
    } else {
        playSound(soundError);
        
        // Zastavenie časovača
        state.timerActive = false;
        clearInterval(state.timerInterval);
        
        // Penalizácia času
        state.timeLeft = Math.max(1, state.timeLeft - 10);
        
        const message = state.total > state.target 
            ? "Prekročil si sumu!" 
            : "Ešte to nesedí.";
            
        showModal(
            "❌ Nesprávne", 
            `${message}\nTvoja suma: ${state.total.toFixed(2)} €\nCieľ: ${state.target.toFixed(2)} €\nStratíš 10 sekúnd!`,
            [{
                text: 'Skúsiť znova',
                class: 'btn-primary',
                callback: () => {
                    resetCart('time');
                    startTimeTimer();
                }
            }]
        );
    }
}

// Funkcia na prechod na ďalšieho hráča v režime súboj
function nextDuelPlayer() {
    const state = gameStates['duel'];
    
    // Zmena hráča
    state.currentPlayer = 1 - state.currentPlayer;
    
    // Ak sa vrátime k prvému hráčovi, zvýšime level
    if (state.currentPlayer === 0) {
        state.level++;
    }
    
    // Kontrola konca hry
    if (state.level > 4) {
        showDuelResults();
    } else {
        resetCart('duel');
        state.target = generateTargetPrice();
        document.getElementById('duel-target').textContent = `Cieľ: Nakúp presne za ${state.target.toFixed(2)} €`;
        updateGameUI('duel');
    }
}

// Funkcia na zobrazenie výsledkov súboja
function showDuelResults() {
    const state = gameStates['duel'];
    
    const winner = state.playerScores[0] > state.playerScores[1] ? 0 : 
                  state.playerScores[1] > state.playerScores[0] ? 1 : -1;
                  
    const winnerText = winner === -1 ? "Remíza!" : 
                      `Víťaz: ${state.players[winner]}!`;
    
    showModal(
        "Výsledky súboja", 
        `${state.players[0]}: ${state.playerScores[0]} bodov\n${state.players[1]}: ${state.playerScores[1]} bodov\n\n${winnerText}`,
        [{
            text: 'Späť do menu',
            class: 'btn-primary',
            callback: returnToMenu
        }]
    );
}

// Funkcia na začatie časovača v režime na čas
function startTimeTimer() {
    const state = gameStates['time'];
    
    // Zastavenie existujúceho časovača, ak existuje
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    state.timerActive = true;
    
    // Aktualizácia UI
    updateGameUI('time');
    
    // Spustenie nového časovača
    state.timerInterval = setInterval(() => {
        if (state.timerActive) {
            state.timeLeft--;
            updateGameUI('time');
            
            // Kontrola vypršania času
            if (state.timeLeft <= 0) {
                clearInterval(state.timerInterval);
                state.timerActive = false;
                showTimeOutModal();
            }
        }
    }, 1000);
}

// Funkcia na zobrazenie modálneho okna pri vypršaní času
function showTimeOutModal() {
    const state = gameStates['time'];
    
    playSound(soundError);
    
    showModal(
        "⏰ Čas vypršal!", 
        `Nestihol si dokončiť nákup!\nTvoja suma bola ${state.total.toFixed(2)} €\nCieľ bol ${state.target.toFixed(2)} €`,
        [
            {
                text: 'Nová hra',
                class: 'btn-primary',
                callback: () => {
                    resetTimeGame();
                    startTimeTimer();
                }
            },
            {
                text: 'Menu',
                class: 'btn-gray',
                callback: returnToMenu
            }
        ]
    );
}

// Funkcia na prechod na ďalší level v režime na body
function startNextStarsLevel() {
    const state = gameStates['stars'];
    
    state.level++;
    state.mistakes = 0;
    state.cart = {};
    state.total = 0;
    state.target = generateTargetPrice();
    
    document.getElementById('stars-target').textContent = `Cieľ: Nakúp presne za ${state.target.toFixed(2)} €`;
    updateGameUI('stars');
}

// Funkcia na prechod na ďalší level v časovom režime
function startNextTimeLevel() {
    const state = gameStates['time'];
    
    state.level++;
    state.cart = {};
    state.total = 0;
    state.target = generateTargetPrice();
    state.timeLeft = 60 + (state.level - 1) * 5;
    
    document.getElementById('time-target').textContent = `Cieľ: Nakúp presne za ${state.target.toFixed(2)} €`;
    updateGameUI('time');
    
    startTimeTimer();
}

// Funkcia na reset košíka
function resetCart(mode) {
    const state = gameStates[mode];
    
    state.cart = {};
    state.total = 0;
    
    updateGameUI(mode);
}

// Funkcia na reset tréningovej hry
function resetTrainingGame() {
    const state = gameStates['training'];
    
    state.cart = {};
    state.total = 0;
    state.target = generateTargetPrice();
    
    document.getElementById('training-target').textContent = `Cieľ: Nakúp presne za ${state.target.toFixed(2)} €`;
    updateGameUI('training');
}

// Funkcia na reset hry s hviezdičkami
function resetStarsGame() {
    const state = gameStates['stars'];
    
    state.cart = {};
    state.total = 0;
    state.target = generateTargetPrice();
    state.level = 1;
    state.score = 0;
    state.mistakes = 0;
    
    document.getElementById('stars-target').textContent = `Cieľ: Nakúp presne za ${state.target.toFixed(2)} €`;
    updateGameUI('stars');
}

// Funkcia na reset súbojovej hry
function resetDuelGame() {
    const state = gameStates['duel'];
    
    state.cart = {};
    state.total = 0;
    state.target = generateTargetPrice();
    state.level = 1;
    state.currentPlayer = 0;
    state.playerScores = [0, 0];
    state.playerMistakes = [0, 0];
    
    document.getElementById('duel-target').textContent = `Cieľ: Nakúp presne za ${state.target.toFixed(2)} €`;
    updateGameUI('duel');
}

// Funkcia na reset časovej hry
function resetTimeGame() {
    const state = gameStates['time'];
    
    // Zastavenie časovača
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    state.cart = {};
    state.total = 0;
    state.target = generateTargetPrice();
    state.level = 1;
    state.score = 0;
    state.timeLeft = 60;
    state.timerActive = false;
    
    document.getElementById('time-target').textContent = `Cieľ: Nakúp presne za ${state.target.toFixed(2)} €`;
    updateGameUI('time');
}

// Funkcia na začatie hry
function startGame(mode) {
    currentMode = mode;
    
    // Skrytie menu
    document.getElementById('menu-screen').style.display = 'none';
    
    // Ak ide o súboj, zobrazíme najprv formulár pre hráčov
    if (mode === 'duel') {
        document.getElementById('duel-form').style.display = 'block';
        return;
    }
    
    // Zobrazenie príslušného herného režimu
    document.getElementById(`${mode}-screen`).style.display = 'block';
    
    // Naplnenie produktov
    populateProductContainer(`${mode}-products`, mode);
    
    // Inicializácia hry podľa režimu
    if (mode === 'training') {
        resetTrainingGame();
    } else if (mode === 'stars') {
        resetStarsGame();
    } else if (mode === 'time') {
        resetTimeGame();
        startTimeTimer();
    }
    
    // Pripojenie event listenerov pre tlačidlá pomoci
    document.querySelectorAll(`#${mode}-screen .help-button`).forEach(btn => {
        btn.addEventListener('click', () => showTutorial(mode));
    });
}

// Funkcia na začatie súbojovej hry
function startDuelGame() {
    document.getElementById('duel-form').style.display = 'none';
    document.getElementById('duel-screen').style.display = 'block';
    
    // Získanie mien hráčov
    const player1 = document.getElementById('player1-name').value.trim() || 'Hráč 1';
    const player2 = document.getElementById('player2-name').value.trim() || 'Hráč 2';
    
    // Nastavenie hry
    const state = gameStates['duel'];
    state.players = [player1, player2];
    
    // Reset hry
    resetDuelGame();
    
    // Naplnenie produktov
    populateProductContainer('duel-products', 'duel');
    
    // Pripojenie event listenera pre tlačidlo pomoci
    document.querySelector('#duel-screen .help-button').addEventListener('click', () => showTutorial('duel'));
}

// Funkcia na návrat do menu
function returnToMenu() {
    // Skrytie všetkých obrazoviek
    document.getElementById('training-screen').style.display = 'none';
    document.getElementById('stars-screen').style.display = 'none';
    document.getElementById('duel-screen').style.display = 'none';
    document.getElementById('duel-form').style.display = 'none';
    document.getElementById('time-screen').style.display = 'none';
    
    // Zobrazenie menu
    document.getElementById('menu-screen').style.display = 'block';
    
    // Ak ide o časový režim, zastavíme časovač
    if (currentMode === 'time') {
        const state = gameStates['time'];
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerActive = false;
        }
    }
    
    currentMode = null;
}

// Pridanie event listenerov pre tlačidlá v menu
document.getElementById('btn-training').addEventListener('click', () => startGame('training'));
document.getElementById('btn-stars').addEventListener('click', () => startGame('stars'));
document.getElementById('btn-duel').addEventListener('click', () => startGame('duel'));
document.getElementById('btn-time').addEventListener('click', () => startGame('time'));
document.getElementById('btn-exit').addEventListener('click', () => {
    if (confirm('Naozaj chcete ukončiť hru?')) {
        window.close();
    }
});

// Pridanie event listenerov pre tlačidlá v hre
document.getElementById('training-check').addEventListener('click', checkTrainingPurchase);
document.getElementById('training-reset').addEventListener('click', () => resetCart('training'));
document.getElementById('training-back').addEventListener('click', returnToMenu);

document.getElementById('stars-check').addEventListener('click', checkStarsPurchase);
document.getElementById('stars-reset').addEventListener('click', () => resetCart('stars'));
document.getElementById('stars-back').addEventListener('click', returnToMenu);

document.getElementById('duel-check').addEventListener('click', checkDuelPurchase);
document.getElementById('duel-reset').addEventListener('click', () => resetCart('duel'));
document.getElementById('duel-back').addEventListener('click', returnToMenu);

document.getElementById('time-check').addEventListener('click', checkTimePurchase);
document.getElementById('time-reset').addEventListener('click', () => resetCart('time'));
document.getElementById('time-back').addEventListener('click', returnToMenu);

// Event listenery pre formulár súboja
document.getElementById('duel-start').addEventListener('click', startDuelGame);
document.getElementById('duel-form-back').addEventListener('click', returnToMenu);
document.querySelector('#duel-form .help-button').addEventListener('click', () => showTutorial('duel'));