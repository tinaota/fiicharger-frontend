<template>
    <el-dialog :title="$t('chargingStation.startReservation')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="dialogForm">
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                <div class="info">{{ data.name }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                <div class="info">{{ data.ocppId }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.connector') }}</div>
                <el-select class="select-small info" v-model="param.connectorId" v-loading="connectorData.isLoading">
                    <el-option :value="0" :label="'0 ' + $t('general.default')"></el-option>
                    <el-option v-for="item in connectorData.data" :label="item.id + ' ' + getConnectorType(item.type)" :key="item.id" :value="item.id"></el-option>
                </el-select>
            </div>
            <div class="item">
                <div class="label">{{ $t('menu.idTag') }}</div>
                <el-select class="select-small info" v-model="param.idTag" filterable v-loading="idTagList.isLoading">
                    <el-option v-for="item in idTagList.data" :label="item.value" :key="item.id" :value="item.id"></el-option>
                </el-select>
            </div>
            <div class="item">
                <div class="label">{{ $t('idTags.expiryDate') }}</div>
                <el-date-picker v-model="param.expiryDate" type="datetime" popper-class="notNow" value-format="yyyy-MM-dd HH:mm" format="MMM dd yyyy hh:mm A" :picker-options="pickerOptions" :clearable="false">
                </el-date-picker>
            </div>
        </div>
        <p style="text-align:center;">
            <el-button size="small" type="primary" @click="reserveNow">{{ $t('general.perform') }}</el-button>
        </p>
    </el-dialog>
</template>

<script>
import { $HTTP_getIdTagsList, $HTTP_reserveNow } from "@/api/api";
import { setScrollBar, catchErrors } from "@/utils/function";
import { $CONNECTOR_TYPE_LIST } from "@/utils/global";

export default {
    props: {
        show: Boolean,
        data: Object,
        connectorData: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            param: {
                connectorId: 0,
                idTag: "",
                expiryDate: ""
            },
            idTagList: {
                isLoading: false,
                data: []
            },
            isUpdateReservation: false,
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() + 86400000 < Date.now();
                },
                shortcuts: [
                    {
                        text: i18n.t("chargingStation.timeOpt.1Min"),
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 1 * 60 * 1000);
                            picker.$emit("pick", date);
                        }
                    },
                    {
                        text: i18n.t("chargingStation.timeOpt.5Mins"),
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 5 * 60 * 1000);
                            picker.$emit("pick", date);
                        }
                    },
                    {
                        text: i18n.t("chargingStation.timeOpt.10Mins"),
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 10 * 60 * 1000);
                            picker.$emit("pick", date);
                        }
                    },
                    {
                        text: i18n.t("chargingStation.timeOpt.30Mins"),
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() + 30 * 60 * 1000);
                            picker.$emit("pick", date);
                        }
                    }
                ]
            },
            connectorTypeList: $CONNECTOR_TYPE_LIST
        };
    },
    computed: {
        getConnectorType() {
            return (item) => {
                let convertedValue = this.connectorTypeList.filter((powerType) => powerType.value === item);
                return convertedValue[0].name;
            };
        }
    },
    watch: {
        show: {
            handler() {
                this.visible = this.show;
                if (this.visible) {
                    this.fetchIdTags();
                    const date = new Date();
                    date.setTime(date.getTime() + 30 * 60 * 1000);
                    this.param.expiryDate = date;
                    this.$jQuery(".dialogForm").length > 0 && this.$jQuery(".dialogForm").mCustomScrollbar("destroy");
                    this.$nextTick(() => {
                        setScrollBar(".dialogForm", this);
                    });
                }
            }
        }
    },
    methods: {
        fetchIdTags() {
            this.idTagList.isLoading = true;
            $HTTP_getIdTagsList()
                .then((res) => {
                    this.idTagList.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.idTagList.data = res.data;
                    }
                })
                .catch((err) => {
                    this.idTagList.data = [];
                    let errorMessage = catchErrors("idTagListError", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        reserveNow() {
            if (!this.param.idTag) {
                this.$message.error(i18n.t("validation.emptyIdTagValidation"));
            } else if (!this.param.expiryDate) {
                this.$message.error(i18n.t("validation.emptyExpiryDateValidation"));
            } else {
                const that = this;
                let params = {
                    chargePointId: that.data.chargePointId,
                    connectorId: parseInt(that.param.connectorId),
                    idTag: that.param.idTag,
                    expiryDate: that.param?.expiryDate !== null ? new Date(that.param?.expiryDate).toISOString() : null
                };
                that.isLoading = true;
                $HTTP_reserveNow(params)
                    .then((res) => {
                        that.isLoading = false;
                        if (res === "Accepted") {
                            that.visible = false;
                            this.isUpdateReservation = true;
                            this.$message({
                                type: "success",
                                message: i18n.t(`actions.reserveNow${res}`)
                            });
                        } else {
                            that.visible = false;
                            this.isUpdateReservation = true;
                            this.$message({
                                type: "warning",
                                message: i18n.t(`actions.reserveNow${res}`)
                            });
                        }
                    })
                    .catch((err) => {
                        that.visible = false;
                        that.isLoading = false;
                        let errorMessage = catchErrors("reserveNow", err);
                        that.$message({ type: "warning", message: errorMessage });
                    });
            }
        },
        closeDialog() {
            this.param = {
                connectorId: 0,
                idTag: "",
                expiryDate: ""
            };
            this.$emit("close", this.isUpdateReservation);
        }
    }
};
</script>

<style lang = "scss" scoped>
.el-button {
    background: #0263ff;
    color: #fff;
    border: unset;
    font-size: 1rem;
    width: 130px;
    height: 50px;
    border-radius: 6px;
    text-align: center;
}
</style>
