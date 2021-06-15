<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.userAccount') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/accountList' }">{{ $t('menu.accountList') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.userId + " " + curRouteParam.userName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <el-table
                    :data="tableData"
                    class="moreCol">
                    <el-table-column prop="userId" :label="$t('chargingStation.userID')"></el-table-column>
                    <el-table-column prop="userName" :label="$t('userAccount.userName')"></el-table-column>
                    <el-table-column prop="countryCode" :label="$t('userAccount.countryCode')"></el-table-column>
                    <el-table-column prop="phone" :label="$t('userAccount.phone')" ></el-table-column>
                    <el-table-column prop="email" :label="$t('userAccount.email')" ></el-table-column>
                    <el-table-column prop="thirdPartyVerification" :label="$t('userAccount.thirdPartyVerification')"></el-table-column>
                    <el-table-column prop="carType" :label="$t('userAccount.carType')"></el-table-column>
                    <el-table-column prop="creditCard" :label="$t('userAccount.creditCard')"></el-table-column>
                </el-table>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('chargingStation.billingLog')" name="billingLog">
                            <BillingLog :tableData="billingLogData"></BillingLog>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AccountListDetailData from "@/tmpData/accountListDetailData";
import { setScrollBar } from "@/utils/function";
import BillingLog from "@/components/userAccount/billingLog";
export default {
    components: {
        BillingLog
    },
    data() {
        return {
            curRouteParam: {},
            tableData: [],
            active: 'billingLog',
            billingLogData: []
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.stationId) {
            let temp = window.sessionStorage.getItem("fiics-accountInfo") ? JSON.parse(window.sessionStorage.getItem("fiics-accountInfo")) : null;
            if (temp && temp.userId && temp.userName) {
                this.curRouteParam = temp;
            } else {
                this.$router.go(-1);
            }
        }
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-accountInfo");
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.tableData = AccountListDetailData[this.curRouteParam.userId].data.slice();
            this.billingLogData = AccountListDetailData[this.curRouteParam.userId].billingLog.slice();
            setScrollBar('.scroll', this);
        },
        handleTabClick(tab, event) {},
        changePage(page) {
            this.page = page;
        }
    }
}
</script>
<style lang = "scss" scoped>
.card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .total {
        position: absolute;
        right: 28px;
        bottom: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>