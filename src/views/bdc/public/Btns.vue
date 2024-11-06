<template>
    <div class="foot-css">
        <div class="foot-btn-css" style="width: 300px;">
            <a-space>
                <a-button type="primary" size="small" @click="saveVue3">保存</a-button>
                <a-button type="primary" size="small" @click="saveVue3">移交</a-button>
                <a-button type="primary" size="small" @click="saveVue3">回退</a-button>
            </a-space>
        </div>
        <div class="foot-btn-css foot-btn-right-css">
            <a-space>
                <a-button type="primary" size="small" @click="saveVue3">查看附件</a-button>
                <a-button type="primary" size="small" @click="saveVue3">楼盘表</a-button>
                <a-button type="primary" size="small" @click="saveVue3">图形</a-button>
            </a-space>
        </div>
    </div>
</template>

<script setup lang="ts">
import { sendSaveFun } from './bdc';

const props = defineProps({
    vueRefs: {
        type: Object,
        default: []
    }
})
let vueRefs: any = []
vueRefs = props.vueRefs
function saveVue3() {
    checkDemoRefs()
    sendSaveFun('baseSave', vueRefs)
}
/**
 * 获取dom
 */
function checkDemoRefs() {
    debugger
    if (vueRefs && vueRefs[0]) {
        let el = vueRefs[0]
        if (el && el.$.exposed && el.$.exposed.multipleRef) {
            let arr = el.$.exposed.multipleRef()
            if (arr) {
                vueRefs = [el, ...arr]
                // 去重
                vueRefs = Array.from(new Set(vueRefs))
                console.log('vueRefs', vueRefs)
            }
        }
    }
}
</script>

<style scoped lang="less">
.foot-css {
    height: 45px;
    background-color: #1890ff33;
    padding: 5px;
    display: flex;
}

.foot-btn-css {
    background-color: #fff;
    height: 35px;
    line-height: 35px;
    padding: 0px 10px;
}

.foot-btn-right-css {
    position: absolute;
    right: 0px;
    text-align: right;
}
</style>