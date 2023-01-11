<template>
    <el-dialog :title="dialogType==='create'?$t('general.create'):$t('general.modify')" :width="isIpad? '50%':'30%'" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="right-form formVertical">
            <el-form ref="updateIdTagsForm" :rules="rules" :model="dialog" style="width:96%">
                <div class="form-item">
                    <el-form-item prop="id">
                        <div class="label">ID</div>
                        <el-input v-model="dialog.value" :disabled="dialogType==='edit'"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="isBlocked">
                        <div class="label">{{ $t('idTags.blocked') }}</div>
                        <el-select class="select-small" v-model="dialog.isBlocked">
                            <el-option v-for="(item, key) in blockedList" :label="item" :key="key" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('idTags.parentIdTagId') }}</div>
                    <el-select class="select-small" v-model="dialog.parentIdTagId" filterable clearable v-loading="parentIdTagListLoading">
                        <el-option v-for="(item, key) in parentIdTagIdList" :label="item.value" :key="key" :value="item.id"></el-option>
                    </el-select>
                </div>
                <div class="form-item">
                    <el-form-item prop="expiryDate">
                        <div class="label">{{ $t('idTags.expiryDate') }}</div>
                        <el-date-picker v-model="dialog.expiryDate" type="datetime" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :picker-options="pickerOptions" :clearable="false">
                        </el-date-picker>
                    </el-form-item>
                </div>

            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="udpateIdTags">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import { validateIsEmpty } from "@/utils/validation";
import { $HTTP_createIdTags, $HTTP_updateIdTags } from "@/api/api";
import { $HTTP_getIdTagsList } from "@/api/api";

export default {
    props: { show: Boolean, dialogType: String, data: Array },
    data() {
        return {
            isLoading: false,
            isUpdate: false,
            visible: false,
            parentIdTagIdList: [],
            parentIdTagListLoading: false,
            $API: null,
            dialog: {
                value: "",
                expiryDate: null,
                isBlocked: "",
                parentIdTagId: null
            },
            blockedList: ["true", "false"],
            rules: {
                value: [{ validator: validateIsEmpty }],
                isBlocked: [{ validator: validateIsEmpty }],
                expiryDate: [{ validator: validateIsEmpty }]
            },
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() + 86400000 < Date.now();
                }
            }
        };
    },
    computed: {
        isIpad() {
            // check if it is ipad or not
            return screen.width <= 1280;
        }
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        that.isUpdate = false;
        if (that.visible) {
            if (that.dialogType === "create") {
                this.$API = $HTTP_createIdTags;
            } else if (that.dialogType === "edit") {
                this.$API = $HTTP_updateIdTags;
                this.parentIdTagListLoading = true;

                if (this.data !== undefined) {
                    this.dialog = {
                        ...this.data[0],
                        parentIdTagId: this.data[0].parentIdTagId,
                        expiryDate: new Date(this.data[0].expiryDate)
                    };
                    // complete loading after variable is loaded
                    this.parentIdTagListLoading = false;
                }
            }
        }

        this.getParentIdTagList();

        that.$jQuery(".formVertical").length > 0 &&
            this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        that.$nextTick(() => {
            setScrollBar(".formVertical", that);
        });
    },
    methods: {
        getParentIdTagList() {
            this.parentIdTagListLoading = true;
            $HTTP_getIdTagsList()
                .then((res) => {
                    if (res?.data?.length > 0) {
                        this.parentIdTagIdList = res.data;
                        this.parentIdTagListLoading = false;
                    } else {
                        this.parentIdTagListLoading = false;
                    }
                })
                .catch((err) => {
                    console.log("idTagListError", err);
                    this.parentIdTagListLoading = false;
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        udpateIdTags() {
            this.$refs.updateIdTagsForm.validate((valid) => {
                if (valid) {
                    const that = this;
                    that.isLoading = true;
                    let params = {};
                    if (that.dialogType === "create") {
                        params = { ...that.dialog, Id: that.dialog.value };
                    } else if (that.dialogType === "edit") {
                        params = { ...that.dialog };
                    }

                    let _expiryDate =
                        params?.expiryDate !== null
                            ? new Date(params?.expiryDate).toISOString()
                            : null;
                    // convert to universal date and time
                    params.expiryDate = _expiryDate;
                    params.isBlocked =
                        params.isBlocked === "true" ? true : false;
                    params.parentIdTagId =
                        params.parentIdTagId === ""
                            ? null
                            : params.parentIdTagId;
                    this.$API(params)
                        .then((res) => {
                            that.isLoading = false;
                            if (res) {
                                that.$message({
                                    type: "success",
                                    message: i18n.t("general.sucUpdateMsg")
                                });
                                that.isUpdate = true;
                                that.visible = false;
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            that.visible = false;
                            let _errors = err?.data?.errors
                                ? Object.values(err?.data?.errors)
                                : err?.data;
                            that.$message({
                                type: "warning",
                                message: _errors.toString()
                            });
                        });
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog() {
            this.dialog = {
                value: "",
                expiryDate: null,
                isBlocked: "",
                created: "",
                modified: "",
                parentIdTagId: null
            };

            this.$nextTick(() => {
                this.$refs?.updateIdTagsForm?.clearValidate("value");
                this.$refs?.updateIdTagsForm?.clearValidate("isBlocked");
                this.$refs?.updateIdTagsForm?.clearValidate("expiryDate");
            });

            this.$emit("close", this.isUpdate);
        }
    }
};
</script>

<style lang = "scss" scoped>
</style>
