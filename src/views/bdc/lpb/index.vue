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
                    <td colspan="6" style="border: 0;background-color: #39bd8a; border-top-left-radius: 40px;
  border-top-right-radius:40px;
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0; /* 去掉右下角的圆角 */;"></td>
                </tr>
                <tr class="title">
                    <td>物理层</td>
                    <td>名义层</td>
                    <td v-for="(item, index) in dyxx" :key="'dy' + index" colspan="3">{{ item.dymc }}</td>
                </tr>
            </thead>
            <tr v-for="(cInfo) in cxx1" :key="cInfo.wlc">
                <td class="title">{{ cInfo.wlc }}</td>
                <td class="title">{{ cInfo.myc }}层</td>
                <template v-for="(dy) in dyxx" :key="cInfo.wlc.toString()+dy.dyh">
                    <td v-for="(fwInfo, i) in fwxx.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dy.dyh)"
                        :colspan="fwInfo.colspan" :rowspan="fwInfo.rowspan" :key="i">
                        {{ fwInfo.shbw }}
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
import { ref, watch } from 'vue';

// function getShbw(wlc: any, dyh: any, hbh: any) {
//     const match = fwxx.find((t: any) => t.wlc === wlc && t.dyh === dyh && t.hbh === hbh);
//     return match ? match : null;
// }
let showAll = ref(false)
const date1 = new Date().getTime()
console.log('date1:' + date1)
const dyxx: any = [
    {
        dymc: '一单元',
        dyh: 1
    },
    {
        dymc: '二单元',
        dyh: 2
    },
]
let cxx: any = []
for (let i = 6; i >= 0; i--) {
    cxx.push({
        wlc: (i + 1),
        myc: (i + 1) + '',
        hh: 5
    })
}

// console.log(cxx)
let fwxx: any = []
fwxx = [
    { shbw: '101', wlc: 1, dyh: 1, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '102', wlc: 1, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '103', wlc: 1, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '101', wlc: 1, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '102', wlc: 1, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '103', wlc: 1, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },

    { shbw: '201', wlc: 2, dyh: 1, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '202', wlc: 2, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '303', wlc: 2, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '201', wlc: 2, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '202', wlc: 2, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '203', wlc: 2, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },

    // { shbw: '301', wlc: 3, dyh: 1, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '302', wlc: 3, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '303', wlc: 3, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '301', wlc: 3, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '302', wlc: 3, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '303', wlc: 3, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },

    { shbw: '401', wlc: 4, dyh: 1, hbh: 1, colspan: 1, rowspan: 2 },
    { shbw: '402', wlc: 4, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '403', wlc: 4, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '401', wlc: 4, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '402', wlc: 4, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '403', wlc: 4, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },

    { shbw: '501', wlc: 5, dyh: 1, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '502', wlc: 5, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '503', wlc: 5, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '501', wlc: 5, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '502', wlc: 5, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '503', wlc: 5, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },

    { shbw: '601', wlc: 6, dyh: 1, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '602', wlc: 6, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '603', wlc: 6, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '601', wlc: 6, dyh: 2, hbh: 1, colspan: 2, rowspan: 1 },
    // { shbw: '602', wlc: 6, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '603', wlc: 6, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },

    { shbw: '701', wlc: 7, dyh: 1, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '702', wlc: 7, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '703', wlc: 7, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '701', wlc: 7, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '702', wlc: 7, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '703', wlc: 7, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },
]

console.log(fwxx)
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
watch(() => cxx1.value, async (newVal) => {
    console.log("cxx1变了" + newVal)
})
</script>

<style scoped lang="less">
td {
    border: 1px solid #39bd8a;
    width: 70px;
    height: 30px;
}

.dy-css {
    cursor: pointer;
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
    width: 8px;
    height: 8px;
    float: left;
    margin-left: 8px;
}
</style>