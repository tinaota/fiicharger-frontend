<template>
    <div class="operator">
        <div class="container">
            <div class="filter">
                <el-select
                    class="select-small"
                    :placeholder="$t('general.operator')"
                    v-model="filter.operatorTypeId"
                    @change="fetchData()">
                    <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                </el-select>
                <el-input
                    :placeholder="$t('userAccount.email')"
                    v-model="filter.tmpEmail"
                    @change="fetchData('e')"
                    clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-input
                    :placeholder="$t('userAccount.contactPerson')"
                    v-model="filter.tmpContactPersion"
                    @change="fetchData('c')"
                    clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
            </div>
            <el-table
                :data="tableData.slice((page - 1) * 10, page * 10)"
                class="moreCol"
                v-loading="isLoading">
                <el-table-column :label="$t('userAccount.operatorName')" :min-width="3">
                    <template slot-scope="scope">
                         {{clientName(scope.row)}}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('userAccount.logo')" :min-width="3">
                    <template slot-scope="scope">
                        <img :src="scope.row.picture" class="logo" v-bind:style="{maxHeight: '50px',maxWidth:'50px'}">
                    </template>
                </el-table-column>

                <el-table-column :label="$t('userAccount.mobile')" :min-width="3">
                    <template slot-scope="scope">
                        {{ scope.row.phoneNumber ? scope.row.phoneNumber : '' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('userAccount.mobileVerification')" :min-width="2">
                    <template slot-scope="scope">
                        {{convertBooleanToString(scope.row.phoneNumberConfirmed)}}
                    </template>
                </el-table-column>

                <el-table-column prop="email" :label="$t('userAccount.email')" :min-width="4"></el-table-column>
                <el-table-column prop="emailConfirmed" :label="$t('userAccount.emailVerification')" :min-width="2">
                    <template slot-scope="scope">
                        {{convertBooleanToString(scope.row.emailConfirmed)}}
                    </template>
                </el-table-column>

                <!-- <el-table-column prop="fDate" :label="$t('userAccount.createdDate')" :min-width="3"></el-table-column> -->
                <el-table-column :label="$t('general.action')" :width="96">
                    <template slot-scope="scope">
                        <el-button class="no-bg i" icon="el-icon-lock" @click="openPwdDialog(scope.row.operatorId)"></el-button>
                        <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
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
                    <div class="label">{{ $t('userAccount.operatorName') }}</div>
                    <el-input v-model="dialog.info.operatorName"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.logo') }}</div>
                    <el-upload
                        ref="updateImg"
                        class="upload-demo"
                        list-type="picture-card"
                        :data="dialog.uploadParams"
                        :action="dialog.$Api"
                        accept="image/gif,image/jpeg,image/png,image/jpg"
                        :limit="1"
                        :auto-upload="false"
                        :on-exceed="handleExceed"
                        :before-upload="onBeforeUploadPic"
                        :on-success="handleSuccess"
                        :on-error="handleError"
                        :on-change="handleFileChange"
                        :on-remove="handleFileChange"
                        :file-list="dialog.info.file">
                        <i class="el-icon-plus"></i>
                    </el-upload>
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
                    <el-input v-model="dialog.info.password" type="text"></el-input>
                </div>
                <div class="form-item" v-if="!dialog.type">
                    <div class="label">{{ $t('userAccount.cmfPwd') }}</div>
                    <el-input v-model="dialog.info.confirmPassword" type="text"></el-input>
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
                <el-button size="small" type="primary" @click="updateOperatorData">{{ $t('general.ok') }}</el-button>
            </span>
        </el-dialog>
        <ChangePwd :show="pwdDialog.show" :name="pwdDialog.name" :id="pwdDialog.id" @close="closeDialog(false)"></ChangePwd>
    </div>
</template>

<script>
import { $HTTP_getCountryCodeSelectList, $HTTP_getOperatorList, AddOperator, $HTTP_updateOperator, UpdateOperator } from "@/api/api";
import { setScrollBar } from "@/utils/function";
import ChangePwd from "@/components/userAccount/changePwd"
export default {
    components: {
        ChangePwd
    },
    data() {
        return {
            lang: '',
            operatorList: {},
            filter: {
                operatorTypeId: '',
                tmpEmail: '',
                emailSearch: '',
                tmpContactPersion: '',
                personSearch: '',
            },
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
                    // opLoginId: '',
                    operatorName: '',
                    file: [],
                    address: '',
                    contactPerson: '',
                    countryCode: '',
                    telephone: '',
                    phone: '',
                    email: '',
                    // password: '',
                    // confirmPassword: '',
                    // operatorId: '',
                    // fDate: '',
                    // eDate: '',
                },
                originalImg: '',
                uploadParams: {},
                $Api: null
            },
            pwdDialog: {
                id: '',
                name: 'operatorId',
                show: false
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
    },
    mounted() {
        setScrollBar('.scroll', this);
        this.fetchData();
        // this.fetchCountryCodeList();
    },computed:{
        clientName(){
            return (customer) => customer.firstName + ' ' + customer.lastName
        },convertBooleanToString(){
                        return (value) => value.toString()

        }
    },
    methods: {
        fetchData(type) {
            const that = this;
            let param = {};
            // if (this.filter.operatorTypeId && this.filter.operatorTypeId != '1') {
            //     param.operatorTypeId = this.filter.operatorTypeId;
            // }
            if (type === 'e') {
                this.filter.emailSearch = this.filter.tmpEmail;
            } else if (type === 'c') {
                this.filter.personSearch = this.filter.tmpContactPersion;
            }
            param.email = this.filter.emailSearch;
            param.name = this.filter.personSearch;
            $HTTP_getOperatorList(param).then((data) => {
                this.isLoading = false;
                console.log(data)
                console.log(!!data.success)
                if (data?.length>0) {
                    this.tableData = data
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
        // fetchCountryCodeList() {
        //     const that = this;
        //     this.countryCode.isLoading = true;
        //     $HTTP_getCountryCodeSelectList({lang: that.lang}).then((data) => {
        //         this.countryCode.isLoading = false;
        //         if (!!data.success) {
        //             this.countryCode.data = data.countryCodeList.slice();
        //         } else {
        //             this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
        //         }
        //     }).catch((err) => {
        //         console.log('countryCode', err);
        //         this.$message({ type: "warning", message: i18n.t("error_network") });
        //     });
        // },
        changePage(page) {
            this.page = page;
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            if (!type) {
                this.dialog.info = {
                                    opLoginId: '',
                                    operatorName: '',
                                    file: [],
                                    address: '',
                                    contactPerson: '',
                                    countryCode: '',
                                    telephone: '',
                                    phone: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                };
                this.dialog.originalImg = '';
                this.dialog.$Api = AddOperator;
            } else {
                const imgFileName = data.operatorPicPath.split('images/operator/')[1];
                this.dialog.info = {
                                    opLoginId: data.opLoginId,
                                    operatorId: data.operatorId,
                                    operatorName: data.operatorName,
                                    file: [{
                                        name: imgFileName,
                                        url: data.operatorPicPath
                                    }],
                                    address: data.address,
                                    contactPerson: data.contactPerson,
                                    countryCode: data.countryCode,
                                    telephone: data.telephone,
                                    phone: data.phone,
                                    email: data.email,
                                    fDate: data.fDate,
                                    eDate: data.eDate
                                };
                this.dialog.originalImg = data.operatorPicPath;
                this.dialog.$Api = UpdateOperator;
            }
            this.dialog.uploadParams = {};
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar('destroy');
            that.$nextTick(() => {
                setScrollBar('.formVertical', this);
            });
        },
        handleExceed(response, file, fileList) {
            this.$message.warning(i18n.t('general.onlyOneFile'));
        },
        handleFileChange(file, fileList) {
            this.dialog.info.file = fileList;
        },
        onBeforeUploadPic(file) {
            const imgTypes = ['gif', 'jpeg', 'jpg', 'png'];
            const fileExt = file.name.substring(file.name.lastIndexOf('.') + 1),
                    flag = imgTypes.find(img => img === fileExt);

            (flag == undefined) && this.$message.error(i18n.t('general.errFile'));
            if (flag) {
                this.dialog.isLoading = true;
            }
            return flag;
        },
        handleSuccess(response, file, fileList) {
            if (response.success == 1) {
                this.$message({type: 'success', message: (this.dialog.type) ? i18n.t('general.sucAddMsg') : i18n.t('general.sucUpdateMsg') });
                this.updateOperatorList(Object.assign({}, response.operatorList));
                this.fetchData();
                this.dialog.isLoading = false;
                this.dialog.visible = false;
            } else {
                this.$message({ type: 'warning', message: this.lang === 'en' ? response.message : response.reason });
                this.dialog.isLoading = false;
                this.$refs.updateImg && this.$refs.updateImg.clearFiles();
            }
        },
        handleError(response, file, fileList) {
            this.dialog.isLoading = false;
            this.$refs.updateImg && this.$refs.updateImg.clearFiles();
            console.log('handleError', response);
            this.$message({ type: 'error', message: i18n.t('error_network') });
        },
        updateOperatorData() {
            const that = this;
            //有傳圖片情況
            if (this.dialog.info.file.length > 0 && this.dialog.originalImg !== this.dialog.info.file[0].url) {
                this.dialog.uploadParams = {
                                            operatorName: this.dialog.info.operatorName,
                                            address: this.dialog.info.address,
                                            contactPerson: this.dialog.info.contactPerson,
                                            countryCode: this.dialog.info.countryCode,
                                            telephone: this.dialog.info.telephone,
                                            phone: this.dialog.info.phone,
                                            email: this.dialog.info.email
                                        };
                if (that.dialog.type) { //編輯
                } else { //新增
                    this.dialog.uploadParams.opLoginId = this.dialog.info.opLoginId;
                    this.dialog.uploadParams.password = this.dialog.info.password;
                    this.dialog.uploadParams.confirmPassword = this.dialog.info.confirmPassword;
                }
                this.$nextTick(()=> {
                    that.$refs.updateImg.submit();
                });
            } else { //沒有傳圖片情況 只有更新才會發生
                let params = {
                                operatorName: this.dialog.info.operatorName,
                                address: this.dialog.info.address,
                                contactPerson: this.dialog.info.contactPerson,
                                countryCode: this.dialog.info.countryCode,
                                telephone: this.dialog.info.telephone,
                                phone: this.dialog.info.phone,
                                email: this.dialog.info.email
                            };
                that.dialog.isLoading = true;
                $HTTP_updateOperator(params).then(data => {
                    console.log(params)
                    that.dialog.isLoading = false;
                    console.log(data)
                    // if (!!data.success) {
                    //     that.$message({type: 'success', message: i18n.t('general.sucUpdateMsg') });
                    //     // that.updateOperatorList(Object.assign({}, data.operatorList));
                    //     that.fetchData();
                    //     that.dialog.visible = false;
                    // } else {
                    //     that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                    // }
                }).catch((err) => {
                    console.log(err)
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
            }
        },
        updateOperatorList(list) {
            const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
            this.operatorList = list;
            userData.operatorList = list;
            userData.operatorId = parseInt(Object.keys(list)[0]) || 0;
            window.sessionStorage.setItem("fiics-user", JSON.stringify(userData));
        },
        closeDialog(isEdit) {
            if(isEdit) {
                this.$refs.updateImg && this.$refs.updateImg.clearFiles();
            } else {
                this.pwdDialog.show = false;
            }
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        openPwdDialog(id) {
            this.pwdDialog.id = id;
            this.pwdDialog.show = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        }
    }
}
</script>
<style lang = "scss" scoped>
.operator .container {
    position: relative;
    img.logo {
        height: auto;
        width: 100%;
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