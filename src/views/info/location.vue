<template>
    <div class="mainctrl location">
        <div id="map-container" class="google-map"></div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('menu.location') }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="loc-filter">
            {{ filter.stationName }}
            <el-select class="select-small" v-model="filter.stationId" v-loading="stationSearchList.isLoading" :placeholder="$t('menu.station')" @change="handleStationChanged()" filterable clearable style="width: 200px">
                <el-option v-for="(item, key) in stationSearchList.allData" :label="item.name" :key="key" :value="item.id"></el-option>
            </el-select>
        </div> -->
        <div class="hint-bar">
            <div class="item">
                <img :src="icon.normal" alt="connectedIcon">
                <span class="num" v-if="statisticsInfo.connectedCount !== 0" @click="goChargePointPage(`Connected`)" aria-label="connectedIconCount">{{ statisticsInfo.connectedCount }}</span>
                <span class="num" v-else>0</span>
                <span class="text">{{ $t('general.connected') }}</span>
            </div>
            <div class="item">
                <img :src="icon.serviceUnavailable" alt="disconnectedIcon">
                <span class="num" v-if="statisticsInfo.disconnectedCount !== 0" @click="goChargePointPage(`Disconnected`)" aria-label="disconnectedIconCount">{{ statisticsInfo.disconnectedCount }}</span>
                <span class="num" v-else>0</span>
                <span class="text">{{ $t('general.disconnected') }}</span>
            </div>
        </div>
        <div v-show="chargeBoxDrawer.visible" class="chargeBox-drawer">
            <button class="drawer-closeBtn" :class="{ 'open': (chargeBoxDrawer.isOpen)}" @click="chargeBoxDrawer.isOpen = !chargeBoxDrawer.isOpen">
                {{ chargeBoxDrawer.isOpen ? `&gt;` : `&lt;` }}
            </button>
            <div class="drawer-body" v-show="chargeBoxDrawer.isOpen" v-loading="chargeBoxDrawer.isLoading">
                <ul>
                    <li v-for="item in chargeBoxDrawer.data" :key="item.chargeBoxId">
                        <div class="title">{{ item.chargeBoxName }}</div>
                        <div class="info">
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.chargerId') }} :</div>
                                <div class="msg">{{ item.ocppId }}</div>
                            </div>
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.power') }} : </div>
                                <div class="msg">{{ item.powerKw }} KWH</div>
                            </div>
                            <div class="info-item connectionStatusMain">
                                <div class="label">{{ $t('chargingStation.connectionStatus') }} : </div>
                                <div class="msg connector-obj">
                                    <div v-if="item.connectionStatus===`Connected`" class="connection-status">
                                        <div class="circle-status color1"></div>
                                        <div> {{ $t('general.connected') }}</div>
                                    </div>
                                    <div v-else class="connection-status">
                                        <div class="circle-status color5"></div>
                                        <div> {{ $t('general.disconnected') }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                                <div class="msg"><a class="view-link">{{$t('general.view')}}</a></div>
                            </div>
                            <!-- <div class="info-item">
                                <div class="label">{{ $t('chargingStation.onPeak') }} : </div>
                                <div class="msg"> {{ item.chargePrice? getSymbols(item.chargePrice.currencyType) + getSymbols(item.chargePrice.onPeak.rate) + '/' + getSymbols(item.chargePrice.onPeak.type):$t('general.free') }}
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.offPeak') }} : </div>
                                <div class="msg"> {{ item.chargePrice? getSymbols(item.chargePrice.currencyType) + getSymbols(item.chargePrice.offPeak.rate) + '/' + getSymbols(item.chargePrice.offPeak.type):$t('general.free') }}
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="label">{{ $t('chargingStation.parkingRate') }} : </div>
                                <div class="msg">
                                    {{ item.chargePrice? getSymbols(item.chargePrice.currencyType) + getSymbols(item.chargePrice.occupancy.rate) + '/' + getSymbols(item.chargePrice.offPeak.type):$t('general.free') }} </div>
                            </div> -->
                            <div class="info-item connectorMain" :class="{ 'doubleHeight': item.connectors.length > 3}">
                                <div class="label">{{ $t('chargingStation.connector') }} : </div>
                                <div class="msg">
                                    <Connector :dataObj="item.connectors" :chargerStatus="item.connectionStatus" :isBreak="true"></Connector>
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformToSymbols } from "@/utils/function";
import {
    $HTTP_getStationList,
    $HTTP_getAllChargeBoxList,
    $HTTP_getStationListById,
    $HTTP_getConnectionSummary
} from "@/api/api";
import ic_info_green from "imgs/ic_info_green.png";
import ic_info_brown from "imgs/ic_info_brown.png";
import ic_info_red from "imgs/ic_info_red.png";
import ic_info_gray from "imgs/ic_info_gray.png";
import ic_info_orange from "imgs/ic_info_orange.png";
import ic_device_info from "imgs/ic_device_info.png";
import ic_charging from "imgs/ic_charging.png";
import ic_revenue from "imgs/ic_revenue.png";

