<template>
    <div class="card-8 table-result">
        <div class="tabs-contain">
            <el-tabs v-model="active" @tab-click="handleTabClick">
                <el-tab-pane :label="$t('general.operator')" name="operators"></el-tab-pane>
                <el-tab-pane :label="$t('userAccount.maintainer')" name="maintainer"></el-tab-pane>
                <el-tab-pane :label="$t('userAccount.customerServices')" name="customerServices"></el-tab-pane>
            </el-tabs>
            <Operators v-if="active === 'operators'"></Operators>
            <Maintainer v-else-if="active === 'maintainer'"></Maintainer>
            <CustomerServices v-else-if="active === 'customerServices'"></CustomerServices>
        </div>
    </div>
</template>

<script>
import Operators from "@/components/userAccount/operators";
import Maintainer from "@/components/userAccount/maintainer";
import CustomerServices from "@/components/userAccount/customerServices";
export default {
    components: {
        Operators,
        Maintainer,
        CustomerServices
    },
    data() {
        return {
            active: 'operators'
        }
    },
    mounted() {
    },
    methods: {
        handleTabClick(tab, event) {}
    }
}
</script>