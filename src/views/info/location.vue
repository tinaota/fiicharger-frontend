<template>
    <div class="mainctrl">
        <div id="mapboxBox" v-loading="chargeBoxData.isLoading" />
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
                v-model="filter.chargeBoxId"
                v-loading="chargerBoxList.isLoading"
                :placeholder="$t('menu.chargePoint')"
                @change="updateData()"
                filterable
                clearable
                style="width: 200px">
                <el-option v-for="(item, key) in chargerBoxList.data" :label="item" :key="key" :value="key"></el-option>
            </el-select>
        </div>
        <div class="hint-bar">
            <div class="item">
                <img :src="icon.normal">
                <span class="num" v-if="statisticsInfo.availableCount !== 0">{{statisticsInfo.availableCount}}</span>
                <span class="text">{{$t('general.available')}}</span>
            </div>
            <div class="item">
                <img :src="icon.serviceUnavailable">
                <span class="num" v-if="statisticsInfo.unavailableCount !== 0">{{statisticsInfo.unavailableCount}}</span>
                <span class="text">{{$t('general.unavailable')}}</span>
            </div>
            <div class="item">
                <img :src="icon.maintenance">
                <span class="num" v-if="statisticsInfo.maintenanceCount !== 0">{{statisticsInfo.maintenanceCount}}</span>
                <span class="text">{{$t('general.maintenance')}}</span>
            </div>
            <div class="item">
                <img :src="icon.abnormal">
                <span class="num" v-if="statisticsInfo.alertCount !== 0">{{statisticsInfo.alertCount}}</span>
                <span class="text">{{$t('general.alert')}}</span>
            </div>
            <div class="item">
                <img :src="icon.connectionLost">
                <span class="num" v-if="statisticsInfo.connectionLostCount !== 0">{{statisticsInfo.connectionLostCount}}</span>
                <span class="text">{{$t('general.connectionLost')}}</span>
            </div>
        </div>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { buildingsIn3D, clusters, clusterCount, getLastLayerId } from '@/assets/js/appConfig.js'
import MapStyle from '@/assets/js/mapStyle.js'
import 'threebox-plugin/dist/threebox';
import "@/styles/map.scss";
import { $HTTP_getChargeBoxListForSelect, $HTTP_getChargeBoxListForMap, $HTTP_getChargeBoxInfoForMap } from "@/api/api";
import { $GLOBAL_CURRENCY } from '@/utils/global';
import ic_info_green from 'imgs/ic_info_green.png';
import ic_info_brown from 'imgs/ic_info_brown.png';
import ic_info_red from 'imgs/ic_info_red.png';
import ic_info_gray from 'imgs/ic_info_gray.png';
import ic_info_orange from 'imgs/ic_info_orange.png';
import ic_device_info from 'imgs/ic_device_info.png';
import ic_charging from 'imgs/ic_charging.png';
import ic_revenue from 'imgs/ic_revenue.png';

