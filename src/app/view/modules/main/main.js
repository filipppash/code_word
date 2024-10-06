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
        return `
            <div class="page">
                <div class="page-title">
                    <span class="page-title_text">Уровень ${ this.level + 1 }</span>
                </div>
                <div class="page-content">
                    ${this.getContentItemsHtml(16)} <!-- Создаем 16 пустых элементов для страницы -->
                </div>
                <div class="page-content_min" style="display: none;">
                    <div class="page-content_min__item"></div>
                </div>
                <div class="page-ring_container">
                    <div class="page-ring_container__item"></div>
                </div>
            </div>
        `;
    }

    getContentItemsHtml(count) {
        let itemsHtml = '';
        for (let i = 0; i < count; i++) {
            itemsHtml += `
                <div class="page-content_item">
                    <span class="page-content_item__text"></span>
                </div>
            `;
        }
        return itemsHtml;
    }

    setupRing() {
        const wordsForLevel = this.getWordsForLevel(this.level + 1);
        const currentWord = wordsForLevel[this.currentWordIndex]; // Получаем текущее слово из массива
        const lettersCount = currentWord.split(''); // Получаем массив букв текущего слова
        const container = document.querySelector('.page-ring_container__item');

        // Удаляем предыдущие буквы, если они есть
        container.innerHTML = '';

        // Радиус круга для размещения букв (внутри кольца)
        const radius = 150;
        const angleIncrement = 360 / lettersCount.length; // Угол между буквами

        // Создаем кнопки для каждой буквы текущего слова
        lettersCount.forEach((letter, index) => {
            const circle = document.createElement('div');
            circle.className = `page-ring_container__circle`;

            // Вычисляем угол и задаем трансформацию
            const angle = angleIncrement * index; // Угол для текущей буквы
            circle.style.position = 'absolute';
            circle.style.transform = `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`; // Позиционирование по кругу

            // Устанавливаем размеры и другие стили
            circle.style.width = '89.94px';
            circle.style.height = '89.94px';

            circle.innerHTML = `<span class="page-ring_container__circle-text">${letter}</span>`;
            circle.dataset.letter = letter; // Храним букву в data-атрибуте
            container.appendChild(circle);
        });
    }

    getPositionClass(index, total) {
        const angle = 360 / total; // Угол между буквами
        const position = Math.round(index * angle);

        // Определяем класс в зависимости от положения
        if (position < 45 || position >= 315) return 'top';
        if (position >= 45 && position < 135) return 'right';
        if (position >= 135 && position < 225) return 'bottom';
        return 'left';
    }

    setupListeners() {
        const letters = document.querySelectorAll('.page-ring_container__circle');
        letters.forEach(letter => {
            letter.addEventListener('mousedown', (event) => this.startSelection(event, letter));
            letter.addEventListener('mouseover', (event) => this.selectLetter(event, letter));
            letter.addEventListener('mouseup', () => this.endSelection());
        });
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
        }
    }

    addLetter(letter) {
        const wordsForLevel = this.getWordsForLevel(this.level + 1);
        const currentWordToGuess = wordsForLevel[this.currentWordIndex];
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
        const activeItems = document.querySelectorAll('.page-content_item');
        const charArray = this.currentWord.split(''); // Разбиваем текущее слово на буквы
        let filledCount = 0; // Счетчик заполненных букв

        // Перебираем все ячейки
        for (let i = 0; i < activeItems.length; i++) {
            // Проверяем, что ячейка пустая и не имеет класса active
            if (!activeItems[i].classList.contains('active') && activeItems[i].querySelector('.page-content_item__text').innerText === '') {
                if (filledCount < charArray.length) {
                    // Заполняем ячейку буквой
                    activeItems[i].classList.add('active'); // Добавляем класс active
                    activeItems[i].querySelector('.page-content_item__text').innerText = charArray[filledCount]; // Заполняем буквой
                    filledCount++; // Увеличиваем счетчик
                }
            }
        }

        // Если не все буквы заполнены, добавляем новый ряд
        if (filledCount < charArray.length) {
            this.addNewRow(); // Добавляем новый ряд
            this.displayWord(); // Вызываем снова, чтобы попытаться заполнить новый ряд
        }
    }

    addNewRow() {
        const contentContainer = document.querySelector('.page-content'); // Находим контейнер для ячеек
        const newRowHtml = `
        <div class="page-content_item">
            <span class="page-content_item__text"></span>
        </div>
        <div class="page-content_item">
            <span class="page-content_item__text"></span>
        </div>
        <div class="page-content_item">
            <span class="page-content_item__text"></span>
        </div>
        <div class="page-content_item">
            <span class="page-content_item__text"></span>
        </div>
    `;

        // Добавляем новые ячейки в контейнер
        contentContainer.insertAdjacentHTML('beforeend', newRowHtml);

        // Получаем высоту нового элемента .page-content_item
        const newItem = contentContainer.lastElementChild; // Последний добавленный ряд
        const itemHeight = newItem.offsetHeight; // Высота элемента

        // Добавляем отступ к блоку page-content_min
        const minContent = document.querySelector('.page-content_min');
        minContent.style.marginTop = (parseInt(getComputedStyle(minContent).marginTop) + itemHeight) + 'px';

        // Добавляем отступ к блоку page-ring_container
        const ringContainer = document.querySelector('.page-ring_container');
        ringContainer.style.marginTop = (parseInt(getComputedStyle(ringContainer).marginTop) + itemHeight) + 'px';
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