<template>
    <div class="card-8 table-result">
        <div class="tabs-contain">
            <el-tabs v-model="active" @tab-click="handleTabClick">
                <el-tab-pane :label="$t('general.user')" name="users"></el-tab-pane>
            </el-tabs>
            <Users v-if="active === 'users'"></Users>
        </div>
    </div>
</template>

<script>
import Users from "@/components/userAccount/users";
export default {
    components: {
        Users
    },
    data() {
        return {
            active: "users"
        };
    },
    mounted() {},
    methods: {
        handleTabClick(tab, event) {}
    }
};
</script>
