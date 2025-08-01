<template>
  <div :class="{'YSTemplate': true, 'viewTemplate': !downloadFlag, 'st4h': true}" style="line-height: 40px;" ref="templateContent">
    <div class="pdfPageContent">
      <div style="display: flex; justify-content: space-between;">
        <span>GF-2014-0171</span>
        <div class="inputRowS">
          <span class="inputLabel">合同编号：</span>
          <a-input v-if="mode == 'edit'" v-model:value="formState.htbh"></a-input>
          <span v-else class="inputValue">{{ formState.htbh }}</span>
        </div>
      </div>
      <canvas class="qrCode" id="qrCode" width="150px" height="150px"></canvas>

      <div class="st38b" style="font-weight: bold; text-align: center; margin-top: 40%; transform: translateY(-30px);">商品房买卖合同（预售）</div>

      <div style="display: flex; flex-direction: column; margin-top: 30%;">
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

      <div style="padding-top: 200px; font-size: 20px;display: flex;align-items: center;justify-content: center;">
        <div style="display: flex; flex-direction: column;padding-right: 15px;">
          <span style="text-align-last: justify;">中华人民共和国住房和城乡建设部</span>
          <span>中华人民共和国国家工商行政管理总局</span>
        </div>
        <div>制定</div>
      </div>
    </div>

    <div style="page-break-after: always;"></div>
    
    <div class="pdfPageContent">
      <div style="text-align: center" class="st2hB">
        目&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录
      </div>

      <div style="margin-top: 90px; display: flex; flex-direction: column; cursor: pointer;">
        <span @click="scrollToAnchor('anchor1')">说&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明</span>
        <span @click="scrollToAnchor('anchor2')">专业术语解释</span>
        <span @click="scrollToAnchor('chapter1')">第一章&nbsp;&nbsp;合同当事人</span>
        <span @click="scrollToAnchor('chapter2')">第二章&nbsp;&nbsp;商品房基本状况</span>
        <span @click="scrollToAnchor('chapter3')">第三章&nbsp;&nbsp;商品房价款</span>
        <span @click="scrollToAnchor('chapter4')">第四章&nbsp;&nbsp;商品房交付条件与交付手续</span>
        <span @click="scrollToAnchor('chapter5')">第五章&nbsp;&nbsp;面积差异处理方式</span>
        <span @click="scrollToAnchor('chapter6')">第六章&nbsp;&nbsp;规划设计变更</span>
        <span @click="scrollToAnchor('chapter7')">第七章&nbsp;&nbsp;商品房质量及保修责任</span>
        <span @click="scrollToAnchor('chapter8')">第八章&nbsp;&nbsp;合同备案与房屋登记</span>
        <span @click="scrollToAnchor('chapter9')">第九章&nbsp;&nbsp;前期物业管理</span>
        <span @click="scrollToAnchor('chapter10')">第十章&nbsp;&nbsp;其他事项</span>
      </div>
    </div>
    
    <div style="page-break-after: always;"></div>

    <div class="pdfPageContent"  :ref="el => setItemRef(el, 'anchor1')">
      <div style="text-align: center" class="st2hB">
        说&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;明
      </div>
      <div class="mt40">
        <span class="indent">1.本合同文本为示范文本，由中华人民共和国住房和城乡建设部、中华人民共和国国家工商行政管理总局共同制定。各地可在有关法律法规、规定的范围内，结合实际情况调整合同相应内容。<br/></span>
        <span class="indent">2.签订本合同前，出卖人应当向买受人出示《商品房预售许可证》及其他有关证书和证明文件。<br/></span>
        <span class="indent">3.出卖人应当就合同重大事项对买受人尽到提示义务。买受人应当审慎签订合同，在签订本合同前，要仔细阅读合同条款，特别是审阅其中具有选择性、补充性、修改性的内容，注意防范潜在的市场风险和交易风险。<br/></span>
        <span class="indent">4.本合同文本【】中选择内容、空格部位填写内容及其他需要删除或添加的内容，双方当事人应当协商确定。 【】中选择内容，以划✓方式选定；对于实际情况未发生或双方当事人不作约定时，应当在空格部位打× ，以示删除。<br/></span>
        <span class="indent">5.出卖人与买受人可以针对本合同文本中没有约定或者约定不明确的内容，根据所售项目的具体情况在相关条款后的空白行中进行补充约定，也可以另行签订补充协议。<br/></span>
        <span class="indent">6.双方当事人可以根据实际情况决定本合同原件的份数，并在签订合同时认真核对，以确保各份合同内容一致；在任何情况下，出卖人和买受人都应当至少持有一份合同原件。<br/></span>
      </div>
    </div>

    <div style="page-break-after: always;"></div>
    
    <div class="pdfPageContent" :ref="el => setItemRef(el, 'anchor2')">
      <div style="text-align: center" class="st2hB">
        专业术语解释
      </div>
      <div class="mt40">
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
    
    <div class="pdfPageContent pdfPageContentBig" :ref="el => setItemRef(el, 'anchor3')">
      <div style="text-align: center" class="st2hB">
        商品房买卖合同
      </div>
      <div style="text-align: center;">
        （预&nbsp;&nbsp;售）
      </div>
      <br/>
      <span class="indent mt40">
        出卖人向买受人出售其开发建设的房屋，双方当事人应当在自愿、平等、公平及诚实信用的基础上，根据《中华人民共和国合同法》、 《中华人民共和国物权法》、 《中华人民共和国城市房地产管理法》等法律、法规的规定，就商品房买卖相关内容协商达成一致意见，签订本商品房买卖合同。
      </span>
      
      <!-- 第一章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter1')" class="ht3h">
          第一章 合同当事人
        </div>
        <!-- 出卖人 -->
        <div style="display: flex; flex-direction: column; justify-content: center; line-height: 40px;">
          <div class="inputRowL">
            <span class="inputLabel">出卖人：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmr"></a-input>
            <span v-else class="inputValue">{{ formState.cmr || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">通讯地址：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmrtxdz"></a-input>
            <span v-else class="inputValue">{{ formState.cmrtxdz || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">邮政编码：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmryzbm"></a-input>
            <span v-else class="inputValue">{{ formState.cmryzbm || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">营业执照注册号：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmryyzzzch"></a-input>
            <span v-else class="inputValue">{{ formState.cmryyzzzch || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">企业资质证书号：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmrqyzzzsh"></a-input>
            <span v-else class="inputValue">{{ formState.cmrqyzzzsh || 'x' }}</span>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="inputRow">
              <span class="inputLabel">法定代表人：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.cmrfddbr"></a-input>
              <span v-else class="inputValue">{{ formState.cmrfddbr || 'x' }}</span>
            </div>
            <div class="inputRow">
              <span class="inputLabel">联系电话：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.cmrlxdh"></a-input>
              <span v-else class="inputValue">{{ formState.cmrlxdh || 'x' }}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="inputRow">
              <span class="inputLabel">委托代理人：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.cmrwtdlr"></a-input>
              <span v-else class="inputValue">{{ formState.cmrwtdlr || 'x' }}</span>
            </div>
            <div class="inputRow">
              <span class="inputLabel">联系电话：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.cmrwtdlrdh"></a-input>
              <span v-else class="inputValue">{{ formState.cmrwtdlrdh || 'x' }}</span>
            </div>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">委托销售经纪机构：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmrwtxsjjjg"></a-input>
            <span v-else class="inputValue">{{ formState.cmrwtxsjjjg || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">通讯地址：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmrxsjjjgtxdz"></a-input>
            <span v-else class="inputValue">{{ formState.cmrxsjjjgtxdz || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">邮政编码：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmrxsjjjgyzbm"></a-input>
            <span v-else class="inputValue">{{ formState.cmrxsjjjgyzbm || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">营业执照注册号：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmrxsjjjgyyzzzch"></a-input>
            <span v-else class="inputValue">{{ formState.cmrxsjjjgyyzzzch || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">经纪机构备案证明号：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.cmrjjjgbazms"></a-input>
            <span v-else class="inputValue">{{ formState.cmrjjjgbazms || 'x' }}</span>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="inputRow">
              <span class="inputLabel">法定代表人：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.cmrjjjgfddbr"></a-input>
              <span v-else class="inputValue">{{ formState.cmrjjjgfddbr || 'x' }}</span>
            </div>
            <div class="inputRow">
              <span class="inputLabel">联系电话：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.cmrjjjglxdh"></a-input>
              <span v-else class="inputValue">{{ formState.cmrjjjglxdh || 'x' }}</span>
            </div>
          </div>
        </div>
        <!-- 买受人 -->
        <div style="display: flex; flex-direction: column;">
          <div class="inputRowL">
            <span class="inputLabel">买受人：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.msr"></a-input>
            <span v-else class="inputValue">{{ formState.msr || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <div class="inputLabel">
              <a-input v-show="false" v-model:value="formState.msrlx"></a-input>
              <span @click="onCheck('msrlx', '法定代表人')" :class="{userCheckedBox: formState.msrlx == '法定代表人', userBox: true}"> 【法定代表人】 </span>
              <span @click="onCheck('msrlx', '负责人')" :class="{userCheckedBox: formState.msrlx == '负责人', userBox: true}"> 【负责人】 </span>
              <span>：</span>
            </div>
            <a-input v-if="mode == 'edit'" v-model:value="formState.msrlxvalue"></a-input>
            <div v-else class="inputValue">{{ formState.msrlxvalue || 'x' }}</div>
          </div>
          <div class="inputRowL">
            <div class="inputLabel">
              <a-input v-show="false" v-model:value="formState.gj"></a-input>
              <span @click="onCheck('gj', '国籍')" :class="{userCheckedBox: formState.gj == '国籍', userBox: true}"> 【国籍】 </span>
              <span @click="onCheck('gj', '户籍所在地')" :class="{userCheckedBox: formState.gj == '户籍所在地', userBox: true}"> 【户籍所在地】 </span>
              <span>：</span>
            </div>
            <a-input v-if="mode == 'edit'" v-model:value="formState.msrgjvalue"></a-input>
            <span v-else class="inputValue">{{ formState.msrgjvalue || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <div class="inputLabel">
              <a-input v-show="false" v-model:value="formState.msrzjlx"></a-input>
              <span>证件类型： </span>
              <span @click="onCheck('msrzjlx', '居民身份证')" :class="{userCheckedBox: formState.msrzjlx == '居民身份证', userBox: true}"> 【居民身份证】 </span>
              <span @click="onCheck('msrzjlx', '护照')" :class="{userCheckedBox: formState.msrzjlx == '护照', userBox: true}"> 【护照】 </span>
              <span @click="onCheck('msrzjlx', '营业执照')" :class="{userCheckedBox: formState.msrzjlx == '营业执照', userBox: true}"> 【营业执照】 </span>
              <span>：</span>
            </div>
            <a-input v-if="mode == 'edit'" v-model:value="formState.msrzzlxvalue"></a-input>
            <span v-else class="inputValue">{{ formState.msrzzlxvalue || 'x' }}</span>
          </div>
          <div class="inputRowL">
            <div class="inputLabel">证号：</div>
            <a-input v-if="mode == 'edit'" v-model:value="formState.msrzh"></a-input>
            <span v-else class="inputValue">{{ formState.msrzh || 'x' }}</span>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="inputRow">
              <span class="inputLabel">出生日期：</span>
              <a-date-picker style="width: 77%;" v-if="mode == 'edit'" v-model:value="formState.msrcsrq" format="YYYY年MM月DD日" />
              <span v-else class="inputValue">{{ formState.msrcsrq || 'x' }}</span>
            </div>
            <div class="inputRow">
              <span class="inputLabel">性别：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.msrxb"></a-input>
              <span v-else class="inputValue">{{ formState.msrxb || 'x' }}</span>
            </div>
          </div>
          <div class="inputRowL">
            <span class="inputLabel">通讯地址：</span>
            <a-input v-if="mode == 'edit'" v-model:value="formState.msrtxdz"></a-input>
            <span v-else class="inputValue">{{ formState.msrtxdz || 'x' }}</span>
          </div>
          <div style="display: flex; align-items: center;">
            <div class="inputRow">
              <span class="inputLabel">邮政编码：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.msryzbm"></a-input>
              <span v-else class="inputValue">{{ formState.msryzbm || 'x' }}</span>
            </div>
            <div class="inputRow">
              <span class="inputLabel">联系电话：</span>
              <a-input v-if="mode == 'edit'" v-model:value="formState.msrlxdh"></a-input>
              <span v-else class="inputValue">{{ formState.msrlxdh || 'x' }}</span>
            </div>
          </div>
        </div>
        <span>（买受人为多人时，可相应增加）</span>
      </div>

      <!-- 第二章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter2')" class="ht3h">
          第二章 商品房基本状况
        </div>
        <!-- 第一条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list1')" class="listTitle indent"><span class="st4hB">第一条 </span>项目建设依据</div>
          <div class="paragraph">
            <span class="indent">1.出卖人以</span>
            <a-input v-show="false" v-model:value="formState.cmfs"></a-input>
            <span @click="onCheck('cmfs', '出让')" :class="{userCheckedBox: formState.cmfs == '出让', userBox: true}">【出让】</span>
            <span @click="onCheck('cmfs', '划拨')" :class="{userCheckedBox: formState.cmfs == '划拨', userBox: true}"> 【划拨】</span>
            <span>方式取得坐落于</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.dk"></a-input>
            <span v-else :class="[formState.dk ? 'custom-underline' : 'value300']">&nbsp;{{ formState.dk || 'x'}}&nbsp;</span>
            <span>地块的建设用地使用权。该地块【国有土地使用证号】【</span>
            <a-input v-if="mode == 'edit'" class="input150" v-model:value="formState.syqzsmc"></a-input>
            <span v-else :class="[formState.syqzsmc ? 'custom-underline' : 'value150']">&nbsp;{{ formState.syqzsmc || 'x'}}&nbsp;</span>
            <span>】为</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.syqzszh"></a-input>
            <span v-else :class="[formState.syqzszh ? 'custom-underline' : 'value300']">&nbsp;{{ formState.syqzszh || 'x'}}&nbsp;</span>
            <span>，土地使用权面积为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.tdsyqmj"></a-input>
            <span v-else :class="[formState.tdsyqmj ? 'custom-underline' : 'value100']">&nbsp;{{ formState.tdsyqmj || 'x'}}&nbsp;</span>
            <span>平方米。买受人购买的商品房（以下简称该商品房）所占用的土地用途为</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.tdyt"></a-input>
            <span v-else :class="[formState.tdyt ? 'custom-underline' : 'value200']">&nbsp;{{ formState.tdyt || 'x'}}&nbsp;</span>
            <span>，土地使用权终止日期为</span>
            <a-date-picker v-if="mode == 'edit'" class="input200" v-model:value="formState.syqzzrq" format="YYYY年MM月DD日" />
            <span v-else :class="[formState.syqzzrq ? 'custom-underline' : 'value200']">&nbsp;{{ formState.syqzzrq || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.出卖人经批准，在上述地块上建设的商品房项目核准名称为</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.xmhzmc"></a-input>
            <span v-else :class="[formState.xmhzmc ? 'custom-underline' : 'value300']">&nbsp;{{ formState.xmhzmc || 'x'}}&nbsp;</span>
            <span>建设工程规划许可证号为</span>
            <a-input v-if="mode == 'edit'" class="input150" v-model:value="formState.jsgcghxkzh"></a-input>
            <span v-else :class="[formState.jsgcghxkzh ? 'custom-underline' : 'value150']">&nbsp;{{ formState.jsgcghxkzh || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
        </div>
        <!-- 第二条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list2')" class="listTitle indent"><span class="st4hB">第二条 </span>预售依据</div>
          <div class="paragraph">
            <span class="indent">该商品房已由</span>
            <a-input v-if="mode == 'edit'" class="input150" v-model:value="formState.xmpzjg"></a-input>
            <span v-else :class="[formState.xmpzjg ? 'custom-underline' : 'value150']">&nbsp;{{ formState.xmpzjg || 'x'}}&nbsp;</span>
            <span>批准预售，预售许可证号为</span>
            <a-input v-if="mode == 'edit'" class="input150" v-model:value="formState.ysxkzh"></a-input>
            <span v-else :class="[formState.ysxkzh ? 'custom-underline' : 'value150']">&nbsp;{{ formState.ysxkzh || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
        </div>
        <!-- 第三条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list3')" class="listTitle indent"><span class="st4hB">第三条 </span>商品房基本信息</div>
          <div class="paragraph">
            <span class="indent">1.该商品房的规划用途为</span>
            <a-input v-show="false" v-model:value="formState.spfghyt"></a-input>
            <span @click="onCheck('spfghyt', '住宅')" :class="{userCheckedBox: formState.spfghyt == '住宅', userBox: true}">【住宅】</span>
            <span @click="onCheck('spfghyt', '办公')" :class="{userCheckedBox: formState.spfghyt == 'bg', userBox: true}"> 【办公】</span>
            <span @click="onCheck('spfghyt', '商业')" :class="{userCheckedBox: formState.spfghyt == '商业', userBox: true}"> 【商业】</span>
            <span :class="{userCheckedBox: formState.spfghytOther, userBox: true}"> 【
              <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.spfghytOther"></a-input>
              <span v-else :class="[formState.spfghytOther ? 'custom-underline' : 'value100']">&nbsp;{{ formState.spfghytOther || 'x'}}&nbsp;</span>
            】 。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.该商品房所在建筑物的主体结构为</span>
            <a-input v-if="mode == 'edit'" class="input150" v-model:value="formState.jzwztjg"></a-input>
            <span v-else :class="[formState.jzwztjg ? 'custom-underline' : 'value150']">&nbsp;{{ formState.jzwztjg || 'x'}}&nbsp;</span>
            <span>，建筑总层数为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.jzzcs"></a-input>
            <span v-else :class="[formState.jzzcs ? 'custom-underline' : 'value100']">&nbsp;{{ formState.jzzcs || 'x'}}&nbsp;</span>
            <span>层，其中地上</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dscs"></a-input>
            <span v-else :class="[formState.dscs ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dscs || 'x'}}&nbsp;</span>
            <span>层，地下</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dxcs"></a-input>
            <span v-else :class="[formState.dxcs ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dxcs || 'x'}}&nbsp;</span>
            <span>层。</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.该商品房为第一条规定项目中的</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.ldh"></a-input>
            <span v-else :class="[formState.ldh ? 'custom-underline' : 'value100']">&nbsp;{{ formState.ldh || 'x'}}&nbsp;</span>
            <a-input v-show="false" v-model:value="formState.dw"></a-input>
            <span @click="onCheck('dw', '幢')" :class="{userCheckedBox: formState.dw == '幢', userBox: true}">【幢】</span>
            <span @click="onCheck('dw', '座')" :class="{userCheckedBox: formState.dw == '座', userBox: true}"> 【座】</span>
            <span :class="{userCheckedBox: formState.dwOther, userBox: true}"> 【
              <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dwOther"></a-input>
              <span v-else :class="[formState.dwOther ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dwOther || 'x'}}&nbsp;</span>
            】</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dy"></a-input>
            <span v-else :class="[formState.dy ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dy || 'x'}}&nbsp;</span>
            <span>单元</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.lc"></a-input>
            <span v-else :class="[formState.lc ? 'custom-underline' : 'value100']">&nbsp;{{ formState.lc || 'x'}}&nbsp;</span>
            <span>层</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.fjh"></a-input>
            <span v-else :class="[formState.fjh ? 'custom-underline' : 'value100']">&nbsp;{{ formState.fjh || 'x'}}&nbsp;</span>
            <span>号。房屋竣工后，如房号发生改变，不影响该商品房的特定位置。该商品房的平面图见附件一。</span>
          </div>
          <div class="paragraph"> 
            <span class="indent">4.该商品房的房产测绘机构为</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.fcchjg"></a-input>
            <span v-else :class="[formState.fcchjg ? 'custom-underline' : 'value200']">&nbsp;{{ formState.fcchjg || 'x'}}&nbsp;</span>
            <span>，其预测建筑面积共</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.ycjzmj"></a-input>
            <span v-else :class="[formState.ycjzmj ? 'custom-underline' : 'value100']">&nbsp;{{ formState.ycjzmj || 'x'}}&nbsp;</span>
            <span>平方米，其中套内建筑面积</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.tnjzmj"></a-input>
            <span v-else :class="[formState.tnjzmj ? 'custom-underline' : 'value100']">&nbsp;{{ formState.tnjzmj || 'x'}}&nbsp;</span>
            <span>平方米，分摊共有建筑面积</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.ftgyjzmj"></a-input>
            <span v-else :class="[formState.ftgyjzmj ? 'custom-underline' : 'value100']">&nbsp;{{ formState.ftgyjzmj || 'x'}}&nbsp;</span>
            <span>平方米。该商品房共用部位见附件二。</span>
          </div>
          <div class="paragraph">
            <span class="indent">5.该商品层高为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.cg"></a-input>
            <span v-else :class="[formState.cg ? 'custom-underline' : 'value100']">&nbsp;{{ formState.cg || 'x'}}&nbsp;</span>
            <span>米，有</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.yts"></a-input>
            <span v-else :class="[formState.yts ? 'custom-underline' : 'value100']">&nbsp;{{ formState.yts || 'x'}}&nbsp;</span>
            <span>个阳台，其中</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.fbyts"></a-input>
            <span v-else :class="[formState.fbyts ? 'custom-underline' : 'value100']">&nbsp;{{ formState.fbyts || 'x'}}&nbsp;</span>
            <span>个阳台为封闭式，</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.ffbyts"></a-input>
            <span v-else :class="[formState.ffbyts ? 'custom-underline' : 'value100']">&nbsp;{{ formState.ffbyts || 'x'}}&nbsp;</span>
            <span>个阳台为非封闭式。阳台是否封闭以规划设计文件为准。</span>
          </div>
        </div>
        <!-- 第四条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list4')" class="listTitle indent"><span class="st4hB">第四条 </span>抵押情况</div>
          <div class="paragraph">
            <span class="indent">该商品房有关的抵押情况为</span>
            <a-input v-show="false" v-model:value="formState.dyqk"></a-input>
            <span @click="onCheck('dyqk', '抵押')" :class="{userCheckedBox: formState.dyqk == '抵押', userBox: true}">【抵押】</span>
            <span @click="onCheck('dyqk', '未抵押')" :class="{userCheckedBox: formState.dyqk == '未抵押', userBox: true}"> 【未抵押】</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">抵押类型： </span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dylx"></a-input>
            <span v-else :class="[formState.dylx ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dylx || 'x'}}&nbsp;</span>
            <span>，抵押人：</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dyr"></a-input>
            <span v-else :class="[formState.dyr ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dyr || 'x'}}&nbsp;</span>
            <span>，</span>
          </div>
          <div class="paragraph">
            <span class="indent">抵押权人： </span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dyqr"></a-input>
            <span v-else :class="[formState.dyqr ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dyqr || 'x'}}&nbsp;</span>
            <span>，抵押登记机构：</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dydjjg"></a-input>
            <span v-else :class="[formState.dydjjg ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dydjjg || 'x'}}&nbsp;</span>
            <span>，</span>
          </div>
          <div class="paragraph">
            <span class="indent">抵押登记日期： </span>
            <a-date-picker v-if="mode == 'edit'" class="input200" v-model:value="formState.dydjrq" format="YYYY年MM月DD日" />
            <span v-else :class="[formState.dydjrq ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dydjrq || 'x'}}&nbsp;</span>
            <span>，债务履行期限：</span>
            <a-date-picker v-if="mode == 'edit'" class="input200" v-model:value="formState.zwlxqx" format="YYYY年MM月DD日" />
            <span v-else :class="[formState.zwlxqx ? 'custom-underline' : 'value200']">&nbsp;{{ formState.zwlxqx || 'x'}}&nbsp;</span>
            <span>，</span>
          </div>
          <div class="paragraph">
            <span class="indent">抵押类型： </span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dylx2"></a-input>
            <span v-else :class="[formState.dylx2 ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dylx2 || 'x'}}&nbsp;</span>
            <span>，抵押人：</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dyr2"></a-input>
            <span v-else :class="[formState.dyr2 ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dyr2 || 'x'}}&nbsp;</span>
            <span>，</span>
          </div>
          <div class="paragraph">
            <span class="indent">抵押权人： </span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dyqr2"></a-input>
            <span v-else :class="[formState.dyqr2 ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dyqr2 || 'x'}}&nbsp;</span>
            <span>，抵押登记机构：</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dydjjg2"></a-input>
            <span v-else :class="[formState.dydjjg2 ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dydjjg2 || 'x'}}&nbsp;</span>
            <span>，</span>
          </div>
          <div class="paragraph">
            <span class="indent">抵押登记日期： </span>
            <a-date-picker v-if="mode == 'edit'" class="input200" v-model:value="formState.dydjrq2" format="YYYY年MM月DD日" />
            <span v-else :class="[formState.dydjrq2 ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dydjrq2 || 'x'}}&nbsp;</span>
            <span>，债务履行期限：</span>
            <a-date-picker v-if="mode == 'edit'" class="input200" v-model:value="formState.zwlxqx2" format="YYYY年MM月DD日" />
            <span v-else :class="[formState.zwlxqx2 ? 'custom-underline' : 'value200']">&nbsp;{{ formState.zwlxqx2 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">抵押权人同意该商品房转让的证明及关于抵押的相关约定见附件三。</span>
          </div>
        </div>
        <!-- 第五条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list5')" class="listTitle indent"><span class="st4hB">第五条 </span>房屋权利状况承诺</div>
          <div class="paragraph">
            <span class="indent">1.出卖人对该商品房享有合法权利；</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.该商品房没有出售给除本合同买受人以外的其他人；</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.该商品房没有司法查封或其他限制转让的情况；</span>
          </div>
          <div class="paragraph">
            <span class="indent">4.
              <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.fwqlzkcn1"></a-input>
              <span v-else :class="[formState.fwqlzkcn1 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.fwqlzkcn1 || 'x'}}&nbsp;</span>
              <span>；</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">5.
              <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.fwqlzkcn2"></a-input>
              <span v-else :class="[formState.fwqlzkcn2 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.fwqlzkcn2 || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">如该商品房权利状况与上述情况不符，导致不能完成本合同登记备案或房屋所有权转移登记的，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.lx"></a-input>
            <span v-else :class="[formState.lx ? 'custom-underline' : 'value200']">&nbsp;{{ formState.lx || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。给买受人造成损失的，由出卖人支付</span>
            <a-input v-show="false" v-model:value="formState.pffs"></a-input>
            <span @click="onCheck('pffs', '已付房价款一倍')" :class="{userCheckedBox: formState.pffs == '已付房价款一倍', userBox: true}">【已付房价款一倍】</span>
            <span @click="onCheck('pffs', '买受人全部损失')" :class="{userCheckedBox: formState.pffs == '买受人全部损失', userBox: true}"> 【买受人全部损失】</span>
            <span>的赔偿金。</span>
          </div>
        </div>
      </div>

      <!-- 第三章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter3')" class="ht3h">
          第三章 商品房价款
        </div>
        <!-- 第六条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list6')" class="listTitle indent"><span class="st4hB">第六条 </span>计价方式与价款</div>
          <div class="paragraph">
            <span class="indent">出卖人与买受人按照下列第</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.fjkjsfs"></a-input>
            <span v-else :class="[formState.fjkjsfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.fjkjsfs || 'x'}}&nbsp;</span>
            <span>种方式计算该商品房价款：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.按照套内建筑面积计算，该商品房单价为每平方米</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.tnjsfsdjbz"></a-input>
            <span v-else :class="[formState.tnjsfsdjbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.tnjsfsdjbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.tnjsfsdj"></a-input>
            <span v-else :class="[formState.tnjsfsdj ? 'custom-underline' : 'value200']">&nbsp;{{ formState.tnjsfsdj || 'x'}}&nbsp;</span>
            <span> 元，总价款为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.tnjsfszjbz"></a-input>
            <span v-else :class="[formState.tnjsfszjbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.tnjsfszjbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.tnjsfszj"></a-input>
            <span v-else :class="[formState.tnjsfszj ? 'custom-underline' : 'value200']">&nbsp;{{ formState.tnjsfszj || 'x'}}&nbsp;</span>
            <span>元（大写</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.tnjsfszjdx"></a-input>
            <span v-else :class="[formState.tnjsfszjdx ? 'custom-underline' : 'value250']">&nbsp;{{ formState.tnjsfszjdx || 'x'}}&nbsp;</span>
            <span>元整） 。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.按照建筑面积计算，该商品房单价为每平方米</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.jzmjjsfsdjbz"></a-input>
            <span v-else :class="[formState.jzmjjsfsdjbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.jzmjjsfsdjbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.jzmjjsfsdj"></a-input>
            <span v-else :class="[formState.jzmjjsfsdj ? 'custom-underline' : 'value200']">&nbsp;{{ formState.jzmjjsfsdj || 'x'}}&nbsp;</span>
            <span>元，总价款为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.jzmjjsfszjbz"></a-input>
            <span v-else :class="[formState.jzmjjsfszjbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.jzmjjsfszjbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.jzmjjsfszj"></a-input>
            <span v-else :class="[formState.jzmjjsfszj ? 'custom-underline' : 'value200']">&nbsp;{{ formState.jzmjjsfszj || 'x'}}&nbsp;</span>
            <span>元（大写</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.jzmjjsfszjdx"></a-input>
            <span v-else :class="[formState.jzmjjsfszjdx ? 'custom-underline' : 'value250']">&nbsp;{{ formState.jzmjjsfszjdx || 'x'}}&nbsp;</span>
            <span>元整） 。</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.按照套计算，该商品房总价款为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.tjsfszjbz"></a-input>
            <span v-else :class="[formState.tjsfszjbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.tjsfszjbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.tjsfszj"></a-input>
            <span v-else :class="[formState.tjsfszj ? 'custom-underline' : 'value200']">&nbsp;{{ formState.tjsfszj || 'x'}}&nbsp;</span>
            <span>元（大写</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.tjsfszjdx"></a-input>
            <span v-else :class="[formState.tjsfszjdx ? 'custom-underline' : 'value250']">&nbsp;{{ formState.tjsfszjdx || 'x'}}&nbsp;</span>
            <span>元整） 。</span>
          </div>
          <div class="paragraph">
            <span class="indent">4.按照</span>
            <a-input v-if="mode == 'edit'" class="input150" v-model:value="formState.qtjsfs"></a-input>
            <span v-else :class="[formState.qtjsfs ? 'custom-underline' : 'value150']">&nbsp;{{ formState.qtjsfs || 'x'}}&nbsp;</span>
            <span>计算，该商品房总价款为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.qtjsfsbz"></a-input>
            <span v-else :class="[formState.qtjsfsbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.qtjsfsbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.qtjsfszj"></a-input>
            <span v-else :class="[formState.qtjsfszj ? 'custom-underline' : 'value200']">&nbsp;{{ formState.qtjsfszj || 'x'}}&nbsp;</span>
            <span>元（大写</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.qtjsfszjdx"></a-input>
            <span v-else :class="[formState.qtjsfszjdx ? 'custom-underline' : 'value250']">&nbsp;{{ formState.qtjsfszjdx || 'x'}}&nbsp;</span>
            <span>元整） 。</span>
          </div>
        </div>
        <!-- 第七条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list7')" class="listTitle indent"><span class="st4hB">第七条 </span>付款方式及期限</div>
          <div class="paragraph">
            <span class="indent">
              （一）签订本合同前，买受人已向出卖人支付定金
            </span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.bz"></a-input>
            <span v-else :class="[formState.bz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.bz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dj"></a-input>
            <span v-else :class="[formState.dj ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dj || 'x'}}&nbsp;</span>
            <span>元（大写），该定金于</span>
            <a-input v-show="false" v-model:value="formState.djyt"></a-input>
            <span @click="onCheck('djyt', '本合同签订')" :class="{userCheckedBox: formState.djyt == '本合同签订', userBox: true}">【本合同签订】</span>
            <span @click="onCheck('djyt', '交付首付款')" :class="{userCheckedBox: formState.djyt == '交付首付款', userBox: true}"> 【交付首付款】</span>
            <span :class="{userCheckedBox: formState.djytOther, userBox: true}">【
              <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.djytOther"></a-input>
              <span v-else :class="[formState.djytOther ? 'custom-underline' : 'value100']">&nbsp;{{ formState.djytOther || 'x'}}&nbsp;</span>
            】 时</span>
            <a-input v-show="false" v-model:value="formState.djjy"></a-input>
            <span @click="onCheck('djjy', '抵作')" :class="{userCheckedBox: formState.djjy == '抵作', userBox: true}">【抵作】</span>
            <span :class="{userCheckedBox: formState.djjyOther, userBox: true}">【
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.djjyOther"></a-input>
            <span v-else :class="[formState.djjyOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.djjyOther || 'x'}}&nbsp;</span>
            】 商品房价款。</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              （二）买受人采取下列第
            </span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.msrfkfs"></a-input>
            <span v-else :class="[formState.msrfkfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.msrfkfs || 'x'}}&nbsp;</span>
            <span>种方式付款：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.一次性付款。买受人应当在</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ycxn"></a-input>
            <span v-else :class="[formState.ycxn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ycxn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ycxy"></a-input>
            <span v-else :class="[formState.ycxy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ycxy || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ycxr"></a-input>
            <span v-else :class="[formState.ycxr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ycxr || 'x'}}&nbsp;</span>
            <span>日前支付该商品房全部价款。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.分期付款。买受人应当在</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fqn"></a-input>
            <span v-else :class="[formState.fqn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fqn || 'x'}}&nbsp; </span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fqy"></a-input>
            <span v-else :class="[formState.fqy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fqy || 'x'}}&nbsp; </span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fqr"></a-input>
            <span v-else :class="[formState.fqr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fqr || 'x'}}&nbsp; </span>
            <span>日前分</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fqq"></a-input>
            <span v-else :class="[formState.fqq ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fqq || 'x'}}&nbsp;</span>
            <span>期支付该商品房全部价款，首期房价款</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.fqbz"></a-input>
            <span v-else :class="[formState.fqbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.fqbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.sqfjk"></a-input>
            <span v-else :class="[formState.sqfjk ? 'custom-underline' : 'value200']">&nbsp;{{ formState.sqfjk || 'x'}}&nbsp;</span>
            <span>元（大写</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.sqfjkdx"></a-input>
            <span v-else :class="[formState.sqfjkdx ? 'custom-underline' : 'value250']">&nbsp;{{ formState.sqfjkdx || 'x'}}&nbsp;</span>
            <span>元整），应当于</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fqjsn"></a-input>
            <span v-else :class="[formState.fqjsn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fqjsn || 'x'}}&nbsp; </span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fqjsy"></a-input>
            <span v-else :class="[formState.fqjsy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fqjsy || 'x'}}&nbsp; </span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fqjsr"></a-input>
            <span v-else :class="[formState.fqjsr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fqjsr || 'x'}}&nbsp; </span>
            <span>日前支付</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.贷款方式付款：</span>
            <a-input v-show="false" v-model:value="formState.dkfs"></a-input>
            <span @click="onCheck('dkfs', '公积金贷款')" :class="{userCheckedBox: formState.dkfs == '公积金贷款', userBox: true}"> 【公积金贷款】</span>
            <span @click="onCheck('dkfs', '商业贷款')" :class="{userCheckedBox: formState.dkfs == '商业贷款', userBox: true}"> 【商业贷款】</span>
            <span :class="{userCheckedBox: formState.dkfsOther, userBox: true}"> 【
              <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dkfsOther"></a-input>
              <span v-else :class="[formState.dkfsOther ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dkfsOther || 'x'}}&nbsp;</span>
            】 ，买受人应当于</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.dkn"></a-input>
            <span v-else :class="[formState.dkn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.dkn || 'x'}}&nbsp; </span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.dky"></a-input>
            <span v-else :class="[formState.dky ? 'custom-underline' : 'value70']">&nbsp;{{ formState.dky || 'x'}}&nbsp; </span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.dkr"></a-input>
            <span v-else :class="[formState.dkr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.dkr || 'x'}}&nbsp; </span>
            <span>日前支付首期房价款</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dkbz"></a-input>
            <span v-else :class="[formState.dkbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dkbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.dksqfjk"></a-input>
            <span v-else :class="[formState.dksqfjk ? 'custom-underline' : 'value200']">&nbsp;{{ formState.dksqfjk || 'x'}}&nbsp;</span>
            <span>元（大写</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.dksqfjkdx"></a-input>
            <span v-else :class="[formState.dksqfjkdx ? 'custom-underline' : 'value250']">&nbsp;{{ formState.dksqfjkdx || 'x'}}&nbsp;</span>
            <span>元整），占全部房价款的</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.dkjsn"></a-input>
            <span v-else :class="[formState.dkjsn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.dkjsn || 'x'}}&nbsp; </span>
            <span>％ 。</span>
          </div>
          <div class="paragraph">
            <span class="indent">余款</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.ykbz"></a-input>
            <span v-else :class="[formState.ykbz ? 'custom-underline' : 'value100']">&nbsp;{{ formState.ykbz || 'x'}}&nbsp;</span>
            <span>（币种）</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.ykjk"></a-input>
            <span v-else :class="[formState.ykjk ? 'custom-underline' : 'value200']">&nbsp;{{ formState.ykjk || 'x'}}&nbsp;</span>
            <span>元（大写</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.ykjkdx"></a-input>
            <span v-else :class="[formState.ykjkdx ? 'custom-underline' : 'value250']">&nbsp;{{ formState.ykjkdx || 'x'}}&nbsp;</span>
            <span>元整），向</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.dkjg"></a-input>
            <span v-else :class="[formState.dkjg ? 'custom-underline' : 'value250']">&nbsp;{{ formState.dkjg || 'x'}}&nbsp;</span>
            <span>（贷款机构）申请贷款支付。</span>
          </div>
          <div class="paragraph">
            <span class="indent">4.其他方式：</span>
          </div>
          <div class="paragraph">
            <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.qtfkfs"></a-input>
            <span v-else :class="[formState.qtfkfs ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.qtfkfs || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              （三）出售该商品房的全部房价款应当存入预售资金监管账户，用于本工程建设。
            </span>
          </div>
          <div class="paragrah">
            <span class="indent">
              该商品房的预售资金监管机构为
            </span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.ysjjjgjg"></a-input>
            <span v-else :class="[formState.ysjjjgjg ? 'custom-underline' : 'value300']">&nbsp;{{ formState.ysjjjgjg || 'x'}}&nbsp;</span>
            <span>，预售资金监管账户名称为</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.ysjjjgzhmc"></a-input>
            <span v-else :class="[formState.ysjjjgzhmc ? 'custom-underline' : 'value250']">&nbsp;{{ formState.ysjjjgzhmc || 'x'}}&nbsp;</span>
            <span>，账号为</span>
            <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.ysjjjgzh"></a-input>
            <span v-else :class="[formState.ysjjjgzh ? 'custom-underline' : 'value250']">&nbsp;{{ formState.ysjjjgzh || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragrah">
            <span class="indent">该商品房价款的计价方式、总价款、付款方式及期限的具体约定见附件四。</span>
          </div>
        </div>
        <!-- 第八条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list8')" class="listTitle indent"><span class="st4hB">第八条 </span>逾期付款责任</div>
          <div class="paragraph">
            <span class="indent">除不可抗力外，买受人未按照约定时间付款的，双方同意按照下列第</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqfkclfs"></a-input>
            <span v-else :class="[formState.yqfkclfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqfkclfs || 'x'}}&nbsp;</span>
            <span>种方式处理：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.按照逾期时间，分别处理（ （1）和（2）不作累加）。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）逾期在 </span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqts"></a-input>
            <span v-else :class="[formState.yqts ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqts || 'x'}}&nbsp;</span>
            <span>之内，买受人按日计算向出卖人支付逾期应付款万分之</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqwwjbl"></a-input>
            <span v-else :class="[formState.yqwwjbl ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqwwjbl || 'x'}}&nbsp;</span>
            <span>的违约金。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）逾期超过 </span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqcgts"></a-input>
            <span v-else :class="[formState.yqcgts ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqcgts || 'x'}}&nbsp;</span>
            <span>日（该期限应当与本条第（1）项中的期限相同）后，出卖人有权解除合同。出卖人解除合同的，应当书面通知买受人。买受人应当自解除合同通知送达之日起</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.htsdrq"></a-input>
            <span v-else :class="[formState.htsdrq ? 'custom-underline' : 'value50']">&nbsp;{{ formState.htsdrq || 'x'}}&nbsp;</span>
            <span>日内按照累计应付款的</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.wyjbl"></a-input>
            <span v-else :class="[formState.wyjbl ? 'custom-underline' : 'value50']">&nbsp;{{ formState.wyjbl || 'x'}}&nbsp;</span>
            <span>%向出卖人支付违约金，同时，出卖人退还买受人已付全部房款（含已付贷款部分）。</span>
          </div>
          <div class="paragraph">
            <span class="indent">出卖人不解除合同的，买受人按日计算向出卖人支付逾期应付款万分之</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqyfbl"></a-input>
            <span v-else :class="[formState.yqyfbl ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqyfbl || 'x'}}&nbsp;</span>
            <span>（该比率不低于第（1）项中的比率）的违约金。</span>
          </div>
          <div class="paragraph">
            <span class="indent">本条所称逾期应付款是指依照第七条及附件四约定的到期应付款与该期实际已付款的差额；采取分期付款的，按照相应的分期应付款与该期的实际已付款的差额确定。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.qtyqfkfs"></a-input>
            <span v-else :class="[formState.qtyqfkfs ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.qtyqfkfs || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
        </div>

      </div>

      <!-- 第四章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter4')" class="ht3h">
          第四章 商品房交付条件与交付手续
        </div>
        <!-- 第九条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list9')" class="listTitle indent"><span class="st4hB">第九条 </span>商品房交付条件</div>
          <div class="paragraph">
            <span class="indent">该商品房交付时应当符合下列第 1、 2、</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.jftj1"></a-input>
            <span v-else :class="[formState.jftj1 ? 'custom-underline' : 'value50']">&nbsp;{{ formState.jftj1 || 'x'}}&nbsp;</span>
            <span>、</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.jftj2"></a-input>
            <span v-else :class="[formState.jftj2 ? 'custom-underline' : 'value50']">&nbsp;{{ formState.jftj2 || 'x'}}&nbsp;</span>
            <span>项所列条件：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.该商品房已取得建设工程竣工验收备案证明文件；</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.该商品房已取得房屋测绘报告；</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.jftjnr1"></a-input>
            <span v-else :class="[formState.jftjnr1 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.jftjnr1 || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">4.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.jftjnr2"></a-input>
            <span v-else :class="[formState.jftjnr2 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.jftjnr2 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">该商品房为住宅的，出卖人还需提供《住宅使用说明书》和《住宅质量保证书》。</span>
          </div>
        </div>
        <!-- 第十条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list10')" class="listTitle indent"><span class="st4hB">第十条 </span>商品房相关设施设备交付条件</div>
          <div class="paragraph">
            <span class="indent">（一）基础设施设备</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.供水、排水：交付时供水、排水配套设施齐全，并与城市公共供水、排水管网连接。使用自建设施供水的，供水的水质符合国家规定的饮用水卫生标准，</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.jcsssb1"></a-input>
              <span v-else :class="[formState.jcsssb1 ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.jcsssb1 || 'x'}}&nbsp;</span>
              <span>；</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">2.供电：交付时纳入城市供电网络并正式供电，</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.jcsssb2"></a-input>
              <span v-else :class="[formState.jcsssb2 ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.jcsssb2 || 'x'}}&nbsp;</span>
              <span>；</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">3.燃气：交付时完成室内燃气管道的敷设，并与城市燃气管网连接，保证燃气供应，</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.jcsssb3"></a-input>
              <span v-else :class="[formState.jcsssb3 ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.jcsssb3 || 'x'}}&nbsp;</span>
              <span>；</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">4.电话通信：交付时线路敷设到户；</span>
          </div>
          <div class="paragraph">
            <span class="indent">5.有线电视：交付时线路敷设到户；</span>
          </div>
          <div class="paragraph">
            <span class="indent">6.宽带网络：交付时线路敷设到户。</span>
          </div>
          <div class="paragraph">
            <span class="indent">以上第1、2、3项由出卖人负责办理开通手续并承担相关费用；第4、5、6项需要买受人自行办理开通手续。</span>
          </div>
          <div class="paragraph">
            <span class="indent">如果在约定期限内基础设施设备未达到交付使用条件，双方同意按照下列第</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.jcssbclfs"></a-input>
            <span v-else :class="[formState.jcssbclfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.jcssbclfs || 'x'}}&nbsp;</span>
            <span>种方式处理：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）以上设施中第1、2、3项在约定交付日未达到交付条件的，出卖人按照本合同第十二条的约定承担逾期交付责任。</span>
          </div>
          <div class="paragraph">
            <span class="indent">第4项未按时达到交付使用条件的，出卖人按日向买受人支付</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dstwyj"></a-input>
            <span v-else :class="[formState.dstwyj ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dstwyj || 'x'}}&nbsp;</span>
            <span>元的违约金；第5项未按时达到交付使用条件的，出卖人按日向买受人支付 </span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dwtwyj"></a-input>
            <span v-else :class="[formState.dwtwyj ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dwtwyj || 'x'}}&nbsp;</span>
            <span>元的违约金；第6项未按时达到交付使用条件的，出卖人按日向买受人支付</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dltwyj"></a-input>
            <span v-else :class="[formState.dltwyj ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dltwyj || 'x'}}&nbsp;</span>
            <span>元的违约金。出卖人采取措施保证相关设施于约定交付日后</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.jcssbwyjzfrq"></a-input>
            <span v-else :class="[formState.jcssbwyjzfrq ? 'custom-underline' : 'value50']">&nbsp;{{ formState.jcssbwyjzfrq || 'x'}}&nbsp;</span>
            <span>日之内达到交付使用条件。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.jcssbclfsnr"></a-input>
            <span v-else :class="[formState.jcssbclfsnr ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.jcssbclfsnr || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）公共服务及其他配套设施（以建设工程规划许可为准）</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.小区内绿地率：</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ldln"></a-input>
            <span v-else :class="[formState.ldln ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ldln || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ldly"></a-input>
            <span v-else :class="[formState.ldly ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ldly || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ldlr"></a-input>
            <span v-else :class="[formState.ldlr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ldlr || 'x'}}&nbsp;</span>
            <span>日达到</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.ldlnr"></a-input>
            <span v-else :class="[formState.ldlnr ? 'custom-underline' : 'value300']">&nbsp;{{ formState.ldlnr || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.小区内非市政道路：</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fszdln"></a-input>
            <span v-else :class="[formState.fszdln ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fszdln || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fszdly"></a-input>
            <span v-else :class="[formState.fszdly ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fszdly || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.fszdlr"></a-input>
            <span v-else :class="[formState.fszdlr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.fszdlr || 'x'}}&nbsp;</span>
            <span>日达到</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.fszdlnr"></a-input>
            <span v-else :class="[formState.fszdlnr ? 'custom-underline' : 'value300']">&nbsp;{{ formState.fszdlnr || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.规划的车位、车库：</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ghcwckn"></a-input>
            <span v-else :class="[formState.ghcwckn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ghcwckn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ghcwcky"></a-input>
            <span v-else :class="[formState.ghcwcky ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ghcwcky || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ghcwckr"></a-input>
            <span v-else :class="[formState.ghcwckr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ghcwckr || 'x'}}&nbsp;</span>
            <span>日达到</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.ghcwcknr"></a-input>
            <span v-else :class="[formState.ghcwcknr ? 'custom-underline' : 'value300']">&nbsp;{{ formState.ghcwcknr || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">4.物业服务用房：</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwyfn"></a-input>
            <span v-else :class="[formState.wyfwyfn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwyfn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwyfy"></a-input>
            <span v-else :class="[formState.wyfwyfy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwyfy || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwyfr"></a-input>
            <span v-else :class="[formState.wyfwyfr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwyfr || 'x'}}&nbsp;</span>
            <span>日达到</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.wyfwyfnr"></a-input>
            <span v-else :class="[formState.wyfwyfnr ? 'custom-underline' : 'value300']">&nbsp;{{ formState.wyfwyfnr || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">5.医疗卫生机构：</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ylwsjgn"></a-input>
            <span v-else :class="[formState.ylwsjgn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ylwsjgn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ylwsjgy"></a-input>
            <span v-else :class="[formState.ylwsjgy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ylwsjgy || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.ylwsjgr"></a-input>
            <span v-else :class="[formState.ylwsjgr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.ylwsjgr || 'x'}}&nbsp;</span>
            <span>日达到</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.ylwsjgnr"></a-input>
            <span v-else :class="[formState.ylwsjgnr ? 'custom-underline' : 'value300']">&nbsp;{{ formState.ylwsjgnr || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">6.幼儿园：</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.yeyn"></a-input>
            <span v-else :class="[formState.yeyn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.yeyn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.yeyy"></a-input>
            <span v-else :class="[formState.yeyy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.yeyy || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.yeyr"></a-input>
            <span v-else :class="[formState.yeyr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.yeyr || 'x'}}&nbsp;</span>
            <span>日达到</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.yeynr"></a-input>
            <span v-else :class="[formState.yeynr ? 'custom-underline' : 'value300']">&nbsp;{{ formState.yeynr || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">7.学校：</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.xxn"></a-input>
            <span v-else :class="[formState.xxn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.xxn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.xxy"></a-input>
            <span v-else :class="[formState.xxy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.xxy || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.xxr"></a-input>
            <span v-else :class="[formState.xxr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.xxr || 'x'}}&nbsp;</span>
            <span>日达到</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.xxnr"></a-input>
            <span v-else :class="[formState.xxnr ? 'custom-underline' : 'value300']">&nbsp;{{ formState.xxnr || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">8.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.ptssnr1"></a-input>
            <span v-else :class="[formState.ptssnr1 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.ptssnr1 || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">9.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.ptssnr2"></a-input>
            <span v-else :class="[formState.ptssnr2 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.ptssnr2 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">以上设施未达到上述条件的，双方同意按照以下方式处理：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.小区内绿地率未达到上述约定条件的，</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.ldlclfs"></a-input>
            <span v-else :class="[formState.ldlclfs ? 'custom-underline' : 'value300']">&nbsp;{{ formState.ldlclfs || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.小区内非市政道路未达到上述约定条件的，</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.fszdlclfs"></a-input>
            <span v-else :class="[formState.fszdlclfs ? 'custom-underline' : 'value300']">&nbsp;{{ formState.fszdlclfs || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.规划的车位、车库未达到上述约定条件的，</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.ghcwckclfs"></a-input>
            <span v-else :class="[formState.ghcwckclfs ? 'custom-underline' : 'value300']">&nbsp;{{ formState.ghcwckclfs || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">4.物业服务用房未达到上述约定条件的，</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.wyfclfs"></a-input>
            <span v-else :class="[formState.wyfclfs ? 'custom-underline' : 'value300']">&nbsp;{{ formState.wyfclfs || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">5.其他设施未达到上述约定条件的，</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.qtssclfs"></a-input>
            <span v-else :class="[formState.qtssclfs ? 'custom-underline' : 'value300']">&nbsp;{{ formState.qtssclfs || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">关于本项目内相关设施设备的具体约定见附件五。</span>
          </div>
        </div>
        <!-- 第十一条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list11')" class="listTitle indent"><span class="st4hB">第十一条 </span>交付时间和手续</div>
          <div class="paragraph">
            <span class="indent">（一）出卖人应当在</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.jfn"></a-input>
            <span v-else :class="[formState.jfn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.jfn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.jfy"></a-input>
            <span v-else :class="[formState.jfy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.jfy || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.jfr"></a-input>
            <span v-else :class="[formState.jfr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.jfr || 'x'}}&nbsp;</span>
            <span>日前向买受人交付该商品房。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）该商品房达到第九条、第十条约定的交付条件后，出卖人应当在交付日期届满前</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.yfr"></a-input>
            <span v-else :class="[formState.yfr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.yfr || 'x'}}&nbsp;</span>
            <span>日（不少于10日）将查验房屋的时间、办理交付手续的时间地点以及应当携带的证件材料的通知书面送达买受人。买受人未收到交付通知书的，以本合同约定的交付日期届满之日为办理交付手续的时间，以该商品房所在地为办理交付手续的地点。</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.jfnrbc"></a-input>
              <span v-else :class="[formState.jfnrbc ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.jfnrbc || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">交付该商品房时，出卖人应当出示满足第九条约定的证明文件。出卖人不出示证明文件或者出示的证明文件不齐全，不能满足第九条约定条件的，买受人有权拒绝接收，由此产生的逾期交付责任由出卖人承担，并按照第十二条处理。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（三）查验房屋</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.办理交付手续前，买受人有权对该商品房进行查验，出卖人不得以缴纳相关税费或者签署物业管理文件作为买受人查验和办理交付手续的前提条件。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.买受人查验的该商品房存在下列除地基基础和主体结构外的其他质量问题的，由出卖人按照有关工程和产品质量规范、标准自查验次日起</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.cyczrq"></a-input>
            <span v-else :class="[formState.cyczrq ? 'custom-underline' : 'value50']">&nbsp;{{ formState.cyczrq || 'x'}}&nbsp;</span>
            <span>日内负责修复，并承担修复费用，修复后再行交付。</span>
          </div>
        </div>
        <!-- 第十二条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list12')" class="listTitle indent"><span class="st4hB">第十二条 </span>逾期交付责任</div>
          <div class="paragraph">
            <span class="indent">除不可抗力外，出卖人未按照第十一条约定的时间将该商品房交付买受人的，双方同意按照下列第</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqjfclfs"></a-input>
            <span v-else :class="[formState.yqjfclfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqjfclfs || 'x'}}&nbsp;</span>
            <span>种方式处理：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.按照逾期时间，分别处理（ （1）和（2）不作累加）。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）逾期在</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqts"></a-input>
            <span v-else :class="[formState.yqts ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqts || 'x'}}&nbsp;</span>
            <span>日之内（该期限应当不多于第八条第1（1）项中的期限），自第十一条约定的交付期限届满之次日起至实际交付之日止，出卖人按日计算向买受人支付全部房价款万分之</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqwyjbl"></a-input>
            <span v-else :class="[formState.yqwyjbl ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqwyjbl || 'x'}}&nbsp;</span>
            <span>的违约金（该违约金比率应当不低于第八条第1（1）项中的比率）。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）逾期超过</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqccts"></a-input>
            <span v-else :class="[formState.yqccts ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqccts || 'x'}}&nbsp;</span>
            <span>日（该期限应当与本条第（1）项中的期限相同）后，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照 </span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqlxbfb"></a-input>
            <span v-else :class="[formState.yqlxbfb ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqlxbfb || 'x'}}&nbsp;</span>
            <span> %（不低于中国人民银行公布的同期贷款基准利率）计算给付利息；同时，出卖人按照全部房价款的</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.wyjbfb"></a-input>
            <span v-else :class="[formState.wyjbfb ? 'custom-underline' : 'value50']">&nbsp;{{ formState.wyjbfb || 'x'}}&nbsp;</span>
            <span>%向买受人支付违约金。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人要求继续履行合同的，合同继续履行，出卖人按日计算向买受人支付全部房价款万分之</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.wyjzfbl"></a-input>
            <span v-else :class="[formState.wyjzfbl ? 'custom-underline' : 'value50']">&nbsp;{{ formState.wyjzfbl || 'x'}}&nbsp;</span>
            <span>（该比率应当不低于本条第1（1）项中的比率）的违约金。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.qtyqjfzr"></a-input>
            <span v-else :class="[formState.qtyqjfzr ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.qtyqjfzr || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
        </div>

      </div>

      <!-- 第五章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter5')" class="ht3h">
          第五章 面积差异处理方式
        </div>
        <!-- 第十三条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list13')" class="listTitle indent"><span class="st4hB">第十三条 </span>面积差异处理</div>
          <div class="paragraph">
            <span class="indent">该商品房交付时，出卖人应当向买受人出示房屋测绘报告，并向买受人提供该商品房的面积实测数据（以下简称实测面积）。实测面积与第三条载明的预测面积发生误差的，双方同意按照第</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.mjcyclfs"></a-input>
            <span v-else :class="[formState.mjcyclfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.mjcyclfs || 'x'}}&nbsp;</span>
            <span>种方式处理。</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.根据第六条按照套内建筑面积计价的约定，双方同意按照下列原则处理：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）套内建筑面积误差比绝对值在3%以内（含3%）的，据实结算房价款；</span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）套内建筑面积误差比绝对值超出3%时，买受人有权解除合同。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.jchtlx"></a-input>
            <span v-else :class="[formState.jchtlx ? 'custom-underline' : 'value50']">&nbsp;{{ formState.jchtlx || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人选择不解除合同的，实测套内建筑面积大于预测套内建筑面积时，套内建筑面积误差比在3%以内（含3%）部分的房价款由买受人补足；超出3%部分的房价款由出卖人承担，产权归买受人所有。实测套内建筑面积小于预测套内建筑面积时，套内建筑面积误差比绝对值在3%以内（含3%）部分的房价款由出卖人返还买受人；绝对值超出3%部分的房价款由出卖人双倍返还买受人。</span>
          </div>
          <div class="paragraph">
            <div class="math">
              <span>套内建筑面积误差比 ＝</span>
              <div style="display: flex; flex-direction: column;">
                <span class="fs fm">实测套内建筑面积 - 预测套内建筑面积</span>
                <span class="fs fz">预测套内建筑面积</span>
              </div>
              <span> x 100%</span>
            </div>
          </div>
          <div class="paragraph">
            <span class="indent">2.根据第六条按照建筑面积计价的约定，双方同意按照下列原则处理：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）建筑面积、套内建筑面积误差比绝对值均在3%以内（含3%）的，根据实测建筑面积结算房价款；</span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）建筑面积、套内建筑面积误差比绝对值其中有一项超出3%时，买受人有权解除合同。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.msrjchtlx"></a-input>
            <span v-else :class="[formState.msrjchtlx ? 'custom-underline' : 'value50']">&nbsp;{{ formState.msrjchtlx || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人选择不解除合同的，实测建筑面积大于预测建筑面积时，建筑面积误差比在3%以内（含3%）部分的房价款由买受人补足，超出3%部分的房价款由出卖人承担，产权归买受人所有。实测建筑面积小于预测建筑面积时，建筑面积误差比绝对值在3%以内（含3%）部分的房价款由出卖人返还买受人；绝对值超出3%部分的房价款由出卖人双倍返还买受人。</span>
          </div>
          <div class="paragraph">
            <div class="math">
              <span>建筑面积误差比 ＝</span>
              <div style="display: flex; flex-direction: column;">
                <span class="fs fm">实测建筑面积 - 预测建筑面积</span>
                <span class="fs fz">预测建筑面积</span>
              </div>
              <span> x 100%</span>
            </div>
          </div>
          <div class="paragraph">
            <span class="indent">（3）因设计变更造成面积差异，双方不解除合同的，应当签署补充协议。</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.根据第六条按照套计价的，出卖人承诺在房屋平面图中标明详细尺寸，并约定误差范围。该商品房交付时，套型与设计图纸不一致或者相关尺寸超出约定的误差范围，双方约定如下：</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.sfydnr"></a-input>
              <span v-else :class="[formState.sfydnr ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.sfydnr || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">4.双方自行约定：</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.zxydnr"></a-input>
              <span v-else :class="[formState.zxydnr ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.zxydnr || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
        </div>

      </div>

      <!-- 第六章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter6')" class="ht3h">
          第六章 规划设计变更
        </div>
        <!-- 第十四条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list14')" class="listTitle indent"><span class="st4hB">第十四条 </span>规划变更</div>
          <div class="paragraph">
            <span class="indent">（一）出卖人应当按照城乡规划主管部门核发的建设工程规划许可证规定的条件建设商品房，不得擅自变更。</span>
          </div>
          <div class="paragraph">
            <span class="indent">双方签订合同后，涉及该商品房规划用途、面积、容积率、绿地率、基础设施、公共服务及其他配套设施等规划许可内容经城乡规划主管部门批准变更的，出卖人应当在变更确立之日起10日内将书面通知送达买受人。出卖人未在规定期限内通知买受人的，买受人有权解除合同。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）买受人应当在通知送达之日起15日内做出是否解除合同的书面答复。买受人逾期未予以书面答复的，视同接受变更。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（三）买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.ghbgtklx"></a-input>
            <span v-else :class="[formState.ghbgtklx ? 'custom-underline' : 'value50']">&nbsp;{{ formState.ghbgtklx || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息；同时，出卖人按照全部房价款的</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.ghbgtkwyj"></a-input>
            <span v-else :class="[formState.ghbgtkwyj ? 'custom-underline' : 'value50']">&nbsp;{{ formState.ghbgtklx || 'x'}}&nbsp;</span>
            <span>%向买受人支付违约金。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人不解除合同的，有权要求出卖人赔偿由此造成的损失，双方约定如下：</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.bjchtsfyd"></a-input>
              <span v-else :class="[formState.bjchtsfyd ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.bjchtsfyd || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
        </div>
        <!-- 第十五条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list15')" class="listTitle indent"><span class="st4hB">第十五条 </span>设计变更</div>
          <div class="paragraph">
            <span class="indent">（一）双方签订合同后，出卖人按照法定程序变更建筑工程施工图设计文件，涉及下列可能影响买受人所购商品房质量或使用功能情形的，出卖人应当在变更确立之日起10日内将书面通知送达买受人。出卖人未在规定期限内通知买受人的，买受人有权解除合同。</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.该商品房结构形式、户型、空间尺寸、朝向；</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.sjbgnr2"></a-input>
            <span v-else :class="[formState.sjbgnr2 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.sjbgnr2 || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.sjbgnr3"></a-input>
            <span v-else :class="[formState.sjbgnr3 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.sjbgnr3 || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">4.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.sjbgnr4"></a-input>
            <span v-else :class="[formState.sjbgnr4 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.sjbgnr4 || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">5.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.sjbgnr5"></a-input>
            <span v-else :class="[formState.sjbgnr5 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.sjbgnr5 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）买受人应当在通知送达之日起15日内做出是否解除合同的书面答复。买受人逾期未予以书面答复的，视同接受变更。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（三）买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.sjbgjchtpfll"></a-input>
            <span v-else :class="[formState.sjbgjchtpfll ? 'custom-underline' : 'value50']">&nbsp;{{ formState.sjbgjchtpfll || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息；同时，出卖人按照全部房价款的</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.sjbgjchtpfje"></a-input>
            <span v-else :class="[formState.sjbgjchtpfje ? 'custom-underline' : 'value50']">&nbsp;{{ formState.sjbgjchtpfje || 'x'}}&nbsp;</span>
            <span>%向买受人支付违约金。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人不解除合同的，有权要求出卖人赔偿由此造成的损失，双方约定如下：</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.sjbgsfyd"></a-input>
              <span v-else :class="[formState.sjbgsfyd ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.sjbgsfyd || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
        </div>

      </div>

      <!-- 第七章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter7')" class="ht3h">
          第七章 商品房质量及保修责任
        </div>
        <!-- 第十六条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list16')" class="listTitle indent"><span class="st4hB">第十六条 </span>商品房质量</div>
          <div class="paragraph">
            <span class="indent">（一）地基基础和主体结构</span>
          </div>
          <div class="paragraph">
            <span class="indent">出卖人承诺该商品房地基基础和主体结构合格，并符合国家及行业标准。</span>
          </div>
          <div class="paragraph">
            <span class="indent">经检测不合格的，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.jybhgpfll"></a-input>
            <span v-else :class="[formState.jybhgpfll ? 'custom-underline' : 'value50']">&nbsp;{{ formState.jybhgpfll || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。给买受人造成损失的，由出卖人支付</span>
            <a-input v-show="false" v-model:value="formState.jybhgpffs"></a-input>
            <span @click="onCheck('jybhgpffs', 'yffjkyb')" :class="{userCheckedBox: formState.jybhgpffs == 'yffjkyb', userBox: true}">【已付房价款一倍】</span>
            <span @click="onCheck('jybhgpffs', 'msrqbss')" :class="{userCheckedBox: formState.jybhgpffs == 'msrqbss', userBox: true}"> 【买受人全部损失】</span>
            <span>的赔偿金。因此而发生的检测费用由出卖人承担。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人不解除合同的，</span>
            <a-input v-if="mode == 'edit'" class="input500" v-model:value="formState.jybhgbjchtclfs"></a-input>
            <span v-else :class="[formState.jybhgbjchtclfs ? 'custom-underline' : 'value500']">&nbsp;{{ formState.jybhgbjchtclfs || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）其他质量问题</span>
          </div>
          <div class="paragraph">
            <span class="indent">该商品房质量应当符合有关工程质量规范、标准和施工图设计文件的要求。发现除地基基础和主体结构外质量问题的，双方按照以下方式处理：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）及时更换、修理；如给买受人造成损失的，还应当承担相应赔偿责任。</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.bjchtmsrzcssd"></a-input>
              <span v-else :class="[formState.bjchtmsrzcssd ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.bjchtmsrzcssd || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）经过更换、修理，仍然严重影响正常使用的，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.jybhgpfll"></a-input>
            <span v-else :class="[formState.jybhgpfll ? 'custom-underline' : 'value50']">&nbsp;{{ formState.jybhgpfll || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。给买受人造成损失的，由出卖人承担相应赔偿责任。因此而发生的检测费用由出卖人承担。</span>
          </div>
          <div class="paragraph">
            <span class="indent">买受人不解除合同的，</span>
            <a-input v-if="mode == 'edit'" class="input500" v-model:value="formState.ghhryxsypfll"></a-input>
            <span v-else :class="[formState.ghhryxsypfll ? 'custom-underline' : 'value500']">&nbsp;{{ formState.ghhryxsypfll || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（三）装饰装修及设备标准</span>
          </div>
          <div class="paragraph">
            <span class="indent">该商品房应当使用合格的建筑材料、构配件和设备，装置、装修、装饰所用材料的产品质量必须符合国家的强制性标准及双方约定的标准。</span>
          </div>
          <div class="paragraph">
            <span class="indent">不符合上述标准的，买受人有权要求出卖人按照下列第（1）、</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.zxbdbclfs1"></a-input>
            <span v-else :class="[formState.zxbdbclfs1 ? 'custom-underline' : 'value50']">&nbsp;{{ formState.zxbdbclfs1 || 'x'}}&nbsp;</span>
            <span>、</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.zxbdbclfs2"></a-input>
            <span v-else :class="[formState.zxbdbclfs2 ? 'custom-underline' : 'value50']">&nbsp;{{ formState.zxbdbclfs2 || 'x'}}&nbsp;</span>
            <span>方式处理（可多选）：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）及时更换、修理；</span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）出卖人赔偿双倍的装饰、设备差价；</span>
          </div>
          <div class="paragraph">
            <span class="indent">（3）</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.zxbdbclfsnr1"></a-input>
            <span v-else :class="[formState.zxbdbclfsnr1 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.zxbdbclfsnr1 || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">（4）</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.zxbdbclfsnr2"></a-input>
            <span v-else :class="[formState.zxbdbclfsnr2 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.zxbdbclfsnr2 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">具体装饰装修及相关设备标准的约定见附件六。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（四）室内空气质量、建筑隔声和民用建筑节能措施</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.该商品房室内空气质量符合</span>
            <a-input v-show="false" v-model:value="formState.kqzlyq"></a-input>
            <span @click="onCheck('kqzlyq', 'gj')" :class="{userCheckedBox: formState.kqzlyq == 'gj', userBox: true}">【国家】</span>
            <span @click="onCheck('kqzlyq', 'df')" :class="{userCheckedBox: formState.kqzlyq == 'df', userBox: true}"> 【地方】</span>
            <span>标准，标准名称：</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.kqzlbzmc"></a-input>
            <span v-else :class="[formState.kqzlbzmc ? 'custom-underline' : 'value200']">&nbsp;{{ formState.kqzlbzmc || 'x'}}&nbsp;</span>
            <span>，</span>
            <span>标准文号：</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.kqzlbzwh"></a-input>
            <span v-else :class="[formState.kqzlbzwh ? 'custom-underline' : 'value200']">&nbsp;{{ formState.kqzlbzwh || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">该商品房为住宅的，建筑隔声情况符合</span>
            <a-input v-show="false" v-model:value="formState.jzgsqkyq"></a-input>
            <span @click="onCheck('jzgsqkyq', 'gj')" :class="{userCheckedBox: formState.jzgsqkyq == 'gj', userBox: true}">【国家】</span>
            <span @click="onCheck('jzgsqkyq', 'df')" :class="{userCheckedBox: formState.jzgsqkyq == 'df', userBox: true}"> 【地方】</span>
            <span>标准，标准名称：</span>
            <a-input v-if="mode == 'edit'" class="input150" v-model:value="formState.jzgsqkbzmc"></a-input>
            <span v-else :class="[formState.jzgsqkbzmc ? 'custom-underline' : 'value150']">&nbsp;{{ formState.jzgsqkbzmc || 'x'}}&nbsp;</span>
            <span>，</span>
            <span>标准文号：</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.jzgsqkbzwh"></a-input>
            <span v-else :class="[formState.jzgsqkbzwh ? 'custom-underline' : 'value200']">&nbsp;{{ formState.jzgsqkbzwh || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">该商品房室内空气质量或建筑隔声情况经检测不符合标准，由出卖人负责整改，整改后仍不符合标准的，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.zlbdbpfll"></a-input>
            <span v-else :class="[formState.zlbdbpfll ? 'custom-underline' : 'value50']">&nbsp;{{ formState.zlbdbpfll || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。给买受人造成损失的，由出卖人承担相应赔偿责任。经检测不符合标准的，检测费用由出卖人承担，整改后再次检测发生的费用仍由出卖人承担。因整改导致该商品房逾期交付的，出卖人应当承担逾期交付责任。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.该商品房应当符合国家有关民用建筑节能强制性标准的要求。</span>
          </div>
          <div class="paragraph">
            <span class="indent">未达到标准的，出卖人应当按照相应标准要求补做节能措施，并承担全部费用；给买受人造成损失的，出卖人应当承担相应赔偿责任。</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.bdbzclnr"></a-input>
              <span v-else :class="[formState.bdbzclnr ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.bdbzclnr || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
        </div>
        <!-- 第十七条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list16')" class="listTitle indent"><span class="st4hB">第十七条 </span>保修责任</div>
          <div class="paragraph">
            <span class="indent">（一）商品房实行保修制度。该商品房为住宅的，出卖人自该商品房交付之日起，按照《住宅质量保证书》承诺的内容承担相应的保修责任。该商品房为非住宅的，双方应当签订补充协议详细约定保修范围、保修期限和保修责任等内容。具体内容见附件七。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）下列情形，出卖人不承担保修责任：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.因不可抗力造成的房屋及其附属设施的损害；</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.因买受人不当使用造成的房屋及其附属设施的损害；</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.cmrbcdbxzrqx"></a-input>
            <span v-else :class="[formState.cmrbcdbxzrqx ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.cmrbcdbxzrqx || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（三）在保修期内，买受人要求维修的书面通知送达出卖人日内，出卖人既不履行保修义务也不提出书面异议的，买受人可以自行或委托他人进行维修，维修费用及维修期间造成的其他损失由出卖人承担。</span>
          </div>
        </div>
        <!-- 第十八条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list16')" class="listTitle indent"><span class="st4hB">第十八条 </span>质量担保</div>
          <div class="paragraph">
            <span class="indent">出卖人不按照第十六条、第十七条约定承担相关责任的，由</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.cdldzrr"></a-input>
            <span v-else :class="[formState.cdldzrr ? 'custom-underline' : 'value300']">&nbsp;{{ formState.cdldzrr || 'x'}}&nbsp;</span>
            <span>承担连带责任。</span>
          </div>
          <div class="paragraph">
            <span class="indent">关于质量担保的证明见附件八。</span>
          </div>
        </div>
        
      </div>

      <!-- 第八章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter8')" class="ht3h">
          第八章 合同备案与房屋登记
        </div>
        <!-- 第十九条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list19')" class="listTitle indent"><span class="st4hB">第十九条 </span>预售合同共登记备案</div>
          <div class="paragraph">
            <span class="indent">本商品房一经网上签约即备案，如双方解除合同，双方须向房地产管理部门申请撤销备案。</span>
          </div>
        </div>
        <!-- 第二十条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list19')" class="listTitle indent"><span class="st4hB">第二十条 </span>房屋登记</div>
          <div class="paragraph">
            <span class="indent">（一）关于预告登记的约定：</span>
          </div>
          <div class="paragraph">
            <span class="indent">双方同意选择下列第</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.ygdjydx"></a-input>
            <span v-else :class="[formState.ygdjydx ? 'custom-underline' : 'value50']">&nbsp;{{ formState.ygdjydx || 'x'}}&nbsp;</span>
            <span>项的约定。</span>
          </div>
          <div class="paragraph">
            <span class="indent"> 1、按揭购房的，在买受人付清首付款后30天内，双方共同向房屋登记机关申请预告登记。</span>
          </div>
          <div class="paragraph">
            <span class="indent"> 2、分期付款购房的，在买受人付清应缴房款的    %后的30天内，双方共同向房屋登记机关申请办理预告登记。</span>
          </div>
          <div class="paragraph">
            <span class="indent">3、不申请办理预告登记。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）双方同意共同向房屋登记机构申请办理该商品房的房屋所有权转移登记。</span>
          </div>
          <div class="paragraph">
            <span class="indent"> （三）因出卖人的原因，买受人未能在该商品房交付之日起</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.zydjts"></a-input>
            <span v-else :class="[formState.zydjts ? 'custom-underline' : 'value50']">&nbsp;{{ formState.zydjts || 'x'}}&nbsp;</span>
            <span>日内取得该商品房的房屋所有权证书的，双方同意按照下列第</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.zydjtk"></a-input>
            <span v-else :class="[formState.zydjtk ? 'custom-underline' : 'value50']">&nbsp;{{ formState.zydjtk || 'x'}}&nbsp;</span>
            <span>种方式处理：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.zydjwyjll"></a-input>
            <span v-else :class="[formState.zydjwyjll ? 'custom-underline' : 'value50']">&nbsp;{{ formState.zydjwyjll || 'x'}}&nbsp;</span>
            <span>%（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。买受人不解除合同的，自买受人应当完成房屋所有权登记的期限届满之次日起至实际完成房屋所有权登记之日止，出卖人按日计算向买受人支付全部房价款万分之</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.zydjwyjbl"></a-input>
            <span v-else :class="[formState.zydjwyjbl ? 'custom-underline' : 'value50']">&nbsp;{{ formState.zydjwyjbl || 'x'}}&nbsp;</span>
            <span>的违约金。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.zydjnr"></a-input>
            <span v-else :class="[formState.zydjnr ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.zydjnr || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（四）因买受人的原因未能在约定期限内完成该商品房的房屋所有权转移登记的，出卖人不承担责任。</span>
          </div>
        </div>

      </div>

      <!-- 第九章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter9')" class="ht3h">
          第九章 前期物业管理
        </div>
        <!-- 第二十一条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list21')" class="listTitle indent"><span class="st4hB">第二十一条 </span>前期物业管理</div>
          <div class="paragraph">
            <span class="indent">（一）出卖人依法选聘的前期物业服务企业为 </span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.wyfwqy"></a-input>
            <span v-else :class="[formState.wyfwqy ? 'custom-underline' : 'value300']">&nbsp;{{ formState.wyfwqy || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）物业服务时间从</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwksn"></a-input>
            <span v-else :class="[formState.wyfwksn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwksn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwksy"></a-input>
            <span v-else :class="[formState.wyfwksy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwksy || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwksr"></a-input>
            <span v-else :class="[formState.wyfwksr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwksr || 'x'}}&nbsp;</span>
            <span>日到</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwjsn"></a-input>
            <span v-else :class="[formState.wyfwjsn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwjsn || 'x'}}&nbsp;</span>
            <span>年</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwjsy"></a-input>
            <span v-else :class="[formState.wyfwjsy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwjsy || 'x'}}&nbsp;</span>
            <span>月</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwjsr"></a-input>
            <span v-else :class="[formState.wyfwjsr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwjsr || 'x'}}&nbsp;</span>
            <span>日。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（三）物业服务期间，物业收费计费方式为</span>
            <a-input v-show="false" v-model:value="formState.wysfjffs"></a-input>
            <span @click="onCheck('wysfjffs', 'gj')" :class="{userCheckedBox: formState.wysfjffs == 'gj', userBox: true}">【包干制】</span>
            <span @click="onCheck('wysfjffs', 'df')" :class="{userCheckedBox: formState.wysfjffs == 'df', userBox: true}"> 【酬金制】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.wysfjffsOther"></a-input>
            <span v-else :class="[formState.wysfjffsOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.wysfjffsOther || 'x'}}&nbsp;</span>
            <span>】 </span>
            <span>，物业服务费为</span>
            <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.wyfwqy"></a-input>
            <span v-else :class="[formState.wyfwqy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.wyfwqy || 'x'}}&nbsp;</span>
            <span>元/月•平方米（建筑面积）。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（四）买受人同意由出卖人选聘的前期物业服务企业代为查验并承接物业共用部位、共用设施设备，出卖人应当将物业共用部位、共用设施设备承接查验的备案情况书面告知买受人。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（五）买受人已详细阅读前期物业服务合同和临时管理规约，同意由出卖人依法选聘的物业服务企业实施前期物业管理，遵守临时管理规约。业主委员会成立后，由业主大会决定选聘或续聘物业服务企业。</span>
          </div>
          <div class="paragraph">
            <span class="indent">该商品房前期物业服务合同、临时管理规约见附件九。</span>
          </div>
        </div>

      </div>

      <!-- 第十章 -->
      <div class="mt80">
        <div :ref="el => setItemRef(el, 'chapter10')" class="ht3h">
          第十章 其他事项
        </div>
        <!-- 第二十二条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list22')" class="listTitle indent"><span class="st4hB">第二十二条 </span>建筑物区分所有权</div>
          <div class="paragraph">
            <span class="indent">（一）买受人对其建筑物专有部分享有占有、使用、收益和处分的权利。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）以下部位归业主共有：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.建筑物的基础、承重结构、外墙、屋顶等基本结构部分，通道、楼梯、大堂等公共通行部分，消防、公共照明等附属设施、设备，避难层、设备层或者设备间等结构部分；</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.该商品房所在建筑区划内的道路（属于城镇公共道路的除外）、绿地（属于城镇公共绿地或者明示属于个人的除外）、占用业主共有的道路或者其他场地用于停放汽车的车位、物业服务用房；</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.bcqtsxnr"></a-input>
            <span v-else :class="[formState.bcqtsxnr ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.bcqtsxnr || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（三）双方对其他配套设施约定如下：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.规划的车位、车库：</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.ghdckcw"></a-input>
            <span v-else :class="[formState.ghdckcw ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.ghdckcw || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.会所：</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.hs"></a-input>
            <span v-else :class="[formState.hs ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.hs || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.qtptssyd"></a-input>
            <span v-else :class="[formState.qtptssyd ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.qtptssyd || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
        </div>
        <!-- 第二十三条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list23')" class="listTitle indent"><span class="st4hB">第二十三条 </span>税费</div>
          <div class="paragraph">
            <span class="indent">双方应当按照国家的有关规定，向相应部门缴纳因该商品房买卖发生的税费。因预测面积与实测面积差异，导致买受人不能享受税收优惠政策而增加的税收负担，由</span>
            <a-input v-if="mode == 'edit'" class="input200" v-model:value="formState.ssfdcdf"></a-input>
            <span v-else :class="[formState.ssfdcdf ? 'custom-underline' : 'value200']">&nbsp;{{ formState.ssfdcdf || 'x'}}&nbsp;</span>
            <span>承担。</span>
          </div>
        </div>
        <!-- 第二十四条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list24')" class="listTitle indent"><span class="st4hB">第二十四条 </span>销售和使用承诺</div>
          <div class="paragraph">
            <span class="indent">1.出卖人承诺不采取分割拆零销售、返本销售或者变相返本销售的方式销售商品房；不采取售后包租或者变相售后包租的方式销售未竣工商品房。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.出卖人承诺按照规划用途进行建设和出售，不擅自改变该商品房使用性质，并按照规划用途办理房屋登记。出卖人不得擅自改变与该商品房有关的共用部位和设施的使用性质。</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.出卖人承诺对商品房的销售，不涉及依法或者依规划属于买受人共有的共用部位和设施的处分。</span>
          </div>
          <div class="paragraph">
            <span class="indent">4.出卖人承诺已将遮挡或妨碍房屋正常使用的情况告知买受人。具体内容见附件十。</span>
          </div>
          <div class="paragraph">
            <span class="indent">5.买受人使用该商品房期间，不得擅自改变该商品房的用途、建筑主体结构和承重结构。</span>
          </div>
          <div class="paragraph">
            <span class="indent">6.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.xscnnr1"></a-input>
            <span v-else :class="[formState.xscnnr1 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.xscnnr1 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">7.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.xscnnr2"></a-input>
            <span v-else :class="[formState.xscnnr2 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.xscnnr2 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
        </div>
        <!-- 第二十五条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list25')" class="listTitle indent"><span class="st4hB">第二十五条 </span>送达</div>
          <div class="paragraph">
            <span class="indent">出卖人和买受人保证在本合同中记载的通讯地址、联系电话均真实有效。任何根据本合同发出的文件，均应采用书面形式，以</span>
            <a-input v-show="false" v-model:value="formState.yjfs"></a-input>
            <span @click="onCheck('yjfs', 'gj')" :class="{userCheckedBox: formState.yjfs == 'gj', userBox: true}">【邮政快递】</span>
            <span @click="onCheck('yjfs', 'df')" :class="{userCheckedBox: formState.yjfs == 'df', userBox: true}"> 【邮寄挂号信】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yjfsOther"></a-input>
            <span v-else :class="[formState.yjfsOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yjfsOther || 'x'}}&nbsp;</span>
            <span>】 </span>
            <span>方式送达对方。任何一方变更通讯地址、联系电话的，应在变更之日起</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.bgrq"></a-input>
            <span v-else :class="[formState.bgrq ? 'custom-underline' : 'value50']">&nbsp;{{ formState.bgrq || 'x'}}&nbsp;</span>
            <span>日内书面通知对方。变更的一方未履行通知义务导致送达不能的，应承担相应的法律责任。</span>
          </div>
        </div>
        <!-- 第二十六条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list26')" class="listTitle indent"><span class="st4hB">第二十六条 </span>买受人信息保护</div>
          <div class="paragraph">
            <span class="indent">出卖人对买受人信息负有保密义务。非因法律、法规规定或国家安全机关、公安机关、检察机关、审判机关、纪检监察部门执行公务的需要，未经买受人书面同意，出卖人及其销售人员和相关工作人员不得对外披露买受人信息，或将买受人信息用于履行本合同之外的其他用途。</span>
          </div>
        </div>
        <!-- 第二十七条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list27')" class="listTitle indent"><span class="st4hB">第二十七条 </span>争议解决方法</div>
          <div class="paragraph">
            <span class="indent">本合同在履行过程中发生的争议，由双方当事人协商解决，也可通过消费者协会等相关机构调解；或按照下列第</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.tjfs"></a-input>
            <span v-else :class="[formState.tjfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.tjfs || 'x'}}&nbsp;</span>
            <span>种方式解决：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.依法向房屋所在地人民法院起诉。</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.提交</span>
            <a-input v-if="mode == 'edit'" class="input300" v-model:value="formState.zcwyh"></a-input>
            <span v-else :class="[formState.zcwyh ? 'custom-underline' : 'value300']">&nbsp;{{ formState.zcwyh || 'x'}}&nbsp;</span>
            <span>仲裁委员会仲裁。</span>
          </div>
        </div>
        <!-- 第二十八条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list28')" class="listTitle indent"><span class="st4hB">第二十八条 </span>补充协议</div>
          <div class="paragraph">
            <span class="indent">对本合同中未约定或约定不明的内容，双方可根据具体情况签订书面补充协议（补充协议见附件十一）。</span>
          </div>
          <div class="paragraph">
            <span class="indent">补充协议中含有不合理的减轻或免除本合同中约定应当由出卖人承担的责任，或不合理的加重买受人责任、排除买受人主要权利内容的，仍以本合同为准。</span>
          </div>
        </div>
        <!-- 第二十九条 -->
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'list29')" class="listTitle indent"><span class="st4hB">第二十九条 </span>合同生效</div>
          <div class="paragraph">
            <span class="indent">本合同自双方签字或盖章之日起生效。本合同的解除应当采用书面形式。</span>
          </div>
          <div class="paragraph">
            <span class="indent">本合同及附件共</span>
            <span class="custom-underline">&nbsp;{{ pageLength }}&nbsp;</span>
            <span>页，一式</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.htfs"></a-input>
            <span v-else :class="[formState.htfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.htfs || 'x'}}&nbsp;</span>
            <span>份，其中出卖人</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.cmrfs"></a-input>
            <span v-else :class="[formState.cmrfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.cmrfs || 'x'}}&nbsp;</span>
            <span>份，买受人</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.msrfs"></a-input>
            <span v-else :class="[formState.msrfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.msrfs || 'x'}}&nbsp;</span>
            <span>份， 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.qthtcyr"></a-input>
            <span v-else :class="[formState.qthtcyr ? 'custom-underline' : 'value50']">&nbsp;{{ formState.qthtcyr || 'x'}}&nbsp;</span>
            <span>】 </span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.qthtcyrfs"></a-input>
            <span v-else :class="[formState.qthtcyrfs ? 'custom-underline' : 'value50']">&nbsp;{{ formState.qthtcyrfs || 'x'}}&nbsp;</span>
            <span>份。合同附件与本合同具有同等法律效力。</span>
          </div>
          <div class="paragraph mt40">
            <div style="display: flex; justify-content: space-around;">
              <span style="width: 50%;">出卖人（签字或盖章）：</span>
              <span style="width: 50%;">买受人（签字或盖章）：</span>
            </div>
            <div style="display: flex; justify-content: space-around;">
              <span style="width: 50%;">【法定代表人】（签字或盖章）：</span>
              <span style="width: 50%;">【法定代表人】（签字或盖章）：</span>
            </div>
            <div style="display: flex; justify-content: space-around;">
              <span style="width: 50%;">【委托代理人】（签字或盖章）： </span>
              <span style="width: 50%;">【委托代理人】（签字或盖章）：</span>
            </div>
            <div style="display: flex; justify-content: space-around;">
              <span style="width: 50%;"> </span>
              <span style="width: 50%;">【法定代理人】（签字或盖章）：</span>
            </div>

            <div class="mt40" style="display: flex; justify-content: space-around;">
              <div style="width: 50%;">
                <span>签订时间：</span>
                <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.cmrqdsjn"></a-input>
                <span v-else :class="[formState.cmrqdsjn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.cmrqdsjn || 'x'}}&nbsp;</span>
                <span>年</span>
                <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.cmrqdsjy"></a-input>
                <span v-else :class="[formState.cmrqdsjy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.cmrqdsjy || 'x'}}&nbsp;</span>
                <span>月</span>
                <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.cmrqdsjr"></a-input>
                <span v-else :class="[formState.cmrqdsjr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.cmrqdsjr || 'x'}}&nbsp;</span>
                <span>日</span>
              </div>
              <div style="width: 50%;">
                <span>签订时间：</span>
                <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.msrqdsjn"></a-input>
                <span v-else :class="[formState.msrqdsjn ? 'custom-underline' : 'value70']">&nbsp;{{ formState.msrqdsjn || 'x'}}&nbsp;</span>
                <span>年</span>
                <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.msrqdsjy"></a-input>
                <span v-else :class="[formState.msrqdsjy ? 'custom-underline' : 'value70']">&nbsp;{{ formState.msrqdsjy || 'x'}}&nbsp;</span>
                <span>月</span>
                <a-input v-if="mode == 'edit'" class="input70" v-model:value="formState.msrqdsjr"></a-input>
                <span v-else :class="[formState.msrqdsjr ? 'custom-underline' : 'value70']">&nbsp;{{ formState.msrqdsjr || 'x'}}&nbsp;</span>
                <span>日</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-around; flex-wrap: nowrap;">
              <div style="width: 50%;">
                <span>签订地点：</span>
                <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.cmrqddd"></a-input>
                <span v-else :class="[formState.cmrqddd ? 'custom-underline' : 'value250']">&nbsp;{{ formState.cmrqddd || 'x'}}&nbsp;</span>
              </div>
              <div style="width: 50%;">
                <span>签订地点：</span>
                <a-input v-if="mode == 'edit'" class="input250" v-model:value="formState.msrqddd"></a-input>
                <span v-else :class="[formState.msrqddd ? 'custom-underline' : 'value250']">&nbsp;{{ formState.msrqddd || 'x'}}&nbsp;</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 附件 -->
      <div class="mt80">
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj1')" class="listTitle"><span class="st4hB">附件一   房屋平面图（应当标明方位）</span></div>
          <div class="paragraph">
            <span class="indent">1.房屋分层分户图（应当标明详细尺寸，并约定误差范围）</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.建设工程规划方案总平面图</span>
          </div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj2')" class="listTitle"><span class="st4hB">附件二  关于该商品房共用部位的具体说明（可附图说明）</span></div>
          <div class="paragraph">
            <span class="indent">1.纳入该商品房分摊的共用部位的名称、面积和所在位置</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.未纳入该商品房分摊的共用部位的名称、所在位置</span>
          </div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj3')" class="listTitle"><span class="st4hB">附件三  抵押权人同意该商品房转让的证明及关于抵押的相关约定</span></div>
          <div class="paragraph">
            <span class="indent">1.抵押权人同意该商品房转让的证明</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.解除抵押的条件和时间</span>
          </div>
          <div class="paragraph">
            <span class="indent">3.关于抵押的其他约定</span>
          </div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj4')" class="listTitle"><span class="st4hB">附件四  关于该商品房价款的计价方式、总价款、付款方式及期限的
            具体约定</span></div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj5')" class="listTitle"><span class="st4hB">附件五  关于本项目内相关设施、设备的具体约定</span></div>
          <div class="paragraph">
            <span class="indent">1.相关设施的位置及用途</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.其他约定</span>
          </div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj6')" class="listTitle"><span class="st4hB">附件六  关于装饰装修及相关设备标准的约定</span></div>
          <div class="paragraph">
            <span class="indent">交付的商品房达不到本附件约定装修标准的，按照本合同第十六条第（三）款约定处理。出卖人未经双方约定增加的装置、装修、装饰，视为无条件赠送给买受人。</span>
          </div>
          <div class="paragraph">
            <span class="indent">双方就装饰装修主要材料和设备的品牌、产地、规格、数量等内容约定如下：</span>
          </div>
          <div class="paragraph">
            <span class="indent">1.外墙：</span>
            <a-input v-show="false" v-model:value="formState.wq"></a-input>
            <span @click="onCheck('wq', 'cz')" :class="{userCheckedBox: formState.wq == 'cz', userBox: true}"> 【瓷砖】</span>
            <span @click="onCheck('wq', 'tl')" :class="{userCheckedBox: formState.wq == 'tl', userBox: true}"> 【涂料】</span>
            <span @click="onCheck('wq', 'blmq')" :class="{userCheckedBox: formState.wq == 'blmq', userBox: true}"> 【玻璃幕墙】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.yqOther"></a-input>
            <span v-else :class="[formState.yqOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.yqOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.wqOtherbz"></a-input>
              <span v-else :class="[formState.wqOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.wqOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <!-- 起居室 -->
          <div class="paragraph">
            <span class="indent">2.起居室：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）内墙：</span>
            <a-input v-show="false" v-model:value="formState.nq"></a-input>
            <span @click="onCheck('nq', 'tl')" :class="{userCheckedBox: formState.nq == 'tl', userBox: true}"> 【涂料】</span>
            <span @click="onCheck('nq', 'bz')" :class="{userCheckedBox: formState.nq == 'bz', userBox: true}"> 【壁纸】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.nqOther"></a-input>
            <span v-else :class="[formState.nqOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.nqOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.nqOtherbz"></a-input>
              <span v-else :class="[formState.nqOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.nqOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）顶棚：</span>
            <a-input v-show="false" v-model:value="formState.dp"></a-input>
            <span @click="onCheck('dp', 'sgbdd')" :class="{userCheckedBox: formState.dp == 'sgbdd', userBox: true}"> 【石膏板吊顶】</span>
            <span @click="onCheck('dp', 'tl')" :class="{userCheckedBox: formState.dp == 'tl', userBox: true}"> 【涂料】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.dpOther"></a-input>
            <span v-else :class="[formState.dpOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.dpOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.dpOtherbz"></a-input>
              <span v-else :class="[formState.dpOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.dpOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">（3）室内地面：</span>
            <a-input v-show="false" v-model:value="formState.nq"></a-input>
            <span @click="onCheck('sndm', 'dls')" :class="{userCheckedBox: formState.sndm == 'dls', userBox: true}"> 【大理石】</span>
            <span @click="onCheck('sndm', 'hgy')" :class="{userCheckedBox: formState.sndm == 'hgy', userBox: true}"> 【花岗岩】</span>
            <span @click="onCheck('sndm', 'snmm')" :class="{userCheckedBox: formState.sndm == 'snmm', userBox: true}"> 【水泥抹面】</span>
            <span @click="onCheck('sndm', 'smdb')" :class="{userCheckedBox: formState.sndm == 'smdb', userBox: true}"> 【实木地板】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.sndmOther"></a-input>
            <span v-else :class="[formState.sndmOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.sndmOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.sndmOtherbz"></a-input>
              <span v-else :class="[formState.sndmOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.sndmOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <!-- 厨房 -->
          <div class="paragraph">
            <span class="indent">3.厨房：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）地面：</span>
            <a-input v-show="false" v-model:value="formState.dm"></a-input>
            <span @click="onCheck('dm', '水泥抹面')" :class="{userCheckedBox: formState.dm == '水泥抹面', userBox: true}"> 【水泥抹面】</span>
            <span @click="onCheck('dm', '瓷砖')" :class="{userCheckedBox: formState.dm == '瓷砖', userBox: true}"> 【瓷砖】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.dmOther"></a-input>
            <span v-else :class="[formState.dmOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.dmOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.dmOtherbz"></a-input>
              <span v-else :class="[formState.dmOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.dmOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）墙面：</span>
            <a-input v-show="false" v-model:value="formState.cfqm"></a-input>
            <span @click="onCheck('cfqm', '耐水腻子')" :class="{userCheckedBox: formState.cfqm == '耐水腻子', userBox: true}"> 【耐水腻子】</span>
            <span @click="onCheck('cfqm', '瓷砖')" :class="{userCheckedBox: formState.cfqm == '瓷砖', userBox: true}"> 【瓷砖】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.cfqmOther"></a-input>
            <span v-else :class="[formState.cfqmOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.cfqmOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.cfqmOtherbz"></a-input>
              <span v-else :class="[formState.cfqmOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.cfqmOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">（3）顶棚：</span>
            <a-input v-show="false" v-model:value="formState.cfdp"></a-input>
            <span @click="onCheck('cfdp', '水泥抹面')" :class="{userCheckedBox: formState.cfdp == '水泥抹面', userBox: true}"> 【水泥抹面】</span>
            <span @click="onCheck('cfdp', '石膏吊顶')" :class="{userCheckedBox: formState.cfdp == '石膏吊顶', userBox: true}"> 【石膏吊顶】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.cfdpOther"></a-input>
            <span v-else :class="[formState.cfdpOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.cfdpOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.cfdpOtherbz"></a-input>
              <span v-else :class="[formState.cfdpOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.cfdpOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <!-- 卫生间 -->
          <div class="paragraph">
            <span class="indent">4.卫生间：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）地面：</span>
            <a-input v-show="false" v-model:value="formState.wsjdm"></a-input>
            <span @click="onCheck('wsjdm', '水泥抹面')" :class="{userCheckedBox: formState.wsjdm == '水泥抹面', userBox: true}"> 【水泥抹面】</span>
            <span @click="onCheck('wsjdm', '瓷砖')" :class="{userCheckedBox: formState.wsjdm == '瓷砖', userBox: true}"> 【瓷砖】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.wsjdmOther"></a-input>
            <span v-else :class="[formState.wsjdmOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.wsjdmOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.wsjdmOtherbz"></a-input>
              <span v-else :class="[formState.wsjdmOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.wsjdmOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）墙面：</span>
            <a-input v-show="false" v-model:value="formState.wsjqm"></a-input>
            <span @click="onCheck('wsjqm', '耐水腻子')" :class="{userCheckedBox: formState.wsjqm == '耐水腻子', userBox: true}"> 【耐水腻子】</span>
            <span @click="onCheck('wsjqm', '瓷砖')" :class="{userCheckedBox: formState.wsjqm == '瓷砖', userBox: true}"> 【瓷砖】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.wsjqmOther"></a-input>
            <span v-else :class="[formState.wsjqmOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.wsjqmOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.wsjqmOtherbz"></a-input>
              <span v-else :class="[formState.wsjqmOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.wsjqmOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">（3）顶棚：</span>
            <a-input v-show="false" v-model:value="formState.wsjdp"></a-input>
            <span @click="onCheck('sndm', '水泥抹面')" :class="{userCheckedBox: formState.sndm == '水泥抹面', userBox: true}"> 【水泥抹面】</span>
            <span @click="onCheck('sndm', '瓷砖')" :class="{userCheckedBox: formState.sndm == '瓷砖', userBox: true}"> 【瓷砖】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.sndmOther"></a-input>
            <span v-else :class="[formState.sndmOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.sndmOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.sndmOtherbz"></a-input>
              <span v-else :class="[formState.sndmOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.sndmOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>

          <!-- 阳台 -->
          <div class="paragraph">
            <span class="indent">5.阳台：</span>
            <a-input v-show="false" v-model:value="formState.yt"></a-input>
            <span @click="onCheck('yt', '塑钢封闭')" :class="{userCheckedBox: formState.yt == '塑钢封闭', userBox: true}"> 【塑钢封闭】</span>
            <span @click="onCheck('yt', '铝合金封闭')" :class="{userCheckedBox: formState.yt == '铝合金封闭', userBox: true}"> 【铝合金封闭】</span>
            <span @click="onCheck('yt', '断桥铝合金封闭')" :class="{userCheckedBox: formState.yt == '断桥铝合金封闭', userBox: true}"> 【断桥铝合金封闭】</span>
            <span @click="onCheck('yt', '不封闭')" :class="{userCheckedBox: formState.yt == '不封闭', userBox: true}"> 【不封闭】</span>
            <span> 【</span>
            <a-input v-if="mode == 'edit'" class="input50" v-model:value="formState.ytOther"></a-input>
            <span v-else :class="[formState.ytOther ? 'custom-underline' : 'value50']">&nbsp;{{ formState.ytOther || 'x'}}&nbsp;</span>
            <span>】 </span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.ytOtherbz"></a-input>
              <span v-else :class="[formState.ytOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.ytOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <!-- 电梯 -->
          <div class="paragraph">
            <span class="indent">6.电梯：</span>
          </div>
          <div class="paragraph">
            <span class="indent">（1）品牌：</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.dtpp"></a-input>
            <span v-else :class="[formState.dtpp ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.dtpp || 'x'}}&nbsp;</span>
            <span>；</span>
          </div>
          <div class="paragraph">
            <span class="indent">（2）型号：</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.dtxh"></a-input>
            <span v-else :class="[formState.dtxh ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.dtxh || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <!-- 管道 -->
          <div class="paragraph">
            <span class="indent">7.管道：</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.gdOtherbz"></a-input>
              <span v-else :class="[formState.gdOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.gdOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <!-- 窗户 -->
          <div class="paragraph">
            <span class="indent">8.窗户：</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.chOtherbz"></a-input>
              <span v-else :class="[formState.chOtherbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.chOtherbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
          <div class="paragraph">
            <span class="indent">9.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.fjOtherbz1"></a-input>
            <span v-else :class="[formState.fjOtherbz1 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.fjOtherbz1 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">10.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.fjOtherbz2"></a-input>
            <span v-else :class="[formState.fjOtherbz2 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.fjOtherbz2 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj7')" class="listTitle"><span class="st4hB">附件七  关于保修范围、保修期限和保修责任的约定</span></div>
          <div class="paragraph">
            <span class="indent">该商品房为住宅的，出卖人应当提供《住宅质量保证书》；该商品房为非住宅的，双方可参照《住宅质量保证书》中的内容对保修范围、保修期限和保修责任等进行约定。</span>
          </div>
          <div class="paragraph">
            <span class="indent">该商品房的保修期自房屋交付之日起计算，关于保修期限的约定不应低于《建设工程质量管理条例》第四十条规定的最低保修期限。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（一）保修项目、期限及责任的约定</span>
          </div>
          <!-- 1 -->
          <div class="paragraph">
            <span class="indent">1.地基基础和主体结构：</span>
          </div>
          <div class="paragraph">
            <span class="indent">保修期限为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.djjztjgbxqx"></a-input>
            <span v-else :class="[formState.djjztjgbxqx ? 'custom-underline' : 'value100']">&nbsp;{{ formState.djjztjgbxqx || 'x'}}&nbsp;</span>
            <span>：(不得低于设计文件规定的该工程的合理使用年限)；</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.djjztjgbxqxbz"></a-input>
              <span v-else :class="[formState.djjztjgbxqxbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.djjztjgbxqxbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>

          <!-- 2 -->
          <div class="paragraph">
            <span class="indent">2.屋面防水工程、有防水要求的卫生间、房间和外墙面的防渗漏：</span>
          </div>
          <div class="paragraph">
            <span class="indent">保修期限为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.fsgnbxqx"></a-input>
            <span v-else :class="[formState.fsgnbxqx ? 'custom-underline' : 'value100']">&nbsp;{{ formState.fsgnbxqx || 'x'}}&nbsp;</span>
            <span>：(不得低于5年)；</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.fsgnbxqxbz"></a-input>
              <span v-else :class="[formState.fsgnbxqxbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.fsgnbxqxbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>

          <!-- 3 -->
          <div class="paragraph">
            <span class="indent">3.供热、供冷系统和设备：</span>
          </div>
          <div class="paragraph">
            <span class="indent">保修期限为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.grglxtbxqx"></a-input>
            <span v-else :class="[formState.grglxtbxqx ? 'custom-underline' : 'value100']">&nbsp;{{ formState.grglxtbxqx || 'x'}}&nbsp;</span>
            <span>：(不得低于2个采暖期、供冷期)；</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.grglxtbxqxbz"></a-input>
              <span v-else :class="[formState.grglxtbxqxbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.grglxtbxqxbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>

          <!-- 4 -->
          <div class="paragraph">
            <span class="indent">4.电气管线、给排水管道、设备安装：</span>
          </div>
          <div class="paragraph">
            <span class="indent">保修期限为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.dqgxbxqx"></a-input>
            <span v-else :class="[formState.dqgxbxqx ? 'custom-underline' : 'value100']">&nbsp;{{ formState.dqgxbxqx || 'x'}}&nbsp;</span>
            <span>：(不得低于2年)；</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.dqgxbxqxbz"></a-input>
              <span v-else :class="[formState.dqgxbxqxbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.dqgxbxqxbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>

          <!-- 5 -->
          <div class="paragraph">
            <span class="indent">5.装修工程：</span>
          </div>
          <div class="paragraph">
            <span class="indent">保修期限为</span>
            <a-input v-if="mode == 'edit'" class="input100" v-model:value="formState.zxgcbxqx"></a-input>
            <span v-else :class="[formState.zxgcbxqx ? 'custom-underline' : 'value100']">&nbsp;{{ formState.zxgcbxqx || 'x'}}&nbsp;</span>
            <span>：(不得低于2年)；</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.zxgcbxqxbz"></a-input>
              <span v-else :class="[formState.zxgcbxqxbz ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.zxgcbxqxbz || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>

          <!-- 6 -->
          <div class="paragraph">
            <span class="indent">6.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.fj7Otherbz1"></a-input>
            <span v-else :class="[formState.fj7Otherbz1 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.fj7Otherbz1 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <!-- 7 -->
          <div class="paragraph">
            <span class="indent">7.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.fj7Otherbz2"></a-input>
            <span v-else :class="[formState.fj7Otherbz2 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.fj7Otherbz2 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <!-- 8 -->
          <div class="paragraph">
            <span class="indent">8.</span>
            <a-input v-if="mode == 'edit'" class="inputAuto" v-model:value="formState.fj7Otherbz3"></a-input>
            <span v-else :class="[formState.fj7Otherbz3 ? 'custom-underline' : 'valueAuto']">&nbsp;{{ formState.fj7Otherbz3 || 'x'}}&nbsp;</span>
            <span>。</span>
          </div>
          <div class="paragraph">
            <span class="indent">（二）其他约定</span>
          </div>
          <div class="paragraph">
            <span class="indent">
              <a-input v-if="mode == 'edit'" class="inputH" v-model:value="formState.fj7qtyd"></a-input>
              <span v-else :class="[formState.fj7qtyd ? 'custom-underline' : 'valueH']">&nbsp;{{ formState.fj7qtyd || 'x'}}&nbsp;</span>
              <span>。</span>
            </span>
          </div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj8')" class="listTitle"><span class="st4hB">附件八  关于质量担保的证明</span></div>
          
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj9')" class="listTitle"><span class="st4hB">附件九  关于前期物业管理的约定</span></div>
          <div class="paragraph">
            <span class="indent">1.前期物业服务合同</span>
          </div>
          <div class="paragraph">
            <span class="indent">2.临时管理规约</span>
          </div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj10')" class="listTitle"><span class="st4hB">附件十  出卖人关于遮挡或妨碍房屋正常使用情况的说明</span></div>
          <div class="paragraph">
            <span class="indent">（如：该商品房公共管道检修口、柱子、变电箱等有遮挡或妨碍房屋正常使用的情况）</span>
          </div>
        </div>
        <div class="chapterList">
          <div :ref="el => setItemRef(el, 'fj11')" class="listTitle"><span class="st4hB">附件十一  补充协议</span></div>
        </div>
      </div>

    </div>
    
  </div>
</template>
  
<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue';
import QRCode from 'qrcode'

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

let formState :any = reactive({
  jsfs: '',
  dk: '超长名字地块超长名字地块超长名字地块超长名字地块超长名字地块超长名字地块超长名字地块超长名字地块超长名字地块超长名字地块超长名字地块超长名字地块'
})

const itemRefs:any = reactive({});
const templateContent:any = ref(null)
const pageLength :any = ref(0)

const scrollToAnchor = (anchorName) => {
  if (itemRefs[anchorName]) {
    itemRefs[anchorName].scrollIntoView({ behavior: 'smooth', block: "start", inline: "nearest" });
  }
};

const setItemRef = (el, index) => {
  if (el) {
    itemRefs[index] = el;
  }
};

onMounted(() => {
  getPdfPageLength()
  genQrCode()
})

function onCheck(key, value) {
  formState[key] = value
}

function getPdfPageLength() {
  const elementHeight :any = templateContent.value?.offsetHeight //整个合同页面的高度
  const pageHeight :any = (257 / 170) * 851
  pageLength.value = Math.ceil(elementHeight / pageHeight)
}

function genQrCode() {
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

defineExpose({
  scrollToAnchor,
  genQrCode
})


</script>

<style lang="less" scoped>
@import url('/@/views/system/contract/components/mb.less');
.anchorList {
  border: 1px solid #000;
  padding: 10px;
}
.qrCode {
  width: 150px;
  height: 150px;
  text-align: left;
}
.viewTemplate {
}
</style>