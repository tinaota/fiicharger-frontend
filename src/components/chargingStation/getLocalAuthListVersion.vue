<template>
    <el-dialog
        :title="$t('chargingStation.getLocalAuthListVersion')"
        :visible.sync="visible"
        @close="closeDialog()">
        <hr/>
        <div class="result-content" v-loading="isLoading">
            <p>{{ $t('sendLocalList.localAuthListVersion') }}: <span>{{ versionData }}</span></p>
        </div>
    </el-dialog>
</template>

<script>
import { $HTTP_getLocalAuthListVersion } from "@/api/api";
import { catchErrors } from "@/utils/function";
export default {
    props: {
        chargePointId: String,
        show: Boolean
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            logTimeRange: [],
            versionData: ""
        }
    },
    mounted(){},
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                if (that.visible) {
                    that.$nextTick(() => {
                        this.getVersion(this.$props.chargePointId)
                    });
                }
            }
        }
    },
    methods: {
        getVersion(id){
            this.isLoading = true;
            const that = this;
            const param = {
                chargePointId: id
            }
            $HTTP_getLocalAuthListVersion(param)
                .then( res => {
                    this.isLoading = false;
                    this.versionData = res;
                })
                .catch( err => {
                    this.isLoading = false;
                    let errorMessage = catchErrors("get local auth list", err);
                    this.$message({ type: "warning", message: errorMessage });
                })
            },
            closeDialog() {
                this.$emit('close', false);
            }
    }
}
</script>
<style lang = "scss" scoped>
.el-dialog{
    width: 500px;
}
</style>
