import {Core} from "../../core";

import json1 from 'assets/mock/1.json';
import json2 from 'assets/mock/2.json';
import json3 from 'assets/mock/3.json';

import {WinScreen} from "../../components/win-screen/win-screen";
import {Helper} from "../helper";

export class Main extends Core {
    constructor() {
        super();
        this.helper = new Helper();
        this.wordsList = [ json1.words, json2.words, json3.words ];
        this.currentWordIndex = 0; // Индекс текущего слова
        this.guessedWords = []; // Массив угаданных слов
        this.level = 0; // Текущий уровень
        this.newIsTouchDevice = false;
        this.isDrawing = false;
    }

    render() {
        document.body.innerHTML = this.getMainHtml();
        this.currentWordIndex = 0;

        this.setupRing(); // Отрисовываем первое слово
        this.setupListeners();
    }

    getWordsForLevel(level) {
        // Уровень 1 - 0, Уровень 2 - 1, Уровень 3 - 2 и так далее
        const index = (level - 1) % 3; // Получаем индекс для массива
        return this.wordsList[index]; // Возвращаем соответствующий массив слов
    }

    getMainHtml() {
        const wordsForLevel = this.getWordsForLevel(this.level + 1);
        const shortWords = this.helper.getWordsByLength(wordsForLevel).shortWords;
        const longWords = this.helper.getWordsByLength(wordsForLevel).longWords;

        return `
        <div class="page">
            <div class="page-title">
                <span class="page-title_text">Уровень ${this.level + 1}</span>
            </div>
            <div class="page-content">
                ${this.getContentItemsHtml(shortWords)} 
            </div>
            <div class="page-content_block">
                ${this.getLongWordsHtml(longWords)} 
            </div>
            <div class="page-content_min" style="display: none;">
                <div class="page-content_min__item"></div>
            </div>
            <div class="page-ring_container">
                <svg class="line-visualization" width="294" height="294">
                    <path class="line" fill="none" stroke="blue" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <div class="page-ring_container__item"></div>
            </div>
        </div>
    `;
    }

    getLongWordsHtml(words) {
        let itemsHtml = '';

        words.forEach(word => {
            const count = word.length; // Длина текущего слова

            // Добавляем ячейки для букв слова (5 ячеек для длинных слов)
            for (let i = 0; i < 5; i++) {
                itemsHtml += `
                    <div class="page-content_block__item">
                        <span class="page-content_block__item__text"></span>
                    </div>
                `;
            }
        });

        return itemsHtml;
    }

    getContentItemsHtml(words) {
        let itemsHtml = '';

        words.forEach(word => {
            const count = word.length; // Длина текущего слова

            // Добавляем ячейки для букв слова
            for (let i = 0; i < count; i++) {
                itemsHtml += `
            <div class="page-content_item">
                <span class="page-content_item__text"></span>
            </div>
        `;
            }

            // Добавляем пустую ячейку, если слово состоит из 3 букв
            if (count === 3) {
                itemsHtml += `
            <div class="page-content_item">
                <span class="page-content_item__text"></span>
            </div>
        `;
            }
        });

        return itemsHtml;
    }

