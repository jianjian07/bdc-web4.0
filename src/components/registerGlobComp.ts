import type { App } from 'vue';
import SvgIcon from './icon/SvgIcon.vue'
import SpinMask from './common/SpinMask.vue'
import CTable from '/@/components/table/index.vue'
import CInput from '/@/components/input/index.vue'
import CChildForm from '/@/components/common/childForm.vue'
import dayjs from 'dayjs'; //日期时间组件API
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn'); //日期时间组件中文
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
    FloatButton,
    Skeleton,
    Flex,
    Transfer,
    Steps
} from 'ant-design-vue';

export function registerGlobComp(app: App) {
    app.component("svg-icon", SvgIcon)
    app.component("spin-mask", SpinMask)
    app.component("c-table", CTable)
    app.component("c-child-form", CChildForm)
    app.component("c-input", CInput)
    app
        .use(Flex)
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
        .use(Tag)
        .use(Skeleton)
        .use(Transfer)
        .use(Steps)
}