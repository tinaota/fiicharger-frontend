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
                        @keyup.enter.native="handleSearch()">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol">
                    <el-table-column prop="userId" :label="$t('chargingStation.userID')"></el-table-column>
                    <el-table-column prop="userName" :label="$t('userAccount.userName')"></el-table-column>
                    <el-table-column prop="countryCode" :label="$t('userAccount.countryCode')"></el-table-column>
                    <el-table-column prop="phone" :label="$t('userAccount.phone')" ></el-table-column>
                    <el-table-column prop="thirdPartyVerification" :label="$t('userAccount.thirdPartyVerification')"></el-table-column>
                    <el-table-column :label="$t('general.action')" :width="200">
                        <template slot-scope="scope">
                            <el-button @click="handleAccountDetail(scope.row.userId, scope.row.userName)">{{ $t('general.detail') }}</el-button>
                            <el-button @click="deleteAccount(scope.row.userId)">{{ $t('general.delete') }}</el-button>
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
import AccountListData from "@/tmpData/accountListData";
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            filter: {
                tmpSearch: '',
                search: ''
            },
            tableData: [],
            page: 1,
            total: 0
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.tableData = AccountListData.accountList.slice();
            this.page = 1;
            this.total = this.tableData.length;
            setScrollBar('.scroll', this);
        },
        handleSearch() {
            this.filter.search = this.filter.tmpSearch;
            this.page = 1;
            if (this.filter.search) {
                this.tableData = [];
                this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
                this.tableData = AccountListData.accountList.filter(this.createFilter(this.filter.search));
                this.total = this.tableData.length;
                setScrollBar('.scroll', this);
            } else {
                this.fetchData();
            }
        },
        createFilter(queryString) {
            return (item) => {
                return (item.userId.toLowerCase().indexOf(queryString.toLowerCase()) >= 0)
                    || (item.userName.toLowerCase().indexOf(queryString.toLowerCase()) >= 0)
            };
        },
        changePage(page) {
            this.page = page;
        },
        handleAccountDetail(id, name) {
            const data = {
                userId: id,
                userName: name
            }
            window.sessionStorage.setItem('fiics-accountInfo', JSON.stringify(data));
            this.$router.push({ name: "accountListDetail", params: data }).catch();
        },
        deleteAccount(id) {
            this.tableData = this.tableData.filter(item => item.userId !== id);
            this.total = this.tableData.length;
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