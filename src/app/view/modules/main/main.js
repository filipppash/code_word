import {Core} from "../../core";

import json1 from 'assets/mock/1.json';
import json2 from 'assets/mock/2.json';
import json3 from 'assets/mock/3.json';

import {WinScreen} from "../../components/win-screen/win-screen";

export class Main extends Core {
    constructor() {
        super();
        this.wordsList = [ json1.words, json2.words, json3.words ];
        this.currentWord = '';
        this.selectedLetters = [];
        this.minVisible = false; // Флаг видимости блока для выбранных букв
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
        const shortWords = this.getWordsByLength().shortWords;
        const longWords = this.getWordsByLength().longWords;

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
        const shortWords = this.getWordsByLength().shortWords;
        const longWords = this.getWordsByLength().longWords;

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
            const { angle, translateX } = this.getAngleAndTranslateX(radius, lettersCount.length, index);

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

    getAngleAndTranslateX(radius, length, index) {
        let angle;
        let translateX = radius; // Изначально задаем радиус

        if (length === 3) {
            angle = this.getAngleForThree(index);
        } else if (length === 4) {
            angle = (360 / length) * index; // Для 4 букв (оставляем как есть, равномерно)
        } else if (length === 5) {
            angle = this.getAngleForFive(index);
            if (index === 1) {
                translateX = 150; // Для второй буквы устанавливаем 150
            }
        }

        return { angle, translateX };
    }

    getAngleForThree(index) {
        switch (index) {
            case 0:
                return 270;
            case 1:
                return 0;
            case 2:
                return 180;
            default:
                return null; // Возвращаем null, если индекс не верный
        }
    }

    getAngleForFive(index) {
        switch (index) {
            case 0:
                return 270;
            case 1:
                return 19; // Угол для второй буквы
            case 2:
                return 50;
            case 3:
                return 130;
            case 4:
                return 200;
            default:
                return null; // Возвращаем null, если индекс не верный
        }
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
                this.drawLine(event); // Рисуем линию, если происходит рисование
            }
        });
    }

    startDrawing(event) {
        this.isDrawing = true; // Устанавливаем флаг рисования в true
        this.clearLine(); // Очищаем предыдущую линию
        this.drawLine(event); // Начинаем рисовать с текущей позиции мыши
    }

    endDrawing() {
        this.isDrawing = false; // Устанавливаем флаг рисования в false
    }

    clearLine() {
        const linePath = document.querySelector('.line-visualization .line');

        if (linePath) {
            linePath.setAttribute('d', ''); // Очищаем линию
        }
    }

    startSelection(event, letter) {
        this.currentWord = ''; // Сбрасываем текущее слово
        this.selectedLetters = []; // Сбрасываем выбранные буквы
        this.addLetter(letter.dataset.letter); // Добавляем букву
        letter.classList.add('active'); // Добавляем класс active
        this.showMinDisplay(); // Показываем блок для выбранных букв
        event.preventDefault();
    }

    showMinDisplay() {
        const minContainer = document.querySelector('.page-content_min');
        minContainer.style.display = 'flex'; // Показываем блок для выбранных букв
        this.minVisible = true; // Устанавливаем флаг видимости
    }

    selectLetter(event, letter) {
        if (this.currentWord !== '') { // Проверяем, что текущее слово не пустое
            this.addLetter(letter.dataset.letter); // Добавляем букву
            letter.classList.add('active'); // Добавляем класс active
        }
    }

    endSelection() {
        if (this.currentWord !== '') {
            this.checkWord(); // Проверяем слово
            this.resetSelection(); // Сбросить выбор после проверки слова
            this.clearLine();
        }
    }

    addLetter(letter) {
        const shortWords = this.getWordsByLength().shortWords;
        const longWords = this.getWordsByLength().longWords;

        // Объединяем массивы в нужном порядке
        const orderedWords = [...shortWords, ...longWords];
        const currentWordToGuess = orderedWords[this.currentWordIndex]; // Получаем текущее слово из нового массива
        const requiredCount = currentWordToGuess.split('').filter(l => l === letter).length;
        const currentCount = this.selectedLetters.filter(l => l === letter).length;

        // Проверяем, если текущее количество буквы меньше требуемого
        if (currentCount < requiredCount) {
            this.selectedLetters.push(letter); // Добавляем букву
            this.currentWord += letter; // Обновляем текущее слово
            this.updateMinDisplay(); // Обновляем отображение выбранных букв
        }
    }

    checkWord() {
        const validWords = this.wordsList[this.level % 3];
        if (validWords.includes(this.currentWord) && !this.guessedWords.includes(this.currentWord)) {
            this.displayWord();
            this.guessedWords.push(this.currentWord);
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

    displayWord() {
        const activeItems = document.querySelectorAll('.page-content_item, .page-content_block__item');
        const charArray = this.currentWord.split(''); // Разбиваем текущее слово на буквы
        let filledCount = 0; // Счетчик заполненных букв

        // Перебираем все ячейки
        for (let i = 0; i < activeItems.length; i++) {
            // Проверяем, что ячейка пустая и не имеет класса active
            if (!activeItems[i].classList.contains('active') && activeItems[i].querySelector('.page-content_item__text, .page-content_block__item__text').innerText === '') {
                if (filledCount < charArray.length) {
                    // Заполняем ячейку буквой
                    activeItems[i].classList.add('active'); // Добавляем класс active
                    const textElement = activeItems[i].querySelector('.page-content_item__text, .page-content_block__item__text');
                    if (textElement) {
                        textElement.innerText = charArray[filledCount]; // Заполняем буквой
                    }
                    filledCount++; // Увеличиваем счетчик
                }
            }
        }

        // Если слово состоит из 3-х букв, добавляем класс active для последней ячейки
        if (charArray.length === 3 && filledCount === 3) {
            for (let i = 0; i < activeItems.length; i++) {
                // Находим первую незаполненную ячейку
                if (!activeItems[i].classList.contains('active')) {
                    activeItems[i].classList.add('active'); // Добавляем класс active
                    break; // Выходим из цикла после добавления
                }
            }
        }
    }

    resetSelection() {
        this.currentWord = ''; // Сбрасываем текущее слово
        this.selectedLetters = []; // Сбрасываем выбранные буквы
        this.updateMinDisplay(); // Обновляем отображение выбранных букв
        this.clearActiveLetters(); // Убираем класс active
        this.hideMinDisplay(); // Скрываем блок для выбранных букв
        this.setupListeners(); // Устанавливаем слушатели заново
    }

    hideMinDisplay() {
        const minContainer = document.querySelector('.page-content_min');
        if (!minContainer) {
            return;
        }

        minContainer.style.display = 'none'; // Скрываем блок для выбранных букв
        this.minVisible = false; // Сбрасываем флаг видимости
    }

    clearActiveLetters() {
        const letters = document.querySelectorAll('.page-ring_container__circle');
        letters.forEach(letter => letter.classList.remove('active'));
    }

    updateMinDisplay() {
        const minContainer = document.querySelector('.page-content_min');
        if (!minContainer) {
            return; // Выход из функции, если элемент не найден
        }

        minContainer.innerHTML = ''; // Очищаем контейнер для букв

        for (const letter of this.selectedLetters) {
            const item = document.createElement('div');
            item.className = 'page-content_min__item';
            item.innerHTML = `<span class="page-content_min__item-text">${letter}</span>`;
            minContainer.appendChild(item); // Обновляем отображение выбранных букв
        }
    }

    getWordsByLength() {
        const wordsForLevel = this.getWordsForLevel(this.level + 1);

        const shortWords = [];
        const longWords = [];

        wordsForLevel.forEach(word => {
            if (word.length > 4) {
                longWords.push(word);
            } else {
                shortWords.push(word);
            }
        });

        return { shortWords, longWords };
    }

    drawLine(event) {
        const linePath = document.querySelector('.line-visualization .line');
        const containerRect = document.querySelector('.page-ring_container').getBoundingClientRect();

        // Получаем координаты мыши относительно контейнера
        const x = event.clientX - containerRect.left;
        const y = event.clientY - containerRect.top;

        const currentPath = linePath.getAttribute('d') || ''; // Получаем текущий путь
        const newPath = currentPath + (currentPath ? ` L ${x} ${y}` : ` M ${x} ${y}`); // Добавляем новую точку

        linePath.setAttribute('d', newPath); // Обновляем атрибут d
        linePath.setAttribute('stroke-linecap', 'round'); // Скругление концов
        linePath.setAttribute('stroke-linejoin', 'round'); // Скругление углов
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
        this.render(); // Рендерим после загрузки состояния
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