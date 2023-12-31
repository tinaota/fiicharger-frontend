<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select class="select-small" v-model="filter.zipCode" :placeholder="$t('general.location')" v-loading="loctionList.isLoading" @change="fetchData('s')" clearable>
                        <el-option v-for="item in loctionList.data" :label="item" :key="item" :value="item"></el-option>
                    </el-select>
                    <el-select class="select-small" v-model="filter.stationId" :placeholder="$t('chargingStation.station')" v-loading="stationList.isLoading" @change="fetchData('s')" clearable>
                        <el-option v-for="item in stationList.data" :label="item.name" :key="item.id" :value="item.id"></el-option>
                    </el-select>
                    <el-input :placeholder="$t('chargingStation.charger')+ ' ID'" v-model="filter.tmpSearch" @change="fetchData('s')" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-input :placeholder="$t('general.name')" v-model="filter.name" @change="fetchData('s')" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-select class="select-small long" :placeholder="$t('chargingStation.connectionStatus')" v-model="filter.chargeBoxStatus" @change="fetchData('s')" clearable>
                        <el-option :label="$t('general.all')" value="all"></el-option>
                        <el-option v-for="(item, idx) in chargeBoxStatusList" :label="item" :key="idx" :value="item"></el-option>
                    </el-select>
                    <el-select class="select-small long" :placeholder="$t('general.type')" v-model="filter.powerType" @change="fetchData('s')" clearable>
                        <el-option v-for="(item, idx) in powerTypeList" :label="item.name" :key="idx" :value="item.value"></el-option>
                    </el-select>
                    <el-button v-if="permissionEditAble" aria-label="plus button" class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol" v-loading="isLoading">
                    <el-table-column :label="$t('chargingStation.chargerId')" width="320">
                        <template slot-scope="scope">
                            <el-link type="primary" underline @click="()=>handleRowClick(scope.row)">#{{ scope.row.ocppId }}</el-link>
                            <el-tooltip :content="scope.row.coordinates.longitude+','+scope.row.coordinates.latitude" placement="bottom" effect="light" popper-class="custom">
                                <el-button aria-label="location" class="no-bg" @click="handleShowDialog(scope.row)"><i class="fa fa-map-marker" aria-hidden="true"></i>
                                </el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" :label="$t('general.name')" width="320"></el-table-column>
                    <el-table-column :label="$t('general.power')" width="150">
                        <template slot-scope="scope">
                            {{ scope.row.powerKw + "kW" }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connectionStatus')" width="150" class-name="center">
                        <template slot-scope="scope">
                            <el-tooltip v-if="scope.row.connectionStatus===`Connected`" :content="$t('general.connected')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color1"></span>
                            </el-tooltip>
                            <el-tooltip v-else :content="$t('general.disconnected')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color5"></span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connector')" width="250">
                        <template slot-scope="scope">
                            <Connector :dataObj="scope.row.connectors" :chargerStatus="scope.row.connectionStatus" :isBreak="true"></Connector>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.lastHeartbeat')" width="200">
                        <template slot-scope="scope">
                            {{ scope.row.lastHeartbeat!==null? getLocTime(scope.row.lastHeartbeat):'' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.type')" width="200" class-name="center">
                        <template slot-scope="scope">
                            {{ scope.row.powerType? getPowerType(scope.row.powerType):'' }}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" width="150">
                        <template slot-scope="scope">
                            <el-dropdown trigger="click">
                                <el-button class="action_chargers_stations">
                                    {{ $t('general.action') }}<i class="el-icon-arrow-down el-icon--right"></i>
                                </el-button>
                                <el-dropdown-menu slot="dropdown" :class="isDark ? 'dark-theme actions':'actions'">
                                    <ActionItem isDropdown buttonName="general.add" actionName="chargingStation.chargingProfile" action="addChargingProfile" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.clear" actionName="chargingStation.chargingProfile" action="clearChargingProfile" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.start" actionName="chargingStation.diagnostics" action="getDiagnostics" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.run" actionName="chargingStation.updates" action="updatesFirmware" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.clear" actionName="chargingStation.clearCache" action="clearCache" dialogType="commonpopup" @runAction="(action,dialogType)=>openActionDialog(scope.row.id,dialogType,action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.reset" actionName="chargingStation.softReset" action="softReset" dialogType="commonpopup" @runAction="(action,dialogType)=>openActionDialog(scope.row.id,dialogType,action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.reset" actionName="chargingStation.hardReset" action="hardReset" dialogType="commonpopup" @runAction="(action,dialogType)=>openActionDialog(scope.row.id,dialogType,action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.modify" actionName="chargingStation.modifyCharger" action="edit" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType, action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.delete" actionName="chargingStation.deleteCharger" action="delete" @runAction="(action,dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                    <ActionItem isDropdown buttonName="general.modify" actionName="menu.tariff" action="modifyTariff" @runAction="(action, dialogType)=>openActionDialog(scope.row,dialogType,action)"></ActionItem>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total}) }}</div>
                <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
                </el-pagination>
            </div>
            <EditChargeBox name="chargeBox" :show="dialogVisible" :dialog="dialog" @close="(e)=>closeDialog(e,'edit')"></EditChargeBox>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="(e)=>closeDialog(e,'map')"></ShowPostion>
            <ModifyChargeBoxTariff v-if="chargeBoxTariffDialog.visible" :show="chargeBoxTariffDialog.visible" :data="chargeBoxTariffDialog.data" @close="(e)=>closeDialog(e, 'modifyChargeBoxTariff')"></ModifyChargeBoxTariff>
            <CommonPopup :show="commonpopup.show" v-if="commonpopup.show" :chargePointId="commonpopup.chargePointId" :action="commonpopup.action" @close="closeActionDialog('commonpopup')"></CommonPopup>
            <GetDiagnostics :chargePointId="diagnosticsDialog.chargePointId" :show="diagnosticsDialog.visible" @close="(e)=>closeDialog(e, 'diagnosticsDialog')"></GetDiagnostics>
            <UpdateFirmware :chargePointId="updateDialog.chargePointId" :show="updateDialog.visible" @close="(e)=>closeDialog(e,'updateDialog')"></UpdateFirmware>
            <AddChargingProfile :show="addChargingProfile.visible" :data="addChargingProfile.data" @close="closeActionDialog('addChargingProfile')"></AddChargingProfile>
            <ClearChargingProfile :show="clearChargingProfile.visible" :data="clearChargingProfile.data" @close="closeActionDialog('clearChargingProfile')"></ClearChargingProfile>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime, transformToSymbols, catchErrors } from "@/utils/function";
