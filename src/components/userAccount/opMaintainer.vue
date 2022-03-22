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
                <el-table-column prop="omLoginId" :label="$t('userAccount.loginId')" :min-width="2"></el-table-column>
                <el-table-column prop="operatorMaintainerName" :label="$t('general.name')" :min-width="2"></el-table-column>
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
                        <el-button class="no-bg i" icon="el-icon-lock" @click="openPwdDialog(scope.row.operatorMaintainerId)"></el-button>
                        <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                        <el-button class="no-bg delete" @click="deleteEvent(scope.row.operatorMaintainerId, scope.row.omLoginId)"></el-button>
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
                    <el-input v-model="dialog.info.omLoginId" :disabled="dialog.type===1"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('general.name') }}</div>
                    <el-input v-model="dialog.info.operatorMaintainerName"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.countryCode') }}</div>
                    <el-select
                        class="select-small"
                        v-model="dialog.info.countryCode"
                        v-loading="countryCodeList.length===0" >
                        <el-option v-for="(item, idx) in countryCodeList" :label="item.countryCode+' ('+item.countryName+')'" :key="idx" :value="item.countryCode"></el-option>
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
import { $HTTP_getOperatorMaintainerList, $HTTP_addOperatorMaintainer, $HTTP_updateOperatorMaintainer, $HTTP_deleteOperatorMaintainer } from "@/api/api";
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import ChangePwd from "@/components/userAccount/changePwd"
export default {
    components: {
        ChangePwd
    },
    props: {
        countryCodeList: {
            type: Array,
            default: () => {
                return [];
            }
        }
    },
    data() {
        return {
            lang: '',
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            dialog: {
                visible: false,
                isLoading: false,
                type: 0,
                info: {
                    // omLoginId: '',
                    operatorMaintainerName: '',
                    countryCode: '',
                    phone: '',
                    email: '',
                    // password: '',
                    // confirmPassword: '',
                    // operatorMaintainerId: '',
                    // fDate: '',
                    // eDate: '',
                }
            },
            pwdDialog: {
                id: '',
                name: 'operatorMaintainerId',
                show: false
            }
        }
    },
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            const that = this;
            $HTTP_getOperatorMaintainerList().then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.operatorMaintainerList.map(item => {
                        item.eDate = transformUtcToLocTime(item.eDate);
                        item.fDate = transformUtcToLocTime(item.fDate);
                        return item;
                    });
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
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            if (!type) {
                this.dialog.info = {
                                    omLoginId: '',
                                    operatorMaintainerName: '',
                                    countryCode: '',
                                    phone: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                };
                this.dialog.$Api = $HTTP_addOperatorMaintainer;
            } else {
                this.dialog.info = {
                                    omLoginId: data.omLoginId,
                                    operatorMaintainerId: data.operatorMaintainerId,
                                    operatorMaintainerName: data.operatorMaintainerName,
                                    countryCode: data.countryCode,
                                    phone: data.phone,
                                    email: data.email,
                                    fDate: data.fDate,
                                    eDate: data.eDate
                                };
                this.dialog.$Api = $HTTP_updateOperatorMaintainer;
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
                            operatorMaintainerName: this.dialog.info.operatorMaintainerName,
                            countryCode: this.dialog.info.countryCode,
                            phone: this.dialog.info.phone,
                            email: this.dialog.info.email
                        };
            if (this.dialog.type) {
                params.operatorMaintainerId = this.dialog.info.operatorMaintainerId;
            } else {
                params.omLoginId = this.dialog.info.omLoginId;
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
                $HTTP_deleteOperatorMaintainer({operatorMaintainerId: id}).then(data => {
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