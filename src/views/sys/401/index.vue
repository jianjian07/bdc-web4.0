<template>
    <div class="errPage-container" style="margin-top: 150px;">
        <a-row>
            <a-col :span="6"></a-col>
            <a-col :span="6">
                <h1 class="text-jumbo text-ginormous">未授权!</h1>
                <h2 class="txt-color">您没有系统权限</h2>

                <h3 class="txt-color">请联系运维人员或市场人员！</h3>

            </a-col>
            <a-col :span="6">
                <img :src="no" width="313" height="428">
            </a-col>
            <a-col :span="6"></a-col>
        </a-row>
    </div>
</template>

<script lang="ts" setup>
import { getImageUrl } from '/@/utils';
import no from '/@/assets/images/sys/401.png'
</script>

<style lang="less" scoped>
.errPage-container {
    background-color: #fff;
    max-width: 100%;
    height: 100vh;

    .pan-back-btn {
        background: #008489;
        color: #fff;
        border: none !important;
    }

    .pan-gif {
        margin: 0 auto;
        display: block;
    }

    .pan-img {
        display: block;
        margin: 0 auto;
        width: 100%;
    }

    .text-jumbo {
        font-size: 60px;
        font-weight: 700;
        color: #484848;
    }

    .list-unstyled {
        font-size: 14px;

        li {
            padding-bottom: 5px;
        }

        a {
            color: #008489;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .txt-color {
        color: #000;
    }
}
</style>
