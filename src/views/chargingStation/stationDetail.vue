'<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/station' }">{{ $t('menu.station') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.stationId + " " + curRouteParam.stationName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8">
                <div class="header">{{ $t('chargingStation.stationInfo') }}</div>
                <el-table :data="[stationInfo]" v-loading="isLoading" class="center">
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="2"></el-table-column>
                    <el-table-column prop="stationName" :label="$t('chargingStation.stationName')" :min-width="3"></el-table-column>
                    <el-table-column prop="zipCode" :label="$t('general.zipCode')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('general.address')" :min-width="5">
                        <template slot-scope="scope">
                            {{ scope.row.address }}
                            <el-tooltip :content="scope.row.loc.lon+','+scope.row.loc.lat" placement="bottom" effect="light" popper-class="custom">
                                <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.businessHours')" :min-width="5">
                        <template slot-scope="scope">
                            {{ scope.row.serviceStartTime + '-' + scope.row.serviceEndTime }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.telephone')" :min-width="5">
                        <template slot-scope="scope">
                            {{ scope.row.phone }}
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('menu.summary') }}</div>
                </div>
                <ul class="rank">
                    <li>
                        <div class="label">
                            <span class="name">Power Consumption</span>
                            <span class="num">774Kwh</span>
                        </div>
                    </li>
                    <li>
                        <div class="label">
                            <span class="name">Total Revenue</span>
                            <span class="num">$654.37</span>
                        </div>
                    </li>
                    <li>
                        <div class="label">
                            <span class="name">Total Sessions</span>
                            <span class="num">14</span>
                        </div>
                    </li>
                    <li>
                        <div class="label">
                            <span class="name">Number of Chargers</span>
                            <span class="num">3</span>
                        </div>
                    </li>
                    <li>
                        <div class="label">
                            <span class="name">Number of Connectors</span>
                            <span class="num">6</span>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('general.action') }}</div>
                </div>
                <ul class="rank">
                    <li>
                        <div class="label">
                            <span class="name">Update Chargers</span>
                            <el-button type="primary" class="actionFunction" @click="runAction( 'run')">Run</el-button>
                        </div>
                    </li>
                    <li>
                        <div class="label">
                            <span class="name">Get Diagnostics</span>
                            <el-button type="primary" class="actionFunction" @click="runAction( 'start')">Start</el-button>
                        </div>
                    </li>
                    <li>
                        <div class="label">
                            <span class="name">Add Charger Profile</span>
                            <el-button type="primary" class="actionFunction" @click="runAction( 'add')">Add</el-button>
                        </div>
                    </li>
                    <li>
                        <div class="label">
                            <span class="name">Clear Charger Profile</span>
                            <el-button type="primary" class="actionFunction" @click="runAction( 'clear')">Clear</el-button>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">Connectors</div>
                    <div class="title-value">3</div>

                </div>
                <ul class="rank">
                    <li>
                        <div class="connectors">
                            <el-tooltip :content="$t('general.available')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color1"></span>
                            </el-tooltip>
                            <span class="name">2 {{ $t('chargingStation.connector').toLowerCase() }}s {{ $t('general.available').toLowerCase() }}</span>
                        </div>
                    </li>
                    <li>
                        <div class="connectors">
                            <el-tooltip :content="$t('general.inUse')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color8"></span>
                            </el-tooltip>
                            <span class="name">0 {{ $t('chargingStation.connector').toLowerCase() }}s {{ $t('general.inUse').toLowerCase() }}</span>
                        </div>
                    </li>
                    <li>
                        <div class="connectors">
                            <el-tooltip :content="$t('general.unavailable')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color4"></span>
                            </el-tooltip>
                            <span class="name">0 {{ $t('chargingStation.connector').toLowerCase() }}s {{ $t('general.unavailable').toLowerCase() }}</span>
                        </div>
                    </li>
                    <li>
                        <div class="connectors">
                            <el-tooltip content="offline" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color10"></span>
                            </el-tooltip>
                            <span class="name">1 {{ $t('chargingStation.connector').toLowerCase() }}s offline</span>
                        </div>
                    </li>
                </ul>
            </div>

            <div class="card-8 table-result">
                <div class="header">Chargers</div>
                <el-table :data="tableData" v-loading="isLoading" class="moreCol">
                    <el-table-column label="Charger Id" :min-width="3">
                        <template slot-scope="scope">
                            <el-link type="primary" underline @click="()=>handleLinkClick(scope.row)">#{{ scope.row.id }}</el-link>
                        </template>
                    </el-table-column>

                    <el-table-column prop="name" :label="$t('general.name')" :min-width="3"></el-table-column>
                    <el-table-column label="Power Consumption" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.powerKw + "kW" }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connection') +' '+ $t('general.status')" :min-width="2">
                        <template slot-scope="scope">
                            <el-tooltip v-if="scope.row.connectionStatus===`Connected`" :content="$t('general.connected')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color1"></span>
                            </el-tooltip>
                            <el-tooltip v-else :content="$t('general.disconnected')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color5"></span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column label="Connectors" :min-width="2">
                        <template slot-scope="scope">
                            <Connector :dataObj="scope.row.connectors" :chargerStatus="scope.row.connectionStatus" :isBreak="true"></Connector>
                        </template>
                    </el-table-column>
                    <el-table-column label="Last Heartbeat" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.lastHeartbeat!==null? getLocTime(scope.row.lastHeartbeat):'' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="currentType" :label="$t('general.type')" :min-width="2"></el-table-column>

                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="146">
                        <template slot-scope="scope">
                            <el-dropdown trigger="click">
                                <el-button class="action_chargers_stations">
                                    {{ $t('general.action') }}<i class="el-icon-arrow-down el-icon--right"></i>
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
            </div>
            <EditChargeBox name="chargeBox" :show="dialog.isVisible" :dialog="dialog" @close="(e)=>closeDialog(e,'edit')"></EditChargeBox>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="closeShowPosDialog"></ShowPostion>
        </div>
    </div>
