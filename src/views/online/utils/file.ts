// 导入导出
import { h } from "vue";
import { defHttp } from "/@/utils/http/axios";
import { Modal, message, notification } from "ant-design-vue";
import { formatToDateTime } from "./dateUtil";
enum Api {
    exportJson = '/api/zrzy-form/export/exportJson',
    importJson = '/api/zrzy-form/export/importJson'
}
// 自定义上传
export const importJson = (fileList: any, params: any, callback: any) => {
    if (fileList.length == 0) {
        message.error('请选择文件')
        return;
    }
    const fileData = new FormData()
    fileList.forEach((ele: any) => {
        fileData.append(`files`, ele.originFileObj);
    })
    defHttp.post(
        {
            url: Api.importJson,
            data: fileData,
            params: params,
            headers: { "Content-Type": "multipart/form-data" },
        },
        { withToken: true }
    ).then((res: any) => {
        if (res.success) {
            notification.info({
                message: '导入成功',
                description: highlightMessage(res.message),
                placement: 'topRight',
                duration: 5,
            });
            if (res.result > 0) {
                if (typeof callback == 'function') {
                    callback()
                }
            }
        } else {
            if (res.result) {
                Modal.confirm({
                    title: res?.message,
                    okText: '确定',
                    okType: 'danger',
                    cancelText: '取消',
                    onOk() {
                        params.isOk = true
                        importJson(fileList, params, callback)
                    },
                    onCancel() {
                    },
                });
            } else {
                message.error("导入失败")
            }
        }
    })
};
/**
 * 导出json
 */
export function exprotJson(params: any, title: string, url?: string) {
    defHttp.get({ url: url || Api.exportJson, params: params, responseType: "blob" }, { withToken: true }).then((res) => {
        title = title + formatToDateTime(new Date().getTime())
        const fileName = title + '.json'; //文件名
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(res);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);

    }).catch(err => {
        console.info(err)
    })
}
// 动态生成 description，标红数字
function highlightMessage(msg) {
    const description = h('div', [
        msg.split(/(\d+)/).map((part, index) =>
            /^\d+$/.test(part) ? ( // 判断是否是数字
                h('span', { style: { color: 'red', fontWeight: '600' }, key: index }, part)
            ) : (
                h('span', { key: index }, part)
            ),
        )]);
    return description;
}