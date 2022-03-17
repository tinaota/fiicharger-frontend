<template>
    <div class="mainctrl" v-loading="stationData.isLoading">
        <div id="map-container" class="google-map"></div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('menu.location') }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="loc-filter">
            <el-select
                class="select-small"
                v-model="filter.operatorTypeId"
                :placeholder="$t('general.operator')"
                @change="handleOperatorChanged()">
                <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
            </el-select>
            <el-select
                class="select-small"
                v-model="filter.stationId"
                v-loading="stationSearchList.isLoading"
                :placeholder="$t('menu.station')"
                @change="handleStationChanged()"
                filterable
                clearable
                style="width: 200px">
                <el-option v-for="(item, key) in stationSearchList.data" :label="item" :key="key" :value="key"></el-option>
            </el-select>
        </div>
        <div class="hint-bar">
            <div class="item">
                <img :src="icon.normal">
                <span class="num" v-if="statisticsInfo.availableCount !== 0" @click="goChargePointPage(1)">{{statisticsInfo.availableCount}}</span>
                <span class="text">{{$t('general.available')}}</span>
            </div>
            <div class="item">
                <img :src="icon.serviceUnavailable">
                <span class="num" v-if="statisticsInfo.unavailableCount !== 0" @click="goChargePointPage(2)">{{statisticsInfo.unavailableCount}}</span>
                <span class="text">{{$t('general.unavailable')}}</span>
            </div>
            <div class="item">
                <img :src="icon.abnormal">
                <span class="num" v-if="statisticsInfo.alertCount !== 0" @click="goChargePointPage(4)">{{statisticsInfo.alertCount}}</span>
                <span class="text">{{$t('general.alert')}}</span>
            </div>
            <div class="item">
                <img :src="icon.connectionLost">
                <span class="num" v-if="statisticsInfo.connectionLostCount !== 0" @click="goChargePointPage(5)">{{statisticsInfo.connectionLostCount}}</span>
                <span class="text">{{$t('general.connectionLost')}}</span>
            </div>
        </div>
        <div v-show="chargeBoxDrawer.visible"
            class="chargeBox-drawer">
            <button class="drawer-closeBtn" :class="{ 'open': (chargeBoxDrawer.isOpen)}"
                    @click="chargeBoxDrawer.isOpen = !chargeBoxDrawer.isOpen">
                {{ chargeBoxDrawer.isOpen ?  `&gt;` : `&lt;` }}
            </button>
            <div class="drawer-body" v-show="chargeBoxDrawer.isOpen" v-loading="chargeBoxDrawer.isLoading">
                <ul>
                    <li v-for="item in chargeBoxDrawer.data" :key="item.chargeBoxId">
                        <!-- :class="{'long': chargeBoxDrawer.data.length > 3}"> -->
                        <div class="title">{{ item.chargeBoxName }}</div>
                        <div class="info">
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.chargePointID') }}</div>
                                <div class="msg">{{ item.chargeBoxId }}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.power') }}</div>
                                <div class="msg">{{ item.power }}kw</div>
                            </div>
                            <div class="info-item connector" :class="{ 'doubleHeight': item.connectorList.length > 3}">
                                <div class="label">{{ $t('chargingStation.connector') }}</div>
                                <div class="msg">
                                    <Connector v-for="(connector, idx) in item.connectorList" :key="idx" :dataObj="connector.connectorInfo" :isBreak="false"></Connector>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.onPeak') }}</div>
                                <div class="msg">{{ item.currency +  item.onPeakElectricityRate + '/' + $t('chargingStation.elecRateUnit')[item.onPeakElectricityRateType || 1] }}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.offPeak') }}</div>
                                <div class="msg">{{ item.currency + item.offPeakElectricityRate + '/' + $t('chargingStation.elecRateUnit')[item.offPeakElectricityRateType || 1]}}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                                <div class="msg">{{ item.currency + item.parkingRate + '/' + $t('chargingStation.parkingRateUnit')[item.parkingRateType] }}</div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import { $HTTP_getChargeBoxListForSelect, $HTTP_getChargeBoxListForMap, $HTTP_getChargeBoxInfoForMap } from "@/api/api";
import { $HTTP_getStationList, $HTTP_getStationDetailList } from "@/api/api";
import { $GLOBAL_CURRENCY } from '@/utils/global';
import ic_info_green from 'imgs/ic_info_green.png';
import ic_info_brown from 'imgs/ic_info_brown.png';
import ic_info_red from 'imgs/ic_info_red.png';
import ic_info_gray from 'imgs/ic_info_gray.png';
import ic_info_orange from 'imgs/ic_info_orange.png';
import ic_device_info from 'imgs/ic_device_info.png';
import ic_charging from 'imgs/ic_charging.png';
import ic_revenue from 'imgs/ic_revenue.png';