import ic_info_green_b from "imgs/ic_green_b_dot_number.png";
import ic_info_green_m from "imgs/ic_green_m_dot_number.png";
import ic_info_green_s from "imgs/ic_green_s_dot_number.png";

// import ic_info_brown_b from "imgs/ic_brown_b_dot_number.png";
// import ic_info_brown_m from "imgs/ic_brown_m_dot_number.png";
// import ic_info_brown_s from "imgs/ic_brown_s_dot_number.png";

import ic_info_red_b from "imgs/ic_red_b_dot_number.png";
import ic_info_red_m from "imgs/ic_red_m_dot_number.png";
import ic_info_red_s from "imgs/ic_red_s_dot_number.png";

import ic_info_gray_b from "imgs/ic_gray_b_dot_number.png";
import ic_info_gray_m from "imgs/ic_gray_m_dot_number.png";
import ic_info_gray_s from "imgs/ic_gray_s_dot_number.png";

import ic_info_orange_b from "imgs/ic_orange_b_dot_number.png";
import ic_info_orange_m from "imgs/ic_orange_m_dot_number.png";
import ic_info_orange_s from "imgs/ic_orange_s_dot_number.png";
import "snazzy-info-window/dist/snazzy-info-window.min.css";
import "@/styles/map.scss";
import SnazzyInfoWindow from "snazzy-info-window";

import googleMapStyle from "@/assets/js/googleMapStyle_normal";
import $ from "jquery";
import { MarkerWithLabel } from "@googlemaps/markerwithlabel";
import Connector from "@/components/chargingStation/connector";
import unknown from "imgs/help_icon.svg";

