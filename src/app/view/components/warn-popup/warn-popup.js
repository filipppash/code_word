export class WarnPopup {
    constructor() {
        this.popup = document.createElement('div');
        this.popup.className = 'warn-popup';
        this.popup.innerHTML = `
            <div class="warn-popup_overlay"></div>
            <div class="warn-popup_content">
                <div class="warn-popup_content__info">
                    <span class="warn-popup_content__info-text">Две вкладки с игрой?</span>
                </div>
                <p class="warn-popup_content__text">Похоже, игра открыта в нескольких вкладках браузера. Чтобы продолжить играть в этой вкладке, обновите страницу.</p>
                <div class="warn-popup_close">
                    <button class="warn-popup_close__item">Обновить</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.popup);

        this.popup.querySelector('.warn-popup_close').addEventListener('click', () => {
            this.refresh();
        });

        this.onRefresh = null;
    }

    show() {
        this.popup.style.display = 'block';
        this.popup.querySelector('.warn-popup_overlay').style.display = 'block';
    }

    close() {
        this.popup.style.display = 'none';
        this.popup.querySelector('.warn-popup_overlay').style.display = 'none';
    }

    refresh() {
        if (this.onRefresh) {
            this.onRefresh();
        }

        this.close();
    }
}