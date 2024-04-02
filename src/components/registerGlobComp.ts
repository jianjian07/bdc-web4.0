import type { App } from 'vue';
import {
    Button,
    Row,
    Col,
    ConfigProvider,
    Form,
    Input,
    Divider
} from 'ant-design-vue';

export function registerGlobComp(app: App) {

    app
        .use(Button)
        .use(Row)
        .use(Col)
        .use(ConfigProvider)
        .use(Form)
        .use(Input)
        .use(Divider);
}