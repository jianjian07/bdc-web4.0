
<template>
    
  <a-layout>
    <a-layout-sider
      :style="{ background: '#efefef',
        textAlign: 'left',
        color: '#000',
        lineHeight: '30px',
        fontSize: '16px',
        padding: '20px 10px',
        height: '700px',
        overflow: 'auto'}"
      width="290px"><div class="anchorItem" v-for="anchor in titleTreeList" :key="anchor.value" style="cursor: pointer">
        <div :class="anchor.className"  @click="scrollToAnchor(anchor.value)">{{ anchor.label }}</div>
      </div> </a-layout-sider>
    <a-layout-content 
      :style="{backgroundColor: '#fff',
        padding: '0px 40px',
        height: '700px',
        overflow: 'auto'}" id="contentToConvert">
      <div ref="formRef" class="cici-form-css" style="font-family: 'semi';"><a-form :label-col="{ style: { width:'180px'} }" :labelWrap="true" :disabled="formDisabled">
    <div class="paragraphPanel pdfPageContent pdfPageFont">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  ">
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: row; flex-wrap: wrap;  "><div class='flex-row-2' style=''><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> GF-2014-0172</span></a-form-item></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 合同编号：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div></a-form></div>
    <div class="paragraphPanel canvasContent">
  </div><a-form-item  style="fontSize:14px;textAlign:left;text-align: center;
font-size: 38pt;
padding: 150px 0 250px 0;
line-height: 84px;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;text-align: center;
font-size: 38pt;
padding: 150px 0 250px 0;
line-height: 84px;;;"> 商品房买卖合同（现售）</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column; padding: 30px 0px 200px 0px ">
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;padding-left: 25px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 25px;;line-height: 32px;"> 出卖人：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 700px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;padding-left: 25px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 25px;;line-height: 32px;"> 买受人：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 700px"        ></a-input></a-form-item></a-form></div></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: row; flex-wrap: wrap;  "><div class='' style='width: 26%'>
    <div class="paragraphPanel ">
  </div></div><div class='' style='flex: 1'>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:21px;textAlign:left;text-align-last: justify;
text-align: right;"><span    style="fontSize:21px;textAlign:left;color:#000;whiteSpace:pre-wrap;text-align-last: justify;
text-align: right;;;"> 中华人民共和国住房和城乡建设部</span></a-form-item><a-form-item  style="fontSize:21px;textAlign:left;text-align-last: justify;
text-align: right;"><span    style="fontSize:21px;textAlign:left;color:#000;whiteSpace:pre-wrap;text-align-last: justify;
text-align: right;;;"> 中华人民共和国国家工商行政管理总局</span></a-form-item></a-form></div></div><div class='' style='width:  28%'>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:21px;textAlign:left;padding-top: 28px;"><span    style="fontSize:21px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 28px;;line-height: 42px;"> 制定</span></a-form-item></a-form></div></div></a-form></div></a-form></div>
    <div class="paragraphPanel pdfPageContent pdfPageFont">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:30px;textAlign:center;"><span :ref="el => setTitleRef(el, '5172a9fc-66c5-19486cf9106-9df0-bd1b5818cc13')" class='form-dir-title1'  style="fontSize:30px;textAlign:center;color:#000;whiteSpace:pre-wrap;;;"> 目 录</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 说明</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 专业术语解释</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 第一章  合同当事人</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 第二章  商品房基本状况</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 第三章  商品房价款</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 第四章  商品房交付条件与交付手续</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 第五章  商品房质量及保修责任</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 第六章  房屋登记</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 第七章  物业管理</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> 第八章  其他事项</span></a-form-item></a-form></div></a-form></div>
    <div class="paragraphPanel pdfPageContent pdfPageFont">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:30px;textAlign:center;"><span :ref="el => setTitleRef(el, '8376e420-39de-19486d038d2-8b7d-94ba96dc65f3')" class='form-dir-title1'  style="fontSize:30px;textAlign:center;color:#000;whiteSpace:pre-wrap;;;"> 说 明</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column; padding: 40px 0px 0px 0px "><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.本合同文本为示范文本，由中华人民共和国住房和城乡建设部、中华人民共和国国家工商行政管理总局共同制定。各地可在有关法律法规、规定的范围内，结合实际情况调整合同相应内容。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.签订本合同前，出卖人应当向买受人出示有关权属证书或证明文件。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 3.出卖人应当就合同重大事项对买受人尽到提示义务。买受人应当审慎签订合同，在签订本合同前，要仔细阅读合同条款，特别是审阅其中具有选择性、补充性、修改性的内容，注意防范潜在的市场风险和交易风险。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 4.本合同文本【】中选择内容、空格部位填写内容及其他需要删除或添加的内容，双方当事人应当协商确定。 【】中选择内容，以划✓方式选定；对于实际情况未发生或双方当事人不作约定时，应当在空格部位打× ，以示删除。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 5.出卖人与买受人可以针对本合同文本中没有约定或者约定不明确的内容，根据所售项目的具体情况在相关条款后的空白行中进行补充约定，也可以另行签订补充协议。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 6.双方当事人可以根据实际情况决定本合同原件的份数，并在签订合同时认真核对，以确保各份合同内容一致；在任何情况下，出卖人和买受人都应当至少持有一份合同原件。</span></a-form-item></a-form></div></a-form></div>
    <div class="paragraphPanel pdfPageContent pdfPageFont">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:30px;textAlign:center;"><span :ref="el => setTitleRef(el, '10340509-8212-194826d4dc8-d1ee-44b30b9865c8')" class='form-dir-title1'  style="fontSize:30px;textAlign:center;color:#000;whiteSpace:pre-wrap;;;"> 专业术语解释</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column; padding: 40px 0px 0px 0px "><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.商品房现售：是指房地产开发企业将竣工验收合格的商品房出售给买受人，并由买受人支付房价款的行为。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.法定代理人：是指依照法律规定直接取得代理权的人。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 3.套内建筑面积：是指成套房屋的套内建筑面积，由套内使用面积、套内墙体面积、套内阳台建筑面积三部分组成。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 4.房屋的建筑面积：是指房屋外墙（柱）勒脚以上各层的外围水平投影面积，包括阳台、挑廊、地下室、室外楼梯等，且具备有上盖，结构牢固，层高2.20M以上（含2.20M）的永久性建筑。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 5.不可抗力：是指不能预见、不能避免并不能克服的客观情况。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 6.民用建筑节能：是指在保证民用建筑使用功能和室内热环境质量的前提下，降低其使用过程中能源消耗的活动。民用建筑是指居住建筑、国家机关办公建筑和商业、服务业、教育、卫生等其他公共建筑。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 7.房屋登记：是指房屋登记机构依法将房屋权利和其他应当记载的事项在房屋登记簿上予以记载的行为。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 8.所有权转移登记：是指商品房所有权从出卖人转移至买受人所办理的登记类型。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 9.房屋登记机构：是指直辖市、市、县人民政府建设（房地产）主管部门或者其设置的负责房屋登记工作的机构。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 10.分割拆零销售：是指房地产开发企业将成套的商品住宅分割为数部分分别出售给买受人的销售方式。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 11.返本销售：是指房地产开发企业以定期向买受人返还购房款的方式销售商品房的行为。</span></a-form-item></a-form></div></a-form></div>
    <div class="paragraphPanel pdfPageContentAuto pdfPageFont">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;font-size: 22pt;
