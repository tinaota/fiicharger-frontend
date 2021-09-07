<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.report') }}</el-breadcrumb-item>
                </el-breadcrumb>
            <div class="card-8 report">
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('menu.usagePatterns')" name="usagePatterns">
                        </el-tab-pane>
                        <el-tab-pane :label="$t('menu.pluggedNotCharging')" name="pluggedNotCharging">
                        </el-tab-pane>
                    </el-tabs>
                    <UsagePatterns v-if="active === 'usagePatterns'"></UsagePatterns>
                    <PluggedNotCharging v-else></PluggedNotCharging>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import UsagePatterns from "@/components/info/usagePatterns";
import PluggedNotCharging from "@/components/info/pluggedNotCharging";
export default {
    components: {
        UsagePatterns,
        PluggedNotCharging
    },
    data() {
        return {
            active: 'usagePatterns'
        }
    },
    created() {
    },
    mounted() {
        setScrollBar('.scroll', this);
    },
    methods: {
        handleTabClick(tab, event) {}
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
}
</style>