    setupRing() {
        const wordsForLevel = this.getWordsForLevel(this.level + 1);
        const shortWords = this.helper.getWordsByLength(wordsForLevel).shortWords;
        const longWords = this.helper.getWordsByLength(wordsForLevel).longWords;

        // Объединяем массивы в нужном порядке
        const orderedWords = [...shortWords, ...longWords];

        // Получаем текущее слово из нового массива
        const currentWord = orderedWords[this.currentWordIndex];
        const lettersCount = currentWord.split(''); // Получаем массив букв текущего слова
        const container = document.querySelector('.page-ring_container__item');

        // Удаляем предыдущие буквы, если они есть
        container.innerHTML = '';

        // Получаем размеры контейнера и находим центр
        const containerWidth = container.offsetWidth; // Ширина контейнера
        const containerHeight = container.offsetHeight; // Высота контейнера
        const centerX = containerWidth / 2; // Центр по X
        const centerY = containerHeight / 2; // Центр по Y

        // Увеличиваем радиус
        const extraRadius = 50;
        const radius = (Math.min(containerWidth, containerHeight) / 2) - (89.94 / 2) + extraRadius; // Радиус для кнопок

        // Создаем кнопки для каждой буквы текущего слова
        lettersCount.forEach((letter, index) => {
            const circle = document.createElement('div');
            circle.className = `page-ring_container__circle`;

            // Угол для равномерного распределения
            let angle = (360 / lettersCount.length) * index;

            // Изменяем угол для слов из 3 и 5 букв
            if (lettersCount.length === 3) {
                angle += 30; // Поворачиваем на 30 градусов
            } else if (lettersCount.length === 5) {
                angle += 55; // Поворачиваем на 55 градусов
            }

            // Рассчитываем положение кнопок относительно центра
            const x = centerX + radius * Math.cos((angle * Math.PI) / 180) - (89.94 / 2); // Положение по X
            const y = centerY + radius * Math.sin((angle * Math.PI) / 180) - (89.94 / 2); // Положение по Y

            circle.style.left = `${x}px`; // Устанавливаем координату X
            circle.style.top = `${y}px`; // Устанавливаем координату Y

            // Устанавливаем размеры и другие стили
            circle.style.width = '89.94px';
            circle.style.height = '89.94px';

            circle.innerHTML = `<span class="page-ring_container__circle-text">${letter}</span>`;
            circle.dataset.letter = letter; // Храним букву в data-атрибуте
            container.appendChild(circle); // Добавляем кнопку в контейнер
        });
    }

    setupListeners() {
        const letters = document.querySelectorAll('.page-ring_container__circle');

        if (!this.isMobile) {
            this.setupMouseListeners(letters);
        } else {
            this.setupTouchListeners(letters);
        }
    }

    setupMouseListeners(letters) {
        letters.forEach(letter => {
            letter.addEventListener('mousedown', (event) => {
                this.startSelection(event, letter);
                this.startDrawing(event, false); // Начинаем рисование
            });
            letter.addEventListener('mouseover', (event) => this.selectLetter(event, letter));
            letter.addEventListener('mouseup', () => {
                this.endSelection();
                this.endDrawing(); // Завершение рисования
            });
        });
        document.addEventListener('mousemove', (event) => {
            if (this.isDrawing) {
                this.helper.drawLine(event, false); // Рисуем линию, если происходит рисование
            }
        });
    }

    setupTouchListeners(letters) {
        let activeLetters = [];

        letters.forEach(letter => {
            letter.addEventListener('touchstart', (event) => {
                event.preventDefault();
                this.startSelection(event, letter);
                this.startDrawing(event, true);
                activeLetters.push(letter); // Добавляем букву в активные
                letter.classList.add('active'); // Добавляем класс active
            });

            letter.addEventListener('touchmove', (event) => {
                event.preventDefault();
                const touch = event.touches[0];

                letters.forEach(l => {
                    const rect = l.getBoundingClientRect();
                    if (
                        touch.clientX >= rect.left &&
                        touch.clientX <= rect.right &&
                        touch.clientY >= rect.top &&
                        touch.clientY <= rect.bottom
                    ) {
                        if (!activeLetters.includes(l)) {
                            activeLetters.push(l); // Добавляем новую активную букву
                            l.classList.add('active'); // Добавляем класс active
                        }
                        this.selectLetter(event, l);
                    }
                });
            });

            letter.addEventListener('touchend', () => {
                this.endSelection();
                this.endDrawing();
                activeLetters.forEach(l => l.classList.remove('active')); // Убираем класс active у всех активных букв
                activeLetters = []; // Сбрасываем массив активных букв
            });
        });

        document.addEventListener('touchmove', (event) => {
            if (this.isDrawing) {
                event.preventDefault();
                this.helper.drawLine(event, true);
            }
        }, { passive: false });
    }

    startDrawing(event, isTouch) {
        this.isDrawing = true; // Устанавливаем флаг рисования в true
        this.helper.clearLine(); // Очищаем предыдущую линию
        this.helper.drawLine(event, isTouch); // Начинаем рисовать с текущей позиции мыши
    }

