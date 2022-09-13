<template>
    <div class="mainctrl location">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ $t('menu.analytics') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('menu.overview') }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="analytics" id="analytics">
            <iframe :src="source"></iframe>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            source: ""
        };
    },
    mounted() {
        this.source = "/ai-dashboard";
    }
};
</script>

<style scoped>
.mainctrl{
    height: 100%;
}
#analytics,
#analytics iframe {
    height: inherit;
    width: 100%;
    border: none;
    box-sizing: border-box;
}
</style>
