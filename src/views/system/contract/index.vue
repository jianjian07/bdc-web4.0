<template>
  <a-button @click="openModal('view')">查看</a-button>
  <a-button @click="openModal('edit')">编辑</a-button>
  <br>
  <a-radio-group v-model:value="value">
    <a-radio :value="1">选项1</a-radio>
    <a-radio :value="2">选项2</a-radio>
    <a-radio :value="inputValue1">
      <a-input v-model:value="inputValue1"></a-input>
    </a-radio>
    <a-radio :value="inputValue2">
      <a-input v-model:value="inputValue2"></a-input>
    </a-radio>
  </a-radio-group>
  <div> 结果: {{ value }}  输入值1: {{ inputValue1 }}  输入值2: {{ inputValue2 }}</div>
  <a-modal v-model:open="open" title="查看" width="1400px" wrap-class-name="full-modal">
    <template #footer>
      <div style="text-align: center;">
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="handleDownLoadByID">下载合同(自动分页)</a-button>
        <a-button type="primary" @click="handleDownLoadByName">下载合同(手动分页)</a-button>
        <a-button type="primary" @click="handleDownLoadByHtml">下载合同(html)</a-button>
        <a-button type="primary" @click="print">window打印</a-button>
        <!-- <a-button type="primary" @click="handleTest">测试html下载</a-button> -->
      </div>
    </template>
    <div id="content" style="margin: auto;" ref="constractRef">
      <!-- <a-layout>
          <a-layout-sider :style="siderStyle" width="290px">
            <div class="anchorItem" v-for="chapter in anchorItems" :key="chapter.key">
              <div class="st4h" @click="onAnchorClick(chapter)">{{ chapter.title }}</div>
              <div class="itemChild" v-if="chapter.children">
                <div class="item" v-for="child in chapter.children" :key="child.key" @click="onAnchorClick(child)">
                  {{ child.title }}
                </div>
              </div>
            </div>
          </a-layout-sider>
          <a-layout-content :style="contentStyle">
            <component :is="component" :mode="mode" class="st4h" :downloadFlag="downloadFlag" id="contentToConvert" ref="convertRef"></component>
          </a-layout-content>
      </a-layout> -->
      <component :is="component" :mode="mode" class="st4h" :downloadFlag="downloadFlag" ref="convertRef" @genQrCode="genQrCode"></component>
    </div> 
  </a-modal>
</template>
 
<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, nextTick } from 'vue';
import { generatePdfByHtml, generatePdfByID, generatePdfByName } from './genPdf.ts'
import QRCode from 'qrcode'

const value = ref<number>(1);
let inputValue1 = ref('')
let inputValue2 = ref('')

const modules = import.meta.glob('/src/views/system/contract/components/*.vue')

const component = computed(() => {
  return defineAsyncComponent(modules[`/src/views/system/contract/components/${props.mbmc}.vue`]);
});

let anchorItems :any = computed(() => {
  return anchorList[props.mbmc]
});

const convertRef :any = ref(null)

const props = defineProps({
  mbmc: {
    type: String,
    default: 'bdmb'
  }
})

const siderStyle: any = {
  textAlign: 'left',
  color: '#000',
  lineHeight: '30px',
  backgroundColor: '#efefef',
  fontSize: '16px',
  padding: '20px 10px',
  height: '700px',
  overflow: 'auto'
}

const contentStyle: any = {
  backgroundColor: '#fff',
  padding: '80px',
  height: '700px',
  overflow: 'auto'
}

const constractRef = ref()
let open = ref<boolean>(false);
let mode = ref<string>('edit');
let downloadFlag = ref<boolean>(false)

