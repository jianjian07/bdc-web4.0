export interface cModalModel {
  // 标题
  title?: string,
  // 宽度
  width?: string | number
  // 文件地址
  filePath?: string,
  // 确认文字
  okText?: string,
  // 取消文字
  cancelText?: string,
  // 确定按钮
  onOk?: Function,
  // 取消按钮
  onCancel?: Function,
  // 是否显示页脚
  footer?: boolean,
  formData?: object | string | number | Array<any>
}
