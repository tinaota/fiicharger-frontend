<template>
    <el-dialog
        :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')"
        width="80%"
        :visible.sync="visible"
        custom-class="map"
        :show-close="false"
        v-loading="isLoading"
        @close="closeDialog()">
        <div id="map-container" class="google-map"></div>
        <div class="right-form formVertical">
            <div class="form-item">
                <div class="label">{{ $t('chargingStation.chargePointID') }}</div>
                <el-input v-model="dialog.info.chargeBoxId"></el-input>
            </div>
            <!-- <div class="form-item">
                <div class="label">{{ $t('general.name') }}</div>
                <el-input v-model="dialog.info.chargeBoxName"></el-input>
            </div> -->
            <div class="form-item">
                <div class="label">{{ $t('general.lng') }}</div>
                <el-input v-model="dialog.info.loc.lon" disabled></el-input>
            </div>
            <div class="form-item">
                <div class="label">{{ $t('general.lat') }}</div>
                <el-input v-model="dialog.info.loc.lat" disabled></el-input>
            </div>
            <div class="hint" v-if="mapInfo.marker === null">{{$t('general.clickAddMarker')}}</div>
            <div class="hint" v-else>{{$t('general.dragMarker')}}</div>
            <!-- <div class="form-item">
                <div class="label">{{ $t('chargingStation.station') }}</div>
                <el-select
                    class="select-small"
                    v-model="dialog.info.stationId"
                    v-loading="stationList.isLoading">
                    <el-option v-for="(item, key) in stationList.data" :label="key+' '+item" :key="key" :value="key"></el-option>
                </el-select>
            </div> -->
            <div class="form-item">
                <div class="label">{{ $t('general.zipCode') }}</div>
                <el-input v-model="dialog.info.zipCode"></el-input>
            </div>
            <div class="form-item">
                <div class="label">{{ $t('chargingStation.chargeType') }}</div>
                <el-select
                    class="select-small"
                    v-model="dialog.info.chargeType">
                    <el-option label="AC" :value="1"></el-option>
                    <el-option label="DC" :value="2"></el-option>
                </el-select>
            </div>
            <div class="form-item">
                <div class="label">{{ $t('general.currency') }}</div>
                <el-select
                    class="select-small"
                    v-model="dialog.info.unitType">
                    <el-option v-for="(item, key) in currencyList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                </el-select>
            </div>
            <div class="form-item">
                <div class="label">{{ $t('chargingStation.elecRate') }}</div>
            </div>
            <div class="form-item">
                <div class="label">{{ "● " + $t('chargingStation.onPeak') }}</div>
                <div class="elecRateItem">
                    <el-input-number v-model="dialog.info.onPeakElectricityRate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                    /
                    <el-select
                        class="select-small"
                        v-model="dialog.info.onPeakElectricityRateType">
                        <el-option v-for="(item, key) in $t('chargingStation.elecRateUnit')" :label="item" :key="key" :value="parseInt(key)"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="form-item">
                <div class="label">{{ "● " + $t('chargingStation.offPeak') }}</div>
                <div class="elecRateItem">
                    <el-input-number v-model="dialog.info.offPeakElectricityRate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                    /
                    <el-select
                        class="select-small"
                        v-model="dialog.info.offPeakElectricityRateType">
                        <el-option v-for="(item, key) in $t('chargingStation.elecRateUnit')" :label="item" :key="key" :value="parseInt(key)"></el-option>
                    </el-select>
                </div>
            </div>
            <div class="form-item">
                <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                <el-input-number v-model="dialog.info.parkingRate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
            </div>
            <div class="form-item">
                <div class="label">{{ $t('general.installationDate') }}</div>
                <el-date-picker
                    v-model="dialog.info.installationDate"
                    type="date"
                    value-format="yyyy-MM-dd"
                    format="yyyy-MM-dd"
                    :picker-options="pickerOptions"
                    :clearable="false">
                </el-date-picker>
            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateCheckBox">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import { $GLOBAL_CURRENCY } from '@/utils/global';
