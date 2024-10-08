export class Helper {
    constructor() {
        this.currentWord = '';
        this.selectedLetters = [];
        this.minVisible = false;
        this.selectedCoordinates = [];
    }

    getWordsByLength(wordsLevel) {
        const shortWords = [];
        const longWords = [];

        wordsLevel.forEach(word => {
            if (word.length > 4) {
                longWords.push(word);
            } else {
                shortWords.push(word);
            }
        });

        return { shortWords, longWords };
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

    hideMinDisplay() {
        const minContainer = document.querySelector('.page-content_min');
        if (!minContainer) {
            return;
        }

        minContainer.style.display = 'none'; // Скрываем блок для выбранных букв
        this.minVisible = false; // Сбрасываем флаг видимости
    }

    clearLine() {
        const linePath = document.querySelector('.line-visualization .line');

        if (linePath) {
            linePath.setAttribute('d', ''); // Очищаем линию
        }
    }

    showMinDisplay() {
        const minContainer = document.querySelector('.page-content_min');
        minContainer.style.display = 'flex'; // Показываем блок для выбранных букв
        this.minVisible = true; // Устанавливаем флаг видимости
    }

    drawLine(event, isTouch) {
        const linePath = document.querySelector('.line-visualization .line');
        const containerRect = document.querySelector('.page-ring_container').getBoundingClientRect();

        const touch = isTouch ? event.touches[0] : undefined;
        // Получаем координаты мыши относительно контейнера
        const x = isTouch ? (touch.clientX - containerRect.left) : (event.clientX - containerRect.left);
        const y = isTouch ? (touch.clientY - containerRect.top) : (event.clientY - containerRect.top);

        const currentPath = linePath.getAttribute('d') || ''; // Получаем текущий путь
        const newPath = currentPath + (currentPath ? ` L ${x} ${y}` : ` M ${x} ${y}`); // Добавляем новую точку

        linePath.setAttribute('d', newPath); // Обновляем атрибут d
        linePath.setAttribute('stroke-linecap', 'round'); // Скругление концов
        linePath.setAttribute('stroke-linejoin', 'round'); // Скругление углов
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
}