let anchorList : any = {
  ysmb: [
    {
      key: 'anchor1',
      href: '#anchor1',
      title: '说 明',
    },
    {
      key: 'anchor2',
      href: '#anchor2',
      title: '专业术语解释',
    },
    {
      key: 'chapter1',
      href: '#chapter1',
      title: '第一章 合同当事人',
    },
    {
      key: 'chapter2',
      href: '#chapter2',
      title: '第二章 商品房基本状况',
      children: [
        {
          key: 'list1',
          href: '#list1',
          title: '第一条 项目建设依据',
        },
        {
          key: 'list2',
          href: '#list2',
          title: '第二条 预售依据',
        },
        {
          key: 'list3',
          href: '#list3',
          title: '第三条 商品房基本信息',
        },
        {
          key: 'list4',
          href: '#list4',
          title: '第四条 抵押情况',
        },
        {
          key: 'list5',
          href: '#list5',
          title: '第五条 房屋权利状况承诺',
        }
      ]
    },
    {
      key: 'chapter3',
      href: '#chapter3',
      title: '第三章 商品房价款',
      children: [
        {
          key: 'list6',
          href: '#list6',
          title: '第六条 计价方式与价款',
        },
        {
          key: 'list7',
          href: '#list7',
          title: '第七条 付款方式及期限',
        },
        {
          key: 'list8',
          href: '#list8',
          title: '第八条 逾期付款责任',
        }
      ]
    },
    {
      key: 'chapter4',
      href: '#chapter4',
      title: '第四章 商品房交付条件与交付手续',
      children: [
        {
          key: 'list9',
          href: '#list9',
          title: '第九条 商品房交付条件',
        },
        {
          key: 'list10',
          href: '#list10',
          title: '第十条 商品房相关设施设备交付条件',
        },
        {
          key: 'list11',
          href: '#list11',
          title: '第十一条 交付时间和手续',
        },
        {
          key: 'list12',
          href: '#list12',
          title: '第十二条 逾期交付责任',
        }
      ]
    },
    {
      key: 'chapter5',
      href: '#chapter5',
      title: '第五章 面积差异处理方式',
      children: [
        {
          key: 'list13',
          href: '#list13',
          title: '第十三条 面积差异处理',
        }
      ]
    },
    {
      key: 'chapter6',
      href: '#chapter6',
      title: '第六章 规划设计变更',
      children: [
        {
          key: 'list14',
          href: '#list14',
          title: '第十四条 规划变更',
        },
        {
          key: 'list15',
          href: '#list15',
          title: '第十五条 设计变更',
        }
      ]
    },
    {
      key: 'chapter7',
      href: '#chapter7',
      title: '第七章 商品房质量及保修责任',
      children: [
        {
          key: 'list16',
          href: '#list16',
          title: '第十六条 商品房质量',
        },
        {
          key: 'list17',
          href: '#list17',
          title: '第十七条 保修责任',
        },
        {
          key: 'list18',
          href: '#list18',
          title: '第十八条 质量担保',
        }
      ]
    },
    {
      key: 'chapter8',
      href: '#chapter8',
      title: '第八章 合同备案与房屋登记',
      children: [
        {
          key: 'list19',
          href: '#list19',
          title: '第十九条 预售合同共登记备案',
        },
        {
          key: 'list20',
          href: '#list20',
          title: '第二十条 房屋登记',
        }
      ]
    },
    {
      key: 'chapter9',
      href: '#chapter9',
      title: '第九章 前期物业管理',
      children: [
        {
          key: 'list21',
          href: '#list21',
          title: '第二十一条 前期物业管理',
        }
      ]
    },
    {
      key: 'chapter10',
      href: '#chapter10',
      title: '第十章 其他事项',
      children: [
        {
          key: 'list22',
          href: '#list22',
          title: '第二十二条 建筑物区分所有权',
        },
        {
          key: 'list23',
          href: '#list23',
          title: '第二十三条 税费',
        },
        {
          key: 'list24',
          href: '#list24',
          title: '第二十四条 销售和使用承诺',
        },
        {
          key: 'list25',
          href: '#list25',
          title: '第二十五条 送达',
        },
        {
          key: 'list26',
          href: '#list26',
          title: '第二十六条 买受人信息保护',
        },
        {
          key: 'list27',
          href: '#list27',
          title: '第二十七条 争议解决方法',
        },
        {
          key: 'list28',
          href: '#list28',
          title: '第二十八条 补充协议',
        },
        {
          key: 'list29',
          href: '#list29',
          title: '第二十九条 合同生效',
        }
      ]
    },
  ],
  xsmb: [
    {
      key: 'anchor1',
      href: '#anchor1',
      title: '说 明',
    },
    {
      key: 'anchor2',
      href: '#anchor2',
      title: '专业术语解释',
    },
    {
      key: 'chapter1',
      href: '#chapter1',
      title: '第一章 合同当事人',
    },
    {
      key: 'chapter2',
      href: '#chapter2',
      title: '第二章 商品房基本状况',
      children: [
        {
          key: 'list1',
          href: '#list1',
          title: '第一条 项目建设依据',
        },
        {
          key: 'list2',
          href: '#list2',
          title: '第二条 销售依据',
        },
        {
          key: 'list3',
          href: '#list3',
          title: '第三条 商品房基本信息',
        },
        {
          key: 'list4',
          href: '#list4',
          title: '第四条 抵押情况',
        },
        {
          key: 'list5',
          href: '#list5',
          title: '第五条 租赁情况',
        },
        {
          key: 'list6',
          href: '#list6',
          title: '第六条 房屋权利状况承诺',
        }
      ]
    },
    {
      key: 'chapter3',
      href: '#chapter3',
      title: '第三章 商品房价款',
      children: [
        {
          key: 'list7',
          href: '#list7',
          title: '第七条 计价方式与价款',
        },
        {
          key: 'list8',
          href: '#list8',
          title: '第八条 付款方式及期限',
        },
        {
          key: 'list9',
          href: '#list9',
          title: '第九条 逾期付款责任',
        }
      ]
    },
    {
      key: 'chapter4',
      href: '#chapter4',
      title: '第四章 商品房交付条件与交付手续',
      children: [
        {
          key: 'list10',
          href: '#list10',
          title: '第十条 商品房交付条件',
        },
        {
          key: 'list11',
          href: '#list11',
          title: '第十一条 商品房相关设施设备交付条件',
        },
        {
          key: 'list12',
          href: '#list12',
          title: '第十二条 交付时间和手续',
        },
        {
          key: 'list13',
          href: '#list13',
          title: '第十三条 逾期交付责任',
        }
      ]
    },
    {
      key: 'chapter5',
      href: '#chapter5',
      title: '第五章 商品房质量及保修责任',
      children: [
        {
          key: 'list14',
          href: '#list14',
          title: '第十四条 商品房质量',
        },
        {
          key: 'list15',
          href: '#list15',
          title: '第十五条 保修责任',
        },
        {
          key: 'list16',
          href: '#list16',
          title: '第十六条 质量担保',
        }
      ]
    },
    {
      key: 'chapter6',
      href: '#chapter6',
      title: '第六章 房屋登记',
      children: [
        {
          key: 'list17',
          href: '#list17',
          title: '第十七条 房屋登记',
        }
      ]
    },
    {
      key: 'chapter7',
      href: '#chapter7',
      title: '第七章 物业管理',
      children: [
        {
          key: 'list18',
          href: '#list18',
          title: '第十八条 物业管理',
        }
      ]
    },
    {
      key: 'chapter8',
      href: '#chapter8',
      title: '第八章 其他事项',
      children: [
        {
          key: 'list19',
          href: '#list19',
          title: '第十九条 建筑物区分所有权',
        },
        {
          key: 'list20',
          href: '#list20',
          title: '第二十条 税费',
        },
        {
          key: 'list21',
          href: '#list21',
          title: '第二十一条 销售和使用承诺',
        },
        {
          key: 'list22',
          href: '#list22',
          title: '第二十二条 送达',
        },
        {
          key: 'list23',
          href: '#list23',
          title: '第二十三条 买受人信息保护',
        },
        {
          key: 'list24',
          href: '#list24',
          title: '第二十四条 争议解决方法',
        },
        {
          key: 'list25',
          href: '#list25',
          title: '第二十五条 补充协议',
        },
        {
          key: 'list26',
          href: '#list26',
          title: '第二十六条 合同生效',
        }
      ]
    },
  ]
}

