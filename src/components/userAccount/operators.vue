<template>
    <div class="operator">
        <div class="card-8 table-result">
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
                    @fetchData="fetchData('e')"
                    clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-input
                    :placeholder="$t('userAccount.contactPerson')"
                    v-model="filter.tmpContactPersion"
                    @fetchData="fetchData('c')"
                    clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
            </div>
            <el-table
                :data="tableData.slice((page - 1) * 10, page * 10)"
                class="moreCol"
                v-loading="isLoading">
                <el-table-column prop="operatorName" :label="$t('userAccount.operatorName')" :min-width="3"></el-table-column>
                <el-table-column :label="$t('userAccount.logo')" :min-width="3">
                    <template slot-scope="scope">
                        <img :src="icon[scope.row.operatorPicPath]" class="logo">
                    </template>
                </el-table-column>
                <el-table-column prop="address" :label="$t('general.address')" :min-width="4"></el-table-column>
                <el-table-column prop="contactPerson" :label="$t('userAccount.contactPerson')" :min-width="3"></el-table-column>
                <el-table-column prop="phone" :label="$t('userAccount.mobile')" :min-width="3"></el-table-column>
                <el-table-column prop="email" :label="$t('userAccount.email')" :min-width="4"></el-table-column>
                <el-table-column prop="fDate" :label="$t('userAccount.createdDate')" :min-width="3"></el-table-column>
                <el-table-column :label="$t('general.action')" :width="65">
                    <template slot-scope="scope">
                        <!-- <el-button class="no-bg edit"></el-button> -->
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
            @close="$refs.updateImg && $refs.updateImg.clearFiles();"
            v-loading="dialog.isLoading">
            <div class="vertial formVertical">
                <!-- <div class="form-item" v-if="dialog.type">
                    <div class="label">{{ $t('userAccount.stationID') }}</div>
                    <el-input v-model="dialog.info.stationId" disabled></el-input>
                </div> -->
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
                    <div class="label">{{ $t('userAccount.mobile') }}</div>
                    <el-input v-model="dialog.info.phone"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.email') }}</div>
                    <el-input v-model="dialog.info.email"></el-input>
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
                <el-button size="small" type="primary">{{ $t('general.ok') }}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { $HTTP_getCountryCodeSelectList } from "@/api/api";
import OperatorData from "@/tmpData/operatorData";
import { setScrollBar } from "@/utils/function";
import midwestFiber from 'imgs/midwestFiber.png';
import apt from 'imgs/apt.png';
import Operators from "@/components/userAccount/operators";
import OperatorSelf from "@/components/userAccount/operatorSelf";
export default {
    components: {
        Operators,
        OperatorSelf
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
            icon: {
                midwestFiber: midwestFiber,
                apt: apt
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
                isUpdating: false,
                type: 0,
                info: {
                    file: []
                },
                uploadParams: {},
                $Api: null
            },
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
    },
    mounted() {
        this.fetchData();
        this.fetchCountryCodeList();
    },
    methods: {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.tableData = OperatorData[this.filter.operatorTypeId].slice();
            this.total = this.tableData.length;
            setScrollBar('.scroll', this);
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
            if (type) {
                this.dialog.info = Object.assign({}, data);
            }
            this.dialog.visible = true;
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
                this.dialog.isUpdating = true;
            }
            return flag;
        },
        handleSuccess(response, file, fileList) {
            if (response.success == 1) {
                this.dialog.isUpdating = false;
                this.dialog.visible = false;
                this.$message({type: 'success', message: (this.dialog.isAdd) ? i18n.t('general.sucAddMsg') : i18n.t('general.sucUpdateMsg') });
                this.changePage(1);
            } else {
                this.$message({ type: 'warning', message: that.lang === 'en' ? data.message : data.reason });
                this.dialog.isUpdating = false;
            }
        },
        handleError(response, file, fileList) {
            this.dialog.isUpdating = false;
            this.dialog.visible = false;
            this.$message({ type: 'error', message: i18n.t('error_network') });
        },
    }
}
</script>
<style lang = "scss" scoped>
.operator .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    img.logo {
        height: auto;
        width: 100%;
    }
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