import EditChargeBox from "@/components/chargingStation/editChargeBox";
import ShowPostion from "@/components/chargingStation/showPostion";
import ModifyChargeBoxTariff from "@/components/chargingStation/modifyChargeBoxTariff";
import { $GLOBAL_CURRENCY, $GLOBAL_PAGE_LIMIT, $ALL_DATA_COUNT, $GLOBAL_REFRESH, $POWER_TYPE_LIST } from "@/utils/global";
import {
    $HTTP_getAllChargeBoxList,
    $HTTP_getZipCodeListForSelect,
    $HTTP_deleteChargeBox,
    $HTTP_getStatusListChargeBoxes,
    $HTTP_getStationList
} from "@/api/api";
import Connector from "@/components/chargingStation/connector";
import unknown from "imgs/help_icon.svg";
import CommonPopup from "@/components/commonPopup";
import GetDiagnostics from "@/components/chargingStation/getDiagnostics";
import UpdateFirmware from "@/components/chargingStation/updateFirmware";
import AddChargingProfile from "@/components/chargingStation/addChargingProfile";
import ClearChargingProfile from "@/components/chargingStation/clearChargingProfile";
import ActionItem from "@/components/htmlComponents/actions/actionItem";
export default {
    components: {
        EditChargeBox,
        ShowPostion,
        Connector,
        ModifyChargeBoxTariff,
        CommonPopup,
        GetDiagnostics,
        UpdateFirmware,
        AddChargingProfile,
        ClearChargingProfile,
        ActionItem
    },
    data() {
        return {
            isDark: this.$store.state.darkTheme,
            unknown: unknown,
            lang: this.$store.state.lang,
            permissionEditAble: this.$store.state.permissionEditable,
            filter: {
                tmpSearch: "",
                search: "",
                zipCode: "",
                powerType: null,
                chargeBoxStatus: null,
                name: null,
                stationId: null
            },
            isLoading: false,
            loctionList: {
                isLoading: false,
                data: []
            },
            stationList: {
                isLoading: false,
                data: []
            },
            tableData: [],
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT,
            total: 0,
            currencyList: $GLOBAL_CURRENCY,
            dialogVisible: false,
            dialog: {
                visible: false,
                type: 0,
                info: {
                    chargeBoxId: "",
                    chargeBoxName: "",
                    loc: {
                        lng: "",
                        lon: "",
                        lat: ""
                    },
                    id: "",
                    chargeType: "AC_1_PHASE",
                    unitType: "",
                    power: 0,
                    onPeakElectricityRate: 0,
                    onPeakElectricityRateType: 1,
                    offPeakElectricityRate: 0,
                    offPeakElectricityRateType: 1,
                    parkingRate: 0,
                    installationDate: "",
                    dateTimeTest: ""
                }
            },
            mapDialog: {
                visible: false,
                itemId: "",
                position: {
                    lat: "",
                    lng: ""
                }
            },
            chargeBoxTariffDialog: {
                visible: false,
                isLoading: false,
                data: {}
            },
            updateDialog: {
                chargePointId: "",
                visible: false
            },
            connectorList: [],
            chargeBoxStatusList: [],
            polling: null,
            commonpopup: {
                show: false,
                chargePointId: null,
                action: ""
            },
            timeOut: null,
            diagnosticsDialog: {
                visible: false,
                chargePointId: ""
            },
            addChargingProfile: {
                visible: false,
                data: {}
            },
            clearChargingProfile: {
                visible: false,
                data: {}
            },
            powerTypeList: $POWER_TYPE_LIST
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
        selectedOrganization: function () {
            return this.$store.state.selectedOrganization;
        },
        userRole: function () {
            return this.$store.state.role;
        }
    },
    watch: {
        selectedOrganization: function () {
            this.fetchData();
            this.getStationList();
        }
    },
    mounted() {
        if (this.$router.currentRoute.params.chargeBoxStatus) {
            this.filter.chargeBoxStatus = this.$router.currentRoute.params.chargeBoxStatus;
        }
        setScrollBar(".scroll", this);
        this.fetchData();
        this.fetchLocationList();
        this.getStatusList();
        this.getStationList();
    },
    beforeDestroy() {
        clearInterval(this.polling);
        clearTimeout(this.timeOut);
        this.dialog.map && google.maps.event.clearListeners(this.dialog.map, "click");
    },
    methods: {
        openActionDialog(row, type, action = "") {
            if (type === "commonpopup") {
                this.commonpopup.show = true;
                this.commonpopup.chargePointId = row;
                this.commonpopup.action = action;
            } else {
                if (action === "addChargingProfile") {
                    this.addChargingProfile.data = {
                        chargePointId: row.id,
                        name: row.name,
                        ocppId: row.ocppId
                    };
                    this.addChargingProfile.visible = true;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "clearChargingProfile") {
                    this.clearChargingProfile.data = {
                        chargePointId: row.id,
                        name: row.name
                    };
                    this.clearChargingProfile.visible = true;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "modifyTariff") {
                    this.chargeBoxTariffDialog.visible = true;
                    this.chargeBoxTariffDialog.data.chargeBoxId = row.id;
                    this.chargeBoxTariffDialog.data.name = row.name;
                    this.chargeBoxTariffDialog.data.ocppId = row.ocppId;
                } else if (action === "edit") {
                    this.openDialog(1, row);
                } else if (action === "delete") {
                    this.deleteCheckBox(row.id, row.ocppId);
                } else if (action === "getDiagnostics") {
                    this.diagnosticsDialog.visible = true;
                    this.diagnosticsDialog.chargePointId = row.id;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                } else if (action === "updatesFirmware") {
                    this.updateDialog.visible = true;
                    this.updateDialog.chargePointId = row.id;
                    this.$jQuery(".scroll").mCustomScrollbar("disable");
                }
            }
        },
        closeActionDialog(type) {
            if (type === "commonpopup") {
                this.commonpopup.show = false;
                this.commonpopup.chargePointId = null;
                this.commonpopup.action = "";
            } else if (type === "addChargingProfile") {
                this.addChargingProfile.visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            } else if (type === "clearChargingProfile") {
                this.clearChargingProfile.visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            }
            this.setTimerApiCall();
        },
        setTimerApiCall() {
            //delay for 2seconds before requesting data
            this.timeOut = setTimeout(() => {
                this.fetchData();
            }, 2000);
        },
        fetchLocationList() {
            this.loctionList.isLoading = true;
            $HTTP_getZipCodeListForSelect()
                .then((data) => {
                    this.loctionList.isLoading = false;
                    if (data?.length > 0) {
                        this.loctionList.data = data;
                    }
                })
                .catch((err) => {
                    let errorMessage = catchErrors("loctionList", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        fetchData(type) {
            this.isLoading = true;
            clearInterval(this.polling);
            let param = {
                page: this.page,
                limit: this.limit
            };
            if (this.filter.zipCode) {
                param.zipCode = this.filter.zipCode;
            }
            if (this.filter.chargeBoxStatus && this.filter.chargeBoxStatus !== "all") {
                param.Status = this.filter.chargeBoxStatus;
            }
            if (this.filter.tmpSearch) {
                param.OcppId = this.filter.tmpSearch;
            }
            if (this.filter.stationId) {
                param.StationId = this.filter.stationId;
            }

            if (this.filter.powerType && this.filter.powerType !== "all") {
                param.PowerType = this.filter.powerType;
            }

            if (this.filter.name) {
                param.Name = this.filter.name;
            }

            if (type === "s") {
                this.page = 1;
                param["page"] = 1;
            }
            if (
                (this.selectedOrganization.length >= 1 && this.userRole !== "Admin") ||
                (this.userRole === "Admin" && this.selectedOrganization[0]?.name !== "All")
            ) {
                param.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
            }
            this.getAllChargeBoxList(param);

            this.polling = setInterval(() => {
                this.getAllChargeBoxList(param);
            }, $GLOBAL_REFRESH);
        },
        getStationList() {
            let params = {
                page: this.page,
                limit: $ALL_DATA_COUNT
            };
            if (
                (this.selectedOrganization.length >= 1 && this.userRole !== "Admin") ||
                (this.userRole === "Admin" && this.selectedOrganization[0]?.name !== "All")
            ) {
                params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
            }
            this.stationList.isLoading = true;
            $HTTP_getStationList(params)
                .then((res) => {
                    this.stationList.isLoading = false;
                    if (res.data.length > 0) {
                        this.stationList.data = res.data;
                    } else {
                        this.stationList.data = [];
                        if (
                            this.filter.name ||
                            this.filter.tmpSearch ||
                            this.filter.zipCode ||
                            this.filter.chargeBoxStatus ||
                            this.filter.powerType ||
                            this.filter.stationId
                        ) {
                            this.$message({
                                type: "warning",
                                message: i18n.t("emptyMessage")
                            });
                        }
                    }
                })
                .catch((err) => {
                    this.stationList.data = [];
                    let errorMessage = catchErrors("stationlist", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        getAllChargeBoxList(param) {
            $HTTP_getAllChargeBoxList(param)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        if (
                            this.filter.name ||
                            this.filter.tmpSearch ||
                            this.filter.zipCode ||
                            this.filter.chargeBoxStatus ||
                            this.filter.powerType ||
                            this.filter.stationId
                        ) {
                            this.$message({
                                type: "warning",
                                message: i18n.t("emptyMessage")
                            });
                        }
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    let errorMessage = catchErrors("chargebox list", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        openDialog(type, data) {
            this.dialog.type = type;
            if (type !== 0) {
                this.dialog.info = {
                    chargeBoxId: data.id,
                    loc: {
                        lng: data.coordinates.longitude,
                        lon: data.coordinates.longitude,
                        lat: data.coordinates.latitude
                    },
                    chargeType: data.powerType,
                    installationDate: new Date(data.installed),
                    chargeBoxName: data.name,
                    id: data.id,
                    power: data.powerKw,
                    ocppId: data.ocppId,
                    operator: data.operator
                };
            } else {
                this.dialog.info = {
                    chargeBoxId: "",
                    loc: {
                        lng: "",
                        lon: "",
                        lat: ""
                    },
                    chargeType: "AC_1_PHASE",
                    installationDate: "",
                    chargeBoxName: "",
                    id: "",
                    power: 0,
                    operator: null,
                    selectedOrganizationInForm: ""
                };
            }
            this.dialogVisible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        deleteCheckBox(id, ocppId) {
            const that = this;
            this.$confirm(i18n.t("general.deleteItem", { item: ocppId }), i18n.t("general.hint"), {
                showClose: false,
                customClass: `custom ${this.isDark ? "dark-theme" : "light-theme"}`
            })
                .then(() => {
                    $HTTP_deleteChargeBox({ chargePointId: id })
                        .then((data) => {
                            if (data?.status === 204) {
                                that.$message({
                                    type: "success",
                                    message: i18n.t("general.sucDelMsg")
                                });
                                if (this.tableData.length === 1) {
                                    if (this.page >= 2) {
                                        this.page = this.page - 1;
                                    } else {
                                        this.page = 1;
                                    }
                                }
                                setTimeout(() => {
                                    that.fetchData();
                                }, 2000);
                            } else {
                                this.$message({
                                    type: "warning",
                                    message: i18n.t("error_network")
                                });
                            }
                        })
                        .catch((err) => {
                            if (err.status === 500) {
                                let errorMessage = catchErrors("delete charge box", err);
                                that.$message({ type: "warning", message: errorMessage });
                            }
                        });
                })
                .catch(() => {});
        },
        closeDialog(e, dialog) {
            if (dialog === "map") {
                this.mapDialog.visible = false;
            } else if (dialog === "edit") {
                this.dialogVisible = false;
            } else if (dialog === "modifyChargeBoxTariff") {
                this.chargeBoxTariffDialog.visible = false;
            } else if (dialog === "diagnosticsDialog") {
                this.diagnosticsDialog.visible = false;
            } else if (dialog === "updateDialog") {
                this[dialog].visible = false;
                this.$jQuery(".scroll").mCustomScrollbar("update");
            }
            this.fetchData();

            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        handleShowDialog(data) {
            this.mapDialog.itemId = data.chargeBoxId;
            this.mapDialog.position = {
                lat: data.coordinates.latitude,
                lng: data.coordinates.longitude
            };
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        handleRowClick(row) {
            if (row) {
                const data = Object.assign({}, row);
                window.sessionStorage.setItem("fiics-chargePointInfo", JSON.stringify(data));
                this.$router.push({ name: "ChargePoint Detail", params: data }).catch();
            }
        },
        renderTipsHeader(h, { column }, isOnPeak) {
            return h("div", [
                h("span", column.label),
                h(
                    "el-tooltip",
                    {
                        props: {
                            effect: "light",
                            content: isOnPeak ? i18n.t("chargingStation.onPeakHint") : i18n.t("chargingStation.offPeakHint"),
                            placement: "bottom",
                            "popper-class": "custom"
                        }
                    },
                    [
                        h("i", {
                            class: "el-icon-warning-outline",
                            style: "color:#0C83FF; margin-left:4px; font-weight: bold;"
                        })
                    ]
                )
            ]);
        },
        getStatusList() {
            let that = this;
            $HTTP_getStatusListChargeBoxes().then((res) => (that.chargeBoxStatusList = res));
        }
    }
};
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .total {
        position: absolute;
        right: 28px;
        bottom: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5a607f;
        letter-spacing: 0;
    }
    .filter .dark.el-select.long {
        width: 240px;
    }
    .unknown {
        width: 20px;
        height: 20px;
        margin-left: -2px;
    }
    .fa-map-marker {
        font-size: 1rem;
    }
}
.el-link {
    text-decoration: underline;
    color: #0056ff;
}

.el-link:hover {
    text-decoration: none;
    color: #0056ff;
}

.action_chargers_stations {
    background-color: transparent;
    border-color: #409eff;
    border-width: 2px;
    color: #409eff;
    font-weight: 600;
}

.actionFunction {
    margin-left: 10px;
}
.actions {
    padding: 10px 0px;
    margin: 0px;
}
</style>