text-align: center;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 22pt;
text-align: center;;;"> 商品房买卖合同</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:center;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:center;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> （现 售）</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 出卖人向买受人出售其开发建设的房屋，双方当事人应当在自愿、平等、公平及诚实信用的基础上，根据《中华人民共和国合同法》 、 《中华人民共和国物权法》 、 《中华人民共和国城市房地产管理法》等法律、法规的规定，就商品房买卖相关内容协商达成一致意见，签订本商品房买卖合同。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;font-size: 14pt;
text-align: center;
padding: 40px;"><span :ref="el => setTitleRef(el, 'b1ebf9d3-6df7-194828021b6-9dce-89393744825c')" class='form-dir-title1'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;
text-align: center;
padding: 40px;;;"> 第一章  合同当事人</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  ">
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 出卖人： </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 通讯地址：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 邮政编码：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 营业执照注册号：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 680px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: row; flex-wrap: wrap;  "><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 法定代表人：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 联系电话：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: row; flex-wrap: wrap;  "><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 委托代理人：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 联系电话：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 委托销售经济机构：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 660px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 通讯地址：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 邮政编码：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 营业执照注册号：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 680px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 经纪机构备案证明号：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 640px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: row; flex-wrap: wrap;  "><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 法定代表人：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 联系电话：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 买受人：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="法定代表人">【 法定代表人 】</a-radio><a-radio class="bracketRadio" value="负责人">【 负责人 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> ：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 535px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="国籍">【 国籍 】</a-radio><a-radio class="bracketRadio" value="户籍所在地">【 户籍所在地 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> ：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 550px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 42px;"> 证件类型：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="居民身份证">【 居民身份证 】</a-radio><a-radio class="bracketRadio" value="护照">【 护照 】</a-radio><a-radio class="bracketRadio" value="营业执照">【 营业执照 】</a-radio><a-radio class="bracketRadio" :value="viewData.zjlxOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 230px" v-model:value="viewData.zjlxOther" write-field="zjlxOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 42px;">  ，</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 42px;"> 证号：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 780px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 42px;"> 出生日期：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 42px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 42px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 42px;"> 日，性别：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 42px;"> 通讯地址：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: row; flex-wrap: wrap;  "><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 邮政编码：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 42px;"> 联系电话：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div></a-form></div></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;font-size: 14pt;
text-align: center;
padding: 40px;"><span :ref="el => setTitleRef(el, 'a2e0c89d-04fb-1948290db91-942f-46e21abd6288')" class='form-dir-title1'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;
text-align: center;
padding: 40px;;;"> 第二章  商品房基本信息</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'c7ad9a7c-5a31-1948293b311-20e6-3107ea3fc0e7')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第一条 项目建设依据</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 1.出卖人以</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="出让">【 出让 】</a-radio><a-radio class="bracketRadio" value="划拨">【 划拨 】</a-radio><a-radio class="bracketRadio" :value="viewData.cmfsOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.cmfsOther" write-field="cmfsOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 方式取得坐落于</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 600px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 地块的建设用地使用权。该地块</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="国有土地使用证号">【 国有土地使用证号 】</a-radio><a-radio class="bracketRadio" :value="viewData.syzsOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.syzsOther" write-field="syzsOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> ，土地使用权面积为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 平方米。买受人购买的商品房（以下简称该商品房）所占用的土地用途为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 200px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> ，土地使用权终止日期为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 日。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 2.出卖人经批准，在上述地块上建设的商品房项目核准名称为:</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 建设工程规划许可证号为:</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> ，建筑工程施工许可证号为:</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '4183268f-2add-1948294860d-c05b-7079d4bc02c4')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第二条 销售依据</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 该商品房已取得</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="建设工程竣工验收备案证明文件">【 建设工程竣工验收备案证明文件 】</a-radio><a-radio class="bracketRadio" value="《房屋所有权证》">【 《房屋所有权证》 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> ，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="备案号">【 备案号 】</a-radio><a-radio class="bracketRadio" value="《房屋所有权证》证号">【 《房屋所有权证》证号 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 为：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 200px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> ，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="备案机构">【 备案机构 】</a-radio><a-radio class="bracketRadio" value="房屋登记机构">【 房屋登记机构 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 为：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '3311e378-372f-1948294e0a1-bb9c-e3996a1fd9c2')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第三条 商品房基本情况</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 1.该商品房的规划用途为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="住宅">【 住宅 】</a-radio><a-radio class="bracketRadio" value="办公">【 办公 】</a-radio><a-radio class="bracketRadio" value="商业">【 商业 】</a-radio><a-radio class="bracketRadio" :value="viewData.spfghytOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 70px" v-model:value="viewData.spfghytOther" write-field="spfghytOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 2.该商品房所在建筑物的主体结构为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> ，建筑总层数为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 层，其中地上</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 层，地下</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 层。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 3.该商品房为第一条规定项目中的</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="幢">【 幢 】</a-radio><a-radio class="bracketRadio" value="座">【 座 】</a-radio><a-radio class="bracketRadio" :value="viewData.spfdwOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 70px" v-model:value="viewData.spfdwOther" write-field="spfdwOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 单元</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 层</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 号。该商品房的平面图见附件一。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 4.该商品房的房产测绘机构为 </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 200px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> ，其实测建筑面积共</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 平方米，其中套内建筑面积</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 平方米，分摊共有建筑面积</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 平方米。该商品房共用部位见附件二。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 该商品房层高为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 米，有</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 个阳台，其中</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 个阳台为封闭式，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 个阳台为非封闭式。阳台是否封闭以规划设计文件为准。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'efa3c109-074e-1948294debc-2122-bf9dad6876c3')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第四条 抵押情况</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 与该商品房有关的抵押情况为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="抵押">【 抵押 】</a-radio><a-radio class="bracketRadio" value="未抵押">【 未抵押 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: row; flex-wrap: wrap;  "><div class='flex-row-2' style=''><a-form-item class="c-form-item-margin-22"   label="抵押人" ><a-input class="underlineInput"              ></a-input></a-form-item></div><div class='flex-row-2' style=''><a-form-item class="c-form-item-margin-22"   label="抵押权人" ><a-input class="underlineInput"              ></a-input></a-form-item></div><div class='flex-row-2' style=''><a-form-item class="c-form-item-margin-22"   label="抵押登记机构" ><a-input class="underlineInput"              ></a-input></a-form-item></div><div class='flex-row-2' style=''><a-form-item class="c-form-item-margin-22"   label="抵押登记日期" ><a-input class="underlineInput"              ></a-input></a-form-item></div></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item class="c-form-item-margin-22"   label="债务履行期限" ><a-input class="underlineInput"              ></a-input></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 抵押权人同意该商品房转让的证明及关于抵押的相关约定见附件三。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '7f2139c6-ab3d-1948294dc74-8586-8abc5c91a70a')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第五条 租赁情况</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 该商品房的租赁情况为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="出租">【 出租 】</a-radio><a-radio class="bracketRadio" value="未出租">【 未出租 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 出卖人已将该商品房出租，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="买受人为该商品房承租人">【 买受人为该商品房承租人 】</a-radio><a-radio class="bracketRadio" value="承租人放弃优先购买权">【 承租人放弃优先购买权 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 租赁期限：从</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日至</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日。出卖人与买受人经协商一致，自本合同约定的交付日至租赁期限届满期间的房屋收益归</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="出卖人">【 出卖人 】</a-radio><a-radio class="bracketRadio" value="买受人">【 买受人 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 所有。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;line-height: 32px;"> 出卖人提供的承租人放弃优先购买权的声明见附件四。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '08664ff4-78fc-1948294d3ec-0ade-010196e36583')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第六条 房屋权利状况承诺</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.出卖人对该商品房享有合法权利；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.该商品房没有出售给除本合同买受人以外的其他人；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 3.该商品房没有司法查封或其他限制转让的情况；</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 4.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 5.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;padding-left: 15px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;
font-size: 14pt;;line-height: 32px;"> 如该商品房权利状况与上述情况不符，导致不能完成房屋所有权转移登记的，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-5"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;">  %（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。给买受人造成损失的，由出卖人支付</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="已付房价款一倍">【 已付房价款一倍 】</a-radio><a-radio class="bracketRadio" value="买受人全部损失">【 买受人全部损失 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 的赔偿金。</span></a-form-item></a-form></div></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;font-size: 14pt;
text-align: center;
padding: 40px;"><span :ref="el => setTitleRef(el, '0e89f5fb-2fbf-19482915f02-5671-6270aee43d8f')" class='form-dir-title1'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;
text-align: center;
padding: 40px;;;"> 第三章  商品房价款</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '7c0f07b6-bf7a-1948295e39a-38b9-fbbde317f8e2')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第七条 计价方式与价款</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 出卖人与买受人按照下列第</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 种方式计算该商品房价款：</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 1. 按照套内建筑面积计算，该商品房单价为每平方米</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种） </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元，总价款为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种） </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元（大写</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元整） 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 2. 按照建筑面积计算，该商品房单价为每平方米</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种） </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元，总价款为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种） </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元（大写</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元整） 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 3. 按照套计算，该商品房总价款为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种） </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元（大写</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元整） 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 4. 按照计算，该商品房总价款为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种） </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元（大写</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元整） 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '99d70f32-5f48-194829658b2-3d64-fb881a20acbf')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第八条 付款方式及期限</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （一）签订本合同前，买受人已向出卖人支付定金</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种） </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元（大写</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元） ，该定金于</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="本合同签订">【 本合同签订 】</a-radio><a-radio class="bracketRadio" value="交付首付款">【 交付首付款 】</a-radio><a-radio class="bracketRadio" :value="viewData.djsysjOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 100px" v-model:value="viewData.djsysjOther" write-field="djsysjOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 时</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="抵作">【 抵作 】</a-radio><a-radio class="bracketRadio" :value="viewData.djytOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 70px" v-model:value="viewData.djytOther" write-field="djytOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 商品房价款。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （二）买受人采取下列第</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 种方式付款：</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;">  1. 一次性付款。买受人应当在</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日前支付该商品房全部价款。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;">  2. 分期付款。买受人应当在</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日前分</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 期支付该商品房全部价款，首期房价款 </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种） </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元（大写</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元整） ，应当于</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日前支付。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline; padding: 0px 0px 0px 30px "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 3. 贷款方式付款：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="公积金贷款">【 公积金贷款 】</a-radio><a-radio class="bracketRadio" value="商业贷款">【 商业贷款 】</a-radio><a-radio class="bracketRadio" :value="viewData.dkfsOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 100px" v-model:value="viewData.dkfsOther" write-field="dkfsOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;">  。买受人应当于</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日前支付首期房价款</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （币种）</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元（大写</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元整） ，向</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 贷款机构）申请贷款支付。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 4.其他方式：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline; padding: 0px 0px 0px 30px "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '31dd0e60-8223-19482965659-a7df-9089a3dd8088')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第九条 逾期付款责任</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 除不可抗力外，买受人未按照约定时间付款的，双方同意按照下列第</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 种方式处理：</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.按照逾期时间，分别处理（  （1）和（2）不作累加）。</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （1）逾期在</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日之内，买受人按日计算向出卖人支付逾期应付款万分之</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 的违约金。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （2）逾期超过</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日（该期限应当与本条第（1）项中的期限相同）后，出卖人有权解除合同。出卖人解除合同的，应当书面通知买受人。买受人应当自解除合同通知送达之日起</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日内按照累计应付款的</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> %向出卖人支付违约金，同时，出卖人退还买受人已付全部房款（含已付贷款部分）。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 出卖人不解除合同的，买受人按日计算向出卖人支付逾期应付款万分之</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> （该比率不低于第（1）项中的比率）的违约金。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 本条所称逾期应付款是指依照第八条及附件五约定的到期应付款与该期实际已付款的差额；采取分期付款的，按照相应的分期应付款与该期的实际已付款的差额确定。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;line-height: 32px;"> 2.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 800px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;font-size: 14pt;
text-align: center;
padding: 40px;"><span :ref="el => setTitleRef(el, 'd33fcc0b-e191-1948291d04b-0250-7978cd278f89')" class='form-dir-title1'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;
text-align: center;
padding: 40px;;;"> 第四章  商品房交付条件与交付手续</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '79b079dc-8299-19482973a1f-357b-5863ce10e4f4')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十条 商品房交付条件</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 该商品房交付时应当符合下列第 1、2、</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 50px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 、</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 50px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 项所列条件：</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.该商品房已取得建设工程竣工验收备案证明文件；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.该商品房已取得房屋测绘报告；</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 3.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 770px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 4.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 770px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 该商品房为住宅的，出卖人还需提供《住宅使用说明书》和《住宅质量保证书》。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'e8feef89-3e64-1948297b045-c7ba-60976a47bf8e')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十一条 商品房相关设施设备交付条件</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （一）基础设施设备</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.供水、排水：交付时供水、排水配套设施齐全，并与城市公共供水、排水管网连接。使用自建设施供水的，供水的水质符合国家规定的饮用水卫生标准，</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline; padding: 0px 0px 0px 30px "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.供电：交付时纳入城市供电网络并正式供电，</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline; padding: 0px 0px 0px 30px "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 3.燃气：交付时完成室内燃气管道的敷设，并与城市燃气管网连接，保证燃气供应，</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline; padding: 0px 0px 0px 30px "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 4.电话通信：交付时线路敷设到户；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 5.有线电视：交付时线路敷设到户；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 6.宽带网络：交付时线路敷设到户。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 以上第1、2、3项由出卖人负责办理开通手续并承担相关费用；第4、5、6项需要买受人自行办理开通手续。</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 42px;"> 如果在约定期限内基础设施设备未达到交付使用条件，双方同意按照下列第</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 42px;"> 种方式处理：</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （1）以上设施中第1、2、3项在约定交付日未达到交付条件的，出卖人按照本合同第十二条的约定承担逾期交付责任。</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 第4项未按时达到交付使用条件的，出卖人按日向买受人支付</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元的违约金；第5项未按时达到交付使用条件的，出卖人按日向买受人支付</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元的违约金。出卖人采取措施保证相关设施于约定交付日后 </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日之内达到交付使用条件。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （2）</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 730px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （二）公共服务及其他配套设施（以建设工程规划许可为准）</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 1.小区内绿地率：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日达到</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 230px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 2.小区内非市政道路：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日达到</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 190px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 3.规划的车位、车库：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日达到</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 190px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 4.物业服务用房：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日达到</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 230px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 5.医疗卫生机构：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日达到</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 230px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 6.幼儿园：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日达到</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 285px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 7.学校：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input-number class="underlineInput"     :step="1"     style='width:100px'      /></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日达到</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 305px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 8.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 770px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 9.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 770px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> 以上设施未达到上述条件的，双方同意按照以下方式处理：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 1.小区内绿地率未达到上述约定条件的，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 450px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 2.小区内非市政道路未达到上述约定条件的，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 410px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 3.规划的车位、车库未达到上述约定条的，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 425px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 4.物业服务用房未达到上述约定条件的，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 445px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 5.其他设施未达到上述约定条件的，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 480px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 关于本项目内相关设施设备的具体约定见附件六。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '82bceb6b-856c-1948297ad46-c2a0-995084684157')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十二条 交付时间和手续</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （一）出卖人应当在</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日前向买受人交付该商品房。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （二）该商品房达到第十条、第十一条约定的交付条件后，出卖人应当在交付日期届满前</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日（不少于10日）将查验房屋的时间、办理交付手续的时间地点以及应当携带的证件材料的通知书面送达买受人。买受人未收到交付通知书的，以本合同约定的交付日期届满之日为办理交付手续的时间，以该商品房所在地为办理交付手续的地点。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 交付该商品房时，出卖人应当出示满足第十条约定的证明文件。出卖人不出示证明文件或者出示的证明文件不齐全，不能满足第十条约定条件的，买受人有权拒绝接收，由此产生的逾期交付责任由出卖人承担，并按照第十三条处理。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （三）查验房屋</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;">  1.办理交付手续前，买受人有权对该商品房进行查验，出卖人不得以缴纳相关税费或者签署物业管理文件作为买受人查验和办理交付手续的前提条件。</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;padding-left: 15px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;
font-size: 14pt;;line-height: 32px;">  2.买受人查验的该商品房存在下列除地基基础和主体结构外的其他质量问题的，由出卖人按照有关工程和产品质量规范、标准自查验次日起</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日内负责修复，并承担修复费用，修复后再行交付。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （1）屋面、墙面、地面渗漏或开裂等；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （2）管道堵塞；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （3）门窗翘裂、五金件损坏；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （4）灯具、电器等电气设备不能正常使用；</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （5）</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （6）</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 3.查验该商品房后，双方应当签署商品房交接单。由于买受人原因导致该商品房未能按期交付的，双方同意按照以下方式处理：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （1）</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （2）</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '39416042-32f0-19482979e3d-4b99-da55ba36c323')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十三条  逾期交付责任</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 除不可抗力外，出卖人未按照第十二条约定的时间将该商品房交付买受人的，双方同意按照下列第</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 种方式处理：</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.按照逾期时间，分别处理（ （1）和（2）不作累加)。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （1）逾期在</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日之内（该期限应当不多于第九条第1（1）项中的期限），自第十二条约定的交付期限届满之次日起至实际交付之日止，出卖人按日计算向买受人支付全部房价款万分之</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 的违约金（该违约金比率应当不低于第九条第1（1）项中的比率）。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （2）逾期超过</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日（该期限应当与本条第（1）项中的期限相同）后，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> %（不低于中国人民银行公布的同期贷款基准利率）计算给付利息；同时，出卖人按照全部房价款的</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> %向买受人支付违约金。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 2.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:center;font-size: 14pt;
padding: 40px;"><span :ref="el => setTitleRef(el, '97180f6e-f319-1948291ccca-920f-266c01066b88')" class='form-dir-title1'  style="fontSize:14px;textAlign:center;color:#000;whiteSpace:pre-wrap;font-size: 14pt;
padding: 40px;;;"> 第五章  商品房质量及保修责任</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'c23bcb83-6176-19482984ef4-7a81-d7780c147021')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十四条  商品房质量</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （一）地基基础和主体结构</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;padding-left: 15px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;
font-size: 14pt;;line-height: 32px;"> 出卖人承诺该商品房地基基础和主体结构合格，并符合国家及行业标准。经检测不合格的，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-5"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> %（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。给买受人造成损失的，由出卖人支付</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="已付房价款一倍">【 已付房价款一倍 】</a-radio><a-radio class="bracketRadio" value="买受人全部损失">【 买受人全部损失 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 赔偿金。因此而发生的检测费用由出卖人承担。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 买受人不解除合同的，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 600px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （二）其他质量问题</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 该商品房质量应当符合有关工程质量规范、标准和施工图设计文件的要求。发现除地基基础和主体结构外质量问题的，双方按照以下方式处理：</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （1）及时更换、修理；如给买受人造成损失的，还应当承担相应赔偿责任。</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline; padding: 0px 0px 0px 30px "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;padding-left: 15px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;
font-size: 14pt;;line-height: 32px;"> （2）经过更换、修理，仍然严重影响正常使用的，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-5"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> %（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。给买受人造成损失的，由出卖人承担相应赔偿责任。因此而发生的检测费用由出卖人承担。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 买受人不解除合同的，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 600px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （三）装饰装修及设备标准</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;padding-left: 15px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;
font-size: 14pt;;line-height: 32px;"> 该商品房应当使用合格的建筑材料、构配件和设备，装置、装修、装饰所用材料的产品质量必须符合国家的强制性标准及双方约定的标准。不符合上述标准的，买受人有权要求出卖人按照下列第（1） 、</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 、</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 方式处理（可多选） ：</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （1）及时更换、修理；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （2）出卖人赔偿双倍的装饰、设备差价；</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （3）</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ；</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （4）</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 740px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 具体装饰装修及相关设备标准的约定见附件七。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （四）室内空气质量、建筑隔声和民用建筑节能措施</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 1.该商品房室内空气质量符合</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="国家">【 国家 】</a-radio><a-radio class="bracketRadio" value="地方">【 地方 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 标准，标准名称：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 200px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ，标准文号</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 200px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 该商品房为住宅的，建筑隔声情况符合</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="国家">【 国家 】</a-radio><a-radio class="bracketRadio" value="地方">【 地方 】</a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 标准，标准名称：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 200px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> ，标准文号</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 200px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;padding-left: 15px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;
font-size: 14pt;;line-height: 32px;"> 该商品房室内空气质量或建筑隔声情况经检测不符合标准，由出卖人负责整改，整改后仍不符合标准的，买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> %（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。给买受人造成损失的，由出卖人承担相应赔偿责任。经检测不符合标准的，检测费用由出卖人承担，整改后再次检测发生的费用仍由出卖人承担。因整改导致该商品房逾期交付的，出卖人应当承担逾期交付责任。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.该商品房应当符合国家有关民用建筑节能强制性标准的要求。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 未达到标准的，出卖人应当按照相应标准要求补做节能措施，并承担全部费用；给买受人造成损失的，出卖人应当承担相应赔偿责任。</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 800px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'd33c0036-8e4d-1948298cb2e-216b-160a0f2ea0a2')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十五条  保修责任</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （一）商品房实行保修制度。该商品房为住宅的，出卖人自该商品房交付之日起，按照《住宅质量保证书》承诺的内容承担相应的保修责任。该商品房为非住宅的，双方应当签订补充协议详细约定保修范围、保修期限和保修责任等内容。具体内容见附件八。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;">  （二）下列情形，出卖人不承担保修责任：</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.因不可抗力造成的房屋及其附属设施的损害；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.因买受人不当使用造成的房屋及其附属设施的损害；</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline; padding: 0px 0px 0px 30px "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 3.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （三）在保修期内，买受人要求维修的书面通知送达出卖人日内，出卖人既不履行保修义务也不提出书面异议的，买受人可以自行或委托他人进行维修，维修费用及维修期间造成的其他损失由出卖人承担。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '08155160-095a-19482992a5a-0d1e-e3a6d5c51f6b')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十六条  质量担保</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 出卖人不按照第十四条、第十五条约定承担相关责任的，由</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"              ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 承担连带责任。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 关于质量担保的证明见附件九。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;font-size: 14pt;
text-align: center;
padding: 40px;"><span :ref="el => setTitleRef(el, '8c959f69-e3e5-1948291c740-f273-727633166cb3')" class='form-dir-title1'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;
text-align: center;
padding: 40px;;;"> 第六章  房屋登记</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'b443e708-0fe3-19482997b62-1537-04bea7bc9698')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十七条  房屋登记</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （一）双方同意共同向房屋登记机构申请办理该商品房的房屋所有权转移登记。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （二）因出卖人的原因，买受人未能在该商品房交付之日起</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日内取得该商品房的房屋所有权证书的，双方同意按照下列第</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 种方式处理：</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;padding-left: 15px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;
font-size: 14pt;;line-height: 32px;"> 1.买受人有权解除合同。买受人解除合同的，应当书面通知出卖人。出卖人应当自解除合同通知送达之日起15日内退还买受人已付全部房款（含已付贷款部分），并自买受人付款之日起，按照 </span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> %（不低于中国人民银行公布的同期贷款基准利率）计算给付利息。买受人不解除合同的，自买受人应当完成房屋所有权登记的期限届满之次日起至实际完成房屋所有权登记之日止，出卖人按日计算向买受人支付全部房价款万分之</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 的违约金。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 2.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （三）因买受人的原因未能在约定期限内完成该商品房的房屋所有权转移登记的，出卖人不承担责任。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:center;padding: 40px;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'b489058f-1ea0-1948291c492-0421-06d574dd87a2')" class='form-dir-title1'  style="fontSize:14px;textAlign:center;color:#000;whiteSpace:pre-wrap;padding: 40px;
font-size: 14pt;;;"> 第七章  物业管理</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '6d6b2920-d736-1948299f31a-ec18-f6d8892608bf')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十八条  物业管理</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （一）出卖人依法选聘的前期物业服务企业为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （二）物业服务时间从</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日到</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> （三）物业服务期间，物业收费计费方式为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="包干制">【 包干制 】</a-radio><a-radio class="bracketRadio" value="酬金制">【 酬金制 】</a-radio><a-radio class="bracketRadio" :value="viewData.wysfjffsOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 100px" v-model:value="viewData.wysfjffsOther" write-field="wysfjffsOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。物业服务费为</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 元/月 · 平方米（建筑面积) 。</span></a-form-item></a-form></div></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （四）买受人同意由出卖人选聘的前期物业服务企业代为查验并承接物业共用部位、共用设施设备，出卖人应当将物业共用部位、共用设施设备承接查验的备案情况书面告知买受人。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （五）买受人已详细阅读前期物业服务合同和临时管理规约，同意由出卖人依法选聘的物业服务企业实施前期物业管理，遵守临时管理规约。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （六）业主大会设立前适用该章约定。业主委员会成立后，由业主大会决定选聘或续聘物业服务企业。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 该商品房前期物业服务合同、临时管理规约见附件十。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;font-size: 14pt;
text-align: center;
padding: 40px;"><span :ref="el => setTitleRef(el, '9d94459c-d156-1948291bf36-1a8b-4eb2aba5c5b4')" class='form-dir-title1'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;
text-align: center;
padding: 40px;;;"> 第八章  其他事项</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14px;textAlign:left;font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '43d57c0e-60a7-194829a6333-35bf-96975350eb25')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第十九条  建筑物区分所有权</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （一）买受人对其建筑物专有部分享有占有、使用、收益和处分的权利。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （二）以下部位归业主共有：</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.建筑物的基础、承重结构、外墙、屋顶等基本结构部分，通道、楼梯、大堂等公共通行部分，消防、公共照明等附属设施、设备，避难层、设备层或者设备间等结构部分；</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.该商品房所在建筑区划内的道路（属于城镇公共道路的除外）、绿地（属于城镇公共绿地或者明示属于个人的除外）、占用业主共有的道路或者其他场地用于停放汽车的车位、物业服务用房；</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 3.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> （三）双方对其他配套设施约定如下：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 1.规划的车位、车库：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 605px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 2.会所</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 736px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 3.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 770px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '8fff1c7b-7015-194829ae9d6-5d29-0598b0581bd4')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第二十条  税费</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 双方应当按照国家的有关规定，向相应部门缴纳因该商品房买卖发生的税费。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '42a37ec6-3033-194829ae829-e884-ba2df16237fb')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第二十一条  销售和使用承诺</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.出卖人承诺不采取分割拆零销售、返本销售或者变相返本销售的方式销售商品房。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.出卖人承诺按照规划用途进行建设和出售，不擅自改变该商品房使用性质，并按照规划用途办理房屋登记。出卖人不得擅自改变与该商品房有关的共用部位和设施的使用性质。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 3.出卖人承诺对商品房的销售，不涉及依法或者依规划属于买受人共有的共用部位和设施的处分。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 4.出卖人承诺已将遮挡或妨碍房屋正常使用的情况告知买受人。具体内容见附件十一。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 5.买受人使用该商品房期间，不得擅自改变该商品房的用途、建筑主体结构和承重结构。</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 6.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '78303abb-1638-194829ae661-fb10-ec97dad80d0d')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第二十二条  送达</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;padding-left: 15px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;;line-height: 32px;"> 出卖人和买受人保证在本合同中记载的通讯地址、联系电话均真实有效。任何根据本合同发出的文件，均应采用书面形式，以</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="邮政快递">【 邮政快递 】</a-radio><a-radio class="bracketRadio" value="邮寄挂号信">【 邮寄挂号信 】</a-radio><a-radio class="bracketRadio" :value="viewData.sdfsOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.sdfsOther" write-field="sdfsOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 方式送达对方。任何一方变更通讯地址、联系电话的，应在变更之日起</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 日内书面通知对方。变更的一方未履行通知义务导致送达不能的，应承担相应的法律责任。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '41a09707-2836-194829ae4c4-88df-a3239569c318')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第二十三条  买受人信息保护</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 出卖人对买受人信息负有保密义务。非因法律、法规规定或国家安全机关、公安机关、检察机关、审判机关、纪检监察部门执行公务的需要，未经买受人书面同意，出卖人及其销售人员和相关工作人员不得对外披露买受人信息，或将买受人信息用于履行本合同之外的其他用途。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, '6c041076-300e-194829ae2ee-6636-fcdb10250435')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第二十四条  争议解决方式</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;padding-left: 15px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-left: 15px;;line-height: 32px;"> 本合同在履行过程中发生的争议，由双方当事人协商解决，也可通过消费者协会等相关机构调解；或按照下列第</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 种方式解决：</span></a-form-item></a-form></div><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 1.依法向房屋所在地人民法院起诉。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 2.提交仲裁委员会仲裁。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'e6989cde-dfd8-194829ae0da-29fe-fd5d2ed109dc')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第二十五条  补充协议</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 对本合同中未约定或约定不明的内容，双方可根据具体情况签订书面补充协议（补充协议见附件十二）。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 补充协议中含有不合理的减轻或免除本合同中约定应当由出卖人承担的责任，或不合理的加重买受人责任、排除买受人主要权利内容的，仍以本合同为准。</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;padding-top: 20px;
font-weight: bold;
font-size: 14pt;"><span :ref="el => setTitleRef(el, 'c10eb2ea-b5a5-194829adb1f-d132-800681fa00d5')" class='form-dir-title2'  style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 第二十六条  合同生效</span></a-form-item><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;display: inline-block; text-indent: 30px;;"> 本合同自双方签字或盖章之日起生效。本合同的解除应当采用书面形式。</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;display: inline-block; text-indent: 30px;line-height: 32px;"> 本合同及附件共</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"       v-model:value="pageLength"
:data-value="JSON.stringify(pageLength)" ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 页，一式</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 份，其中出卖人</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 份，买受人</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 份，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" :value="viewData.qthtcyr">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 100px" v-model:value="viewData.qthtcyr" write-field="qthtcyr"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 份，</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" :value="viewData.qthtcyr2">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 100px" v-model:value="viewData.qthtcyr2" write-field="qthtcyr2"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 。合同附件与本合同具有同等法律效力。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: row; flex-wrap: wrap;  "><div class='flex-row-2' style=''><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> 出卖人（签字或盖章） ：</span></a-form-item></div><div class='flex-row-2' style=''><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> 买受人（签字或盖章） ：</span></a-form-item></div><div class='flex-row-2' style=''><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> 【法定代表人】 （签字或盖章） ：</span></a-form-item></div><div class='flex-row-2' style=''><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> 【法定代表人】 （签字或盖章） ：</span></a-form-item></div><div class='flex-row-2' style=''><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> 【委托代理人】 （签字或盖章） ：</span></a-form-item></div><div class='flex-row-2' style=''><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> 【委托代理人】 （签字或盖章） ：</span></a-form-item></div><div class='flex-row-2' style=''><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> </span></a-form-item></div><div class='flex-row-2' style=''><a-form-item  style="fontSize:14px;textAlign:left;line-height: 42px;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;
font-size: 14pt;;;"> 【法定代理人】 （签字或盖章） ：</span></a-form-item></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 签订时间：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日</span></a-form-item></a-form></div></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 签订时间：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 年</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 月</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 70px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 日</span></a-form-item></a-form></div></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;font-size: 14pt;;line-height: 32px;"> 签订地点：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div><div class='flex-row-2' style=''>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14px;textAlign:left;
font-size: 14pt;"><span    style="fontSize:14px;textAlign:left;color:#000;whiteSpace:pre-wrap;
font-size: 14pt;;line-height: 32px;"> 签订地点：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 300px"        ></a-input></a-form-item></a-form></div></div></a-form></div></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: flex; flex-direction: column;  "><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, '141c2c56-26ca-19496140031-e01b-b88b39421d59')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件一  房屋平面图（应当标明方位）</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 1.房屋分层分户图（应当标明详细尺寸，并约定误差范围）</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 2.建设工程规划方案总平面图</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, '9a72a598-5da0-19496143f76-9fba-562ad749763b')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件二  关于该商品房共用部位的具体说明（可附图说明）</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;">  1.纳入该商品房分摊的共用部位的名称、面积和所在位置</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 2.未纳入该商品房分摊的共用部位的名称、所在位置</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, 'a18f3673-10ee-19496142f92-099b-c2ff3dd87099')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件三  抵押权人同意该商品房转让的证明及关于抵押的相关约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 1.抵押权人同意该商品房转让的证明</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 2.解除抵押的条件和时间</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 3.关于抵押的其他约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, '029eda1e-04cb-19496141efc-4cf5-26a450866cf7')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件四  出卖人提供的承租人放弃优先购买权的声明</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, '06fd6e9c-e1a0-1949613ef21-0d58-b1be9393392e')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件五  关于该商品房价款的计价方式、总价款、付款方式及期限的具体约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, '76959684-3a4a-1949612b76d-0515-840fc0da3459')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件六  关于本项目内相关设施、设备的具体约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 1.相关设施的位置及用途</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 2.其他约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, '143ec1ec-34b3-1949611f3a8-98b9-2aef7e2432a9')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件七  关于装饰装修及相关设备标准的约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 交付的商品房达不到本附件约定装修标准的，按照本合同第十四条第（三）款约定处理。出卖人未经双方约定增加的装置、装修、装饰，视为无条件赠送给买受人。</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 双方就装饰装修主要材料和设备的品牌、产地、规格、数量等内容约定如下：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 1.外墙：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="瓷砖">【 瓷砖 】</a-radio><a-radio class="bracketRadio" value="涂料">【 涂料 】</a-radio><a-radio class="bracketRadio" value="玻璃幕墙">【 玻璃幕墙 】</a-radio><a-radio class="bracketRadio" :value="viewData.wqclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.wqclOther" write-field="wqclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 2.起居室：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （1）内墙：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="涂料">【 涂料 】</a-radio><a-radio class="bracketRadio" value="壁纸">【 壁纸 】</a-radio><a-radio class="bracketRadio" :value="viewData.qjsnqclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.qjsnqclOther" write-field="qjsnqclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （2）顶棚</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="石膏板吊顶">【 石膏板吊顶 】</a-radio><a-radio class="bracketRadio" value="涂料">【 涂料 】</a-radio><a-radio class="bracketRadio" :value="viewData.qjsdpclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.qjsdpclOther" write-field="qjsdpclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （3）室内地面：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="大理石">【 大理石 】</a-radio><a-radio class="bracketRadio" value="花岗岩">【 花岗岩 】</a-radio><a-radio class="bracketRadio" value="水泥抹面">【 水泥抹面 】</a-radio><a-radio class="bracketRadio" value="实木地板">【 实木地板 】</a-radio><a-radio class="bracketRadio" :value="viewData.qjsdmclOtherOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 100px" v-model:value="viewData.qjsdmclOtherOther" write-field="qjsdmclOtherOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 3.厨房：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （1）地面：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="水泥抹面">【 水泥抹面 】</a-radio><a-radio class="bracketRadio" value="瓷砖">【 瓷砖 】</a-radio><a-radio class="bracketRadio" :value="viewData.cfdmclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.cfdmclOther" write-field="cfdmclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （2）墙面</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="耐水腻子">【 耐水腻子 】</a-radio><a-radio class="bracketRadio" value="瓷砖">【 瓷砖 】</a-radio><a-radio class="bracketRadio" :value="viewData.cfqmclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.cfqmclOther" write-field="cfqmclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （3）顶棚：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="水泥抹面">【 水泥抹面 】</a-radio><a-radio class="bracketRadio" value="石膏吊顶">【 石膏吊顶 】</a-radio><a-radio class="bracketRadio" :value="viewData.cfdpclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.cfdpclOther" write-field="cfdpclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （4）厨具：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 670px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 4.卫生间：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （1）地面：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="水泥抹面">【 水泥抹面 】</a-radio><a-radio class="bracketRadio" value="瓷砖">【 瓷砖 】</a-radio><a-radio class="bracketRadio" :value="viewData.wsjdmclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.wsjdmclOther" write-field="wsjdmclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （2）墙面</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="耐水腻子">【 耐水腻子 】</a-radio><a-radio class="bracketRadio" value="瓷砖">【 瓷砖 】</a-radio><a-radio class="bracketRadio" :value="viewData.wsjqmclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.wsjqmclOther" write-field="wsjqmclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （3）顶棚：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="水泥抹面">【 水泥抹面 】</a-radio><a-radio class="bracketRadio" value="石膏吊顶">【 石膏吊顶 】</a-radio><a-radio class="bracketRadio" :value="viewData.wsjdpclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.wsjdpclOther" write-field="wsjdpclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （4）卫生器具：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 630px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 5.阳台：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-radio-group           ><a-radio class="bracketRadio" value="塑钢封闭">【 塑钢封闭 】</a-radio><a-radio class="bracketRadio" value="铝合金封闭">【 铝合金封闭 】</a-radio><a-radio class="bracketRadio" value="断桥铝合金封闭">【 断桥铝合金封闭 】</a-radio><a-radio class="bracketRadio" value="不封闭">【 不封闭 】</a-radio><a-radio class="bracketRadio" :value="viewData.ytclOther">
        <div style="display: flex; align-items: center">
          <span>【 </span>
          <a-form-item class="inlineFormItem" style="margin-bottom: -20px;">
            <a-input class="underlineInput" style="width: 120px" v-model:value="viewData.ytclOther" write-field="ytclOther"></a-input>
          </a-form-item>
          <span> 】</span>
        </div>
        </a-radio></a-radio-group></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> ；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 6.电梯：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （1）品牌：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 670px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> （2）型号：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 670px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 7.管道：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;display: inline-block; text-indent: 30px;;"> 8.窗户：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 9.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 10.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 790px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, '13d8d472-c88c-1949613de32-b77d-e6073653f2b9')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件八  关于保修范围、保修期限和保修责任的约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 该商品房为住宅的，出卖人应当提供《住宅质量保证书》；该商品房为非住宅的，双方可参照《住宅质量保证书》中的内容对保修范围、保修期限和保修责任等进行约定。</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 该商品房的保修期自房屋交付之日起计算，关于保修期限的约定不应低于《建设工程质量管理条例》第四十条规定的最低保修期限。</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;;"> （一）保修项目、期限及责任的约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 1.地基基础和主体结构：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 保修期限为：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> （不得低于设计文件规定的该工程的合理使用限）；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 2.屋面防水工程、有防水要求的卫生间、房间和外墙面的防渗漏：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 保修期限为：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> （不得低于5年）；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 3.供热、供冷系统和设备：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 保修期限为：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> （不得低于2个采暖期、供冷期）；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 4.电气管线、给排水管道、设备安装：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 保修期限为：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> （不得低于2年）；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 5.装修工程：</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 保修期限为：</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 100px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> （不得低于2年）；</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 6.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 7.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;display: inline-block; text-indent: 30px;line-height: 32px;"> 8.</span></a-form-item><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 760px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;line-height: 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height: 42px;;;"> （二）其他约定</span></a-form-item>
    <div class="paragraphPanel ">
  <a-form class="form-container" :label-col="{ style: { width:'180px'} }" style="display: inline;  "><a-form-item class="inlineFormItem c-form-item-margin-22"   label="" ><a-input class="underlineInput"       style="width: 820px"        ></a-input></a-form-item><a-form-item class="labelInlineFormItem" style="fontSize:14pt;textAlign:left;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;;line-height: 32px;"> 。</span></a-form-item></a-form></div><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, '9a106b4b-3b1e-19496137e8d-40b6-581675d2e0ec')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件九  关于质量担保的证明</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span :ref="el => setTitleRef(el, 'a20f62eb-42e6-19496139320-f176-daf933ea62f6')" class='form-dir-title1'  style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件十  关于物业管理的约定</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 1.前期物业服务合同</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> 2.临时管理规约</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件十一  出卖人关于遮挡或妨碍房屋正常使用情况的说明</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;line-height： 42px;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;line-height： 42px;;display: inline-block; text-indent: 30px;;"> （如：该商品房公共管道检修口、柱子、变电箱等有遮挡或妨碍房屋正常使用的情况）</span></a-form-item><a-form-item  style="fontSize:14pt;textAlign:left;padding-top: 20px;
