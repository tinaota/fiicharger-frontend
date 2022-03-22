<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.account') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/member' }">{{ $t('menu.member') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.idTagCode }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <el-table
                    :data="[curRouteParam]"
                    v-loading="isLoading"
                    class="moreCol">
                    <el-table-column prop="idTagCode" :label="$t('userAccount.idTag')" :min-width="2"></el-table-column>
                    <el-table-column prop="company" :label="$t('userAccount.company')" :min-width="2"></el-table-column>
                    <el-table-column prop="staffId" :label="$t('userAccount.userId')" :min-width="2"></el-table-column>
                    <el-table-column prop="staffNameMask" :label="$t('userAccount.userName')" :min-width="2"></el-table-column>
                    <el-table-column prop="emailMask" :label="$t('userAccount.email')" :min-width="3"></el-table-column>
                    <el-table-column prop="fDate" :label="$t('userAccount.createdDate')" :min-width="2"></el-table-column>
            </el-table>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('chargingStation.billingLog')" name="billingLog">
                            <BillingLog :tableData="billingLogData" v-if="!billingLogIsLoading"></BillingLog>
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
export default {
    components: {
        BillingLog
    },
    data() {
        return {
            lang: '',
            curRouteParam: {},
            isLoading: false,
            active: 'billingLog',
            billingLogIsLoading: false,
            billingLogData: []
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.idTagCode) {
            let temp = window.sessionStorage.getItem("fiics-idTagInfo") ? JSON.parse(window.sessionStorage.getItem("fiics-idTagInfo")) : null;
            if (temp && temp.idTagCode) {
                this.curRouteParam = temp;
            } else {
                this.$router.go(-1);
            }
        }
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-idTagInfo");
    },
    mounted() {
        this.fetchBillingData();
    },
    methods: {
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
                setScrollBar('.scroll', this);
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