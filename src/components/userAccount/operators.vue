<template>
    <div class="operator">
        <div class="container">
            <div class="filter">
                <el-select class="select-small" :placeholder="$t('general.operator')" v-model="filter.roles" @change="fetchData()">
                    <el-option v-for="(item, key) in operatorList" :label="key" :key="key" :value="item"></el-option>
                </el-select>
                <el-input :placeholder="$t('userAccount.email')" v-model="filter.tmpEmail" @change="fetchData('e')" clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-input :placeholder="$t('userAccount.operatorName')" v-model="filter.tmpContactPersion" @change="fetchData('c')" clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
            </div>
            <el-table :data="tableData.slice((page - 1) * 10, page * 10)" class="moreCol" v-loading="isLoading">
                <el-table-column :label="$t('userAccount.operatorName')" :min-width="3">
                    <template slot-scope="scope">
                        {{clientName(scope.row)}}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('userAccount.logo')" :min-width="3">
                    <template slot-scope="scope">
                        <img :src="getImageUrl(scope.row.picture)" class="logo" v-bind:style="{maxHeight: '50px',maxWidth:'50px'}">
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

                <el-table-column :label="$t('general.action')" :width="182">
                    <template slot-scope="scope">
                        <el-button class="no-bg i" icon="el-icon-lock" @click="openPwdDialog(scope.row.id)"></el-button>
                        <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                        <el-button class="no-bg i" icon="el-icon-user" @click="openRolesDialog(scope.row)"></el-button>
                        <el-button class="no-bg delete" @click="openDeleteDialog(scope.row)"></el-button>

                    </template>
                </el-table-column>
            </el-table>
            <div class="total">{{ $t("general.result", {item:total}) }}</div>
            <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="10" :current-page.sync="page" @current-change="changePage">
            </el-pagination>
        </div>
        <el-dialog :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')" width="600px" :visible.sync="dialog.visible" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" @close="closeDialog(true)" v-loading="dialog.isLoading">
            <div class="vertial formVertical">
                <el-form ref="operatorForm" :rules="rules" :model="dialog.info" style="width:98%">

                    <div class="form-item">
                        <div class="label">{{ $t('userAccount.firstName') }}</div>
                        <el-input v-model="dialog.info.firstName"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('userAccount.lastName') }}</div>
                        <el-input v-model="dialog.info.lastName"></el-input>
                    </div>
                    <div v-bind:class="{'hide': (dialog.type===0),'form-item':true}">
                        <div class="label">{{ $t('userAccount.logo') }}</div>
                        <el-upload ref="updateImg" class="upload-demo" list-type="picture-card" :action="dialog.$Api" :data="dialog.uploadParams" accept="image/gif,image/jpeg,image/png,image/jpg" :limit="1" :auto-upload="false" :on-exceed="handleExceed" :before-upload="onBeforeUploadPic" :on-success="handleSuccess" :on-error="handleError" :on-change="handleFileChange" :on-remove="handleFileChange" :file-list="dialog.file">
                            <i class="el-icon-plus"></i>
                        </el-upload>
                        <!-- <label for="file-input">
                        <i class="el-icon-plus"></i>
                    </label>
                    <input id="file-input" type="file" name="imagesArray" accept="image/gif,image/jpeg,image/png,image/jpg" @change="handleImageChange" style="display:none" /> -->
                    </div>

                    <div v-bind:class="{'hide': (dialog.type===0),'form-item':true}">
                        <div class="label">{{ $t('userAccount.mobile') }}</div>
                        <el-input v-model="dialog.info.phoneNumber"></el-input>
                    </div>

                    <div class="form-item">
                        <el-form-item prop="email">
                            <div class="label">{{ $t('userAccount.email') }} <span style="color:red"><strong>* </strong></span></div>
                            <el-input v-model="dialog.info.email" :disabled="dialog.type===1"></el-input>
                        </el-form-item>
                    </div>

                    <div class="form-item" v-if="!dialog.type">
                        <el-form-item prop="password">
                            <div class="label">{{ $t('login.pwd') }} <span style="color:red"><strong>* </strong></span></div>
                            <el-input v-model="dialog.info.password" :type="showPasswordStatus.showPassword?'text':'password'">
                                <i slot="suffix" v-if="showPasswordStatus.showPassword" class="fa fa-eye" aria-hidden="true" @click="showPasswordMethod('showPassword')"></i>
                                <i slot="suffix" v-else class="fa fa-eye-slash" aria-hidden="true" @click="showPasswordMethod('showPassword')"></i>
                            </el-input>
                        </el-form-item>
                    </div>
                    <div class="form-item" v-if="!dialog.type">
                        <el-form-item prop="confirmPassword">
                            <div class="label">{{ $t('userAccount.cmfPwd') }} <span style="color:red"><strong>* </strong></span></div>
                            <el-input v-model="dialog.info.confirmPassword" :type="showPasswordStatus.showConfirmPassword?'text':'password'">
                                <i slot="suffix" v-if="showPasswordStatus.showConfirmPassword" class="fa fa-eye" aria-hidden="true" @click="showPasswordMethod('showConfirmPassword')"></i>
                                <i slot="suffix" v-else class="fa fa-eye-slash" aria-hidden="true" @click="showPasswordMethod('showConfirmPassword')"></i>
                            </el-input>
                        </el-form-item>
                    </div>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                <el-button size="small" type="primary" @click="updateOperatorData">{{ $t('general.ok') }}</el-button>
            </span>
        </el-dialog>
        <ChangePwd :show="pwdDialog.show" :name="pwdDialog.name" :id="pwdDialog.id" @close="closeDialog(false)"></ChangePwd>
        <DeleteUser :show="deleteDialog.show" :email="deleteDialog.email" :id="deleteDialog.id" @close="closeDialog(false)"></DeleteUser>
        <AddRoles :show="addRolesDialog.show" :id="addRolesDialog.id" @close="closeDialog(false)"></AddRoles>

    </div>