function openModal(val: string) {
  open.value = true
  mode.value = val
  downloadFlag.value = false
}

function handleClose() {
  open.value = false
}

function onAnchorClick(anchor) {
  convertRef.value.scrollToAnchor(anchor.key)
}

function handleDownLoadByID() {
  downloadFlag.value = true
  let htbh = 'YS20211200028'
  nextTick(() => {
    generatePdfByID('自动分页测试下载', 'contentToConvert', htbh)
  })
}

function handleDownLoadByName() {
  downloadFlag.value = true
  let htbh = 'YS20211200028'
  nextTick(() => {
    generatePdfByName('手动分页测试下载', 'pdfPageContent', htbh)
  })
}

function handleDownLoadByHtml() {
  downloadFlag.value = true
  let htbh = 'YS20211200028'
  nextTick(() => {
    generatePdfByHtml('html生成下载', 'cici-form-css', htbh)
  })
}

function removeIframe(){
  const iframeEL :any = document.querySelector('.target-el-iframe');
	if(iframeEL){
	  iframeEL.remove();
	}
}

function print(){
  downloadFlag.value = true
	nextTick(() => {
    removeIframe();
    //目标元素
    const info: any = document.querySelector('#contentToConvert');
    //创建iframe
    const iframeEl :any= document.createElement('iframe');
    iframeEl.class='target-el-iframe';
    //将元素放置最底层，防止其覆盖了其他元素
    iframeEl.style.position="fixed"
    iframeEl.style.zIndex=-99;
    //添加到页面
    document?.querySelector('body')?.append(iframeEl)
    
    const documentEl=iframeEl.contentDocument;
    //深度拷贝目标元素，如果不拷贝，则会将目标元素移动到iframe中
    documentEl.body.append(info.cloneNode(true))
    
    //去除打印的页眉和页脚
    const style=document.createElement('style')
    style.media="print";
    style.innerText=`
    @page {
      size: auto;
      margin: 0mm;
    }`
    //添加答应内容
    documentEl.head.append(style);
    //打印
    iframeEl.contentWindow.print()
  })
}

