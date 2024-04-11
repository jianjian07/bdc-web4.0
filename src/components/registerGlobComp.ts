import type { App } from 'vue';
import SvgIcon from './icon/SvgIcon.vue'
import SpinMask from './common/SpinMask.vue'
import {
    Layout,
    Carousel,
    Upload,
    Spin,
    Button,
    Select,
    Alert,
    Checkbox,
    Input,
    Popover,
    Tree,
    Slider,
    InputNumber,
    Row,
    Col,
    Empty,
    List,
    Modal,
    ConfigProvider,
    DatePicker,
    TimePicker,
    Radio,
    Form,
    Switch,
    Divider,
    Tooltip,
    Tabs,
    Table,
    Pagination,
    Breadcrumb, Space, Popconfirm,
    Timeline, Cascader, Avatar,
    Menu,
    Drawer,
    TreeSelect,
    Dropdown,
    Collapse,
    Card,
    Result,
    Tag,
    FloatButton
} from 'ant-design-vue';

export function registerGlobComp(app: App) {
    app.component("svg-icon", SvgIcon)
    app.component("spin-mask", SpinMask)
    app
        .use(Layout)
        .use(Carousel)
        .use(Upload)
        .use(Spin)
        .use(ConfigProvider)
        .use(DatePicker)
        .use(TimePicker)
        .use(Select)
        .use(Alert)
        .use(Button)
        .use(Tabs)
        .use(Checkbox)
        .use(Input)
        .use(Popover)
        .use(Tree)
        .use(Slider)
        .use(InputNumber)
        .use(Row)
        .use(Col)
        .use(List)
        .use(Modal)
        .use(Radio)
        .use(Form)
        .use(Empty)
        .use(Switch)
        .use(Divider)
        .use(Tooltip)
        .use(Table)
        .use(Space)
        .use(Popconfirm)
        .use(Cascader)
        .use(Pagination)
        .use(Breadcrumb)
        .use(Avatar)
        // 时间轴
        .use(Timeline)
        .use(Menu)
        .use(Drawer)
        .use(TreeSelect)
        .use(Dropdown)
        .use(Collapse)
        .use(Card)
        .use(FloatButton)
        .use(Result)
        .use(Tag);
}