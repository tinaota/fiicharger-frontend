<template>
    <el-dialog
        :title="$t('general.modify')"
        width="400px"
        :visible.sync="visible"
        custom-class="pwd"
        :show-close="false"
        v-loading="isLoading"
        @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                <div class="label">{{ $t('login.oriPwd') }}</div>
                <el-input v-model="param.oldPassword" type="password"></el-input>
            </div>
            <div class="form-item">
                <div class="label">{{ $t('login.newPwd') }}</div>
                <el-input v-model="param.password" type="password"></el-input>
            </div>
            <div class="form-item">
                <div class="label">{{ $t('login.cfmNewPwd') }}</div>
                <el-input v-model="param.confirmPassword" type="password"></el-input>
            </div>
            <div class="form-item">
                <div class="label">
                    <img id="auth-img" :src="captchaImg"/>
                    <el-button class="no-bg refresh" @click="refreshCaptchaImg"></el-button>
                </div>
                <el-input v-model="param.captcha"></el-input>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updatePwd">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_getCaptcha, $HTTP_updateOperatorPassword, $HTTP_updateMaintainerPassword, $HTTP_updateCustomerServicePassword, $HTTP_updateOperatorMaintainerPassword } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    props: {
        name: String,
        id: String,
        show: Boolean
    },
    data() {
        return {
            lang: '',
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            param: {
                oldPassword: '',
                password: '',
                confirmPassword: '',
                captcha: ''
            },
            captchaImg: '',
            captchaTimer: null
        }
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                if (that.visible) {
                    switch(that.name) {
                        case 'operatorId':
                            this.$Api = $HTTP_updateOperatorPassword;
                            break;
                        case 'maintainerId':
                            this.$Api = $HTTP_updateMaintainerPassword;
                            break;
                        case 'customerServiceId':
                            this.$Api = $HTTP_updateCustomerServicePassword;
                            break;
                        case 'operatorMaintainerId':
                            this.$Api = $HTTP_updateOperatorMaintainerPassword;
                            break;
                    }
                    that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar('destroy');
                    that.$nextTick(() => {
                        setScrollBar('.formVertical', that);
                    });
                    this.fetchCaptcha();
                    this.setTimer();
                }
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    beforeDestroy() {
        if (this.captchaTimer) {
            clearInterval(this.captchaTimer);
        }
    },
    methods: {
        fetchCaptcha() {
            const that = this;
            $HTTP_getCaptcha().then((data) => {
                that.captchaImg = data;
            }).catch((err) => {
                console.log('getCaptcha', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        setTimer() {
            const that = this;
            this.captchaTimer = setInterval(() => {
                that.fetchCaptcha();
            }, 1000 * 55);
        },
        refreshCaptchaImg() {
            this.fetchCaptcha();
            clearInterval(this.captchaTimer);
            this.setTimer();
        },
        updatePwd() {
            const that = this;
            let   params = {
                    [this.name]: that.id,
                    oldPassword: that.param.oldPassword,
                    password: that.param.password,
                    confirmPassword: that.param.confirmPassword,
                    captcha: that.param.captcha
                  };

            that.isLoading = true;
            this.$Api(params).then(data => {
                that.isLoading = false;
                if (!!data.success) {
                    that.$message({ type: "success", message: i18n.t('general.sucUpdateMsg') });
                    that.isUpdate = true;
                    that.visible = false;
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            });
        },
        closeDialog() {
            this.param = {
                            oldPassword: '',
                            password: '',
                            confirmPassword: '',
                            captcha: ''
                        };
            this.$emit('close', this.isUpdate);
        }
    }
}
</script>
<style lang = "scss" scoped>
.el-dialog.pwd .el-dialog__body {
    height: 50vh;
}
</style>