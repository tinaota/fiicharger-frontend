<template>
    <div class="tab">
        <div class="filter">
            <el-input
                :placeholder="$t('chargingStation.userID')+' / '+$t('general.name')"
                class="dark"
                v-model="filter.tmpSearch"
                @change="fetchData('s')"
                clearable>
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
        </div>
        <el-table
            :data="tableData.slice((page - 1) * 10, page * 10)"
            v-loading="isLoading"
            class="moreCol enable-row-click"
            @row-click="handleRowClick">
            <el-table-column prop="memberCode" :label="$t('chargingStation.userID')"></el-table-column>
            <el-table-column prop="memberName" :label="$t('userAccount.memberName')"></el-table-column>
            <el-table-column prop="countryCode" :label="$t('userAccount.countryCode')"></el-table-column>
            <el-table-column prop="cellphone" :label="$t('userAccount.phone')" ></el-table-column>
            <el-table-column :label="$t('userAccount.thirdPartyVerification')">
                <template slot-scope="scope">
                    <span v-for="(type, idx) in scope.row.loginType" :key="type">{{ type }} <br v-if="idx+1 !== scope.row.loginType.length"/></span>
                </template>
            </el-table-column>
            <el-table-column :label="$t('general.action')" :width="65">
                <template slot-scope="scope">
                    <el-button class="no-bg delete" @click="deleteAccount(scope.row.memberCode)"></el-button>
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
</template>

<script>
import { $HTTP_getAccountList, $HTTP_deleteAccount } from "@/api/api";
export default {
    data() {
        return {
            lang: '',
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
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
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
        handleRowClick(row, column, event) {
            if ($(event.path[0]).attr('class')!==undefined && $(event.path[0]).attr('class').includes('cell')) {
                const data = {
                    memberCode: row.memberCode,
                    memberName: row.memberName
                }
                window.sessionStorage.setItem('fiics-accountInfo', JSON.stringify(data));
                this.$router.push({ name: "accountDetail", params: data }).catch();
            }
        },
        deleteAccount(id) {
            const that = this;
            this.$confirm(i18n.t('general.deleteItem', { item: id }), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'custom'
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
        right: 48px;
        bottom: 58px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>