</template>

<script>
import {
    $HTTP_getStationInfo,
    $HTTP_getAllChargeBoxList,
    $HTTP_deleteChargeBox
} from "@/api/api";
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import ShowPostion from "@/components/chargingStation/showPostion";
import EditChargeBox from "@/components/chargingStation/editChargeBox";
import Connector from "@/components/chargingStation/connector";

export default {
    components: {
        ShowPostion,
        EditChargeBox,
        Connector
    },
    data() {
        return {
            curRouteParam: {
                stationId: "",
                stationName: ""
            },
            permissionEditAble: this.$store.state.permissionEditable,
            isLoading: false,
            stationInfo: {
                zipCode: "",
                address: "",
                loc: {
                    lng: "",
                    lon: "",
                    lat: ""
                },
                serviceStartTime: "",
                serviceEndTime: "",
                countryCode: "",
                phone: ""
            },
            mapDialog: {
                visible: false,
                itemId: "",
                position: {
                    lat: "",
                    lng: ""
                }
            },
            smartSettingDialog: {
                visible: false,
                info: {
                    onOffStatus: false,
                    maxDemandPowerLimit: 0,
                    intervalMaxPower: 0,
                    intervalTime: 5
                },
                intervalTimeList: [5, 10, 15, 20, 30, 60]
            },
            tableData: [],
            total: 0,
            page: 1,
            dialog: {
                type: 1, //always 1 for edit
                info: {
                    chargeBoxId: "",
                    loc: {
                        lng: "",
                        lon: "",
                        lat: ""
                    },
                    chargeType: "AC",
                    installationDate: "",
                    chargeBoxName: "",
                    id: "",
                    power: 0
                },
                isVisible: false
            }
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.stationId) {
            let temp = window.sessionStorage.getItem("fiics-stationInfo")
                ? JSON.parse(window.sessionStorage.getItem("fiics-stationInfo"))
                : null;
            if (!(temp && temp.stationId && temp.stationName)) {
                this.$router.go(-1);
            } else {
                this.curRouteParam = Object.assign({}, temp);
            }
        }
    },
    mounted() {
        setScrollBar(".scroll", this);
        this.fetchStationDetail();
        let params = {};
        if (this.curRouteParam.stationId) {
            params.stationId = this.curRouteParam.stationId;
        }
        this.getChargersList(params);
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-stationInfo");
    },
    methods: {
        closeDialog(e, dialog) {
            console.log(e, dialog);
            this.dialog.isVisible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        runAction(data, action) {
            if (action === "edit") {
                this.openDialog(data);
            } else if (action === "delete") {
                this.deleteChargers(data.id);
            }
        },
        getChargersList(params) {
            $HTTP_getAllChargeBoxList(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        this.$message({
                            type: "warning",
                            message: i18n.t("emptyMessage")
                        });
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        fetchStationDetail() {
            const that = this;
            let param = {
                stationId: that.curRouteParam.stationId
            };
            this.isLoading = true;
            $HTTP_getStationInfo(param)
                .then((data) => {
                    this.isLoading = false;
                    if (data?.id >= 0) {
                        this.stationInfo = {
                            stationId: data.id,
                            stationName: data.name,
                            zipCode: data.address.zipCode,
                            address: data.address.street,
                            loc: {
                                lng: data.coordinates.longitude,
                                lon: data.coordinates.longitude,
                                lat: data.coordinates.latitude
                            },
                            serviceStartTime: "5am",
                            serviceEndTime: "5pm",
                            phone: "None"
                        };
                    } else {
                        this.$message({
                            type: "warning",
                            message:
                                that.lang === "en" ? data.message : data.reason
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        handleShowDialog() {
            this.mapDialog.itemId = this.stationId;
            this.mapDialog.position = this.stationInfo.loc;
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeShowPosDialog() {
            this.mapDialog.visible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        goChargePointDetail(chargeBoxId) {
            const params = {
                chargeBoxId: chargeBoxId
            };
            this.$router.push({ name: "chargePointDetail", params: params });
        },
        handleLinkClick(row) {
            if (row) {
                const data = Object.assign({}, row);
                window.sessionStorage.setItem(
                    "fiics-chargePointInfo",
                    JSON.stringify(data)
                );
                this.$router
                    .push({ name: "chargePointDetail", params: data })
                    .catch();
            }
        },
        openDialog(data) {
            this.dialog.info = {
                chargeBoxId: data.id,
                loc: {
                    lng: data.coordinates.longitude,
                    lon: data.coordinates.longitude,
                    lat: data.coordinates.latitude
                },
                chargeType: data.currentType,
                installationDate: data.installed,
                chargeBoxName: data.name,
                id: data.id,
                power: data.powerKw
            };
            this.dialog.isVisible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        deleteChargers(id) {
            const that = this;
            this.$confirm(
                i18n.t("general.deleteItem", { item: id }),
                i18n.t("general.hint"),
                {
                    showClose: false,
                    customClass: `custom ${
                        this.isDark ? "dark-theme" : "light-theme"
                    }`
                }
            ).then(() => {
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
                            that.fetchData();
                        } else {
                            this.$message({
                                type: "warning",
                                message: i18n.t("error_network")
                            });
                        }
                    })
                    .catch((err) => {
                        if (err.status === 500) {
                            that.$message({
                                type: "warning",
                                message: i18n.t("cannotDelete")
                            });
                        }
                    });
            });
        }
    }
};
</script>
<style lang = "scss" scoped>
.card-8 {
    .header {
        color: #151e25;
        font-size: 1.25rem;
        display: flex;
        .title-value {
            margin-left: 200px;
            color: #0056ff;
        }
    }
    .chargePoint {
        margin-top: 16px;
        .title {
            font-size: 1.125rem;
            color: #151e25;
            cursor: pointer;
        }
        .connector-obj.detail {
            display: inline-block;
            width: calc(50% - 6px);
            box-sizing: border-box;
            + .connector-obj.detail:not(.even) {
                margin-left: 0;
            }
        }
    }
}

.action_chargers_stations {
    background-color: transparent;
    border-color: #409eff;
    border-width: 2px;
    color: #409eff;
    font-weight: 600;
}

.rank-area {
    width: calc(33.05% - 32px);
    margin-right: 12px;
    height: 255px;
    position: relative;
    vertical-align: top;
    padding-bottom: 48px;
    &:nth-child(4n + 1) {
        margin-right: 0px;
    }
    ul.rank {
        margin-top: 24px;
        padding-left: 0;
        margin: 28px 0 0 0;
        li {
            height: 26px;
            list-style: none;
            margin-bottom: 28px;
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
                .num {
                    display: inline-block;
                    float: right;
                    color: #525e69;
                }
                .actionFunction {
                    min-width: 65px;
                }
            }
            .connectors {
                display: flex;
                text-align: center;
                span {
                    margin-right: 2px;
                }
            }
        }
    }
}

@media (min-width: 1251px) {
    .s-contain .item {
        width: calc(16.667% - 5px);
    }
}

@media (max-width: 1680px) {
    .rank-area {
        width: calc(33.05% - 36px);
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
</style>
