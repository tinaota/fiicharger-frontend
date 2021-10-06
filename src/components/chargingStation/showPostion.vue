<template>
    <el-dialog
        :title="$t('chargingStation.itemPosition', { item: itemId })"
        width="480px"
        :visible.sync="visible"
        :show-close="false"
        @close="closeDialog()">
        <div id="mapboxBox" />
    </el-dialog>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { buildingsIn3D, getLastLayerId, imgIconDefGeo } from '@/assets/js/appConfig.js'
import MapStyle from '@/assets/js/mapStyle.js'
import 'threebox-plugin/dist/threebox';
import "@/styles/map.scss"
import bluePosImg from 'imgs/ic_blue_dot.png';
const MAPBOXTOKEN = process.env.VUE_APP_MAPBOXTOKEN
export default {
    props: {
        itemId: String,
        show: Boolean,
        position: {
            type: Object,
            default: function() {
                return {
                    lat: '',
                    lng: ''
                };
            }
        }
    },
    data() {
        return {
            visible: false,
            zoom: 16,
            MapBoxObject: null,
            nowMarker: {},
        }
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                if (that.visible) {
                    that.$nextTick(() => {
                        that.initMapboxMap();
                    });
                }
            }
        }
    },
    methods: {
        initMapboxMap() {
            const that = this;
            mapboxgl.accessToken = MAPBOXTOKEN
            this.MapBoxObject = new mapboxgl.Map({
                antialias: true,
                container: "mapboxBox",
                style: MapStyle,
                // pitch: 0, //视野倾斜，0-60
                // bearing: -17, //视野旋转角度
                center: this.position,
                zoom: this.zoom, // Less than 15 GetFeatureInfo does not work
                minZoom: 10,
                maxZoom: 19,
            })
            this.MapBoxObject.on("load", () => {
                const lastLayerId = getLastLayerId(that.MapBoxObject);
                that.MapBoxObject.addLayer(buildingsIn3D, lastLayerId);
                that.drawMapboxMarker();
                // that.loadImg();
            })
        },
        drawMapboxMarker() {
            const that = this;
            const el = document.createElement('div');
            el.className = `marker pos0`;
            const option = {
                            element: el
                        };
            this.nowMarker = new mapboxgl.Marker(option)
                            .setLngLat(this.position)
                            .addTo(this.MapBoxObject);
        },
        loadImg() { //位子歪掉了
            const that = this;
            that.MapBoxObject.loadImage(bluePosImg,
                (error, image) => {
                    if (error) {
                        console.lat(error);
                        throw error
                    };
                    that.MapBoxObject.addImage('bluePosMarker', image);
                    const imgIconGeo = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [this.position.lng, this.position.lat, 0.0]
                        }
                    };
                    const geoJson = {
                        type: 'FeatureCollection',
                        features: [imgIconGeo]
                    };
                    that.MapBoxObject.addSource('marker', {
                        type: 'geojson',
                        data: geoJson
                    });
                    // Add a layer to use the image to represent the data.
                    that.MapBoxObject.addLayer({
                        id: 'markerLayer',
                        type: 'symbol',
                        source: 'marker', // reference the data source
                        layout: {
                            'icon-image': 'bluePosMarker', // reference the image
                            'icon-size': 1,
                            'icon-anchor': 'bottom'
                        }
                    });
                }
            );
        },
        closeDialog() {
            this.$emit('close', false);
        }
    }
}
</script>
<style lang = "scss" scoped>
#mapboxBox {
    width: 100%;
    height: 400px;
    margin-bottom: 2vh;
}
</style>