</template>

<script>
import {
    $HTTP_getCountryCodeSelectList,
    $HTTP_getOperatorList,
    AddOperator,
    $HTTP_updateOperator,
    UpdateOperator,
    $HTTP_registerOperator,
    $HTTP_updateImage,
} from "@/api/api";
import { setScrollBar } from "@/utils/function";
import ChangePwd from "@/components/userAccount/changePwd";
import DeleteUser from "@/components/userAccount/deleteUser";
import AddRoles from "@/components/userAccount/addRoles";
export default {
    components: {
        ChangePwd,
        DeleteUser,
        AddRoles,
    },
    data() {
        var validateEmail = (rule, value, callback) => {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                callback();
            } else {
                callback(new Error("Please enter a valid email address."));
            }
        };

        var validatePassword = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("Password cannot be empty."));
            } else {
                callback();
            }
        };

        var validateConfirmedNewPassword = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("You must verify the user's password."));
            } else if (value !== this.dialog.info.password) {
                callback(new Error("Passwords don't match."));
            } else {
                callback();
            }
        };
        return {
            lang: "",
            operatorList: {},
            filter: {
                roles: [],
                tmpEmail: "",
                emailSearch: "",
                tmpContactPersion: "",
                personSearch: "",
            },
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            imagesArray: null,
            dialog: {
                visible: false,
                isLoading: false,
                type: 0,
                info: {
                    firstName: "",
                    lastName: "",
                    file: [],
                    phoneNumber: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                },
                originalImg: "",
                uploadParams: {},
                $Api: "",
            },
            pwdDialog: {
                id: "",
                name: "",
                show: false,
            },
            deleteDialog: {
                id: "",
                email: "",
                show: false,
            },
            addRolesDialog: {
                id: "",
                show: false,
            },
            rules: {
                email: [{ validator: validateEmail }],
                password: [{ validator: validatePassword }],
                confirmPassword: [{ validator: validateConfirmedNewPassword }],
            },
            showPasswordStatus: {
                showPassword: false,
                showConfirmPassword: false,
            },
        };
    },
    created() {
        this.lang = window.localStorage.getItem("fiics-lang");
        let fiics_user = JSON.parse(localStorage.getItem("fiics-user"));
        let roles = fiics_user.roles;
        if (roles.indexOf("Super") !== -1) {
            this.operatorList = { All: "*", Admin: "admin", Owner: "owner", Member: "" };
        } else {
            this.operatorList = { Admin: "admin", Owner: "owner", Member: "" };
        }
    },
    mounted() {
        setScrollBar(".scroll", this);
        this.fetchData();
        // this.fetchCountryCodeList();
    },
    computed: {
        clientName() {
            return (customer) => customer.firstName + " " + customer.lastName;
        },
        convertBooleanToString() {
            return (value) => value.toString();
        },
    },
    methods: {
        showPasswordMethod(value) {
            this.showPasswordStatus[`${value}`] = !this.showPasswordStatus[`${value}`];
        },
        handleImageChange(event) {
            this.imagesArray = event.target.files[0];
        },
        getImageUrl(url) {
            let final_url;
            if (!url.includes("google") && url !== "") {
                final_url = `${process.env.VUE_APP_BASE_IMAGE_URL}` + url;
            } else {
                final_url = url;
            }
            return final_url;
        },
        fetchData(type) {
            const that = this;
            let param = {};

            if (type === "e") {
                this.filter.emailSearch = this.filter.tmpEmail;
            } else if (type === "c") {
                this.filter.personSearch = this.filter.tmpContactPersion;
            }
            param.email = this.filter.emailSearch;
            param.name = this.filter.personSearch;
            param.role = this.filter.roles;
            $HTTP_getOperatorList(param)
                .then((data) => {
                    this.isLoading = false;
                    if (data?.length > 0) {
                        this.tableData = data;
                        this.total = this.tableData.length;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        this.$message({ type: "warning", message: that.lang === "en" ? data.message : data.reason });
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
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
                    id: "",
                    firstName: "",
                    lastName: "",
                    file: [],
                    phoneNumber: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                };
                this.dialog.originalImg = "";
                // this.dialog.$Api = AddOperator;
            } else {
                const imgFileName = data.picture.split("images/operator/")[1];
                this.dialog.info = {
                    id: data.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    file: [
                        {
                            name: imgFileName,
                            url: data.picture,
                        },
                    ],
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                };
                this.dialog.originalImg = data.picture;
                // this.dialog.$Api = UpdateOperator;
            }
            this.dialog.uploadParams = {};
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
            that.$nextTick(() => {
                setScrollBar(".formVertical", this);
            });
        },
        handleExceed(response, file, fileList) {
            this.$message.warning(i18n.t("general.onlyOneFile"));
        },
        handleFileChange(file, fileList) {
            this.dialog.info.file = fileList;
            this.imagesArray = fileList[0]?.raw;
        },

        onBeforeUploadPic(file) {
            const imgTypes = ["gif", "jpeg", "jpg", "png"];
            const fileExt = file.name.substring(file.name.lastIndexOf(".") + 1),
                flag = imgTypes.find((img) => img === fileExt);

            flag == undefined && this.$message.error(i18n.t("general.errFile"));
            if (flag) {
                this.dialog.isLoading = true;
            }
            return flag;
        },
        handleSuccess(response, file, fileList) {
            if (response.success == 1) {
                this.$message({
                    type: "success",
                    message: this.dialog.type ? i18n.t("general.sucAddMsg") : i18n.t("general.sucUpdateMsg"),
                });
                this.fetchData();
                this.dialog.isLoading = false;
                this.dialog.visible = false;
            } else {
                this.$message({ type: "warning", message: this.lang === "en" ? response.message : response.reason });
                this.dialog.isLoading = false;
                this.$refs.updateImg && this.$refs.updateImg.clearFiles();
            }
        },
        handleError(response, file, fileList) {
            this.dialog.isLoading = false;
            this.$refs.updateImg && this.$refs.updateImg.clearFiles();
            this.$message({ type: "error", message: i18n.t("error_network") });
        },
        updateOperatorData() {
            this.$refs.operatorForm.validate((valid) => {
                if (valid) {
                    const that = this;
                    // edit (type 1, type 0 create)
                    if (this.dialog.type === 1) {
                        let params = {
                            id: this.dialog.info.id,
                            firstName: this.dialog.info.firstName,
                            lastName: this.dialog.info.lastName,
                            phoneNumber: this.dialog.info.phoneNumber,
                        };
                        if (this.dialog.info.phoneNumber === "") {
                            delete params["phoneNumber"];
                        }
                        that.dialog.isLoading = true;
                        $HTTP_updateOperator(params)
                            .then((data) => {
                                that.dialog.isLoading = false;
                                if (data.succeeded) {
                                    that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                                    // that.fetchData();
                                    // that.dialog.visible = false;
                                }
                            })
                            .then(() => {
                                if (this.imagesArray) {
                                    const formData = new FormData();
                                    let id = this.dialog.info.id;
                                    formData.append("picture", this.imagesArray, this.imagesArray?.name);
                                    let config = {
                                        headers: {
                                            "Content-Type": "multipart/form-data",
                                        },
                                    };

                                    let params = {
                                        id: id,
                                        formData: formData,
                                        config: config,
                                    };
                                    $HTTP_updateImage(params)
                                        .then((res) => {
                                            if (res.succeeded) {
                                                that.$message({
                                                    type: "success",
                                                    message: i18n.t("general.sucUpdateMsg"),
                                                });
                                                that.fetchData();
                                                that.dialog.visible = false;
                                            }
                                        })
                                        .catch((err) => {
                                            let _errors = err?.data?.errors
                                                ? Object.values(err?.data?.errors)
                                                : err?.data;
                                            that.$message({ type: "warning", message: _errors.toString() });
                                            that.fetchData();
                                            that.dialog.visible = false;
                                        });
                                } else {
                                    that.fetchData();
                                    that.dialog.visible = false;
                                }
                            })
                            .catch((err) => {
                                let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                                that.$message({ type: "warning", message: _errors.toString() });
                                that.fetchData();
                                that.dialog.visible = false;
                                that.dialog.isLoading = false;
                            });
                    } else {
                        //沒有傳圖片情況 只有更新才會發生
                        let params = {
                            firstName: this.dialog.info.firstName,
                            lastName: this.dialog.info.lastName,
                            email: this.dialog.info.email,
                            password: this.dialog.info.password,
                            confirmPassword: this.dialog.info.confirmPassword,
                        };
                        that.dialog.isLoading = true;
                        $HTTP_registerOperator(params)
                            .then((data) => {
                                that.dialog.isLoading = false;
                                if (data.succeeded) {
                                    that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                                    that.fetchData();
                                    that.dialog.visible = false;
                                }
                            })
                            .catch((err) => {
                                let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                                that.$message({ type: "warning", message: _errors.toString() });
                                // that.dialog.visible = false;
                                that.dialog.isLoading = false;
                            });
                    }
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog(isEdit) {
            if (isEdit) {
                this.$refs.updateImg && this.$refs.updateImg.clearFiles();
            } else {
                this.pwdDialog.show = false;
                this.deleteDialog.show = false;
                this.addRolesDialog.show = false;
                this.fetchData();
            }
            this.$nextTick(() => {
                this.$refs?.operatorForm?.clearValidate("email");
                this.$refs?.operatorForm?.clearValidate("password");
                this.$refs?.operatorForm?.clearValidate("confirmPassword");
            });

            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        openPwdDialog(id) {
            this.pwdDialog.id = id;
            this.pwdDialog.show = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        openDeleteDialog(data) {
            this.deleteDialog.id = data.id;
            this.deleteDialog.show = true;
            this.deleteDialog.email = data.email;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        openRolesDialog(data) {
            this.addRolesDialog.id = data.id;
            this.addRolesDialog.show = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
    },
};
</script>
<style lang = "scss" >
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
        color: #5a607f;
        letter-spacing: 0;
    }
}

.hide {
    display: none;
}

.formVertical .form-item .el-input input:disabled {
    background: #d3d3d3 !important;
}

button.no-bg.i .el-icon-lock,
.el-button.no-bg.i .el-icon-user {
    font-size: 22px;
    font-weight: bold;
    color: #1e5eff;
    padding: 0;
}

.fa {
    font-size: 1.3rem;
    margin-top: 14px;
}

.fa:hover {
    cursor: pointer;
}
</style>