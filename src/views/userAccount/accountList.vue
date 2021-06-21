<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.userAccount') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.accountList') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-input
                        :placeholder="$t('chargingStation.userID')+'/'+$t('userAccount.userName')"
                        class="dark"
                        v-model="filter.tmpSearch"
                        @keyup.enter.native="fetchData('s')">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    v-loading="isLoading"
                    class="moreCol">
                    <el-table-column prop="memberCode" :label="$t('chargingStation.userID')"></el-table-column>
                    <el-table-column prop="memberName" :label="$t('userAccount.userName')"></el-table-column>
                    <el-table-column prop="countryCode" :label="$t('userAccount.countryCode')"></el-table-column>
                    <el-table-column prop="cellphone" :label="$t('userAccount.phone')" ></el-table-column>
                    <el-table-column :label="$t('userAccount.thirdPartyVerification')">
                        <template slot-scope="scope">
                            <span v-for="(type, idx) in scope.row.loginType" :key="type">{{ type }} <br v-if="idx+1 !== scope.row.loginType.length"/></span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.action')" :width="200">
                        <template slot-scope="scope">
                            <el-button @click="handleAccountDetail(scope.row.memberCode, scope.row.memberName)">{{ $t('general.detail') }}</el-button>
                            <el-button @click="deleteAccount(scope.row.memberCode)">{{ $t('general.delete') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total})}}</div>
                <el-pagination background layout="prev, pager, next"
                    :total="total"
                    :pager-count="5"
                    :page-size="10"
                    :current-page.sync="page"
                    @current-change="changePage">
                </el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import { $HTTP_getAccountList, $HTTP_deleteAccount } from "@/api/api";
export default {
    data() {
        return {
            filter: {
                tmpSearch: '',
                search: ''
            },
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let param = {};
            if (type) {
                this.filter.search = this.filter.tmpSearch;
            }
            param.search = this.filter.search;
            $HTTP_getAccountList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.accountList.slice();
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                setScrollBar('.scroll', this);
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        },
        handleAccountDetail(id, name) {
            const data = {
                memberCode: id,
                memberName: name
            }
            window.sessionStorage.setItem('fiics-accountInfo', JSON.stringify(data));
            this.$router.push({ name: "accountListDetail", params: data }).catch();
        },
        deleteAccount(id) {
            this.tableData = this.tableData.filter(item => item.memberCode !== id);
            this.total = this.tableData.length;
            const that = this;
            this.$confirm(i18n.t('general.deleteItem', { item: id }), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'dark',
                // confirmButtonText: i18n.t('btn.ok'),
                // cancelButtonText: i18n.t('btn.cancel')
            }).then(() => {
                $HTTP_deleteAccount({memberCode: id}).then(data => {
                    if (!!data.success) {
                        that.$message({ type: "success", message: i18n.t('general.sucDelMsg')});
                        that.fetchData();
                    } else {
                        that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                    }
                });
            });
        },
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