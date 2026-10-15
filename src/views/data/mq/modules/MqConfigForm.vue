<template>
  <div class="mq-config-form">
    <div v-if="!selectItem" class="mq-empty">
      <a-empty description="请先选中一条数据"></a-empty>
    </div>
    <div v-else class="mq-config-form-content">
      <a-spin :spinning="formSpinning" class="file-form-spin">
        <a-form ref="formRef" :label-col="{ span: 4 }" :model="formState" :rules="rules" :wrapper-col="{ span: 18 }"
          style="padding-top: 20px">
          <a-row>
            <a-col :md="24">
              <a-form-item label="队列类型" name="mqlx">
                <a-select v-model:value="formState.mqlx" :disabled="formState.type == 'tag'"
                  @change="topicDataChange($event, formState)" :options="getDictItemsByCode('mq_type')" />
              </a-form-item>
            </a-col>
            <a-col :md="24">
              <a-form-item label="主题" name="topic">
                <a-input v-model:value="formState.topic" :disabled="formState.type == 'tag'"
                  @change="topicDataChange($event, formState)" />
                <span class="tip-css">命名规则：tp_</span>
              </a-form-item>
            </a-col>
          </a-row>
          <template v-if="selectItem?.type == 'tag'">
            <a-row>
              <a-col :md="24">
                <a-form-item label="Tag标签" name="tag">
                  <a-input v-model:value="formState.tag" placeholder="" />
                  <span class="tip-css">命名规则：tag_ </span>
                </a-form-item>
              </a-col>
              <a-col :md="24">
                <a-form-item label="接口" name="api">
                  <a-transfer v-model:target-keys="targetKeys" :data-source="dataSource"
                    :list-style="{ width: '320px', height: '300px' }">
                    <template #render="item">
                      <a-tooltip placement="rightBottom" color="#108ee9">
                        <template #title>
                          {{ item.title }}
                        </template>
                        {{ item.title }}
                      </a-tooltip>
                    </template>
                    <template #children="{ direction, selectedKeys, onItemSelect }">
                      <a-tree v-if="direction === 'left'" block-node checkable check-strictly default-expand-all
                        class="mq-left-tree" :checked-keys="[...selectedKeys, ...targetKeys]" :tree-data="treeData"
                        @check="(_, props) => {
      onChecked(props, [...selectedKeys, ...targetKeys], onItemSelect);
    }
      " @select="(_, props) => {
      onChecked(props, [...selectedKeys, ...targetKeys], onItemSelect);
    }
      ">
                        <template #title="node">
                          <div class="tree-row-content">

                            <a-tooltip placement="rightBottom" color="#108ee9">
                              <template #title>
                                {{ node.title }}
                              </template>
                              <span class="left-name">
                                {{ node.title }}
                              </span>
                            </a-tooltip>

                          </div>
                        </template>
                      </a-tree>
                    </template>

                  </a-transfer>
                </a-form-item>
              </a-col>
              <a-col :md="24">
                <a-form-item label="备注" name="bz">
                  <a-textarea v-model:value="formState.bz" />
                </a-form-item>
              </a-col>
              <a-col :md="24">
                <a-form-item label="状态" name="status">
                  <a-switch v-model:checked="formState.status" :checked-value="1" :un-checked-value="0" />
                </a-form-item>
              </a-col>
              <a-col :md="24">
                <a-form-item :wrapper-col="{ offset: 4, span: 18 }">
                  <a-button type="primary" @click="handleSave">
                    <template #icon>
                      <CheckOutlined />
                    </template>
                    保存
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </template>
        </a-form>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { getDictItemsByCode } from '/@/views/online/utils/commonUtils'
import { CheckOutlined } from '@ant-design/icons-vue'
const userStore = useUserStore();
const userInfo = userStore.getUserInfo
import dayjs from "dayjs"
import { useUserStore } from "/@/store/modules/user"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"

const props = defineProps({
  selectItem: {
    type: Object,
    default: {}
  },
  apiData: {
    type: Array,
    default: []
  }
})

