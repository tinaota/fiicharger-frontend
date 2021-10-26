<template>
    <div class="maintainer">
        <div class="container">
            <div class="filter">
                <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
            </div>
            <el-table
                :data="tableData.slice((page - 1) * 10, page * 10)"
                class="moreCol"
                v-loading="isLoading">
                <el-table-column prop="csLoginId" :label="$t('userAccount.loginId')" :min-width="2"></el-table-column>
                <el-table-column prop="customerServiceName" :label="$t('general.name')" :min-width="2"></el-table-column>
                <el-table-column :label="$t('userAccount.mobile')" :min-width="3">
                    <template slot-scope="scope">
                        {{ scope.row.countryCode + " " + scope.row.phone }}
                    </template>
                </el-table-column>
                <el-table-column prop="email" :label="$t('userAccount.email')" :min-width="4"></el-table-column>
                <el-table-column prop="fDate" :label="$t('userAccount.createdDate')" :min-width="3"></el-table-column>
                <el-table-column prop="eDate" :label="$t('general.latestModification')" :min-width="3"></el-table-column>
                <el-table-column :label="$t('general.action')" :width="140">
                    <template slot-scope="scope">
                        <el-button class="no-bg i" icon="el-icon-lock" @click="openPwdDialog(scope.row.customerServiceId)"></el-button>
                        <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                        <el-button class="no-bg delete" @click="deleteEvent(scope.row.customerServiceId, scope.row.csLoginId)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="total">{{ $t("general.result", {item:total}) }}</div>
            <el-pagination background layout="prev, pager, next"
                :total="total"
                :pager-count="5"
                :page-size="10"
                :current-page.sync="page"
                @current-change="changePage">
            </el-pagination>
        </div>
        <el-dialog
            :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')"
            width="600px"
            :visible.sync="dialog.visible"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            @close="closeDialog(true)"
            v-loading="dialog.isLoading">
            <div class="vertial formVertical">
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.loginId') }}</div>
                    <el-input v-model="dialog.info.csLoginId" :disabled="dialog.type===1"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('general.name') }}</div>
                    <el-input v-model="dialog.info.customerServiceName"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.countryCode') }}</div>
                    <el-select
                        class="select-small"
                        v-model="dialog.info.countryCode"
                        v-loading="countryCode.isLoading" >
                        <el-option v-for="(item, idx) in countryCode.data" :label="item.countryCode+' ('+item.countryName+')'" :key="idx" :value="item.countryCode"></el-option>
                    </el-select>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.mobile') }}</div>
                    <el-input v-model="dialog.info.phone"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.email') }}</div>
                    <el-input v-model="dialog.info.email"></el-input>
                </div>
                <div class="form-item" v-if="!dialog.type">
                    <div class="label">{{ $t('login.pwd') }}</div>
                    <el-input v-model="dialog.info.password" type="password"></el-input>
                </div>
                <div class="form-item" v-if="!dialog.type">
                    <div class="label">{{ $t('userAccount.cmfPwd') }}</div>
                    <el-input v-model="dialog.info.confirmPassword" type="password"></el-input>
                </div>
                <div class="form-item" v-if="dialog.type">
                    <div class="label">{{ $t('userAccount.createdDate') }}</div>
                    <el-input v-model="dialog.info.fDate" disabled></el-input>
                </div>
                <div class="form-item" v-if="dialog.type">
                    <div class="label">{{ $t('general.latestModification') }}</div>
                    <el-input v-model="dialog.info.eDate" disabled></el-input>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                <el-button size="small" type="primary" @click="updateData">{{ $t('general.ok') }}</el-button>
            </span>
        </el-dialog>
        <ChangePwd :show="pwdDialog.show" :name="pwdDialog.name" :id="pwdDialog.id" @close="closeDialog(false)"></ChangePwd>
    </div>
</template>

<script>
import { $HTTP_getCountryCodeSelectList, $HTTP_getCustomerServiceList, $HTTP_addCustomerService, $HTTP_updateCustomerService, $HTTP_deleteCustomerService } from "@/api/api";
import { setScrollBar } from "@/utils/function";
import ChangePwd from "@/components/userAccount/changePwd"
export default {
    components: {
        ChangePwd
    },
    data() {
        return {
            lang: '',
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            countryCode: {
                isLoading: false,
                data: []
            },
            dialog: {
                visible: false,
                isLoading: false,
                type: 0,
                info: {
                    // csLoginId: '',
                    customerServiceName: '',
                    countryCode: '',
                    phone: '',
                    email: '',
                    // password: '',
                    // confirmPassword: '',
                    // customerServiceId: '',
                    // fDate: '',
                    // eDate: '',
                }
            },
            pwdDialog: {
                id: '',
                name: 'customerServiceId',
                show: false
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        setScrollBar('.scroll', this);
        this.fetchData();
        this.fetchCountryCodeList();
    },
    methods: {
        fetchData() {
            const that = this;
            $HTTP_getCustomerServiceList().then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.customerServiceList.slice();
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
        fetchCountryCodeList() {
            const that = this;
            this.countryCode.isLoading = true;
            $HTTP_getCountryCodeSelectList({lang: that.lang}).then((data) => {
                this.countryCode.isLoading = false;
                if (!!data.success) {
                    this.countryCode.data = data.countryCodeList.slice();
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('countryCode', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            if (!type) {
                this.dialog.info = {
                                    csLoginId: '',
                                    customerServiceName: '',
                                    countryCode: '',
                                    phone: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                };
                this.dialog.$Api = $HTTP_addCustomerService;
            } else {
                this.dialog.info = {
                                    csLoginId: data.csLoginId,
                                    customerServiceId: data.customerServiceId,
                                    customerServiceName: data.customerServiceName,
                                    countryCode: data.countryCode,
                                    phone: data.phone,
                                    email: data.email,
                                    fDate: data.fDate,
                                    eDate: data.eDate
                                };
                this.dialog.$Api = $HTTP_updateCustomerService;
            }
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar('destroy');
            that.$nextTick(() => {
                setScrollBar('.formVertical', this);
            });
        },
        updateData() {
            const that = this;
            let params = {
                            customerServiceName: this.dialog.info.customerServiceName,
                            countryCode: this.dialog.info.countryCode,
                            phone: this.dialog.info.phone,
                            email: this.dialog.info.email
                        };
            if (this.dialog.type) {
                params.customerServiceId = this.dialog.info.customerServiceId;
            } else {
                params.csLoginId = this.dialog.info.csLoginId;
                params.password = this.dialog.info.password;
                params.confirmPassword = this.dialog.info.confirmPassword;
            }
            that.dialog.isLoading = true;
            that.dialog.$Api(params).then(data => {
                that.dialog.isLoading = false;
                if (!!data.success) {
                    that.$message({type: 'success', message: i18n.t('general.sucUpdateMsg') });
                    that.fetchData();
                    that.dialog.visible = false;
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        closeDialog(isEdit) {
            if(!isEdit) {
                this.pwdDialog.show = false;
            }
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        openPwdDialog(id) {
            this.pwdDialog.id = id;
            this.pwdDialog.show = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        deleteEvent(id, loginId) {
            const that = this;
            this.$confirm(i18n.t('general.deleteItem', { item: loginId }), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'custom'
            }).then(() => {
                $HTTP_deleteCustomerService({customerServiceId: id}).then(data => {
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
.maintainer .container {
    position: relative;
    .filter {
        margin-bottom: 0;
    }
    .total {
        position: absolute;
        right: 28px;
        bottom: 0px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>