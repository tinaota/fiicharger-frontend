<template>
    <el-dialog :title="$t('general.modify')" width="400px" :visible.sync="visible" custom-class="pwd" :show-close="false" v-loading="isLoading" @close="closeDialog()">

        <div class="formVertical">
            <el-form ref="passwordForm" :rules="rules" :model="param">
                <div class="form-item">
                    <el-form-item prop="oldPassword">
                        <div class="label">{{ $t('login.oriPwd') }} <span style="color:red"><strong>* </strong></span></div>
                        <el-input :type="showPassword.showOldPassword? 'text':'password'" class="" v-model="param.oldPassword" autocomplete="off">
                            <i slot="suffix" v-if="showPassword.showOldPassword" class="fa fa-eye" aria-hidden="true" @click="showPasswordMethod('showOldPassword')"></i>
                            <i slot="suffix" v-else class="fa fa-eye-slash" aria-hidden="true" @click="showPasswordMethod('showOldPassword')"></i>
                        </el-input>
                    </el-form-item>
                </div>

                <div class="form-item">
                    <el-form-item prop="password">
                        <div class="label">{{ $t('login.newPwd') }} <span style="color:red"><strong>* </strong></span></div>
                        <el-input v-model="param.password" :type="showPassword.showNewPassword? 'text':'password'" class="" autocomplete="new-password">
                            <i slot="suffix" v-if="showPassword.showNewPassword" class="fa fa-eye" aria-hidden="true" @click="showPasswordMethod('showNewPassword')"></i>
                            <i slot="suffix" v-else class="fa fa-eye-slash" aria-hidden="true" @click="showPasswordMethod('showNewPassword')"></i>
                        </el-input>
                    </el-form-item>
                </div>

                <div class="form-item">
                    <el-form-item prop="confirmPassword">
                        <div class="label">{{ $t('login.cfmNewPwd') }} <span style="color:red"><strong>* </strong></span></div>
                        <el-input v-model="param.confirmPassword" :type="showPassword.showConfirmNewPassword?'text':'password'" class="" autocomplete="new-password">
                            <i slot="suffix" v-if="showPassword.showConfirmNewPassword" class="fa fa-eye" aria-hidden="true" @click="showPasswordMethod('showConfirmNewPassword')"></i>
                            <i slot="suffix" v-else class="fa fa-eye-slash" aria-hidden="true" @click="showPasswordMethod('showConfirmNewPassword')"></i>
                        </el-input>
                    </el-form-item>
                </div>
            </el-form>

        </div>

        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updatePwd">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_getCaptcha, $HTTP_updateOperatorPassword } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    props: {
        name: String,
        id: String,
        show: Boolean,
    },
    data() {
        var validatePassword = (rule, value, callback) => {
            if (value === "") {
                callback(new Error(i18n.t('userAccount.emptyPasswordValidation')));
            } else {
                callback();
            }
        };

        var validateConfirmedNewPassword = (rule, value, callback) => {
            if (value === "") {
                callback(new Error(i18n.t('userAccount.confirmEmptyPasswordValidation')));
            } else if (value !== this.param.password) {
                callback(new Error(i18n.t('userAccount.validatePasswordMatch')));
            } else {
                callback();
            }
        };

        return {
            lang: "",
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            param: {
                oldPassword: "",
                password: "",
                confirmPassword: "",
            },
            rules: {
                oldPassword: [{ validator: validatePassword }],
                password: [{ validator: validatePassword }],
                confirmPassword: [{ validator: validateConfirmedNewPassword }],
            },
            showPassword: {
                showOldPassword: false,
                showNewPassword: false,
                showConfirmNewPassword: false,
            },
        };
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                if (that.visible) {
                    this.$Api = $HTTP_updateOperatorPassword;
                }
                that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
                that.$nextTick(() => {
                    setScrollBar(".formVertical", that);
                });
            },
        },
    },
    created() {
        this.lang = window.localStorage.getItem("fiics-lang");
    },
    beforeDestroy() {},
    methods: {
        showPasswordMethod(value) {
            this.showPassword[`${value}`] = !this.showPassword[`${value}`];
        },
        updatePwd() {
            this.$refs.passwordForm.validate((valid) => {
                if (valid) {
                    const that = this;
                    let params = {
                        id: that.id,
                        password: that.param.oldPassword,
                        newPassword: that.param.password,
                        confirmNewPassword: that.param.confirmPassword,
                    };

                    that.isLoading = true;
                    this.$Api(params)
                        .then((data) => {
                            that.isLoading = false;
                            if (data.succeeded) {
                                that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                                that.isUpdate = true;
                                that.visible = false;
                            }
                        })
                        .catch((err) => {
                            let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                            that.$message({ type: "warning", message: _errors.toString() });
                            that.isLoading = false;
                        });
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog() {
            this.param = {
                oldPassword: "",
                password: "",
                confirmPassword: "",
            };
            this.$nextTick(() => {
                this.$refs?.passwordForm?.clearValidate("oldPassword");
                this.$refs?.passwordForm?.clearValidate("password");
                this.$refs?.passwordForm?.clearValidate("confirmPassword");
            });
            this.$emit("close", this.isUpdate);
        },
    },
};
</script>
<style lang = "scss" scoped>
.el-dialog.pwd .el-dialog__body {
    height: 50vh;
}
.fa {
    font-size: 1.3rem;
    margin-top: 14px;
}

.fa:hover {
    cursor: pointer;
}
</style>