<template>
  <div class="addNewContent">
    <!-- 新增目录 -->
    <a-form
      ref="formRef"
      :model="regionState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 16 }"
      :rules="catalogRules"
    >
      <a-form-item
        label="区域名称"
        ref="areaName"
        name="areaName"
      >
        <a-input v-model:value="regionState.areaName" />
      </a-form-item>
      <a-form-item
        label="上级区域"
        ref="parentCode"
        name="parentCode"
        v-if="formData?.type !=='parent'"
      >
        <a-select :fieldNames="fieldNames" v-model:value="regionState.parentCode" :options="regionList"/>
      </a-form-item>
      <a-form-item
        label="区域代码"
        ref="areaCode"
        name="areaCode"
      >
        <a-input v-model:value="regionState.areaCode" />
      </a-form-item>
      <a-form-item
        label="区域简称"
        ref="simpleName"
        name="simpleName"
      >
        <a-input v-model:value="regionState.simpleName" />
      </a-form-item>
      <a-form-item
        label="排序"
        ref="orderNum"
        name="orderNum"
      >
        <a-input v-model:value="regionState.orderNum" />
      </a-form-item>
    </a-form>
    <a-space v-if='selectInfo' style="display: flex; align-items: center; justify-content: center; width: 100%;">
      <a-button type="default" @click="resetRegion()">重置</a-button>
      <a-button type="primary" @click="addRegion()">保存</a-button>
    </a-space>  
  </div>
</template>

<script setup lang="ts">
import { defineProps, reactive, ref, watch } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message } from 'ant-design-vue';

const props = defineProps({
  formData: { //流程信息
    type: Object,
    default: {}
  },
  selectInfo: {
    type: Object,
    default: null
  },
  regionData: {
    type: Array,
    default: []
  }
})
const formRef = ref()

const regionState = reactive({
  areaName: '',
  parentCode: '0',
  areaCode: '',
  simpleName: '',
  orderNum: ''
});

const catalogRules: any = {
  areaName: [
    { required: true, message: '请输入区域名称', trigger: 'change' },
  ],
  areaCode: [
    { required: true, message: '请输入区域代码', trigger: 'change' },
  ]
}

const fieldNames = { label: 'areaName', value: 'areaCode', }
let regionList:any = ref([])

const urlList = {
  add: '/api/zrzy-bdc/sys/areacode/add',
  edit: '/api/zrzy-bdc/sys/areacode/edit',
  validateKey: '/api/zrzy-bdc/sys/areacode/validatorKey',
  queryList: '/api/zrzy-bdc/sys/areacode/queryAreaTree',
}

const emit = defineEmits(['refreshList'])
let showModal = ref(false)

loadRegionList()

watch(() => props.selectInfo, (val) => {
  if(val) {
    regionState.areaName = val.areaName
    regionState.areaCode = val.areaCode
    regionState.parentCode = val.parentCode
    regionState.simpleName = val.simpleName
    regionState.orderNum = val.orderNum
  }
}, {
  immediate: true,
  deep: true
})

watch(() => props.formData, (val) => {
  if(val && val.type == 'child') {
    regionState.parentCode = val.parentNode.areaCode
  }
}, {
  immediate: true,
  deep: true
})

// 添加区域
const addRegion = () => {
  return new Promise((resolve, reject) => {
    formRef.value
      .validate()
      .then(() => {
        let params = {
              areaName: regionState.areaName,
              areaCode: regionState.areaCode,
              parentCode: regionState.parentCode,
              simpleName: regionState.simpleName,
              level: getCodeLevel(Number(regionState.areaCode)),
              orderNum: regionState.orderNum
            }
        // 新增时判断区域代码是否已经存在
        if(!props.selectInfo) {
          defHttp.get(
            {
              url: urlList.validateKey,
              params: { areaCode: regionState.areaCode }
            },
            { withToken: true}
          ).then((res: any) => {
            if(!res.success) {
              message.warning(res.message)
              return reject()
            } else {
              // 新增
              defHttp.post(
                {
                  url: urlList.add,
                  data: params
                },
                { withToken: true }
              ).then((res: any) => {
                if(res?.success) {
                  if (props.selectInfo) {
                    message.success('区域修改成功！')
                    // 刷新树
                    emit('refreshList')
                  } else {
                    loadRegionList()
                    message.success('区域新增成功！')
                  } 
                  return resolve(true)
                } else {
                  message.warning(res?.message)
                  return reject()
                }
              })
            }
          })
        } else {
          // 修改
          defHttp.put(
            {
              url: urlList.edit,
              data: params
            },
            { withToken: true }
          ).then((res: any) => {
            if(res?.success) {
              if (props.selectInfo) {
                message.success('区域修改成功！')
                // 刷新树
                emit('refreshList')
              } else {
                message.success('区域新增成功！')
              } 
              return resolve(true)
            } else {
              message.warning(res?.message)
              return reject()
            }
          })
        }
      }).catch((error:any) => {
        console.log('error', error);
      });
  })
}

function getCodeLevel(code) {
  let level = 0
  if (code % 100 !== 0) {
    level = 3
  } else if (code % 10000 !== 0) {
    level = 2
  } else {
    level = 1
  }
  return level
}

// 重置区域
const resetRegion = () => {
  if(props.selectInfo) {
    regionState.areaName = props.selectInfo.areaName
    regionState.simpleName = props.selectInfo.simpleName
  }
}


function loadRegionList() {
  regionList.value = []
  defHttp.get(
    {
      url: urlList.queryList,
    },
    { withToken: true }
  ).then((res: any) => {
    if (res?.success) {
      regionList.value.push({'areaName': '无', 'areaCode': '0'})
      flattenArray(res.result)
      showModal.value = true
    } else {
      message.warning(res?.message || '未查询到行政区数据！')
    }
  })
}

function flattenArray(arr) {
  arr.forEach(element => {
    regionList.value.push({areaName: element.areaName, areaCode: element.areaCode})
    if(element.children?.length) {
      flattenArray(element.children)
    }
  });
}


defineExpose({
  addRegion
});

</script>

<style scoped lang="less">
</style>