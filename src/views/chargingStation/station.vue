<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.station') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small"
                        v-model="filter.operatorTypeId"
                        :placeholder="$t('general.operator')"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                    </el-select>
                    <el-select
                        class="select-small"
                        v-model="filter.zipCode"
                        :placeholder="$t('general.location')"
                        v-loading="loctionList.isLoading"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="item in loctionList.data" :label="item" :key="item" :value="item"></el-option>
                    </el-select>
                    <el-input
                        :placeholder="$t('chargingStation.stationName')"
                        v-model="filter.tmpSearch"
                        @change="fetchData('s')"
                        clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol enable-row-click"
                    v-loading="isLoading"
                    @row-click="handleRowClick">
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="2"></el-table-column>
                    <el-table-column prop="stationName" :label="$t('chargingStation.stationName')" :min-width="3"></el-table-column>
                    <el-table-column prop="zipCode" :label="$t('general.zipCode')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('general.address')" :min-width="5">
                        <template slot-scope="scope">
                            <div class="address">{{ scope.row.address }}</div>
                            <div class="position">
                                <el-tooltip :content="scope.row.loc.lon+','+scope.row.loc.lat" placement="bottom" effect="light" popper-class="custom">
                                    <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                                </el-tooltip>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.chargePoint#')" label-class-name="center">
                        <el-table-column prop="chargeBoxCountInfo.acCount" label="AC" :width="68" label-class-name="center" class-name="center">
                        </el-table-column>
                        <el-table-column prop="chargeBoxCountInfo.dcCount" label="DC" :width="68" label-class-name="center" class-name="center">
                        </el-table-column>
                    </el-table-column>
                    <el-table-column prop="eDate" :label="$t('general.latestModification')" :min-width="3"></el-table-column>
                    <!-- <el-table-column :label="$t('chargingStation.parkingRate')" :min-width="1">
                        <template slot-scope="scope">{{ scope.row.currency + scope.row.parkingRate + "/min" }}</template>
                    </el-table-column> -->
                    <!-- <el-table-column  :label="$t('general.location')" :width="80" class-name="center">
                        <template slot-scope="scope">
                            <el-tooltip :content="scope.row.loc.lon+','+scope.row.loc.lat" placement="bottom" effect="light" popper-class="custom">
                                <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column> -->
                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="146">
                        <template slot-scope="scope">
                            <el-button class="no-bg bind" @click="openBindDialog(scope.row)"></el-button>
                            <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="deleteStation(scope.row.stationId, scope.row.stationName)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total})}}</div>
                <el-pagination background layout="prev, pager, next"
                    :total="total"
                    :pager-count="5"
                    :page-size="10"
                    :current-page.sync="page"
                    @current-change="changePage">
                </el-pagination>
            </div>
            <el-dialog
                :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')"
                width="80%"
                :visible.sync="dialog.visible"
                custom-class="map"
                :show-close="false"
                v-loading="dialog.isLoading"
                @close="closeDialog(true)">
                <div id="map-container" class="google-map"></div>
                <div class="right-form formVertical">
                    <div class="form-item" v-if="dialog.type">
                        <div class="label">{{ $t('chargingStation.stationID') }}</div>
                        <el-input v-model="dialog.info.stationId" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.stationName') }}</div>
                        <el-input v-model="dialog.info.stationName"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.zipCode') }}</div>
                        <el-input v-model="dialog.info.zipCode"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.address') }}</div>
                        <el-input v-model="dialog.info.address"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.lng') }}</div>
                        <el-input v-model="dialog.info.loc.lon" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.lat') }}</div>
                        <el-input v-model="dialog.info.loc.lat" disabled></el-input>
                    </div>
                    <div class="hint" v-if="dialog.mapInfo.marker === null">{{$t('general.clickAddMarker')}}</div>
                    <div class="hint" v-else>{{$t('general.dragMarker')}}</div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.businessHours') }}</div>
                        <div class="timeRange">
                            <el-time-picker
                                :placeholder="$t('general.startTime')"
                                v-model="dialog.info.serviceStartTime"
                                format="HH:mm"
                                value-format="HH:mm"
                                :picker-options="{
                                    selectableRange:`00:00:00-${dialog.info.serviceEndTime ? dialog.info.serviceEndTime+':00' : '23:59:00'}`
                                }">
                            </el-time-picker>
                            <span> ~ </span>
                            <el-time-picker
                                :placeholder="$t('general.endTime')"
                                v-model="dialog.info.serviceEndTime"
                                format="HH:mm"
                                value-format="HH:mm"
                                :picker-options="{
                                    selectableRange:`${dialog.info.serviceStartTime ? dialog.info.serviceStartTime+':00' : '00:00:00'}-23:59:00`
                                }">
                            </el-time-picker>
                        </div>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('userAccount.countryCode') }}</div>
                        <el-select
                            class="select-small"
                            v-model="dialog.info.countryCode"
                            v-loading="countryCode.isLoading" >
                            <el-option v-for="(item, idx) in countryCode.data" :label="item.countryCode+' ('+item.countryName+')'" :key="idx" :value="item.countryCode"></el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.telephone') }}</div>
                        <el-input v-model="dialog.info.phone"></el-input>
                    </div>
                    <!-- <div class="form-item">
                        <div class="label">{{ $t('general.currency') }}</div>
                        <el-select
                            class="select-small"
                            v-model="dialog.info.unitType">
                            <el-option v-for="(item, key) in currencyList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                        <el-input-number v-model="dialog.info.parkingRate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                    </div> -->
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="updateStation">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog>
            <el-dialog
                :title="$t('general.bind')"
                width="400px"
                :visible.sync="bindDialog.visible"
                :show-close="false"
                v-loading="bindDialog.isLoading"
                @close="closeDialog(false)">
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
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="closeShowPosDialog" ></ShowPostion>
        </div>
    </div>
