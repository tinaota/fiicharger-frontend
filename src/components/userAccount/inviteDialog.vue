<template>
    <el-dialog :title="$t('general.add')" width="30%" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <el-form ref="inviteDialogForm" :rules="rules" :model="dialog" class="inviteDialog"  @submit.prevent.native="sendInvite">
            <div class="form-item">
                <el-form-item prop="email" style="margin-bottom:0">
                    <div class="label">{{ $t('userAccount.email') }}<span style="color:red"><strong>* </strong></span></div>
                    <el-input class="inputLabel" v-model="dialog.email"></el-input>
                </el-form-item>
            </div>
        </el-form>
        <span slot="footer" class="dialog-footer" style="position:absolute;bottom:10px;right:15px;">
            <el-button size="small" style="margin-bottom:5px" @click="visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" style="margin-bottom:5px" type="primary" @click="sendInvite">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>
<script>
import { validateEmail } from "@/utils/validation";
import { $HTTP_inviteUsersByEmail } from "@/api/api";
export default {
    props: { show: Boolean, data: Object },
    emits: ["close"],
    data() {
        return {
            isLoading: false,
            visible: false,
            dialog: {
                email: ""
            },
            rules: {
                email: [{ validator: validateEmail }]
            }
        };
    },
    mounted() {
        this.visible = this.show;
    },
    methods: {
        sendInvite() {
            this.$refs.inviteDialogForm.validate((valid) => {
                if (valid) {
                    let params = {};
                    params.operatorId = this.data.id;
                    params.email = this.dialog.email;
                    $HTTP_inviteUsersByEmail(params)
                        .then((res) => {
                            if (res==="") {
                                this.$message({
                                    type: "success",
                                    message: i18n.t("general.sucUpdateMsg")
                                });
                                this.closeDialog();
                                this.visible = false;
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            this.$message({
                                type: "warning",
                                message: err.data
                            });
                            this.closeDialog();
                            this.visible = false;
                        });
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog() {
            this.dialog.email = "";
            this.$emit("close", true);
        }
    }
};
</script>

<style lang = "scss">
.inputLabel input {
    height: 40px !important;
}
@media (max-width: 1080px) {
    .inviteDialog {
        margin-bottom: 50px;
    }
}
</style>