    endDrawing() {
        this.isDrawing = false; // Устанавливаем флаг рисования в false
    }

    startSelection(event, letter) {
        const rect = letter.getBoundingClientRect();
        const coordinates = {
            x: rect.left + window.scrollX + rect.width / 2,
            y: rect.top + window.scrollY + rect.height / 2
        };

        // Сброс состояния
        this.helper.currentWord = '';
        this.helper.selectedLetters = [];
        this.helper.selectedCoordinates = []; // Сброс координат

        // Добавляем первую букву
        this.addLetter(letter.dataset.letter, coordinates);
        letter.classList.add('active');
        this.helper.showMinDisplay(); // Показываем блок для выбранных букв
    }

    selectLetter(event, letter) {
        const rect = letter.getBoundingClientRect();
        const coordinates = {
            x: rect.left + window.scrollX + rect.width / 2, // Центрируем по горизонтали
            y: rect.top + window.scrollY + rect.height / 2 // Центрируем по вертикали
        };

        // Проверяем, что текущее слово не пустое
        if (this.helper.currentWord !== '') {
            this.addLetter(letter.dataset.letter, coordinates); // Передаем букву и координаты
            letter.classList.add('active'); // Добавляем класс active
        }
    }

    endSelection() {
        if (this.helper.currentWord !== '') {
            this.checkWord(); // Проверяем слово
            this.resetSelection(); // Сбросить выбор после проверки слова
            this.helper.clearLine();
        }
    }

    addLetter(letter, coordinates) { // Обратите внимание на параметры
        const { x, y } = coordinates; // Деструктуризация координат

        const alreadyAdded = this.helper.selectedLetters.some((selectedLetter, index) => {
            return selectedLetter === letter &&
                this.helper.selectedCoordinates[index].x === x &&
                this.helper.selectedCoordinates[index].y === y;
        });

        if (alreadyAdded) {
            return;
        }

        this.helper.selectedLetters.push(letter);
        this.helper.selectedCoordinates.push({ x, y }); // Сохраняем координаты
        this.helper.currentWord += letter;

        this.helper.updateMinDisplay();
    }

    checkWord() {
        const validWords = this.wordsList[this.level % 3];
        const currentWord = this.helper.currentWord;

        if (validWords.includes(currentWord) && !this.guessedWords.includes(currentWord)) {
            this.helper.displayWord();
            this.guessedWords.push(currentWord);
            this.currentWordIndex++;
            this.saveState(); // Сохраняем состояние после угаданного слова

            if (this.currentWordIndex < validWords.length) {
                this.setupRing();
            } else {
                this.level++;
                this.currentWordIndex = 0;
                this.guessedWords = [];
                this.saveState(); // Сохраняем состояние перед завершением уровня
                this.endGame();
            }
        }
    }

    resetSelection() {
        this.helper.currentWord = ''; // Сбрасываем текущее слово
        this.helper.selectedLetters = []; // Сбрасываем выбранные буквы
        this.helper.updateMinDisplay(); // Обновляем отображение выбранных букв
        this.helper.clearActiveLetters(); // Убираем класс active
        this.helper.hideMinDisplay(); // Скрываем блок для выбранных букв
        this.setupListeners(); // Устанавливаем слушатели заново
    }

    endGame() {
        this.isGameActive = false;
        const winScreen = new WinScreen(this.level); // Передаем текущий уровень
        winScreen.render();
    }

    startLevel(level) {
        this.level = level; // Устанавливаем уровень (1, 2, 3 для уровней 1, 2, 3)
        this.currentWordIndex = 0;
        this.guessedWords = [];
        this.saveState();
        this.render(); // Рендерим уровень
    }

    loadState(state) {
        this.level = state.level || 1; // Уровень должен быть 1 по умолчанию
        this.guessedWords = state.guessedWords || [];
        this.currentWordIndex = state.currentWordIndex || 0;
    }

    saveState() {
        const gameState = {
            level: this.level,
            guessedWords: this.guessedWords,
            currentWordIndex: this.currentWordIndex
        };
        localStorage.setItem('game_state', JSON.stringify(gameState));
    }
}