import 'snazzy-info-window/dist/snazzy-info-window.min.css';
import "@/styles/map.scss";
import SnazzyInfoWindow from 'snazzy-info-window';

import markerPos1 from 'imgs/ic_green_dot_number.png';
import markerPos2 from 'imgs/ic_orange_dot_number.png';
import markerPos3 from 'imgs/ic_orange_dot_number.png'; //'imgs/ic_brown_dot_number.png';
import markerPos4 from 'imgs/ic_red_dot_number.png';
import markerPos5 from 'imgs/ic_gray_dot_number.png';
import googleMapStyle from '@/assets/js/googleMapStyle_normal';
import $ from 'jquery'
import { MarkerWithLabel } from '@googlemaps/markerwithlabel';
import Connector from "@/components/chargingStation/connector";
export default {
    components: {
        Connector
    },
    data() {
        return {
            lang: '',
            operatorList: {},
            center: {
                lat: 0,
                lng: 0
            },
            defaultZoomSize: 16,
            minZoomSize: 2,
            maxZoomSize: 22,
            icon: {
                normal: ic_info_green,
                abnormal: ic_info_red,
                maintenance: ic_info_brown,
                connectionLost: ic_info_gray,
                serviceUnavailable: ic_info_orange,
                deviceInfo: ic_device_info,
                charging: ic_charging,
                revenue: ic_revenue,
            },
            filter: {
                operatorTypeId: '',
                stationId: ''
            },
            stationSearchList: {
                isLoading: false,
                data: {}
            },
            chargeBoxData: {
                isLoading: false,
                data: []
            },
            statisticsInfo: {
                availableCount: 0,
                unavailableCount: 0,
                maintenanceCount: 0,
                alertCount: 0,
                connectionLostCount: 0
            },
            map: null,
            markers: [],
            currentInfoWindowStationId: '',
            currentInfoWindow: null,
            timer: null,
            frequence: 1000 * 60, //1 min:1000*60
            markerImgList: [markerPos1, markerPos2, markerPos3, markerPos4, markerPos5],
            stationData: {
                isLoading: false,
                data: []
            },
            chargeBoxDrawer: {
                visible: false,
                isLoading: false,
                isOpen: false,
                data: [],
                frequence: 1000 * 1.5
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
    },
    mounted() {
        const that = this;
        let halfHintBarWidth = this.$jQuery(".hint-bar").width()/2 + 12;
        this.$jQuery(".hint-bar").css('left', `calc(50vw + 104px -  ${halfHintBarWidth}px)`);
        this.initMap();
        this.fetchStationList();
        this.fetchData();
        this.setTimer();
        setScrollBar('.chargeBox-drawer .drawer-body', that);
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.removeAllMarkers();
    },
    methods: {
        fetchChargeBoxData(isRefresh) {
            const that = this;
            let param = {};
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.stationId) {
                param.stationId = this.filter.stationId;
            }
            this.removeAllMarkers(!isRefresh);
            this.chargeBoxData.data = {};
            this.chargeBoxData.isLoading = true;
            $HTTP_getChargeBoxListForMap(param).then((data) => {
                that.chargeBoxData.isLoading = false;
                if (!!data.success) {
                    this.statisticsInfo = Object.assign({}, data.chargeBoxStatusStatisticsInfo);
                    let maxLat = -90, maxLng = -180, minLat = 90, minLng = 180;
                    data.chargeBoxList.forEach(item => {
                        item.loc = {
                            lng: item.lon,
                            lat: item.lat
                        }
                        that.chargeBoxData.data[item.chargeBoxId] = Object.assign({}, item);
                        that.drawMarker(that.chargeBoxData.data[item.chargeBoxId]);

                        if (item.lon > maxLng) {
                            maxLng = item.lon;
                        } else if (item.lon < minLng) {
                            minLng = item.lon;
                        }
                        if (item.lat > maxLat) {
                            maxLat = item.lat;
                        } else if (item.lat < minLat) {
                            minLat = item.lat;
                        }
                    });
                    if (!isRefresh) {
                        if (that.filter.chargeBoxId) {
                            that.map.setCenter(that.chargeBoxData.data[that.filter.chargeBoxId].loc);
                            that.map.setZoom(that.defaultZoomSize);
                        } else if (data.chargeBoxList.length === 1) {
                            that.map.setCenter(that.chargeBoxData.data[data.chargeBoxList[0].chargeBoxId].loc);
                            that.map.setZoom(that.defaultZoomSize);
                        } else {
                            const nePoint = new google.maps.LatLng(maxLat, maxLng),
                                  swPoint = new google.maps.LatLng(minLat, minLng),
                                  bounds = new google.maps.LatLngBounds(swPoint, nePoint);
                            that.map.fitBounds(bounds);
                        }
                    } else {
                        that.currentInfoWindow && that.currentInfoWindow.open();
                    }
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log(err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchData(isRefresh) {
            const that = this;
            let param = {};
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.stationId) {
                param.stationId = this.filter.stationId;
            }
            this.removeAllMarkers(!isRefresh);
            this.stationData.data = {};
            this.stationData.isLoading = true;
            $HTTP_getStationDetailList(param).then((data) => {
                that.stationData.isLoading = false;
                if (!!data.success) {
                    let availableCount = 0, unavailableCount = 0, connectionLostCount = 0, alertCount = 0;
                    let maxLat = -90, maxLng = -180, minLat = 90, minLng = 180;
                    data.stationList.forEach(item => {
                        item.location = {
                            lng: parseFloat(item.lon),
                            lat: parseFloat(item.lat),
                        }
                        if (item.lon > maxLng) {
                            maxLng = item.lon;
                        } else if (item.lon < minLng) {
                            minLng = item.lon;
                        }
                        if (item.lat > maxLat) {
                            maxLat = item.lat;
                        } else if (item.lat < minLat) {
                            minLat = item.lat;
                        }
                        if (!item.chargeBoxCount) {
                            item.chargeBoxCount = 0;
                            item.stationStatus = "2";
                        } else {
                            item.stationStatus = 0;
                            if (item.chargeBoxStatusCount.Alert) {
                                item.stationStatus = '4';
                            } else if (item.chargeBoxStatusCount.ConnectionLost) {
                                item.stationStatus = '5';
                            } else if (item.chargeBoxStatusCount.Unavailable) {
                                item.stationStatus = '2';
                            } else if (item.chargeBoxStatusCount.Available) {
                                item.stationStatus = '1';
                            } else {
                                item.stationStatus = '2';
                            }
                            alertCount += item.chargeBoxStatusCount.Alert;
                            connectionLostCount += item.chargeBoxStatusCount.ConnectionLost;
                            unavailableCount += item.chargeBoxStatusCount.Unavailable;
                            availableCount += item.chargeBoxStatusCount.Available;
                            item.smartChargingConnectorAnalysisInfo.forEach(chargeBox => {
                                chargeBox.currency = $GLOBAL_CURRENCY[chargeBox.unitType || 1];
                            })
                        }
                        that.stationData.data[item.stationId] = Object.assign({}, item);
                        that.drawMarker(that.stationData.data[item.stationId], isRefresh);
                    });
                    if (!isRefresh) {
                        // if (that.filter.stationId) {
                        //     that.map.setCenter(that.stationData.data[that.filter.stationId].location);
                        //     that.map.setZoom(that.defaultZoomSize);
                        // } else
                        if (data.stationList.length === 1) { //that.filter.stationId
                            that.map.setCenter(that.stationData.data[data.stationList[0].stationId].location);
                            that.map.setZoom(that.defaultZoomSize);
                        } else {
                            const nePoint = new google.maps.LatLng(maxLat, maxLng),
                                  swPoint = new google.maps.LatLng(minLat, minLng),
                                  bounds = new google.maps.LatLngBounds(swPoint, nePoint);
                            that.map.fitBounds(bounds);
                        }
                    }
                    this.statisticsInfo = {
                        availableCount: availableCount,
                        unavailableCount: unavailableCount,
                        connectionLostCount: connectionLostCount,
                        alertCount: alertCount
                    };
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log(err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchStationList(callBack) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            let param = {};
            if (this.filter.operatorTypeId && this.filter.operatorTypeId != '1') {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            this.stationSearchList.isLoading = true;
            $HTTP_getStationList(param).then((data) => {
                this.stationSearchList.isLoading = false;
                if (!!data.success) {
                    data.stationList.forEach(item => {
                        this.stationSearchList.data[item.stationId] = item.stationName;
                    });
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                callBack && callBack();
            }).catch((err) => {
                console.log('stationSearchList', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        initMap() {
            this.map = new google.maps.Map(document.getElementById('map-container'), {
                                center: this.center,
                                zoom: this.minZoomSize,
                                minZoom: this.minZoomSize,
                                maxZoom: this.maxZoomSize,
                                streetViewControl: false, //設定是否呈現右下角街景小人
                                mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                                fullscreenControl: false,
                                zoomControl: false,
                                styles: googleMapStyle
                            });
            const that = this;
            //如果click地圖其他地方 充電樁列表隱藏才要用
            // this.map.addListener('click', function(event) {
            //     that.chargeBoxDrawer.isOpen ? that.chargeBoxDrawer.isOpen = false : '';
            // });
        },
        drawMarker(item, isRefresh = false) {
            const that = this;
            var markerImage = new google.maps.MarkerImage(this.markerImgList[ item.stationStatus-1 || 1], //這裡要判斷顯是哪個
                                new google.maps.Size(36, 55)); //size  預設位子圖案中間底
            var className = (item.chargeBoxCount > 99) ? 'google-map-marker-label-ts' : 'google-map-marker-label-tl'; //三位數字小一點
            const marker = new MarkerWithLabel({
                            position: item.location,
                            clickable: true,
                            draggable: false,
                            map: that.map,
                            labelContent: item.chargeBoxCount.toString(),
                            labelAnchor: new google.maps.Point(-18, -47),
                            labelClass: className, // the CSS class for the label
                            labelStyle: { opacity: 1.0 },
                            icon: markerImage,
                        });

            marker.addListener("click", () => {
                const htmlContent = `<div class="info-tite">${item.stationName}</div>
                                     <div class="info-msg">${item.address}</div>`;
                var infowindow = new SnazzyInfoWindow($.extend({}, {
                                    marker: marker,
                                    content: htmlContent,
                                    placement: 'right',
                                    wrapperClass: 'station-infoWindow',
                                    panOnOpen: true,
                                    borderRadius: '8px',
                                    offset: {
                                        top: '-36px',
                                        left: '20px'
                                    },
                                    border: false,
                                    backgroundColor: '#F7F9FD',
                                    padding: '12px 16px',
                                    shadow: {
                                        h: '0px',
                                        v: '1px',
                                        blur: '3px',
                                        spread: '0px',
                                        opacity: 0.3,
                                        color: '#000'
                                    },
                                    maxWidth: 200,
                                    showCloseButton: false,
                                    closeOnMapClick: false,
                                    closeWhenOthersOpen: true
                                }));
                that.map.setCenter(item.location);
                that.currentInfoWindow = infowindow;
                infowindow.open();
                that.currentInfoWindowStationId = item.stationId;
                that.changeChargeBoxDrawerData(true, item.stationId);
            });
            if (isRefresh && item.stationId === that.currentInfoWindowStationId) {
                google.maps.event.trigger(that.map, marker, 'click' );
            }
            that.markers.push(marker);
        },
        removeAllMarkers(isClearInfoWindow) {
            //this.$jQuery(".si-content .info-msg").length > 0 && this.$jQuery(".si-content .info-msg").mCustomScrollbar('destroy');
            if (isClearInfoWindow) {
                this.currentInfoWindow && this.currentInfoWindow.close();
                this.currentInfoWindow = null;
                this.currentInfoWindowStationId = '';
            }
            this.markers.forEach(marker => {
                google.maps.event.clearInstanceListeners(marker);
                marker.setMap(null);
            });
            this.markers = [];
        },
        handleOperatorChanged() {
            const that = this;
            that.filter.stationId = '';
            //this.$jQuery(".si-content .info-msg").length > 0 && this.$jQuery(".si-content .info-msg").mCustomScrollbar('destroy');
            this.currentInfoWindow && this.currentInfoWindow.close();
            this.currentInfoWindow = null;
            this.currentInfoWindowStationId = '';
            this.changeChargeBoxDrawerData(false);
            this.stationData.isLoading = true;
            this.fetchStationList(()=> {
                that.fetchData();
                clearInterval(that.timer);
                that.setTimer();
            });
        },
        handleStationChanged() {
            this.currentInfoWindow && this.currentInfoWindow.close();
            this.currentInfoWindow = null;
            this.currentInfoWindowStationId = '';
            this.changeChargeBoxDrawerData(false);
            this.fetchData();
            clearInterval(this.timer);
            this.setTimer();
        },
        setTimer() {
            const that = this;
            this.timer = setInterval(() => {
                that.fetchData(true);
            }, that.frequence);
        },
        goChargePointPage(chargeBoxStatus) {
            const params = {
                chargeBoxStatus: chargeBoxStatus,
                operatorTypeId: this.filter.operatorTypeId,
                chargeBoxId: this.filter.chargeBoxId
            }
            this.$router.push({ name: 'menu.chargePoint', params: params});
        },
        changeChargeBoxDrawerData(isVisible, stationId) {
            this.chargeBoxDrawer.visible = isVisible;
            this.chargeBoxDrawer.isOpen = isVisible;
            if (isVisible) {
                this.chargeBoxDrawer.isLoading = isVisible;
                setTimeout(() => {
                    this.chargeBoxDrawer.data =  this.stationData.data[stationId].smartChargingConnectorAnalysisInfo && this.stationData.data[stationId].smartChargingConnectorAnalysisInfo.slice() || [];
                    this.chargeBoxDrawer.isLoading = !isVisible;
                }, this.chargeBoxDrawer.frequence);
            } else {
                this.chargeBoxDrawer.isLoading = isVisible;
                this.chargeBoxDrawer.data = [];
            }
        }
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl {
        /* padding: 2.4vh 1.6vw 2.4vh 1.6vw; */
    .el-breadcrumb {
        display: block;
        position: absolute;
        top: calc(68px + 2.4vh);
        left: calc(208px + 1.6vw);
    }
    .loc-filter {
        position: absolute;
        top: calc(68px + 2.4vh + 27px);
        left: calc(208px + 1.6vw);
    }
}
.google-map {
    width: calc(100vw - 208px);
    height: calc(100vh - 68px);
    background: #a1c1fb;
    border-top-left-radius: 20px;
    z-index: 0;
    margin-top: -2.4vh;
    margin-left: -1.6vw;
}
.hint-bar {
    position: absolute;
    /* bottom: calc(2.4vh + 2vh); */
    bottom: 2vh;
    width: auto;
    height: auto;
    padding: 10px 18px;
    background-color: #E6EEF8;
    box-shadow: 0 1px 8px 0 rgba(20, 46, 110, 0.10);
    border-radius: 30px;
    vertical-align: middle;
    .item {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        height: 24px;
        span {
            letter-spacing: 0;
            color: #151E25;
            &.text {
                height: 24px;
                line-height: 24px;
                /* vertical-align: bottom; */
                vertical-align: top;
                margin-left: 10px;
                font-size: 1rem;
            }
            &.num {
                position: absolute;
                /* bottom: 18px; */
                top: 18px;
                left: 16px;
                /* background-color: #F84736;
                color: #FFF; */
                background-color: rgb(240, 201, 197);
                padding: 2px 4px;
                border-radius: 16px;
                font-size: 0.875rem;
                cursor: pointer;
            }
        }
        img {
            width: 24px;
        }
        + .item {
            margin-left: 24px;
        }
    }
}
.chargeBox-drawer {
    .drawer-closeBtn {
        position: fixed;
        top: 68px;
        /* top: calc(50% - 34px); */
        right: 0px;
        background: #0C83FF;
        color: #F7F9FD;
        padding: 8px;
        border-radius: 8px 0 0 8px;
        border: none;
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.30);
        /* transform: translate(0,50%); */
        font-size: 20px;
        &.open {
            right: 340px;
        }
    }
    .drawer-body {
        position: fixed;
        width: 340px;
        height: calc(100vh - 68px);
        top: 68px;
        right: 0;
        background: #F7F9FD;
        box-shadow: 0 1px 3px 0 rgba(0,0,0,0.30);
        &.mCustomScrollbar ul li {
            margin-right: 16px;
            padding: 16px 0 16px 16px;
        }
        &:not(.mCustomScrollbar) ul li {
            padding: 16px;
        }
        ul {
            padding-left: 0;
            margin: 0;
            height: 100%;
            li {
                list-style: none;
                border-bottom: 1px solid #D4DCEA;
                .title {
                    font-size: 1rem;
                    color: #1E2423;
                    margin-bottom: 8px;
                }
                .info-item {
                    font-size: 0.78rem;
                    color: #525E69;
                    .label {
                        display: inline;
                        margin-right: 8px;
                    }
                    .msg {
                        display: inline;
                    }
                    + .info-item {
                        margin-top: 8px;
                    }
                    &.connector {
                        line-height: 24px;
                        height: 24px;
                        margin-top: 2px;
                        margin-bottom: 12px;
                        .label {
                            vertical-align: text-top;
                        }
                        &.doubleHeight {
                            height: 48px;
                        }
                    }
                }
            }
        }
    }
}
</style>