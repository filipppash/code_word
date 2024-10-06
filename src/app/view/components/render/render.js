export class Render {
    constructor(selector, options) {
        this.$el = document.querySelector(selector);
        this.html = options.html || '';
        this.mainInstance = options.mainInstance; // Сохраняем экземпляр класса Main
    }

    render() {
        if (this.html) {
            if (this.$el) { // Проверяем, существует ли элемент
                this.$el.innerHTML = this.html; // Вставляем HTML в корневой элемент

                if (this.mainInstance) {
                    const currentWord = this.mainInstance.wordsList[this.mainInstance.level % 3][this.mainInstance.currentWordIndex];
                    this.mainInstance.setupRing(currentWord); // Вызываем setupRing с текущим словом
                    this.mainInstance.setupListeners(); // Вызываем setupListeners после рендеринга
                }
            }
        }
    }
}