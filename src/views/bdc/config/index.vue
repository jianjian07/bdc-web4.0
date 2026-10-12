<template>
  <div class="zh-config-page">
    <!-- 顶部信息卡片 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <ApartmentOutlined />
        </div>
        <div class="header-text">
          <h2 class="header-title">组合登记 JSON 配置</h2>
          <p class="header-desc">
            可视化维护 <code>zh.json</code> 多级登记组合配置，支持新增、修改、删除节点，点击「保存」后写入数据库 <code>flow_config_json</code> 表
          </p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <div class="stat-value">{{ totalCount }}</div>
          <div class="stat-label">节点总数</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ rootCount }}</div>
          <div class="stat-label">根节点</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value" :class="{ 'stat-dirty': dirty }">{{ dirty ? '未保存' : '已同步' }}</div>
          <div class="stat-label">状态</div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="page-toolbar">
      <a-space :size="8">
        <a-button type="primary" :icon="h(PlusOutlined)" @click="handleAddRoot">新增根节点</a-button>
        <a-button :icon="h(ReloadOutlined)" :loading="loading" @click="loadData">重新加载</a-button>
        <a-button :icon="h(NodeExpandOutlined)" @click="toggleExpand(true)">展开全部</a-button>
        <a-button :icon="h(NodeCollapseOutlined)" @click="toggleExpand(false)">收起全部</a-button>
      </a-space>
      <a-input-search v-model:value="searchText" placeholder="搜索名称 / 编码" style="width: 240px" allow-clear />
      <a-button type="primary" size="large" :icon="h(SaveOutlined)" :loading="saving" :disabled="!dirty"
        @click="handleSave">
        全部保存到数据库
      </a-button>
    </div>

    <!-- 表格内容 -->
    <div class="page-content">
      <a-table :columns="columns" :data-source="filteredData" :loading="loading" :pagination="false"
        :expanded-row-keys="expandedKeys" row-key="key" size="middle" bordered class="zh-table"
        @expandedRowsChange="(keys: any) => (expandedKeys = keys as string[])">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            <span class="cell-index">{{ index + 1 }}</span>
          </template>

          <template v-else-if="column.dataIndex === 'label'">
            <div class="cell-label">
              <FolderOutlined v-if="record.children && record.children.length > 0" class="label-icon parent" />
              <FileTextOutlined v-else class="label-icon leaf" />
              <span class="label-text">{{ record.label || '-' }}</span>
              <a-badge v-if="record.children && record.children.length > 0" :count="record.children.length"
                :number-style="{ backgroundColor: '#722ed1', fontSize: '11px' }" />
            </div>
          </template>

          <template v-else-if="column.dataIndex === 'value'">
            <a-tag color="blue" class="cell-tag">{{ record.value || '-' }}</a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'xslx'">
            <a-tag color="green" class="cell-tag">{{ record.xslx || '-' }}</a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'gbdjlx'">
            <a-tag color="orange" class="cell-tag">{{ record.gbdjlx || '-' }}</a-tag>
          </template>

          <template v-else-if="column.dataIndex === 'action'">
            <a-space :size="4">
              <a-tooltip title="新增子节点">
                <a-button type="link" size="small" class="action-btn add" @click="handleAddChild(record)">
                  <template #icon>
                    <PlusOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-tooltip title="编辑">
                <a-button type="link" size="small" class="action-btn edit" @click="handleEdit(record)">
                  <template #icon>
                    <EditOutlined />
                  </template>
                </a-button>
              </a-tooltip>
              <a-popconfirm title="确定删除该节点及其所有子节点吗?" ok-text="确定" cancel-text="取消" placement="left"
                @confirm="handleDelete(record)">
                <a-tooltip title="删除">
                  <a-button type="link" size="small" danger class="action-btn del">
                    <template #icon>
                      <DeleteOutlined />
                    </template>
                  </a-button>
                </a-tooltip>
              </a-popconfirm>
            </a-space>
          </template>
        </template>

        <template #emptyText>
          <div class="empty-wrapper">
            <a-empty description="暂无配置数据">
              <a-button type="primary" :icon="h(PlusOutlined)" @click="handleAddRoot">立即新增</a-button>
            </a-empty>
          </div>
        </template>
      </a-table>
    </div>

    <ZhModal ref="zhModalRef" @ok="handleModalOk" />
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed, onMounted, onBeforeUnmount } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { defHttp } from '/@/utils/http/axios';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  ReloadOutlined,
  NodeExpandOutlined,
  NodeCollapseOutlined,
  ApartmentOutlined,
  FolderOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue';
import ZhModal from './components/zhModal.vue';

enum Api {
  list = '/api/zrzy-bdc/config/json/list',
  save = '/api/zrzy-bdc/config/json/save',
}