let formRef = ref()
let formSpinning = ref<boolean>(false)
let formState = ref<any>({})
let rules = ref<any>({
  mqlx: { required: true, message: '请选择队列类型', trigger: 'blur' },
  topic: [{ required: true, message: '请输入Topic主题' }, { pattern: /^tp_.*/, message: '必须以tp_开头' }],
  tag: [{ required: true, message: '请输入Tag' }, { pattern: /^tag_.*/, message: '必须以tag_开头' }]
})

let tData = [];

const transferDataSource = ref<any>([]);

function flatten(list = []) {
  list.forEach(item => {
    transferDataSource.value.push(item);
    flatten(item.children);
  });
}

// flatten(JSON.parse(JSON.stringify(tData)));

function isChecked(selectedKeys: (string | number)[], eventKey: string | number) {
  return selectedKeys.indexOf(eventKey) !== -1;
}

function handleTreeData(treeNodes, targetKeys: string[] = []) {
  return treeNodes.map(({ children, code, ...props }) => ({
    ...props,
    disabled: targetKeys.includes(props.key as string) || !code || !props.dirId,
    children: handleTreeData(children ?? [], targetKeys),
  }));
}
const targetKeys = ref<string[]>([]);

const dataSource = transferDataSource;

const treeData = computed(() => {
  return handleTreeData(tData, targetKeys.value);
});

const onChecked = (
  e,
  checkedKeys: string[],
  onItemSelect: (n: any, c: boolean) => void,
) => {
  const { eventKey } = e.node;
  onItemSelect(eventKey, !isChecked(checkedKeys, eventKey));
};

enum api {
  add = '/api/zrzy-api/api/mq/config/add',
  edit = '/api/zrzy-api/api/mq/config/update'
}

const emit = defineEmits(['getSelectItem'])

watch(() => props.apiData, (newVal) => {
  if (newVal) {
    tData = mapTreeFields(newVal)
    flatten(JSON.parse(JSON.stringify(tData)));
  }
}, {
  deep: true,
  immediate: true
})

watch(() => props.selectItem, (newVal: any) => {
  formRef.value?.resetFields()
  if (newVal) {
    formState.value = JSON.parse(JSON.stringify(newVal))
    targetKeys.value = formState.value.api ? formState.value.api.split(',') : []
  }
}, {
  deep: true,
  immediate: true
})

function mapTreeFields(tree) {
  return tree.map(node => {
    const newNode = {
      ...node,
      key: node.code,
      title: `${node.name}(${node.code})`,
      children: node.apiList ? mapTreeFields(node.apiList) : []
    };
    return newNode;
  });
}

/**
 * 目录数据改变
 * 其子接口对应的数据也改变
 * @param e
 * @param dir
 */
function topicDataChange(e, topic) {
  if (topic.children && topic.children.length > 0) {
    topic.children = topic.children.map((child) => {
      child.topic = topic.topic
      child.mqlx = topic.mqlx
      return child
    })
  }
  topic.title = topic.topic
  emit('getSelectItem', { ...topic })
}

/**
 * 保存
 */
function handleSave() {
  formRef.value.validate().then(() => {
    let params = JSON.parse(JSON.stringify(formState.value))
    params.status = params.status || 0
    params.updateTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    params.updateBy = userInfo.username
    let apiUrl = ''
    let oid = JSON.parse(JSON.stringify(params.id))
    if (params.id.includes('新增')) {
      apiUrl = api.add
      params.createTime = params.updateTime
      params.createBy = params.updateBy
      delete params.id
    } else {
      apiUrl = api.edit
    }
    params.api = targetKeys.value.join(',')
    defHttp.post({ url: apiUrl, data: params }, { withToken: true }).then((res) => {
      if (res && res.success) {
        emit('getSelectItem', { ...params, oid: oid, id: res.result, title: params.tag })
        // props.selectItem =  { ...params, id: res.result }
        message.success('保存成功!')
      } else {
        message.warning('保存失败!')
      }
    })
  })
}
</script>

<style lang="less" scoped>
.mq-config-form {
  width: 100%;
  height: 100%;

  .mq-config-form-content {
    height: 100%;

    .mq-config-form-spin {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }


  .mq-empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :deep(.ant-transfer-list-body) {
    overflow: auto;
  }
}

.tip-css {
  color: gray;
  line-height: 30px;
}

.mq-left-tree {
  .tree-row-content {
    display: flex;

    .left-name {
      width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>