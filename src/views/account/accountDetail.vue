<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.account') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/endUser' }">{{ $t('menu.endUser') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.memberCode + " " + curRouteParam.memberName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <el-table
                    :data="tableData"
                    v-loading="isLoading"
                    class="moreCol">
                    <el-table-column prop="memberCode" :label="$t('chargingStation.userID')"></el-table-column>
                    <el-table-column prop="memberName" :label="$t('userAccount.userName')"></el-table-column>
                    <el-table-column prop="countryCode" :label="$t('userAccount.countryCode')"></el-table-column>
                    <el-table-column prop="cellphone" :label="$t('userAccount.phone')" ></el-table-column>
                    <el-table-column prop="email" :label="$t('userAccount.email')" >
                        <template slot-scope="scope">
                            <span v-for="(email, idx) in scope.row.email" :key="email">{{ email }} <br v-if="idx+1 !== scope.row.email.length"/></span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('userAccount.thirdPartyVerification')">
                        <template slot-scope="scope">
                            <span v-for="(type, idx) in scope.row.loginType" :key="type">{{ type }} <br v-if="idx+1 !== scope.row.loginType.length"/></span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="carBrand" :label="$t('userAccount.carType')"></el-table-column>
                    <el-table-column prop="creditCard" :label="$t('userAccount.creditCard')"></el-table-column>
                </el-table>
                <div class="tabs-contain" v-if="!isLoading">
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
import { $HTTP_getAccountInfo } from "@/api/api";
export default {
    components: {
        BillingLog
    },
    data() {
        return {
            lang: '',
            curRouteParam: {},
            tableData: [],
            isLoading: false,
            active: 'billingLog',
            billingLogData: []
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.stationId) {
            let temp = window.sessionStorage.getItem("fiics-accountInfo") ? JSON.parse(window.sessionStorage.getItem("fiics-accountInfo")) : null;
            if (temp && temp.memberCode && temp.memberName) {
                this.curRouteParam = temp;
            } else {
                this.$router.go(-1);
            }
        }
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-accountInfo");
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            $HTTP_getAccountInfo({ memberCode: this.curRouteParam.memberCode }).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = [Object.assign({}, data.accountInfo)];
                    this.billingLogData = AccountListDetailData[this.curRouteParam.memberCode].billingLog.slice();
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.billingLogData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                setScrollBar('.scroll', this);
            }).catch((err) => {
                this.tableData = [];
                this.billingLogData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
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