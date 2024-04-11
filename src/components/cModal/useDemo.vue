<template>
  <a-button @click="showModal">打开弹窗</a-button>
  <a-button @click="showModalDefault">打开弹窗2</a-button>
</template>

<script lang="ts" setup>
import { cModal } from "/@/components/cModal/index"
import { onBeforeUnmount } from "vue"
// 用法示例

let modal: any
// 如果需要弹窗不销毁 需要自己写方法
// 并最好在自己组件销毁时 对弹窗进行销毁不然会占用dom
function showModal() {
  if (modal) {
    modal.show()
  } else {
    modal = cModal({
      title: 'test',
      width: 1000,
      onOk: (res: any) => {
        // res为弹窗内组件的dom
        let validator = res.onSubmit()
        if (validator) {
          modal.setConfirmLoading(true)
          setTimeout(() => {
            modal.setConfirmLoading(false)
            modal.destroy()
            modal = null
          },2000)
        }
      },
      onCancel: () => {
        modal.close()
      }
    })
  }
}

// 不传确定或却笑方法时 默认关闭弹窗并销毁dom
function showModalDefault() {
  let modal1 = cModal({
    title: 'test',
    width: 1000,
    onOk: (res: any) => {
      // res为弹窗内组件的dom
      let validator = res.onSubmit()
      if (validator) {
        modal1.setConfirmLoading(true)
        setTimeout(() => {
          modal1.setConfirmLoading(false)
          modal1.destroy()
        },2000)
      }
    }
  })
}

onBeforeUnmount(() => {
  modal?.destroy()
})
</script>

<style scoped>

</style>
