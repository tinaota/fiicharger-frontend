<template>
    <div class="mainctrl">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ $t('menu.reportIssues') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('menu.overview') }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="reportIssues" id="reportIssues">
            <iframe :src="source" scrolling="no"></iframe>
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
        let userInfo = JSON.parse(localStorage.getItem("fiics-user")) || null;
        let userName = "",
            userEmail = "";
        if (userInfo) {
            userName = userInfo.firstName + " " + userInfo.lastName;
            userEmail = userInfo.email;
        }
        this.source = `http://207.110.228.24:8080/platform-support-form?userName=${userName}&email=${userEmail}`;
    }
};
</script>

<style scoped lang="scss">
.mainctrl {
    height: 98%;
    .el-breadcrumb {
        margin-bottom: 0;
    }
}
#reportIssues,
#reportIssues iframe {
    height: inherit;
    width: 100%;
    border: none;
    box-sizing: border-box;
}
</style>
