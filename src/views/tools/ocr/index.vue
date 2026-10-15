<template>
  <div class="ocr-scene-container">
    <!-- 左侧场景列表 -->
    <div class="scene-sidebar">
      <div class="sidebar-header">
        <a-button type="primary" block @click="handleNewScene">新建场景</a-button>
      </div>
      <div class="scene-list">
        <div v-for="item in sceneList" :key="item.id" class="scene-item" @click="selectScene(item)">
          <div class="scene-item-info">
            <div class="scene-item-name-row" :class="{ active: currentScene?.id === item.id }">
              <span class="scene-item-name">{{ item.sceneName || item.code }}</span>
              <DeleteOutlined v-if="currentScene?.id === item.id" @click.stop="deleteScene(item)" />
            </div>
            <div class="scene-item-meta">
              <span>{{ item.createTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧配置面板 -->
    <div class="scene-config">
      <a-form :model="formState" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="场景编号" name="code" :rules="[{ required: true, message: '请输入场景编号' }]">
          <a-input v-model:value="formState.code" placeholder="请输入场景编号" />
        </a-form-item>
        <a-form-item label="场景名称" name="sceneName" :rules="[{ required: true, message: '请输入场景名称' }]">
          <a-input v-model:value="formState.sceneName" placeholder="请输入场景名称" />
        </a-form-item>
        <a-form-item label="页码范围" name="pageRange">
          <a-input v-model:value="formState.pageRange" placeholder="是否开启指定页抽取：开启后，可输入指定页码进行抽取，例如：1,5-10,15，不开启就为空" />
        </a-form-item>

        <!-- 单个字段 -->
        <a-form-item label="单个字段">
          <a-select mode="tags" :value="singleFieldNames" :open="singleSelectOpen"
            @dropdownVisibleChange="(open: boolean) => singleSelectOpen = open" :search-value="singleSearchValue"
            @search="(val: string) => singleSearchValue = val" @change="onSingleFieldsChange" :options="[]"
            :not-found-content="null" placeholder="输入字段名称后按回车确认" style="width: 100%" :token-separators="[',']"
            dropdown-class-name="field-tags-dropdown" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }">
            <template #dropdownRender="{ menuNode }">
              <component :is="menuNode" />
              <div class="field-dropdown">
                <div v-if="singleSearchValue" class="create-field-option" @mousedown.prevent="createSingleField">
                  <PlusOutlined /> 创建字段「{{ singleSearchValue }}」
                </div>
                <table v-if="singleFields.length > 0" class="field-detail-table">
                  <thead>
                    <tr>
                      <th>字段
                        <QuestionCircleOutlined class="help-icon" />
                      </th>
                      <th>说明
                        <QuestionCircleOutlined class="help-icon" />
                      </th>
                      <th>对比表</th>
                      <th>对比列</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(field, fieldIndex) in singleFields" :key="fieldIndex">
                      <td>
                        <a-input v-model:value="field.name" placeholder="请输入" size="small" />
                      </td>
                      <td>
                        <a-input v-model:value="field.description" placeholder="请输入" size="small" @keydown.enter.stop />
                      </td>
                      <td>
                        <a-input v-model:value="field.tblName" placeholder="请输入" size="small" />
                      </td>
                      <td>
                        <a-input v-model:value="field.fieldName" placeholder="请输入" size="small" />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-if="!singleSearchValue && singleFields.length === 0" class="dropdown-empty-hint">
                  请输入字段名称后按回车确认
                </div>
              </div>
            </template>
          </a-select>
        </a-form-item>

        <!-- 组合字段 -->
        <a-form-item label="组合字段">
          <div v-for="(combo, comboIndex) in comboFields" :key="comboIndex" class="combo-group">
            <div class="combo-header">
              <div>
                <a-space>
                  <a-input :value="comboMetas[comboIndex]?.name"
                    @change="(e: any) => setComboMeta(comboIndex, 'name', e.target.value)"
                    :placeholder="`组合${comboIndex + 1}`" size="small" style="width: 200px" />
                  <a-input :value="comboMetas[comboIndex]?.tblName"
                    @change="(e: any) => setComboMeta(comboIndex, 'tblName', e.target.value)" :placeholder="`对比表`"
                    size="small" style="width: 100px" />
                  <a-input :value="comboMetas[comboIndex]?.fieldName"
                    @change="(e: any) => setComboMeta(comboIndex, 'fieldName', e.target.value)" :placeholder="`对比列`"
                    size="small" style="width: 100px" />
                </a-space>
              </div>
              <div>
                <a-space>
                  <DeleteOutlined class="action-icon" @click="removeCombo(comboIndex)" />
                </a-space>
              </div>
            </div>
            <a-select mode="tags" :value="getComboFieldNames(comboIndex)" :open="comboSelectOpen[comboIndex] || false"
              @dropdownVisibleChange="(open: boolean) => setComboOpen(comboIndex, open)"
              :search-value="comboSearchValue[comboIndex] || ''"
              @search="(val: string) => setComboSearch(comboIndex, val)"
              @change="(vals: string[]) => onComboFieldsChange(comboIndex, vals)" :options="[]"
              :not-found-content="null" placeholder="输入抽取字段后回车确认" style="width: 100%" :token-separators="[',']"
              dropdown-class-name="field-tags-dropdown" :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }">
              <template #dropdownRender="{ menuNode }">
                <component :is="menuNode" />
                <div class="field-dropdown">
                  <div v-if="comboSearchValue[comboIndex]" class="create-field-option"
                    @mousedown.prevent="createComboField(comboIndex)">
                    <PlusOutlined /> 创建字段「{{ comboSearchValue[comboIndex] }}」
                  </div>
                  <table v-if="combo.length > 0" class="field-detail-table">
                    <thead>
                      <tr>
                        <th>字段
                          <QuestionCircleOutlined class="help-icon" />
                        </th>
                        <th>说明
                          <QuestionCircleOutlined class="help-icon" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(field, fieldIndex) in combo" :key="fieldIndex">
                        <td> <a-input v-model:value="field.name" placeholder="请输入" size="small" @keydown.enter.stop />
                        </td>
                        <td>
                          <a-input v-model:value="field.description" placeholder="请输入" size="small"
                            @keydown.enter.stop />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div v-if="!comboSearchValue[comboIndex] && combo.length === 0" class="dropdown-empty-hint">
                    请输入字段名称后按回车确认
                  </div>
                </div>
              </template>
            </a-select>
          </div>
          <a-button type="dashed" block @click="addCombo">
            <PlusOutlined /> 新增组合
          </a-button>
        </a-form-item>

        <!-- 保存按钮 -->
        <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
          <a-button type="primary" @click="saveSceneConfig">保存</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined, EditOutlined } from '@ant-design/icons-vue'
