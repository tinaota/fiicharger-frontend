<template>
    <el-dialog :title="$t('general.addRoles')" width="400px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                Choose roles to update to this user:
            </div>

            <div class="roles-multi-select">
                <multiselect v-model="value" :options="options" multiple :show-labels="false"></multiselect>
                <p>Change roles to : {{value}}</p>
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
import { setScrollBar } from "@/utils/function";
import Multiselect from "vue-multiselect";

export default {
    props: {
        id: String,
        show: Boolean,
    },
    components: { Multiselect },

    data() {
        return {
            lang: "",
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            value: null,
            options: ["Admin", "Owner"],
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
                        id: this.id,
                    };
                    $HTTP_getRoles(params)
                        .then((res) => {
                            that.value=res
                        })
                        .catch((err) => {
                            let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                            that.$message({ type: "warning", message: _errors.toString() });
                        });
                }
                that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
                that.$nextTick(() => {
                    setScrollBar(".formVertical", that);
                });
            },
        },
    },
    created() {
        const userData = JSON.parse(window.localStorage.getItem("fiics-user"));
        this.lang = window.localStorage.getItem("fiics-lang");
    },
    beforeDestroy() {},
    methods: {
        addRoles() {
            const that = this;
            let params = {
                id: that.id,
                roles: that.value,
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
                });
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
        },
    },
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

.multiselect__option--selected.multiselect__option--highlight {
    background: blue;
}
</style>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
