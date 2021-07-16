<template>
    <div class="mainctrl">
        <el-breadcrumb separator="/">
            <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $t('menu.location') }}</el-breadcrumb-item>
        </el-breadcrumb>
        <br/>
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
        <br/>
        <div id="mapboxBox" v-loading="chargeBoxData.isLoading" />
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
            operatorList: {
                1: i18n.t('general.all'),
                2: "MidwestFiber",
                3: "APT"
            },
            center: {
                lat: 42.677811124442854,
                lng: -87.91695010215827
            },
            defaultZoomSize: 16,
            minZoomSize: 1.5,
            maxZoomSize: 18,
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
            MapBoxObject: null,
            mapboxLoadingPromise: {},
            currentPopUp: null
        }
    },
    mounted() {
        let halfHintBarWidth = this.$jQuery(".hint-bar").width()/2 + 12;
        this.$jQuery(".hint-bar").css('left', `calc(50vw + 104px -  ${halfHintBarWidth}px)`);
        this.initMapboxMap();
        this.fetchData();
        this.fetchChargerBoxList();
    },
    methods: {
        initMapboxMap(callBack) {
            mapboxgl.accessToken = MAPBOXTOKEN;
            this.MapBoxObject = new mapboxgl.Map({
                antialias: true,
                container: "mapboxBox",
                style: MapStyle,
                pitch: 60, //视野倾斜，0-60
                // bearing: -17, //视野旋转角度
                center: this.center,
                zoom: this.defaultZoomSize, // Less than 15 GetFeatureInfo does not work,
                minZoom: this.minZoomSize,
                maxZoom: 22,
            })
            window.tb = new window.Threebox(
                this.MapBoxObject,
                this.MapBoxObject.getCanvas().getContext('webgl'),
                {
                    defaultLights: true,
                }
            );
            this.mapboxLoadingPromise = new Promise(resolve => {
                this.MapBoxObject.on("load", () => {
                    this.mapLoadLayer();
                    resolve();
                })
            })
            // zoomlevel:
            // small：  18<level<=21 model + marker
            // middle： 15<level<=18 || >21 marker
            // large:   <=15 cluster
            let zoomLevel = 'large'; //s、m、l
            const that = this;
            this.MapBoxObject.on('zoom', () => {
                const nowZoom = this.MapBoxObject.getZoom();
                let nowZoomlevel = '';
                if (nowZoom <= 15) {
                    nowZoomlevel = 'large';
                } else {
                    nowZoomlevel = 'middle';
                }
                if (zoomLevel !== nowZoomlevel) {
                    switch(nowZoomlevel) {
                        case 'large':
                            that.removeMapboxMarkers();
                            break;
                        case 'middle':
                            that.drawMarkers();
                            break;
                    }
                    zoomLevel = nowZoomlevel;
                }
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
            this.markers = {};
        },
        drawMarkers() {
            if(Object.keys(this.markers.length === 0)) {
                for(let key in this.chargeBoxData.data) {
                    this.drawMapboxMarker(this.chargeBoxData.data[key]);
                }
            }
        },
        drawMapboxMarker(item) {
            const that = this,
                  el = document.createElement('div');
            el.className = `marker pos${item.chargeBoxStatus}`;
            const option = {
                            element: el
                        },
                  marker = new mapboxgl.Marker(option)
                            .setLngLat(item.loc)
                            .addTo(this.MapBoxObject);
            marker.getElement().addEventListener('click', () => {
                that.getMarkerLoading(marker, true);
                that.getMapboxPosInfoHtml(item.chargeBoxId, (info) => {
                    that.getMarkerLoading(marker, false);
                    const option = {
                        offset: [20,-10],
                        anchor: 'left',
                        maxWidth: '256px'
                    };
                    const popup = new mapboxgl.Popup(option).setHTML(info);

                    marker.setPopup(popup);
                    // marker.togglePopup();
                    that.currentPopUp = popup;
                    that.currentPopUp.addTo(this.MapBoxObject);
                });
            });
            that.markers[item.chargeBoxId] = marker;
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
                        that.drawMapboxMarker(item);
                        console.log('fetchData drawMapboxMarker')
                    });
                    that.drawMapboxClusters();
                    if (!that.filter.chargeBoxId) {
                        that.removeMapboxMarkers();
                    }
                    that.MapBoxObject.setCenter([data.centerLocInfo.lon, data.centerLocInfo.lat]);
                    that.MapBoxObject.setZoom(data.centerLocInfo.zoomSize);
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
        drawMapboxClusters() {
            const that = this
            const geoJson = {
                type: 'FeatureCollection',
                features: []
            };
            const setOneFeature = (key, obj) => {
                const { lat, lng } = obj.loc
                return {
                    type: 'Feature',
                    properties: {
                        id: key
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [lng, lat, 0.0]
                    }
                }
            }
            Object.keys(this.chargeBoxData.data).map(key => {
                const obj = setOneFeature(key, this.chargeBoxData.data[key])
                geoJson.features.push(obj)
            })
            this.mapboxLoadingPromise.then(() => {
                if (!this.MapBoxObject.getSource('custom')) {
                    this.MapBoxObject.addSource('custom', {
                    type: 'geojson',
                        data: geoJson,
                        cluster: true,
                        clusterMaxZoom: 14,
                        clusterRadius: 50
                    });
                    this.MapBoxObject.addLayer(clusters);
                    this.MapBoxObject.addLayer(clusterCount);
                }
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
                            zoom: zoom
                        });
                    }
                );
            });
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
    /* padding: 0; */
}
#mapboxBox {
    width: 100%;
    height: calc(95.2vh - 68px - 54px - 2vh);
    position: relative;
    background: #a1c1fb;
    box-shadow: 0 1px 8px 0 rgba(20, 46, 110, 0.10);
}
.hint-bar {
    position:absolute;
    bottom: calc(2.4vh + 2vh);
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