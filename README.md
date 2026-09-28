# Vue 3 + TypeScript + Vite

### FileIcon图标组件

```html
<!-- 文件夹图标 -->
<FileIcon type="folder" />

<!-- 文件图标，自动根据后缀匹配 -->
<FileIcon :file-name="record.fileName" />

<!-- 自定义尺寸（默认16px） -->
<FileIcon :file-name="'report.xlsx'" :size="24" />
```
