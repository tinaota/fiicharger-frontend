<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.chargeBoxList') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small dark"
                        v-model="filter.status"
                        :placeholder="$t('general.status')"
                        @change="fetchData()">
                        <el-option :label="$t('general.all')" :value="0"></el-option>
                        <el-option v-for="(item, key) in $t('general.statusList')" :label="item" :key="(key+1)" :value="(key+1)"></el-option>
                    </el-select>
                    <el-input
                        :placeholder="$t('chargingStation.chargeBoxID')"
                        class="dark"
                        v-model="filter.tmpSearch"
                        @keyup.enter.native="fetchData('s')">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol"
                    v-loading="isLoading">
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')" :min-width="3"></el-table-column>
                    <el-table-column prop="chargeBoxName" :label="$t('general.name')" :width="64"></el-table-column>
                    <el-table-column :label="$t('general.status')" :width="68" class-name="center">
                        <template slot-scope="scope">
                            <el-tooltip v-if="scope.row.chargeBoxStatus===1" :content="$t('general.statusList')[0]" placement="top" effect="light" popper-class="item custom">
                                <span class="circle-status color1"></span>
                            </el-tooltip>
                            <el-tooltip v-else-if="scope.row.chargeBoxStatus===2" :content="$t('general.statusList')[1]" placement="top" effect="light" popper-class="item custom">
                                <span class="circle-status color2"></span>
                            </el-tooltip>
                            <el-tooltip v-else-if="scope.row.chargeBoxStatus===3" :content="$t('general.statusList')[2]" placement="top" effect="light" popper-class="item custom">
                                <span class="circle-status color3"></span>
                            </el-tooltip>
                            <el-tooltip v-else-if="scope.row.chargeBoxStatus===4" :content="$t('general.statusList')[3]" placement="top" effect="light" popper-class="item custom">
                                <span class="circle-status color4"></span>
                            </el-tooltip>
                            <el-tooltip v-else :content="$t('general.statusList')[4]" placement="top" effect="light" popper-class="item custom">
                                <span class="circle-status color5"></span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.power')" :min-width="2">
                        <template slot-scope="scope">
                            {{scope.row.power + "kWh"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connector')" :width="120">
                        <template slot-scope="scope">
                            <div v-for="(item, key) in scope.row.connectorTypeInfo" :key="key">{{ "("+ key +") "+ item }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.type')" :width="56" class-name="center">
                        <template slot-scope="scope">
                            {{ scope.row.chargeType === 1 ? "AC" : "DC" }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.elecRate')">
                        <el-table-column :label="$t('chargingStation.onPeak')" :min-width="2">
                            <template slot-scope="scope">
                                {{ scope.row.currency + scope.row.onPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[scope.row.onPeakElectricityRateType]}}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('chargingStation.offPeak')" :min-width="2">
                            <template slot-scope="scope">
                                {{ scope.row.currency + scope.row.offPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[scope.row.offPeakElectricityRateType]}}
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column prop="stationName" :label="$t('chargingStation.station')" :min-width="3"></el-table-column>
                    <el-table-column  :label="$t('general.location')" :width="80" class-name="center">
                        <template slot-scope="scope">
                            <el-tooltip :content="scope.row.loc.lon+','+scope.row.loc.lat" placement="top" effect="light" popper-class="custom">
                                <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.action')" :width="96">
                        <template slot-scope="scope">
                            <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="deleteCheckBox(scope.row.chargeBoxId, scope.row.chargeBoxName)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total})}}</div>
                <el-pagination background layout="prev, pager, next"
                    :total="total"
                    :pager-count="5"
                    :page-size="10"
                    :current-page.sync="page"
                    @current-change="changePage">
                </el-pagination>
            </div>
            <el-dialog
                :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')"
                width="80%"
                :visible.sync="dialog.visible"
                custom-class="map"
                :show-close="false">
                <div id="map-container" class="google-map"></div>
                <div class="right-form formVertical">
                    <div class="form-item" v-if="dialog.type">
                        <div class="label">{{ $t('chargingStation.chargeBoxID') }}</div>
                        <el-input v-model="dialog.info.chargeBoxId" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.name') }}</div>
                        <el-input v-model="dialog.info.chargeBoxName"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.lng') }}</div>
                        <el-input v-model="dialog.info.loc.lon" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.lat') }}</div>
                        <el-input v-model="dialog.info.loc.lat" disabled></el-input>
                    </div>
                    <div class="hint" v-if="dialog.mapInfo.marker === null">{{$t('general.clickAddMarker')}}</div>
                    <div class="hint" v-else>{{$t('general.dragMarker')}}</div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.station') }}</div>
                        <el-select
                            class="select-small"
                            v-model="dialog.info.stationId">
                            <el-option v-for="(item, key) in stationList" :label="key+' '+item" :key="key" :value="key"></el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.status') }}</div>
                        <el-select
                            class="select-small"
                            v-model="dialog.info.status">
                            <el-option v-for="(item, idx) in dialog.serviceStatusList" :label="item" :key="idx" :value="idx"></el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ "● " + $t('chargingStation.onPeak') }}</div>
                        <div class="elecRateItem">
                            <el-input-number v-model="dialog.info.onPeakElectricityRate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                            /
                            <el-select
                                class="select-small"
                                v-model="dialog.info.onPeakElectricityRateType">
                                <el-option v-for="(item, key) in $t('chargingStation.elecRateUnit')" :label="item" :key="key" :value="parseInt(key)"></el-option>
                            </el-select>
                        </div>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ "● " + $t('chargingStation.offPeak') }}</div>
                        <div class="elecRateItem">
                            <el-input-number v-model="dialog.info.offPeakElectricityRate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                            /
                            <el-select
                                class="select-small"
                                v-model="dialog.info.offPeakElectricityRateType">
                                <el-option v-for="(item, key) in $t('chargingStation.elecRateUnit')" :label="item" :key="key" :value="parseInt(key)"></el-option>
                            </el-select>
                        </div>
                    </div>

                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="updateCheckBox">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="()=> {this.mapDialog.visible=false}" ></ShowPostion>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import ShowPostion from "@/components/chargingStation/showPostion";
