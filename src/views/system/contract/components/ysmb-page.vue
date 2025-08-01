<template>
  <div :class="{'YSTemplate': true, 'viewTemplate': !downloadFlag, 'st4h': true}" style="line-height: 2;">
    <div class="pdfPageContent">
      <div style="display: flex; justify-content: space-between;">
        <span>GF-2014-0171</span>
        <div class="inputRowS">
          <span class="inputLabel">合同编号：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.htbh"></a-input>
          <span v-else class="inputValue">{{ formState.htbh }}</span>
        </div>
      </div>

      <div class="st38b" style="font-weight: bold; text-align: center; margin-top: 50%; transform: translateY(-30px);">商品房买卖合同（预售）</div>

      <div style="display: flex; flex-direction: column; margin-top: 35%;">
        <div class="inputRowS">
          <span class="inputLabel">出卖人：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr }}</span>
        </div>
        <div class="inputRowS">
          <span class="inputLabel">买受人：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.msr"></a-input>
          <span v-else class="inputValue">{{ formState.msr }}</span>
        </div>
      </div>

      <div style="padding-top: 100px; font-size: 20px;position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%);display: flex;align-items: center;">
        <div style="display: flex; flex-direction: column;padding-right: 15px;">
          <span style="text-align-last: justify;">中华人民共和国住房和城乡建设部</span>
          <span>中华人民共和国国家工商行政管理总局</span>
        </div>
        <div>制定</div>
      </div>
    </div>

    <div style="page-break-after: always;"></div>
    
    <div class="pdfPageContent">
      <div style="text-align: center; font-size: 29px; font-weight: bold;">
        目&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录
      </div>

      <div style="margin-top: 90px; display: flex; flex-direction: column; cursor: pointer;">
        <span @click="scrollToAnchor('anchor1')">说&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明</span>
        <span @click="scrollToAnchor('anchor2')">专业术语解释</span>
        <span @click="scrollToAnchor('anchor3')">第一章&nbsp;&nbsp;合同当事人</span>
        <span @click="scrollToAnchor('anchor4')">第二章&nbsp;&nbsp;商品房基本状况</span>
        <span @click="scrollToAnchor('anchor5')">第三章&nbsp;&nbsp;商品房价款</span>
        <span @click="scrollToAnchor('anchor6')">第四章&nbsp;&nbsp;商品房交付条件与交付手续</span>
        <span @click="scrollToAnchor('anchor7')">第五章&nbsp;&nbsp;面积差异处理方式</span>
        <span @click="scrollToAnchor('anchor8')">第六章&nbsp;&nbsp;规划设计变更</span>
        <span @click="scrollToAnchor('anchor9')">第七章&nbsp;&nbsp;商品房质量及保修责任</span>
        <span @click="scrollToAnchor('anchor10')">第八章&nbsp;&nbsp;合同备案与房屋登记</span>
        <span @click="scrollToAnchor('anchor11')">第九章&nbsp;&nbsp;前期物业管理</span>
        <span @click="scrollToAnchor('anchor12')">第十章&nbsp;&nbsp;其他事项</span>
      </div>
    </div>
    
    <div style="page-break-after: always;"></div>

    <div class="pdfPageContent"  :ref="el => setItemRef(el, 'anchor1')">
      <div style="text-align: center" class="st2h">
        说&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明
      </div>
      <br/>
      <div>
        <span class="indent">1.本合同文本为示范文本，由中华人民共和国住房和城乡建设部、中华人民共和国国家工商行政管理总局共同制定。各地可在有关法律法规、规定的范围内，结合实际情况调整合同相应内容。<br/></span>
        <span class="indent">2.签订本合同前，出卖人应当向买受人出示《商品房预售许可证》及其他有关证书和证明文件。<br/></span>
        <span class="indent">3.出卖人应当就合同重大事项对买受人尽到提示义务。买受人应当审慎签订合同，在签订本合同前，要仔细阅读合同条款，特别是审阅其中具有选择性、补充性、修改性的内容，注意防范潜在的市场风险和交易风险。<br/></span>
        <span class="indent">4.本合同文本【】中选择内容、空格部位填写内容及其他需要删除或添加的内容，双方当事人应当协商确定。【】中选择内容，以划✓方式选定；对于实际情况未发生或双方当事人不作约定时，应当在空格部位打×，以示删除。<br/></span>
        <span class="indent">5.出卖人与买受人可以针对本合同文本中没有约定或者约定不明确的内容，根据所售项目的具体情况在相关条款后的空白行中进行补充约定，也可以另行签订补充协议。<br/></span>
        <span class="indent">6.双方当事人可以根据实际情况决定本合同原件的份数，并在签订合同时认真核对，以确保各份合同内容一致；在任何情况下，出卖人和买受人都应当至少持有一份合同原件。<br/></span>
      </div>
    </div>

    <div style="page-break-after: always;"></div>
    
    <div class="pdfPageContent" :ref="el => setItemRef(el, 'anchor2')">
      <div style="text-align: center" class="st2h">
        专业术语解释
      </div>
      <br/>
      <div>
        <span class="indent">1.商品房预售：是指房地产开发企业将正在建设中的取得《商品房预售许可证》的商品房预先出售给买受人，并由买受人支付定金或房价款的行为。<br/></span>
        <span class="indent">2.法定代理人：是指依照法律规定直接取得代理权的人。<br/></span>
        <span class="indent">3.套内建筑面积：是指成套房屋的套内建筑面积，由套内使用面积、套内墙体面积、套内阳台建筑面积三部分组成。<br/></span>
        <span class="indent">4.房屋的建筑面积：是指房屋外墙（柱）勒脚以上各层的外围水平投影面积，包括阳台、挑廊、地下室、室外楼梯等，且具备有上盖，结构牢固，层高2.20M以上（含2.20M）的永久性建筑。<br/></span>
        <span class="indent">5.不可抗力：是指不能预见、不能避免并不能克服的客观情况。<br/></span>
        <span class="indent">6.民用建筑节能：是指在保证民用建筑使用功能和室内热环境质量的前提下，降低其使用过程中能源消耗的活动。民用建筑是指居住建筑、国家机关办公建筑和商业、服务业、教育、卫生等其他公共建筑。<br/></span>
        <span class="indent">7.房屋登记：是指房屋登记机构依法将房屋权利和其他应当记载的事项在房屋登记簿上予以记载的行为。<br/></span>
        <span class="indent">8.所有权转移登记：是指商品房所有权从出卖人转移至买受人所办理的登记类型。<br/></span>
        <span class="indent">9.房屋登记机构：是指直辖市、市、县人民政府建设（房地产）主管部门或者其设置的负责房屋登记工作的机构。<br/></span>
        <span class="indent">10.分割拆零销售：是指房地产开发企业将成套的商品住宅分割为数部分分别出售给买受人的销售方式。<br/></span>
        <span class="indent">11.返本销售：是指房地产开发企业以定期向买受人返还购房款的方式销售商品房的行为。<br/></span>
        <span class="indent">12.售后包租：是指房地产开发企业以在一定期限内承租或者代为出租买受人所购该企业商品房的方式销售商品房的行为。<br/></span>
      </div>
    </div>

    <div style="page-break-after: always;"></div>
    
    <div class="pdfPageContent" :ref="el => setItemRef(el, 'anchor3')">
      <div style="text-align: center" class="st2h">
        商品房买卖合同
      </div>
      <div style="text-align: center;">
        （预&nbsp;&nbsp;售）
      </div>
      <br/>
      <span class="indent">
        出卖人向买受人出售其开发建设的房屋，双方当事人应当在自愿、平等、公平及诚实信用的基础上，根据《中华人民共和国合同法》、《中华人民共和国物权法》、《中华人民共和国城市房地产管理法》等法律、法规的规定，就商品房买卖相关内容协商达成一致意见，签订本商品房买卖合同。
      </span>
      <br/>
      <br/>
      <div :ref="el => setItemRef(el, 'chapter1')" class="ht3h">
        第一章 合同当事人
      </div>
      <div style="display: flex; flex-direction: column;">
        <div class="inputRowL">
          <span class="inputLabel">出卖人：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">通讯地址：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">邮政编码：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">营业执照注册号：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">企业资质证书号：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div class="inputRow">
            <span class="inputLabel">法定代表人：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
            <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
          </div>
          <div class="inputRow">
            <span class="inputLabel">联系电话：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
            <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center;">
          <div class="inputRow">
            <span class="inputLabel">委托代理人：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
            <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
          </div>
          <div class="inputRow">
            <span class="inputLabel">联系电话：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
            <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
          </div>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">委托销售经纪机构：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">通讯地址：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">邮政编码：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">营业执照注册号：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div class="inputRowL">
          <span class="inputLabel">经纪机构备案证明号：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
          <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div class="inputRow">
            <span class="inputLabel">法定代表人：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
            <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
          </div>
          <div class="inputRow">
            <span class="inputLabel">联系电话：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
            <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="pdfPageContent">
    </div> -->
  </div>
</template>
  
<script lang="ts" setup>
import { reactive } from 'vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'edit'
  },
  downloadFlag: {
    type: Boolean,
    default: false
  }
})

let formState = reactive({
  htbh: 'XS20211200028',
  cmr: '',
  msr: ''
})

const itemRefs:any = reactive({});

const scrollToAnchor = (anchorName) => {
  if (itemRefs[anchorName]) {
    itemRefs[anchorName].scrollIntoView({ behavior: 'smooth' });
  }
};

const setItemRef = (el, index) => {
  if (el) {
    itemRefs[index] = el;
  }
};

function adjustFontSize(id) {
  const container :any = document.getElementById(id)
  const originalFontSize = parseFloat(getComputedStyle(container).fontSize)
  let currentFontSize = originalFontSize
  container.style.fontSize = currentFontSize + "px"

  if (container.scrollWidth > container.clientWidth) {
    // 如果内容仍然超出容器宽度，则减小字体大小
    currentFontSize -= 1
    adjustFontSize(id)
  }
}

</script>

<style lang="less" scoped>
@import url('/@/views/system/contract/components/mb.less');
.viewTemplate {
  .pdfPageContent {
    border: 2px solid #ccc;
    margin-top: 10px;
    padding: 80px;
  }
}
</style>