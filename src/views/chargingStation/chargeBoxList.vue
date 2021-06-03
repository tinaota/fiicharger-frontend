<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.chargeBoxList') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-input
                        :placeholder="$t('chargingStation.chargeBoxID')"
                        class="dark"
                        v-model="filter.tmpSearch"
                        @keyup.enter.native="handleSearch()">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol">
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargeBoxID')" :min-width="2"></el-table-column>
                    <el-table-column prop="chargeBoxName" :label="$t('chargingStation.chargeBoxName')" :min-width="1"></el-table-column>
                    <el-table-column prop="status" :label="$t('chargingStation.serviceStatus')" :min-width="1">
                        <template slot-scope="scope">
                            <el-tooltip v-if="scope.row.status==1" class="item" effect="dark" :content="$t('general.active')" placement="right">
                                <span class="circle-status green"></span>
                            </el-tooltip>
                            <el-tooltip v-else-if="!scope.row.status" class="item" effect="dark" :content="$t('general.unactive')" placement="right">
                                <span class="circle-status gray"></span>
                            </el-tooltip>
                            <el-tooltip v-else class="item" effect="dark" :content="$t('general.repair')" placement="right">
                                <span class="circle-status orange"></span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.power')" :min-width="1">
                        <template slot-scope="scope">
                            {{scope.row.power + "kWh"}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="location" :label="$t('general.location')" :min-width="2"></el-table-column>
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="1"></el-table-column>
                    <el-table-column prop="stationName" :label="$t('chargingStation.stationName')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('general.action')" :min-width="1">
                        <template slot-scope="scope">
                            <el-button @click="openDialog(1, scope.row)">{{ $t('general.modify') }}</el-button>
                            <el-button @click="deleteCheckBox(scope.row.chargeBoxId)">{{ $t('general.delete') }}</el-button>
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
                        <div class="label">{{ $t('chargingStation.chargeBoxName') }}</div>
                        <el-input v-model="dialog.info.chargeBoxName"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.lng') }}</div>
                        <el-input v-model="dialog.info.loc.lng" disabled></el-input>
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
                            <el-option v-for="(item, key) in dialog.stationList" :label="key+' '+item" :key="key" :value="key"></el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.serviceStatus') }}</div>
                        <el-select
                            class="select-small"
                            v-model="dialog.info.status">
                            <el-option v-for="(item, idx) in dialog.serviceStatusList" :label="item" :key="idx" :value="idx"></el-option>
                        </el-select>
                    </div>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="updateCheckBox">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import ChargeBoxListData from "@/tmpData/chargeBoxListData";
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            filter: {
                tmpSearch: '',
                search: ''
            },
            tableData: [],
            page: 1,
            total: 0,
            dialog: {
                visible: false,
                type: 0,
                info: {
                    chargeBoxId: '',
                    chargeBoxName: '',
                    loc: {
                        lng: '',
                        lat: ''
                    },
                    stationId: '',
                    status: 1,
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
                stationList: {}
            }
        }
    },
    mounted() {
        this.fetchData();
    },
    beforeDestroy() {
        this.dialog.map && google.maps.event.clearListeners(this.dialog.map, 'click');
    },
    methods : {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.tableData = ChargeBoxListData.chargeboxList.slice();
            this.dialog.stationList = Object.assign({}, ChargeBoxListData.stationList);
            this.page = 1;
            this.total = this.tableData.length;
            setScrollBar('.scroll', this);
        },
        handleSearch() {
            this.filter.search = this.filter.tmpSearch;
            this.page = 1;
            if (this.filter.search) {
                this.tableData = [];
                this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
                this.tableData = ChargeBoxListData.chargeboxList.filter(this.createFilter(this.filter.search));
                this.total = this.tableData.length;
                setScrollBar('.scroll', this);
            } else {
                this.fetchData();
            }
        },
        createFilter(queryString) {
            return (item) => {
                return (item.chargeBoxId.toLowerCase().indexOf(queryString.toLowerCase()) >= 0)
            };
        },
        changePage(page) {
            this.page = page;
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            if (type) {
                this.dialog.info = Object.assign({}, data);
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
        deleteCheckBox(id) {
            this.tableData = this.tableData.filter(item => item.chargeBoxId !== id);
            this.total = this.tableData.length;
        },
        updateCheckBox() {
            if (!this.dialog.type) {
                let data = Object.assign({}, this.dialog.info);
                data.chargeBoxId = "";
                data.power = 0;
                data.connector = [];
                data.location = this.dialog.info.loc.lng + ', '+ this.dialog.info.loc.lat;
                data.stationName = this.dialog.stationList[this.dialog.info.loc.stationId];
                this.tableData.push(data);
            } else {
                let tmp = [];
                this.tableData.forEach(item => {
                    if(item.id === this.dialog.info.id) {
                        item = Object.assign(item, this.dialog.info);
                    }
                    tmp.push(item);
                });
                this.tableData = tmp;
            }
            this.dialog.visible = false;
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
    }

}
</style>