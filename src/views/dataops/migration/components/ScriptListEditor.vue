<script setup lang="ts">
import { computed, ref } from 'vue'
import { dryRunScriptApi } from '/@/views/dataops/api/migration'
import type { ScriptItem, ScriptOnError, ScriptPhase, ScriptPreWrite, ScriptTarget } from '/@/views/dataops/api/model/migration'
import { $message, $warning } from '/@/utils/message'

const props = defineProps<{
  scripts: ScriptItem[]
  /** 提供任务 id 时可对单个脚本做试运行(事务内执行后回滚) */
  taskId?: number | null
}>()

const emit = defineEmits<{ 'update:scripts': [ScriptItem[]] }>()

const PHASE_LABELS: Record<ScriptPhase, string> = {
  PRE: '前置 PRE',
  MAIN: '主体 MAIN',
  POST: '后置 POST'
}
const TARGET_LABELS: Record<ScriptTarget, string> = {
  TARGET_DB: '目标库',
  SOURCE_DB: '源库'
}
const ON_ERROR_LABELS: Record<ScriptOnError, string> = {
  ABORT: '中止后续',
  CONTINUE: '继续下一个'
}
const PRE_WRITE_LABELS: Record<ScriptPreWrite, string> = {
  NONE: '不清空(脚本自保证幂等)',
  TRUNCATE_TARGETS: '清空目标表再写入'
}

const phaseOptions = (Object.keys(PHASE_LABELS) as ScriptPhase[]).map((v) => ({
  value: v,
  label: PHASE_LABELS[v]
}))
const targetOptions = (Object.keys(TARGET_LABELS) as ScriptTarget[]).map((v) => ({
  value: v,
  label: TARGET_LABELS[v]
}))
const onErrorOptions = (Object.keys(ON_ERROR_LABELS) as ScriptOnError[]).map((v) => ({
  value: v,
  label: ON_ERROR_LABELS[v]
}))
const preWriteOptions = (Object.keys(PRE_WRITE_LABELS) as ScriptPreWrite[]).map((v) => ({
  value: v,
  label: PRE_WRITE_LABELS[v]
}))

/** 执行顺序: 先按阶段 PRE→MAIN→POST, 再按清单顺序 */
const ordered = computed(() =>
  props.scripts
    .map((s, i) => ({ s, i }))
    .sort((a, b) => phaseRank(a.s) - phaseRank(b.s) || a.i - b.i)
    .map((x) => x.i)
)

function phaseRank(s: ScriptItem): number {
  const order: ScriptPhase[] = ['PRE', 'MAIN', 'POST']
  const idx = order.indexOf(s.execPhase ?? 'MAIN')
  return idx < 0 ? 1 : idx
}

function commit(next: ScriptItem[]) {
  emit('update:scripts', next)
}

function addScript() {
  const next = [...props.scripts]
  next.push({
    scriptName: `脚本 ${next.length + 1}`,
    scriptContent: '',
    execPhase: 'MAIN',
    scriptType: 'TARGET_DB',
    onError: 'ABORT',
    timeoutSec: 1800,
    enabled: true,
    targetTables: [],
    preWriteAction: 'NONE'
  })
  commit(next)
}

function removeAt(index: number) {
  const next = [...props.scripts]
  next.splice(index, 1)
  commit(next)
}

/** 上移/下移(在清单内交换位置) */
function move(index: number, delta: number) {
  const target = index + delta
  if (target < 0 || target >= props.scripts.length) return
  const next = [...props.scripts]
  const tmp = next[index]
  next[index] = next[target]
  next[target] = tmp
  commit(next)
}

/** 改字段 */
function patch(index: number, key: keyof ScriptItem, value: unknown) {
  const next = props.scripts.map((s, i) => (i === index ? { ...s, [key]: value } : s))
  commit(next)
}

//region ==================== 脚本正文编辑 ====================

const editorOpen = ref(false)
const editorIndex = ref(-1)
const editorDraft = ref('')

