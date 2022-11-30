<template>
    <el-dialog :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')" width="80%" :visible.sync="visible" custom-class="map" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div id="map-container" class="google-map"></div>
        <div class="right-form formVertical">
            <el-form ref="chargeBoxForm" :rules="rules" :model="editDialog.info" style="width:96%">
                <div class="form-item">
                    <el-form-item prop="id">
                        <div class="label">OCPP Id</div>
                        <el-input v-model="editDialog.info.ocppId" :disabled="dialog.type===1"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="chargeBoxName">
                        <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                        <el-input v-model="editDialog.info.chargeBoxName"></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="loc.lat">
                        <div class="label">{{ $t('general.lat') }}</div>
                        <el-input v-model="editDialog.info.loc.lat" disabled></el-input>
                    </el-form-item>
                </div>
                <div class="form-item">
                    <el-form-item prop="loc.lng">
                        <div class="label">{{ $t('general.lng') }}</div>
                        <el-input v-model="editDialog.info.loc.lon" disabled></el-input>
                    </el-form-item>
                </div>
                <div class="hint" v-if="mapInfo.marker === null">{{ $t('general.clickAddMarker') }}</div>
                <div class="hint" v-else>{{ $t('general.dragMarker') }}</div>
                <div class="use-current-location hint" @click="updateMarkerLocation">
                    <i class="fa fa-location-arrow" aria-hidden="true"></i>
                    <span>{{ $t('general.useCurrentLocation') }}</span>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('chargingStation.chargeType') }}</div>
                    <el-select class="select-small" v-model="editDialog.info.chargeType">
                        <el-option label="AC single phase" value="AC_1_PHASE"></el-option>
                        <el-option label="AC two phases" value="AC_2_PHASE"></el-option>
                        <el-option label="AC two phases w/ split phase" value="AC_2_PHASE_SPLIT"></el-option>
                        <el-option label="AC three phases" value="AC_3_PHASE"></el-option>
                        <el-option label="DC" value="DC"></el-option>
                    </el-select>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('chargingStation.power') }}</div>
                    <el-input-number v-model="editDialog.info.power" :precision="2" :step="1" :min="0" controls-position="right"></el-input-number>
                </div>

                <div class="form-item">
                    <el-form-item prop="installationDate">
                        <div class="label">{{ $t('general.installationDate') }}</div>
                        <el-date-picker v-model="editDialog.info.installationDate" type="datetime" value-format="yyyy-MM-dd HH:mm" format="yyyy-MM-dd HH:mm" :picker-options="pickerOptions" :clearable="false">
                        </el-date-picker>
                    </el-form-item>
                </div>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="updateCheckBox">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import { $HTTP_addChargeBox, $HTTP_updateChargeBox } from "@/api/api";
import ic_green_dot from "imgs/ic_green_dot.png";
import googleMapStyle from "@/assets/js/googleMapStyle_normal";
import { validateIsEmpty } from "@/utils/validation";

