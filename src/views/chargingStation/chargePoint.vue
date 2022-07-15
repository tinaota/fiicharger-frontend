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
                    <el-input placeholder="Id" v-model="filter.tmpSearch" @change="fetchData('s')" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-select class="select-small long" :placeholder="$t('chargingStation.connection') +' '+ $t('general.status')" v-model="filter.chargeBoxStatus" @change="fetchData('s')" clearable>
                        <el-option :label="$t('general.all')" value=""></el-option>
                        <el-option v-for="(item, idx) in chargeBoxStatusList" :label="item" :key="idx" :value="item"></el-option>
                    </el-select>
                    <el-select class="select-small long" :placeholder="$t('general.type')" v-model="filter.currentType" @change="fetchData('s')" clearable>
                        <el-option :label="$t('general.all')" value=""></el-option>
                        <el-option label="AC" value="AC"></el-option>
                        <el-option label="DC" value="DC"></el-option>
                    </el-select>

                    <el-input :placeholder="$t('chargingStation.stationID')" v-model="filter.stationId" @change="fetchData('s')" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-input :placeholder="$t('general.name')" v-model="filter.name" @change="fetchData('s')" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol" v-loading="isLoading">
                    <el-table-column :label="$t('chargingStation.chargePointID')" :min-width="3">
                        <template slot-scope="scope">
                            <el-link type="primary" underline @click="()=>handleRowClick(scope.row)">#{{scope.row.id}}</el-link>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" :label="$t('general.name')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('chargingStation.power')" :min-width="2">
                        <template slot-scope="scope">
                            {{scope.row.powerKw + "kW"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connection') +' '+ $t('general.status')" :min-width="2" class-name="center">
                        <template slot-scope="scope">

                            <el-tooltip v-if="scope.row.status===`Connected`" :content="$t('general.connected')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color1"></span>
                            </el-tooltip>
                            <!-- <el-tooltip v-else-if="scope.row.status===`Maintenance`" :content="$t('general.maintenance')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color3"></span>
                            </el-tooltip>
                            <el-tooltip v-else-if="scope.row.status===`Alert`" :content="$t('general.alert')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color4"></span>
                            </el-tooltip>
                            <el-tooltip v-else-if="scope.row.status===`Unknown`" :content="$t('general.unknown')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status unknown">
                                    <img :src="unknown">
                                </span>
                            </el-tooltip>
                            <el-tooltip v-else-if="scope.row.status===`ConnectionLost`" :content="$t('general.connectionLost')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color7"></span>
                            </el-tooltip> -->
                            <el-tooltip v-else :content="$t('general.disconnected')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color5"></span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connector')" :min-width="2">
                        <template slot-scope="scope">
                            <!-- {{scope.row.connectors.length}} -->
                            <Connector :dataObj="scope.row.connectors" :chargerStatus="scope.row.status" :isBreak="true"></Connector>
                        </template>
                    </el-table-column>
                    <el-table-column prop="lastHeartbeat" label="Last Heartbeat" :min-width="2"></el-table-column>

                    <el-table-column :label="$t('general.type')" :min-width="2" class-name="center">
                        <template slot-scope="scope">
                            {{ scope.row.currentType}}
                        </template>
                    </el-table-column>
                    <!-- <el-table-column :label="$t('chargingStation.elecRate')">
                        <el-table-column :label="$t('chargingStation.onPeak')" :min-width="3" :render-header="(h, {column}) => renderTipsHeader(h, {column}, true)">
                            <template slot-scope="scope">
                                {{scope.row.chargePrice!==null?  getSymbols(scope.row.chargePrice.currencyType) + getSymbols(scope.row.chargePrice.onPeak.rate) + '/' + getSymbols(scope.row.chargePrice.onPeak.type):'-'}}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('chargingStation.offPeak')" :min-width="3" :render-header="(h, {column}) => renderTipsHeader(h, {column}, false)">
                            <template slot-scope="scope">
                                {{scope.row.chargePrice!==null?  getSymbols(scope.row.chargePrice.currencyType) + getSymbols(scope.row.chargePrice.offPeak.rate) + '/' + getSymbols(scope.row.chargePrice.offPeak.type):'-'}}
                            </template>
                        </el-table-column>
                    </el-table-column> -->
                    <!-- <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="180">
                        <template slot-scope="scope">
                            <el-tooltip :content="scope.row.coordinates.longitude+','+scope.row.coordinates.latitude" placement="bottom" effect="light" popper-class="custom">
                                <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                            </el-tooltip>
                            <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="deleteCheckBox(scope.row.id)"></el-button>
                            <el-button class="no-bg currency" @click="openChargeBoxPriceDialog(scope.row)"></el-button>
                        </template>
                    </el-table-column>
                    <el-table-column v-else :label="$t('general.action')" :width="65">
                        <template slot-scope="scope">
                            <el-tooltip :content="scope.row.coordinates.longitude+','+scope.row.coordinates.latitude" placement="bottom" effect="light" popper-class="custom">
                                <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column> -->
                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="146">
                        <template slot-scope="scope">
                            <el-dropdown trigger="click">
                                <el-button class="action_chargers_stations">
                                    {{$t('general.action')}}<i class="el-icon-arrow-down el-icon--right"></i>
                                </el-button>
                                <el-dropdown-menu slot="dropdown" class="actions">
                                    <el-dropdown-item>
                                        <span>
                                            Charger Profile
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'add')">Add</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            Charger Profile
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'clear')">Clear</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            Diagnostics
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'start')">Start</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            Updates
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'run')">Run</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            Clear Cache
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'clearCache')">Clear</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            Hard Reset
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'hardReset')">Reset</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            Soft Reset
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'softReset')">Reset</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            Edit Charger
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'edit')">Edit</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            Remove Charger
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'delete')">Delete</el-button>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total})}}</div>
                <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
                </el-pagination>
            </div>
            <EditChargeBox name="chargeBox" :show="dialogVisible" :dialog="dialog" @close="(e)=>closeDialog(e,'edit')"></EditChargeBox>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="(e)=>closeDialog(e,'map')"></ShowPostion>
            <ModifyChargeBoxPrice v-if="chargeBoxPriceDialog.visible" :show="chargeBoxPriceDialog.visible" :data="chargeBoxPriceDialog.data" @close="(e)=>closeDialog(e, 'modifyChargeBoxPrice')"></ModifyChargeBoxPrice>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime, transformToSymbols } from "@/utils/function";
