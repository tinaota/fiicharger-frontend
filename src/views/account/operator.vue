<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.account') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.operator') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div v-if="accPermissionType !== 3">
                <SuperUser></SuperUser>
            </div>
            <div v-else>
                <OperatorSelf></OperatorSelf>
            </div>
        </div>
    </div>
</template>

<script>
import SuperUser from "@/components/userAccount/superUser";
import OperatorSelf from "@/components/userAccount/operatorSelf";
export default {
    components: {
        SuperUser,
        OperatorSelf
    },
    data() {
        return {
            accPermissionType: ''
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.accPermissionType = userData.accountInfo.accPermissionType;
    },
    mounted() {
    },
    methods: {
    }
}
</script>
<style lang = "scss" scoped>
</style>