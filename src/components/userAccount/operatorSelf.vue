<template>
    <div class="operator">
        <div class="card-8">
            <div class="info" v-loading="isLoading">
                <div class="item">
                    <div class="label">{{ $t('userAccount.operatorName') }}</div>
                    <div class="content">{{ operatorData.operatorName }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('userAccount.logo') }}</div>
                    <div class="content"><img :src="operatorData.operatorPicPath" class="logo"></div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('general.address') }}</div>
                    <div class="content">{{ operatorData.address }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('userAccount.contactPerson') }}</div>
                    <div class="content">{{ operatorData.contactPerson }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('userAccount.countryCode') }}</div>
                    <div class="content">{{ operatorData.countryCode + '(' + operatorData.countryName + ')' }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('userAccount.telephone') }}</div>
                    <div class="content">{{ operatorData.telephone }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('userAccount.mobile') }}</div>
                    <div class="content">{{ operatorData.phone }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('userAccount.email') }}</div>
                    <div class="content">{{ operatorData.email }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('userAccount.createdDate') }}</div>
                    <div class="content">{{ operatorData.fDate }}</div>
                </div>
                <div class="item">
                    <div class="label">{{ $t('general.latestModification') }}</div>
                    <div class="content">{{ operatorData.eDate }}</div>
                </div>
            </div>
            <el-button class="no-bg edit" @click="openDialog()"></el-button>
            <div class="tabs-contain">
                <el-tabs v-model="active" @tab-click="handleTabClick">
                    <el-tab-pane :label="$t('userAccount.maintainer')" name="maintainer">
                        <OpMaintainer :countryCodeList="countryCode.data"></OpMaintainer>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
        <el-dialog
            :title="$t('general.modify')"
            width="600px"
            :visible.sync="dialog.visible"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            @close="closeDialog()"
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
                    <div class="label">{{ $t('general.address') }}</div>
                    <el-input v-model="dialog.info.address"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.contactPerson') }}</div>
                    <el-input v-model="dialog.info.contactPerson"></el-input>
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
                    <div class="label">{{ $t('userAccount.telephone') }}</div>
                    <el-input v-model="dialog.info.telephone"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.mobile') }}</div>
                    <el-input v-model="dialog.info.phone"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.email') }}</div>
                    <el-input v-model="dialog.info.email"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.createdDate') }}</div>
                    <el-input v-model="dialog.info.fDate" disabled></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('general.latestModification') }}</div>
                    <el-input v-model="dialog.info.eDate" disabled></el-input>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                <el-button size="small" type="primary" @click="updateOperatorData">{{ $t('general.ok') }}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { $HTTP_getCountryCodeSelectList, $HTTP_getOperatorList, $HTTP_updateOperator, UpdateOperator } from "@/api/api";
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import OpMaintainer from "@/components/userAccount/opMaintainer";
export default {
    components: {
        OpMaintainer
    },
    data() {
        return {
            lang: '',
            operatorTypeId: '',
            isLoading: false,
            countryCode: {
                isLoading: false,
                data: []
            },
            operatorData: {
                operatorId: '',
                operatorName: '',
                operatorPicPath: '',
                address: '',
                contactPerson: '',
                countryCode: '',
                countryName: '',
                telephone: '',
                phone: '',
                email: '',
                fDate: '',
                eDate: '',
            },
            dialog: {
                visible: false,
                isLoading: false,
                type: 0,
                info: {
                    operatorName: '',
                    file: [],
                    address: '',
                    contactPerson: '',
                    countryCode: '',
                    telephone: '',
                    phone: '',
                    email: '',
                    operatorId: '',
                    // fDate: '',
                    // eDate: '',
                },
                originalImg: '',
                uploadParams: {},
                $Api: null
            },
            active: 'maintainer'
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorTypeId = userData.operatorId;
    },
    mounted() {
        setScrollBar('.scroll', this);
        const that = this;
        this.fetchCountryCodeList(()=>{
            that.fetchData();
        });
    },
    methods: {
        fetchData() {
            const that = this;
            let param = {
                operatorTypeId: this.operatorTypeId
            };
            this.isLoading = true;
            $HTTP_getOperatorList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.operatorData = Object.assign({},data.operatorList[0]);
                    this.operatorData.fDate = transformUtcToLocTime(this.operatorData.fDate);
                    this.operatorData.eDate = transformUtcToLocTime(this.operatorData.eDate);
                    this.operatorData.countryName = this.countryCode.data.filter(item => item.countryCode === this.operatorData.countryCode)[0].countryName || ''
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchCountryCodeList(callBack) {
            const that = this;
            this.countryCode.isLoading = true;
            $HTTP_getCountryCodeSelectList({lang: that.lang}).then((data) => {
                this.countryCode.isLoading = false;
                if (!!data.success) {
                    this.countryCode.data = data.countryCodeList.slice();
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                callBack && callBack();
            }).catch((err) => {
                console.log('countryCode', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        handleTabClick(tab, event) {},
        openDialog() {
            const that = this;
            const imgFileName = that.operatorData.operatorPicPath.split('images/operator/')[1];
            this.dialog.info = {
                                operatorId: that.operatorData.operatorId,
                                operatorName: that.operatorData.operatorName,
                                file: [{
                                    name: imgFileName,
                                    url: that.operatorData.operatorPicPath
                                }],
                                address: that.operatorData.address,
                                contactPerson: that.operatorData.contactPerson,
                                countryCode: that.operatorData.countryCode,
                                telephone: that.operatorData.telephone,
                                phone: that.operatorData.phone,
                                email: that.operatorData.email,
                                fDate: that.operatorData.fDate,
                                eDate: that.operatorData.eDate
                            };
            this.dialog.originalImg = that.operatorData.operatorPicPath;
            this.dialog.$Api = UpdateOperator;
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
                this.$message({type: 'success', message: i18n.t('general.sucUpdateMsg') });
                this.dialog.isLoading = false;
                this.updateOperatorList(Object.assign({}, response.operatorList), response.operatorPicPath, ()=> {
                    this.dialog.visible = false;
                    setTimeout(( () => {
                        location.reload();
                    }), 100);
                });
            } else {
                this.$message({ type: 'warning', message: that.lang === 'en' ? data.message : data.reason });
                this.dialog.isLoading = false;
            }
        },
        handleError(response, file, fileList) {
            this.dialog.isLoading = false;
            console.log('handleError', response);
            this.$message({ type: 'error', message: i18n.t('error_network') });
        },
        updateOperatorData() {
            const that = this;
            //有傳圖片情況
            if (this.dialog.info.file.length > 0 && this.dialog.originalImg !== this.dialog.info.file[0].url) {
                this.dialog.uploadParams = {
                                            operatorId: this.dialog.info.operatorId,
                                            operatorName: this.dialog.info.operatorName,
                                            address: this.dialog.info.address,
                                            contactPerson: this.dialog.info.contactPerson,
                                            countryCode: this.dialog.info.countryCode,
                                            telephone: this.dialog.info.telephone,
                                            phone: this.dialog.info.phone,
                                            email: this.dialog.info.email
                                        };
                this.$nextTick(()=> {
                    that.$refs.updateImg.submit();
                });
            } else { //沒有傳圖片情況 只有更新才會發生
                let params = {
                                operatorId: this.dialog.info.operatorId,
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
                    that.dialog.isLoading = false;
                    if (!!data.success) {
                        that.$message({type: 'success', message: i18n.t('general.sucUpdateMsg') });
                        that.updateOperatorList(Object.assign({}, data.operatorList));
                        that.fetchData();
                        that.dialog.visible = false;
                    } else {
                        that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                    }
                }).catch((err) => {
                    console.log(err)
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
            }
        },
        updateOperatorList(list, imgPath, callBack) {
            const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
            this.operatorList = list;
            userData.operatorList = list;
            userData.operatorId = parseInt(Object.keys(list)[0]) || 0;
            if (imgPath) {
                userData.accountInfo.operatorPicPath = imgPath;
            }
            window.sessionStorage.setItem("fiics-user", JSON.stringify(userData));
            callBack && callBack();
        },
        closeDialog() {
            this.$refs.updateImg && this.$refs.updateImg.clearFiles();
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
    }
}
</script>
<style lang = "scss" scoped>
.operator .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .info {
        margin-bottom: 28px;
        .item {
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 180px;
                font-size: 1rem;
                color: #525E69;
                letter-spacing: 0;
            }
            .content {
                display: inline-block;
                width: calc(100% - 206px);
                font-size: 1rem;
                color: #151E25;
                letter-spacing: 0;
                img.logo {
                    max-width: 300px;
                    height: auto;
                }
            }
        }
    }
    .el-button.edit {
        position: absolute;
        top: 28px;
        right: 28px;
    }
}
</style>