import { $GLOBAL_CURRENCY } from '@/utils/global';
import { $HTTP_getStationListForSelect, $HTTP_getChargeBoxList, $HTTP_addChargeBox, $HTTP_updateChargeBox, $HTTP_deleteChargeBox } from "@/api/api";

export default {
    components: {
        ShowPostion
    },
    data() {
        return {
            filter: {
                tmpSearch: '',
                search: '',
                status: ''
            },
            isLoading: false,
            stationList: {},
            tableData: [],
            page: 1,
            total: 0,
            currencyList: $GLOBAL_CURRENCY,
            dialog: {
                visible: false,
                type: 0,
                info: {
                    chargeBoxId: '',
                    chargeBoxName: '',
                    loc: {
                        lng: '',
                        lon: '',
                        lat: ''
                    },
                    stationId: '',
                    status: 1,
                    unitType: '',
                    onPeakElectricityRate: 0,
                    onPeakElectricityRateType: 1,
                    offPeakElectricityRate: 0,
                    offPeakElectricityRateType: 1
                },
                initCenter: {
                    lat: 42.677811124442854,
                    lng: -87.91695010215827
                },
                map: null,
                mapInfo: {
                    initMap: true,
                    zoom: 14,
                    marker: null,
                    icon: require('imgs/ic_info_green.png')
                },
                serviceStatusList: [i18n.t('general.unactive'), i18n.t('general.active'), i18n.t('general.repair')],
            },
            mapDialog: {
                visible: false,
                itemId: '',
                position: {
                    lat: '',
                    lng: ''
                }
            }
        }
    },
    mounted() {
        const that = this;
        this.fetchStationList(()=>{ that.fetchData()});
    },
    beforeDestroy() {
        this.dialog.map && google.maps.event.clearListeners(this.dialog.map, 'click');
    },
    methods: {
        fetchStationList(callBack) {
            const that = this;
            this.isLoading = true;
            $HTTP_getStationListForSelect().then((data) => {
                if (!!data.success) {
                    that.stationList = {};
                    data.stationList.forEach(item => {
                        that.stationList[item.stationId] = item.stationName;
                    });
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                callBack && callBack();
            }).catch((err) => {
                console.log('StationList', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let param = {};
            if (type) {
                this.filter.search = this.filter.tmpSearch;
            }
            if (this.filter.status === '') {
                param.status = 0;
            } else {
                param.status = this.filter.status;
            }
            param.search = this.filter.search;
            $HTTP_getChargeBoxList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.chargeBoxList.map(item => {
                        item.currency = $GLOBAL_CURRENCY[item.unitType];
                        item.stationName = that.stationList[item.stationId];
                        return item;
                    });
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                setScrollBar('.scroll', this);
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            if (type) {
                this.dialog.info = Object.assign({}, data);
                this.dialog.info.loc.lng = this.dialog.info.loc.lon;
            }
            this.$jQuery(".right-form").length > 0 && this.$jQuery(".right-form").mCustomScrollbar('destroy');
            this.dialog.visible = true;
            that.$nextTick(() => {
                setScrollBar('.right-form', this);
                if (that.dialog.mapInfo.initMap) {
                    that.dialog.mapInfo.initMap = false;
                    that.initMap();
                }
                that.removeMarker();
                if (type) {
                    that.drawMarker();
                    that.dialog.map.setCenter(that.dialog.info.loc);
                } else if (that.dialog.info.loc.lat) {
                    that.drawMarker();
                    that.dialog.map.setCenter(that.dialog.info.loc);
                } else if (!this.dialog.info.loc || !this.dialog.info.loc.lat) {
                    that.dialog.map.setCenter(that.dialog.initCenter);
                }
            });
        },
        initMap() {
            const that = this;
            this.dialog.map = new google.maps.Map(document.getElementById('map-container'), {
                                center: this.dialog.initCenter,
                                zoom: this.dialog.mapInfo.zoom,
                                streetViewControl: false, //設定是否呈現右下角街景小人
                                mapTypeControl: false, //切換地圖樣式：一般、衛星圖等,
                                fullscreenControl: false,
                                zoomControl: false
                            });
            google.maps.event.addListener(this.dialog.map, 'click', function(event) {
                if (!that.dialog.type) {
                    that.removeMarker();
                    that.dialog.info.loc = event.latLng.toJSON();
                    that.drawMarker();
                }
            });
        },
        drawMarker() {
            const that = this;
            var markerImage = new google.maps.MarkerImage(this.dialog.mapInfo.icon,
                                new google.maps.Size(38, 38), //size
                                new google.maps.Point(0, 0), //origin point
                                new google.maps.Point(24, 24)); // offset point
            let marker = new google.maps.Marker({
                            map: this.dialog.map,
                            position: this.dialog.info.loc,
                            icon: markerImage,
                            draggable:true,
                        });
            this.dialog.mapInfo.marker = marker;
            google.maps.event.addListener(this.dialog.mapInfo.marker, 'dragend', function(event) {
                that.dialog.info.loc = event.latLng.toJSON();
            });
        },
        removeMarker() {
            if (this.dialog.mapInfo.marker) {
                google.maps.event.clearListeners(this.dialog.mapInfo.marker, 'dragend');
                this.dialog.mapInfo.marker.setMap();
                this.dialog.mapInfo.marker = null;
            }
        },
        deleteCheckBox(id, name) {
            const that = this;
            this.$confirm(i18n.t('general.deleteItem', { item: name }), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'dark'
            }).then(() => {
                $HTTP_deleteChargeBox({stationId: this.stationId, chargeBoxId: id}).then(data => {
                    if (!!data.success) {
                        that.$message({ type: "success", message: i18n.t('general.sucDelMsg')});
                        that.fetchData();
                    } else {
                        that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                    }
                });
            });
        },
        updateCheckBox() {
            // if (!this.dialog.type) {
            //     let data = Object.assign({}, this.dialog.info);
            //     data.chargeBoxId = "";
            //     data.power = 0;
            //     data.connector = {};
            //     data.location = this.dialog.info.loc.lng + ', '+ this.dialog.info.loc.lat;
            //     data.stationName = this.dialog.stationList[this.dialog.info.loc.stationId];
            //     this.tableData.push(data);
            // } else {
            //     let tmp = [];
            //     this.tableData.forEach(item => {
            //         if(item.id === this.dialog.info.id) {
            //             item = Object.assign(item, this.dialog.info);
            //         }
            //         tmp.push(item);
            //     });
            //     this.tableData = tmp;
            // }
            this.dialog.visible = false;
        },
        handleShowDialog(data) {
            this.mapDialog.itemId = data.chargeBoxId;
            this.mapDialog.position = data.loc;
            this.mapDialog.visible = true;
        }
    }
}
</script>
<style lang = "scss" scoped>
.card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .total {
        position: absolute;
        right: 28px;
        bottom: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
.el-dialog.map .el-dialog__body {
    height: 50vh;
    .google-map {
        width: 65%;
        height: calc(70vh - 75px);
        display: inline-block;
        float: left;
    }
    .right-form {
        width: calc(35% - 30px);
        height: calc(70vh - 75px);
        margin-left: 30px;
        display: inline-block;
        .form-item .elecRateItem {
            .el-input-number,
            .el-select {
                width: calc(50% - 8px);
            display: inline-block
            }
        }
    }

}
</style>