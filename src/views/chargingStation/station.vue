<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargingStation') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.station') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small dark"
                        v-model="filter.operatorTypeId"
                        :placeholder="$t('general.operator')"
                        @change="fetchData()"
                        clearable >
                        <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                    </el-select>
                    <el-input
                        :placeholder="$t('chargingStation.stationID')"
                        class="dark"
                        v-model="filter.tmpSearch"
                        @keyup.enter.native="fetchData('s')">
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol enable-row-click"
                    v-loading="isLoading"
                    @row-click="handleRowClick">
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="1"></el-table-column>
                    <el-table-column prop="stationName" :label="$t('chargingStation.stationName')" :min-width="2"></el-table-column>
                    <el-table-column prop="zipCode" :label="$t('general.zipCode')" :min-width="1"></el-table-column>
                    <el-table-column prop="eDate" :label="$t('general.latestModification')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('chargingStation.connector#')" label-class-name="center">
                        <el-table-column label="AC" :width="60" label-class-name="center" class-name="center">
                            <template slot-scope="scope">
                                <el-tooltip placement="top" effect="light" popper-class="custom">
                                    <div slot="content">
                                        {{ $t('general.available') + ': ' + scope.row.connectorCountInfo.acAvailable}} <br/>
                                        {{ $t('general.unavailable') + ': ' + scope.row.connectorCountInfo.acUnavailable}}
                                    </div>
                                    <span class="text">{{ scope.row.connectorCountInfo.acTotal }}</span>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column label="DC" :width="60" label-class-name="center" class-name="center">
                            <template slot-scope="scope">
                                <el-tooltip placement="top" effect="light" popper-class="custom">
                                    <div slot="content">
                                        {{ $t('general.available') + ': ' + scope.row.connectorCountInfo.dcAvailable}} <br/>
                                        {{ $t('general.unavailable') + ': ' + scope.row.connectorCountInfo.dcUnavailable}}
                                    </div>
                                    <span class="text">{{ scope.row.connectorCountInfo.dcTotal }}</span>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.parkingRate')" :min-width="1">
                        <template slot-scope="scope">{{ scope.row.currency + scope.row.parkingRate + "/min" }}</template>
                    </el-table-column>
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
                            <el-button class="no-bg delete" @click="deleteStation(scope.row.stationId, scope.row.stationName)"></el-button>
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
                width="600px"
                :visible.sync="dialog.visible"
                :show-close="false"
                v-loading="dialog.isLoading">
                <div class="vertial formVertical">
                    <div class="form-item" v-if="dialog.type">
                        <div class="label">{{ $t('chargingStation.stationID') }}</div>
                        <el-input v-model="dialog.info.stationId" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.stationName') }}</div>
                        <el-input v-model="dialog.info.stationName"></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.zipCode') }}</div>
                        <el-input v-model="dialog.info.zipCode"></el-input>
                    </div>
                    <!-- <div class="form-item">
                        <div class="label">{{ $t('userAccount.countryCode') }}</div>
                        <el-select
                            class="select-small"
                            v-model="dialog.info.countryCode"
                            v-loading="countryCode.isLoading" >
                            <el-option v-for="(item, idx) in countryCode.data" :label="item.countryCode+' ('+item.countryName+')'" :key="idx" :value="item.countryCode"></el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.telephone') }}</div>
                        <el-input v-model="dialog.info.phone"></el-input>
                    </div> -->
                    <div class="form-item">
                        <div class="label">{{ $t('general.address') }}</div>
                        <el-input v-model="dialog.info.address"></el-input>
                    </div>
                    <!-- <div class="form-item">
                        <div class="label">{{ $t('general.businessHours') }}</div>
                        <div class="timeRange">
                            <el-time-select
                                :placeholder="$t('general.startTime')"
                                v-model="dialog.info.serviceStartTime"
                                :picker-options="{
                                    start: '00:00',
                                    step: '00:15',
                                    end: '23:45'
                                }">
                            </el-time-select>
                            <span> ~ </span>
                            <el-time-select
                                :placeholder="$t('general.endTime')"
                                v-model="dialog.info.serviceEndTime"
                                :picker-options="{
                                    start: '00:00',
                                    step: '00:15',
                                    end: '23:45',
                                    minTime: dialog.info.serviceStartTime
                                }">
                            </el-time-select>
                        </div>
                    </div> -->
                    <div class="form-item">
                        <div class="label">{{ $t('general.currency') }}</div>
                        <el-select
                            class="select-small"
                            v-model="dialog.info.unitType">
                            <el-option v-for="(item, key) in currencyList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                        <el-input-number v-model="dialog.info.parkingRate" :precision="2" :step="0.01" :min="0" controls-position="right"></el-input-number>
                    </div>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="updateStation">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="()=> {this.mapDialog.visible=false}" ></ShowPostion>
        </div>
    </div>
</template>