// import { $HTTP_getStationListForSelect, $HTTP_addChargeBox, $HTTP_updateChargeBox } from "@/api/api";
import { $HTTP_addChargeBox, $HTTP_updateChargeBox } from "@/api/api";
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { buildingsIn3D, getLastLayerId } from '@/assets/js/appConfig.js'
import MapStyle from '@/assets/js/mapStyle.js'
import 'threebox-plugin/dist/threebox';
import "@/styles/map.scss"
const MAPBOXTOKEN = process.env.VUE_APP_MAPBOXTOKEN
export default {
    props: {
        name: String,
        show: Boolean,
        dialog: {
            type: Object,
            default: function() {
                return {
                    type: 0,
                    info: {
                        chargeBoxId: '',
                        // chargeBoxName: '',
                        loc: {
                            lng: '',
                            lon: '',
                            lat: ''
                        },
                        // stationId: '',
                        zipCode: '',
                        chargeType: 1,
                        unitType: '',
                        onPeakElectricityRate: 0,
                        onPeakElectricityRateType: 1,
                        offPeakElectricityRate: 0,
                        offPeakElectricityRateType: 1,
                        parkingRate: 0,
                        installationDate: ''
                    }
                };
            }
        },
        // stationList: {
        //     type: Object,
        //     default: function() {
        //         return {
        //             isLoading: false,
        //             data: {}
        //         };
        //     }
        // }
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            zoom: 16,
            map: null,
            mapInfo: {
                initMap: true,
                zoom: 14,
                marker: null,
                initCenter: {
                    lat: 42.677811124442854,
                    lng: -87.91695010215827
                },
                icon: require('imgs/ic_info_green.png')
            },
            currencyList: $GLOBAL_CURRENCY,
            serviceStatusList: [i18n.t('general.unactive'), i18n.t('general.active'), i18n.t('general.repair')],
            pickerOptions: {
                disabledDate(time) {
                return time.getTime() > Date.now();
                }
            },
        }
    },
    beforeDestroy() {
        this.map && google.maps.event.clearListeners(this.map, 'click');
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                if (that.visible) {
                    that.$jQuery(".right-form").length > 0 && this.$jQuery(".right-form").mCustomScrollbar('destroy');
                    // if (that.name === 'stationDetail') {
                    //     this.fetchStationList();
                    // }
                    that.$nextTick(() => {
                        setScrollBar('.right-form', this);
                        if (that.mapInfo.initMap) {
                            that.mapInfo.initMap = false;
                            that.initMap();
                        }
                        that.removeMarker();
                        if (this.dialog.type) {
                            that.drawMarker();
                            that.map.setCenter(that.dialog.info.loc);
                        } else if (that.dialog.info.loc.lat) {
                            that.drawMarker();
                            that.map.setCenter(that.dialog.info.loc);
                        } else if (!this.dialog.info.loc || !this.dialog.info.loc.lat) {
                            that.map.setCenter(that.mapInfo.initCenter);
                        }
                    });
                }
            }
        }
    },
    methods: {
        /*fetchStationList() {
            const that = this;
            this.stationList.isLoading = true;
            $HTTP_getStationListForSelect().then((data) => {
                this.stationList.isLoading = false;
                if (!!data.success) {
                    data.stationList.forEach(item => {
                        that.stationList.data[item.stationId] = item.stationName;
                    });
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.stationList.isLoading = false;
                console.log('StationList', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },*/
        initMap() {
            const that = this;
            this.map = new google.maps.Map(document.getElementById('map-container'), {
                                center: this.mapInfo.initCenter,
                                zoom: this.mapInfo.zoom,
                                streetViewControl: false, //設定是否呈現右下角街景小人
                                mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                                fullscreenControl: false,
                                zoomControl: false
                            });
            google.maps.event.addListener(this.map, 'click', function(event) {
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
            var markerImage = new google.maps.MarkerImage(this.mapInfo.icon,
                                new google.maps.Size(38, 38), //size
                                new google.maps.Point(0, 0), //origin point
                                new google.maps.Point(24, 24)); // offset point
            let marker = new google.maps.Marker({
                            map: this.map,
                            position: this.dialog.info.loc,
                            icon: markerImage,
                            draggable:true,
                        });
            this.mapInfo.marker = marker;
            google.maps.event.addListener(this.mapInfo.marker, 'dragend', function(event) {
                that.dialog.info.loc = event.latLng.toJSON();
                that.dialog.info.loc.lon = that.dialog.info.loc.lng;
            });
        },
        removeMarker() {
            if (this.mapInfo.marker) {
                google.maps.event.clearListeners(this.mapInfo.marker, 'dragend');
                this.mapInfo.marker.setMap();
                this.mapInfo.marker = null;
            }
        },
        updateCheckBox() {
            const that = this;
            let   $API,
                  params = {
                    chargeBoxId: that.dialog.info.chargeBoxId,
                    // chargeBoxName: that.dialog.info.chargeBoxName,
                    lon: that.dialog.info.loc.lon,
                    lat: that.dialog.info.loc.lat,
                    // stationId: that.dialog.info.stationId,
                    zipCode: that.dialog.info.zipCode,
                    chargeType: that.dialog.info.chargeType,
                    unitType: that.dialog.info.unitType,
                    onPeakElectricityRate: that.dialog.info.onPeakElectricityRate,
                    onPeakElectricityRateType: that.dialog.info.onPeakElectricityRateType,
                    offPeakElectricityRate: that.dialog.info.offPeakElectricityRate,
                    offPeakElectricityRateType: that.dialog.info.offPeakElectricityRateType,
                    parkingRate: that.dialog.info.parkingRate,
                    installationDate: that.dialog.info.installationDate
                  },
                  sucMsg = "";
            if (!that.dialog.type) {
                $API = $HTTP_addChargeBox;
                sucMsg = i18n.t('general.sucAddMsg');
            } else {
                $API = $HTTP_updateChargeBox;
                sucMsg = i18n.t('general.sucUpdateMsg');
            }

            that.isLoading = true;
            $API(params).then(data => {
                that.isLoading = false;
                if (!!data.success) {
                    that.$message({ type: "success", message: sucMsg });
                    that.isUpdate = true;
                    that.visible = false;
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            });
        },
        closeDialog() {
            this.$emit('close', this.isUpdate);
        }
    }
}
</script>
<style lang = "scss" scoped>
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
        .form-item .elecRateItem {
            .el-input-number,
            .el-select {
                width: calc(50% - 8px);
            display: inline-block
            }
        }
    }

}
</style>