interface ZhNode {
  key: string;
  label: string;
  value: string;
  xslx: string;
  gbdjlx: string;
  children?: ZhNode[];
  [prop: string]: any;
}

const columns = [
  { title: '#', dataIndex: 'index', width: 60, align: 'center' as const },
  { title: '名称', dataIndex: 'label', width: 320 },
  { title: '登记类型', dataIndex: 'value', width: 140, align: 'center' as const },
  { title: '显示类型', dataIndex: 'xslx', width: 160, align: 'center' as const },
  { title: '国标登记类型', dataIndex: 'gbdjlx', width: 200, align: 'center' as const },
  { title: '操作', dataIndex: 'action', width: 140, align: 'center' as const, fixed: 'right' as const },
];

const treeData = ref<ZhNode[]>([]);
const expandedKeys = ref<string[]>([]);
const loading = ref<boolean>(false);
const saving = ref<boolean>(false);
const dirty = ref<boolean>(false);
const searchText = ref<string>('');
const zhModalRef = ref<any>(null);

let keySeq = 0;
function genKey(): string {
  keySeq += 1;
  return `zh_${Date.now()}_${keySeq}`;
}

const rootCount = computed(() => treeData.value.length);

const totalCount = computed(() => {
  const walk = (list: ZhNode[]): number =>
    list.reduce((acc, node) => acc + 1 + (node.children ? walk(node.children) : 0), 0);
  return walk(treeData.value);
});

/**
 * 搜索过滤（保留命中节点的祖先链）
 */
const filteredData = computed(() => {
  const kw = searchText.value.trim().toLowerCase();
  if (!kw) return treeData.value;
  const filter = (list: ZhNode[]): ZhNode[] => {
    const result: ZhNode[] = [];
    list.forEach((node) => {
      const hitSelf =
        (node.label || '').toLowerCase().includes(kw) || (node.value || '').toLowerCase().includes(kw);
      const hitChildren = node.children ? filter(node.children) : [];
      if (hitSelf || hitChildren.length > 0) {
        result.push({ ...node, children: hitChildren.length > 0 ? hitChildren : node.children });
      }
    });
    return result;
  };
  return filter(treeData.value);
});

onMounted(() => {
  loadData();
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (dirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
}

/**
 * 加载 zh.json 数据
 */
function loadData() {
  if (dirty.value) {
    Modal.confirm({
      title: '存在未保存的修改',
      content: '重新加载将丢弃当前未保存的修改，是否继续？',
      okText: '继续加载',
      cancelText: '取消',
      onOk: () => doLoad(),
    });
    return;
  }
  doLoad();
}

function doLoad() {
  loading.value = true;
  defHttp
    .get({ url: Api.list }, { withToken: true })
    .then((res: any) => {
      if (res?.success) {
        const list = (res.result || []) as any[];
        treeData.value = list.map((item) => normalizeNode(item));
        // expandedKeys.value = collectAllKeys(treeData.value);
        dirty.value = false;
      } else {
        message.warning(res?.message || '加载 zh.json 失败');
      }
    })
    .catch((err: any) => {
      message.error('加载 zh.json 失败：' + (err?.message || ''));
    })
    .finally(() => {
      loading.value = false;
    });
}

function normalizeNode(item: any): ZhNode {
  const node: ZhNode = {
    key: genKey(),
    label: item?.label ?? '',
    value: item?.value ?? '',
    xslx: item?.xslx ?? '',
    gbdjlx: item?.gbdjlx ?? '',
  };
  if (Array.isArray(item?.children) && item.children.length > 0) {
    node.children = item.children.map((child: any) => normalizeNode(child));
  }
  return node;
}

function collectAllKeys(nodes: ZhNode[]): string[] {
  const keys: string[] = [];
  const walk = (list: ZhNode[]) => {
    list.forEach((node) => {
      keys.push(node.key);
      if (node.children && node.children.length > 0) walk(node.children);
    });
  };
  walk(nodes);
  return keys;
}

function toggleExpand(expand: boolean) {
  expandedKeys.value = expand ? collectAllKeys(treeData.value) : [];
}

function handleAddRoot() {
  zhModalRef.value?.open({ mode: 'add', node: null, parent: null });
}

function handleAddChild(dataRef: ZhNode) {
  zhModalRef.value?.open({ mode: 'add', node: null, parent: dataRef });
}

function handleEdit(dataRef: ZhNode) {
  zhModalRef.value?.open({ mode: 'edit', node: dataRef, parent: null });
}

function handleDelete(dataRef: ZhNode) {
  const removeNode = (list: ZhNode[]): boolean => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].key === dataRef.key) {
        list.splice(i, 1);
        return true;
      }
      if (list[i].children && removeNode(list[i].children!)) return true;
    }
    return false;
  };
  if (removeNode(treeData.value)) {
    dirty.value = true;
    message.success('已删除，请点击「保存」写入文件');
  } else {
    message.warning('未找到要删除的节点');
  }
}

