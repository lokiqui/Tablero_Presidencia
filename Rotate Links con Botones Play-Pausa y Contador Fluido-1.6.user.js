// ==UserScript==
// @name         Rotate Links con Botones Play/Pausa y Contador Fluido
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Rotar enlaces con opción de pausa y reanudación mediante botones visibles, con contador de tiempo fluido.
// @author       Tú
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/lokiqui/Tablero_Presidencia/main/rotate-links.user.js
// @downloadURL  https://raw.githubusercontent.com/lokiqui/Tablero_Presidencia/main/rotate-links.user.js
// ==/UserScript==
(function() {
    'use strict';

    const links = [
        "https://app.powerbi.com/groups/1c63bf60-4443-4c91-91e1-4b56098b309d/reports/f86773a1-278c-4bba-8b91-6f95b806f073/ReportSection1554dd7e053a66979e0b?experience=power-bi&chromeless=true",
        "https://app.powerbi.com/groups/1c63bf60-4443-4c91-91e1-4b56098b309d/reports/f86773a1-278c-4bba-8b91-6f95b806f073/ReportSection770011af8ecda9a8b3eb?experience=power-bi&chromeless=true",
        "https://app.powerbi.com/groups/1c63bf60-4443-4c91-91e1-4b56098b309d/reports/f86773a1-278c-4bba-8b91-6f95b806f073/ReportSectionf9fe292b4b0b2244a793?experience=power-bi&chromeless=true",
        "https://app.powerbi.com/groups/1c63bf60-4443-4c91-91e1-4b56098b309d/reports/f86773a1-278c-4bba-8b91-6f95b806f073/ReportSection7b34db0f300b875c8c1b?experience=power-bi&chromeless=true"
    ]; // URLs permitidas

    // Verificar si la URL actual está en la lista de URLs permitidas
    const currentUrl = window.location.href;

    if (!links.includes(currentUrl)) {
        console.log("Este script no se ejecuta en esta página.");
        return; // Salir si la URL no está permitida
    }

    // Configuración del tiempo (modificable)
    const rotationTime = {
        seconds: 0,
        minutes: 5,
        hours: 0
    };

    // Calcula el tiempo total en milisegundos
    const delay = (rotationTime.seconds || 0) * 1000 +
                  (rotationTime.minutes || 0) * 60 * 1000 +
                  (rotationTime.hours || 0) * 60 * 60 * 1000;

    if (delay <= 0) {
        console.error("Tiempo de rotación no válido. Configura un valor mayor que cero.");
        return;
    }

    let index = parseInt(localStorage.getItem('rotateIndex'), 10) || 0;
    let timer = null;
    let paused = false;
    let remainingTime = delay;
    let lastPausedTime = 0;
    let startTime = 0;

    function startTimer() {
        paused = false;
        setButtonActive(resumeButton, stopButton);

        if (lastPausedTime > 0) {
            startTime = Date.now() - (delay - lastPausedTime);
        } else {
            startTime = Date.now();
        }

        updateTimerDisplay();

        timer = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            remainingTime = delay - elapsedTime;

            if (remainingTime <= 0) {
                clearInterval(timer);
                index = (index + 1) % links.length;
                localStorage.setItem('rotateIndex', index);
                window.location.href = links[index];
                startTimer();
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }

    function stopTimer() {
        paused = true;
        setButtonActive(stopButton, resumeButton);
        clearInterval(timer);
        lastPausedTime = remainingTime;
        updateTimerDisplay();
    }

    function setButtonActive(activeButton, inactiveButton) {
        activeButton.style.backgroundColor = '#0056b3';
        activeButton.style.color = '#fff';
        inactiveButton.style.backgroundColor = '#0078d7';
        inactiveButton.style.color = '#e0e0e0';
    }

    function updateTimerDisplay() {
        const secondsLeft = Math.max(Math.floor(remainingTime / 1000), 0);
        const minutesLeft = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;

        timerDisplay.textContent = `${String(minutesLeft).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.padding = '15px 30px';
        button.style.background = '#0078d7';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.borderRadius = '5px';
        button.style.fontSize = '16px';
        button.style.margin = '0 10px';
        button.style.transition = 'background 0.3s, transform 0.2s';

        button.addEventListener('mouseover', () => {
            if (button.style.backgroundColor !== '#0056b3') {
                button.style.backgroundColor = '#0057c7';
            }
        });
        button.addEventListener('mouseout', () => {
            if (button.style.backgroundColor !== '#0056b3') {
                button.style.backgroundColor = '#0078d7';
            }
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });

        button.addEventListener('click', onClick);
        return button;
    }

    function createButtonContainer() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        document.body.appendChild(container);
        return container;
    }

    function createTimerContainer() {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.left = '20px';
        container.style.zIndex = '9999';
        container.style.fontSize = '20px';
        container.style.color = '#333';
        container.style.fontWeight = 'bold';
        document.body.appendChild(container);
        return container;
    }

    const container = createButtonContainer();
    const timerContainer = createTimerContainer();

    const stopButton = createButton('Detener', () => {
        if (!paused) {
            stopTimer();
            console.log('Temporizador detenido');
        }
    });

    const resumeButton = createButton('Reanudar', () => {
        if (paused) {
            startTimer();
            console.log('Temporizador reanudado');
        }
    });

    container.appendChild(resumeButton);
    container.appendChild(stopButton);

    const timerDisplay = document.createElement('div');
    timerContainer.appendChild(timerDisplay);

    setButtonActive(resumeButton, stopButton);
    startTimer();

})();