import { defHttp } from '/@/utils/http/axios'
import { message, Modal } from 'ant-design-vue'

// 场景列表
let sceneList = ref<any[]>([])
let currentScene = ref<any>(null)

// 右侧表单
let formState = ref<any>({
  id: null,
  code: '',
  sceneName: '',
  pageRange: ''
})

// 字段明细
interface FieldItem {
  name: string
  description: string
  tblName: string
  fieldName: string
}

// 组合父节点元信息
interface ComboMeta {
  name: string
  tblName: string
  fieldName: string
}

let singleFields = ref<FieldItem[]>([])

let comboFields = ref<FieldItem[][]>([[]])
let comboMetas = ref<Record<number, ComboMeta>>({})

// 下拉面板状态 - 单个字段
let singleSelectOpen = ref(false)
let singleSearchValue = ref('')

// 下拉面板状态 - 组合字段
let comboSelectOpen = ref<Record<number, boolean>>({})
let comboSearchValue = ref<Record<number, string>>({})

// 单个字段名称数组（供 tags select 展示）
const singleFieldNames = computed(() => singleFields.value.map(f => f.name))

// 获取组合字段名称数组
function getComboFieldNames(index: number) {
  return (comboFields.value[index] || []).map(f => f.name)
}

function setComboOpen(index: number, open: boolean) {
  comboSelectOpen.value[index] = open
}

function setComboSearch(index: number, val: string) {
  comboSearchValue.value[index] = val
}

function setComboMeta(index: number, key: keyof ComboMeta, value: string) {
  if (!comboMetas.value[index]) {
    comboMetas.value[index] = { name: `组合${index + 1}`, tblName: '', fieldName: '' }
  }
  comboMetas.value[index][key] = value
}

enum api {
  queryAllList = '/api/zrzy-bdc/ocr/scene/queryAllList',
  queryFields = '/api/zrzy-bdc/ocr/scene/queryFields',
  delete = '/api/zrzy-bdc/ocr/scene/delete',
  saveSceneConfig = '/api/zrzy-bdc/ocr/scene/saveSceneConfig'
}

