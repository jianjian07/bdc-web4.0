# Ant Design Vue 组件注册规范（避免页面重复导入）

> 适用场景：新项目页面出现大量重复的 `import { Button, Card, Table, message... } from 'ant-design-vue'`。
> 本规范源自 bdc-web4.0（不动产登记前端）的实际做法，并给出新项目的推荐方案。

---

## 一、老项目（bdc-web4.0）的实际做法

### 1.1 核心机制：集中全局注册，页面零组件导入

组件**只在 `src/components/registerGlobComp.ts` 注册一次**，在 `main.ts` 的 `bootstrap()` 引导流程中调用：

```ts
// src/components/registerGlobComp.ts
import type { App } from 'vue';
import {
    Layout, Button, Table, Card, Space, Spin, Tag, Descriptions, Progress,
    Form, Input, Select, DatePicker, Modal, Drawer, Tabs, Tooltip, Popconfirm,
    // ... 全量组件清单见下表
} from 'ant-design-vue';

export function registerGlobComp(app: App) {
    app
        .use(Flex)
        .use(Layout)
        .use(Button)
        .use(Table)
        // ... 链式注册
        .use(Calendar)
}
```

```ts
// src/main.ts
import { registerGlobComp } from './components/registerGlobComp'

async function bootstrap() {
  // ... nacos 配置 → store → 全局组件
  registerGlobComp(app)   // 组件统一在此注册
  // ...
  app.mount('#app', true)
}
```

### 1.2 效果

- **所有 .vue 页面模板中直接使用 `<a-button>`、`<a-table>` 等 kebab-case 标签，无需任何组件 import**
- 全库统计：约 196 处 `from 'ant-design-vue'` 页面导入，**全部是 `message` / `Modal` / `notification` 等函数式 API**（这类 API 不渲染模板标签，无法用 `app.use` 全局化，属于合理导入）
- dayjs 中文 locale 也在此文件统一设置：`dayjs.locale('zh-cn')`

### 1.3 老项目注册的组件全量清单（可直接抄）

Layout, Carousel, Upload, Spin, Button, Select, Alert, Checkbox, Input, Popover, Tree, Slider, InputNumber, Row, Col, Empty, List, Modal, ConfigProvider, DatePicker, TimePicker, Radio, Form, Switch, Divider, Tooltip, Tabs, Table, Pagination, Breadcrumb, Space, Popconfirm, Timeline, Cascader, Avatar, Menu, Drawer, TreeSelect, Dropdown, Collapse, Card, Result, Tag, FloatButton, Skeleton, Flex, Transfer, Steps, AutoComplete, Calendar

> 注意 `Descriptions`、`Progress`、`message` 不在老项目全局清单中——Descriptions/Progress 应补入全局注册（新项目按需增补）；message 属函数式 API，见第三节。

---

## 二、新项目规范（二选一）

### 方案 A：沿用老项目方式 —— 集中手动全局注册（推荐，与团队习惯一致）

**规则：**

1. 新建 `src/components/registerGlobComp.ts`，全量组件清单集中在这一处维护
2. `main.ts` 的 `bootstrap()` 中调用一次：`registerGlobComp(app)`
3. **页面 .vue 中禁止出现任何组件型 import from 'ant-design-vue'**（ESLint 规则强制，见第五节）
4. 新增组件需求时：先加到 `registerGlobComp.ts`，再直接在模板用 `<a-xxx>`
5. 业务封装组件用 `app.component('c-xxx', Cxx)` 同样在此注册（老项目：c-input、c-input-table、svg-icon、spin-mask）

**优点**：与 bdc-web4.0 完全一致，团队成员零学习成本；模板内标签即用；无构建插件依赖。
**缺点**：组件清单需手工维护；所有注册组件会进主包（配合 gzip 影响可控）。

### 方案 B：unplugin-vue-components 自动按需注册（更现代，可选）

