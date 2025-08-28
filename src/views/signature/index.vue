<template>
  <div class="signature-index">
    <div class="signature-tool">
      <div class="signature-stroke-tool">
        <span>画笔大小: </span>
        <div :class="['signature-stroke', `signature-stroke-${item.value}`, currentStrokeSize == item.value ? 'active' : '']" 
             v-for="item in strokeSizes"
             @click="currentStrokeSize = item.value"
        >
        </div>
        <div :class="['signature-erase', isErasing ? 'active' : '']" @click="handleErase">
          <svg-icon name="erase" width="16px" height="16px"></svg-icon>
        </div>
      </div>
      <div class="signature-stroke-btn">
        <a-space>
          <a-button @click="clearCanvas">清除</a-button>
          <a-button v-show="isSignatureVisible0" @click="getSignature(0)">权利人签名</a-button>
          <a-button v-show="isFingerVisible0" @click="getFingerPrint(0)">权利人指纹</a-button>
          <a-button v-show="isSignatureVisible1" @click="getSignature(1)">义务人签名</a-button>
          <a-button v-show="isFingerVisible1" @click="getFingerPrint(1)">义务人指纹</a-button>
          <a-button v-show="isSignatureVisible2" @click="getSignature(2)">抵押人签名</a-button>
          <a-button v-show="isFingerVisible2" @click="getFingerPrint(2)">抵押人指纹</a-button>
          <!--          <a-button type="primary" @click="onSubmit">确定</a-button>-->
        </a-space>
      </div>
    </div>
    <div class="signature-canvas" :class="[isErasing ? 'canvas-erasing' : '']">
      <canvas 
          ref="canvasRef"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="endDrawing"
          @mouseleave="endDrawing"
          @touchstart.prevent="startDrawing"
          @touchmove.prevent="draw"
          @touchend.prevent="endDrawing"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">

import { onBeforeUnmount, nextTick, onMounted, ref } from "vue"
import { message } from "ant-design-vue"
import { defHttp } from "/@/utils/http/axios"

const props = defineProps({
  formData: {
    type: Object,
    default: {}
  }
})
//指纹签名类型(0/权利人、1/义务人、2/抵押人)
let isSignatureVisible0 = ref(true);
let isFingerVisible0 = ref(true);
let isSignatureVisible1 = ref(false);
let isFingerVisible1 = ref(false);
let isSignatureVisible2 = ref(false);
let isFingerVisible2 = ref(false);

// 画笔大小
const strokeSizes = ref<any>([
  { label: '细', value: '2' },
  { label: '中', value: '5' },
  { label: '粗', value: '8' }
])

// 当前画笔大小
let currentStrokeSize = ref<any>(strokeSizes.value[1].value)
// 画布实例
let canvasRef = ref<any>(null)
// 是否正在绘制
let isDrawing = ref(false)
// 最后点
let lastPoint = ref<any>({ x: 0, y: 0 })
// 绘制点集合
let points = ref<any[]>([])
// 画布上下文
let ctx: any = null
// 是否开启橡皮橡
let isErasing = ref(false)
// 画笔颜色
let currentStrokeColor = ref('#000')
let base64Img = ''
let regType = '';
let slbh = '';

onMounted(() => {
  setTimeout(() => {
    // initCanvas()
    resizeCanvas()
  }, 100)
})

/**
 * 初始化canvas
 */
function initCanvas() {
  const canvas = canvasRef.value;

  const rect = canvas.getBoundingClientRect();
  const logicWidth = rect.width;
  const logicHeight = rect.height;

  canvas.width = logicWidth * devicePixelRatio;
  canvas.height = logicHeight * devicePixelRatio;

  canvas.style.width = `${logicWidth}px`;
  canvas.style.height = `${logicHeight}px`;

  ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(devicePixelRatio, devicePixelRatio)

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (base64Img) {
      loadBase64ToCanvas(base64Img, canvasRef.value);
    }
  }
}

function resizeCanvas() {
  regType = props.formData.regType;
  slbh = props.formData.slbh;
  //默认显示权利人指纹签名
  //转移显示义务人指纹签名
  if (regType.includes('0102')) {
    isSignatureVisible1.value = true;
    isFingerVisible1.value = true;
  }
  //抵押显示抵押人指纹签名，不显示权利人
  if (regType.includes('020')) {
    isSignatureVisible2.value = true;
    isFingerVisible2.value = true;
    isSignatureVisible0.value = false;
    isFingerVisible0.value = false;
  }
  //涉及抵押的组合类登记要显示权利人和抵押人
  if (regType.includes('020') && regType.includes(',')) {
    isSignatureVisible2.value = true;
    isFingerVisible2.value = true;
    isSignatureVisible0.value = true;
    isFingerVisible0.value = true;
  }

  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // 设置物理像素
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const context = canvas.getContext('2d');
  if (context) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);
    ctx = context;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (base64Img) {
      loadBase64ToCanvas(base64Img, canvas);
    }
  }
}

/**
 * 加载默认图片到画布
 * @param base64
 * @param canvas
 */
function loadBase64ToCanvas(base64, canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = canvas.getBoundingClientRect();
    const logicWidth = rect.width;
    const logicHeight = rect.height;

    const scaleX = logicWidth / img.width;
    const scaleY = logicHeight / img.height;
    const scale = Math.min(scaleX, scaleY);

    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const offsetX = (logicWidth - drawWidth) / 2;
    const offsetY = (logicHeight - drawHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };
  img.onerror = (err) => {
    console.error('图片加载失败', err);
  };
  img.src = base64;
}