<script>
import { $GLOBAL_CURRENCY } from '@/utils/global';
import { $HTTP_getStationList, $HTTP_getCountryCodeSelectList, $HTTP_addStation, $HTTP_updateStation, $HTTP_deleteStation } from "@/api/api";
import { setScrollBar } from "@/utils/function";
import moment from "moment";
import ShowPostion from "@/components/chargingStation/showPostion";
export default {
    components: {
        ShowPostion
    },
    data() {
        return {
            operatorList: {
                1: "Fiicharger",
                2: "MidwestFiber",
                3: "APT"
            },
            lang: '',
            filter: {
                tmpSearch: '',
                search: '',
                operatorTypeId: ''
            },
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            countryCode: {
                isLoading: false,
                data: []
            },
            currencyList: $GLOBAL_CURRENCY,
            dialog: {
                visible: false,
                isLoading: false,
                type: 0,
                info: {
                    stationId: '',
                    stationName: '',
                    zipCode: '',
                    // countryCode: '',
                    // phone: '',
                    address: '',
                    // serviceStartTime: '',
                    // serviceEndTime: '',
                    unitType: '',
                    parkingRate: 0
                }
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
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchData();
        // this.fetchCountryCodeList();
    },
    methods: {
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let param = {
                operatorTypeId: that.filter.operatorTypeId
            };
            if (type) {
                this.filter.search = this.filter.tmpSearch;
            }
            param.search = this.filter.search;
            $HTTP_getStationList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.stationList.map(item => {
                        item.connectorCountInfo.acUnavailable = item.connectorCountInfo.acTotal - item.connectorCountInfo.acAvailable;
                        item.connectorCountInfo.dcUnavailable = item.connectorCountInfo.dcTotal - item.connectorCountInfo.dcAvailable;
                        item.currency = $GLOBAL_CURRENCY[item.unitType];
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
        // fetchCountryCodeList() {
        //     const that = this;
        //     this.countryCode.isLoading = true;
        //     $HTTP_getCountryCodeSelectList({lang: that.lang}).then((data) => {
        //         this.countryCode.isLoading = false;
        //         if (!!data.success) {
        //             this.countryCode.data = data.countryCodeList.slice();
        //         } else {
        //             this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
        //         }
        //     }).catch((err) => {
        //         console.log('countryCode', err);
        //         this.$message({ type: "warning", message: i18n.t("error_network") });
        //     });
        // },
        handleRowClick(row, column, event) {
            if ($(event.path[0]).attr('class')!==undefined && $(event.path[0]).attr('class').includes('cell')) {
                const stationData = {
                    stationId: row.stationId,
                    stationName: row.stationName,
                    loc: row.loc,
                    // zipCode: row.zipCode,
                    // countryCode: row.countryCode,
                    // phone: row.phone,
                    // serviceStartTime: row.serviceStartTime,
                    // serviceEndTime: row.serviceEndTime,
                    currency: row.currency,
                    parkingRate: row.currency + row.parkingRate + "/min",
                    address: row.address
                }
                window.sessionStorage.setItem('fiics-stationInfo', JSON.stringify(stationData));
                this.$router.push({ name: "stationDetail", params: stationData }).catch();
            }
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            this.$jQuery(".vertial.formVertical").length > 0 && this.$jQuery(".vertial.formVertical").mCustomScrollbar('destroy');
            if (type) {
                this.dialog.info = Object.assign({}, data);
            }
            this.dialog.visible = true;
            that.$nextTick(() => {
                setScrollBar('.vertial.formVertical', that);
            });
        },
        deleteStation(id, name) {
            const that = this;
            this.$confirm(i18n.t('general.deleteItem', { item: name }), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'dark'
            }).then(() => {
                $HTTP_deleteStation({stationId: id}).then(data => {
                    if (!!data.success) {
                        that.$message({ type: "success", message: i18n.t('general.sucDelMsg')});
                        that.fetchData();
                    } else {
                        that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                    }
                });
            });
        },
        updateStation() {
            const that = this;
            let   $API,
                  params = {
                    stationName: that.dialog.info.stationName,
                    zipCode: that.dialog.info.zipCode,
                    // countryCode: that.dialog.info.countryCode,
                    // phone: that.dialog.info.phone,
                    address: that.dialog.info.address,
                    // serviceStartTime: that.dialog.info.serviceStartTime,
                    // serviceEndTime: that.dialog.info.serviceEndTime,
                    unitType: that.dialog.info.unitType,
                    parkingRate: that.dialog.info.parkingRate,
                  },
                  sucMsg = "";
            if (!that.dialog.type) {
                $API = $HTTP_addStation;
                sucMsg = i18n.t('general.sucAddMsg');
            } else {
                $API = $HTTP_updateStation;
                params.stationId = that.dialog.info.stationId;
                sucMsg = i18n.t('general.sucUpdateMsg');
            }

            that.dialog.isLoading = true;
            $API(params).then(data => {
                that.dialog.isLoading = false;
                if (!!data.success) {
                    that.$message({ type: "success", message: sucMsg });
                    that.dialog.visible = false;
                    that.fetchData();
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            });
        },
        handleShowDialog(data) {
            this.mapDialog.itemId = data.stationId;
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
.formVertical .form-item .el-date-editor {
    width: calc(50% - 9px);
    display: inline-block;
}
</style>