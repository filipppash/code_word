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

        // Радиус круга для размещения букв (внутри кольца)
        const radius = 150;

        // Создаем кнопки для каждой буквы текущего слова
        lettersCount.forEach((letter, index) => {
            const circle = document.createElement('div');
            circle.className = `page-ring_container__circle`;

            // Получаем угол и радиус
            const { angle, translateX } = this.helper.getAngleAndTranslateX(radius, lettersCount.length, index);

            // Проверяем, что угол не равен null
            if (angle === null) return;

            // Задаем трансформацию
            circle.style.position = 'absolute';

            if (lettersCount.length === 5 && index === 1) {
                // Инвертированная трансформация для второй буквы
                circle.style.transform = `rotate(-${angle}deg) translate(${translateX}px) rotate(${angle}deg)`;
            } else {
                // Обычная трансформация для остальных букв
                circle.style.transform = `rotate(${angle}deg) translate(${translateX}px) rotate(-${angle}deg)`;
            }

            // Устанавливаем размеры и другие стили
            circle.style.width = '89.94px';
            circle.style.height = '89.94px';

            circle.innerHTML = `<span class="page-ring_container__circle-text">${letter}</span>`;
            circle.dataset.letter = letter; // Храним букву в data-атрибуте
            container.appendChild(circle);
        });
    }

    setupListeners() {
        const letters = document.querySelectorAll('.page-ring_container__circle');
        letters.forEach(letter => {
            letter.addEventListener('mousedown', (event) => {
                this.startSelection(event, letter);
                this.startDrawing(event); // Начинаем рисование
            });
            letter.addEventListener('mouseover', (event) => this.selectLetter(event, letter));
            letter.addEventListener('mouseup', () => {
                this.endSelection();
                this.endDrawing(); // Завершение рисования
            });
        });
        document.addEventListener('mousemove', (event) => {
            if (this.isDrawing) {
                this.helper.drawLine(event); // Рисуем линию, если происходит рисование
            }
        });
    }

    startDrawing(event) {
        this.isDrawing = true; // Устанавливаем флаг рисования в true
        this.helper.clearLine(); // Очищаем предыдущую линию
        this.helper.drawLine(event); // Начинаем рисовать с текущей позиции мыши
    }

    endDrawing() {
        this.isDrawing = false; // Устанавливаем флаг рисования в false
    }

    startSelection(event, letter) {
        this.helper.currentWord = ''; // Сбрасываем текущее слово
        this.helper.selectedLetters = []; // Сбрасываем выбранные буквы
        this.addLetter(letter.dataset.letter); // Добавляем букву
        letter.classList.add('active'); // Добавляем класс active
        this.helper.showMinDisplay(); // Показываем блок для выбранных букв
        event.preventDefault();
    }
    selectLetter(event, letter) {
        if (this.helper.currentWord !== '') { // Проверяем, что текущее слово не пустое
            this.addLetter(letter.dataset.letter); // Добавляем букву
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

    addLetter(letter) {
        const wordsForLevel = this.getWordsForLevel(this.level + 1);
        const shortWords = this.helper.getWordsByLength(wordsForLevel).shortWords;
        const longWords = this.helper.getWordsByLength(wordsForLevel).longWords;

        // Объединяем массивы в нужном порядке
        const orderedWords = [...shortWords, ...longWords];
        const currentWordToGuess = orderedWords[this.currentWordIndex]; // Получаем текущее слово из нового массива
        const requiredCount = currentWordToGuess.split('').filter(l => l === letter).length;
        const currentCount = this.helper.selectedLetters.filter(l => l === letter).length;

        // Проверяем, если текущее количество буквы меньше требуемого
        if (currentCount < requiredCount) {
            this.helper.selectedLetters.push(letter); // Добавляем букву
            this.helper.currentWord += letter; // Обновляем текущее слово
            this.helper.updateMinDisplay(); // Обновляем отображение выбранных букв
        }
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