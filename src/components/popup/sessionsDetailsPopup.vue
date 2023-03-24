<template>
    <el-dialog custom-class="session-dialog" style="overflow:hidden" width="90%" top="8vh" :visible.sync="visible" :show-close="false" @close="closeDialog()">
        <div class="sessionDetails scrollSessions">
            <div class="eachRow">
                <div class="eachColumn mainDetails paymentBorder" v-loading="cdrDataIsLoading">
                    <h3>{{$t('general.paymentDetails')}}</h3>
                    <div class="mainDetailsBody">
                        <div class="dataColumn">
                            <div class="item">
                                <div class="label">{{$t('general.status')}}</div>
                                <div class="info">
                                    {{cdrData?.status}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.isHomeCharging')}}</div>
                                <div class="info">
                                    {{cdrData?.isHomeCharging?'true':'false'}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.payment') + ' ID'}}</div>
                                <div class="info">
                                    {{cdrData?.payment?.id}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.paymentStatus')}}</div>
                                <div class="info">
                                    {{cdrData?.payment?.paymentStatus}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.remark')}}</div>
                                <div class="info">
                                    {{ cdrData?.remark!==null? cdrData.remark:'' }}
                                </div>
                            </div>
                        </div>
                        <div class="dataColumn">
                            <div class="item">
                                <div class="label">{{$t('general.canceledAt')}}</div>
                                <div class="info">
                                    {{cdrData?.payment?.canceledAt?getLocTime(cdrData?.payment.canceledAt):''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.created')}}</div>
                                <div class="info">
                                    {{cdrData?.payment?.created?getLocTime(cdrData.payment.created):''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.paymentMethod')+ ' ID'}}</div>
                                <div class="info">
                                    {{cdrData?.payment  && cdrData?.payment.paymentMethod?cdrData.payment.paymentMethod?cdrData.payment.paymentMethod.id:'':''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.paymentMethod')}}</div>
                                <i v-if="cdrData?.payment?.paymentMethod?.cardBrand?.toLowerCase().includes('stripe')" class="fa fa-cc-stripe" style="font-size:22px;color:blue"></i>
                                <i v-else-if="cdrData?.payment?.paymentMethod?.cardBrand?.toLowerCase().includes('visa')" class="fa fa-cc-visa" style="font-size:22px;color:blue"></i>
                                <i v-else-if="cdrData?.payment?.paymentMethod?.cardBrand?.toLowerCase().includes('express')" class="fa fa-cc-amex" style="font-size:22px;color:blue"></i>
                                <i v-else-if="cdrData?.payment?.paymentMethod?.cardBrand?.toLowerCase().includes('club')" class="fa fa-cc-diners-club" style="font-size:22px;color:blue"></i>
                                <i v-else-if="cdrData?.payment?.paymentMethod?.cardBrand?.toLowerCase().includes('discover')" class="fa fa-cc-discover" style="font-size:22px;color:blue"></i>
                                <i v-else-if="cdrData?.payment?.paymentMethod?.cardBrand?.toLowerCase().includes('jcb')" class="fa fa-cc-jcb" style="font-size:22px;color:blue"></i>
                                <i v-else-if="cdrData?.payment?.paymentMethod?.cardBrand?.toLowerCase().includes('mastercard')" class="fa fa-cc-mastercard" style="font-size:22px;color:blue"></i>
                                <i v-else-if="cdrData?.payment?.paymentMethod?.cardBrand?.toLowerCase().includes('unknown')" class="fa fa-credit-card-alt" style="font-size:22px;color:blue"></i>
                                <div class="info" style="padding-top:2px;margin-left:5px">
                                    <span>
                                        {{ cdrData?.payment  && cdrData?.payment.paymentMethod? '.... ' +cdrData.payment.paymentMethod.cardLast4:'' }}
                                    </span>
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.receiptUrl')}}</div>
                                <div class="info">
                                    <a v-if="cdrData?.payment?.receiptUrl" :href="cdrData.payment.receiptUrl" target="_blank">{{$t('general.receipt')}}</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="eachColumn mainDetails costBorder" v-loading="cdrDataIsLoading">
                    <h3>{{$t('general.cost')}}</h3>
                    <div class="mainDetailsBody">
                        <div class="dataColumn">
                            <div class="item">
                                <div class="label">{{$t('general.totalFixedCost')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.fixed?.excludingVat.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalEnergyCost')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.energy?.excludingVat.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalTimeCost')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.time?.excludingVat.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalParkingCost')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.parking?.excludingVat.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalReservationCost')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.reservation?.excludingVat}}
                                </div>
                            </div>
                            <div class="item total">
                                <div class="label">{{$t('general.totalCost')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.total?.excludingVat.toFixed(2)}}
                                </div>
                            </div>
                        </div>
                        <div class="dataColumn">
                            <div class="item">
                                <div class="label">{{$t('general.totalFixedCostWithVat')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.fixed?.includingVat.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalEnergyCostWithVat')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.energy?.includingVat.toFixed(2)}}
                                </div>
                            </div>

                            <div class="item">
                                <div class="label">{{$t('general.totalTimeCostWithVat')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.time?.includingVat.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalParkingCostWithVat')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.parking?.includingVat.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalReservationCostWithVat')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.reservation?.includingVat}}
                                </div>
                            </div>
                            <div class="item total">
                                <div class="label">{{$t('general.totalCostWithVat')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.total?.includingVat.toFixed(2)}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="eachRow">
                <div class="eachColumn mainDetails">
                    <div class="mainDetailsBody statusFlexDirection">
                        <div class="header graphHeader">
                            <el-select class="select-small customSelect" v-model="graphSelected" :placeholder="$t('general.location')">
                                <el-option v-for="item in graphList" :label="$t(`general.${item}`)" :key="item" :value="item"></el-option>
                            </el-select>
                        </div>
                        <div class="dataColumn" v-if="graphSelected==='status'">
                            <SessionStatus :data="data"></SessionStatus>
                        </div>
                        <div class="dataColumn" v-if="graphSelected==='power'">
                            <Power :data="data"></Power>
                        </div>
                        <div class="dataColumn" v-if="graphSelected==='currentVoltage'">
                            <CurrentVoltage :data="data"></CurrentVoltage>
                        </div>
                        <div class="dataColumn">
                            <div class="item">
                                <div class="label">{{$t('chargingStation.stationName')}}</div>
                                <div class="info">
                                    {{data?.chargeStationName}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.chargePointName')}}</div>
                                <div class="info">
                                    {{data?.chargePointName}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.connectorId')}}</div>
                                <div class="info">
                                    {{connectorId}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.power')}}</div>
                                <div class="info">
                                    {{data?.chargePointPowerKw}} kW
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.powerType')}}</div>
                                <div class="info">
                                    {{data?.chargePointPowerType}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('menu.location')}}</div>
                                <div class="info">
                                    {{data?.address?.street + ', ' +data?.address?.city+', '+data?.address?.state+', '+data?.address?.country+', '+data?.address?.zipCode}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="eachColumn mainDetails sessionBorder" v-loading="cdrDataIsLoading">
                    <div class="mainDetailsBody">
                        <div class="dataColumn ">
                            <h3>{{$t('general.sessionDetails')}}</h3>
                            <div class="item">
                                <div class="label">{{$t('general.authMethod')}}</div>
                                <div class="info">
                                    {{data?.authMethod ? data.authMethod:''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.created')}}</div>
                                <div class="info">
                                    {{ cdrData?.created!==null? getLocTime(cdrData.created):'' }} </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.modified')}}</div>
                                <div class="info">
                                    {{ cdrData?.modified!==null? getLocTime(cdrData.modified):'' }} </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalEnergy') + ' (kWh)'}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.energyKwh ? cdrData.cost.energyKwh.toFixed(2):''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalTime')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.totalTimeSec? getConvertedTime(cdrData.cost.totalTimeSec):''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.totalParkingTime')}}</div>
                                <div class="info">
                                    {{cdrData?.cost?.parkingTimeSec===0?'0s' :getConvertedTime(cdrData?.cost?.parkingTimeSec)}}
                                </div>
                            </div>
                            <h3 class="reservation">{{$t('chargingStation.reservation')}}</h3>
                            <div class="item">
                                <div class="label">ID</div>
                                <div class="info">
                                    {{reservationData?.id}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('menu.idTag')}}</div>
                                <div class="info">
                                    {{reservationData?.idTag}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('general.status')}}</div>
                                <div class="info">
                                    {{reservationData?.status}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.startDateTime')}}</div>
                                <div class="info">
                                    {{reservationData?.created ? getLocTime(reservationData.created):''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.expiryDateTime')}}</div>
                                <div class="info">
                                    {{reservationData?.expiryDate ? getLocTime(reservationData.expiryDate):''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.usedDateTime')}}</div>
                                <div class="info">
                                    {{reservationData?.used ? getLocTime(reservationData.used):''}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.cancelledDateTime')}}</div>
                                <div class="info">
                                    {{reservationData?.cancelled ? getLocTime(reservationData.cancelled):''}}
                                </div>
                            </div>
                        </div>
                        <div class="dataColumn transactionBorder transaction">
                            <h3>{{$t('menu.transaction')}}</h3>
                            <div class="item">
                                <div class="label">ID</div>
                                <div class="info">
                                    {{transactionData?.id}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.startIdTag')}}</div>
                                <div class="info">
                                    {{transactionData?.startIdTag}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.stopIdTag')}}</div>
                                <div class="info">
                                    {{transactionData?.stopIdTag}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.meterStart')+' (kWh)'}}</div>
                                <div class="info">
                                    {{transactionData?.meterStart?.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.meterStop')+' (kWh)'}}</div>
                                <div class="info">
                                    {{transactionData?.meterStop?.toFixed(2)}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.startTimestamp')}}</div>
                                <div class="info">
                                    {{ transactionData?.startTimestamp!==null? getLocTime(transactionData?.startTimestamp):'' }}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.stopTimestamp')}}</div>
                                <div class="info">
                                    {{ transactionData?.stopTimestamp!==null? getLocTime(transactionData?.stopTimestamp):'' }}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.stopReason')}}</div>
                                <div class="info">
                                    {{transactionData?.stopReason}}
                                </div>
                            </div>
                            <div class="item">
                                <div class="label">{{$t('chargingStation.meterTotal')+' (kWh)'}}</div>
                                <div class="info">
                                    {{transactionData?.meterTotal?.toFixed(2)}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>

</template>

<script>
import { transformUtcToLocTime, transformSecondsToReadableForm } from "@/utils/function";
import { $HTTP_getCDRInfoById, $HTTP_getAllTransactionsById, $HTTP_getAllReservationById } from "@/api/api";
import SessionStatus from "@/components/charts/config/SessionStatus";
import Power from "@/components/charts/config/Power";
import CurrentVoltage from "@/components/charts/config/CurrentVoltage";
import { setScrollBar, catchErrors } from "@/utils/function";

export default {
    props: {
        show: Boolean,
        data: Object
    },
    components: {
        SessionStatus,
        Power,
        CurrentVoltage
    },
    emits: ["close"],

    data() {
        return {
            visible: false,
            cdrDataIsLoading: false,
            cdrData: {},
            transactionData: {},
            transactionDataIsLoading: false,
            connectorId: "",
            reservationData: {},
            reservationDataIsLoading: false,
            graphSelected: "status",
            graphList: ["status", "power", "currentVoltage"]
        };
    },
    computed: {
        getLocTime() {
            return (item, format = "ll hh:mm:ss A") => transformUtcToLocTime(item, format);
        },
        getConvertedTime() {
            return (item) => transformSecondsToReadableForm(item);
        }
    },
    mounted() {
        this.visible = this.show;
        this.getCDRInfoById(this.data.cdrId);
        this.getTransactionInfoById(this.data.transactionId);
        this.getReservationInfoById(this.data.reservationId);
        // disable background scroll
        this.$jQuery(".scroll").mCustomScrollbar("disable");
        // enable front scroll
        setScrollBar(".scrollSessions", this);
    },
    methods: {
        getReservationInfoById(id) {
            if (id !== null) {
                let params = { reservationId: id };
                this.reservationDataIsLoading = true;
                $HTTP_getAllReservationById(params)
                    .then((res) => {
                        this.reservationData = res;
                        this.reservationDataIsLoading = false;
                    })
                    .catch((err) => {
                        this.reservationData = [];
                        this.reservationDataIsLoading = false;
                        let errorMessage = catchErrors("get reservation", err);
                        this.$message({ type: "warning", message: errorMessage });
                    });
            }
        },
        getTransactionInfoById(id) {
            if (id !== null) {
                let params = { transactionId: id };
                this.transactionDataIsLoading = true;
                $HTTP_getAllTransactionsById(params)
                    .then((res) => {
                        this.transactionData = res;
                        this.transactionDataIsLoading = false;
                        this.connectorId = res.connectorId;
                    })
                    .catch((err) => {
                        this.transactionData = [];
                        this.transactionDataIsLoading = false;
                        this.connectorId = "";
                        let errorMessage = catchErrors("get transaction info", err);
                        this.$message({ type: "warning", message: errorMessage });
                    });
            }
        },
        getCDRInfoById(id) {
            if (id !== null) {
                let params = { cdrId: id };
                this.cdrDataIsLoading = true;
                $HTTP_getCDRInfoById(params)
                    .then((res) => {
                        this.cdrData = res;
                        this.cdrDataIsLoading = false;
                    })
                    .catch((err) => {
                        this.cdrData = {};
                        this.cdrDataIsLoading = false;
                        let errorMessage = catchErrors("get cdr info", err);
                        this.$message({ type: "warning", message: errorMessage });
                    });
            }
        },
        closeDialog() {
            this.connectorId = "";
            this.graphSelected === "status";
            this.$emit("close", true);
            this.$jQuery(".scroll").mCustomScrollbar("update");
        }
    }
};
</script>

<style lang="scss" scoped>
.sessionDetails {
    width: 100%;
    display: flex;
    flex-direction: column;
    .eachRow {
        display: flex;
        width: 100%;
        .eachColumn {
            padding: 0 0 0 16px;
            width: 50%;
            &.mainDetails {
                min-height: 260px;
                .mainDetailsBody {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    &.statusFlexDirection {
                        flex-direction: column;
                    }
                    .dataColumn {
                        flex-grow: 1;
                        .item {
                            display: flex;
                            margin-bottom: 15px;
                            .label {
                                min-width: 150px;
                            }
                            .info {
                                margin-right: 50px;
                                font-weight: 600;
                                word-break: break-all;
                            }
                            &.total {
                                .label,
                                .info {
                                    border-top: 1px solid #525e69;
                                    padding-top: 10px;
                                    font-weight: 600;
                                }
                            }
                        }
                        &.transaction {
                            padding: 0 0 0 16px;
                        }
                        .reservation {
                            margin-top: 20px;
                        }
                    }
                }
            }
            &.paymentBorder {
                border-bottom: 1px solid #525e69;
            }
            &.costBorder {
                border-bottom: 1px solid #525e69;
                border-left: 1px solid #525e69;
                .mainDetailsBody {
                    .dataColumn {
                        .item {
                            .info {
                                min-width: 80px;
                                text-align: end;
                            }
                        }
                    }
                }
            }
            &.sessionBorder,
            .transactionBorder {
                border-left: 1px solid #525e69;
                padding: 0 0 0 16px;
            }
        }
    }
}
@media screen and (max-width: 1400px) {
    .sessionDetails {
        .eachRow {
            flex-wrap: wrap;
            .eachColumn {
                width: 100% !important;
                &.mainDetails {
                    height: 100% !important;
                }
                &.costBorder {
                    border-bottom: 1px solid #525e69;
                    border-left: none;
                }
                &.sessionBorder {
                    border-top: 1px solid #525e69;
                    border-left: none;
                }
            }
        }
    }
}
@media screen and (max-width: 700px) {
    .eachRow {
        margin-bottom: 5px;
        .mainDetailsBody {
            flex-wrap: wrap;
        }
        .eachColumn {
            .transactionBorder {
                border-top: 1px solid #525e69;
                border-left: none !important;
            }
        }
    }
}
</style>