export default {
    props: {
        name: String,
        show: Boolean,
        dialog: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            zoom: 15,
            maxZoom: 20,
            map: null,
            editDialog: {
                info: {
                    id: "",
                    chargeBoxName: "",
                    loc: {
                        lng: "",
                        lon: "",
                        lat: ""
                    },
                    power: 0,
                    zipCode: "",
                    chargeType: "",
                    installationDate: "",
                    ocppId: ""
                }
            },
            mapInfo: {
                initMap: true,
                zoom: 15,
                marker: null,
                initCenter: {
                    lat: 42.677811124442854,
                    lng: -87.91695010215827
                },
                icon: ic_green_dot
            },
            serviceStatusList: [
                i18n.t("general.unactive"),
                i18n.t("general.active"),
                i18n.t("general.repair")
            ],
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                }
            },
            rules: {
                chargeBoxName: [{ validator: validateIsEmpty }],
                ocppId: [{ validator: validateIsEmpty }],
                "loc.lng": [{ validator: validateIsEmpty }],
                "loc.lat": [{ validator: validateIsEmpty }],
                installationDate: [{ validator: validateIsEmpty }]
            }
        };
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
                if (that.visible) {
                    this.editDialog = { ...this.dialog };
                    that.$jQuery(".right-form").length > 0 &&
                        this.$jQuery(".right-form").mCustomScrollbar("destroy");
                    that.$nextTick(() => {
                        setScrollBar(".right-form", this);
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
                        } else if (
                            !this.dialog.info.loc ||
                            !this.dialog.info.loc.lat
                        ) {
                            that.map.setCenter(that.mapInfo.initCenter);
                        }
                    });
                }
            }
        }
    },
    mounted() {},
    beforeDestroy() {
        this.map && google.maps.event.clearListeners(this.map, "click");
    },
    methods: {
        initMap() {
            const that = this;
            this.map = new google.maps.Map(
                document.getElementById("map-container"),
                {
                    center: this.mapInfo.initCenter,
                    zoom: this.mapInfo.zoom,
                    maxZoom: this.maxZoom,
                    streetViewControl: false, //設定是否呈現右下角街景小人
                    mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                    fullscreenControl: false,
                    zoomControl: true,
                    styles: googleMapStyle
                }
            );
            google.maps.event.addListener(this.map, "click", function (event) {
                if (!that.dialog.type) {
                    that.removeMarker();
                    that.editDialog.info.loc = event.latLng.toJSON();
                    that.editDialog.info.loc.lon = that.dialog.info.loc.lng;
                    that.drawMarker();
                }
            });

            // add current location option
            const locationButton = document.createElement("button");
            let currentLocationLogo = document.createElement("img");
            currentLocationLogo.src = require("../../../public/imgs/my_location.png");
            locationButton.appendChild(currentLocationLogo);
            locationButton.classList.add("custom-map-control-button");
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
                            this.mapInfo.initCenter = pos;
                            this.initMap();
                            that.drawMarker();
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
        },
        updateMarkerLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        this.mapInfo.initCenter = pos;
                        this.initMap();
                        // assign a central point to marker
                        this.editDialog.info.loc = pos;
                        this.editDialog.info.loc.lon = pos.lng;
                        this.drawMarker();
                    },
                    () => {
                        this.$message({
                            type: "warning",
                            message: i18n.t("error_geolocation")
                        });
                    }
                );
            }
        },
        drawMarker() {
            const that = this;
            var markerImage = new google.maps.MarkerImage(
                this.mapInfo.icon,
                new google.maps.Size(36, 55)
            ); //size  預設位子圖案中間底
            // new google.maps.Point(0, 0), //origin point
            // new google.maps.Point(18, 55)); // offset point
            let marker = new google.maps.Marker({
                map: this.map,
                position: this.dialog.info.loc,
                icon: markerImage,
                draggable: true
            });
            this.mapInfo.marker = marker;
            google.maps.event.addListener(
                this.mapInfo.marker,
                "dragend",
                function (event) {
                    that.editDialog.info.loc = event.latLng.toJSON();
                    that.editDialog.info.loc.lon = that.dialog.info.loc.lng;
                }
            );
        },
        removeMarker() {
            if (this.mapInfo.marker) {
                google.maps.event.clearListeners(
                    this.mapInfo.marker,
                    "dragend"
                );
                this.mapInfo.marker.setMap();
                this.mapInfo.marker = null;
            }
        },
        updateCheckBox() {
            this.$refs.chargeBoxForm.validate((valid) => {
                if (valid) {
                    const that = this;
                    var installationDate = new Date(
                        that.editDialog.info.installationDate
                    );
                    console.log(that.editDialog);
                    let $API,
                        params = {
                            powerType: that.editDialog.info.chargeType,
                            coordinates: {
                                latitude: that.editDialog.info.loc.lat,
                                longitude: that.editDialog.info.loc.lon
                            },
                            powerKw: that.editDialog.info.power,
                            name: that.editDialog.info.chargeBoxName,
                            installed: installationDate.toISOString(),
                            id: that.editDialog.info.id,
                            ocppId: that.editDialog.info.ocppId
                        },
                        sucMsg = "";
                    if (!that.dialog.type) {
                        $API = $HTTP_addChargeBox;
                        sucMsg = i18n.t("general.sucAddMsg");
                    } else {
                        $API = $HTTP_updateChargeBox;
                        sucMsg = i18n.t("general.sucUpdateMsg");
                    }

                    that.isLoading = true;
                    $API(params)
                        .then((data) => {
                            that.isLoading = false;
                            if (data) {
                                that.$message({
                                    type: "success",
                                    message: sucMsg
                                });
                                that.isUpdate = true;
                                that.visible = false;
                            } else {
                                this.$message({
                                    type: "warning",
                                    message: i18n.t("emptyMessage")
                                });
                            }
                        })
                        .catch(() => {
                            this.$message({
                                type: "warning",
                                message: i18n.t("error_network")
                            });
                        });
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog() {
            this.editDialog.info = {
                id: "",
                chargeBoxName: "",
                loc: {
                    lng: "",
                    lon: "",
                    lat: ""
                },
                power: 0,
                zipCode: "",
                chargeType: "",
                installationDate: "",
                ocppId: ""
            };
            this.$nextTick(() => {
                this.$refs?.chargeBoxForm?.clearValidate("chargeBoxName");
                this.$refs?.chargeBoxForm?.clearValidate("id");
                this.$refs?.chargeBoxForm?.clearValidate("loc.lng");
                this.$refs?.chargeBoxForm?.clearValidate("loc.lat");
                this.$refs?.chargeBoxForm?.clearValidate("installationDate");
            });
            this.$emit("close", this.isUpdate);
        }
    }
};
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
                display: inline-block;
            }
        }
        .use-current-location {
            display: flex;
            width: fit-content;
            cursor: pointer;
            .fa-location-arrow {
                display: flex;
                align-items: center;
                margin-right: 5px;
            }
        }
    }
}

.formVertical .form-item .el-input input:disabled {
    background: #d3d3d3 !important;
}

@media only screen and (max-width: 1280px) {
    .formVertical {
        .el-form {
            width: 92% !important;
        }
    }
}
</style>
