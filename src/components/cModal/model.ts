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
  // 表单传参数
  formData?: object | string | number | Array<any>,
  // footer样式
  footerStyle?: Object
  // 是否全屏
  isFullScreen?: boolean
  // 弹窗class
  wrapClassName?: string
  // footer扩展按钮
  footerExtendBtn?: any[]
  // 是否需要默认的确认取消按钮
  isDefaultBtn?: boolean
}
