<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/chargePoint' }">{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.chargeBoxId }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8">
                <div class="charge-point-info" v-loading="isLoading" v-if="chargePointById.length>=1">
                    <div class="upperBody rank-area firstCol">
                        <div class="item title">
                            <div class="label">{{ $t('chargingStation.charger') }}</div>
                            <div class="content">{{ chargePointById[0].name }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                            <div class="content">
                                {{ chargePointById[0].id }}
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.power') }}</div>
                            <div class="content">{{ chargePointById[0].powerKw }} KWH</div>

                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.connectionStatus') }}</div>
                            <div class="content">
                                <div v-if="chargePointById[0].connectionStatus===`Connected`">
                                    <span class="circle-status color1"></span>
                                    <span> {{ $t('general.connected') }}</span>
                                </div>

                                <div v-else>
                                    <span class="circle-status color5"></span>
                                    <span> {{ $t('general.disconnected') }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.type') }}</div>
                            <div class="content">{{ chargePointById[0].currentType }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                            <div class="content">{{ chargePointById[0].chargePrice? $t('chargingStation.onPeak') + ' '+ getSymbols(chargePointById[0].chargePrice.currencyType)+ chargePointById[0].chargePrice.onPeak.rate+ '/'+getSymbols(chargePointById[0].chargePrice.onPeak.type) :$t('general.free') }}</div>
                        </div>
                        <!-- add a condition to show only one free line -->
                        <div class="item" v-if="chargePointById[0].chargePrice">
                            <div class="label"></div>
                            <div class="content">{{ chargePointById[0].chargePrice? $t('chargingStation.offPeak') + ' '+getSymbols(chargePointById[0].chargePrice.currencyType)+ chargePointById[0].chargePrice.offPeak.rate+'/' +getSymbols(chargePointById[0].chargePrice.offPeak.type):$t('general.free') }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                            <div class="content">{{ chargePointById[0].chargePrice? getSymbols(chargePointById[0].chargePrice.currencyType)+ chargePointById[0].chargePrice.occupancy.rate+'/' +getSymbols(chargePointById[0].chargePrice.occupancy.type):$t('general.free') }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('general.installationDate') }}</div>
                            <div class="content">{{ getLocTime( chargePointById[0].created) }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.lastHeartbeat') }}</div>
                            <div class="content">{{ getLocTime(chargePointById[0].lastHeartbeat) }}</div>
                        </div>
                        <div class="item">
                            <div class="label">{{ $t('chargingStation.connectors') }}</div>
                            <Connector :dataObj="connectorStatuses.data" :chargerStatus="chargePointById[0].connectionStatus" :isBreak="true"></Connector>
                        </div>
                    </div>
                    <div class="card-8 rank-area secondCol">
                        <el-button size="medium" type="primary" @click="openDialog(chargePointById[0].id, 'configuration')"> {{ $t('general.settings') }}</el-button>
                        <div class="header">
                            <div class="title">{{ $t('general.action') }}</div>
                        </div>
                        <ul class="rank actions">
                            <li>
                                <span class="name">{{ $t('chargingStation.addChargingProfile') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction('add')">{{ $t('general.add') }}</el-button>
                            </li>
                            <li>
                                <span class="name">{{ $t('chargingStation.clearChargingProfile') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction('clear')">{{ $t('general.clear') }}</el-button>
                            </li>
                            <li>
                                <span class="name">{{ $t('chargingStation.diagnostics') }}</span>

                                <el-button type="primary" class="actionFunction" @click="runAction('start')">{{ $t('general.start') }}</el-button>
                            </li>
                            <li>
                                <span>
                                    {{ $t('chargingStation.updates') }}
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction('run')">{{ $t('general.run') }}</el-button>
                            </li>
                            <li>
                                <span>
                                    {{ $t('chargingStation.clearCache') }}
                                </span>
                                <el-button type="primary" class="actionFunction" @click="openDialog(chargePointById[0].id,'commonpopup', 'clearCache')">{{ $t('general.clear') }}</el-button>
                            </li>
                            <li>
                                <span>
                                    {{ $t('chargingStation.softReset') }}
                                </span>
                                <el-button type="primary" class="actionFunction" @click="openDialog(chargePointById[0].id,'commonpopup','softReset')">{{ $t('general.reset') }}</el-button>
                            </li>
                            <li>
                                <span>
                                    {{ $t('chargingStation.hardReset') }}
                                </span>
                                <el-button type="primary" class="actionFunction" @click="openDialog(chargePointById[0].id,'commonpopup','hardReset')">{{ $t('general.reset') }}</el-button>
                            </li>
                            <li>
                                <span>
                                    {{ $t('chargingStation.remoteTrigger') }}
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction(null, 'remoteTrigger')">{{ $t('general.run') }}</el-button>
                            </li>
                            <li>
                                <span>
                                    {{ $t('chargingStation.startReservation') }}
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction(null, 'reserveNow')">{{ $t('general.start') }}</el-button>
                            </li>
                        </ul>
                    </div>
                    <div class="card-8 rank-area thirdCol table-result">
                        <div class="header">
                            <div class="title">{{ $t('chargingStation.connectors') }}</div>
                        </div>
                        <el-table :data="connectorStatuses.data" class="moreCol" v-loading="connectorStatuses.isLoading">
                            <el-table-column prop="id" label="ID" :min-width="2"></el-table-column>
                            <el-table-column :label="$t('chargingStation.lastStatus')" :min-width="8">
                                <template slot-scope="scope">
                                    <el-tooltip v-if="scope.row.status==='Available'" :content="$t('general.available')" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status available"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Preparing'" :content="'Preparing'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='SuspendedEVSE'" :content="'SuspendedEVSE'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='SuspendedEV'" :content="'SuspendedEV'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Finishing'" :content="'Finishing'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Reserved'" :content="'Reserved'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Unavailable'" :content="'Unavailable'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status unavailable"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Faulted'" :content="'Faulted'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status unavailable"></span>
                                    </el-tooltip>
                                    <el-tooltip v-if="scope.row.status==='Charging'" :content="'Charging'" placement="bottom" effect="light" popper-class="custom">
                                        <span class="circle-status inUse"></span>
                                    </el-tooltip>
                                    <span style="margin-left:5px">{{ scope.row.status }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column :label="$t('general.type')" :min-width="7">
                                <template slot-scope="scope">
                                    {{ scope.row.type }}
                                    <i class="fa fa-pencil" aria-hidden="true" @click="openDialog(scope.row,'connectorType')"></i>
                                </template>
                            </el-table-column>
                            <!-- <el-table-column prop="powerKw" :label="$t('chargingStation.maxOutput')" :min-width="5"></el-table-column> -->
                            <el-table-column :label="$t('chargingStation.charging')" :width="146">
                                <template slot-scope="scope">
                                    <el-dropdown trigger="click">
                                        <el-button class="connectors_chargers">
                                            {{ $t('general.action') }}<i class="el-icon-arrow-down el-icon--right"></i>
                                        </el-button>
                                        <el-dropdown-menu slot="dropdown" :class="isDark ? 'dark-theme actions':'actions'">
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-play" aria-hidden="true" style="color:#61b061"></i>
                                                </span>
                                                <span class="actionFunction" @click="openDialog(scope.row,'commonpopup', 'startConnectorTransaction')">{{ $t('general.start') }}</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-stop" aria-hidden="true" style="color:#fc2e56"></i>
                                                </span>
                                                <span class="actionFunction" @click="openDialog(scope.row,'commonpopup', 'stopConnectorTransaction')">{{ $t('general.stop') }}</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-unlock" aria-hidden="true"></i>
                                                </span>
                                                <span class="actionFunction" @click="openDialog(scope.row,'commonpopup', 'unlockConnector')">{{ $t('general.unlock') }}</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-toggle-on" aria-hidden="true" style="color:#61b061"></i>
                                                </span>
                                                <span class="actionFunction" @click="openDialog(scope.row, 'commonpopup', 'enableConnector')">{{ $t('general.enable') }}</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-toggle-off" aria-hidden="true" style="color:#fc2e56"></i>
                                                </span>
                                                <span class="actionFunction" @click="openDialog(scope.row,'commonpopup', 'disableConnector')">{{ $t('general.disable') }}</span>
                                            </el-dropdown-item>
                                            <el-dropdown-item>
                                                <span>
                                                    <i class="fa fa-ban" aria-hidden="true" style="color:#1E5EFF"></i>
                                                </span>
                                                <span class="actionFunction" @click="runAction(scope.row, 'cancelReservation')">{{ $t('chargingStation.cancelReservation') }}</span>
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </el-dropdown>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleClick">
                        <el-tab-pane :label="$t('menu.transaction')" name="transaction">
                        </el-tab-pane>
                        <el-tab-pane :label="$t('chargingStation.reservation')" name="reservation">
                        </el-tab-pane>
                    </el-tabs>
                    <Transaction v-if="active==='transaction'" :chargerId="curRouteParam.chargeBoxId"></Transaction>
                    <Reservation v-else-if="active==='reservation'" :chargerId="curRouteParam.chargeBoxId" :isUpdateData="isUpDateReservationData" @updated="aleadyUpdateReservationData()"></Reservation>
                </div>
                <UpdateConnectorType :show="changeConnectorType.show" v-if="changeConnectorType.show" :connectorId="changeConnectorType.connectorId" :chargePointId="changeConnectorType.chargePointId" :connectorType="changeConnectorType.connectorType" @close="closeDialog('connectorType')" />
                <Configuration :show="configuration.show" v-if="configuration.show" :chargePointId="configuration.chargePointId" @close="closeDialog('configuration')" />
                <CommonPopup :show="commonpopup.show" v-if="commonpopup.show" :chargePointId="commonpopup.chargePointId" :rowData="commonpopup.rowData" :action="commonpopup.action" @close="closeDialog('commonpopup')"></CommonPopup>
                <ReserveNow :show="reserveNow.visible" :data="reserveNow.data" :connectorData ="connectorStatuses" @close="isUpdate => { closeDialog('reserveNow', isUpdate) }"></ReserveNow>
                <CancelReservation :show="cancelReservation.visible" :data="cancelReservation.data" @close="isUpdate => { closeDialog('cancelReservation', isUpdate) }"></CancelReservation>
                <RemoteTrigger :show="remoteTrigger.visible" :data="remoteTrigger.data" @close="closeDialog('remoteTrigger')"></RemoteTrigger>
            </div>
        </div>
    </div>
</template>

<script>
import {
    setScrollBar,
    transformUtcToLocTime,
    transformToSymbols
} from "@/utils/function";
import Connector from "@/components/chargingStation/connector";
import Transaction from "@/components/chargingStation/transaction";
import Reservation from "@/components/chargingStation/reservation";
import ReserveNow from "@/components/chargingStation/reserveNow";
import CancelReservation from "@/components/chargingStation/cancelReservation";
import {
    $HTTP_getAllChargeBoxList,
    $HTTP_getConnectorStatusesById
} from "@/api/api";
import UpdateConnectorType from "@/components/chargingStation/updateConnectorType";
import Configuration from "@/views/setting/configuration";
import CommonPopup from "@/components/commonPopup";
import RemoteTrigger from "@/components/chargingStation/remoteTrigger";
import { $GLOBAL_REFRESH } from "@/utils/global";

export default {
    components: {
        Connector,
        Transaction,
        UpdateConnectorType,
        Configuration,
        CommonPopup,
        Reservation,
        ReserveNow,
        CancelReservation,
        RemoteTrigger
    },
    data() {
        return {
            // costRevenueUrl: costRevenueUrl,
            isDark: this.$store.state.darkTheme,
            changeConnectorType: {
                show: false,
                connectorId: null,
                chargePointId: null,
                connectorType: null
            },
            configuration: {
                show: false,
                chargePointId: null
            },
            commonpopup: {
                show: false,
                chargePointId: null,
                action: "",
                rowData: {}
            },
            filter: {
                dateRange: []
            },
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                }
            },
            permissionShowAlertAble: this.$store.state.permissionEditable,
            curRouteParam: {
                chargeBoxId: null
            },
            isLoading: false,
            active: "transaction",
            timeOut: null,
            connectorTimer:null,
            chargePointById: [],
            isUpDateReservationData: true,
            reserveNow: {
                visible: false,
                data: {}
            },
            cancelReservation: {
                visible: false,
                data: {}
            },
            remoteTrigger: {
                visible: false,
                data: {}
            },
            connectorStatuses: {
                data: [],
                isLoading: false
            }
        };
    },
    computed: {
        getSymbols() {
            return (item) => transformToSymbols(item);
        },
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    created() {
        let chargePointInfo = JSON.parse(
            window.sessionStorage.getItem("fiics-chargePointInfo")
        );
        if (chargePointInfo) {
            this.curRouteParam = {
                chargeBoxId: chargePointInfo.id
            };
        } else if (!chargePointInfo) {
            // redirect to main page if the charger id is null
            this.$router.go(-1);
        }

        let activeTab = window.sessionStorage.getItem("fiics-activeTab");
        if (activeTab) {
            this.active = activeTab;
        }
    },
    mounted() {
        this.getChargePointsById(this.curRouteParam.chargeBoxId);

        this.getConnectorStatusesById(this.curRouteParam.chargeBoxId);

        // update connector statuses in certain interval
        this.connectorTimer = setInterval(()=>{
            this.getConnectorStatusesById(this.curRouteParam.chargeBoxId);
        }, $GLOBAL_REFRESH)
        setScrollBar(".scroll", this);
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-chargePointInfo");
        window.sessionStorage.removeItem("fiics-activeTab");
        clearTimeout(this.timeOut);
        clearInterval(this.connectorTimer)
    },
    methods: {
        runAction(data, action) {
            let params = { ...data };
            if (action === "reserveNow") {
                this.reserveNow.data = {
                    chargePointId: this.chargePointById[0].id,
                    name: this.chargePointById[0].name
                };
                this.reserveNow.visible = true;
                this.$jQuery(".scroll").mCustomScrollbar("disable");
            } else if (action === "cancelReservation") {
                this.cancelReservation.data = {
                    chargePointId: this.chargePointById[0].id,
                    connectorId: params.id
                };
                this.cancelReservation.visible = true;
                this.$jQuery(".scroll").mCustomScrollbar("disable");
            } else if (action === "remoteTrigger") {
                this.remoteTrigger.data = {
                    chargePointId: this.chargePointById[0].id,
                    name: this.chargePointById[0].name
                };
                this.remoteTrigger.visible = true;
                this.$jQuery(".scroll").mCustomScrollbar("disable");
            }
        },
        getConnectorStatusesById(id) {
            let params = {};
            params.chargePointId = id;
            this.connectorStatuses.isLoading = true;
            $HTTP_getConnectorStatusesById(params)
                .then((res) => {
                    if (res.length > 0) {
                        this.connectorStatuses.isLoading = false;
                        this.connectorStatuses.data = res;
                    } else {
                        this.connectorStatuses.data = [];
                        this.connectorStatuses.isLoading = false;
                        this.$message({
                            type: "warning",
                            message: i18n.t("noData")
                        });
                    }
                })
                .catch((err) => {
                    this.connectorStatuses.data = [];
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        getChargePointsById(id) {
            let params = {};
            params.Id = id;
            this.isLoading = true;
            $HTTP_getAllChargeBoxList(params)
                .then((res) => {
                    if (res?.data?.length > 0) {
                        this.chargePointById = res.data;
                        this.isLoading = false;
                    } else {
                        this.chargePointById = [];
                        this.isLoading = false;
                        this.$message({
                            type: "warning",
                            message: i18n.t("noData")
                        });
                    }
                })
                .catch((err) => {
                    this.chargePointById = [];
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        setTimerApiCall() {
            //delay for 2seconds before requesting data
            this.timeOut = setTimeout(() => {
                this.getConnectorStatusesById(this.chargePointById[0].id);
            }, 2000);
        },
        handleShowDialog() {
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeShowPosDialog() {
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        openDialog(row, type, action = "") {
            if (type === "connectorType") {
                this.changeConnectorType.show = true;
                this.changeConnectorType.connectorId = row.id;
                this.changeConnectorType.chargePointId =
                    this.chargePointById[0].id;
                this.changeConnectorType.connectorType = row.type;
            } else if (type === "configuration") {
                this.configuration.show = true;
                this.configuration.chargePointId = this.chargePointById[0].id;
            } else if (type === "commonpopup") {
                this.commonpopup.show = true;
                this.commonpopup.chargePointId = this.chargePointById[0].id;
                this.commonpopup.action = action;
                if (row) {
                    this.commonpopup.rowData = row;
                }
            }
        },
        closeDialog(type, data) {
            if (type === "connectorType") {
                this.changeConnectorType.show = false;
                this.changeConnectorType.connectorId = null;
                this.changeConnectorType.chargePointId = null;
                this.changeConnectorType.connectorType = null;
            } else if (type === "configuration") {
                this.configuration.show = false;
                this.commonpopup.chargePointId = null;
            } else if (type === "commonpopup") {
                this.commonpopup.show = false;
                this.commonpopup.chargePointId = null;
                this.commonpopup.action = "";
            } else if (type === "reserveNow") {
                this.reserveNow.visible = false;
                this.isUpDateReservationData = data;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "cancelReservation") {
                this.cancelReservation.visible = false;
                this.isUpDateReservationData = data;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "remoteTrigger") {
                this.remoteTrigger.visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            }
            this.setTimerApiCall();
        },
        aleadyUpdateReservationData() {
            this.isUpDateReservationData = false;
        },
        handleClick() {
            window.sessionStorage.setItem("fiics-activeTab", this.active);
        }
    }
};
</script>
<style lang = "scss" scoped>
.card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    .header {
        font-size: 1.5rem;
        font-weight: bold;
    }
    .charge-point-info {
        display: flex;
        flex-wrap: wrap;
        .item {
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 180px;
                font-size: 1rem;
                color: #525e69;
                letter-spacing: 0;
            }
            .content {
                display: inline-block;
                font-size: 1rem;
                color: #151e25;
                letter-spacing: 0;
                .circle-status {
                    vertical-align: top;
                }
                .connectors {
                    display: flex;
                    p {
                        margin-block-start: 0;
                        margin-block-end: 5px;
                        margin-left: 5px;
                    }
                }
            }
        }
        .title {
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 180px;
                font-size: 1.5rem;
                color: black;
                letter-spacing: 0;
                font-weight: bold;
            }
            .content {
                display: inline-block;
                font-size: 1.5rem;
                color: blue;
                font-weight: bold;
                letter-spacing: 0;
                .circle-status {
                    vertical-align: top;
                }
            }
        }
    }

    .firstCol {
        width: calc(26.05% - 32px) !important;
    }

    .secondCol {
        width: calc(20.05% - 32px) !important;
        padding: 0px 28px;
    }

    .thirdCol {
        width: calc(40.05% - 32px) !important;
        padding: 0px 28px;
    }

    .rank-area {
        margin-right: 12px;
        height: auto;
        position: relative;
        vertical-align: top;
        &:nth-child(4n + 1) {
            margin-right: 0px;
        }
        .title {
            font-size: 20px;
            margin-top: 10px;
        }
        ul.rank {
            margin-top: 14px;
            padding-left: 0;
            li {
                height: 26px;
                list-style: none;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
                &:last-child {
                    margin-bottom: 0;
                }
                .label {
                    margin-bottom: 6px;
                    line-height: 20px;
                    font-size: 1rem;
                    display: flex;
                    justify-content: space-between;
                    min-width: 65px;
                    .name {
                        display: inline-block;
                        color: #525e69;
                    }
                }
            }
        }
    }
}

.connectors_chargers {
    color: #409eff;
    background-color: transparent;
    border-color: transparent;
    font-weight: 600;
}

.fa-pencil:hover {
    cursor: pointer;
}
@media screen and (max-width: 1500px) {
    .firstCol {
        flex: 60%;
    }
    .secondCol {
        flex: 30%;
    }
    .thirdCol {
        flex: 75%;
    }
    .card-8 .thirdCol {
        padding: 28px 0px;
    }
}
</style>
