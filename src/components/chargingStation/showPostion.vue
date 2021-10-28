<template>
    <el-dialog
        :title="$t('chargingStation.itemPosition', { item: itemId })"
        width="480px"
        :visible.sync="visible"
        :show-close="false"
        @close="closeDialog()">
        <div id="map-container" class="google-map"></div>
    </el-dialog>
</template>

<script>
import bluePosImg from 'imgs/ic_blue_dot.png';
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
            MapBoxObject: null,
            nowMarker: {},
            map: null,
            mapInfo: {
                initMap: true,
                zoom: 17,
                minZoom: 12,
                maxZoom: 20
            },
            marker: null
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
                        that.initMap();
                        that.drawMarker();
                    });
                }
            }
        }
    },
    beforeDestroy() {
        this.marker.setMap(null);
    },
    methods: {
        initMap() {
            this.map = new google.maps.Map(document.getElementById('map-container'), {
                                center: this.position,
                                zoom: this.mapInfo.zoom,
                                minZoom: this.mapInfo.minZoom,
                                maxZoom: this.mapInfo.maxZoom,
                                streetViewControl: false, //設定是否呈現右下角街景小人
                                mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                                fullscreenControl: false,
                                zoomControl: false
                            });
        },
        drawMarker() {
            var markerImage = new google.maps.MarkerImage(bluePosImg,
                                new google.maps.Size(36, 55)); //size  預設位子圖案中間底
                                // new google.maps.Point(0, 0), //origin point
                                // new google.maps.Point(18, 55)); // offset point
            this.marker = new google.maps.Marker({
                    map: this.map,
                    position: this.position,
                    icon: markerImage
                });
        },
        closeDialog() {
            this.$emit('close', false);
        }
    }
}
</script>
<style lang = "scss" scoped>
.google-map {
    width: 100%;
    height: 400px;
    margin-bottom: 2vh;
}
</style>