function handleModalOk(payload: { mode: 'add' | 'edit'; data: any; target?: ZhNode | null; parent?: ZhNode | null }) {
  if (payload.mode === 'edit') {
    updateNode(payload.target!, payload.data);
    message.success('已修改，请点击「保存」写入文件');
  } else {
    const newNode: ZhNode = {
      key: genKey(),
      label: payload.data.label ?? '',
      value: payload.data.value ?? '',
      xslx: payload.data.xslx ?? '',
      gbdjlx: payload.data.gbdjlx ?? '',
    };
    if (payload.parent) {
      if (!payload.parent.children) payload.parent.children = [];
      payload.parent.children.push(newNode);
      if (!expandedKeys.value.includes(payload.parent.key)) {
        expandedKeys.value = [...expandedKeys.value, payload.parent.key];
      }
    } else {
      treeData.value.push(newNode);
    }
    message.success('已新增，请点击「保存」写入文件');
  }
  dirty.value = true;
}

function updateNode(target: ZhNode, data: any) {
  target.label = data.label ?? '';
  target.value = data.value ?? '';
  target.xslx = data.xslx ?? '';
  target.gbdjlx = data.gbdjlx ?? '';
}

function serialize(nodes: ZhNode[]): any[] {
  return nodes.map((node) => {
    const item: any = {
      label: node.label,
      value: node.value,
      xslx: node.xslx,
      gbdjlx: node.gbdjlx,
    };
    if (node.children && node.children.length > 0) item.children = serialize(node.children);
    return item;
  });
}

function handleSave() {
  saving.value = true;
  const data = serialize(treeData.value);
  defHttp
    .post({ url: Api.save, data }, { withToken: true })
    .then((res: any) => {
      if (res?.success) {
        message.success(res?.message || res?.result || '保存成功');
        dirty.value = false;
        doLoad();
      } else {
        message.error(res?.message || '保存失败');
      }
    })
    .catch((err: any) => {
      message.error('保存失败：' + (err?.message || ''));
    })
    .finally(() => {
      saving.value = false;
    });
}
</script>

<style scoped lang="less">
.zh-config-page {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f5f7fa 0%, #eef1f6 100%);
  overflow: auto;

  // 顶部信息卡片
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.18);
    margin-bottom: 14px;
    color: #fff;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .header-icon {
        width: 52px;
        height: 52px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.22);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        backdrop-filter: blur(6px);
      }

      .header-text {
        .header-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .header-desc {
          margin: 6px 0 0;
          font-size: 13px;
          opacity: 0.88;

          code {
            background: rgba(255, 255, 255, 0.2);
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 12px;
            color: #fff;
          }
        }
      }
    }

    .header-stats {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 10px 22px;
      background: rgba(255, 255, 255, 0.16);
      border-radius: 10px;
      backdrop-filter: blur(6px);

      .stat-item {
        text-align: center;
        min-width: 70px;

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.2;

          &.stat-dirty {
            color: #ffe58f;
          }
        }

        .stat-label {
          margin-top: 4px;
          font-size: 12px;
          opacity: 0.85;
        }
      }

      .stat-divider {
        width: 1px;
        height: 32px;
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  // 工具栏
  .page-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-bottom: 14px;
  }

  // 内容区
  .page-content {
    flex: 1;
    background: #fff;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    overflow: auto;
  }

  .zh-table {
    :deep(.ant-table-thead > tr > th) {
      background: #fafbfc;
      font-weight: 600;
      color: #1f2937;
      border-bottom: 1px solid #ebedf0;
    }

    :deep(.ant-table-tbody > tr:hover > td) {
      background: #f0f9ff !important;
    }

    :deep(.ant-table-row-indent) {
      padding-right: 4px;
    }

    .cell-index {
      display: inline-block;
      width: 22px;
      height: 22px;
      line-height: 22px;
      border-radius: 50%;
      background: #f0f2f5;
      color: #6b7280;
      font-size: 12px;
      font-weight: 500;
    }

    .cell-label {
      display: flex;
      align-items: center;
      gap: 8px;

      .label-icon {
        font-size: 15px;

        &.parent {
          color: #1890ff;
        }

        &.leaf {
          color: #8c8c8c;
        }
      }

      .label-text {
        font-weight: 500;
        color: #1f2937;
      }
    }

    .cell-tag {
      margin: 0;
      font-family: 'JetBrains Mono', Consolas, monospace;
      letter-spacing: 0.3px;
    }

    .action-btn {
      padding: 0 6px;
      height: 26px;

      &.add {
        color: #52c41a;
      }

      &.edit {
        color: #1890ff;
      }

      &.del {
        color: #ff4d4f;
      }
    }
  }

  .empty-wrapper {
    padding: 40px 0;
  }
}
</style>
