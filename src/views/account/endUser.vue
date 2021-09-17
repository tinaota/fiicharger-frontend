<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.account') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.endUser') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('menu.endUser')" name="endUser">
                        </el-tab-pane>
                        <el-tab-pane :label="$t('userAccount.idTag')" name="idTag">
                        </el-tab-pane>
                    </el-tabs>
                    <EndUser v-if="active === 'endUser'"></EndUser>
                    <IdTag v-else></IdTag>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import EndUser from "@/components/userAccount/endUser";
import IdTag from "@/components/userAccount/idTag";
export default {
    components: {
        EndUser,
        IdTag
    },
    data() {
        return {
            active: 'endUser'
        }
    },
    mounted() {
        setScrollBar('.scroll', this);
    },
    methods: {
        handleTabClick(tab, event) {}
    }
}
</script>