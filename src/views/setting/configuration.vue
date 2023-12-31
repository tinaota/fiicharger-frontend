<template>
    <el-dialog :title="$t('general.settings')" width="80%" style="margin-top:-6vh" :visible.sync="visible" custom-class="configurationDialog" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="configuration table-result">
            <el-button class="cross" size="small" @click="isUpdate = false; visible = false;">X</el-button>
            <div class="filter" v-if="!selectedKey">
                <el-select class="autoresizeselect configurationSelect" v-model="filter.selectedConfiguration" :placeholder="$t('general.customConfigurationPlaceholder')" v-loading="configurationSearchList.isLoading" @change="getConfiguration(chargePointId)" clearable multiple filterable allow-create default-first-option>
                    <el-option v-for="item in configurationSearchList.data" :label="item.key" :key="item.key" :value="item.key"></el-option>
                </el-select>
            </div>
            <div class="formVertical" :key="componentKey">
                <el-table :data="configurations" v-loading="isLoading">
                    <el-table-column prop="key" :label="$t('general.key')" width="300"></el-table-column>
                    <el-table-column :label="$t('general.accessibility')" width="100">
                        <template slot-scope="scope">
                            {{ scope.row.isReadOnly? 'R' : 'RW' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="description" :label="$t('general.description')" width="650"></el-table-column>
                    <el-table-column :label="$t('general.value')" width="400">
                        <template slot-scope="scope">
                            <div v-if="scope.row.type==='boolean'">
                                <SwitchComponent :rowData="scope.row" @switchClicked="updateConfiguration"></SwitchComponent>
                            </div>
                            <!-- use input component for all the other types(integer, empty, CSL) -->
                            <div v-else>
                                <InputComponent :rowData="scope.row" @saveInputClicked="updateConfiguration"></InputComponent>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

    </el-dialog>
</template>

<script>
import { $HTTP_getConfiguration, $HTTP_updateConfiguration } from "@/api/api";
import { setScrollBar, catchErrors } from "@/utils/function";
import SwitchComponent from "@/views/setting/switchComponent";
import InputComponent from "@/views/setting/inputComponent";
export default {
    components: {
        SwitchComponent,
        InputComponent
    },
    props: {
        show: Boolean,
        chargePointId: String,
        selectedKey: String
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            defaultChargePointId: null,
            configurations: [],
            componentKey: 0,
            configurationSearchList: {
                data: [],
                isLoading: false
            },
            filter: {
                selectedConfiguration: []
            }
        };
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        that.defaultChargePointId = that.chargePointId;
        if (this.selectedKey) {
            this.filter.selectedConfiguration = this.selectedKey;
        } else {
            this.filter.selectedConfiguration = [];
        }
        this.getConfiguration(that.chargePointId);
    },
    methods: {
        getConfiguration(id) {
            if (id !== null && id !== "" && id !== undefined) {
                let params = {};
                params.chargePointId = id;
                let configurationLength = this.filter.selectedConfiguration.length;
                if (configurationLength > 0) {
                    params.keys = this.filter.selectedConfiguration;
                }
                this.isLoading = true;
                $HTTP_getConfiguration(params)
                    .then((res) => {
                        if (res.length > 0) {
                            this.configurations = this.sortByKey(res);
                            this.isLoading = false;
                            this.forceRerender();
                            this.runScrollFunction();
                            // only when filter is empty
                            // reserves all list for filter
                            if (this.filter.selectedConfiguration.length === 0) {
                                this.configurationSearchList.data = this.sortByKey(res);
                            }
                        } else {
                            this.configurations = [];
                            this.isLoading = false;
                        }
                    })
                    .catch((err) => {
                        this.configurations = [];
                        this.isLoading = false;
                        let errorMessage = catchErrors("configurations", err);
                        this.$message({ type: "warning", message: errorMessage });
                    });
            }
        },
        sortByKey(data) {
            return data.sort((firstItem, secondItem) => {
                let firstKey = firstItem.key;
                let secondKey = secondItem.key;
                if (firstKey < secondKey) {
                    return -1;
                }
                if (firstKey > secondKey) {
                    return 1;
                }
                return 0;
            });
        },
        updateConfiguration(data) {
            let params = { ...data };
            params.chargePointId = this.chargePointId;

            $HTTP_updateConfiguration(params)
                .then((res) => {
                    if (res === "Accepted") {
                        this.$message({
                            type: "success",
                            message: i18n.t("actions.configurationAccepted")
                        });
                        this.getConfiguration(this.chargePointId);
                    } else if (res === "NotSupported") {
                        this.$message({
                            type: "warning",
                            message: i18n.t("actions.configurationNotSupported")
                        });
                        this.getConfiguration(this.chargePointId);
                    }
                })
                .catch((err) => {
                    let errorMessage = catchErrors("configurations", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        forceRerender() {
            this.componentKey += 1;
        },
        closeDialog() {
            this.filter.selectedConfiguration = [];
            this.$emit("close", this.isUpdate);
        },
        runScrollFunction() {
            const that = this;
            that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar("destroy");
            that.$nextTick(() => {
                setScrollBar(".formVertical", that);
            });
        }
    }
};
</script>

<style lang = "scss" scoped>
.configurationDialog {
    margin-top: 8vh;
    .configuration {
        .cross {
            display: block;
            float: right;
            margin-top: -65px;
        }
        .formVertical {
            max-height: 68vh !important;
        }

        .filter {
            display: flex;
            .configurationSelect {
                width: 40vw;
                height: auto;
            }
        }
    }
}
</style>
