<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-select
                        class="select-small"
                        :placeholder="$t('general.operator')"
                        v-model="filter.operatorTypeId"
                        @change="fetchData()">
                        <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
                    </el-select>
                    <el-select
                        class="select-small"
                        v-model="filter.zipCode"
                        :placeholder="$t('general.location')"
                        v-loading="loctionList.isLoading"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="item in loctionList.data" :label="item" :key="item" :value="item"></el-option>
                    </el-select>
                    <el-input
                        :placeholder="$t('chargingStation.chargePointID')"
                        v-model="filter.tmpSearch"
                        @change="fetchData('s')"
                        clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-select
                        class="select-small long"
                        :placeholder="$t('chargingStation.connectorStatus')"
                        v-model="filter.connectorStatus"
                        @change="fetchData()"
                        clearable>
                        <el-option v-for="(item, idx) in connectorList" :label="item" :key="idx" :value="idx"></el-option>
                    </el-select>
                    <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
                </div>
                <el-table
                    :data="tableData.slice((page - 1) * 10, page * 10)"
                    class="moreCol enable-row-click"
                    v-loading="isLoading"
                    @row-click="handleRowClick">
                    <el-table-column prop="chargeBoxId" :label="$t('chargingStation.chargePointID')" :min-width="5"></el-table-column>
                    <el-table-column prop="chargeBoxName" :label="$t('general.name')" :min-width="3"></el-table-column>
                    <el-table-column :label="$t('general.status')" :min-width="2" class-name="center">
                        <template slot-scope="scope">
                            <el-tooltip v-if="scope.row.chargeBoxStatus===1" :content="$t('chargingStation.connection')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color1"></span>
                            </el-tooltip>
                            <el-tooltip v-else :content="$t('chargingStation.disconnection')" placement="bottom" effect="light" popper-class="custom">
                                <span class="circle-status color5"></span>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.power')" :min-width="3">
                        <template slot-scope="scope">
                            {{scope.row.power + "kW"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.connector')" :width="100">
                        <template slot-scope="scope">
                            <Connector v-for="(item, idx) in scope.row.connectorList" :key="idx" :dataObj="item" :isBreak="true"></Connector>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.type')" :min-width="2" class-name="center">
                        <template slot-scope="scope">
                            {{ scope.row.chargeType === 1 ? "AC" : "DC" }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.elecRate')">
                        <el-table-column :label="$t('chargingStation.onPeak')" :min-width="3">
                            <template slot-scope="scope">
                                {{ scope.row.currency + scope.row.onPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[scope.row.onPeakElectricityRateType]}}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('chargingStation.offPeak')" :min-width="3">
                            <template slot-scope="scope">
                                {{ scope.row.currency + scope.row.offPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[scope.row.offPeakElectricityRateType]}}
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <!-- <el-table-column prop="stationName" :label="$t('chargingStation.station')" :min-width="7"></el-table-column> -->
                    <!-- <el-table-column  :label="$t('general.location')" :width="88" class-name="center">
                        <template slot-scope="scope"></template>
                    </el-table-column>
                    -->
                    <el-table-column :label="$t('general.action')" :width="146">
                        <template slot-scope="scope">
                            <el-tooltip :content="scope.row.loc.lon+','+scope.row.loc.lat" placement="bottom" effect="light" popper-class="custom">
                                <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                            </el-tooltip>
                            <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="deleteCheckBox(scope.row.chargeBoxId)"></el-button>
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
            <!-- <EditChargeBox name="chargeBox" :show="dialogVisible" :dialog="dialog" :stationList="stationList" @close="closeDialog"></EditChargeBox> -->
            <EditChargeBox name="chargeBox" :show="dialogVisible" :dialog="dialog" @close="closeDialog"></EditChargeBox>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="closeShowPosDialog" ></ShowPostion>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import EditChargeBox from "@/components/chargingStation/editChargeBox";
import ShowPostion from "@/components/chargingStation/showPostion";
import { $GLOBAL_CURRENCY } from '@/utils/global';
import { $HTTP_getChargeBoxList, $HTTP_getZipCodeListForSelect, $HTTP_addChargeBox, $HTTP_updateChargeBox, $HTTP_deleteChargeBox } from "@/api/api";
import Connector from "@/components/chargingStation/connector";
export default {
    components: {
        EditChargeBox,
        ShowPostion,
        Connector
    },
    data() {
        return {
            lang: '',
            accPermissionType: '',
            operatorList: {},
            filter: {
                tmpSearch: '',
                search: '',
                // stationId: '',
                zipCode: '',
                operatorTypeId: '',
                connectorStatus: ''
            },
            isLoading: false,
            // stationList: {
            //     isLoading: false,
            //     data: {}
            // },
            loctionList: {
                isLoading: false,
                data: []
            },
            tableData: [],
            page: 1,
            total: 0,
            currencyList: $GLOBAL_CURRENCY,
            dialogVisible: false,
            dialog: {
                visible: false,
                type: 0,
                info: {
                    chargeBoxId: '',
                    // chargeBoxName: '',
                    loc: {
                        lng: '',
                        lon: '',
                        lat: ''
                    },
                    stationId: '',
                    chargeType: 1,
                    unitType: '',
                    onPeakElectricityRate: 0,
                    onPeakElectricityRateType: 1,
                    offPeakElectricityRate: 0,
                    offPeakElectricityRateType: 1,
                    parkingRate: 0,
                    installationDate: '',
                    operatorTypeId:　''
                }
            },
            mapDialog: {
                visible: false,
                itemId: '',
                position: {
                    lat: '',
                    lng: ''
                }
            },
            connectorList: []
        }
    },
    created() {
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user'));
        this.lang = window.sessionStorage.getItem('fiics-lang');
        this.operatorList = userData.operatorList;
        this.filter.operatorTypeId = userData.operatorId;
        this.accPermissionType = userData.accountInfo.accPermissionType;
        this.connectorList.push(i18n.t('general.all'));
        this.connectorList = this.connectorList.concat(i18n.t('chargingStation.connectorList').filter(item => item !== ''));
    },
    mounted() {
        // const that = this;
        // this.fetchStationList(()=>{ that.fetchData()});
        setScrollBar('.scroll', this);
        this.fetchData();
        this.fetchLocationList();
    },
    beforeDestroy() {
        this.dialog.map && google.maps.event.clearListeners(this.dialog.map, 'click');
    },
    methods: {
        /*fetchStationList(callBack) {
            const that = this;
            this.stationList.isLoading = true;
            this.isLoading = true;
            $HTTP_getStationListForSelect().then((data) => {
                this.stationList.isLoading = false;
                if (!!data.success) {
                    data.stationList.forEach(item => {
                        that.stationList.data[item.stationId] = item.stationName;
                    });
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
                callBack && callBack();
            }).catch((err) => {
                this.stationList.isLoading = false;
                this.isLoading = false;
                console.log('StationList', err);
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },*/
        fetchLocationList() {
            const that = this;
            this.loctionList.isLoading = true;
            $HTTP_getZipCodeListForSelect().then((data) => {
                this.loctionList.isLoading = false;
                if (!!data.success) {
                    this.loctionList.data = data.zipCodeList.slice();
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('loctionList', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            let param = {};
            if (this.filter.operatorTypeId && this.filter.operatorTypeId != '1') {
                param.operatorTypeId = this.filter.operatorTypeId;
            }
            if (this.filter.zipCode) {
                param.zipCode = this.filter.zipCode;
            }
            if (this.filter.connectorStatus) {
                param.connectorStatus = this.filter.connectorStatus;
            }
            if (type) {
                this.filter.search = this.filter.tmpSearch;
            }
            // if (this.filter.stationId) {
            //     param.stationId = this.filter.stationId;
            // }
            param.search = this.filter.search;
            $HTTP_getChargeBoxList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.chargeBoxList.map(item => {
                        item.currency = $GLOBAL_CURRENCY[item.unitType];
                        // item.stationName = that.stationList.data[item.stationId];
                        return item;
                    });
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
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
            } else {
                if (this.accPermissionType < 3) {
                    this.dialog.info.operatorTypeId = this.filter.operatorTypeId > 0 ? this.filter.operatorTypeId : '';
                } else {
                    this.dialog.info.operatorTypeId = this.filter.operatorTypeId;
                }
            }
            if (this.accPermissionType < 3) {
                this.dialog.operatorList = this.operatorList;
            }
            this.dialog.accPermissionType = this.accPermissionType;
            this.dialogVisible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        deleteCheckBox(id) {
            const that = this;
            this.$confirm(i18n.t('general.deleteItem', { item: id }), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'custom'
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
        closeDialog(isUpdated) {
            this.dialogVisible = false;
            if(isUpdated) {
                this.fetchData();
            }
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        handleShowDialog(data) {
            this.mapDialog.itemId = data.chargeBoxId;
            this.mapDialog.position = data.loc;
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeShowPosDialog() {
            this.mapDialog.visible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        handleRowClick(row, column, event) {
            if ($(event.path[0]).attr('class')!==undefined && $(event.path[0]).attr('class').includes('cell')) {
                const data = Object.assign({}, row);
                window.sessionStorage.setItem('fiics-chargePointInfo', JSON.stringify(data));
                this.$router.push({ name: "chargePointDetail", params: data }).catch();
            }
        },
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
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
    .filter .dark.el-select.long {
        width: 240px;
    }
}
</style>