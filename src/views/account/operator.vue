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
            <!-- <div v-else>
                <OperatorSelf></OperatorSelf>
            </div> -->
        </div>
    </div>
</template>

<script>
import SuperUser from "@/components/userAccount/superUser";
// import OperatorSelf from "@/components/userAccount/operatorSelf";
import store from '../../store/store'

export default {
    components: {
        SuperUser,
        // OperatorSelf
    },
    data() {
        return {
            accPermissionType: ''
        }
    },
    created() {
        this.accPermissionType = store?.role
    },
    mounted() {
    },
    methods: {
    }
}
</script>
<style lang = "scss" scoped>
</style>