onMounted(() => {
  loadScenes()
})

/**
 * 加载场景列表（主表，不分页）
 */
function loadScenes() {
  defHttp.get({ url: api.queryAllList }, { withToken: true }).then((res: any) => {
    if (res?.success) {
      sceneList.value = res.result || []
    }
  })
}

/**
 * 新建场景 - 清空右侧表单
 */
function handleNewScene() {
  currentScene.value = null
  formState.value = { id: null, code: '', sceneName: '', pageRange: '' }
  singleFields.value = []
  comboFields.value = [[]]
  comboMetas.value = {}
  singleSearchValue.value = ''
  comboSearchValue.value = {}
}

/**
 * 选择场景 - 加载场景属性和字段明细
 */
function selectScene(item: any) {
  currentScene.value = item
  formState.value = {
    id: item.id,
    code: item.code || '',
    sceneName: item.sceneName || '',
    pageRange: item.pageRange || ''
  }
  loadSceneFields(item.id)
}

/**
 * 加载场景字段明细
 */
function loadSceneFields(sceneId: number) {
  defHttp.get({ url: api.queryFields, params: { sceneId } }, { withToken: true }).then((res: any) => {
    if (res?.success) {
      const fields = res.result || []
      singleFields.value = []
      comboFields.value = []
      comboMetas.value = {}

      // 找出组合父节点（parentId = 0, dataType = Array）
      const comboParents = fields.filter((f: any) => f.parentId === 0 && f.dataType === 'Array')

      // 解析单个字段（parentId = 0, dataType = String）
      fields.forEach((f: any) => {
        if (f.parentId === 0 && f.dataType === 'String') {
          singleFields.value.push({
            name: f.name || '',
            description: f.description || '',
            tblName: f.tblName || '',
            fieldName: f.fieldName || ''
          })
        }
      })

      // 解析组合字段
      comboParents.forEach((parent: any, index: number) => {
        const subFields = fields
          .filter((f: any) => f.parentId === parent.id)
          .map((f: any) => ({
            name: f.name || '',
            description: f.description || '',
            tblName: f.tblName || '',
            fieldName: f.fieldName || ''
          }))
        comboFields.value.push(subFields)
        comboMetas.value[index] = {
          name: parent.name || `组合${index + 1}`,
          tblName: parent.tblName || '',
          fieldName: parent.fieldName || ''
        }
      })

      if (comboFields.value.length === 0) {
        comboFields.value = [[]]
      }
    }
  })
}

/**
 * 单个字段变化（tags select 回车/删除）
 */
function onSingleFieldsChange(names: string[]) {
  singleFields.value = names.map(n => {
    const exist = singleFields.value.find(f => f.name === n)
    return exist || { name: n, description: '', tblName: '', fieldName: '' }
  })
  singleSearchValue.value = ''
}

/**
 * 组合字段变化
 */
function onComboFieldsChange(index: number, names: string[]) {
  comboFields.value[index] = names.map(n => {
    const exist = (comboFields.value[index] || []).find(f => f.name === n)
    return exist || { name: n, description: '', tblName: '', fieldName: '' }
  })
  comboSearchValue.value[index] = ''
}

/**
 * 点击"创建字段" - 单个字段
 */
function createSingleField() {
  if (singleSearchValue.value) {
    const newNames = [...singleFieldNames.value, singleSearchValue.value]
    onSingleFieldsChange(newNames)
    singleSearchValue.value = ''
  }
}

/**
 * 点击"创建字段" - 组合字段
 */
function createComboField(index: number) {
  const searchVal = comboSearchValue.value[index] || ''
  if (searchVal) {
    const currentNames = getComboFieldNames(index)
    const newNames = [...currentNames, searchVal]
    onComboFieldsChange(index, newNames)
    comboSearchValue.value[index] = ''
  }
}

/**
 * 新增组合
 */
function addCombo() {
  comboFields.value.push([])
  const newIndex = comboFields.value.length - 1
  comboMetas.value[newIndex] = { name: `组合${newIndex + 1}`, tblName: '', fieldName: '' }
}

/**
 * 删除组合
 */
