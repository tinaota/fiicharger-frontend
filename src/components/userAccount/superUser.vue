<template>
    <div class="card-8 table-result">
        <div class="tabs-contain">
            <el-tabs v-model="active" @tab-click="handleTabClick">
                <el-tab-pane :label="$t('general.operator')" name="operators"></el-tab-pane>
                <!-- <el-tab-pane :label="$t('userAccount.idTag')" name="idTag"></el-tab-pane> -->
            </el-tabs>
            <Operators v-if="active === 'operators'"></Operators>
            <!-- <IdTag v-else-if="active === 'idTag'"></IdTag> -->
        </div>
    </div>
</template>

<script>
import Operators from "@/components/userAccount/operators";
import IdTag from "@/components/userAccount/idTag";
export default {
    components: {
        Operators,
        IdTag
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