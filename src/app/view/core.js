import {WarnPopup} from "./components/warn-popup/warn-popup";
import {Main} from "./modules/main/main";
import {Render} from "./components/render/render";

export class Core {
    constructor() {
        this.warnPopup = new WarnPopup();
        this.checkPageOpen();
        this.currentGameState = this.loadGameState();
        this.isGameActive = false; // Флаг для отслеживания активности игры
        this.isMobile = window.innerWidth <= 768;

        window.addEventListener('storage', this.handleStorageEvent.bind(this));
        window.addEventListener('beforeunload', this.cleanup.bind(this));
        window.addEventListener('focus', this.checkActiveTab.bind(this));
        window.addEventListener('resize', this.updateListeners.bind(this));

        this.warnPopup.onRefresh = () => {
            this.refreshGameState();
        }
    }

    checkPageOpen() {
        const currentTabId = Date.now(); // Использую временной штамп как ID вкладки

        localStorage.setItem('current_tab', currentTabId.toString());

        // Уведомление о неактуальности
        window.addEventListener('storage', (event) => {
            if (event.key === 'current_tab' && event.newValue !== currentTabId.toString()) {
                this.showPopup();
            }
        });
    }

    updateListeners() {
        const previousIsMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        // Если состояние изменилось, вызываем setupListeners в Main
        if (previousIsMobile !== this.isMobile) {
            const mainInstance = new Main();

            mainInstance.setupListeners();
        }
    }

    handleStorageEvent(event) {
        if (event.key === 'current_tab') {
            this.showPopup();
        }
    }

    checkActiveTab() {
        const currentTab = localStorage.getItem('current_tab');

        if (currentTab !== Date.now().toString() && this.isGameActive) {
            this.showPopup();
        }
    }

    cleanup() {
        localStorage.removeItem('page_opened');
    }

    showPopup() {
        this.warnPopup.show();
    }

    refreshGameState() {
        const gameState = this.loadGameState();
        const main = new Main();

        main.loadState(gameState);
        const render = new Render('#app', {
            html: main.getMainHtml(),
            mainInstance: main
        });

        render.render();
    }

    loadGameState() {
        const gameState = JSON.parse(localStorage.getItem('game_state'));

        return gameState || {};
    }
}