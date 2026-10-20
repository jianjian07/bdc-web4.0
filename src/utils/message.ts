import { message, Modal } from 'ant-design-vue'

// 统一默认配置(位置/时长全局一致)
message.config({ top: '80px', duration: 2 })

/**
 * @description: 成功提示
 */
export const $message = (content: string) => message.success(content)

/**
 * @description: 失败提示
 */
export const $error = (content: string) => message.error(content)

/**
 * @description: 警告提示
 */
export const $warning = (content: string) => message.warning(content)

/**
 * @description: 确认弹窗(异步 onOk,自动 loading)
 */
export const $confirmAsync = (title: string, content: string, onOk: () => Promise<unknown>) =>
  Modal.confirm({ title, content, okText: '确定', cancelText: '取消', onOk })