function genQrCode(data: any) {
  console.log(data)
  var canvasHtml = document.createElement("canvas");
  canvasHtml.setAttribute('id', 'qrCode');
  document.getElementsByClassName('canvasContent')[0].appendChild(canvasHtml)
  let text = `
合同编号：YS20231000004
卖出人：新疆润江房地产(123456789987654321)
买受人：
坐落：昌吉市126区2丘1栋2单元26层2601
单元间号：2601
建筑面积：142.84平方米
成交总价：0.000元（人民币）
签订时间：2023/10/19 19:55:06
`
  QRCode.toCanvas(document.getElementById('qrCode'), text, {width: 150}, function (error) {
    if (error) console.error(error)
    console.log('success!');
  })
}

</script>

<style lang="less" scoped>
@import url('/@/views/system/contract/components/mb.less');
#contentToConvert {
  width: 851px;
  font-family: 'st';
  font-size: 16px;
}
.anchorItem {
  padding: 5px 10px;
  cursor: pointer;
  .itemChild {
    padding-left: 15px;
    cursor: pointer;
    color: #777;
    .item:hover {
      color: #438bf8;
    }
  }
}
.anchorItem:hover {
  .st4h {
    color: #438bf8;
  }
}

.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh) !important;
  }
  .ant-modal-body {
    flex: 1;
    overflow-y: auto;
  }
}
</style>