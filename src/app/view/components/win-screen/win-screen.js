import {Core} from "../../core";
import {Main} from "../../modules/main/main";

export class WinScreen extends Core {
    constructor(level) {
        super();
        this.level = level;
    }

    render() {
        document.body.innerHTML = this.getWinScreenHtml();
        this.setupButtonListener();
    }

    getWinScreenHtml() {
        return `
            <div class="win-page">
                <div class="win-page_title">
                    <span class="win-page_title__text">Уровень ${ this.level } пройден</span>
                    <span class="win-page_title__subtext">Изумительно!</span>
                </div>
                
                <div class="win-page_btn">
                    <button class="win-page_btn__item">Уровень ${ this.level + 1 }</button>
                </div>
            </div>
        `;
    }

    setupButtonListener() {
        const button = document.querySelector('.win-page_btn__item');

        if (button) { // Проверяем, существует ли кнопка
            button.addEventListener('click', () => {
                const main = new Main();
                main.startLevel(this.level); // Инициализируем уровень в Main
            });
        }
    }
}