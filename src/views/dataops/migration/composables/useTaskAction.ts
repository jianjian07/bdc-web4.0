import { ref } from 'vue'
import { $message } from '../../../../utils/message'

/**
 * 任务操作(启动 / 暂停 / 恢复 / 取消)的公共包装
 * <p>原先 migration 列表页与详情页各写了一份 handleAction:签名不同但语义完全一致
 * (置 loading → 调接口 → 成功提示 → 刷新)。此处收敛为一份,两处页面只传差异部分。</p>
 *
 * @param refresh 操作成功后的刷新动作(列表页重查分页、详情页重查详情)
 */
export function useTaskAction(refresh: () => unknown) {
  /** 是否有操作进行中(详情页用) */
  const acting = ref(false)
  /** 正在进行操作的行 id(列表页用,便于按钮级 loading) */
  const actingId = ref<number | null>(null)

  /**
   * @param id      任务 id
   * @param fn      实际接口调用
   * @param okText  成功提示文案
   * @param onDone  刷新前额外的本地状态清理
   */
  async function run(
    id: number,
    fn: (id: number) => Promise<unknown>,
    okText: string,
    onDone?: () => void
  ) {
    acting.value = true
    actingId.value = id
    try {
      await fn(id)
      $message(okText)
      onDone?.()
      await refresh()
    } finally {
      acting.value = false
      actingId.value = null
    }
  }

  return { acting, actingId, run }
}
