import './styles.scss';
import {Render} from "./app/view/components/render/render";
import {Main} from "./app/view/modules/main/main";

if (module.hot) {
    module.hot.accept();
}

const main = new Main();
const render = new Render('#app', {
    html: main.getMainHtml(),
    mainInstance: main // Передаем экземпляр Main
});

render.render();

console.log('Webpack is running!');
