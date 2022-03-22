<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.account') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/member' }">{{ $t('menu.member') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.memberCode + " " + curRouteParam.memberName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <el-table
                    :data="tableData"
                    v-loading="isLoading"
                    class="moreCol">
                    <el-table-column prop="memberCode" :label="$t('chargingStation.userID')" :min-width="2"></el-table-column>
                    <el-table-column prop="memberName" :label="$t('userAccount.memberName')" :min-width="2"></el-table-column>
                    <el-table-column prop="countryCode" :label="$t('userAccount.countryCode')" :min-width="2"></el-table-column>
                    <el-table-column prop="cellphone" :label="$t('userAccount.phone')" :min-width="2"></el-table-column>
                    <el-table-column prop="email" :label="$t('userAccount.email')" :min-width="3">
                        <template slot-scope="scope">
                            <span v-for="(email, idx) in scope.row.email" :key="email">{{ email }} <br v-if="idx+1 !== scope.row.email.length"/></span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('userAccount.thirdPartyVerification')" :min-width="2">
                        <template slot-scope="scope">
                            <span v-for="(type, idx) in scope.row.loginType" :key="type">{{ type }} <br v-if="idx+1 !== scope.row.loginType.length"/></span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="carBrand" :label="$t('userAccount.carType')" :min-width="2"></el-table-column>
                    <el-table-column prop="creditCard" :label="$t('userAccount.creditCard')" :min-width="2"></el-table-column>
                </el-table>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('chargingStation.billingLog')" name="billingLog">
                            <BillingLog :tableData="billingLogData" v-if="!billingLogIsLoading"></BillingLog>
                        </el-tab-pane>
                        <el-tab-pane :label="$t('userAccount.reviewSummary')" name="review">
                            <Review :memberCode="curRouteParam.memberCode"></Review>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { $HTTP_getAccountInfo, $HTTP_getBillingList } from "@/api/api";
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import BillingLog from "@/components/userAccount/billingLog";
import Review from "@/components/userAccount/review";
export default {
    components: {
        BillingLog,
        Review
    },
    data() {
        return {
            lang: '',
            curRouteParam: {},
            tableData: [],
            isLoading: false,
            active: 'billingLog',
            billingLogIsLoading: false,
            billingLogData: []
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.memberCode) {
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
        setScrollBar('.scroll', this);
        this.fetchData();
        this.fetchBillingData();
    },
    methods: {
        fetchData() {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            $HTTP_getAccountInfo({ memberCode: this.curRouteParam.memberCode }).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = [Object.assign({}, data.accountInfo)];
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchBillingData() {
            const that = this;
            this.page = 1;
            this.billingLogIsLoading = true;
            let param = {
                lang: this.lang,
                search: this.curRouteParam.memberCode
            };
            $HTTP_getBillingList(param).then((data) => {
                this.billingLogIsLoading = false;
                if (!!data.success) {
                    this.billingLogData = data.billingList.map(item => {
                        item.sDate = transformUtcToLocTime(item.sDate);
                        item.sessionInfo.chargingStartTime = transformUtcToLocTime(item.sessionInfo.chargingStartTime);
                        item.sessionInfo.chargingEndTime = transformUtcToLocTime(item.sessionInfo.chargingEndTime);
                        return item;
                    });
                } else {
                    this.billingLogData = [];
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.billingLogData = [];
                console.log('billing log', err)
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