function openEditor(index: number) {
  editorIndex.value = index
  editorDraft.value = props.scripts[index]?.scriptContent ?? ''
  editorOpen.value = true
}

function saveEditor() {
  if (editorIndex.value >= 0) {
    patch(editorIndex.value, 'scriptContent', editorDraft.value)
  }
  editorOpen.value = false
}

//endregion

//region ==================== 试运行 ====================

const dryRunIndex = ref(-1)
const dryRunLoading = ref(false)

async function dryRun(index: number) {
  const item = props.scripts[index]
  if (!props.taskId) {
    $warning('任务创建后才能试运行')
    return
  }
  if (!item.scriptContent?.trim()) {
    $warning('脚本内容为空')
    return
  }
  dryRunIndex.value = index
  dryRunLoading.value = true
  try {
    const r = await dryRunScriptApi(props.taskId, item)
    if (r.success) {
      $message(
        `试运行通过 ✅ ${r.statementCount ?? 0} 条语句, 影响 ${r.affectedRows ?? 0} 行, 耗时 ${r.durationMs ?? 0} ms(已回滚)`
      )
    } else {
      $warning(`试运行失败: ${r.errorMessage ?? '未知错误'}`)
    }
  } finally {
    dryRunLoading.value = false
    dryRunIndex.value = -1
  }
}

//endregion

const enabledCount = computed(
  () => props.scripts.filter((s) => s.enabled !== false).length
)
const filledCount = computed(
  () => props.scripts.filter((s) => !!s.scriptContent?.trim()).length
)
</script>