export default {
    components: {
        Connector
    },
    data() {
        return {
            stationSearchList: {
                isLoading: false,
                data: [],
                allData: []
            },
            filter: {
                stationId: "",
                stationName: ""
            },
            statisticsInfo: {
                connectedCount: 0,
                disconnectedCount: 0
            },
            center: {
                lat: 42.6,
                lng: -87.9
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
                unknown: unknown
            },
            map: null,
            markers: [],
            markerImgStyle: {
                small: {
                    labelAnchor: [-15, -43],
                    labelClass: "google-map-marker-label-small",
                    size: [30, 46],
                    icon: {
                        green: ic_info_green_s,
                        orange: ic_info_orange_s,
                        red: ic_info_red_s,
                        gray: ic_info_gray_s
                    }
                },
                medium: {
                    labelAnchor: [-18, -50], //不用改
                    labelClass: "google-map-marker-label-medium",
                    size: [36, 55], //不用改
                    icon: {
                        green: ic_info_green_m,
                        orange: ic_info_orange_m,
                        red: ic_info_red_m,
                        gray: ic_info_gray_m
                    }
                },
                large: {
                    labelAnchor: [-23.5, -67],
                    labelClass: "google-map-marker-label-large",
                    size: [47, 72],
                    icon: {
                        green: ic_info_green_b,
                        orange: ic_info_orange_b,
                        red: ic_info_red_b,
                        gray: ic_info_gray_b
                    }
                }
            },
            chargeBoxDrawer: {
                visible: false,
                isLoading: false,
                isOpen: false,
                data: [],
                frequence: 5000 * 1.5
            },
            currentInfoWindowStationId: "",
            currentInfoWindow: null,
            timer: null,
            timerBox: null,
            frequence: 10000 //1 min:1000*60
        };
    },
    computed: {
        getSymbols() {
            return (item) => transformToSymbols(item);
        }
    },
    mounted() {
        const that = this;
        let halfHintBarWidth = this.$jQuery(".hint-bar").width();
        this.$jQuery(".hint-bar").css(
            "left",
            `calc(50vw + 104px -  ${halfHintBarWidth}px)`
        );
        this.initMap();
        this.setTimer();
        setScrollBar(".chargeBox-drawer .drawer-body", that);
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (this.timerBox) {
            clearInterval(this.timerBox);
        }
        this.removeAllMarkers();
    },
    methods: {
        setTimer() {
            const that = this;
            this.timer = setInterval(() => {
                that.fetchStationList(false);
            }, that.frequence);
        },
        initMap() {
            this.map = new google.maps.Map(
                document.getElementById("map-container"),
                {
                    center: this.center,
                    zoom: this.defaultZoomSize,
                    minZoom: this.minZoomSize,
                    maxZoom: this.maxZoomSize,
                    streetViewControl: false, //設定是否呈現右下角街景小人
                    mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                    fullscreenControl: false,
                    zoomControl: false,
                    styles: googleMapStyle
                }
            );
            // add current location option
            const locationButton = document.createElement("button");
            let currentLocationLogo = document.createElement("img");
            currentLocationLogo.src = require("../../../public/imgs/my_location.png");
            locationButton.appendChild(currentLocationLogo);
            locationButton.classList.add("custom-map-control-button");
            locationButton.style.margin = "0 50px 80px 0";
            this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
                locationButton
            );

            locationButton.addEventListener("click", () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            this.center = pos;
                            this.initMap();
                        },
                        () => {
                            this.$message({
                                type: "warning",
                                message: i18n.t("error_geolocation")
                            });
                        }
                    );
                } else {
                    // Browser doesn't support Geolocation
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_geolocation")
                    });
                }
            });
            this.fetchStationList(true);
        },
        fetchStationList(loadMapAgain) {
            const that = this;
            let $API;
            let param = {};
            let paramsConnectionSummary = {};

            if (this.filter.stationId !== "") {
                param = {
                    chargeStationId: this.filter.stationId
                };
                paramsConnectionSummary.StationId = this.filter.stationId;

                $API = $HTTP_getStationListById;
            } else {
                $API = $HTTP_getStationList;
                this.stationSearchList.isLoading = true;
            }

            $API(param)
                .then((res) => {
                    this.stationSearchList.isLoading = false;

                    let response;
                    let responseLength;

                    if (res) {
                        if (this.filter.stationId === "") {
                            response = res?.data;
                            responseLength = res?.data?.length;
                            that.stationSearchList.allData = response;
                        } else {
                            response = [res];
                            responseLength = [res].length;
                            that.stationSearchList.data = response;
                        }
                        // get connected count
                        $HTTP_getConnectionSummary(paramsConnectionSummary)
                            .then((res) => {
                                that.statisticsInfo.connectedCount =
                                    res.connected;
                                that.statisticsInfo.disconnectedCount =
                                    res.disconnected;
                            })
                            .catch((err) => console.log(err));

                        let maxLat = -85,
                            maxLng = -180,
                            minLat = 85,
                            minLng = 180;

                        response.forEach((item) => {
                            item.location = {
                                lng: parseFloat(item.coordinates.longitude),
                                lat: parseFloat(item.coordinates.latitude)
                            };
                            that.drawMarker(item, true);

                            if (item.coordinates.longitude > maxLng) {
                                maxLng = item.coordinates.longitude;
                            }
                            if (item.coordinates.longitude < minLng) {
                                minLng = item.coordinates.longitude;
                            }
                            if (item.coordinates.latitude > maxLat) {
                                maxLat = item.coordinates.latitude;
                            }
                            if (item.coordinates.latitude < minLat) {
                                minLat = item.coordinates.latitude;
                            }
                        });
                        if (loadMapAgain) {
                            if (navigator.geolocation && responseLength !== 1) {
                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        const pos = {
                                            lat: position.coords.latitude,
                                            lng: position.coords.longitude
                                        };
                                        that.map.setCenter(pos);
                                    },
                                    () => {
                                        this.$message({
                                            type: "warning",
                                            message: i18n.t("error_geolocation")
                                        });
                                        // default to max ranges
                                        const nePoint = new google.maps.LatLng(
                                                maxLat,
                                                maxLng
                                            ),
                                            swPoint = new google.maps.LatLng(
                                                minLat,
                                                minLng
                                            ),
                                            bounds =
                                                new google.maps.LatLngBounds();
                                        bounds.extend(swPoint);
                                        bounds.extend(nePoint);
                                        that.map.fitBounds(bounds);
                                    }
                                );
                            } else if (responseLength === 1) {
                                that.map.setCenter(response[0].location);
                                that.map.setZoom(that.defaultZoomSize);
                            } else {
                                // default
                                const nePoint = new google.maps.LatLng(
                                        maxLat,
                                        maxLng
                                    ),
                                    swPoint = new google.maps.LatLng(
                                        minLat,
                                        minLng
                                    ),
                                    bounds = new google.maps.LatLngBounds();
                                bounds.extend(swPoint);
                                bounds.extend(nePoint);
                                that.map.fitBounds(bounds);
                            }
                        }
                    }
                })
                .catch((err) => {
                    console.log("stationSearchList", err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        drawMarker(item, isRefresh = false) {
            const that = this;
            var markerStyle, markerImage;
            let noOfChargers = item.acCount + item.dcCount;

            if (noOfChargers < 10) {
                markerStyle = this.markerImgStyle.small;
            } else if (noOfChargers > 99) {
                markerStyle = this.markerImgStyle.large;
            } else {
                markerStyle = this.markerImgStyle.medium;
            }
            markerImage = new google.maps.MarkerImage(
                markerStyle.icon[item.publish ? "green" : "red"], //這裡要判斷顯是哪個
                new google.maps.Size(markerStyle.size[0], markerStyle.size[1])
            );
            const marker = new MarkerWithLabel({
                position: item.location,
                clickable: true,
                draggable: false,
                map: that.map,
                labelContent: noOfChargers.toString(),
                labelAnchor: new google.maps.Point(
                    markerStyle.labelAnchor[0],
                    markerStyle.labelAnchor[1]
                ),
                labelClass: markerStyle.labelClass, // the CSS class for the label
                labelStyle: { opacity: 1.0 },
                icon: markerImage
            });

            marker.addListener("click", () => {
                that.changeChargeBoxDrawerData(false, this.filter.stationId);

                const htmlContent = `<div class="info-tite">${item.name}</div>
                                     <div class="info-msg">${item.address.street} ${item.address.city} ${item.address.state}</div>`;

                var infowindow = new SnazzyInfoWindow(
                    $.extend(
                        {},
                        {
                            marker: marker,
                            content: htmlContent,
                            placement: "right",
                            wrapperClass: "station-infoWindow",
                            panOnOpen: true,
                            borderRadius: "8px",
                            offset: {
                                top: "-36px",
                                left: "20px"
                            },
                            border: false,
                            backgroundColor: "#F7F9FD",
                            padding: "12px 16px",
                            shadow: {
                                h: "0px",
                                v: "1px",
                                blur: "3px",
                                spread: "0px",
                                opacity: 0.3,
                                color: "#000"
                            },
                            maxWidth: 200,
                            showCloseButton: false,
                            closeOnMapClick: false,
                            closeWhenOthersOpen: true
                        }
                    )
                );
                // that.map.setCenter(item.location);
                that.currentInfoWindow = infowindow;
                infowindow.open();
                that.currentInfoWindowStationId = item.id;
                that.changeChargeBoxDrawerData(true, item.id);
            });
            if (isRefresh && item.id === that.currentInfoWindowStationId) {
                google.maps.event.trigger(that.map, marker, "click");
            }
            that.markers.push(marker);
        },
        handleStationChanged() {
            this.removeAllMarkers();
            if (this.filter.stationId !== "") {
                this.fetchStationList(true);
            } else {
                this.statisticsInfo = {
                    connectedCount: 0,
                    disconnectedCount: 0
                };
                this.fetchStationList(false);
            }
            this.currentInfoWindow && this.currentInfoWindow.close();
            this.currentInfoWindow = null;
            this.currentInfoWindowStationId = "";
            this.changeChargeBoxDrawerData(false, this.filter.stationId);
            clearInterval(this.timer);
            this.setTimer();
        },
        goChargePointPage(chargeBoxStatus) {
            const params = {
                chargeBoxStatus: chargeBoxStatus,
                stationId: this.filter.stationId
            };
            this.$router.push({ name: "menu.chargePoint", params: params });
        },
        changeChargeBoxDrawerData(isVisible, stationId) {
            this.chargeBoxDrawer.visible = isVisible;
            this.chargeBoxDrawer.isOpen = isVisible;
            let param = {
                StationId: stationId
            };
            if (isVisible) {
                this.getChargeBoxList(param, isVisible);
                this.timerBox = setInterval(() => {
                    this.getChargeBoxList(param, isVisible);
                }, this.chargeBoxDrawer.frequence);
            } else {
                clearInterval(this.timerBox);
                this.chargeBoxDrawer.isLoading = isVisible;
                this.chargeBoxDrawer.data = [];
            }
        },
        getChargeBoxList(param, isVisible) {
            this.chargeBoxDrawer.isLoading = isVisible;
            $HTTP_getAllChargeBoxList(param).then((res) => {
                this.chargeBoxDrawer.data = res.data;
                this.chargeBoxDrawer.isLoading = !isVisible;
            });
        },
        removeAllMarkers(isClearInfoWindow) {
            //this.$jQuery(".si-content .info-msg").length > 0 && this.$jQuery(".si-content .info-msg").mCustomScrollbar('destroy');
            if (isClearInfoWindow) {
                this.currentInfoWindow && this.currentInfoWindow.close();
                this.currentInfoWindow = null;
                this.currentInfoWindowStationId = "";
            }
            this.markers.forEach((marker) => {
                google.maps.event.clearInstanceListeners(marker);
                marker.setMap(null);
            });
            this.markers = [];
        }
    }
};
</script>


<style lang = "scss" scoped>
.mainctrl {
    .el-breadcrumb {
        display: block;
        position: absolute;
        top: calc(68px + 2.4vh);
    }
    .loc-filter {
        position: absolute;
        top: calc(68px + 2.4vh + 27px);
    }
}
.google-map {
    width: 105%;
    height: 100vh;
    background: #a1c1fb;
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
    background-color: #e6eef8;
    box-shadow: 0 1px 8px 0 rgba(20, 46, 110, 0.1);
    border-radius: 30px;
    vertical-align: middle;
    .item {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        height: 24px;
        span {
            letter-spacing: 0;
            color: #151e25;
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
        background: #0c83ff;
        color: #f7f9fd;
        padding: 8px;
        border-radius: 8px 0 0 8px;
        border: none;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
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
        background: #f7f9fd;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
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
                border-bottom: 1px solid #d4dcea;
                .title {
                    font-size: 1rem;
                    color: #1e2423;
                    margin-bottom: 8px;
                }
                .info-item {
                    font-size: 0.78rem;
                    color: #525e69;
                    .label {
                        display: inline;
                        margin-right: 8px;
                    }
                    .msg {
                        display: inline;
                        margin-top: -3px;
                        &.connector-obj {
                            display: inline-block;
                            .connection-status {
                                display: flex;
                                .circle-status {
                                    height: 16px;
                                    width: 16px;
                                    border-radius: 16px;
                                    margin-right: 5px;
                                }
                                div:nth-child(2) {
                                    margin-top: 1px;
                                }
                            }
                        }
                        .view-link {
                            color: #0056ff;
                            text-decoration: underline;
                            cursor: pointer;
                        }
                    }
                    + .info-item {
                        margin-top: 8px;
                    }
                    &.connectorMain,
                    &.connectionStatusMain {
                        height: auto;
                        padding: 6px 0 0 0;
                        margin-top: 0;
                        display: flex;
                        .label {
                            vertical-align: super;
                        }
                        &.doubleHeight {
                            height: auto;
                        }
                        .content {
                            margin-top: -7px;
                        }
                    }
                }
            }
        }
    }
}
@media only screen and (max-width: 1280px) {
    .drawer-closeBtn {
        &.open {
            right: 338px !important;
        }
    }
}
</style>
