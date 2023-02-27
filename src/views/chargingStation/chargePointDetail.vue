<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/chargePoint' }">{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.ocppId }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="charge-point-info" v-loading="isLoading" v-if="chargePointById.length>=1">
                <div class="card-8 rank-area">
                    <div class="item title">
                        <div class="label">{{ $t('chargingStation.charger') }}</div>
                        <div class="content">{{ chargePointById[0].name }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                        <div class="content">
                            {{ chargePointById[0].ocppId }}
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.power') }}</div>
                        <div class="content">{{ chargePointById[0].powerKw }} kW</div>

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
                        <div class="content">{{ chargePointById[0].powerType ? getPowerType(chargePointById[0].powerType):''}}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                        <div class="content">
                            <a class="view-link" @click="openActionDialog(null, 'chargeRate', null)">{{tariffNames.toString()}}</a>
                            <i class="fa fa-pencil" aria-hidden="true" @click="openActionDialog(chargePointById[0],'modifyTariff', null)"></i>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('general.installationDate') }}</div>
                        <div class="content">{{chargePointById[0].created!==null? getLocTime( chargePointById[0].created):'' }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.lastHeartbeat') }}</div>
                        <div class="content">{{ chargePointById[0].lastHeartbeat!==null ? getLocTime(chargePointById[0].lastHeartbeat):'' }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.connectors') }}</div>
                        <Connector :dataObj="connectorStatuses.data" :chargerStatus="chargePointById[0].connectionStatus" :isBreak="true"></Connector>
                    </div>
                </div>
                <div class="card-8 rank-area">
                    <div class="settings">
                        <el-button size="medium" type="primary" @click="openActionDialog(chargePointById[0].id, 'configuration', 'getAllSettings')"> {{ $t('general.settings') }}</el-button>
                        <el-input class="settingsInput" :placeholder="$t('general.key')" v-model="settingsInput"></el-input>
                        <el-button size="mini" type="primary" style="padding:8px" @click="openActionDialog(chargePointById[0].id, 'configuration', null)" :disabled="settingsInput.length===0"> {{ $t('general.get') }}</el-button>
                        <el-button size="mini" type="primary" style="padding:8px" @click="openActionDialog(chargePointById[0].id, 'setConfiguration', null)" :disabled="settingsInput.length===0"> {{ $t('general.modify') }}</el-button>
                    </div>
                    <div class="header">
                        <div class="title">{{ $t('general.action') }}</div>
                    </div>
                    <ul class="rank actions">
                        <ActionItem buttonName="general.add" actionName="chargingStation.addChargingProfile" action="addChargingProfile" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.clear" actionName="chargingStation.clearChargingProfile" action="clearChargingProfile" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.start" actionName="chargingStation.diagnostics" action="getDiagnostics" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.run" actionName="chargingStation.updates" action="updatesFirmware" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.clear" dialogType="commonpopup" actionName="chargingStation.clearCache" action="clearCache" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.reset" dialogType="commonpopup" actionName="chargingStation.softReset" action="softReset" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.reset" dialogType="commonpopup" actionName="chargingStation.hardReset" action="hardReset" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.run" actionName="chargingStation.remoteTrigger" action="remoteTrigger" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.start" actionName="chargingStation.startReservation" action="reserveNow" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.get" actionName="chargingStation.getLocalAuthListVersion" action="getLocalAuthListVersion" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.send" actionName="chargingStation.sendLocalAuthList" action="sendLocalAuthList" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.upload" actionName="chargingStation.uploadFirmware" action="uploadFirmware" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                        <ActionItem buttonName="general.run" actionName="chargingStation.getCompositeSchedule" action="getCompositeSchedule" @runAction="(action,dialogType)=>openActionDialog(null,dialogType,action)"></ActionItem>
                    </ul>
                </div>

                <div class="card-8 connector-area table-result">
                    <div class="header">
                        <div class="title">{{ $t('chargingStation.connectors') }}</div>
                    </div>
                    <el-table :data="connectorStatuses.data" class="moreCol">
                        <el-table-column prop="id" label="ID" :min-width="2"></el-table-column>
                        <el-table-column :label="$t('chargingStation.lastStatus')" :min-width="8">
                            <template slot-scope="scope">
                                <el-tooltip v-if="scope.row.status==='Available'" :content="'Available'" placement="bottom" effect="light" popper-class="custom">
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
                                {{ scope.row.type? getConnectorType(scope.row.type):''}}
                                <i class="fa fa-pencil" aria-hidden="true" @click="openActionDialog(scope.row,'connectorType')"></i>
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
                                        <ActionItem hasIcon isDropdown buttonName="general.start" className="fa fa-play" color="#61b061" action="startConnectorTransaction" dialogType="commonpopup" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                        <ActionItem hasIcon isDropdown buttonName="general.stop" className="fa fa-stop" color="#fc2e56" action="stopConnectorTransaction" dialogType="commonpopup" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                        <ActionItem hasIcon isDropdown buttonName="general.unlock" className="fa fa-unlock" color="" action="unlockConnector" dialogType="commonpopup" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                        <ActionItem hasIcon isDropdown buttonName="general.enable" className="fa fa-toggle-on" color="#61b061" action="enableConnector" dialogType="commonpopup" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                        <ActionItem hasIcon isDropdown buttonName="general.disable" className="fa fa-toggle-off" color="#fc2e56" action="disableConnector" dialogType="commonpopup" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                        <ActionItem hasIcon isDropdown buttonName="chargingStation.cancelReservation" className="fa fa-ban" color="#1E5EFF" action="cancelReservation" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <div class="graph_time">
                {{ $t('menu.statistics') }}
                <span>
                    <el-date-picker :default-time="['00:00:00', '23:59:59']" v-model="dateRange" type="daterange" format="MMM dd" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="pickerOptions" :clearable="false" @change="getDataUsingDatepicker" class="customDatepicker">
                    </el-date-picker>
                </span>
            </div>
            <div class="card-alt" v-loading="statistics.isLoading" v-if="statistics.data">
                <StatisticsCard name="chargingStation.powerConsumption" :data="statistics.data.totalEnergy"></StatisticsCard>
                <StatisticsCard name="chargingStation.totalTransaction" :data="statistics.data.transactions"></StatisticsCard>
                <StatisticsCard name="chargingStation.totalUsers" :data="statistics.data.users"></StatisticsCard>
                <StatisticsCard name="chargingStation.newUsers" :data="statistics.data.newUsers"></StatisticsCard>
                <StatisticsCard name="chargingStation.repeatedUsers" :data="statistics.data.repeatUsers"></StatisticsCard>
            </div>

            <div class=" card-8 tabs-contain">
                <el-tabs v-model="active" @tab-click="handleClick">
                    <el-tab-pane :label="$t('menu.analysis')" name="analysis">
                    </el-tab-pane>
                    <el-tab-pane :label="$t('menu.sessions')" name="sessions">
                    </el-tab-pane>
                    <el-tab-pane :label="$t('menu.transaction')" name="transaction">
                    </el-tab-pane>
                    <el-tab-pane :label="$t('chargingStation.reservation')" name="reservation">
                    </el-tab-pane>
                    <el-tab-pane :label="$t('chargingStation.chargingProfile')" name="chargingProfile">
                    </el-tab-pane>
                </el-tabs>
                <div v-if="active==='analysis'">
                    <div class="header">
                        <el-select class="select-small customSelect" v-model="graphSelected" :placeholder="$t('general.location')">
                            <el-option v-for="item in graphList" :label="$t(`graphs.${item}`)" :key="item" :value="item"></el-option>
                        </el-select>
                    </div>
                    <div class="graph" v-if="graphSelected==='transactionAndTraffic' && dateRange.length>1 && curRouteParam.chargeBoxId">
                        <TransactionTraffic :dateRange="dateRange" :id="curRouteParam.chargeBoxId" type="charger"></TransactionTraffic>
                    </div>
                </div>
                <Sessions v-if="active==='sessions' && dateRange.length>1" :dateRange="dateRange" :ocppId="curRouteParam.ocppId" :chargerId="curRouteParam.chargeBoxId" :isUpdateData="updateSessionsData && active==='sessions'" @updated="aleadyUpdateData('sessions')"></Sessions>
                <Transaction v-if="active==='transaction' && dateRange.length>1" :dateRange="dateRange" :ocppId="curRouteParam.ocppId" :chargerId="curRouteParam.chargeBoxId" :isUpdateData="updateTransactions && active==='transaction'" @updated="aleadyUpdateData('transaction')"></Transaction>
                <Reservation v-else-if="active==='reservation' && dateRange.length>1" :dateRange="dateRange" :chargerId="curRouteParam.chargeBoxId" :isUpdateData="isUpDateReservationData && active==='reservation'" @updated="aleadyUpdateData('reservation')"></Reservation>
                <ChargingProfile v-else-if="active==='chargingProfile'" :chargerId="curRouteParam.chargeBoxId" :isUpdateData="isUpDateChargingProfileData && active==='chargingProfile'" @updated="aleadyUpdateData('chargingProfile')"></ChargingProfile>
            </div>
            <UpdateConnectorType :show="changeConnectorType.show" v-if="changeConnectorType.show" :ocppId="changeConnectorType.ocppId" :connectorId="changeConnectorType.connectorId" :chargePointId="changeConnectorType.chargePointId" :connectorType="changeConnectorType.connectorType" @close="closeDialog('connectorType')" />
            <Configuration :show="configuration.show" v-if="configuration.show" :chargePointId="configuration.chargePointId" :selectedKey="configuration.selectedKey" @close="closeDialog('configuration')" />
            <SetConfiguration :show="setConfiguration.show" v-if="setConfiguration.show" :chargePointId="setConfiguration.chargePointId" :selectedKey="setConfiguration.selectedKey" @close="closeDialog('setConfiguration')"></SetConfiguration>
            <CommonPopup :show="commonpopup.show" v-if="commonpopup.show" :chargePointId="commonpopup.chargePointId" :ocppId="commonpopup.ocppId" :rowData="commonpopup.rowData" :action="commonpopup.action" @close="(isUpdate)=>closeDialog('commonpopup', isUpdate)"></CommonPopup>
            <ReserveNow :show="reserveNow.visible" :data="reserveNow.data" :connectorData="connectorStatuses" @close="isUpdate => { closeDialog('reserveNow', isUpdate) }"></ReserveNow>
            <CancelReservation :show="cancelReservation.visible" :data="cancelReservation.data" @close="isUpdate => { closeDialog('cancelReservation', isUpdate) }"></CancelReservation>
            <RemoteTrigger :show="remoteTrigger.visible" :data="remoteTrigger.data" @close="closeDialog('remoteTrigger')"></RemoteTrigger>
            <UpdateFirmware :chargePointId="updateDialog.chargePointId" :show="updateDialog.visible" @close="closeDialog('updateDialog')"></UpdateFirmware>
            <GetLocalAuthListVersion :chargePointId="getAuthVersionDialog.chargePointId" :show="getAuthVersionDialog.visible" @close="closeDialog('getAuthVersionDialog')"></GetLocalAuthListVersion>
            <SendLocalAutList :chargePointId="sendAutDialog.chargePointId" :show="sendAutDialog.visible" @close="closeDialog('sendAutDialog')"></SendLocalAutList>
            <GetDiagnostics :chargePointId="diagnosticsDialog.chargePointId" :show="diagnosticsDialog.visible" @close="closeDialog('diagnosticsDialog')"></GetDiagnostics>
            <AddChargingProfile :show="addChargingProfile.visible" :data="addChargingProfile.data" @close="isUpdate => { closeDialog('addChargingProfile', isUpdate) }"></AddChargingProfile>
            <ClearChargingProfile :show="clearChargingProfile.visible" :data="clearChargingProfile.data" @close="isUpdate => { closeDialog('clearChargingProfile', isUpdate) }"></ClearChargingProfile>
            <UploadFirmware :chargePointId="uploadFirmwareDialog.chargePointId" :show="uploadFirmwareDialog.visible" @close="closeDialog('uploadFirmwareDialog')"></UploadFirmware>
            <GetCompositeSchedule :show="getCompositeSchedule.visible" :data="getCompositeSchedule.data" @close="closeDialog('getCompositeSchedule')"></GetCompositeSchedule>
            <TariffPopup v-if="chargeRate.visible" :show="chargeRate.visible" :data="chargeRate.data" @close="closeDialog('chargeRate')"></TariffPopup>
            <ModifyChargeBoxTariff v-if="chargeBoxTariffDialog.visible" :show="chargeBoxTariffDialog.visible" :data="chargeBoxTariffDialog.data" @close="closeDialog('modifyTariff')"></ModifyChargeBoxTariff>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime, transformToSymbols, catchErrors } from "@/utils/function";
import Connector from "@/components/chargingStation/connector";
import Transaction from "@/components/chargingStation/transaction";
import Sessions from "@/components/chargingStation/sessions";
import Reservation from "@/components/chargingStation/reservation";
import ReserveNow from "@/components/chargingStation/reserveNow";
import CancelReservation from "@/components/chargingStation/cancelReservation";
import ChargingProfile from "@/components/chargingStation/chargingProfile";
import AddChargingProfile from "@/components/chargingStation/addChargingProfile";
import ClearChargingProfile from "@/components/chargingStation/clearChargingProfile";
import { $HTTP_getAllChargeBoxList, $HTTP_getConnectorStatusesById, $HTTP_getTransactionsStatistics, $HTTP_getChargeBoxTariff } from "@/api/api";
import UpdateConnectorType from "@/components/chargingStation/updateConnectorType";
import Configuration from "@/views/setting/configuration";
import SetConfiguration from "@/views/setting/setConfigurationDialog";
import CommonPopup from "@/components/commonPopup";
import RemoteTrigger from "@/components/chargingStation/remoteTrigger";
import UpdateFirmware from "@/components/chargingStation/updateFirmware";
import GetLocalAuthListVersion from "@/components/chargingStation/getLocalAuthListVersion";
import SendLocalAutList from "@/components/chargingStation/sendLocalAutList";
import { $GLOBAL_REFRESH, $POWER_TYPE_LIST, $CONNECTOR_TYPE_LIST } from "@/utils/global";
import GetDiagnostics from "@/components/chargingStation/getDiagnostics";
import moment from "moment";
import TransactionTraffic from "@/components/charts/config/TransactionTraffic";
import UploadFirmware from "@/components/chargingStation/uploadFirmware";
import GetCompositeSchedule from "@/components/chargingStation/getCompositeSchedule";
import TariffPopup from "@/components/popup/tariffPopup";
import ModifyChargeBoxTariff from "@/components/chargingStation/modifyChargeBoxTariff";
import StatisticsCard from "@/components/htmlComponents/stationDetail/statisticsCard";
import ActionItem from "@/components/htmlComponents/actions/actionItem";
export default {
    components: {
        Connector,
        Transaction,
        UpdateConnectorType,
        Configuration,
        SetConfiguration,
        CommonPopup,
        Sessions,
        Reservation,
        ReserveNow,
        CancelReservation,
        RemoteTrigger,
        UpdateFirmware,
        GetLocalAuthListVersion,
        SendLocalAutList,
        GetDiagnostics,
        TransactionTraffic,
        ChargingProfile,
        AddChargingProfile,
        ClearChargingProfile,
        UploadFirmware,
        GetCompositeSchedule,
        TariffPopup,
        ModifyChargeBoxTariff,
        StatisticsCard,
        ActionItem
    },
    data() {
        return {
            // costRevenueUrl: costRevenueUrl,
            isDark: this.$store.state.darkTheme,
            changeConnectorType: {
                show: false,
                connectorId: null,
                chargePointId: null,
                connectorType: null,
                ocppId: null
            },
            configuration: {
                show: false,
                chargePointId: null,
                selectedKey: null
            },
            setConfiguration: {
                show: false,
                chargePointId: null,
                selectedKey: null
            },
            commonpopup: {
                show: false,
                chargePointId: null,
                ocppId: null,
                action: "",
                rowData: {}
            },
            dateRange: [],
            pickerOptions: {
                disabledDate(time) {
                    let today = moment().endOf("day").format("x");
                    return time.getTime() > today;
                },
                shortcuts: [
                    {
                        text: i18n.t("chargingStation.timeOpt.7days"),
                        onClick(picker) {
                            // 7 days including today
                            const startOfDay = moment().subtract(6, "days").startOf("day");
                            const endOfDay = moment().endOf("day");
                            let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                            picker.$emit("pick", _dateRange);
                        }
                    },
                    {
                        text: i18n.t("chargingStation.timeOpt.30days"),
                        onClick(picker) {
                            const startOfDay = moment().subtract(29, "days").startOf("day");
                            const endOfDay = moment().endOf("day");
                            let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                            picker.$emit("pick", _dateRange);
                        }
                    },
                    {
                        text: i18n.t("chargingStation.timeOpt.90days"),
                        onClick(picker) {
                            const startOfDay = moment().subtract(89, "days").startOf("day");
                            const endOfDay = moment().endOf("day");
                            let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                            picker.$emit("pick", _dateRange);
                        }
                    },
                    {
                        text: i18n.t("chargingStation.timeOpt.6months"),
                        onClick(picker) {
                            const startOfDay = moment().subtract(6, "months").startOf("day");
                            const endOfDay = moment().endOf("day");
                            let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                            picker.$emit("pick", _dateRange);
                        }
                    },
                    {
                        text: i18n.t("chargingStation.timeOpt.1year"),
                        onClick(picker) {
                            const startOfDay = moment().subtract(1, "years").startOf("day");
                            const endOfDay = moment().endOf("day");
                            let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                            picker.$emit("pick", _dateRange);
                        }
                    }
                ]
            },
            permissionShowAlertAble: this.$store.state.permissionEditable,
            curRouteParam: {
                chargeBoxId: null,
                ocppId: null
            },
            isLoading: false,
            active: "analysis",
            timeOut: null,
            connectorTimer: null,
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
            },
            getAuthVersionDialog: {
                chargePointId: "",
                visible: false
            },
            sendAutDialog: {
                chargePointId: "",
                visible: false
            },
            diagnosticsDialog: {
                chargePointId: "",
                visible: false
            },
            updateDialog: {
                chargePointId: "",
                visible: false
            },
            statistics: {
                isLoading: false,
                data: []
            },
            graphSelected: "transactionAndTraffic",
            graphList: ["transactionAndTraffic"],
            isUpDateChargingProfileData: true,
            updateSessionsData: true,
            addChargingProfile: {
                visible: false,
                data: {}
            },
            clearChargingProfile: {
                visible: false,
                data: {}
            },
            uploadFirmwareDialog: {
                chargePointId: "",
                visible: false
            },
            getCompositeSchedule: {
                visible: false,
                data: {}
            },
            updateTransactions: false, //use this to hit other apis in components
            settingsInput: "",
            powerTypeList: $POWER_TYPE_LIST,
            connectorTypeList: $CONNECTOR_TYPE_LIST,
            tariffList: [],
            tariffNames: "",
            chargeRate: {
                visible: false,
                data: []
            },
            chargeBoxTariffDialog: {
                visible: false,
                data: {}
            }
        };
    },
    computed: {
        getSymbols() {
            return (item) => transformToSymbols(item);
        },
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        },
        getPowerType() {
            return (item) => {
                let convertedValue = this.powerTypeList.filter((powerType) => powerType.value === item);
                return convertedValue[0].name;
            };
        },
        getConnectorType() {
            return (item) => {
                let convertedValue = this.connectorTypeList.filter((powerType) => powerType.value === item);
                return convertedValue[0].name;
            };
        },
        selectedOrganization: function () {
            return this.$store.state.selectedOrganization;
        },
        userRole: function () {
            return this.$store.state.role;
        }
    },
    watch: {
        selectedOrganization: function () {
            this.$router.go(-1);
        }
    },
    created() {
        let chargePointInfo = JSON.parse(window.sessionStorage.getItem("fiics-chargePointInfo"));
        if (chargePointInfo) {
            this.curRouteParam = {
                chargeBoxId: chargePointInfo.id,
                ocppId: chargePointInfo.ocppId
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
        // add dates
        const startOfDay = moment().subtract(6, "days").startOf("day");
        const endOfDay = moment().endOf("day");
        this.dateRange = [new Date(startOfDay), new Date(endOfDay)];
        this.getChargePointsById(this.curRouteParam.ocppId);

        this.getConnectorStatusesById(this.curRouteParam.chargeBoxId);
        this.getStatistics(this.curRouteParam.chargeBoxId);
        this.getChargeBoxTariff(this.curRouteParam.chargeBoxId);

        // update connector statuses in certain interval
        this.connectorTimer = setInterval(() => {
            this.getConnectorStatusesById(this.curRouteParam.chargeBoxId);
        }, $GLOBAL_REFRESH);
        setScrollBar(".scroll", this);
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-chargePointInfo");
        window.sessionStorage.removeItem("fiics-activeTab");
        clearTimeout(this.timeOut);
        clearInterval(this.connectorTimer);
    },
    methods: {
        openActionDialog(row, type, action = "") {
            let data = row;
            if (type === "commonpopup") {
                this.commonpopup.show = true;
                this.commonpopup.chargePointId = this.chargePointById[0].id;
                this.commonpopup.ocppId = this.chargePointById[0].ocppId;
                this.commonpopup.action = action;
                if (row) {
                    this.commonpopup.rowData = row;
                }
            } else if (type === "connectorType") {
                this.changeConnectorType.show = true;
                this.changeConnectorType.connectorId = row.id;
                this.changeConnectorType.chargePointId = this.chargePointById[0].id;
                this.changeConnectorType.connectorType = row.type;
                this.changeConnectorType.ocppId = this.curRouteParam.ocppId;
            } else if (type === "configuration") {
                this.configuration.show = true;
                this.configuration.chargePointId = this.chargePointById[0].id;
                if (action === "getAllSettings") {
                    this.configuration.selectedKey = null;
                } else {
                    this.configuration.selectedKey = this.settingsInput;
                }
            } else if (type === "setConfiguration") {
                this.setConfiguration.show = true;
                this.setConfiguration.chargePointId = this.chargePointById[0].id;
                this.setConfiguration.selectedKey = this.settingsInput;
            } else if (type === "chargeRate") {
                this.chargeRate.visible = true;
                this.chargeRate.data = this.tariffList;
            } else if (type === "modifyTariff") {
                this.chargeBoxTariffDialog.visible = true;
                this.chargeBoxTariffDialog.data.chargeBoxId = row.id;
                this.chargeBoxTariffDialog.data.name = row.name;
                this.chargeBoxTariffDialog.data.ocppId = row.ocppId;
            } else {
                let params = { ...data };
                if (action === "reserveNow") {
                    this.reserveNow.data = {
                        chargePointId: this.chargePointById[0].id,
                        name: this.chargePointById[0].name,
                        ocppId: this.chargePointById[0].ocppId
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
                } else if (action === "updatesFirmware") {
                    this.updateDialog.visible = true;
                    this.updateDialog.chargePointId = this.chargePointById[0].id;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "remoteTrigger") {
                    this.remoteTrigger.data = {
                        chargePointId: this.chargePointById[0].id,
                        name: this.chargePointById[0].name,
                        ocppId: this.chargePointById[0].ocppId
                    };
                    this.remoteTrigger.visible = true;
                } else if (action === "addChargingProfile") {
                    this.addChargingProfile.data = {
                        chargePointId: this.chargePointById[0].id,
                        name: this.chargePointById[0].name,
                        ocppId: this.chargePointById[0].ocppId
                    };
                    this.addChargingProfile.visible = true;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "clearChargingProfile") {
                    this.clearChargingProfile.data = {
                        chargePointId: this.chargePointById[0].id,
                        name: this.chargePointById[0].name
                    };
                    this.clearChargingProfile.visible = true;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "getLocalAuthListVersion") {
                    this.getAuthVersionDialog.chargePointId = this.chargePointById[0].id;
                    this.getAuthVersionDialog.visible = true;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "sendLocalAuthList") {
                    this.sendAutDialog.chargePointId = this.chargePointById[0].id;
                    this.sendAutDialog.visible = true;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "getDiagnostics") {
                    this.diagnosticsDialog.visible = true;
                    this.diagnosticsDialog.chargePointId = this.chargePointById[0].id;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "uploadFirmware") {
                    this.uploadFirmwareDialog.visible = true;
                    this.uploadFirmwareDialog.chargePointId = this.chargePointById[0].id;
                } else if (action === "getCompositeSchedule") {
                    this.getCompositeSchedule.data = {
                        chargePointId: this.chargePointById[0].id,
                        name: this.chargePointById[0].name,
                        ocppId: this.chargePointById[0].ocppId
                    };
                    this.getCompositeSchedule.visible = true;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                }
            }
        },
        getChargeBoxTariff(id) {
            let params = {
                chargePointId: id
            };
            $HTTP_getChargeBoxTariff(params)
                .then((res) => {
                    if (res && res.length > 0) {
                        this.tariffList = res;
                        this.tariffNames = res.map((item) => item.name);
                    } else {
                        this.tariffList = [];
                        this.tariffNames = "";
                    }
                })
                .catch((err) => {
                    this.tariffList = [];
                    this.tariffNames = "";
                    let errorMessage = catchErrors("tariff", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        getConnectorStatusesById(id) {
            let params = {};
            params.chargePointId = id;
            $HTTP_getConnectorStatusesById(params)
                .then((res) => {
                    if (res.length > 0) {
                        this.connectorStatuses.data = res;
                    } else {
                        this.connectorStatuses.data = [];
                        this.$message({
                            type: "warning",
                            message: i18n.t("noData")
                        });
                    }
                })
                .catch((err) => {
                    this.connectorStatuses.data = [];
                    let errorMessage = catchErrors("connector status", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        getChargePointsById(id) {
            let params = {};
            params.ocppId = id;
            this.isLoading = true;
            if (
                (this.selectedOrganization.length >= 1 && this.userRole !== "Admin") ||
                (this.userRole === "Admin" && this.selectedOrganization[0]?.name !== "All")
            ) {
                params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
            }
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
                    let errorMessage = catchErrors("charge box list", err);
                    this.$message({ type: "warning", message: errorMessage });
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
        closeDialog(type, data) {
            if (type === "connectorType") {
                this.changeConnectorType.show = false;
                this.changeConnectorType.connectorId = null;
                this.changeConnectorType.chargePointId = null;
                this.changeConnectorType.connectorType = null;
                this.changeConnectorType.ocppId = null;
            } else if (type === "configuration") {
                this.configuration.show = false;
                this.configuration.chargePointId = null;
            } else if (type === "setConfiguration") {
                this.setConfiguration.show = false;
                this.setConfiguration.chargePointId = null;
            } else if (type === "commonpopup") {
                this.commonpopup.show = false;
                this.commonpopup.chargePointId = null;
                this.commonpopup.ocppId = null;
                this.commonpopup.action = "";
                this.commonpopup.rowData = {};
                if (this.active === "transactions") {
                    this.updateTransactions = data;
                } else if (this.active === "sessions") {
                    this.updateSessionsData = data;
                }
            } else if (type === "reserveNow") {
                this.reserveNow.visible = false;
                this.isUpDateReservationData = data;
                this.updateSessionsData = data;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "cancelReservation") {
                this.cancelReservation.visible = false;
                this.isUpDateReservationData = data;
                this.updateSessionsData = data;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "remoteTrigger") {
                this.remoteTrigger.visible = false;
            } else if (type === "addChargingProfile") {
                this.addChargingProfile.visible = false;
                this.isUpDateChargingProfileData = data;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "clearChargingProfile") {
                this.clearChargingProfile.visible = false;
                this.isUpDateChargingProfileData = data;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "updateDialog") {
                this[type].visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "getAuthVersionDialog") {
                this.getAuthVersionDialog.visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "sendAutDialog") {
                this.sendAutDialog.visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "diagnosticsDialog") {
                this.diagnosticsDialog.visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "uploadFirmwareDialog") {
                this.uploadFirmwareDialog.visible = false;
            } else if (type === "getCompositeSchedule") {
                this.getCompositeSchedule.visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "chargeRate") {
                this.chargeRate.visible = false;
                this.chargeRate.data = [];
            } else if (type === "modifyTariff") {
                this.chargeBoxTariffDialog.visible = false;
                this.chargeBoxTariffDialog.data = {};
                // get new tariffs after a delay
                setTimeout(() => {
                    this.getChargeBoxTariff(this.curRouteParam.chargeBoxId);
                }, 2000);
            }
            this.setTimerApiCall();
        },
        aleadyUpdateData(type) {
            if (type === "reservation") {
                this.isUpDateReservationData = false;
                // update to new reservation list on cancelReservation in connectors
                this.cancelReservation.data = {};
            } else if (type === "chargingProfile") {
                this.isUpDateChargingProfileData = false;
            } else if (type === "transaction") {
                this.updateTransactions = false;
            } else if (type === "sessions") {
                this.updateSessionsData = false;
            }
        },
        handleClick() {
            window.sessionStorage.setItem("fiics-activeTab", this.active);
        },
        getStatistics(id) {
            let params = {};
            params.ChargePointId = id;
            params.StartedAfter = this.dateRange[0];
            params.StartedBefore = this.dateRange[1];
            this.statistics.isLoading = true;
            $HTTP_getTransactionsStatistics(params)
                .then((res) => {
                    if (res) {
                        this.statistics.data = res;
                        this.statistics.isLoading = false;
                    }
                })
                .catch((err) => {
                    this.statistics.data = [];
                    let errorMessage = catchErrors("statistics", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        getDataUsingDatepicker() {
            this.isUpDateReservationData = true;
            this.getStatistics(this.curRouteParam.chargeBoxId);
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
    .graph {
        height: 350px;
    }
}
.graph_time {
    padding: 0px 0px 19px;
    display: flex;
    span {
        margin-left: auto;
        .customDatepicker {
            background: transparent;
            border: 1px solid #525e69;
            display: flex;
            justify-content: space-evenly;
            width: 260px;
            padding: 0;
        }
    }
}
.card-alt {
    display: flex;
    width: 100%;
    .stats_area {
        width: calc(20% - 32px);
        margin-right: 12px;
        height: 47px;
        position: relative;
        vertical-align: top;
        padding-bottom: 48px;
        .name {
            color: #525e69;
        }
        .num_stats {
            display: flex;
            flex-direction: column;
            font-size: 1.25rem;
            .num {
                font-weight: bold;
                margin: 10px 0px 5px;
            }
            .num_trend {
                font-size: 1rem;
                font-weight: 700;
                &.positive {
                    color: #33c85a;
                }
                &.negative {
                    color: #fc2e56;
                }
                /* using webstroke to make the icon thinner  */
                .fa {
                    -webkit-text-stroke: 1.5px #e6eef8;
                }
            }
        }
    }

    .stats_area:nth-child(5) {
        margin-right: 0px;
    }
}
.charge-point-info {
    display: flex;
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
            .view-link {
                color: #0056ff;
                text-decoration: underline;
                cursor: pointer;
                margin-right: 5px;
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
.rank-area {
    width: calc(26.05% - 32px) !important;
    margin-right: 12px;
    height: auto;
    position: relative;
    vertical-align: top;
    &:nth-child(4n + 1) {
        margin-right: 12px;
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
    .actions {
        .actionFunction {
            -webkit-box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.12);
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.12);
        }
    }
    .settings {
        display: flex;
        .settingsInput {
            margin: 0 5px;
            display: flex;
            align-items: center;
        }
    }
}

.connector-area {
    width: calc(44.05% - 32px) !important;
    height: auto;
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
    .charge-point-info,
    .card-alt {
        flex-wrap: wrap;
        .stats_area {
            flex: 25%;
        }
    }
    .rank-area {
        flex: 25%;
    }
    .connector-area {
        flex: 50%;
    }
}
@media screen and (max-width: 800px) {
    .rank-area {
        flex: 50%;
    }
    .graph_time {
        padding: 0px 12px 19px;
    }
    .stats_area:nth-child(3) {
        margin-right: 12px;
    }
    .stats_area:nth-child(5) {
        margin-right: 12px;
    }
}
</style>