</template>

<script>
import { $GLOBAL_CURRENCY } from '@/utils/global';
import { $HTTP_getZipCodeListForSelect, $HTTP_getStationList, $HTTP_getCountryCodeSelectList, $HTTP_addStation, $HTTP_updateStation, $HTTP_deleteStation, $HTTP_getChargeBoxListForBinding, $HTTP_addStationChargeBoxMatch } from "@/api/api";
import { setScrollBar } from "@/utils/function";
import ic_green_dot from 'imgs/ic_green_dot.png';
import googleMapStyle from '@/assets/js/googleMapStyle_normal';
import ShowPostion from "@/components/chargingStation/showPostion";
export default {
    components: {
        ShowPostion
    },
    data() {
        return {
            operatorList: {},
            lang: '',
            accPermissionType: '',
            permissionEditAble: false,
            loctionList: {
                isLoading: false,
                data: []
            },
            filter: {
                tmpSearch: '',
                search: '',
                operatorTypeId: '',
                zipCode: '',
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
                    stationId: '',
                    stationName: '',
                    zipCode: '',
                    countryCode: '',
                    phone: '',
                    address: '',
                    serviceStartTime: '',
                    serviceEndTime: '',
                    // unitType: '',
                    // parkingRate: 0
                    loc: {
                        lng: '',
                        lon: '',
                        lat: ''
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
                itemId: '',
                position: {
                    lat: '',
                    lng: ''
                }
            },
            bindDialog: {
                visible: false,
                isLoading: false,
                oriChargePointList: {},
                chargeBoxNameArr: [],
                info: {
                    stationId: '',
                    stationName: '',
                    zipCode: '',
                    selectedChargeBoxNameArr: []
                }
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
        this.accPermissionType = userData.accountInfo.accPermissionType;
        if (this.accPermissionType === 3) {
            this.permissionEditAble = true;
        }
    },
    mounted() {
        setScrollBar('.scroll', this);
        this.fetchLocationList();
        this.fetchData();
        this.fetchCountryCodeList();
    },
    beforeDestroy() {
        this.dialog.map && google.maps.event.clearListeners(this.dialog.map, 'click');
    },
    methods: {
        fetchLocationList() {
            const that = this;
            this.loctionList.isLoading = true;
            $HTTP_getZipCodeListForSelect().then((data) => {
                this.loctionList.isLoading = false;
                if (!!data.success) {
                    this.loctionList.data = data.zipCodeList.slice();
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('loctionList', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            let param = {};
            if (this.filter.operatorTypeId && this.filter.operatorTypeId != '1') {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.zipCode) {
                param.zipCode = this.filter.zipCode;
            }
            if (type) {
                this.filter.search = this.filter.tmpSearch;
            }
            param.search = this.filter.search;
            $HTTP_getStationList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.stationList.map(item => {
                        item.loc.lng = item.loc.lon;
                        // item.connectorCountInfo.acUnavailable = item.connectorCountInfo.acTotal - item.connectorCountInfo.acAvailable;
                        // item.connectorCountInfo.dcUnavailable = item.connectorCountInfo.dcTotal - item.connectorCountInfo.dcAvailable;
                        // item.currency = $GLOBAL_CURRENCY[item.unitType];
                        return item;
                    });
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        },
        fetchCountryCodeList() {
            const that = this;
            this.countryCode.isLoading = true;
            $HTTP_getCountryCodeSelectList({lang: that.lang}).then((data) => {
                this.countryCode.isLoading = false;
                if (!!data.success) {
                    this.countryCode.data = data.countryCodeList.slice();
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('countryCode', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
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
            this.bindDialog.isLoading = true;
            $HTTP_getChargeBoxListForBinding(params).then((data) => {
                that.bindDialog.isLoading = false;
                if (!!data.success) {
                    data.chargeBoxList.forEach(item => {
                        that.bindDialog.oriChargePointList[item.chargeBoxName] = item.chargeBoxId;
                        that.bindDialog.chargeBoxNameArr.push(item.chargeBoxName);
                        if (item.bindingStatus === 1) {
                            that.bindDialog.info.selectedChargeBoxNameArr.push(item.chargeBoxName);
                        }
                    });
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch(err => {
                that.bindDialog.isLoading = false;
                console.log('binding', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        handleRowClick(row, column, event) {
            if ($(event.path[0]).attr('class')!==undefined && $(event.path[0]).attr('class').includes('cell')) {
                const stationData = {
                                        stationId: row.stationId,
                                        stationName: row.stationName
                                    };
                window.sessionStorage.setItem('fiics-stationInfo', JSON.stringify(stationData));
                this.$router.push({ name: "stationDetail", params: stationData }).catch();
            }
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            if (type) {
                this.dialog.info = Object.assign({}, data);
            }
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            that.$nextTick(() => {
                setScrollBar('.right-form.formVertical', that);
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
        initMap() {
            const that = this;
            this.dialog.map = new google.maps.Map(document.getElementById('map-container'), {
                            center: this.dialog.mapInfo.initCenter,
                            zoom: this.dialog.mapInfo.zoom,
                            maxZoom: this.dialog.mapInfo.maxZoom,
                            streetViewControl: false, //設定是否呈現右下角街景小人
                            mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                            fullscreenControl: false,
                            zoomControl: false,
                            styles: googleMapStyle
                        });
            google.maps.event.addListener(this.dialog.map, 'click', function(event) {
                if (!that.dialog.type) {
                    that.removeMarker();
                    that.dialog.info.loc = event.latLng.toJSON();
                    that.dialog.info.loc.lon = that.dialog.info.loc.lng;
                    that.drawMarker();
                }
            });
        },
        drawMarker() {
            const that = this;
            var markerImage = new google.maps.MarkerImage(this.dialog.mapInfo.icon,
                                new google.maps.Size(36, 55)); //size  預設位子圖案中間底
                                // new google.maps.Point(0, 0), //origin point
                                // new google.maps.Point(18, 55)); // offset point
            let marker = new google.maps.Marker({
                            map: this.dialog.map,
                            position: this.dialog.info.loc,
                            icon: markerImage,
                            draggable:true,
                        });
            this.dialog.mapInfo.marker = marker;
            google.maps.event.addListener(this.dialog.mapInfo.marker, 'dragend', function(event) {
                that.dialog.info.loc = event.latLng.toJSON();
                that.dialog.info.loc.lon = that.dialog.info.loc.lng;
            });
        },
        removeMarker() {
            if (this.dialog.mapInfo.marker) {
                google.maps.event.clearListeners(this.dialog.mapInfo.marker, 'dragend');
                this.dialog.mapInfo.marker.setMap();
                this.dialog.mapInfo.marker = null;
            }
        },
        openBindDialog(data) {
            const that = this;
            this.bindDialog.info = {
                                        stationId: data.stationId,
                                        stationName: data.stationName,
                                        zipCode: data.zipCode,
                                        selectedChargeBoxNameArr: []
                                    };
            this.fetchChargeBoxListForBinding();
            this.bindDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            this.$nextTick(() => {
                setScrollBar('.vertial.formVertical', that);
            });
        },
        handleBindChargePointChange(value) {
        },
        updateBindStation() {
            const that = this,
                  params = {
                                stationId: that.bindDialog.info.stationId,
                                chargeBoxIdArr: []
                            };
            that.bindDialog.info.selectedChargeBoxNameArr.forEach(name=> {
                params.chargeBoxIdArr.push(that.bindDialog.oriChargePointList[name]);
            })
            that.bindDialog.isLoading = true;
            $HTTP_addStationChargeBoxMatch(params).then(data => {
                that.bindDialog.isLoading = false;
                if (!!data.success) {
                    that.$message({ type: "success", message: i18n.t('general.sucUpdateMsg') });
                    that.bindDialog.visible = false;
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            });
        },
        deleteStation(id, name) {
            const that = this;
            this.$confirm(i18n.t('general.deleteItem', { item: name }), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'custom'
            }).then(() => {
                $HTTP_deleteStation({stationId: id}).then(data => {
                    if (!!data.success) {
                        that.$message({ type: "success", message: i18n.t('general.sucDelMsg')});
                        that.fetchData();
                    } else {
                        that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                    }
                });
            });
        },
        updateStation() {
            const that = this;
            let   $API,
                  params = {
                    stationName: that.dialog.info.stationName,
                    zipCode: that.dialog.info.zipCode,
                    countryCode: that.dialog.info.countryCode,
                    phone: that.dialog.info.phone,
                    address: that.dialog.info.address,
                    serviceStartTime: that.dialog.info.serviceStartTime,
                    serviceEndTime: that.dialog.info.serviceEndTime,
                    // unitType: that.dialog.info.unitType,
                    // parkingRate: that.dialog.info.parkingRate,
                    lon: that.dialog.info.loc.lon,
                    lat: that.dialog.info.loc.lat,
                  },
                  sucMsg = "";
            if (!that.dialog.type) {
                $API = $HTTP_addStation;
                sucMsg = i18n.t('general.sucAddMsg');
            } else {
                $API = $HTTP_updateStation;
                params.stationId = that.dialog.info.stationId;
                sucMsg = i18n.t('general.sucUpdateMsg');
            }

            that.dialog.isLoading = true;
            $API(params).then(data => {
                that.dialog.isLoading = false;
                if (!!data.success) {
                    that.$message({ type: "success", message: sucMsg });
                    that.dialog.visible = false;
                    that.fetchData();
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            });
        },
        closeDialog(isEdit) {
            if (isEdit) {
                this.$jQuery(".right-form.formVertical").length > 0 && this.$jQuery(".right-form.formVertical").mCustomScrollbar('destroy');
            } else {
                this.$jQuery(".vertial.formVertical").length > 0 && this.$jQuery(".vertial.formVertical").mCustomScrollbar('destroy');
            }
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        handleShowDialog(data) {
            this.mapDialog.itemId = data.stationId;
            this.mapDialog.position = { lat: data.loc.lat, lng: data.loc.lon };
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeShowPosDialog() {
            this.mapDialog.visible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
    }
}
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
        color: #5A607F;
        letter-spacing: 0;
    }
}
/* .formVertical .form-item .el-date-editor {
    width: calc(50% - 9px);
    display: inline-block;
} */
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
</style>