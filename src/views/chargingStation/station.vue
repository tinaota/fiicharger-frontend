<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.station') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <el-tabs :value="$store.state.nowSelectTab" @tab-click="e => $store.commit(SELECT_NOW_TAB, { path: e.name, router: $router, changePath: true})">
                    <el-tab-pane :label="$t(`menu.${tab}`)" :name="tab" v-for="tab in $store.state.tabsArr" :key="tab"></el-tab-pane>
                </el-tabs>
                <div class="filter">
                    <el-select class="select-small" v-model="filter.zipCode" :placeholder="$t('general.location')" v-loading="locationList.isLoading" @change="fetchData('location')" filterable clearable>
                        <el-option v-for="item in locationList.data" :label="item" :key="item" :value="item"></el-option>
                    </el-select>
                    <el-input :placeholder="$t('chargingStation.stationName')" v-model="filter.stationName" @change="fetchData('s')" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-select class="select-small" v-model="filter.status" :placeholder="$t('general.status')" v-loading="locationList.isLoading" @change="fetchData('status')" filterable clearable>
                        <el-option v-for="item in statusList.data" :label="$t(`general.${item.toLowerCase()}`)" :key="item" :value="item"></el-option>
                    </el-select>
                    <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol" v-loading="isLoading">
                    <el-table-column :label="$t('chargingStation.stationID')" :min-width="2">
                        <template slot-scope="scope">
                            <el-link type="primary" underline @click="()=>handleRowClick(scope.row)">#{{ scope.row.id }}</el-link>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" :label="$t('chargingStation.stationName')" :min-width="3"></el-table-column>
                    <el-table-column prop="address.zipCode" :label="$t('general.zipCode')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('general.address')" :min-width="5">
                        <template slot-scope="scope">
                            <div class="address">{{ scope.row.address.street +', '+ scope.row.address.city +', '+ scope.row.address.state }}</div>
                            <div class="position">
                                <el-tooltip :content="scope.row.coordinates.longitude+','+scope.row.coordinates.latitude" placement="bottom" effect="light" popper-class="custom">
                                    <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                                </el-tooltip>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.nChargers')" label-class-name="center">
                        <el-table-column prop="acCount" label="AC" :width="68" label-class-name="center" class-name="center">
                        </el-table-column>
                        <el-table-column prop="dcCount" label="DC" :width="68" label-class-name="center" class-name="center">
                        </el-table-column>
                    </el-table-column>
                    <el-table-column prop="modified" :label="$t('general.latestModification')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('general.status')" :min-width="3">
                        <template slot-scope="scope">
                            <el-radio v-for="(item, idx) in statusList.data" v-model="scope.row.status" :label="item" :key="idx" @change="updateStatusStation(scope.row)">{{ $t(`general.${item.toLowerCase()}`) }}</el-radio>
                        </template>
                    </el-table-column>
                    <!-- <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="146">
                        <template slot-scope="scope">
                            <el-button class="no-bg bind" @click="openBindDialog(scope.row)"></el-button>
                            <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="deleteStation(scope.row.id, scope.row.name)"></el-button>
                        </template>
                    </el-table-column> -->
                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="146">
                        <template slot-scope="scope">
                            <el-dropdown trigger="click">
                                <el-button class="action_chargers_stations">
                                    {{ $t('general.action') }}<i class="el-icon-arrow-down el-icon--right"></i>
                                </el-button>
                                <el-dropdown-menu slot="dropdown" :class="isDark ? 'dark-theme actions':'actions'">
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.chargingProfile') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'add')">{{ $t('general.add') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.chargingProfile') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'clear')">{{ $t('general.clear') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.diagnostics') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'start')">{{ $t('general.start') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.updates') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'run')">{{ $t('general.run') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.bindCharger') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'bind')">{{ $t('general.bind') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.modifyStation') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'edit')">{{ $t('general.modify') }}</el-button>
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <span>
                                            {{ $t('chargingStation.deleteStation') }}
                                        </span>
                                        <el-button type="primary" class="actionFunction" @click="runAction(scope.row, 'delete')">{{ $t('general.delete') }}</el-button>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total}) }}</div>
                <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
                </el-pagination>
            </div>
            <el-dialog :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')" width="80%" :visible.sync="dialog.visible" custom-class="map" :show-close="false" v-loading="dialog.isLoading" @close="closeDialog(true)">
                <div id="map-container" class="google-map"></div>
                <div class="right-form formVertical">
                    <el-form ref="stationForm" :rules="rules" :model="dialog.info" style="width:98%">
                        <div class="form-item" v-if="dialog.type">
                            <div class="label">{{ $t('chargingStation.stationID') }}</div>
                            <el-input v-model="dialog.info.stationId" disabled></el-input>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="stationName">
                                <div class="label">{{ $t('chargingStation.stationName') }}</div>
                                <el-input v-model="dialog.info.stationName"></el-input>
                            </el-form-item>
                        </div>
                        <div class="form-item">
                            <div class="label">{{ $t('general.address') }}</div>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="address.street">
                                <div class="label">{{ $t('general.street') }}</div>
                                <el-input v-model="dialog.info.address.street"></el-input>
                            </el-form-item>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="address.city">
                                <div class="label">{{ $t('general.city') }}</div>
                                <el-input v-model="dialog.info.address.city"></el-input>
                            </el-form-item>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="address.state">
                                <div class="label">{{ $t('general.state') }}</div>
                                <el-input v-model="dialog.info.address.state"></el-input>
                            </el-form-item>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="address.country">
                                <div class="label">{{ $t('general.country') }}</div>
                                <el-input v-model="dialog.info.address.country"></el-input>
                            </el-form-item>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="address.zipCode">
                                <div class="label">{{ $t('general.zipCode') }}</div>
                                <el-input v-model="dialog.info.address.zipCode" type="number"></el-input>
                            </el-form-item>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="loc.lon">
                                <div class="label">{{ $t('general.lng') }}</div>
                                <el-input v-model="dialog.info.loc.lon" disabled></el-input>
                            </el-form-item>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="loc.lat">
                                <div class="label">{{ $t('general.lat') }}</div>
                                <el-input v-model="dialog.info.loc.lat" disabled></el-input>
                            </el-form-item>
                        </div>
                        <div class="hint" v-if="dialog.mapInfo.marker === null">{{ $t('general.clickAddMarker') }}</div>
                        <div class="hint" v-else>{{ $t('general.dragMarker') }}</div>
                        <div class="form-item">
                            <div class="label">{{ $t('general.businessHours') }}</div>
                            <div class="timeRange">
                                <el-time-picker :placeholder="$t('general.startTime')" v-model="dialog.info.serviceStartTime" format="HH:mm" value-format="HH:mm" :picker-options="{
                                    selectableRange:`00:00:00-${dialog.info.serviceEndTime ? dialog.info.serviceEndTime+':00' : '23:59:00'}`
                                }">
                                </el-time-picker>
                                <span> ~ </span>
                                <el-time-picker :placeholder="$t('general.endTime')" v-model="dialog.info.serviceEndTime" format="HH:mm" value-format="HH:mm" :picker-options="{
                                    selectableRange:`${dialog.info.serviceStartTime ? dialog.info.serviceStartTime+':00' : '00:00:00'}-23:59:00`
                                }">
                                </el-time-picker>
                            </div>
                        </div>
                        <div class="form-item">
                            <el-form-item prop="phone">
                                <div class="label">{{ $t('general.telephone') }}</div>
                                <el-input v-model="dialog.info.phone" type="number"></el-input>
                            </el-form-item>
                        </div>
                    </el-form>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="updateStation">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog>
            <el-dialog :title="$t('general.bind')" width="400px" :visible.sync="bindDialog.visible" :show-close="false" v-loading="bindDialog.isLoading" @close="closeDialog(false)">
                <div class="vertial formVertical">
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.stationID') }}</div>
                        <el-input v-model="bindDialog.info.stationId" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.stationName') }}</div>
                        <el-input v-model="bindDialog.info.stationName" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                        <el-checkbox-group v-model="bindDialog.info.selectedChargeBoxNameArr" @change="handleBindChargePointChange">
                            <el-checkbox v-for="(item, idx) in bindDialog.chargeBoxNameArr" :label="item" :key="idx">{{ item }}</el-checkbox>
                        </el-checkbox-group>
                        <div class="err" v-if="!bindDialog.chargeBoxNameArr.length && !bindDialog.isLoading">{{ $t('chargingStation.noChargePointBind') }}</div>
                    </div>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="bindDialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="updateBindStation" :disabled="!bindDialog.chargeBoxNameArr.length">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="closeShowPosDialog"></ShowPostion>
        </div>
    </div>