/**
 * 开始绘制
 * @param e
 */
function startDrawing(e: any) {
  isDrawing.value = true;
  const point = getPoint(e);
  points.value = [point];
  lastPoint.value.x = point.x;
  lastPoint.value.y = point.y;
}


/**
 * 获取绘制点位
 * @param e
 */
function getPoint(e) {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  let clientX = 0, clientY = 0;

  if (e instanceof MouseEvent) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else if (e.touches?.length) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  }

  return {
    x: (clientX - rect.left) * (canvas.width / rect.width / devicePixelRatio),
    y: (clientY - rect.top) * (canvas.height / rect.height / devicePixelRatio),
  }
}

/**
 * 绘制
 * @param e
 */
function draw(e) {
  if (!isDrawing.value || !ctx) return;

  const point = getPoint(e);
  points.value.push(point);

  ctx.save(); // 保存上下文状态

  // 判断是否为橡皮擦模式
  if (isErasing.value) {
    ctx.globalCompositeOperation = 'destination-out'; // 擦除模式
    ctx.lineWidth = currentStrokeSize.value || strokeSizes.value[1].value;    // 宽度
  } else {
    ctx.globalCompositeOperation = 'source-over';     // 正常绘图
    ctx.strokeStyle = currentStrokeColor.value || '#000'; // 颜色
    ctx.lineWidth = currentStrokeSize.value || strokeSizes.value[1].value;
  }
  // 原始绘制
  ctx.beginPath();
  ctx.moveTo(lastPoint.value.x, lastPoint.value.y);
  ctx.lineTo(point.x, point.y);
  ctx.lineWidth = currentStrokeSize.value;
  ctx.stroke();

  ctx.restore(); // 恢复上下文状态

  lastPoint.value.x = point.x;
  lastPoint.value.y = point.y;
}

/**
 * 结束绘制
 * @param e
 */
function endDrawing(e) {
  if (!isDrawing.value || !ctx) return;
  isDrawing.value = false;
}

/**
 * 清除画布
 */
function clearCanvas() {
  if (ctx && canvasRef.value) {
    ctx.clearRect(
      0,
      0,
      canvasRef.value.width / devicePixelRatio,
      canvasRef.value.height / devicePixelRatio
    );
  }
}

/**
 * 切换橡皮擦
 */
function handleErase() {
  isErasing.value = !isErasing.value;
  message.info(isErasing.value ? '已开启橡皮擦模式' : '已关闭橡皮擦模式');
}



/**
 * 获取指纹
 */
function getFingerPrint(personType) {
  defHttp.get({ url: 'http://localhost:8888/web/hardware/fingerEnter' }, { withToken: true }).then((res) => {
    console.log(res);
    if (!res) {
      message.warning('获取指纹失败!');
      return;
    }
    if (res.code && res.code != "200") {
        message.warning("获取指纹失败:"+res.msg);
    } else {
      let _data: any = {
        slbh: slbh,
        fingerImage: res.base64,
        imageType: personType
      }
      defHttp.post({
        url: '/api/zrzy-bdc/bdc/public/saveYwImage',
        data: _data
      }, { withToken: true }).then((res: any) => {
        if (res && res.success) {
          message.success('保存指纹成功!')
        } else {
          message.warning(res?.message || '保存指纹失败!')
        }
      })
    }
  })
}

function getSignature(personType) {
  if (ctx && canvasRef.value) {
    let base64 = canvasRef.value.toDataURL('image/png')
    base64 = base64.replace(/^data:image\/png;base64,/, '');
    let _data: any = {
      slbh: slbh,
      signatureImage: base64,
      imageType: personType
    }
    defHttp.post({
      url: '/api/zrzy-bdc/bdc/public/saveYwImage',
      data: _data
    }, { withToken: true }).then((res: any) => {
      if (res && res.success) {
        message.success('电子签名成功!')
      } else {
        message.warning(res?.message || '电子签名失败!')
      }
    })
  } else {
    message.error('画布元素未找到！绘图失败')
    return false
  }
}

</script>

<style scoped lang="less">
.signature-index {
  width: 100%;
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;

  .signature-tool {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .signature-stroke-tool {
      display: flex;
      align-items: center;

      .signature-erase {
        margin: 0 5px;
        width: 25px;
        height: 25px;
        border: 1px solid #ccc;
        display: flex;
        justify-content: center;
        align-items: center;

        &.active {
          border: 1px solid #1d8ecb;
        }

        &:hover {
          border: 1px dashed #1d8ecb;
        }
      }

      .signature-stroke {
        margin: 0 5px;
        width: 25px;
        height: 25px;
        border: 1px solid #ccc;
        position: relative;

        &.active {
          border: 1px solid #1d8ecb;
        }

        &:hover {
          border: 1px dashed #1d8ecb;
        }

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #000000;
          border-radius: 50%;
        }

        &.signature-stroke-2::before {
          width: 6px;
          height: 6px;
        }

        &.signature-stroke-5::before {
          width: 8px;
          height: 8px;
        }

        &.signature-stroke-8::before {
          width: 12px;
          height: 12px;
        }
      }
    }
  }

  .signature-canvas {
    height: calc(100% - 50px);
    border-top: 1px solid rgb(238, 238, 238);
    width: 100%;

    //&.canvas-erasing {
    //  cursor: url('/@/assets/images/user/erase.png'), auto;
    //}

    canvas {
      border: 1px solid #ccc;
      background: white;
      width: 100%;
      height: 100%;
      touch-action: none;
    }
  }
}
</style>