function removeCombo(index: number) {
  comboFields.value.splice(index, 1)
  const newComboMetas: Record<number, ComboMeta> = {}
  Object.keys(comboMetas.value).forEach(key => {
    const k = parseInt(key)
    if (k > index) {
      newComboMetas[k - 1] = comboMetas.value[k]
    } else if (k < index) {
      newComboMetas[k] = comboMetas.value[k]
    }
  })
  comboMetas.value = newComboMetas
  if (comboFields.value.length === 0) {
    comboFields.value = [[]]
  }
}

/**
 * 删除场景
 */
function deleteScene(item: any) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除场景「${item.sceneName || item.code}」吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk() {
      defHttp.delete({ url: api.delete, params: { id: item.id } }, { withToken: true }).then((res: any) => {
        if (res?.success) {
          message.success('删除成功')
          if (currentScene.value?.id === item.id) {
            handleNewScene()
          }
          loadScenes()
        } else {
          message.error(res?.message || '删除失败')
        }
      })
    }
  })
}

/**
 * 保存场景配置
 */
function saveSceneConfig() {
  if (!formState.value.code) {
    message.warning('请输入场景编号')
    return
  }
  if (!formState.value.sceneName) {
    message.warning('请输入场景名称')
    return
  }

  const params = {
    id: formState.value.id || null,
    code: formState.value.code,
    sceneName: formState.value.sceneName,
    pageRange: formState.value.pageRange || '',
    singleFields: singleFields.value.map(f => ({
      name: f.name,
      description: f.description || '',
      tblName: f.tblName || '',
      fieldName: f.fieldName || ''
    })),
    comboFields: comboFields.value.map(combo =>
      combo.map(f => ({
        name: f.name,
        description: f.description || '',
        tblName: f.tblName || '',
        fieldName: f.fieldName || ''
      }))
    ),
    comboMetas: comboMetas.value
  }

  defHttp.post({ url: api.saveSceneConfig, data: params }, { withToken: true }).then((res: any) => {
    if (res?.success) {
      message.success('保存成功')
      loadScenes()
    } else {
      message.error(res?.message || '保存失败')
    }
  })
}
</script>

<style lang="less" scoped>
.ocr-scene-container {
  display: flex;
  height: calc(100vh - 120px);
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

// 左侧边栏
.scene-sidebar {
  width: 260px;
  min-width: 260px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    padding: 16px;
  }

  .scene-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px;

    .scene-item {
      margin: 0 16px;
      padding: 12px 0;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 1px solid #e8e9eb;

      &:hover {

        .delete-icon {
          opacity: 1;
        }
      }



      .scene-item-info {
        .scene-item-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;

          .scene-item-name {
            font-size: 13px;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
          }

          &.active {
            .scene-item-name {
              color: #1890ff !important;
            }
          }

          .delete-icon {
            opacity: 0;
            color: #ff4d4f;
            font-size: 14px;
            cursor: pointer;
            flex-shrink: 0;
            margin-left: 8px;
            transition: opacity 0.2s;

            &:hover {
              color: #cf1322;
            }
          }
        }

        .scene-item-meta {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }
}

// 右侧配置面板
.scene-config {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
}

// 下拉面板内容
.field-dropdown {
  padding: 4px 0;

  .create-field-option {
    padding: 6px 12px;
    cursor: pointer;
    font-size: 13px;
    color: #1890ff;

    &:hover {
      background: #f0f7ff;
    }
  }

  .dropdown-empty-hint {
    padding: 8px 12px;
    font-size: 13px;
    color: #999;
  }

  .field-detail-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    thead {
      tr {
        th {
          padding: 6px 12px;
          text-align: left;
          font-weight: 500;
          color: #666;
          background: #fafafa;
          border-bottom: 1px solid #f0f0f0;

          .help-icon {
            color: #bbb;
            margin-left: 2px;
            font-size: 12px;
          }
        }
      }
    }

    tbody {
      tr {
        &:hover {
          background: #fafafa;
        }

        td {
          padding: 4px 12px;
          border-bottom: 1px solid #f5f5f5;
          color: #333;

          &:first-child {
            white-space: nowrap;
          }
        }
      }
    }
  }
}

// 组合字段
.combo-group {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;

  .combo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .action-icon {
      color: #ff4d4f;
      cursor: pointer;

      &:hover {
        color: #cf1322;
      }
    }
  }
}
</style>

<!-- 隐藏下拉框中已选择的选项 -->
<style lang="less">
.field-tags-dropdown .ant-select-item-option {
  display: none;
}
</style>
