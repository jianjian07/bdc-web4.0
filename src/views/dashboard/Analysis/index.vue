<template>
  <div class="baseContent">
    <div class="sectionOne">
      <!--      <div class="panelOne">-->
      <!--        <a-card class="userBox1" v-for="info in baseInfo" :key="info.key" @click="onClickEntry(info.route)"-->
      <!--          :bordered="false">-->
      <!--          <div class="baseInfo">-->
      <!--            <div class="infoItem">-->
      <!--              <span>{{ info.label }}</span>-->
      <!--              <span :style="{ color: info.color }">{{ info.value }}</span>-->
      <!--            </div>-->
      <!--          </div>-->
      <!--        </a-card>-->
      <!--      </div>-->
      <div class="panelTwo">
        <a-card class="userBox" :bordered="false">
          <div class="commonEntry">
            <!-- <div :class="['entryItem']" v-for="(entry, index) in commonEntry" :key="entry.key" @click="handleAdd(entry)">
              <div :class="['cursorBtn', 'cursorBtn' + index]" :style="{backgroundColor: entry.color}">
                <svg-icon :name="entry.icon"  width="30px" height="30px" ></svg-icon>
              </div>
              <span>{{ entry.label }}</span>
            </div> -->
            <div :class="['entryItem', 'cursorBtn', 'cursorBtn' + index]" v-for="(entry, index) in commonEntry"
              :key="entry.key" @click="handleAdd(entry)">
              <div class="icon-content">
                <svg-icon :name="entry.icon" width="25%" height="30px"></svg-icon>
                <span class="icon-label">{{ entry.label }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </div>
    </div>
    <div class="sectionTwo">
      <div class="itemList">
        <a-card class="userBox" title="抵押到期">
          <template #extra><a @click="onClickEntry('/online/report/view/27')">更多...</a></template>
          <div class="dqList">
            <dydqList></dydqList>
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
        <a-card class="userBox" title="查封到期" :bordered="false">
          <template #extra><a @click="onClickEntry('/online/report/view/26')">更多...</a></template>
          <div class="dqList">
            <cfdqList></cfdqList>
          </div>
        </a-card>
      </div>
      <div class="itemList">
        <a-card class="userBox" title="预查封信息" :bordered="false">
          <template #extra><a @click="onClickEntry('/online/report/view/1947906380530249730')">更多...</a></template>
          <div class="ycfList">
            <ycf-list></ycf-list>
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
import tzggList from '/@/views/tools/tzgg/index.vue';
import dydqList from './components/dydqList.vue'
import cfdqList from './components/cfdqList.vue'
import { addFlow } from "/@/views/bdc/utils/case";
import YcfList from "/@/views/dashboard/Analysis/components/YcfList.vue"

let baseInfo: any = reactive([
  {
    label: '在办案卷',
    key: 'zb',
    value: '--',
    route: '/bdc/case/list',
    icon: getUrl('images/home/bg1.png'),
    color: '#1B84FF'
  }, {
    label: '已办案卷',
    key: 'yb',
    value: '--',
    route: '/bdc/case/list',
    icon: getUrl('images/home/bg2.png'),
    color: '#00bd9f'
  }, {
    label: '督办案卷',
    key: 'db',
    value: '--',
    route: '/bdc/dbgl',
    icon: getUrl('images/home/bg3.png'),
    color: '#ff980d'
  }
])

let commonEntry: any = reactive([
  {
    label: '产权登记',
    key: '1780060462306840577',
    value: 'CQSC',
    icon: 'cqdj',
  },
  {
    label: '抵押登记',
    key: '1856585344386551809',
    value: 'DYSC',
    icon: 'dydj'
  },
  {
    label: '查封登记',
    key: '1869227861279985666',
    value: 'CFDJ',
    icon: 'cfdj'
  },
  {
    label: '预告登记',
    key: '1859491041466089474',
    value: 'YGSC',
    icon: 'ygdj'
  },
  {
    label: '组合登记', // 此处选择的转移抵押
    key: '1869228218932482050',
    value: 'ZYDY',
    icon: 'zhdj'
  }
])

function onClickEntry(path, params: any = {}) {
  router.push({ path: path, query: params })
}

/**
 * 创建流程
 */
function handleAdd(entry: any) {
  //系统上线后多人误点击导致创建了空案卷，暂时屏蔽，后期有合适思路后再考虑这块内容如何使用
  return;
  // 跳转至创建流程页面
  const params = {
    lcid: entry.key
  }
  addFlow(params)
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
  background-color: #F9F9F9;

  :deep(.ant-card-body) {
    padding: 10px 15px !important;
  }

  .sectionOne {
    width: 100%;
    height: auto;
    padding: 0 0 5px 0;
    display: flex;

    .userBox {

      // box-shadow: 0 1px 11px 0 rgb(0 0 0 / 15%), 0 1px 6px -1px rgb(0 0 0 / 5%), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
      .baseInfo,
      .commonEntry {
        display: flex;
        justify-content: space-around;
        align-items: center;
        color: #fff;
        font-size: 22px;
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
            font-size: 1.2vw;
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

        .infoItem:hover:after {
          top: 0;
          height: 100%;
        }

        .infoItem:active {
          top: 2px;
        }

        .entryItem {
          width: 18%;
          height: 90px;
          text-align: center;
          border-radius: 5px;
          display: flex;
          flex-direction: column;
          align-items: center;

          .icon-content {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 90%;
            margin: auto;

            .icon-label {
              font-size: 1.3vw;
              width: 75%;
              height: 90px;
              white-space: nowrap;
            }
          }

          //span {
          //  display: flex;
          //  align-items: center;
          //  justify-content: center;
          //  padding-top: 8px;
          //}
        }
      }
    }

    .panelOne {
      width: 40%;
      padding-right: 8px;
      display: flex;
      justify-content: space-around;

      .userBox1 {
        padding: 0 8px;
        color: #333;
        width: 32%;
        cursor: pointer;

        .baseInfo {
          display: flex;
          justify-content: space-around;
          align-items: center;
          color: #333;
          font-size: 1.2vw;
          cursor: pointer;
          white-space: nowrap;

          .infoItem {
            background-size: 100% 100%;
            -moz-background-size: 100% 100%;
            background-repeat: no-repeat;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 86px;
            cursor: pointer;
            z-index: 1;
            position: relative;

            span:nth-of-type(1) {
              margin-top: 10px;
              margin-bottom: -10px;
            }

            span:nth-of-type(2) {
              font-weight: bold;
              font-size: 2.5vw;
            }
          }

          // .infoItem:hover {
          //   span:nth-of-type(1) {
          //     font-size: 22px;
          //   }
          //   span:nth-of-type(2) {
          //     font-weight: bold;
          //     font-size: 48px;
          //   }
          // }
        }
      }

      .tagTitle {
        position: absolute;
        top: 0;
        right: 0;
        width: 50px;
        height: 50px;
        background: linear-gradient(-135deg,
            transparent 20%,
            #78c6f3 20%,
            #229de2 50%,
            transparent 50%,
            transparent 100%);

        .titleText {
          position: absolute;
          transform: rotate(45deg);
          text-align: center;
          top: 5px;
          right: -8px;
          width: 50px;
          font-size: 16px;
          color: #fff;
          font-weight: bold;
        }
      }

      .userBox1:nth-of-type(1) {
        border-bottom: 4px solid #229de2;
      }

      .userBox1:nth-of-type(2) {
        border-bottom: 4px solid #00bd9f;

        .tagTitle {
          background: linear-gradient(-135deg,
              transparent 20%,
              #5ff3da 20%,
              #00bd9f 50%,
              transparent 50%,
              transparent 100%);
        }
      }

      .userBox1:nth-of-type(3) {
        border-bottom: 4px solid #ff980d;

        .tagTitle {
          background: linear-gradient(-135deg,
              transparent 20%,
              #fecb89 20%,
              #ff980d 50%,
              transparent 50%,
              transparent 100%);
        }
      }

      .userBox1:hover {
        box-shadow: 0 1px 11px 0 rgb(0 0 0 / 15%), 0 1px 6px -1px rgb(0 0 0 / 5%), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
      }
    }

    .panelTwo {
      //width: 60%;
      width: 100%;
      padding-left: 8px;
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

    :deep(.ant-spin-container) {
      overflow: hidden !important;
    }

    .userBox {
      // box-shadow: 0 1px 11px 0 rgb(0 0 0 / 15%), 0 1px 6px -1px rgb(0 0 0 / 5%), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
      height: 100%;
    }

    .itemList {
      width: 50%;
      height: 50%;

      :deep(.ant-card-body) {
        height: calc(100% - 45px);
      }

      :deep(.ant-card-head) {
        // background-color: #ddeafe;
        min-height: 45px;
        height: 45px;
        padding: 0 15px;

        .ant-card-head-title {
          // border-left: 4px solid #229de2;
          padding-left: 8px;
        }
      }
    }

    .itemList:nth-of-type(1) {
      padding-right: 8px;
      padding-top: 10px;
      padding-bottom: 5px;
      width: 55%;
    }

    .itemList:nth-of-type(2) {
      padding-left: 8px;
      padding-top: 10px;
      padding-bottom: 5px;
      width: 45%;
    }

    .itemList:nth-of-type(3) {
      padding-right: 8px;
      padding-top: 10px;
      width: 55%;
    }

    .itemList:nth-of-type(4) {
      padding-left: 8px;
      padding-top: 10px;
      width: 45%;
    }

    .dqList,
    .ycfList {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      :deep(.ant-list-item) {
        padding: 10px 0px !important;
      }

      :deep(.userTable) {
        .ant-pagination {
          margin: -25px 0 !important;
        }
      }

      :deep(.ant-table-container) {
        height: 100% !important;
        overflow: hidden;

        :deep(.ant-table) {
          height: 100%;
        }
      }
    }

    .tzList {
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>
