<template>
  <div class="baseContent">
    <div class="sectionOne">
      <a-row :gutter="24">
        <a-col :span="10">
          <a-card class="userBox" :bordered="false">
            <div class="baseInfo">
              <div class="infoItem" :style="{backgroundImage: 'url(' + info.icon + ')'}" v-for="info in baseInfo" :key="info.key" @click="onClickEntry(info.route)">
                <span>{{ info.value }}</span>
                <span>{{ info.label }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :span="14">
          <a-card class="userBox" :bordered="false">
            <div class="commonEntry">
              <div :class="['entryItem', 'cursorBtn', 'cursorBtn'+ index]" v-for="(entry, index) in commonEntry" :key="entry.key" @click="onClickEntry(entry.route)">
                <span>{{ entry.label }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
    <div class="sectionTwo">
      <div class="itemList">
        <a-card class="userBox" title="抵押到期">
          <template #extra><a href="#">更多...</a></template>
          <div class="dqList">
            <dydqList></dydqList>
          </div>
        </a-card>
      </div>
      <div class="itemList">
        <a-card class="userBox" title="查封到期" :bordered="false">
          <template #extra><a href="#">更多...</a></template>
          <div class="dqList">
            <cfdqList></cfdqList>
          </div>
        </a-card>
      </div>
      <div class="itemList">
        <a-card class="userBox" title="通知通告" :bordered="false">
          <template #extra><a @click="onClickEntry('/tzgg/index')">更多...</a></template>
          <div class="tzList">
            <tzggList type="list"></tzggList>
          </div>
        </a-card>
      </div>
      <div class="itemList">
        <a-card class="userBox" title="更新说明" :bordered="false">
          <template #extra><a @click="onClickEntry('/tzgg/index', {category: '4'})">更多...</a></template>
          <div class="tzList">
            <tzggList type="list" category="4"></tzggList>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { getUrl } from '/@/utils';
import { router } from "/@/router"
import tzggList from '/@/views/system/tzgg/index.vue';
import dydqList from './components/dydqList.vue'
import cfdqList from './components/cfdqList.vue'

let baseInfo: any = reactive([
  {
    label: '在办案卷',
    key: 'zb',
    value: 871,
    route: '/bdc/case/list',
    icon: getUrl('images/home/bg1.png')
  },{
    label: '已办案卷',
    key: 'yb',
    value: 902,
    route: '/bdc/case/list',
    icon: getUrl('images/home/bg2.png')
  },{
    label: '督办案卷',
    key: 'db',
    value: 40,
    route: '/bdc/dbgl',
    icon: getUrl('images/home/bg3.png')
  }
])

let commonEntry: any = reactive([
  {
    label: '产权登记',
    key: 'cqdj',
    route: ''
  },
  {
    label: '抵押登记',
    key: 'dydj',
    route: ''
  },
  {
    label: '查封登记',
    key: 'cfdj',
    route: ''
  },
  {
    label: '预告登记',
    key: 'ygdj',
    route: ''
  },
  {
    label: '组合登记',
    key: 'zhdj',
    route: ''
  }
])

function onClickEntry(path, params: any = {}) {
  router.push({path: path, query: params})
}

</script>

<style lang="less" scoped>
@import url('/@/views/dashboard/Analysis/index.less');
.baseContent {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 10px;
  display: flex;
  flex-direction: column;

  .sectionOne {
    width: 100%;
    height: auto;
    padding: 0 0 5px 0;
    .userBox {
      box-shadow: 0 1px 11px 0 rgb(0 0 0 / 15%), 0 1px 6px -1px rgb(0 0 0 / 5%), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
      .baseInfo, .commonEntry {
        display: flex;
        justify-content: space-around;
        align-items: center;
        color: #fff;
        font-size: 20px;
        cursor: pointer;

        .infoItem {
          background-size: 100% 100%;
          -moz-background-size: 100% 100%;
          background-repeat: no-repeat;
          width: 30%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 90px;
          padding: 5px 10px 5px 20px;
          cursor: pointer;
          z-index: 1;
          position: relative;
          span:nth-of-type(1) {
            font-weight: bold;
            font-size: 22px;
          }
        }
        .infoItem:after {
          position: absolute;
          content: "";
          width: 100%;
          height: 0;
          bottom: 0;
          left: 0;
          z-index: -1;
          border-radius: 5px;
          background-image: linear-gradient(315deg, #00bd9f 0%, #7ce5de 74%);
          box-shadow:
          -7px -7px 20px 0px #fff9,
          -4px -4px 5px 0px #fff9,
          7px 7px 20px 0px #0002,
          4px 4px 5px 0px #0001;
          transition: all 0s ease;
        }
        .infoItem:nth-of-type(1):after {
          background-image: linear-gradient(315deg, #0083c9 0%, #81c3ee 74%);
        }
        .infoItem:nth-of-type(3):after {
          background-image: linear-gradient(315deg, #ff980d 0%, #f9c37c 74%);
        }
        .infoItem:hover {
          color: #fff;
        }
        .infoItem:hover:after {
          top: 0;
          height: 100%;
        }
        .infoItem:active {
          top: 2px;
        }

        .entryItem {
          width: 18%;
          height: 80px;
          text-align: center;
          border-radius: 5px;
          margin: 5px 0px;
          span {
            display: flex;
            align-items: flex-end;
            justify-content: center;
          }
        }
      }
      /deep/ .ant-card-body {
        padding: 15px !important;
      }
    }
  }

  .sectionTwo {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 1px;
    border: none;
    .userBox {
      box-shadow: 0 1px 11px 0 rgb(0 0 0 / 15%), 0 1px 6px -1px rgb(0 0 0 / 5%), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
      height: 100%;
    }
    .itemList {
      width: 50%;
      height: 50%;
      /deep/ .ant-card-body {
        height: calc(100% - 45px);
      }
      /deep/ .ant-card-head {
        background-color: #ddeafe;
        min-height: 45px;
        height: 45px;
      }
    }
    .itemList:nth-of-type(1) {
      padding-right: 8px;
      padding-top: 10px;
      padding-bottom: 5px;
      /deep/ .ant-card-head {
        background-color: #e8f0fb;
      }
    }
    .itemList:nth-of-type(2){
      padding-left: 8px;
      padding-top: 10px;
      padding-bottom: 5px;
      /deep/ .ant-card-head {
        background-color: #e8f0fb;
      }
    }
    .itemList:nth-of-type(3) {
      padding-right: 8px;
      padding-top: 10px;
      /deep/ .ant-card-head {
        background-color: #e8f0fb;
      }
    }
    .itemList:nth-of-type(4) {
      padding-left: 8px;
      padding-top: 10px;
      /deep/ .ant-card-head {
        background-color: #e8f0fb;
      }
    }
    .dqList {
      // height: 300px;
    }
    .tzList {
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>