import EditChargeBox from "@/components/chargingStation/editChargeBox";
import ShowPostion from "@/components/chargingStation/showPostion";
import ModifyChargeBoxPrice from "@/components/chargingStation/modifyChargeBoxPrice";
import { $GLOBAL_CURRENCY, $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import {
    $HTTP_getAllChargeBoxList,
    $HTTP_getZipCodeListForSelect,
    $HTTP_deleteChargeBox,
    $HTTP_getStatusListChargeBoxes,
} from "@/api/api";
import Connector from "@/components/chargingStation/connector";
import $ from "jquery";
import unknown from "imgs/help_icon.svg";

export default {
    components: {
        EditChargeBox,
        ShowPostion,
        Connector,
        ModifyChargeBoxPrice,
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
                // stationId: '',
                zipCode: "",
                operatorTypeId: "",
                currentType: null,
                chargeBoxStatus: null,
                stationId: null,
                name: null,
            },
            isLoading: false,
            // stationList: {
            //     isLoading: false,
            //     data: {}
            // },
            loctionList: {
                isLoading: false,
                data: [],
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
                        lat: "",
                    },
                    id: "",
                    stationId: "",
                    chargeType: "AC",
                    unitType: "",
                    power: 0,
                    onPeakElectricityRate: 0,
                    onPeakElectricityRateType: 1,
                    offPeakElectricityRate: 0,
                    offPeakElectricityRateType: 1,
                    parkingRate: 0,
                    installationDate: "",
                    operatorTypeId: "",
                    dateTimeTest: "",
                },
            },
            mapDialog: {
                visible: false,
                itemId: "",
                position: {
                    lat: "",
                    lng: "",
                },
            },
            chargeBoxPriceDialog: {
                visible: false,
                isLoading: false,
                data: {},
            },
            connectorList: [],
            chargeBoxStatusList: [],
            polling: null,
        };
    },
    computed: {
        getSymbols() {
            return (item) => transformToSymbols(item);
        },
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        },
    },
    mounted() {
        if (this.$router.currentRoute.params.chargeBoxStatus) {
            this.filter.chargeBoxStatus = this.$router.currentRoute.params.chargeBoxStatus;
        }
        if (this.$router.currentRoute.params.stationId) {
            this.filter.stationId = this.$router.currentRoute.params.stationId;
        }
        setScrollBar(".scroll", this);
        this.fetchData();
        this.fetchLocationList();
        this.getStatusList();
    },
    beforeDestroy() {
        clearInterval(this.polling);
        this.dialog.map && google.maps.event.clearListeners(this.dialog.map, "click");
    },
    methods: {
        runAction(data, action) {
            console.log(data, action);
            if (action === "edit") {
                this.openDialog(1, data);
            } else if (action === "delete") {
                this.deleteCheckBox(data.id);
            }
        },
        fetchLocationList() {
            const that = this;
            this.loctionList.isLoading = true;
            $HTTP_getZipCodeListForSelect()
                .then((data) => {
                    this.loctionList.isLoading = false;
                    if (data?.length > 0) {
                        this.loctionList.data = data;
                    }
                })
                .catch((err) => {
                    console.log("loctionList", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        fetchData(type) {
            const that = this;
            this.isLoading = true;
            let param = {
                page: this.page,
                limit: this.limit,
            };
            if (this.filter.operatorTypeId && this.filter.operatorTypeId != "1") {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.zipCode) {
                param.zipCode = this.filter.zipCode;
            }
            if (this.filter.chargeBoxStatus) {
                param.Status = this.filter.chargeBoxStatus;
            }
            if (this.filter.tmpSearch) {
                param.id = this.filter.tmpSearch;
            }

            if (this.filter.currentType) {
                param.CurrentType = this.filter.currentType;
            }

            if (this.filter.stationId) {
                param.StationId = this.filter.stationId;
            }

            if (this.filter.name) {
                param.Name = this.filter.name;
            }

            if (type === "s") {
                this.page = 1;
                param["page"] = 1;
            }
            this.getAllChargeBoxList(param);

            this.polling = setInterval(() => {
                this.getAllChargeBoxList(param);
            }, 30000);
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
                        this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    console.log(err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            if (type !== 0) {
                this.dialog.info = {
                    chargeBoxId: data.id,
                    loc: {
                        lng: data.coordinates.longitude,
                        lon: data.coordinates.longitude,
                        lat: data.coordinates.latitude,
                    },
                    chargeType: data.currentType,
                    installationDate: data.installed,
                    chargeBoxName: data.name,
                    id: data.id,
                    power: data.powerKw,
                };
            } else {
                this.dialog.info = {
                    chargeBoxId: "",
                    loc: {
                        lng: "",
                        lon: "",
                        lat: "",
                    },
                    chargeType: "AC",
                    installationDate: "",
                    chargeBoxName: "",
                    id: "",
                    power: 0,
                };
            }
            this.dialogVisible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        deleteCheckBox(id) {
            const that = this;
            this.$confirm(i18n.t("general.deleteItem", { item: id }), i18n.t("general.hint"), {
                showClose: false,
                customClass: `custom ${this.isDark ? "dark-theme" : "light-theme"}`,
            }).then(() => {
                $HTTP_deleteChargeBox({ chargePointId: id })
                    .then((data) => {
                        if (data?.status === 204) {
                            that.$message({ type: "success", message: i18n.t("general.sucDelMsg") });
                            if (this.tableData.length === 1) {
                                if (this.page >= 2) {
                                    this.page = this.page - 1;
                                } else {
                                    this.page = 1;
                                }
                            }
                            that.fetchData();
                        } else {
                            this.$message({ type: "warning", message: i18n.t("error_network") });
                        }
                    })
                    .catch((err) => {
                        if (err.status === 500) {
                            that.$message({ type: "warning", message: i18n.t("cannotDelete") });
                        }
                    });
            });
        },
        openChargeBoxPriceDialog(data) {
            this.chargeBoxPriceDialog.visible = true;
            this.chargeBoxPriceDialog.data.chargePrice = data.chargePrice;
            this.chargeBoxPriceDialog.data.chargeBoxId = data.id;
            this.chargeBoxPriceDialog.data.name = data.name;
        },
        closeDialog(e, dialog) {
            if (dialog === "map") {
                this.mapDialog.visible = false;
            } else if (dialog === "edit") {
                this.dialogVisible = false;
            } else if (dialog === "modifyChargeBoxPrice") {
                this.chargeBoxPriceDialog.visible = false;
            }
            this.fetchData();

            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        handleShowDialog(data) {
            this.mapDialog.itemId = data.chargeBoxId;
            this.mapDialog.position = { lat: data.coordinates.latitude, lng: data.coordinates.longitude };
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        handleRowClick(row) {
            if (row) {
                const data = Object.assign({}, row);
                window.sessionStorage.setItem("fiics-chargePointInfo", JSON.stringify(data));
                this.$router.push({ name: "chargePointDetail", params: data }).catch();
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
                            content: isOnPeak
                                ? i18n.t("chargingStation.onPeakHint")
                                : i18n.t("chargingStation.offPeakHint"),
                            placement: "bottom",
                            "popper-class": "custom",
                        },
                    },
                    [
                        h("i", {
                            class: "el-icon-warning-outline",
                            style: "color:#0C83FF; margin-left:4px; font-weight: bold;",
                        }),
                    ]
                ),
            ]);
        },
        getStatusList() {
            let that = this;
            $HTTP_getStatusListChargeBoxes().then((res) => (that.chargeBoxStatusList = res));
        },
    },
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
}
.el-link {
    text-decoration: underline;
    color: #0056ff;
}

.el-link:hover {
    text-decoration: none;
    color: #0056ff;
}
.actions li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .actionFunction {
        min-width: 65px;
    }
}
.action_chargers_stations{
    background-color: transparent;
    border-color: #409EFF;
    border-width: 2px;
    color: #409EFF;
    font-weight:600;
}
</style>