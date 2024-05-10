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
        <table class="table-css" style="margin: auto;">
            <thead>
                <tr class="title">
                    <td>物理层</td>
                    <td>名义层</td>
                    <td v-for="(item, index) in dyxx" :key="'dy' + index" colspan="3">{{ item.dymc }}</td>
                </tr>
            </thead>
            <tbody v-html="tableHtml">

            </tbody>
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
        <div v-if="showAll && cxx.length > 10" style="text-align: center;padding: 10px;">
            当前只显示<span style="color: #1677ff;">10</span>层，点击 <a-button type="link" @click="onShowAll">加载全部</a-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

function getShbw(wlc: any, dyh: any, hbh: any) {
    const match = fwxx.find((t: any) => t.wlc === wlc && t.dyh === dyh && t.hbh === hbh);
    return match ? match : null;
}
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
for (let i = 0; i < 12; i++) {
    cxx.push({
        wlc: (i + 1),
        myc: (i + 1) + '层',
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

    { shbw: '301', wlc: 3, dyh: 1, hbh: 1, colspan: 1, rowspan: 2 },
    { shbw: '302', wlc: 3, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '303', wlc: 3, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '301', wlc: 3, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '302', wlc: 3, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '303', wlc: 3, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },

    // { shbw: '401', wlc: 4, dyh: 1, hbh: 1, colspan: 1, rowspan: 2 },
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

    { shbw: '1101', wlc: 11, dyh: 1, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '1102', wlc: 11, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '1103', wlc: 11, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '1101', wlc: 11, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '1102', wlc: 11, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '1103', wlc: 11, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },

    { shbw: '1201', wlc: 12, dyh: 1, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '1202', wlc: 12, dyh: 1, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '1203', wlc: 12, dyh: 1, hbh: 3, colspan: 1, rowspan: 1 },
    { shbw: '1201', wlc: 12, dyh: 2, hbh: 1, colspan: 1, rowspan: 1 },
    { shbw: '1202', wlc: 12, dyh: 2, hbh: 2, colspan: 1, rowspan: 1 },
    { shbw: '1203', wlc: 12, dyh: 2, hbh: 3, colspan: 1, rowspan: 1 },
]

console.log(fwxx)
const date2 = new Date().getTime()
console.log('date2:' + date2)
console.log('时间差:' + (date2 - date1))
let cxx1: any = ref([]);
let cxx2: any = ref([]);
if (cxx.length > 10) {
    cxx1.value = cxx.slice(0, 10)
    showAll.value = true
} else {
    cxx1.value = cxx
}
let tableHtml = ''
function onShowAll() {
    showAll.value = false
    cxx2.value = cxx.slice(10, cxx.length)
    // cxx1.value = cxx
    getHtml(cxx2.value)
}
watch(() => cxx1.value, async (newVal) => {
    console.log("cxx1变了" + newVal)
})
getHtml(cxx1.value)
function getHtml(cxxList: any) {
    debugger
    cxxList.map((cInfo: any) => {
        let _td = ''
        _td += `<td class="title">${cInfo.wlc}</td>`
        _td += `<td class="title">${cInfo.myc}</td>`
        dyxx.map((dyInfo: any) => {
            const fwList = fwxx.filter((t: any) => t.wlc === cInfo.wlc && t.dyh === dyInfo.dyh)
            for (let index = 0; index < fwList.length; index++) {
                const fw = fwList[index];
                _td += `<td colspan="${fw.colspan}" rowspan="${fw.rowspan}" class="dy-css">${fw.shbw}</td>`
            }
        })
        let tr = `<tr>${_td} </tr>`
        tableHtml = tr + tableHtml
    })
}
</script>

<style scoped lang="less">
.table-css td {
    border: 1px solid gray;
    width: 70px;
    height: 40px;
}

::v-deep(.table-css) {
    td {
        border: 1px solid gray;
        width: 70px;
        height: 40px;
    }

    .title {
        color: #1677ff;
        font-weight: bold;
    }
}



.dy-css {
    cursor: pointer;
    border: 1px solid gray;
    width: 70px;
    height: 40px;
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