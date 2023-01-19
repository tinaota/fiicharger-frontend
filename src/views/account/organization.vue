<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.account') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.organization') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="organization">
                <SuperOrganization></SuperOrganization>
            </div>
        </div>
    </div>
</template>

<script>
import SuperOrganization from "@/components/userAccount/superOrganization";
export default {
    components: { SuperOrganization },
    data() {
        return {};
    },
    created() {
        // get roles to separate organization
    },
    mounted() {},
    methods: {}
};
</script>
<style lang = "scss" scoped>
.organization {
    width: 100%;
    height: 100%;
}
</style>
