<template>
    <div class="downloadPdf">
        <el-button size="small" type="primary" v-loading="true" disabled>{{ $t(`general.downloadPDF`) }}</el-button>
    </div>
</template>

<style lang="scss" scoped>
.downloadPdf {
    margin-left: 5px;
    .el-button {
        background: #0263ff !important;
        color: #fff;
        border: unset;
        font-size: 1rem;
        width: 130px !important;
        height: 40px;
        border-radius: 6px;
        text-align: center;
        margin-left: 5px;
        padding: 0;
    }
}
</style>