<template>
  <div class="script-list-editor">
    <a-alert type="info" show-icon style="margin-bottom: 12px"
      message="脚本按「阶段(PRE→MAIN→POST) + 清单顺序」串行执行。每个脚本独立一个事务: 全部语句成功才提交, 任一句失败整体回滚。" />

    <div class="toolbar">
      <a-space>
        <a-button type="primary" @click="addScript">+ 新增脚本</a-button>
        <span class="hint">
          共 {{ scripts.length }} 个, 已启用 {{ enabledCount }} 个, 已填内容 {{ filledCount }} 个
          <template v-if="scripts.length > filledCount">
            · <span style="color: #d46b08">未填内容的 {{ scripts.length - filledCount }} 个草稿不会提交</span>
          </template>
        </span>
      </a-space>
    </div>

    <a-empty v-if="!scripts.length" description="还没有脚本,点击「新增脚本」开始添加" />

    <div v-for="(index, order) in ordered" :key="index" class="script-card">
      <div class="script-head">
        <a-tag
          :color="scripts[index].execPhase === 'PRE' ? 'blue' : scripts[index].execPhase === 'POST' ? 'purple' : 'green'">
          第 {{ order + 1 }} 个执行 · {{ PHASE_LABELS[(scripts[index].execPhase ?? 'MAIN') as ScriptPhase] }}
        </a-tag>
        <a-input :value="scripts[index].scriptName" style="width: 260px" placeholder="脚本名"
          @update:value="(v: string) => patch(index, 'scriptName', v)" />
        <a-space size="small">
          <a-tooltip title="上移">
            <a-button size="small" :disabled="order === 0" @click="move(index, -1)">↑</a-button>
          </a-tooltip>
          <a-tooltip title="下移">
            <a-button size="small" :disabled="order === scripts.length - 1" @click="move(index, 1)">↓</a-button>
          </a-tooltip>
          <a-button size="small" @click="openEditor(index)">
            编辑 SQL{{ scripts[index].scriptContent?.trim() ? '' : ' (空)' }}
          </a-button>
          <a-button size="small" :loading="dryRunLoading && dryRunIndex === index" @click="dryRun(index)">
            试运行
          </a-button>
          <a-popconfirm title="确定删除该脚本?" ok-text="删除" cancel-text="取消" @confirm="removeAt(index)">
            <a-button size="small" danger>删除</a-button>
          </a-popconfirm>
        </a-space>
      </div>

      <div class="script-grid">
        <div>
          <div class="field-label">执行阶段</div>
          <a-select :value="scripts[index].execPhase ?? 'MAIN'" :options="phaseOptions" style="width: 100%"
            @change="(v: ScriptPhase) => patch(index, 'execPhase', v)" />
        </div>
        <div>
          <div class="field-label">执行库</div>
          <a-select :value="scripts[index].scriptType ?? 'TARGET_DB'" :options="targetOptions" style="width: 100%"
            @change="(v: ScriptTarget) => patch(index, 'scriptType', v)" />
        </div>
        <div>
          <div class="field-label">失败策略</div>
          <a-select :value="scripts[index].onError ?? 'ABORT'" :options="onErrorOptions" style="width: 100%"
            @change="(v: ScriptOnError) => patch(index, 'onError', v)" />
        </div>
        <div>
          <div class="field-label">写前动作</div>
          <a-select :value="scripts[index].preWriteAction ?? 'NONE'" :options="preWriteOptions" style="width: 100%"
            @change="(v: ScriptPreWrite) => patch(index, 'preWriteAction', v)" />
        </div>
        <div>
          <div class="field-label">超时(秒)</div>
          <a-input-number :value="scripts[index].timeoutSec ?? 1800" :min="1" :max="86400" style="width: 100%"
            @change="(v: number | null) => patch(index, 'timeoutSec', v ?? 1800)" />
        </div>
        <div>
          <div class="field-label">启用</div>
          <a-switch :checked="scripts[index].enabled !== false"
            @update:checked="(v: boolean) => patch(index, 'enabled', v)" />
        </div>
      </div>

      <div class="script-target-tables">
        <div class="field-label">影响的目标表（迁移后自动比对用）</div>
        <a-select :value="scripts[index].targetTables ?? []" mode="tags" placeholder="输入表名后回车, 如 users 或 kyqcr.kyq_qlr"
          style="width: 100%" @change="(v: string[]) => patch(index, 'targetTables', v)" />
        <div class="hint" style="margin-top: 4px">
          列出该脚本写入的目标表;迁移成功后自动比对将以所有脚本的目标表去重汇总。元素为
          <code>table</code> 或 <code>schema.table</code>(schema 同时适用于源与目标)。
          <template v-if="(scripts[index].preWriteAction ?? 'NONE') === 'TRUNCATE_TARGETS'">
            写前动作为“清空目标表再写入”时, 执行脚本体前会在<b>同一事务</b>内先 TRUNCATE 此处声明的表,
            失败整体回滚, 重跑不产生重复数据。
          </template>
        </div>
      </div>

      <div class="script-preview">
        {{ scripts[index].scriptContent?.trim() ? scripts[index].scriptContent.slice(0, 300) : '(未填写脚本内容)' }}
      </div>
    </div>

    <a-modal v-model:open="editorOpen" title="编辑脚本 SQL" width="900px" ok-text="保存" cancel-text="关闭" @ok="saveEditor">
      <a-textarea v-model:value="editorDraft" :rows="22" class="sql-area"
        placeholder="在此粘贴完整 SQL,如:&#10;DELETE FROM kyqcr.kyq_qlr WHERE import_tag='kyqdj';&#10;INSERT INTO kyqcr.kyq_kyqdj (...) SELECT ... FROM kq.kyq_kyqdj;" />
      <div class="hint" style="margin-top: 8px">
        引擎已为每个脚本包裹事务,请勿在脚本内写 BEGIN / COMMIT / ROLLBACK;支持 ${sourceSchema}、${targetSchema}、${taskId} 等占位符。
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 12px;
}

.hint {
  color: #999;
  font-size: 12px;
}

.script-card {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 10px;
  background: #fafafa;
}

.script-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.script-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px 16px;
}

.field-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.script-preview {
  margin-top: 10px;
  padding: 8px;
  background: #fff;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  color: #666;
  white-space: pre-wrap;
  max-height: 90px;
  overflow: auto;
}

.sql-area {
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
}
</style>
../../../../utils/message