font-weight: bold;"><span    style="fontSize:14pt;textAlign:left;color:#000;whiteSpace:pre-wrap;padding-top: 20px;
font-weight: bold;;;"> 附件十二  补充协议</span></a-form-item></a-form></div></a-form></div>
</a-form></div>    
    </a-layout-content>
  </a-layout>
    </template>
    <script setup lang="ts">
import { defHttp } from "/@/utils/http/axios";
import { ref, reactive, onMounted, computed, onBeforeUpdate,useAttrs, watch } from "vue";
import { getDictItemsByCode,getTreeDictItemsByCode,formatMultipleSelectValue,formatMultipleTreeSelectValue, getCasDictItemsByCode, useVNodes, getLabelByDictCode, getLabelByTreeDictCode } from '/@/views/online/utils/commonUtils';
import { getData,getDataByApi,initTable, initCTableV2, initAllCTableV2, validateInfos, validateFun, onSubmitForm, syncChange, onTableSelectClear, onTableSelectChange, onTableSelectRowChange, getSelectAllCheck, setSelectAllCheck, getAccount, hideField, getSelectJsonSetting,editRow, saveRow, cancelRow  } from "/@/views/online/utils/wonder1.0.1";
import tableSelectProps from "/@/components/form-widget/widget/tableSelectOptions"
import { cModal } from "/@/components/cModal/index"
import { Modal, message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { currentRoute } from "/@/router"

const formId=142;
const route = currentRoute;
const VNodes = useVNodes();
let datalist: any = ref([]);
let formRef = ref()
let formDisabled = ref(false)
let demoRefs: any = []
let viewData = ref<any>({})
let formSetting = undefined
let apiDataSource = []
let isSubmit = ref(true)
let { disabled } = useAttrs()

// 如果有传值优先读取父组件传值
if (disabled != undefined && typeof disabled == 'boolean') {
  formDisabled.value = disabled
}

      let titleRefs = reactive({});
let titleTreeList = [{
        label: "目 录",
        value: "5172a9fc-66c5-19486cf9106-9df0-bd1b5818cc13",
        className: "form-gen-title1"
      },{
        label: "说 明",
        value: "8376e420-39de-19486d038d2-8b7d-94ba96dc65f3",
        className: "form-gen-title1"
      },{
        label: "专业术语解释",
        value: "10340509-8212-194826d4dc8-d1ee-44b30b9865c8",
        className: "form-gen-title1"
      },{
        label: "第一章  合同当事人",
        value: "b1ebf9d3-6df7-194828021b6-9dce-89393744825c",
        className: "form-gen-title1"
      },{
        label: "第二章  商品房基本信息",
        value: "a2e0c89d-04fb-1948290db91-942f-46e21abd6288",
        className: "form-gen-title1"
      },{
        label: "第一条 项目建设依据",
        value: "c7ad9a7c-5a31-1948293b311-20e6-3107ea3fc0e7",
        className: "form-gen-title2"
      },{
        label: "第二条 销售依据",
        value: "4183268f-2add-1948294860d-c05b-7079d4bc02c4",
        className: "form-gen-title2"
      },{
        label: "第三条 商品房基本情况",
        value: "3311e378-372f-1948294e0a1-bb9c-e3996a1fd9c2",
        className: "form-gen-title2"
      },{
        label: "第四条 抵押情况",
        value: "efa3c109-074e-1948294debc-2122-bf9dad6876c3",
        className: "form-gen-title2"
      },{
        label: "第五条 租赁情况",
        value: "7f2139c6-ab3d-1948294dc74-8586-8abc5c91a70a",
        className: "form-gen-title2"
      },{
        label: "第六条 房屋权利状况承诺",
        value: "08664ff4-78fc-1948294d3ec-0ade-010196e36583",
        className: "form-gen-title2"
      },{
        label: "第三章  商品房价款",
        value: "0e89f5fb-2fbf-19482915f02-5671-6270aee43d8f",
        className: "form-gen-title1"
      },{
        label: "第七条 计价方式与价款",
        value: "7c0f07b6-bf7a-1948295e39a-38b9-fbbde317f8e2",
        className: "form-gen-title2"
      },{
        label: "第八条 付款方式及期限",
        value: "99d70f32-5f48-194829658b2-3d64-fb881a20acbf",
        className: "form-gen-title2"
      },{
        label: "第九条 逾期付款责任",
        value: "31dd0e60-8223-19482965659-a7df-9089a3dd8088",
        className: "form-gen-title2"
      },{
        label: "第四章  商品房交付条件与交付手续",
        value: "d33fcc0b-e191-1948291d04b-0250-7978cd278f89",
        className: "form-gen-title1"
      },{
        label: "第十条 商品房交付条件",
        value: "79b079dc-8299-19482973a1f-357b-5863ce10e4f4",
        className: "form-gen-title2"
      },{
        label: "第十一条 商品房相关设施设备交付条件",
        value: "e8feef89-3e64-1948297b045-c7ba-60976a47bf8e",
        className: "form-gen-title2"
      },{
        label: "第十二条 交付时间和手续",
        value: "82bceb6b-856c-1948297ad46-c2a0-995084684157",
        className: "form-gen-title2"
      },{
        label: "第十三条  逾期交付责任",
        value: "39416042-32f0-19482979e3d-4b99-da55ba36c323",
        className: "form-gen-title2"
      },{
        label: "第五章  商品房质量及保修责任",
        value: "97180f6e-f319-1948291ccca-920f-266c01066b88",
        className: "form-gen-title1"
      },{
        label: "第十四条  商品房质量",
        value: "c23bcb83-6176-19482984ef4-7a81-d7780c147021",
        className: "form-gen-title2"
      },{
        label: "第十五条  保修责任",
        value: "d33c0036-8e4d-1948298cb2e-216b-160a0f2ea0a2",
        className: "form-gen-title2"
      },{
        label: "第十六条  质量担保",
        value: "08155160-095a-19482992a5a-0d1e-e3a6d5c51f6b",
        className: "form-gen-title2"
      },{
        label: "第六章  房屋登记",
        value: "8c959f69-e3e5-1948291c740-f273-727633166cb3",
        className: "form-gen-title1"
      },{
        label: "第十七条  房屋登记",
        value: "b443e708-0fe3-19482997b62-1537-04bea7bc9698",
        className: "form-gen-title2"
      },{
        label: "第七章  物业管理",
        value: "b489058f-1ea0-1948291c492-0421-06d574dd87a2",
        className: "form-gen-title1"
      },{
        label: "第十八条  物业管理",
        value: "6d6b2920-d736-1948299f31a-ec18-f6d8892608bf",
        className: "form-gen-title2"
      },{
        label: "第八章  其他事项",
        value: "9d94459c-d156-1948291bf36-1a8b-4eb2aba5c5b4",
        className: "form-gen-title1"
      },{
        label: "第十九条  建筑物区分所有权",
        value: "43d57c0e-60a7-194829a6333-35bf-96975350eb25",
        className: "form-gen-title2"
      },{
        label: "第二十条  税费",
        value: "8fff1c7b-7015-194829ae9d6-5d29-0598b0581bd4",
        className: "form-gen-title2"
      },{
        label: "第二十一条  销售和使用承诺",
        value: "42a37ec6-3033-194829ae829-e884-ba2df16237fb",
        className: "form-gen-title2"
      },{
        label: "第二十二条  送达",
        value: "78303abb-1638-194829ae661-fb10-ec97dad80d0d",
        className: "form-gen-title2"
      },{
        label: "第二十三条  买受人信息保护",
        value: "41a09707-2836-194829ae4c4-88df-a3239569c318",
        className: "form-gen-title2"
      },{
        label: "第二十四条  争议解决方式",
        value: "6c041076-300e-194829ae2ee-6636-fcdb10250435",
        className: "form-gen-title2"
      },{
        label: "第二十五条  补充协议",
        value: "e6989cde-dfd8-194829ae0da-29fe-fd5d2ed109dc",
        className: "form-gen-title2"
      },{
        label: "第二十六条  合同生效",
        value: "c10eb2ea-b5a5-194829adb1f-d132-800681fa00d5",
        className: "form-gen-title2"
      },{
        label: "附件一  房屋平面图（应当标明方位）",
        value: "141c2c56-26ca-19496140031-e01b-b88b39421d59",
        className: "form-gen-title1"
      },{
        label: "附件二  关于该商品房共用部位的具体说明（可附图说明）",
        value: "9a72a598-5da0-19496143f76-9fba-562ad749763b",
        className: "form-gen-title1"
      },{
        label: "附件三  抵押权人同意该商品房转让的证明及关于抵押的相关约定",
        value: "a18f3673-10ee-19496142f92-099b-c2ff3dd87099",
        className: "form-gen-title1"
      },{
        label: "附件四  出卖人提供的承租人放弃优先购买权的声明",
        value: "029eda1e-04cb-19496141efc-4cf5-26a450866cf7",
        className: "form-gen-title1"
      },{
        label: "附件五  关于该商品房价款的计价方式、总价款、付款方式及期限的具体约定",
        value: "06fd6e9c-e1a0-1949613ef21-0d58-b1be9393392e",
        className: "form-gen-title1"
      },{
        label: "附件六  关于本项目内相关设施、设备的具体约定",
        value: "76959684-3a4a-1949612b76d-0515-840fc0da3459",
        className: "form-gen-title1"
      },{
        label: "附件七  关于装饰装修及相关设备标准的约定",
        value: "143ec1ec-34b3-1949611f3a8-98b9-2aef7e2432a9",
        className: "form-gen-title1"
      },{
        label: "附件八  关于保修范围、保修期限和保修责任的约定",
        value: "13d8d472-c88c-1949613de32-b77d-e6073653f2b9",
        className: "form-gen-title1"
      },{
        label: "附件九  关于质量担保的证明",
        value: "9a106b4b-3b1e-19496137e8d-40b6-581675d2e0ec",
        className: "form-gen-title1"
      },{
        label: "附件十  关于物业管理的约定",
        value: "a20f62eb-42e6-19496139320-f176-daf933ea62f6",
        className: "form-gen-title1"
      }]

// const a=1
let pageLength :any = ref(0)

const emit = defineEmits(['genQrCode'])



      function setTitleRef(el, index) {
        if(el) {
          titleRefs[index] = el
        }
      }

      function scrollToAnchor(anchorName: any) {
        if (titleRefs[anchorName]) {
          titleRefs[anchorName].scrollIntoView({ behavior: 'smooth', block: "start", inline: "nearest" });
        }
      }
await getDataByApi(viewData, apiDataSource)
await getData(viewData, formId)

    
        onMounted(() => {
                emit('genQrCode', {name: '测试合同'})
getPdfPageLength()
                
        })

    
             function getPdfPageLength(){
                const elementHeight :any = formRef.value?.offsetHeight //整个合同页面的高度
const pageHeight :any = (257 / 170) * 851
pageLength.value = Math.ceil(elementHeight / pageHeight)

console.log('pageLength.value', pageLength.value)
        }
        
    function hideFields(index: number) {
       return hideField(formSetting, viewData, index)
    }
    /**
     * 保存
     */
    async function onSubmit() {
        return isSubmit.value ? await onSubmitForm(formRef.value) : null
    }
    /**
    * 用于多表单 
    * @returns {*[]|null}
    */
    function multipleRef() {
        let arr: any = []
        for (let i = 0; i < demoRefs.length; i++) {
          if (demoRefs[i].child) {
            arr.push(demoRefs[i].child)
          }
        }
        return arr.length ? arr : null
    }
    onBeforeUpdate(() => {
      // dom变化时清空 会重新设置
      demoRefs = []
    })
    
    defineExpose({
        multipleRef,
        onSubmit,
        isSubmit,
        formId
    })
    
    </script>

    <style scoped lang="less">
    @import url('/@/assets/less/form.less');
    *{
      font-family: simsun;
    }
    </style>
    