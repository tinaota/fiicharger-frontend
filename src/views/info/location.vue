<template>
    <div class="mainctrl">
        <div id="mapboxBox" v-loading="chargeBoxData.isLoading" />
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('menu.location') }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="loc-filter">
            <el-select
                class="select-small large"
                v-model="filter.operatorTypeId"
                :placeholder="$t('general.operator')"
                @change="handleOperatorChanged()"
                clearable>
                <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
            </el-select>
            <el-select
                class="select-small large"
                v-model="filter.chargeBoxId"
                :placeholder="$t('menu.chargePoint')"
                v-loading="chargerBoxList.isLoading"
                @change="fetchData()"
                clearable
                filterable>
                <el-option v-for="(item, key) in chargerBoxList.data" :label="item" :key="key" :value="key"></el-option>
            </el-select>
        </div>
        <div class="hint-bar">
            <div class="item"><img :src="icon.normal"><span>{{$t('general.available')}}</span></div>
            <div class="item"><img :src="icon.serviceUnavailable"><span>{{$t('general.unavailable')}}</span></div>
            <div class="item"><img :src="icon.maintenance"><span>{{$t('general.maintenance')}}</span></div>
            <div class="item"><img :src="icon.abnormal"><span>{{$t('general.alert')}}</span></div>
            <div class="item"><img :src="icon.connectionLost"><span>{{$t('general.connectionLost')}}</span></div>
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
const MAPBOXTOKEN = process.env.VUE_APP_MAPBOXTOKEN;
export default {
    data() {
        return {
            lang: '',
            operatorList: {
                1: i18n.t('general.all'),
                2: "MidwestFiber",
                3: "APT"
            },
            center: {
                lat: 67.87946334072687,
                lng: 173.85862513198617
            },
            defaultZoomSize: 16,
            minZoomSize: 1.5,
            maxZoomSize: 22,
            icon: {
                normal: require("imgs/ic_info_green.png"),
                abnormal: require("imgs/ic_info_red.png"),
                maintenance: require("imgs/ic_info_brown.png"),
                connectionLost: require("imgs/ic_info_gray.png"),
                serviceUnavailable: require("imgs/ic_info_orange.png"),
                deviceInfo: require("imgs/ic_device_info.png"),
                charging: require("imgs/ic_charging.png"),
                revenue: require("imgs/ic_revenue.png")
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
            markers: {},
            markersOnScreen: {},
            MapBoxObject: null,
            mapboxLoadingPromise: {},
            currentPopUp: null
        }
    },
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        const that = this;
        let halfHintBarWidth = this.$jQuery(".hint-bar").width()/2 + 12;
        this.$jQuery(".hint-bar").css('left', `calc(50vw + 104px -  ${halfHintBarWidth}px)`);
        this.initMapboxMap(()=> {
            that.fetchData();
        });
        this.fetchChargerBoxList();
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
                        // that.updateMarkers();
                        window.setTimeout(() => {
                            that.updateMarkers();
                        }, 800);
                    }
                );
            });
            this.MapBoxObject.on('mousemove', function() {
                if (that.MapBoxObject.getSource('custom') && that.MapBoxObject.isSourceLoaded('custom')) {
                    that.updateMarkers();
                };
            });
            this.MapBoxObject.on('zoom', function () {
                if (that.MapBoxObject.getSource('custom') && that.MapBoxObject.isSourceLoaded('custom')) {
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
                        maxWidth: '360px'
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
            let info = `<div class="info-tite">${item.chargeBoxName}</div>
                        <div class="info-msg">
                            <ul>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.deviceInfo}'>${i18n.t('chargingStation.chargePointID')}</div>
                                    <div class="item-msg">${item.chargeBoxId}</div>
                                </li>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.charging}'>${i18n.t('chargingStation.powerUsed')}</div>
                                    <div class="item-msg">${item.powerUsage}kWh</div>
                                </li>
                            </ul>
                        </div>`;
                        // <li>
                        //             <div class="item-title-img"><img src='${this.icon.revenue}'>${i18n.t('dashboard.revenue')}</div>
                        //             <div class="item-msg">${item.revenue}</div>
                        //         </li>
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
                that.fetchData();
            });
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
#mapboxBox {
    width: calc(100vw - 208px);
    /* height: calc(95.2vh - 68px - 58px - 2vh); */
    height: calc(100vh - 68px);
    position: absolute;
    background: #a1c1fb;
    top: 68px;
    left: 208px;
    z-index: 0;
    /* box-shadow: 0 1px 8px 0 rgba(20, 46, 110, 0.10); */
}
.hint-bar {
    position:absolute;
    /* bottom: calc(2.4vh + 2vh); */
    bottom: calc(2.5vh);
    width: auto;
    height: auto;
    padding: 10px 18px;
    background-color: #E6EEF8;
    box-shadow: 0 1px 8px 0 rgba(20, 46, 110, 0.10);
    border-radius: 30px;
    vertical-align: middle;
    .item {
        display: inline-block;
        vertical-align: middle;
        height: 24px;
        span {
            display: inline-block;
            vertical-align: bottom;
            letter-spacing: 0;
            height: 24px;
            line-height: 24px;
            margin-left: 10px;
            color: #151E25;
            font-size: 1.125rem;
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