<template>
    <div class="operator">
        <div class="container">
            <div class="filter">
                <el-select class="select-small" :placeholder="$t('general.user')" v-model="filter.roles" @change="fetchData('o')">
                    <el-option v-for="(item, key) in operatorList" :label="key" :key="key" :value="item"></el-option>
                </el-select>
                <el-input :placeholder="$t('userAccount.email')" v-model="filter.tmpEmail" @change="fetchData('e')" clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-input :placeholder="$t('general.name')" v-model="filter.tmpContactPersion" @change="fetchData('c')" clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-button class="right" aria-label="plus icon" icon="el-icon-plus" @click="openDialog(0)"></el-button>
            </div>
            <el-table :data="tableData" class="moreCol" v-loading="isLoading" style="width: 100%">
                <el-table-column :label="$t('general.name')" width="300">
                    <template slot-scope="scope">
                        {{ clientName(scope.row) }}
                    </template>
                </el-table-column>

                <el-table-column :label="$t('userAccount.logo')" width="300">
                    <template slot-scope="scope">
                        <img v-if="scope.row.picture" :src="getImageUrl(scope.row.picture)" class="logo" :style="{maxHeight: '50px',maxWidth:'50px'}" alt="userAccount">
                    </template>
                </el-table-column>

                <el-table-column :label="$t('userAccount.mobile')" width="300">
                    <template slot-scope="scope">
                        {{ scope.row.phoneNumber ? scope.row.phoneNumber : '' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('userAccount.mobileVerification')" width="200">
                    <template slot-scope="scope">
                        {{ convertBooleanToString(scope.row.phoneNumberConfirmed) }}
                    </template>
                </el-table-column>

                <el-table-column prop="email" :label="$t('userAccount.email')" width="200"></el-table-column>
                <el-table-column prop="emailConfirmed" :label="$t('userAccount.emailVerification')" width="200">
                    <template slot-scope="scope">
                        {{ convertBooleanToString(scope.row.emailConfirmed) }}
                    </template>
                </el-table-column>

                <el-table-column :label="$t('general.action')" width="182">
                    <template slot-scope="scope">
                        <el-button class="no-bg i" icon="el-icon-lock" aria-label="password icon" @click="openPwdDialog(scope.row.id)"></el-button>
                        <el-button class="no-bg edit" aria-label="edit icon" @click="openDialog(1, scope.row)"></el-button>
                        <el-button class="no-bg i" icon="el-icon-user" aria-label="roles icon" @click="openRolesDialog(scope.row)"></el-button>
                        <el-button class="no-bg delete" aria-label="delete icon" @click="openDeleteDialog(scope.row)"></el-button>

                    </template>
                </el-table-column>
            </el-table>
            <div class="total">{{ $t("general.result", {item:total}) }}</div>
            <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
            </el-pagination>
        </div>
        <el-dialog :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')" width="600px" :visible.sync="dialog.visible" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false" @close="closeDialog(null,'create')" v-loading="dialog.isLoading">
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
                    <div :class="{'hide': (dialog.type===0),'form-item':true}">
                        <el-tabs v-model="activeImageTab">
                            <el-tab-pane :label="$t('userAccount.uploadPicture')" name="upload">
                                <el-upload ref="updateImg" class="upload-demo" list-type="picture-card" :action="dialog.$Api" :data="dialog.uploadParams" accept="image/gif,image/jpeg,image/png,image/jpg" :limit="1" :auto-upload="false" :on-exceed="handleExceed" :before-upload="onBeforeUploadPic" :on-success="handleSuccess" :on-error="handleError" :on-change="handleFileChange" :on-remove="handleFileChange" :file-list="dialog.file">
                                    <i class="el-icon-plus"></i>
                                </el-upload>
                            </el-tab-pane>
                            <el-tab-pane :label="$t('userAccount.addPictureUrl')" name="addUrl">
                                <div class="form-item" v-if="activeImageTab!=='upload'">
                                    <el-form-item prop="originalImg">
                                        <el-input v-model="dialog.info.originalImg"></el-input>
                                    </el-form-item>
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div>

                    <div :class="{'hide': (dialog.type===0),'form-item':true}">
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
        <ChangePwd :show="pwdDialog.show" :name="pwdDialog.name" :id="pwdDialog.id" @close="closeDialog(null,'edit')"></ChangePwd>
        <DeleteUser :show="deleteDialog.show" :email="deleteDialog.email" :id="deleteDialog.id" @close="(e)=>closeDialog(e,'delete')"></DeleteUser>
        <AddRoles :show="addRolesDialog.show" :id="addRolesDialog.id" @close="closeDialog(null,'addroles')"></AddRoles>

    </div>
</template>

<script>
import {
    $HTTP_getOperatorList,
    $HTTP_getOperatorUsersList,
    $HTTP_updateOperator,
    $HTTP_registerOperator,
    $HTTP_updateImage,
    $HTTP_getUserInfo
} from "@/api/api";
import { $GLOBAL_AUTH, $GLOBAL_BASE_URL, $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import { setScrollBar, catchErrors } from "@/utils/function";
import ChangePwd from "@/components/userAccount/changePwd";
import DeleteUser from "@/components/userAccount/deleteUser";
import AddRoles from "@/components/userAccount/addRoles";
import { validateImageUrl, validateEmail, validatePassword } from "@/utils/validation";
export default {
    components: {
        ChangePwd,
        DeleteUser,
        AddRoles
    },
    data() {
        var validateConfirmedNewPassword = (rule, value, callback) => {
            if (value === "") {
                callback(new Error(i18n.t("validation.confirmEmptyPasswordValidation")));
            } else if (value !== this.dialog.info.password) {
                callback(new Error(i18n.t("validation.validatePasswordMatch")));
            } else {
                callback();
            }
        };

        return {
            lang: this.$store.state.lang,
            operatorList: {},
            activeImageTab: "upload",
            filter: {
                roles: [],
                tmpEmail: "",
                emailSearch: "",
                tmpContactPersion: "",
                personSearch: ""
            },
            isLoading: false,
            tableData: [],
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT,
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
                    originalImg: ""
                },
                uploadParams: {},
                $Api: ""
            },
            pwdDialog: {
                id: "",
                name: "",
                show: false
            },
            deleteDialog: {
                id: "",
                email: "",
                show: false
            },
            addRolesDialog: {
                id: "",
                show: false
            },
            rules: {
                email: [{ validator: validateEmail }],
                password: [{ validator: validatePassword }],
                confirmPassword: [{ validator: validateConfirmedNewPassword }],
                originalImg: [{ validator: validateImageUrl }]
            },
            showPasswordStatus: {
                showPassword: false,
                showConfirmPassword: false
            },
            globalAuth: $GLOBAL_AUTH,
            globalBaseUrl: $GLOBAL_BASE_URL,
            imageUpdatedId: null
        };
    },
    computed: {
        clientName() {
            return (customer) => customer.firstName + " " + customer.lastName;
        },
        convertBooleanToString() {
            return (value) => value.toString();
        },
        selectedOrganization: function () {
            return this.$store.state.selectedOrganization;
        },
        userRole: function () {
            return this.$store.state.role;
        }
    },
    watch: {
        selectedOrganization: function () {
            this.fetchData();
        }
    },
    created() {
        let fiics_user = this.$store.state.userInfo;
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
            if (!url.includes("https") && !url.includes("http") && url !== "") {
                final_url = this.globalBaseUrl + this.globalAuth + "/" + url;
            } else {
                final_url = url;
            }
            return final_url;
        },
        getOperatorList(param) {
            $HTTP_getOperatorList(param)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        if (this.filter.roles || this.filter.tmpEmail || this.filter.tmpContactPersion) {
                            this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                        }
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    let errorMessage = catchErrors("get users list", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        fetchData(type) {
            let param = {
                page: this.page,
                limit: this.limit
            };
            if (type === "e") {
                this.filter.emailSearch = this.filter.tmpEmail;
                this.page = 1;
                param["page"] = 1;
            } else if (type === "c") {
                this.filter.personSearch = this.filter.tmpContactPersion;
                this.page = 1;
                param["page"] = 1;
            } else if (type === "o") {
                this.page = 1;
                param["page"] = 1;
            }

            param.email = this.filter.emailSearch;
            param.name = this.filter.personSearch;
            param.role = this.filter.roles;
            let operatorUserParam = {};
            if (
                (this.selectedOrganization.length >= 1 && this.userRole !== "Admin") ||
                (this.userRole === "Admin" && this.selectedOrganization[0]?.name !== "All")
            ) {
                operatorUserParam.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
            }
            if (this.selectedOrganization[0]?.name === "All") {
                this.getOperatorList(param);
            } else {
                $HTTP_getOperatorUsersList(operatorUserParam)
                    .then((res) => {
                        let userIds;
                        if (res?.data?.length > 0) {
                            userIds = res.data.map((item) => item.id);
                            param.Ids = userIds;
                            this.getOperatorList(param);
                        } else {
                            this.tableData = [];
                            this.total = 0;
                        }
                    })
                    .catch((err) => {
                        let errorMessage = catchErrors("user list", err);
                        this.$message({ type: "warning", message: errorMessage });
                    });
            }
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
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
                    originalImg: ""
                };
            } else {
                const imgFileName = data.picture.split("images/operator/")[1];
                this.dialog.info = {
                    id: data.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    file: [
                        {
                            name: imgFileName,
                            url: data.picture
                        }
                    ],
                    phoneNumber: data.phoneNumber,
                    email: data.email,
                    originalImg: data.picture.includes("http") ? data.picture : ""
                };
            }
            this.dialog.uploadParams = {};
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
            that.$nextTick(() => {
                setScrollBar(".formVertical", this);
            });
        },
        handleExceed() {
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
        handleSuccess(response) {
            if (response.success == 1) {
                this.$message({
                    type: "success",
                    message: this.dialog.type ? i18n.t("general.sucAddMsg") : i18n.t("general.sucUpdateMsg")
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
        handleError() {
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
                            phoneNumber: this.dialog.info.phoneNumber
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
                                }
                            })
                            .then(() => {
                                if (
                                    (this.activeImageTab === "upload" && this.imagesArray !== null) ||
                                    (this.activeImageTab !== "upload" && this.dialog.info.originalImg !== "")
                                ) {
                                    const formData = new FormData();
                                    let id = this.dialog.info.id;
                                    if (this.activeImageTab === "upload" && this.imagesArray !== null) {
                                        formData.append("picture", this.imagesArray, this.imagesArray?.name);
                                        this.$refs?.operatorForm?.clearValidate("originalImg");
                                    } else {
                                        formData.append("pictureUrl", this.dialog.info.originalImg);
                                    }
                                    let config = {
                                        headers: {
                                            "Content-Type": "multipart/form-data"
                                        }
                                    };

                                    let params = {
                                        id: id,
                                        formData: formData,
                                        config: config
                                    };
                                    return $HTTP_updateImage(params)
                                        .then((res) => {
                                            if (res.succeeded) {
                                                this.imageUpdatedId = params.id;
                                                that.$message({
                                                    type: "success",
                                                    message: i18n.t("general.sucUpdateMsg")
                                                });
                                                that.imagesArray = null;

                                                that.fetchData();
                                                that.dialog.visible = false;
                                            }
                                        })
                                        .catch((err) => {
                                            let errorMessage = catchErrors("update image", err);
                                            that.$message({ type: "warning", message: errorMessage });
                                            that.fetchData();
                                        });
                                } else {
                                    that.fetchData();
                                    that.dialog.visible = false;
                                }
                            })
                            .then(() => {
                                // get user info if it is updated(shown in the main tab)
                                let fiicsUser = this.$store.state.userInfo;
                                let userId = fiicsUser.id;
                                if (this.imageUpdatedId === userId) {
                                    $HTTP_getUserInfo()
                                        .then((res) => {
                                            let data = res;
                                            this.$store.dispatch("setUser", data);
                                        })
                                        .catch((err) => {
                                            let errorMessage = catchErrors("user info", err);
                                            this.$message({ type: "warning", message: errorMessage });
                                        });
                                }
                            })
                            .catch((err) => {
                                let errorMessage = catchErrors("get user info", err);
                                that.$message({ type: "warning", message: errorMessage });
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
                            confirmPassword: this.dialog.info.confirmPassword
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
                                let errorMessage = catchErrors("register user", err);
                                that.$message({ type: "warning", message: errorMessage });
                                that.dialog.isLoading = false;
                            });
                    }
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog(e, dialog) {
            if (dialog === "create") {
                this.$refs.updateImg && this.$refs.updateImg.clearFiles();
            } else if (dialog === "edit") {
                this.pwdDialog.show = false;
            } else if (dialog === "addroles") {
                this.addRolesDialog.show = false;
            } else if (dialog === "delete") {
                this.deleteDialog.show = false;
                // if final item is deleted take to previous page if present
                if (e && this.tableData.length === 1) {
                    if (this.page >= 2) {
                        this.page = this.page - 1;
                    } else {
                        this.page = 1;
                    }
                }
            }

            this.fetchData();
            this.dialog.info = {
                email: "",
                password: "",
                confirmPassword: ""
            };
            this.$nextTick(() => {
                this.$refs?.operatorForm?.clearValidate("email");
                this.$refs?.operatorForm?.clearValidate("password");
                this.$refs?.operatorForm?.clearValidate("confirmPassword");
                this.$refs?.operatorForm?.clearValidate("originalImg");
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
        }
    }
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
