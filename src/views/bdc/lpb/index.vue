<template>
    <div style="width: 100%; text-align: center;">
        <div>
            <a-space>
                图例版：
                <span class="zt" style="background-color: #C0C0C0"></span>查封
                <span class="zt" style="background-color: #0000FF"></span> 抵押
                <span class="zt" style="background-color: #9900FF"></span> 预告
                <span class="zt" style="background-color: #FF0000"></span> 产权
            </a-space>
        </div>
        <a-divider></a-divider>
        <table style="margin: auto;">
            <thead>
                <tr class="title">
                    <td style="border: 0;background-color: #fff;"> </td>
                    <td style="border: 0;background-color: #fff;"> </td>
                    <td colspan="6" id="divtitle"
                        style="border: 0;background-color: #39bd8a;border-radius: 26px 26px 0px 0px; /* 去掉右下角的圆角 */">
                        {{ zl }}
                    </td>
                </tr>
                <tr class="title">
                    <td>物理层</td>
                    <td>名义层</td>
                    <td v-for="(item, index) in dyxx" :key="'dy' + index" colspan="3">{{ item.dyh }}单元</td>
                </tr>
            </thead>
            <tr v-for="(cInfo) in cxx1" :key="cInfo.wlc">
                <td class="title">{{ cInfo.wlc }}</td>
                <td class="title">{{ cInfo.myc }}层</td>
                <template v-for="(dy) in dyxx" :key="cInfo.wlc.toString()+dy.dyh">
                    <td v-for="(fwInfo, i) in fwxx.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh)"
                        :colspan="fwInfo.colspan" :rowspan="fwInfo.rowspan" :key="i"
                        :class="checkDyh === fwInfo.bdcdyh ? 'dy-css' : 'dy-css-base'" @click="onCheck(fwInfo)">
                        {{ fwInfo.shbw }}
                        <div>
                            <span v-if="fwInfo.cfzt == 1" class="zbzt" style="background-color: #C0C0C0;"></span>
                            <span v-if="fwInfo.dyzt == 1" class="zbzt" style="background-color: #0000FF;"></span>
                            <span v-if="fwInfo.ygzt == 1" class="zbzt" style="background-color: #9900FF;"></span>
                            <span v-if="fwInfo.cqzt == 1" class="zbzt" style="background-color: #FF0000;"></span>
                        </div>

                        <!-- {{ fwInfo.shbw + '|' + fwInfo.colspan }} -->
                    </td>
                    <!-- <td v-for="(item) in cInfo.hh" :key="cInfo.wlc.toString() + item" class="dy-css"
                        :rowspan="getShbw(cInfo.wlc, dy.dyh, item)?.conspan">
                        <div v-if="getShbw(cInfo.wlc, dy.dyh, item)">
                            {{ getShbw(cInfo.wlc, dy.dyh, item).shbw }}

                        </div>
                        <div v-else></div>
                    </td> -->
                </template>
            </tr>
            <!-- <tr v-for="(cInfo) in cxx2" :key="cInfo.wlc">
                <td>{{ cInfo.wlc }}</td>
                <td>{{ cInfo.myc }}层</td>
                <template v-for="(dy) in dyxx" :key="cInfo.wlc.toString()+dy.dyh">
                    <td v-for="(item) in cInfo.hh" class="dy-css">
                        <div v-if="getShbw(cInfo.wlc, dy.dyh, item)">
                            {{ getShbw(cInfo.wlc, dy.dyh, item) }}
                        </div>
                        <div v-else></div>
                    </td>
                </template>
            </tr> -->
        </table>
        <div v-if="showAll && cxx.length > 5" style="text-align: center;padding: 10px;">
            当前只显示<span style="color: #1677ff;">5</span>层，点击 <a-button type="link" @click="onShowAll">加载全部</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
let checkDyh = ref('')
// function getShbw(wlc: any, dyh: any, hbh: any) {
//     const match = fwxx.find((t: any) => t.wlc === wlc && t.dyh === dyh && t.hbh === hbh);
//     return match ? match : null;
// }
function onCheck(row: any) {
    checkDyh.value = row.bdcdyh
    console.log(row);
}
let zl = '园林办事处（城南）第二十五街坊潜江市红梅东路3号名筑仕嘉16栋'
let showAll = ref(false)
const date1 = new Date().getTime()
console.log('date1:' + date1)
let dyxx: any = []
let cxx: any = []
let fwxx: any = []
await loadFwxx()
async function loadFwxx() {
    const res = await defHttp.get({ url: '/api/zrzy-bdc/bdc/lpb/lpb', params: { zbm: '05048025GB00202000216' } }, { withToken: true })
    dyxx = res.result.dyhList
    cxx = res.result.cxxList
    fwxx = res.result.fwList
}
// console.log(fwxx)
const date2 = new Date().getTime()
console.log('date2:' + date2)
console.log('时间差:' + (date2 - date1))
let cxx1: any = ref([]);
let cxx2: any = ref([]);
if (cxx.length > 5) {
    cxx1.value = cxx.slice(cxx.length - 5, cxx.length)
    showAll.value = true
} else {
    cxx1.value = cxx
}
function onShowAll() {
    showAll.value = false
    // cxx2.value = cxx.slice(10, cxx.length)
    cxx1.value = cxx
}
// watch(() => cxx1.value, async (newVal) => {
//     console.log("cxx1变了" + newVal)
// })
</script>

<style scoped lang="less">
td {
    border: 1px solid #39bd8a;
    width: 70px;
    height: 30px;
}

.title {

    background-color: #f2f2f2;
}

.zt {

    width: 8px;
    height: 8px;
    float: left;
    margin-left: 8px;
    border-radius: 50%;
}

.zbzt {
    width: 6px;
    height: 6px;
    float: left;
    margin-left: 2px;
    border-radius: 3px;
}

.dy-css-base {
    cursor: pointer;
}

.dy-css {
    right: 0;
    bottom: 0;
    cursor: pointer;
    position: relative;

    &:before {
        content: "";
        position: absolute;
        right: 0;
        bottom: 0;
        border: 12px solid rgba(255, 153, 0, 0.8);
        border-top-color: transparent;
        border-left-color: transparent;
    }

    &:after {
        content: "";
        width: 5px;
        height: 10px;
        position: absolute;
        right: 4px;
        bottom: 5px;
        border: 1px solid #fff;
        border-top-color: transparent;
        border-left-color: transparent;
        transform: rotate(45deg);
    }
}
</style>