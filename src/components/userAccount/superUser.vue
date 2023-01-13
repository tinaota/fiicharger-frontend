<template>
    <div class="card-8 table-result">
        <div class="tabs-contain">
            <el-tabs v-model="active" @tab-click="handleTabClick">
                <el-tab-pane :label="$t('general.user')" name="users"></el-tab-pane>
                <!-- <el-tab-pane :label="$t('userAccount.maintainer')" name="maintainer"></el-tab-pane>
                <el-tab-pane :label="$t('userAccount.customerServices')" name="customerServices"></el-tab-pane> -->
            </el-tabs>
            <Users v-if="active === 'users'"></Users>
            <!-- <Maintainer v-else-if="active === 'maintainer'"></Maintainer>
            <CustomerServices v-else-if="active === 'customerServices'"></CustomerServices> -->
        </div>
    </div>
</template>

<script>
import Users from "@/components/userAccount/users";
// import Maintainer from "@/components/userAccount/maintainer";
// import CustomerServices from "@/components/userAccount/customerServices";
export default {
    components: {
        Users,
        // Maintainer,
        // CustomerServices
    },
    data() {
        return {
            active: 'users'
        }
    },
    mounted() {
    },
    methods: {
        handleTabClick(tab, event) {}
    }
}
</script>
