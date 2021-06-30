<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.support') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.workOrder') }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            filter: {
                tmpSearch: '',
                search: '',
                dateRange: [],
            },
            tableData: [],
            page: 1,
            total: 0
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            setScrollBar('.scroll', this);
        },
        changePage(page) {
        }
    }
}
</script>
<style lang = "scss" scoped>
</style>