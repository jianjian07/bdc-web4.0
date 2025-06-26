<template>
  <div class="zscf-form">
    <a-spin :spinning="spinning">
      <a-form ref="formRef" :model="formState" :label-col="{ style: { width: '120px' } }" :labelWrap="true">
        <a-form-item label="不动产单元号" name="bdcdyh" required :rules=" [{ required: true, message: '请输入不动产单元号' }, { pattern: /^.{28}$/, message: '必须是28位' }]">
          <a-input v-model:value="formState.bdcdyh"></a-input>
        </a-form-item>
      </a-form>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
// 查封台账转正式查封
import { onMounted, ref } from "vue"
import { defHttp } from "/@/utils/http/axios"
import { message } from "ant-design-vue"
import { checkLogic } from "/@/utils/bdc/bdc"
import { router } from "/@/router"

const props = defineProps({
  formData: {
    type: Object,
    default: null
  }
})

let formState = ref<any>({
  bdcdyh: "",
})

let spinning = ref<boolean>(false)

let formRef = ref<any>()

enum api {
  start = '/api/zrzy-bdc/bdc/process/start',
  zscf = '/api/zrzy-bdc/bdc/bdcCftz/updateJcfStatus',
  check = '/api/zrzy-bdc/bdc/bdcCftz/checkBdcdyh'
}

onMounted(() => {
  if (props.formData) {
    formState.value.bdcdyh = props.formData.record.bdcdyh || ''
  }
})

/**
 * 创建查封登记流程
 */
function addCase() {
  return new Promise((resolve, reject) => {
    defHttp.post({ url: api.start, data: { lcid: '1869227861279985666' } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(res.result)
      } else {
        message.error(res?.message || '创建流程失败！')
        resolve(false)
      }
    })
  })
}


async function handleOk() {
  return new Promise(async (resolve) => {
    try {
      await formRef.value.validate();

      const bdcdyh = formState.value.bdcdyh;
      if (!bdcdyh) {
        message.error('请输入不动产单元号!');
        return resolve(false);
      }

      spinning.value = true;

      const checkRes = await validateBdcdyh(bdcdyh);
      if (!checkRes) {
        spinning.value = false;
        return resolve(false);
      }

      const data: any = await addCase();
      if (!data) {
        spinning.value = false;
        return resolve(false);
      }

      const bdcModels = {
        slbh: data.slbh,
        bdcModels: [
          {
            bdcdyh,
            ssywh: '',
            bdcqzh: '',
            qllx: '4'
          }
        ]
      };

      const logicOk = await checkLogic(bdcModels);
      if (!logicOk) {
        spinning.value = false;
        return resolve(false);
      }

      const _data = {
        ywlx: 2,
        slbh: data.slbh,
        lcid: "",
        dyhList: [
          {
            bdcdyh,
            ssywh: '',
            bdcqzh: '',
            qllx: '4'
          }
        ]
      };

      const res = await defHttp.post({
        url: '/api/zrzy-bdc/bdc/case/addCase',
        data: _data
      }, { withToken: true });

      if (res?.success) {
        message.success(res.message || '数据提取成功!');

        const updateStatus = await updateZscfStatus(data.slbh);
        if (updateStatus) {
          router.push({
            path: '/bdc/casedoing',
            query: {
              slbh: data.slbh,
              nodeId: data.nodeId,
              taskId: data.taskId
            }
          });
          spinning.value = false;
          return resolve(true);
        } else {
          spinning.value = false;
          return resolve(false);
        }
      } else {
        message.error(res?.message || '数据提取失败!');
        spinning.value = false;
        return resolve(false);
      }

    } catch (err) {
      console.error('handleOk error:', err);
      spinning.value = false;
      return resolve(false);
    }
  });
}

/**
 * 维护字段
 * @param slbh
 */
function updateZscfStatus(slbh) {
  return new Promise((resolve, reject) => {
    defHttp.put({
      url: api.zscf, params: { id: props.formData.record.id0, jfslbh: slbh}
    }, { withToken: true }).then((res) => {
      if (res.success) {
        resolve(true)
      } else {
        message.error(res?.message || '发生错误!')
        resolve(false)
      }
    })
  })
}

/**
 * 验证不动产单元号
 * @param bdcdyh
 */
function validateBdcdyh(bdcdyh) {
  return new Promise((resolve, reject) => {
    defHttp.get({ url: api.check, params: { bdcdyh: bdcdyh } }, { withToken: true }).then((res) => {
      if (res && res.success) {
        resolve(true)
      } else {
        message.error(res?.message || '验证不动产单元号失败!')
        resolve(false)
      }
    })
  })
}

defineExpose({
  handleOk
})
</script>

<style scoped lang="less">
.zscf-form {
  padding: 20px 0 0 0;
}
</style>