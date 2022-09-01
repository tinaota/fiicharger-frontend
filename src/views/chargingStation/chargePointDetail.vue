<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/chargePoint' }">{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.chargeBoxId }}</el-breadcrumb-item>
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
                    <div class="card-8 rank-area">
                        <el-button size="medium" type="primary" @click="openDialog(chargePointById[0].id, 'configuration')"> {{ $t('general.settings') }}</el-button>
                        <div class="header">
                            <div class="title">{{ $t('general.action') }}</div>
                        </div>
                        <ul class="rank actions">
                            <li>
                                <span class="name">{{ $t('chargingStation.addChargingProfile') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction(null, 'addChargingProfile')">{{ $t('general.add') }}</el-button>
                            </li>
                            <li>
                                <span class="name">{{ $t('chargingStation.clearChargingProfile') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction(null, 'clearChargingProfile')">{{ $t('general.clear') }}</el-button>
                            </li>
                            <li>
                                <span class="name">{{ $t('chargingStation.diagnostics') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction(null, 'getDiagnostics')">{{ $t('general.start') }}</el-button>
                            </li>
                            <li>
                                <span>{{ $t('chargingStation.updates') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction(null, 'updatesFirmware')">{{ $t('general.run') }}</el-button>
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
                            <li>
                                <span>{{ $t('chargingStation.getLocalAuthListVersion') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction( null, 'getLocalAuthListVersion')">{{ $t('general.get') }}</el-button>
                            </li>
                            <li>
                                <span>{{ $t('chargingStation.sendLocalAuthList') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction( null, 'sendLocalAuthList')">{{ $t('general.send') }}</el-button>
                            </li>
                            <li>
                                <span>
                                    {{ $t('chargingStation.uploadFirmware') }}
                                </span>
                                <el-button type="primary" class="actionFunction" @click="runAction(null, 'uploadFirmware')">{{ $t('general.upload') }}</el-button>
                            </li>

                            <li>
                                <span>{{ $t('chargingStation.getCompositeSchedule') }}</span>
                                <el-button type="primary" class="actionFunction" @click="runAction(null, 'getCompositeSchedule')">{{ $t('general.run') }}</el-button>
                            </li>
                        </ul>
                    </div>

                    <div class="card-8 connector-area">
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

                <div class="graph_time">
                    {{ $t('menu.statistics') }}
                    <span>
                        <el-date-picker :default-time="['00:00:00', '23:59:59']" v-model="dateRange" type="daterange" format="MMM dd" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="pickerOptions" :clearable="false" @change="getDataUsingDatepicker" class="customDatepicker">
                        </el-date-picker>
                    </span>
                </div>
                <div class="card-alt" v-loading="statistics.isLoading" v-if="statistics.data">
                    <div class="card-8 stats_area">
                        <span class="name">{{ $t('chargingStation.powerConsumption') }} (kWh)</span>
                        <div class="num_stats" v-if="statistics.data.totalEnergy">
                            <span class="num">{{ statistics.data.totalEnergy.value }}</span>
                            <span v-if="statistics.data.totalEnergy.trend!==0" :class="statistics.data.totalEnergy.trend>0?'positive num_trend':'negative num_trend'">
                                <i v-if="statistics.data.totalEnergy.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                                <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                                {{ Math.abs(statistics.data.totalEnergy.trend.toFixed(2)) }} %
                            </span>
                        </div>
                    </div>
                    <div class="card-8 stats_area">
                        <span class="name">{{ $t('chargingStation.totalTransaction') }}</span>
                        <div class="num_stats" v-if="statistics.data.transactions">
                            <span class="num">{{ statistics.data.transactions.value }}</span>
                            <span v-if="statistics.data.transactions.trend!==0" :class="statistics.data.transactions.trend>0?'positive num_trend':'negative num_trend'">
                                <i v-if="statistics.data.transactions.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                                <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                                {{ Math.abs(statistics.data.transactions.trend.toFixed(2)) }} %
                            </span>
                        </div>
                    </div>
                    <div class="card-8 stats_area">
                        <span class="name">{{ $t('chargingStation.totalUsers') }}</span>
                        <div class="num_stats" v-if="statistics.data.users">
                            <span class="num">{{ statistics.data.users.value }}</span>
                            <span v-if="statistics.data.users.trend!==0" :class="statistics.data.users.trend>0?'positive num_trend':'negative num_trend'">
                                <i v-if="statistics.data.users.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                                <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                                {{ Math.abs(statistics.data.users.trend.toFixed(2)) }}%
                            </span>
                        </div>
                    </div>
                    <div class="card-8 stats_area">
                        <span class="name">{{ $t('chargingStation.newUsers') }}</span>
                        <div class="num_stats" v-if="statistics.data.newUsers">
                            <span class="num">{{ statistics.data.newUsers.value }}</span>
                            <span v-if="statistics.data.newUsers.trend!==0" :class="statistics.data.newUsers.trend>0?'positive num_trend':'negative num_trend'">
                                <i v-if="statistics.data.newUsers.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                                <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                                {{ Math.abs( statistics.data.newUsers.trend.toFixed(2)) }}%
                            </span>
                        </div>
                    </div>
                    <div class="card-8 stats_area">
                        <span class="name">{{ $t('chargingStation.repeatedUsers') }}</span>
                        <div class="num_stats" v-if="statistics.data.repeatUsers">
                            <span class="num">{{ statistics.data.repeatUsers.value }}</span>
                            <span v-if="statistics.data.repeatUsers.trend!==0" :class="statistics.data.repeatUsers.trend>0?'positive num_trend':'negative num_trend'">
                                <i v-if="statistics.data.repeatUsers.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                                <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                                {{ Math.abs(statistics.data.repeatUsers.trend.toFixed(2)) }}%
                            </span>
                        </div>
                    </div>
                </div>

                <div class=" card-8 tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleClick">
                        <el-tab-pane :label="$t('menu.analysis')" name="analysis">
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
                            <el-select class="select-small customSelect" v-model="graphSelected" :placeholder="$t('general.location')" @change="updateGraphSelection">
                                <el-option v-for="item in graphList" :label="$t(`graphs.${item}`)" :key="item" :value="item"></el-option>
                            </el-select>
                        </div>
                        <div class="graph" v-if="graphSelected==='transactionAndTraffic' && dateRange.length>1 && curRouteParam.chargeBoxId">
                            <TransactionTraffic :dateRange="dateRange" :id="curRouteParam.chargeBoxId" type="charger"></TransactionTraffic>
                        </div>
                    </div>
                    <Transaction v-if="active==='transaction' && dateRange.length>1" :dateRange="dateRange" :chargerId="curRouteParam.chargeBoxId"></Transaction>
                    <Reservation v-else-if="active==='reservation' && dateRange.length>1" :dateRange="dateRange" :chargerId="curRouteParam.chargeBoxId" :isUpdateData="isUpDateReservationData" @updated="aleadyUpdateData('reservation')"></Reservation>
                    <ChargingProfile v-else-if="active==='chargingProfile'" :chargerId="curRouteParam.chargeBoxId" :isUpdateData="isUpDateChargingProfileData" @updated="aleadyUpdateData('chargingProfile')"></ChargingProfile>
                </div>
                <UpdateConnectorType :show="changeConnectorType.show" v-if="changeConnectorType.show" :connectorId="changeConnectorType.connectorId" :chargePointId="changeConnectorType.chargePointId" :connectorType="changeConnectorType.connectorType" @close="closeDialog('connectorType')" />
                <Configuration :show="configuration.show" v-if="configuration.show" :chargePointId="configuration.chargePointId" @close="closeDialog('configuration')" />
                <CommonPopup :show="commonpopup.show" v-if="commonpopup.show" :chargePointId="commonpopup.chargePointId" :rowData="commonpopup.rowData" :action="commonpopup.action" @close="closeDialog('commonpopup')"></CommonPopup>
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
import ChargingProfile from "@/components/chargingStation/chargingProfile";
import AddChargingProfile from "@/components/chargingStation/addChargingProfile";
import ClearChargingProfile from "@/components/chargingStation/clearChargingProfile";
import {
    $HTTP_getAllChargeBoxList,
    $HTTP_getConnectorStatusesById,
    $HTTP_getTransactionsStatistics
} from "@/api/api";
import UpdateConnectorType from "@/components/chargingStation/updateConnectorType";
import Configuration from "@/views/setting/configuration";
import CommonPopup from "@/components/commonPopup";
import RemoteTrigger from "@/components/chargingStation/remoteTrigger";
import UpdateFirmware from "@/components/chargingStation/updateFirmware";
import GetLocalAuthListVersion from "@/components/chargingStation/getLocalAuthListVersion";
import SendLocalAutList from "@/components/chargingStation/sendLocalAutList";
import { $GLOBAL_REFRESH } from "@/utils/global";
import GetDiagnostics from "@/components/chargingStation/getDiagnostics";
import moment from 'moment'
import TransactionTraffic from "@/components/charts/config/TransactionTraffic";
import UploadFirmware from "@/components/chargingStation/uploadFirmware";
import GetCompositeSchedule from "@/components/chargingStation/getCompositeSchedule";

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
        GetCompositeSchedule
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
            dateRange: [],
            pickerOptions: {
                disabledDate(time) {
                    let today = moment().endOf("day").format("x");
                    return time.getTime() > today;
                },
                shortcuts:[{
                    text: i18n.t('chargingStation.timeOpt.7days'),
                    onClick(picker) {
                        // 7 days including today
                        const startOfDay = moment().subtract(6,'days').startOf("day");
                        const endOfDay = moment().endOf("day");
                        let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                        picker.$emit('pick', _dateRange);
                    }
                },
                {
                    text: i18n.t('chargingStation.timeOpt.30days'),
                    onClick(picker) {
                        const startOfDay = moment().subtract(29,'days').startOf("day");
                        const endOfDay = moment().endOf("day");
                        let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                        picker.$emit('pick', _dateRange);
                    }
                },
                {
                    text: i18n.t('chargingStation.timeOpt.90days'),
                    onClick(picker) {
                        const startOfDay = moment().subtract(89,'days').startOf("day");
                        const endOfDay = moment().endOf("day");
                        let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                        picker.$emit('pick', _dateRange);
                    }
                },
                {
                    text: i18n.t('chargingStation.timeOpt.6months'),
                    onClick(picker) {
                        const startOfDay = moment().subtract(6,'months').startOf("day");
                        const endOfDay = moment().endOf("day");
                        let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                        picker.$emit('pick', _dateRange);
                    }
                },
                {
                    text: i18n.t('chargingStation.timeOpt.1year'),
                    onClick(picker) {
                        const startOfDay = moment().subtract(1,'years').startOf("day");
                        const endOfDay = moment().endOf("day");
                        let _dateRange = [new Date(startOfDay), new Date(endOfDay)];
                        picker.$emit('pick', _dateRange);
                    }
                }
                ]
            },
            permissionShowAlertAble: this.$store.state.permissionEditable,
            curRouteParam: {
                chargeBoxId: null
            },
            isLoading: false,
            active: "analysis",
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
            },
            getAuthVersionDialog: {
                chargePointId: '',
                visible: false
            },
            sendAutDialog: {
                chargePointId: '',
                visible: false
            },
            diagnosticsDialog: {
                chargePointId: '',
                visible: false
            },
            updateDialog: {
                chargePointId: '',
                visible: false
            },
            statistics:{
                isLoading: false,
                data: []
            },
            graphSelected: "transactionAndTraffic",
            graphList: ["transactionAndTraffic"],
            isUpDateChargingProfileData: true,
            addChargingProfile: {
                visible: false,
                data: {}
            },
            clearChargingProfile: {
                visible: false,
                data: {}
            },
            uploadFirmwareDialog:  {
                chargePointId: '',
                visible: false
            },
            getCompositeSchedule: {
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
        // add dates
        const startOfDay = moment().subtract(6,'days').startOf("day");
        const endOfDay = moment().endOf("day");
        this.dateRange = [new Date(startOfDay), new Date(endOfDay)];

        this.getChargePointsById(this.curRouteParam.chargeBoxId);

        this.getConnectorStatusesById(this.curRouteParam.chargeBoxId);
        this.getStatistics(this.curRouteParam.chargeBoxId);

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
            } else if (action === "updatesFirmware") {
                this.updateDialog.visible = true;
                this.updateDialog.chargePointId = this.chargePointById[0].id;
                this.$jQuery(".scroll").mCustomScrollbar("disable");
            } else if (action === "remoteTrigger") {
                this.remoteTrigger.data = {
                    chargePointId: this.chargePointById[0].id,
                    name: this.chargePointById[0].name
                };
                this.remoteTrigger.visible = true;
            } else if (action === "addChargingProfile") {
                this.addChargingProfile.data = {
                    chargePointId: this.chargePointById[0].id,
                    name: this.chargePointById[0].name
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
            } else if (action === "uploadFirmware"){
                this.uploadFirmwareDialog.visible = true;
                this.uploadFirmwareDialog.chargePointId = this.chargePointById[0].id;
            } else if (action === "getCompositeSchedule") {
                this.getCompositeSchedule.data = {
                    chargePointId: this.chargePointById[0].id,
                    name: this.chargePointById[0].name
                }
                this.getCompositeSchedule.visible = true;
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
            }
            this.setTimerApiCall();
        },
        aleadyUpdateData(type) {
            if (type === "reservation") {
                this.isUpDateReservationData = false;
            } else if (type === "chargingProfile") {
                this.isUpDateChargingProfileData = false;
            }
        },
        handleClick() {
            window.sessionStorage.setItem("fiics-activeTab", this.active);
        },
        getStatistics(id) {
            let params = {};
            params.chargePointId = id;
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
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        getDataUsingDatepicker() {
            this.isUpDateReservationData = true
            this.getStatistics(this.curRouteParam.chargeBoxId);
        },
        updateGraphSelection() {
            console.log("get graph data");
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
    .graph{
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
    .stats_area{
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
        width: calc(26.05% - 32px)!important;
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
    }

    .connector-area {
       width: calc(44.05% - 32px)!important;
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
.charge-point-info, .card-alt{
   flex-wrap:wrap;
       .stats_area {
            flex: 25%;
    }
}
.rank-area{
   flex:25%;
}
.connector-area{
    flex:50%;
}
}
 @media screen and (max-width: 800px) {
 .rank-area{
   flex:50%;
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