```ts
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ command, mode }) => ({
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({ importStyle: false }), // 样式已全局引入或走 less 变量
      ],
      dts: 'types/components.d.ts', // 自动生成类型声明，模板标签有 TS 提示
    }),
  ],
}))
```

**规则**：页面模板直接写 `<a-button>`，插件编译时自动注入 import，无需任何手动导入和集中清单。
**优点**：零维护；真正按需打包。
**缺点**：与老项目习惯不同；模板里拼字符串的动态组件不会被转换（老项目大量使用 `defineAsyncComponent(modules['/src/' + path + '.vue'])` 动态组件模式，需注意兼容）。

> 建议：团队从 bdc-web4.0 平移 → 选 **方案 A**；全新团队全新项目 → 可选方案 B。

---

## 三、函数式 API 的规范处理（message / Modal / notification）

这三类**不属于组件**，无法全局注册，老项目的做法是页面局部导入：

```ts
import { message } from 'ant-design-vue'
message.success('保存成功')
```

**新项目规范（推荐统一二次封装，避免散用）：**

新建 `src/utils/message.ts`：

```ts
import { message, Modal, notification } from 'ant-design-vue'

/** 成功提示 */
export const $message = (content: string) => message.success(content)
/** 失败提示 */
export const $error = (content: string) => message.error(content)
/** 确认弹窗 */
export const $confirm = (title: string, content: string, onOk: () => void) =>
  Modal.confirm({ title, content, okText: '确定', cancelText: '取消', onOk })

// 统一设置默认配置
message.config({ top: '80px', duration: 2 })
```

页面统一 `import { $message } from '/@/utils/message'`，好处：
1. 消息样式/时长全局统一（老项目各页面时长、位置不一致）
2. antd 大版本升级时只改一处
3. message 无法被 App.vue 的 ConfigProvider 主题覆盖，封装层方便后续替换为自定义组件

---

## 四、配套约定

| 事项 | 规范 |
|---|---|
| 模板标签写法 | kebab-case：`<a-button>`、`<a-table>`（老项目统一风格） |
| 日期中文 | dayjs zh-cn locale 在 `registerGlobComp.ts` 统一设置一次 |
| 主题 | `a-config-provider :theme` 在 App.vue 全局注入 token，页面不再自行传主题 |
| 自研公共组件 | 前缀 `c-`：`cModal`、`cDrawer`、`c-input`，同样在 `registerGlobComp.ts` 注册 |
| 图标 | `@ant-design/icons-vue` 按需在页面 import（体积敏感，不全局注册）；自研 svg 用全局 `<svg-icon>` |

---

## 五、ESLint 强制约束（防止规范回退）

```js
// .eslintrc 中使用 no-restricted-imports 禁止页面导入组件型 antd 导出
{
  "rules": {
    "no-restricted-imports": ["error", {
      "paths": [{
        "name": "ant-design-vue",
        "importNames": ["Button", "Card", "Table", "Spin", "Tag", "Space",
          "Descriptions", "Progress", /* 组件型导出，按需补全 */],
        "message": "antd 组件已在 registerGlobComp.ts 全局注册，模板直接使用 <a-xxx>，请勿导入"
      }]
    }]
  }
}
```

> message / Modal / notification 不在限制名单中（属函数式 API，允许局部导入或使用 `src/utils/message.ts` 封装）。

---

## 六、迁移操作步骤（针对当前新项目已有重复导入）

1. 建立 `src/components/registerGlobComp.ts`，粘贴第二节老项目全量清单 + `Descriptions`、`Progress`
2. `main.ts` 引入并在 `app.mount` 前调用
3. 全局搜索 `from 'ant-design-vue'`，删除所有**组件型**导入（Button/Card/Descriptions/Progress/Space/Spin/Table/Tag 等）
4. 保留/替换 `message`、`Modal`、`notification` 导入为 `src/utils/message.ts` 封装
5. 删除导入后逐页面检查模板标签是否正常渲染（全局注册后无需改动模板）
6. 配置第五节 ESLint 规则，防止回退
