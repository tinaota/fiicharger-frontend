<template>
    <el-dialog :title="$t('general.addRoles')" width="400px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                {{ $t('general.updateRolesUser') }}
            </div>

            <div class="roles-multi-select">
                <el-select class="autoresizeselect" v-model="value" clearable multiple filterable allow-create default-first-option>
                    <el-option v-for="item in options" :label="item" :key="item" :value="item"></el-option>
                </el-select>
                <p> {{ $t('general.changeRoles') }}
                    {{ value }}</p>
            </div>

        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="addRoles">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_getRoles, $HTTP_addRoles } from "@/api/api";
import { setScrollBar , catchErrors } from "@/utils/function";

export default {
    props: {
        id: String,
        show: Boolean
    },

    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            value: null,
            options: ["Admin", "Owner"]
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
                    this.$Api = $HTTP_addRoles;
                    let params = {
                        id: this.id
                    };
                    $HTTP_getRoles(params)
                        .then((res) => {
                            that.value = res;
                        })
                        .catch((err) => {
                            let errorMessage = catchErrors("add roles", err);
                            that.$message({ type: "warning", message: errorMessage });
                        });
                }
                that.$jQuery(".formVertical").length > 0 &&
                    this.$jQuery(".formVertical").mCustomScrollbar("destroy");
                that.$nextTick(() => {
                    setScrollBar(".formVertical", that);
                });
            }
        }
    },
    beforeDestroy() {},
    methods: {
        addRoles() {
            const that = this;
            let params = {
                id: that.id,
                roles: that.value
            };

            that.isLoading = true;

            this.$Api(params)
                .then((data) => {
                    that.isLoading = false;
                    if (data.succeeded) {
                        that.$message({
                            type: "success",
                            message: i18n.t("general.sucUpdateMsg")
                        });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    let errorMessage = catchErrors("add roles", err);
                    that.$message({ type: "warning", message: errorMessage });
                });
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
        }
    }
};
</script>
<style lang = "scss" scoped>
.el-dialog.pwd .el-dialog__body {
    height: 50vh;
}

.roles-multi-select {
    height: 150px;
    margin-top: 5px;
}
</style>
