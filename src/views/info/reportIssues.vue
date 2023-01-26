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
            userEmail = "",
            phoneNumber = "";
        if (userInfo) {
            userName = userInfo.firstName + " " + userInfo.lastName;
            userEmail = userInfo.email + "";
            phoneNumber = userInfo.phoneNumber;
        }
        this.source = `https://www.evucharging.com/${
            process.env.NODE_ENV === "production"
                ? "platform-support-form"
                : "platform-support-test"
        }?userName=${userName}&email=${userEmail}&phone=${encodeURIComponent(phoneNumber)}`;
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
