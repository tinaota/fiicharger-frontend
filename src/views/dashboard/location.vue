<template>
    <div class="mainctrl">
        <el-select
            class="select-small dark-header"
            v-model="curOperator"
            :placeholder="$t('general.operator')"
            @change="changeOption"
            clearable>
            <el-option v-for="item in operatorList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <br/>
        <div id="mapboxBox" />
        <el-autocomplete
            v-model="searchInput"
            class="input-round"
            :placeholder="$t('general.search')"
            prefix-icon="el-icon-search"
            :fetch-suggestions="querySearch"
            :trigger-on-focus="false"
            @select="handleSearch">
        </el-autocomplete>
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
import "@/styles/map.scss"
import MapData from "@/tmpData/mapData";
const MAPBOXTOKEN = process.env.VUE_APP_MAPBOXTOKEN
export default {
    data() {
        return {
            curOperator: '',
            operatorList: [],
            center: {
                lat: 42.677811124442854,
                lng: -87.91695010215827
            },
            zoom: 16,
            searchInput: "",
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
            searchData: {},
            chargeBoxData: {},
            markers: [],
            MapBoxObject: null,
            mapboxLoadingPromise: {}
        }
    },
    mounted() {
        let halfHintBarWidth = this.$jQuery(".hint-bar").width()/2 + 12;
        this.$jQuery(".hint-bar").css('left', `calc(50vw + 104px -  ${halfHintBarWidth}px)`);
        this.initMapboxMap();
        this.fetchData();
    },
    methods: {
        changeOption() {
            // console.log(this.curOperator);
        },
        initMapboxMap() {
            mapboxgl.accessToken = MAPBOXTOKEN;
            this.MapBoxObject = new mapboxgl.Map({
                antialias: true,
                container: "mapboxBox",
                style: MapStyle,
                pitch: 60, //视野倾斜，0-60
                // bearing: -17, //视野旋转角度
                center: this.center,
                zoom: this.zoom, // Less than 15 GetFeatureInfo does not work
                minZoom: 11,
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
                    this.mapLoadLayer()
                    resolve()
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
            const lastLayerId = getLastLayerId(this.MapBoxObject)
            this.MapBoxObject.addLayer(buildingsIn3D, lastLayerId)
        },
        removeMapboxMarkers() {
            this.markers && this.markers.forEach(marker => {
                marker.remove()
            })
            this.markers = [];
        },
        drawMarkers() {
            if(this.markers.length === 0) {
                for(let key in this.chargeBoxData) {
                    this.drawMapboxMarker(this.chargeBoxData[key]);
                }
            }
        },
        drawMapboxMarker(item) {
            const that = this,
                  el = document.createElement('div');
            el.className = `marker pos${item.status}`;
            const option = {
                            element: el,
                        },
                  marker = new mapboxgl.Marker(option)
                            .setLngLat(item.loc)
                            .addTo(this.MapBoxObject);
            marker.getElement().addEventListener('click', () => {
                that.getMarkerLoading(marker, true);
                that.getMapboxPosInfoHtml(item, (info) => {
                    that.getMarkerLoading(marker, false);
                    const option = {
                        offset: 25,
                        anchor: 'left',
                        maxWidth: '256px'
                    };
                    const popup = new mapboxgl.Popup(option).setHTML(info)
                    marker.setPopup(popup);
                    marker.togglePopup();
                    marker.togglePopup();
                });
            });
            that.markers.push(marker);
        },
        getMarkerLoading(marker, loadingBool) {
            const classList = marker.getElement().classList;
            classList.remove('loading');
            if(loadingBool) classList.add("loading");
        },
        getMapboxPosInfoHtml(item, callBack) {
            //之後call api
            const info = this.getPosInfoHtml(item);
            return callBack(info);
        },
        getPosInfoHtml: function(item) {
            let info = `<div class="info-tite">${item.stationName}</div>
                        <div class="info-msg">
                            <ul>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.deviceInfo}'>${i18n.t('chargingStation.chargeBoxID')}</div>
                                    <div class="item-msg">${item.chargeBoxId}</div>
                                </li>
                                <li>
                                    <div class="item-title-img"><img src='${this.icon.charging}'>${i18n.t('chargingStation.powerUsed')}</div>
                                    <div class="item-msg">${item.power}</div>
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
            this.searchData = MapData.search;
            this.operatorList = MapData.operatorList.slice();
            // this.curOperator = this.operatorList[0];
            this.chargeBoxData = {};
            MapData.chargeBoxList.forEach(item => {
                this.chargeBoxData[item.chargeBoxId] = Object.assign({}, item);
                this.drawMapboxMarker(item);
            });
            this.drawMapboxClusters();
        },
        drawMapboxClusters() {
            const that = this
            const geoJson = {
                type: 'FeatureCollection',
                features: []
            }
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
            Object.keys(this.chargeBoxData).map(key => {
                const obj = setOneFeature(key, this.chargeBoxData[key])
                geoJson.features.push(obj)
            })
            this.mapboxLoadingPromise.then(() => {
                this.MapBoxObject.addSource('poles', {
                    type: 'geojson',
                    data: geoJson,
                    cluster: true,
                    clusterMaxZoom: 14,
                    clusterRadius: 50
                });
                this.MapBoxObject.addLayer(clusters)
                this.MapBoxObject.addLayer(clusterCount)
            })
            this.MapBoxObject.on('click', 'clusters', function (e) {
                var features = that.MapBoxObject.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                var clusterId = features[0].properties.cluster_id;
                that.MapBoxObject.getSource('poles').getClusterExpansionZoom(
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
        querySearch(queryString, cb) {
            var keys = Object.keys(this.searchData).map((key, idx) => {
                return {
                    value: key,
                    name: idx,
                    };
            });
            var results = queryString ? keys.filter(this.createFilter(queryString)):keys;
            cb(results);
        },
        createFilter(queryString) {
            return (key) => {
                return (key.value.toLowerCase().indexOf(queryString.toLowerCase()) >= 0);
            };
        },
        handleSearch(item) {
            if (this.searchData[item.value] && this.searchData[item.value].pos) {
                this.MapBoxObject.setCenter(this.searchData[item.value].pos);
                this.MapBoxObject.setZoom(this.searchData[item.value].zoom);
            }
        },
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl {
    padding: 0;
}
#mapboxBox {
    width: 100%;
    height: calc(100vh - 68px - 58px);
}
.el-autocomplete {
    width: 25vw;
    position:absolute;
    top: calc(58px + 68px + 4%);
    left: calc(208px + 3%);
}
.hint-bar {
    position:absolute;
    bottom: 2vh;
    width: auto;
    height: auto;
    padding: 10px 18px;
    background-color: #1C1C1E;
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
            color: #9EA7AC;
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