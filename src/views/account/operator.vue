<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.account') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.operator') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div v-if="accPermissionType !== 3">
                <Operators></Operators>
            </div>
            <div v-else>
                <OperatorSelf></OperatorSelf>
            </div>
        </div>
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
            accPermissionType: '',
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
        this.accPermissionType = userData.accountInfo.accPermissionType;
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
.mainctrl .card-8 {
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