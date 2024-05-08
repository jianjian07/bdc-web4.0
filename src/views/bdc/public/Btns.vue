<template>
    <div class="foot-btn-css">
        <a-button type="link" @click="saveVue3">保存</a-button>
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
.foot-btn-css {
    background-color: #00b96b;
    height: 50px;
    position: fixed;
    bottom: 10px;
    width: 100%;
}
</style>