import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './fonts/simsun-normal.ts'
 
export async function generatePdfByID(title, id, text) {
  let element :any = document.getElementById(id)

  if(element) {
    html2canvas(element, {
      allowTaint: false,
      // taintTest: false,
      logging: false,
      useCORS: true,
      // dpi: window.devicePixelRatio * 4, // 将分辨率提高到特定的DPI 提高四倍
      scale: 4 // 按比例增加分辨率
    }).then((canvas) => {
        // eslint-disable-next-line new-cap
        // var pdf = new jsPDF('l', 'mm', 'a3') // A3纸，横向
        var pdf = new jsPDF('p', 'mm', 'a4') // A4纸，纵向
        var ctx :any = canvas.getContext('2d')
        var a4w = 170; var a4h = 257 // A4大小，210mm x 297mm，四边各保留10mm的边距，显示区域190x277
        // var a4w = 230; var a4h = 400 // A3大小，279mm x 420mm，四边各保留10mm的边距，显示区域259x400
        var imgHeight = Math.floor(a4h * canvas.width / a4w) // 按A4显示比例换算一页图像的像素高度[这个计算方式应该是纵向]
        // var imgHeight = Math.floor(a4w * canvas.width / a4h) // 按A4显示比例换算一页图像的像素高度[这个是横向打印的计算方法]
        var renderedHeight = 0
  
        while (renderedHeight < canvas.height) {
          let page:any = document.createElement('canvas')
          page.width = canvas.width
          console.log(canvas.height , renderedHeight)
          page.height = Math.min(imgHeight, canvas.height - renderedHeight)// 可能内容不足一页
  
          // console.log(canvas.width, Math.min(imgHeight, canvas.height - renderedHeight))
          // console.log(a4w, Math.min(a4h, a4w * page.height / page.width))
  
          // 用getImageData剪裁指定区域，并画到前面创建的canvas对象中
          page.getContext('2d').putImageData(ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)), 0, 0)
          pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 20, 20, a4w, Math.min(a4h, a4w * page.height / page.width)) // 添加图像到页面，保留10mm边距 [a4使用]
          // pdf.addImage(page.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 10, a4w * 1.414, Math.min(a4h, a4w * page.height / page.width) * 1.414) // 添加图像到页面，保留10mm边距[a3使用1.414换算比例]
          
          addWatermark(pdf, 30, a4h - 20, text)

          renderedHeight += imgHeight
          console.log('imgHeight', imgHeight, page.width) // 一页的高度与宽度像素 5146 3404
          // console.log('renderedHeight', renderedHeight)
          // console.log('canvas.height', canvas.height)
          if (renderedHeight < canvas.height) {
            pdf.addPage()// 如果后面还有内容，添加一个空页
          }
        }
        // 保存文件
        pdf.save(title + '.pdf')
    }).catch(err => {
      console.log(err)
    });
  }
}

export function generatePdfByName(title, className, text) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const options = { scale: 1 }; // 提高清晰度

  let elements :any = document.getElementsByClassName(className)

  if (elements.length) {
    elements.forEach(async (element, index) => {
      console.log(element)
      const canvas = await html2canvas(element, options);
      const imgData = canvas.toDataURL('image/png');

      const imgProps= pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
      const pageHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const margin = 20;
      
      pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth, pageHeight);

      addWatermark(pdf, 30, pdf.internal.pageSize.getHeight() - 60, text)

      if(index != elements.length - 1) {
        pdf.addPage(); // 添加新页面
      }
    });
  }

  setTimeout(() => {
    pdf.save(title + '.pdf'); // 保存PDF
  }, 200)
}

export async function generatePdfByHtml(title, id, text = '') {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const element :any = document.getElementsByClassName(id)[0]
  // const element :any = document.getElementById(id)
  // pdf.addFont('Semi.ttf', 'Semi', 'normal')
  // pdf.addFont('ht.ttf', 'ht', 'normal')
  // pdf.addFont('htBold.ttf', 'htBold', 'normal')
  // pdf.addFont('stBold.ttf', 'stBold', 'normal')

  pdf.html(element, {
    callback: async function (pdf) {
      const pageLength = pdf.internal.pages.filter(ele => {
        return !!ele
      }).length // 总页数
      for (let i = 1; i <= pageLength; i++) {
        pdf.setPage(i)
        const footer = `${i} / ${pageLength}`
        addFooter(pdf, 105, 287, footer) // A4大小，210mm x 297mm
        addWatermark(pdf, 30, 230, text)
      }
      await  pdf.save(title + '.pdf')

      const blob = pdf.output('blob'); //可用于文件上传

      console.log('blob', blob)
    },
    margin: [20, 20, 20, 20], //上下左右各20mm
    autoPaging: 'text',
    width: 170, // 宽度170mm 高度 257mm
    windowWidth: 851
  });
}

// 添加水印只有第一页有透明度，后面都没有？
function addWatermark(pdf, watermarkX, watermarkY, text) {
  // 设置水印的字体和颜色
  pdf.setFontSize(90);
  pdf.setTextColor(0, 0, 0, 0.5); // 灰色水印，可以根据需要更改颜色
  pdf.setGState(pdf.GState({opacity: 0.1}))
  pdf.text(text, watermarkX, watermarkY, { angle: 45 });
}

// 添加页脚
function addFooter(pdf, width, height, text) {
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0, 1);
  pdf.setGState(pdf.GState({opacity: 1}))
  pdf.text(text, width, height, { align: 'center' });
}