</template>

<script>
import { $GLOBAL_CURRENCY, $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import {
    $HTTP_getZipCodeListForSelect,
    $HTTP_getStationList,
    $HTTP_addStation,
    $HTTP_updateStation,
    $HTTP_deleteStation,
    $HTTP_getChargeBoxListById,
    $HTTP_getStatusListChargeStations,
    $HTTP_addBoundingToStation,
    $HTTP_getIndividualStationData,
    $HTTP_getAllChargeBoxList,
    $HTTP_removeBoundingToStation,
    $HTTP_updateStatusStation
} from "@/api/api";
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import ic_green_dot from "imgs/ic_green_dot.png";
import googleMapStyle from "@/assets/js/googleMapStyle_normal";
import ShowPostion from "@/components/chargingStation/showPostion";
import { SELECT_NOW_TAB } from "@/store/types";
import { validateIsEmpty } from "@/utils/validation";
export default {
    components: {
        ShowPostion
    },
    data() {
        return {
            SELECT_NOW_TAB,
            isDark: this.$store.state.darkTheme,
            limit: $GLOBAL_PAGE_LIMIT,
            permissionEditAble: this.$store.state.permissionEditable,
            locationList: {
                isLoading: false,
                data: []
            },
            statusList: {
                isLoading: false,
                data: []
            },
            filter: {
                stationName: "",
                // operatorTypeId: "",
                zipCode: "",
                status: ""
            },
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            countryCode: {
                isLoading: false,
                data: []
            },
            currencyList: $GLOBAL_CURRENCY,
            dialog: {
                visible: false,
                isLoading: false,
                type: 0,
                info: {
                    stationId: "",
                    stationName: "",
                    countryCode: "",
                    status: "",
                    acCount: null,
                    dcCount: null,
                    phone: "",
                    address: {
                        street: "",
                        city: "",
                        country: "",
                        state: "",
                        zipCode: ""
                    },
                    serviceStartTime: "",
                    serviceEndTime: "",
                    // unitType: '',
                    // parkingRate: 0
                    loc: {
                        lng: "",
                        lon: "",
                        lat: ""
                    }
                },
                map: null,
                mapInfo: {
                    initMap: true,
                    zoom: 17,
                    maxZoom: 20,
                    marker: null,
                    initCenter: {
                        lat: 42.677811124442854,
                        lng: -87.91695010215827
                    },
                    icon: ic_green_dot
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
            bindDialog: {
                visible: false,
                isLoading: false,
                oriChargePointList: {},
                chargeBoxNameArr: [],
                info: {
                    stationId: "",
                    stationName: "",
                    zipCode: "",
                    selectedChargeBoxNameArr: [],
                    originalSelectedChargeBoxNameArr: []
                }
            },
            rules: {
                stationName: [{ validator: validateIsEmpty }],
                "address.street": [{ validator: validateIsEmpty }],
                "address.city": [{ validator: validateIsEmpty }],
                "address.state": [{ validator: validateIsEmpty }],
                "address.country": [{ validator: validateIsEmpty }],
                "address.zipCode": [{ validator: validateIsEmpty }],
                "loc.lng": [{ validator: validateIsEmpty }],
                "loc.lat": [{ validator: validateIsEmpty }],
                serviceStartTime: [{ validator: validateIsEmpty }],
                serviceEndTime: [{ validator: validateIsEmpty }],
                phone: [{ validator: validateIsEmpty }]
            }
        };
    },
    mounted() {
        setScrollBar(".scroll", this);
        this.fetchLocationList();
        this.fetchStatusList();
        this.fetchData();
    },
    beforeDestroy() {
        this.dialog.map &&
            google.maps.event.clearListeners(this.dialog.map, "click");
    },
    methods: {
        runAction(data, action) {
            console.log(data, action);
            if (action === "bind") {
                this.openBindDialog(data);
            } else if (action === "edit") {
                this.openDialog(1, data);
            } else if (action === "delete") {
                this.deleteStation(data.id, data.name);
            }
        },
        fetchLocationList() {
            this.locationList.isLoading = true;
            $HTTP_getZipCodeListForSelect()
                .then((data) => {
                    this.locationList.isLoading = false;
                    if (data?.length > 0) {
                        this.locationList.data = data;
                    }
                })
                .catch((err) => {
                    console.log("locationList", err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        fetchStatusList() {
            this.statusList.isLoading = true;
            $HTTP_getStatusListChargeStations()
                .then((data) => {
                    this.statusList.isLoading = false;
                    if (data?.length > 0) {
                        this.statusList.data = data;
                    }
                })
                .catch((err) => {
                    console.log("locationList", err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        fetchData(type) {
            this.isLoading = true;
            let param = {
                page: this.page,
                limit: this.limit
            };

            if (this.filter.zipCode) {
                param.zipCode = this.filter.zipCode;
            }

            if (this.filter.status) {
                param.status = this.filter.status;
            }
            if (this.filter.stationName) {
                param.name = this.filter.stationName;
            }

            // set page to 1 if the items in dropdown changes
            if (type === "location" || type === "status" || type === "s") {
                this.page = 1;
                param["page"] = 1;
            }
            $HTTP_getStationList(param)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.total = res.metadata.totalRows;
                        this.tableData = res.data.map((item) => {
                            item["modified"] = transformUtcToLocTime(
                                item.modified
                            );
                            return item;
                        });
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        if (
                            this.filter.stationName ||
                            this.filter.zipCode ||
                            this.filter.status
                        ) {
                            this.$message({
                                type: "warning",
                                message: i18n.t("emptyMessage")
                            });
                        }
                    }
                })
                .catch(() => {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        fetchChargeBoxListForBinding() {
            const that = this,
                params = {
                    zipCode: this.bindDialog.info.zipCode,
                    stationId: this.bindDialog.info.stationId
                };
            this.bindDialog.oriChargePointList = {};
            this.bindDialog.chargeBoxNameArr = [];
            this.bindDialog.info.selectedChargeBoxNameArr = [];
            this.bindDialog.info.originalSelectedChargeBoxNameArr = [];
            this.bindDialog.isLoading = true;

            $HTTP_getAllChargeBoxList()
                .then((res) => {
                    let allChargeBoxes = res?.data;
                    if (allChargeBoxes?.length > 0) {
                        allChargeBoxes.forEach((item) => {
                            that.bindDialog.oriChargePointList[item.name] =
                                item.id;
                            that.bindDialog.chargeBoxNameArr.push(item.name);
                        });
                    }
                    $HTTP_getChargeBoxListById(params).then((res) => {
                        let allBindedBoxes = res;
                        // push only if it is binded
                        allBindedBoxes.map((bindedBox) => {
                            that.bindDialog.info.selectedChargeBoxNameArr.push(
                                bindedBox.name
                            );
                            that.bindDialog.info.originalSelectedChargeBoxNameArr.push(
                                bindedBox.name
                            );
                        });
                        that.bindDialog.isLoading = false;
                    });
                })
                .catch(() => {
                    that.bindDialog.isLoading = false;
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        handleRowClick(row) {
            if (row) {
                const stationData = {
                    stationId: row.id,
                    stationName: row.name
                };
                window.sessionStorage.setItem(
                    "fiics-stationInfo",
                    JSON.stringify(stationData)
                );
                this.$router
                    .push({ name: "stationDetail", params: stationData })
                    .catch();
            }
        },
        openDialog(type, data) {
            this.dialog.type = type;
            if (type === 1) {
                let stationId = data.id;

                $HTTP_getIndividualStationData(stationId)
                    .then((res) => {
                        let serviceStartTime =
                            this.computeTime(res.openHour) +
                            ":" +
                            this.computeTime(res.openMinute);
                        let serviceEndTime =
                            this.computeTime(res.closeHour) +
                            ":" +
                            this.computeTime(res.closeMinute);

                        this.dialog.info = {
                            stationId: res.id,
                            stationName: res.name,
                            address: {
                                street: res.address.street,
                                city: res.address.city,
                                country: res.address.country,
                                state: res.address.state,
                                zipCode: res.address.zipCode
                            },

                            loc: {
                                lat: res.coordinates.latitude,
                                lon: res.coordinates.longitude,
                                lng: res.coordinates.longitude
                            },
                            phone: res.phoneNumber,
                            serviceStartTime: serviceStartTime,
                            serviceEndTime: serviceEndTime
                        };

                        this.drawMap();
                    })

                    .catch(() => {
                        this.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                    });
            } else {
                this.drawMap();
            }
        },
        initMap() {
            const that = this;
            this.dialog.map = new google.maps.Map(
                document.getElementById("map-container"),
                {
                    center: this.dialog.mapInfo.initCenter,
                    zoom: this.dialog.mapInfo.zoom,
                    maxZoom: this.dialog.mapInfo.maxZoom,
                    streetViewControl: false, //設定是否呈現右下角街景小人
                    mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                    fullscreenControl: false,
                    zoomControl: false,
                    styles: googleMapStyle
                }
            );
            google.maps.event.addListener(
                this.dialog.map,
                "click",
                function (event) {
                    if (!that.dialog.type) {
                        that.removeMarker();
                        that.dialog.info.loc = event.latLng.toJSON();
                        that.dialog.info.loc.lon = that.dialog.info.loc.lng;
                        that.drawMarker();
                    }
                }
            );
        },
        drawMarker() {
            const that = this;
            var markerImage = new google.maps.MarkerImage(
                this.dialog.mapInfo.icon,
                new google.maps.Size(36, 55)
            ); //size  預設位子圖案中間底
            // new google.maps.Point(0, 0), //origin point
            // new google.maps.Point(18, 55)); // offset point
            let marker = new google.maps.Marker({
                map: this.dialog.map,
                position: this.dialog.info.loc,
                icon: markerImage,
                draggable: true
            });
            this.dialog.mapInfo.marker = marker;
            google.maps.event.addListener(
                this.dialog.mapInfo.marker,
                "dragend",
                function (event) {
                    that.dialog.info.loc = event.latLng.toJSON();
                    that.dialog.info.loc.lon = that.dialog.info.loc.lng;
                }
            );
        },
        removeMarker() {
            if (this.dialog.mapInfo.marker) {
                google.maps.event.clearListeners(
                    this.dialog.mapInfo.marker,
                    "dragend"
                );
                this.dialog.mapInfo.marker.setMap();
                this.dialog.mapInfo.marker = null;
            }
        },
        openBindDialog(data) {
            const that = this;
            this.bindDialog.info = {
                stationId: data.id,
                stationName: data.name,
                zipCode: data.address.zipCode,
                selectedChargeBoxNameArr: [],
                originalSelectedChargeBoxNameArr: []
            };
            this.fetchChargeBoxListForBinding();
            this.bindDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            this.$nextTick(() => {
                setScrollBar(".vertial.formVertical", that);
            });
        },
        handleBindChargePointChange() {},
        updateBindStation() {
            const that = this;

            let config = {
                headers: {
                    "Content-Type": "application/json"
                }
            };
            let newBindedArray =
                that.bindDialog.info.selectedChargeBoxNameArr.filter(
                    (item) =>
                        that.bindDialog.info.originalSelectedChargeBoxNameArr.indexOf(
                            item
                        ) === -1
                );
            if (newBindedArray.length > 0) {
                newBindedArray.map((item) => {
                    let params = {
                        chargePointId:
                            this.bindDialog.oriChargePointList[`${item}`],
                        config: config,
                        stationId: that.bindDialog.info.stationId
                    };
                    $HTTP_addBoundingToStation(params).then((res) => {
                        if (res) {
                            that.$message({
                                type: "success",
                                message: i18n.t("general.sucUpdateMsg")
                            });
                            that.fetchData();
                        } else {
                            that.$message({
                                type: "warning",
                                message: i18n.t("error_network")
                            });
                        }
                    });
                });
            }

            let unbindedArray =
                that.bindDialog.info.originalSelectedChargeBoxNameArr.filter(
                    (item) =>
                        that.bindDialog.info.selectedChargeBoxNameArr.indexOf(
                            item
                        ) === -1
                );
            if (unbindedArray.length > 0) {
                unbindedArray.map((item) => {
                    let params = {
                        chargePointId:
                            this.bindDialog.oriChargePointList[`${item}`]
                    };
                    $HTTP_removeBoundingToStation(params).then((res) => {
                        if (res) {
                            that.$message({
                                type: "success",
                                message: i18n.t("general.sucUpdateMsg")
                            });
                            that.fetchData();
                        } else {
                            that.$message({
                                type: "warning",
                                message: i18n.t("error_network")
                            });
                        }
                    });
                });
            }
            that.bindDialog.visible = false;
        },
        deleteStation(id, name) {
            const that = this;
            this.$confirm(
                i18n.t("general.deleteItem", { item: name }),
                i18n.t("general.hint"),
                {
                    showClose: false,
                    customClass: `custom ${
                        this.isDark ? "dark-theme" : "light-theme"
                    }`
                }
            ).then(() => {
                $HTTP_deleteStation({ stationId: id }).then((data) => {
                    if (data.status === 204) {
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
                        that.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                    }
                });
            });
        },
        updateStation() {
            this.$refs.stationForm.validate((valid) => {
                if (valid) {
                    const that = this;

                    let startTime =
                        that.dialog.info.serviceStartTime.split(":");
                    let endTime = that.dialog.info.serviceEndTime.split(":");
                    let $API,
                        params = {
                            coordinates: {
                                latitude: that.dialog.info.loc.lat,
                                longitude: that.dialog.info.loc.lon
                            },
                            name: that.dialog.info.stationName,
                            phoneNumber: that.dialog.info.phone,
                            address: that.dialog.info.address,
                            openHour: parseInt(startTime[0]),
                            openMinute: parseInt(startTime[1]),
                            closeHour: parseInt(endTime[0]),
                            closeMinute: parseInt(endTime[0])
                        },
                        sucMsg = "";

                    if (!that.dialog.type) {
                        $API = $HTTP_addStation;
                        sucMsg = i18n.t("general.sucAddMsg");
                    } else {
                        $API = $HTTP_updateStation;
                        params.stationId = that.dialog.info.stationId;
                        sucMsg = i18n.t("general.sucUpdateMsg");
                    }

                    that.dialog.isLoading = true;
                    $API(params)
                        .then((data) => {
                            that.dialog.isLoading = false;
                            if (data.id >= 0) {
                                that.$message({
                                    type: "success",
                                    message: sucMsg
                                });
                                that.dialog.visible = false;
                                that.fetchData();
                            } else {
                                that.$message({
                                    type: "warning",
                                    message: i18n.t("error_network")
                                });
                            }
                        })
                        .catch(() => {
                            that.$message({
                                type: "warning",
                                message: i18n.t("error_network")
                            });
                        });
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog(isEdit) {
            if (isEdit) {
                this.$jQuery(".right-form.formVertical").length > 0 &&
                    this.$jQuery(".right-form.formVertical").mCustomScrollbar(
                        "destroy"
                    );
            } else {
                this.$jQuery(".vertial.formVertical").length > 0 &&
                    this.$jQuery(".vertial.formVertical").mCustomScrollbar(
                        "destroy"
                    );
            }
            this.$jQuery(".scroll").mCustomScrollbar("update");
            this.dialog.info = {
                stationId: "",
                stationName: "",
                address: {
                    street: "",
                    city: "",
                    country: "",
                    state: "",
                    zipCode: ""
                },
                loc: {
                    lat: "",
                    lon: "",
                    lng: ""
                },
                phone: "",
                serviceStartTime: "",
                serviceEndTime: ""
            };

            this.$nextTick(() => {
                this.$refs?.stationForm?.clearValidate("stationName");
                this.$refs?.stationForm?.clearValidate("phone");
                this.$refs?.stationForm?.clearValidate("address.street");
                this.$refs?.stationForm?.clearValidate("address.city");
                this.$refs?.stationForm?.clearValidate("address.country");
                this.$refs?.stationForm?.clearValidate("address.state");
                this.$refs?.stationForm?.clearValidate("address.zipCode");
                this.$refs?.stationForm?.clearValidate("loc.lat");
                this.$refs?.stationForm?.clearValidate("loc.lon");
            });
        },
        handleShowDialog(data) {
            this.mapDialog.itemId = data.stationId;
            this.mapDialog.position = {
                lat: data.coordinates.latitude,
                lng: data.coordinates.longitude
            };
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeShowPosDialog() {
            this.mapDialog.visible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        computeTime(time) {
            if (time < 10) {
                return "0" + time;
            } else {
                return `${time}`;
            }
        },
        drawMap() {
            const that = this;
            this.dialog.visible = true;

            this.$jQuery(".scroll").mCustomScrollbar("disable");

            that.$nextTick(() => {
                setScrollBar(".right-form.formVertical", that);
                if (that.dialog.mapInfo.initMap) {
                    that.dialog.mapInfo.initMap = false;
                    that.initMap();
                }
                that.removeMarker();
                if (this.dialog.type) {
                    that.drawMarker();
                    that.dialog.map.setCenter(that.dialog.info.loc);
                } else if (that.dialog.info.loc.lat) {
                    that.drawMarker();
                    that.dialog.map.setCenter(that.dialog.info.loc);
                } else if (!this.dialog.info.loc || !this.dialog.info.loc.lat) {
                    that.dialog.map.setCenter(that.dialog.mapInfo.initCenter);
                }
            });
        },
        updateStatusStation(data) {
            const that = this;
            let config = {
                headers: {
                    "Content-Type": "application/json"
                }
            };

            let params = {
                stationId: data.id,
                config: config,
                status: data.status
            };

            $HTTP_updateStatusStation(params).then((res) => {
                if (res) {
                    that.$message({
                        type: "success",
                        message: i18n.t("general.sucUpdateMsg")
                    });
                } else {
                    that.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                }
                that.fetchData();
            });
        }
    }
};
</script>
<style lang = "scss" scoped>
.card-8 {
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
}

.el-dialog.map .el-dialog__body {
    height: 50vh;
    .google-map {
        width: 65%;
        height: calc(65vh - 75px);
        display: inline-block;
        float: left;
    }
    .right-form {
        width: calc(35% - 30px);
        height: calc(65vh - 75px);
        margin-left: 30px;
        display: inline-block;
        &.formVertical .form-item .el-date-editor {
            width: calc(50% - 9px);
            display: inline-block;
        }
    }
}
ul {
    min-width: 200px;
    min-height: 200px;
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

.actions {
    padding: 10px 0px;
    margin: 0px;
}
.actionFunction {
    margin-left: 10px;
}
</style>