import ic_ac_iec from 'imgs/ic_ac_iec.png';
import ic_ac_tesla from 'imgs/ic_ac_tesla.png';
import ic_ac_sae from 'imgs/ic_ac_sae.png';
import ic_ac_gbt from 'imgs/ic_ac_gbt.png';
import ic_ac_chademo from 'imgs/ic_ac_chademo.png';
import ic_ac_ccs2 from 'imgs/ic_ac_ccs2.png';
import ic_ac_ccs1 from 'imgs/ic_ac_ccs1.png';
const MAPBOXTOKEN = process.env.VUE_APP_MAPBOXTOKEN;
export default {
    data() {
        return {
            lang: '',
            operatorList: {},
            center: {
                lat: 67.87946334072687,
                lng: 173.85862513198617
            },
            defaultZoomSize: 16,
            minZoomSize: 1.5,
            maxZoomSize: 22,
            icon: {
                normal: ic_info_green,
                abnormal: ic_info_red,
                maintenance: ic_info_brown,
                connectionLost: ic_info_gray,
                serviceUnavailable: ic_info_orange,
                deviceInfo: ic_device_info,
                charging: ic_charging,
                revenue: ic_revenue
            },
            filter: {
                operatorTypeId: '',
                chargeBoxId: ''
            },
            chargerBoxList: {
                isLoading: false,
                data: {},
                zoomSize: 16
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
            markers: {},
            markersOnScreen: {},
            MapBoxObject: null,
            mapboxLoadingPromise: {},
            currentPopUp: null,
            connectorIcon: {
                1: ic_ac_iec,
                2: ic_ac_tesla,
                3: ic_ac_sae,
                4: ic_ac_gbt,
                5: ic_ac_iec,
                6: ic_ac_tesla,
                7: ic_ac_chademo,
                8: ic_ac_ccs2,
                9: ic_ac_ccs1,
                10: ic_ac_gbt
            },
            timer: null
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
        this.initMapboxMap(()=> {
            that.fetchData();
            that.setTimer();
        });
        this.fetchChargerBoxList();
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    methods: {
        fetchData() {
            const that = this;
            let param = {};
            if (this.filter.operatorTypeId && this.filter.operatorTypeId !== 1) {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.chargeBoxId) {
                param.chargeBoxId = this.filter.chargeBoxId;
            }
            this.removeMapboxMarkers();
            this.chargeBoxData.data = {};
            this.chargeBoxData.isLoading = true;
            $HTTP_getChargeBoxListForMap(param).then((data) => {
                that.chargeBoxData.isLoading = false;
                if (!!data.success) {
                    this.statisticsInfo = Object.assign({}, data.chargeBoxStatusStatisticsInfo);
                    data.chargeBoxList.forEach(item => {
                        item.loc = {
                            lng: item.lon,
                            lat: item.lat
                        }
                        that.chargeBoxData.data[item.chargeBoxId] = Object.assign({}, item);
                    });
                    if (that.filter.chargeBoxId) {
                        this.removeMapboxClusters();
                        let chargeBoxId = data.chargeBoxList[0].chargeBoxId;
                        let marker = that.drawMapboxMarker(that.chargeBoxData.data[chargeBoxId]);
                        this.markersOnScreen[chargeBoxId] = marker;
                        that.MapBoxObject.setCenter([data.centerLocInfo.lon, data.centerLocInfo.lat]);
                        that.MapBoxObject.setZoom(data.centerLocInfo.zoomSize);
                        marker.addTo(that.MapBoxObject);
                    } else {
                        that.MapBoxObject.setCenter([data.centerLocInfo.lon, data.centerLocInfo.lat]);
                        that.MapBoxObject.setZoom(data.centerLocInfo.zoomSize);
                        that.drawMapboxClusters();
                    }
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log(err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchChargerBoxList(callBack) {
            const that = this;
            let param = {};
            if (this.filter.operatorTypeId) {
                param.operatorTypeId = (this.filter.operatorTypeId === 1)? '': this.filter.operatorTypeId;
            }
            this.chargerBoxList.isLoading = true;
            $HTTP_getChargeBoxListForSelect(param).then((data) => {
                this.chargerBoxList.isLoading = false;
                this.chargerBoxList.data = {};
                if (!!data.success) {
                    data.chargeBoxList.forEach(item => {
                        this.chargerBoxList.data[item.chargeBoxId] = item.chargeBoxName;
                    });
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                callBack && callBack();
            }).catch((err) => {
                console.log('chargeBoxList', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        initMapboxMap(callBack) {
            const that = this;
            mapboxgl.accessToken = MAPBOXTOKEN;
            this.MapBoxObject = new mapboxgl.Map({
                antialias: true,
                container: "mapboxBox",
                style: MapStyle,
                pitch: 60, //视野倾斜，0-60
                // bearing: -17, //视野旋转角度
                center: this.center,
                zoom: this.minZoomSize, // Less than 15 GetFeatureInfo does not work,
                minZoom: this.minZoomSize,
                maxZoom: this.maxZoomSize,
            })
            window.tb = new window.Threebox(
                this.MapBoxObject,
                this.MapBoxObject.getCanvas().getContext('webgl'),
                {
                    defaultLights: true,
                }
            );
            this.MapBoxObject.on("load", () => {
                that.mapLoadLayer();
                callBack && callBack();
            });
            this.MapBoxObject.on('click', 'clusters', function (e) {
                var features = that.MapBoxObject.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                var clusterId = features[0].properties.cluster_id;
                that.MapBoxObject.getSource('custom').getClusterExpansionZoom(
                    clusterId,
                    function (err, zoom) {
                        if (err) return;
                        that.MapBoxObject.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom: zoom,
                            // duration: 400
                        });
                        window.setTimeout(() => {
                            that.updateMarkers();
                        }, 800);
                    }
                );
            });
            this.MapBoxObject.on('mousemove', function() {
                if (that.MapBoxObject.getSource('custom') && that.MapBoxObject.getLayer('clusters')) {
                    that.updateMarkers();
                };
            });
            this.MapBoxObject.on('zoom', function () {
                // console.log(that.MapBoxObject.getZoom());
                if (that.MapBoxObject.getSource('custom') && that.MapBoxObject.getLayer('clusters')) {
                    that.updateMarkers();
                };
            });
        },
        mapLoadLayer() {
            const lastLayerId = getLastLayerId(this.MapBoxObject);
            this.MapBoxObject.addLayer(buildingsIn3D, lastLayerId);
        },
        removeMapboxMarkers() {
            for(let key in this.markers) {
                this.markers[key].remove();
            }
            for(let key in this.markersOnScreen) {
                this.markersOnScreen[key].remove();
            }
            this.markers = {};
            this.markersOnScreen = {};
        },
        removeMapboxClusters() {
            if (this.MapBoxObject.getLayer('clusters')) {
                this.MapBoxObject.removeLayer('clusters');
                this.MapBoxObject.removeLayer('cluster-count');
            }
        },
        updateMarkers() {
            let newMarkers = {};
            let features = this.MapBoxObject.querySourceFeatures('custom');
            features.forEach(feature => {
                let coords = feature.geometry.coordinates;
                let props = feature.properties;
                if (!props.cluster) {
                    let item = {
                        chargeBoxId: props.chargeBoxId,
                        loc: {
                            lng: props.lng,
                            lat: props.lat
                        },
                        chargeBoxStatus: props.chargeBoxStatus
                    };
                    var marker = this.markers[props.chargeBoxId];
                    if (!marker) {
                        marker = this.drawMapboxMarker(item);
                    }
                    if (!this.markersOnScreen[props.chargeBoxId]) marker.addTo(this.MapBoxObject);
                    newMarkers[props.chargeBoxId] = marker;
                }
            });
            for( let id in this.markersOnScreen) {
                if (!newMarkers[id]) {
                    this.markersOnScreen[id].remove();
                }
            }
            this.markersOnScreen = newMarkers;
        },
        drawMapboxMarker(item) {
            const that = this,
                  el = document.createElement('div');
            el.className = `marker pos${item.chargeBoxStatus}`;
            const option = {
                            element: el
                        },
                  marker = new mapboxgl.Marker(option)
                            .setLngLat(item.loc);
            marker.getElement().addEventListener('click', () => {
                that.getMarkerLoading(marker, true);
                that.getMapboxPosInfoHtml(item.chargeBoxId, (info) => {
                    that.getMarkerLoading(marker, false);
                    const option = {
                        offset: [20,-10],
                        anchor: 'left',
                        maxWidth: '300px'
                    };
                    const popup = new mapboxgl.Popup(option).setHTML(info);

                    marker.setPopup(popup);
                    // marker.togglePopup();
                    that.currentPopUp = popup;
                    that.currentPopUp.addTo(this.MapBoxObject);
                });
            });
            that.markers[item.chargeBoxId] = marker;
            return marker;
        },
        getMarkerLoading(marker, loadingBool) {
            const classList = marker.getElement().classList;
            classList.remove('loading');
            if(loadingBool) classList.add("loading");
        },
        getMapboxPosInfoHtml(chargeBoxId, callBack) {
            const that = this;
            $HTTP_getChargeBoxInfoForMap({ chargeBoxId: chargeBoxId }).then((data) => {
                if (data.success) {
                    const info = that.getPosInfoHtml(data.chargeBoxInfo)
                    return callBack(info);
                } else {
                    callBack('');
                    return that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('getMapboxPosInfoHtml', err)
                that.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        getPosInfoHtml: function(item) {
            const currency = $GLOBAL_CURRENCY[item.unitType || 1],
                  connectorHtml = this.getConnectorHtml(item.connectorList);
            let info = `<div class="info-tite">${item.chargeBoxName}</div>
                        <div class="info-msg">
                            <ul>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.deviceInfo}'>${i18n.t('chargingStation.chargePointID')}</div>
                                    <div class="item-msg">${item.chargeBoxId}</div>
                                </li>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.charging}'>${i18n.t('chargingStation.power')}</div>
                                    <div class="item-msg">${item.power}kW</div>

                                    <div class="item-title">${i18n.t('chargingStation.connector')}</div>
                                    <div class="item-msg">${connectorHtml}</div>

                                    <div class="item-title">${i18n.t('chargingStation.elecRate')}</div>
                                    <div class="item-msg">${i18n.t('chargingStation.onPeak') + ' ' + currency + item.onPeakElectricityRate + '/' + i18n.t('chargingStation.elecRateUnit')[item.onPeakElectricityRateType || 1]}</div>
                                    <div class="item-msg">${i18n.t('chargingStation.offPeak') + ' ' + currency + item.offPeakElectricityRate + '/' + i18n.t('chargingStation.elecRateUnit')[item.offPeakElectricityRateType || 1]}</div>

                                    <div class="item-title">${i18n.t('chargingStation.parkingRate')}</div>
                                    <div class="item-msg">${currency + item.parkingRate + '/' + i18n.t('chargingStation.elecRateUnit')[1]} </div>
                                </li>
                            </ul>
                        </div>`;
            return info;
        },
        getConnectorHtml(connectorList) {
            let info = '';
            connectorList.forEach((item, idx) => {
                info += '<div class="connector-obj">';
                switch(item.status) {
                    case 1:
                        info += `<span class="circle-number color1">${item.connectorId}</span>`;
                        break;
                    case 2:
                        info += `<span class="circle-number color2">${item.connectorId}</span>`;
                        break;
                    case 4:
                        info += `<span class="circle-number color2">${item.connectorId}</span>`;
                        break;
                    case 5:
                        info += `<span class="circle-number color5">${item.connectorId}</span>`;
                        break;
                    case 6:
                        info += `<span class="circle-number color4">${item.connectorId}</span>`;
                        break;
                    case 3:
                        info += `<span class="circular">
                                    <div class="color6"></div>
                                    <div class="number">${item.connectorId}</div>
                                </span>`;
                        break;
                    default:
                        info += `<span class="circle-number color0">${item.connectorId}</span>`;
                }
                info +=`<div class="imgItem"><img src="${this.connectorIcon[item.connectorTypeId]}"></div>
                        </div>`
            });
            return info;
        },
        drawMapboxClusters() {
            const that = this;
            const geoJson = {
                type: 'FeatureCollection',
                features: []
            };
            const setOneFeature = (key, obj) => {
                const { lat, lng } = obj.loc;
                return {
                    type: 'Feature',
                    properties: {
                        chargeBoxId: key,
                        lng: lng,
                        lat: lat,
                        chargeBoxStatus: obj.chargeBoxStatus
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [lng, lat, 0.0]
                    }
                }
            }
            const mySource = this.MapBoxObject.getSource('custom');
            for(let key in this.chargeBoxData.data) {
                const feature = setOneFeature(key, this.chargeBoxData.data[key]);
                geoJson.features.push(feature);
            }
            if (!mySource) {
                this.MapBoxObject.addSource('custom', {
                    type: 'geojson',
                    data: geoJson,
                    cluster: true,
                    // clusterMaxZoom: 18,
                    clusterRadius: 50,
                    clusterMinPoints: 5
                });
            } else {
                mySource.setData(geoJson);
            }
            if (!this.MapBoxObject.getLayer('clusters')) {
                this.MapBoxObject.addLayer(clusters);
                this.MapBoxObject.addLayer(clusterCount);
            }
            window.setTimeout(() => {
                that.updateMarkers();
            }, 1500);
        },
        handleOperatorChanged() {
            const that = this;
            if (that.currentPopUp) {
                that.currentPopUp.remove();
            }
            this.fetchChargerBoxList(()=> {
                that.updateData();
            });
        },
        updateData() {
            this.fetchData();
            clearInterval(this.timer);
            this.setTimer();

        },
        setTimer() {
            const that = this;
            this.timer = setInterval(() => {
                that.fetchData();
            }, 1000 * 60);
        },
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
#mapboxBox {
    width: calc(100vw - 208px);
    /* height: calc(95.2vh - 68px - 58px - 2vh); */
    height: calc(100vh - 68px);
    position: absolute;
    background: #a1c1fb;
    border-top-left-radius: 20px;
    top: 68px;
    left: 208px;
    z-index: 0;
    /* box-shadow: 0 1px 8px 0 rgba(20, 46, 110, 0.10); */
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
</style>