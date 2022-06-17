<template>
    <el-dialog :title="$t('general.delete')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                {{$t('general.deleteThis')}} {{$t('menu.cars').toLowerCase()}}?
                <h3>{{$t('menu.information')}}</h3>
                <p> {{$t('cars.maker')}}: {{make}}</p>
                <p> {{$t('cars.model')}}:{{carModel}}</p>
                <p> {{$t('cars.trim')}}: {{trim}}</p>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="deleteCars">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_deleteVehicle } from "@/api/api";

import { setScrollBar } from "@/utils/function";
export default {
    props: {
        id: Number,
        make: String,
        carModel: String,
        trim: String,
        show: Boolean,
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
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
                    this.$API = $HTTP_deleteVehicle;
                }
                that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
                that.$nextTick(() => {
                    setScrollBar(".formVertical", that);
                });
            },
        },
    },
    methods: {
        deleteCars() {
            const that = this;
            let params = {
                id: that.id,
            };

            that.isLoading = true;
            this.$API(params)
                .then((data) => {
                    console.log(data)
                    that.isLoading = false;
                    if (data.id === params.id) {
                        that.$message({ type: "success", message: i18n.t("general.sucUpdateMsg") });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    console.log(err);
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
.formVertical {
    min-height: 200px;
    div {
        min-height: 200px;
    }
}
</style>