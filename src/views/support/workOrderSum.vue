<template>
    <div class="scroll">
        <div class="mainctrl">
            <div id="mapboxBox" v-loading="chargeBoxData.isLoading" />
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.support') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.workOrder') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.summary') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <el-tabs v-model="active" @tab-click="handleTabClick" class="work-order-tabs">
                <el-tab-pane :label="$t('menu.summary')" name="summary"></el-tab-pane>
                <el-tab-pane :label="$t('menu.history')" name="history"></el-tab-pane>
            </el-tabs>
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
                    @change="handleMapCenter()"
                    filterable
                    clearable
                    style="width: 200px">
                    <el-option v-for="(item, key) in chargerBoxList.data" :label="item" :key="key" :value="key"></el-option>
                </el-select>
            </div>
            <div class="work-order-sum card">
                <div class="header">{{ $t('support.nWorkOrders') }}</div>
                <div class="info">
                    <div class="item assignedQueue">
                        <div class="label">{{ $t('support.assignedQueue') }}</div>
                        <div class="num">{{ numWorkOrder.assignedQueue }}</div>
                    </div>
                    <div class="item inprocess">
                        <div class="label">{{ $t('support.inprocess') }}</div>
                        <div class="num">{{ numWorkOrder.inprocess }}</div>
                    </div>
                    <div class="item validating">
                        <div class="label">{{ $t('support.validating') }}</div>
                        <div class="num">{{ numWorkOrder.validating }}</div>
                    </div>
                    <div class="item total">
                        <div class="label">{{ $t('support.total') }}</div>
                        <div class="num">{{ numWorkOrder.unsolved + " / " + numWorkOrder.accumulated }}</div>
                        <div class="sub-label">{{ $t('support.unsolved') + ' / ' + $t('support.accumulated') }}</div>
                    </div>
                </div>
            </div>
            <div class="work-order-list card">
                <div class="header">{{ $t('support.workOrdersList') }}</div>
                <el-tabs v-model="workOrdersList.active" type="card" class="work-order-list-tabs" :stretch="false">
                    <el-tab-pane :label="$t('support.assignedQueue')+' '+numWorkOrder.assignedQueue" name="assignedQueue">
                        <div class="tab-pane-content">
                            <WorkerOrderInfo v-for="(item, idx) in workOrdersList.data.assignedQueue" :key="idx" :dataObj="item" @setCenter="setMapCenter"></WorkerOrderInfo>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane :label="$t('support.inprocess')+' '+numWorkOrder.inprocess" name="inprocess">
                        <div class="tab-pane-content">
                            <WorkerOrderInfo v-for="(item, idx) in workOrdersList.data.inprocess" :key="idx" :dataObj="item" @setCenter="setMapCenter"></WorkerOrderInfo>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane :label="$t('support.validating')+' '+numWorkOrder.validating" name="validating">
                        <div class="tab-pane-content">
                            <WorkerOrderInfo v-for="(item, idx) in workOrdersList.data.validating" :key="idx" :dataObj="item" @setCenter="setMapCenter"></WorkerOrderInfo>
                        </div>
                    </el-tab-pane>
                </el-tabs>
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
                    <span class="text">{{$t('general.inUse')}}</span>
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
                    <span class="text">{{$t('general.unavailable')}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SumData from "@/tmpData/workOrderSumData";
import { $HTTP_getChargeBoxListForSelect } from "@/api/api";
import { $GLOBAL_CURRENCY } from '@/utils/global';
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { buildingsIn3D, clusters, clusterCount, getLastLayerId } from '@/assets/js/appConfig.js'
import MapStyle from '@/assets/js/mapStyle.js'
import 'threebox-plugin/dist/threebox';
import "@/styles/map.scss";
import { setScrollBar } from "@/utils/function";
import WorkerOrderInfo from "@/components/support/workerOrderInfo";
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
import ic_dc_iec from 'imgs/ic_dc_iec.png';
import ic_dc_tesla from 'imgs/ic_dc_tesla.png';
import ic_dc_chademo from 'imgs/ic_dc_chademo.png';
import ic_dc_ccs2 from 'imgs/ic_dc_ccs2.png';
import ic_dc_ccs1 from 'imgs/ic_dc_ccs1.png';
import ic_dc_gbt from 'imgs/ic_dc_gbt.png';
const MAPBOXTOKEN = process.env.VUE_APP_MAPBOXTOKEN;
export default {
    components: {
        WorkerOrderInfo
    },
    data() {
        return {
            lang: '',
            active: 'summary',
            operatorList: {},
            center: {
                lat: 69.79939371063055,
                lng: -170.23546021893583
            },
            defaultZoomSize: 13.4,
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
                data: {}
            },
            chargeBoxData: {
                isLoading: false,
                data: {}
            },
            statisticsInfo: {
                availableCount: 0,
                unavailableCount: 0,
                maintenanceCount: 0,
                alertCount: 0,
                connectionLostCount: 0
            },
            numWorkOrder: {
                assignedQueue: 0,
                inprocess: 0,
                validating: 0,
                unsolved: 0,
                accumulated: 0
            },
            workOrdersList: {
                active: 'assignedQueue',
                data: {
                    assignedQueue: [],
                    inprocess: [],
                    validating: [],
                }
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
                5: ic_dc_iec,
                6: ic_dc_tesla,
                7: ic_dc_chademo,
                8: ic_dc_ccs2,
                9: ic_dc_ccs1,
                10: ic_dc_gbt
            }
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        const that = this;
        let halfHintBarWidth = this.$jQuery(".hint-bar").width()/2 + 12;
        this.$jQuery(".hint-bar").css('left', `calc(50% -  ${halfHintBarWidth}px)`);
        this.initMapboxMap(()=> {
            that.fetchData();
        });
        this.fetchChargerBoxList();
    },
    methods: {
        fetchData() {
            const that = this;
            this.numWorkOrder = Object.assign({}, SumData.numWorkOrder);
            this.workOrdersList.data = Object.assign({}, SumData.workOrderList);
            this.statisticsInfo = Object.assign({}, SumData.statisticsInfo);
            this.chargeBoxData.data = Object.assign({}, SumData.mapInfo);
            this.drawMapboxClusters();
            this.$nextTick(()=> {
                let workOrderListHeight = that.$jQuery(".work-order-list-tabs").height(),
                    elTabsHeaderHeight = that.$jQuery(".work-order-list-tabs .el-tabs__header").height() + 6,
                    elTabPaneHeight = workOrderListHeight - elTabsHeaderHeight;
                that.$jQuery(".work-order-list .tab-pane-content").css('max-height', elTabPaneHeight + 'px');
                that.$jQuery(".work-order-list .tab-pane-content").length > 0 && that.$jQuery(".work-order-list .tab-pane-content").mCustomScrollbar('destroy');
                setScrollBar(".work-order-list .tab-pane-content", that);
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
        handleTabClick(tab, event) {
            if (this.active === 'history') {
                this.$router.push({ path: "/workOrder/history" }).catch();
            }
        },
        handleOperatorChanged() {
            const that = this;
            if (that.currentPopUp) {
                that.currentPopUp.remove();
            }
            this.fetchChargerBoxList(()=> {
                // that.fetchData();
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
                zoom: 1.5, // Less than 15 GetFeatureInfo does not work,
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
                            duration: 400
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
                // that.getMarkerLoading(marker, true);
                that.getMapboxPosInfoHtml(item.chargeBoxId, (info) => {
                    // that.getMarkerLoading(marker, false);
                    const option = {
                        offset: [20,-10],
                        anchor: 'left',
                        maxWidth: '300px'
                    };
                    const popup = new mapboxgl.Popup(option).setHTML(info);

                    marker.setPopup(popup).addTo(this.MapBoxObject)
                    // marker.togglePopup();
                    that.currentPopUp = popup;
                    // that.currentPopUp.addTo(this.MapBoxObject);
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
            // const that = this;
            // $HTTP_getChargeBoxInfoForMap({ chargeBoxId: chargeBoxId }).then((data) => {
            //     if (data.success) {
            //         const info = that.getPosInfoHtml(data.chargeBoxInfo)
            //         return callBack(info);
            //     } else {
            //         callBack('');
            //         return that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
            //     }
            // }).catch((err) => {
            //     console.log('getMapboxPosInfoHtml', err)
            //     that.$message({ type: "warning", message: i18n.t("error_network") });
            // });
            const that = this,
                  data = that.chargeBoxData.data[chargeBoxId];
            let info = "";
            if (data.chargeBoxStatus === 3 || data.chargeBoxStatus === 4) {
                info = that.getPosWorkOrderHtml(data);
            } else {
                info = that.getPosInfoHtml(data);
            }
            callBack && callBack(info);
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
        getPosWorkOrderHtml: function(item) {
            let info = `<div class="info-tite">${item.chargeBoxName}</div>
                        <div class="info-msg">
                            <ul>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.deviceInfo}'>${i18n.t('chargingStation.chargePointID')}</div>
                                    <div class="item-msg">${item.chargeBoxId}</div>
                                </li>`;
            item.workOrderList.forEach((data,idx) => {
                if (idx) {
                    info+= `<li>
                                <div class="item-msg">${data.workOrderCode}</div>
                                <div class="item-msg">${data.time} </div>
                                <div class="item-msg">${data.msg} </div>
                            </li>`;
                } else {
                    info+= `<li>
                                <div class="item-title">${i18n.t('support.workOrdersList')}</div>
                                <div class="item-msg">${data.workOrderCode}</div>
                                <div class="item-msg">${data.time} </div>
                                <div class="item-msg">${data.msg} </div>
                            </li>`;
                }
            });

            info += `</ul></div>`;
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
            // window.setTimeout(() => {
                that.updateMarkers();
            // }, 1000);
        },
        handleMapCenter() {
            const that = this,
                  loc = this.chargeBoxData.data[this.filter.chargeBoxId].loc;
            that.MapBoxObject.easeTo({
                            center: loc,
                            zoom: 18,
                            duration: 400
                        });
            window.setTimeout(() => {
                that.updateMarkers();
            }, 800);
        },
        setMapCenter(locString) {
            const that = this,
                  loc = JSON.parse(locString);
            that.MapBoxObject.setCenter(loc);
            that.MapBoxObject.easeTo({
                            center: loc,
                            zoom: 18,
                            duration: 400
                        });
            window.setTimeout(() => {
                that.updateMarkers();
            }, 800);
        }
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl {
    position: relative;
    width: 100%;
    height: calc(100vh - 68px);
    padding: 0;
    #mapboxBox {
        position: absolute;
        width: calc(100vw - 208px);
        height: calc(100vh - 68px);
        background: #a1c1fb;
        top: 0;
        left: 0;
        z-index: 0;
    }
    .el-breadcrumb {
        display: block;
        position: absolute;
        top: 2.4vh;
        left: 1.6vw;
    }
    .el-tabs.work-order-tabs {
        position: absolute;
        top: calc(4.4vh + 16px);
        left: 1.6vw;
        width: calc(100% - 3.2vw);
    }
    .loc-filter {
        position: absolute;
        top: calc(4.4vh + 16px + 54px);
        left: 1.6vw;
        width: calc(35% - 1.6vw);
    }
    .card {
        box-sizing: border-box;
        padding: 14px;
        background: rgba(230,238,248,0.90);
        border-radius: 12px;
        box-shadow: 0 1px 4px 0 rgba(21,34,50,0.08);
        .header {
            font-size: 1rem;
            font-weight: bold;
            color: #151E25;
            text-align: center;
            margin-bottom: 12px;
        }
    }
    .work-order-sum {
        position: absolute;
        top: calc(4.4vh + 16px + 54px);
        left: calc(33% + 2%);
        width: 35%;
        .info {
            .item {
                display: inline-block;
                vertical-align: top;
                .label {
                    font-size: 0.875rem;
                    color: #525E69;
                    letter-spacing: 0;
                    margin-bottom: 4px;
                }
                .num {
                    font-size: 1.5rem;
                    color: #151E25;
                    letter-spacing: 0;
                }
                .sub-label {
                    font-size: 0.75rem;
                    color: #525E69;
                    letter-spacing: -0.13px;
                }
            }
            .assignedQueue {
                width: 24%;
            }
            .inprocess,
            .validating {
                width: 22%;
            }
            .total {
                width: 28%;
            }
        }
    }
    .work-order-list {
        position: absolute;
        top: calc(4.4vh + 16px + 54px);
        right: 1.6vw;
        width: 27%;
        height: calc(100% - 8.4vh - 70px - 44px);
    }
    .hint-bar {
        position: absolute;
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
}
</style>