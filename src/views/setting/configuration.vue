<template>
    <el-dialog :title="$t('general.settings')" width="80%" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="configuration table-result">
            <el-button class="cross" size="small" @click="isUpdate = false; visible = false;">X</el-button>
            <div class="formVertical">
                <el-table :data="configurations" v-loading="isLoading">
                    <el-table-column prop="key" :label="$t('general.type')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('general.accessibility')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.isReadOnly? 'R' : 'RW' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" :label="$t('general.description')" :min-width="6"></el-table-column>
                    <el-table-column prop="value" :label="$t('general.value')" :min-width="2"></el-table-column>
                    <el-table-column prop="type" :label="$t('general.type')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('general.value')" :min-width="2">
                        <template slot-scope="scope">
                            <div v-if="scope.row.type==='boolean'">
                                <el-switch v-model="scope.row.value" active-color="#13ce66" inactive-color="#ff4949">
                                </el-switch>
                            </div>
                            <div v-else>
                                nth
                            </div>
                        </template>
                    </el-table-column>

                </el-table>
            </div>
        </div>

    </el-dialog>
</template>

<script>
import { $HTTP_getConfiguration } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    props: {
        show: Boolean,
        chargePointId: String
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            defaultChargePointId: null,
            configurations: []
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        that.defaultChargePointId = that.chargePointId;
        this.getConfiguration(that.chargePointId);
        that.$jQuery(".formVertical").length > 0 &&
            this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        that.$nextTick(() => {
            setScrollBar(".formVertical", that);
        });
    },
    methods: {
        getConfiguration(id) {
            if (id !== null && id !== "" && id !== undefined) {
                let params = {};
                params.chargePointId = id;
                this.isLoading = true;
                $HTTP_getConfiguration(params)
                    .then((res) => {
                        if (res.length > 0) {
                            this.configurations = res;
                            this.isLoading = false;
                        } else {
                            this.configurations = [];
                            this.isLoading = false;
                        }
                    })
                    .catch((err) => {
                        this.configurations = [];
                        this.isLoading = false;

                        console.log(err);
                        this.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                    });
            }
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
        }
    }
};
</script>

<style lang = "scss" scoped>
.configuration {
    .cross {
        display: block;
        float: right;
        margin-top: -65px;
        margin-right: -25px;
    }
    .formVertical {
        max-height: 70vh !important;
    }
}
</style>
