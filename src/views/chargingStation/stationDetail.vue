<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/station' }">{{ $t('menu.station') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.stationId + " " + curRouteParam.stationName }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8">
                <div class="header">{{ $t('chargingStation.stationInfo')}}</div>
                <el-table
                    :data="[stationInfo]"
                    v-loading="isLoading"
                    class="center">
                    <el-table-column prop="stationId" :label="$t('chargingStation.stationID')" :min-width="2"></el-table-column>
                    <el-table-column prop="stationName" :label="$t('chargingStation.stationName')" :min-width="3"></el-table-column>
                    <el-table-column prop="zipCode" :label="$t('general.zipCode')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('general.address')" :min-width="5">
                        <template slot-scope="scope">
                            {{ scope.row.address }}
                            <el-tooltip :content="scope.row.loc.lon+','+scope.row.loc.lat" placement="bottom" effect="light" popper-class="custom">
                                <el-button class="no-bg loc" @click="handleShowDialog(scope.row)"></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.businessHours')" :min-width="5">
                        <template slot-scope="scope">
                            {{ scope.row.serviceStartTime + '-' + scope.row.serviceEndTime }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('userAccount.countryCode')" :min-width="5">
                        <template slot-scope="scope">
                            {{ scope.row.countryCode + ' ' + scope.row.phone }}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="card-8">
                <div class="header">{{ $t('menu.summary')}}</div>
                <el-table
                    :data="[summary]"
                    v-loading="isLoading"
                    class="center thNoBorder statistic">
                    <el-table-column prop="chargeBoxCount" :label="$t('support.total')" :min-width="2"></el-table-column>
                    <el-table-column prop="acChargeBoxInfo.count" :label="$t('chargingStation.nAC')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('chargingStation.acConnectors')" :min-width="3">
                        <template slot-scope="scope">
                            <div v-for="(item, idx) in scope.row.acChargeBoxInfo.chargeConnectorTypeList" :key="idx">
                                {{ item.count }}
                                <span class="unit">{{ '(' + item.name +')' }}</span>
                            </div>
                            <div v-if='scope.row.acChargeBoxInfo.chargeConnectorTypeList.length==0'>0</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="dcChargeBoxInfo.count" :label="$t('chargingStation.nDC')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('chargingStation.dcConnectors')" :min-width="3">
                        <template slot-scope="scope">
                            <div v-for="(item, idx) in scope.row.dcChargeBoxInfo.chargeConnectorTypeList" :key="idx">
                                {{ item.count }}
                                <span class="unit">{{ '(' + item.name +')' }}</span>
                            </div>
                            <div v-if='scope.row.dcChargeBoxInfo.chargeConnectorTypeList.length==0'>0</div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.curPowerConsumption')" :min-width="3">
                        <template slot-scope="scope">
                            {{ scope.row.chargeBoxTotalPower }}
                            <span class="unit">kW</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="card-8">
                <div class="header">{{ $t('chargingStation.smartChargingSetting')}}</div>
                <el-table
                    :data="[smartChargingSettingInfo]"
                    v-loading="isLoading"
                    class="center">
                    <el-table-column :label="$t('chargingStation.smartCharging')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.onOffStatus ? $t('general.enable'):$t('general.disable') }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.onPeakDemandMaxLimit')" :min-width="3">
                        <template slot-scope="scope">
                            {{ scope.row.maxDemandPowerLimit + "kW"}}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.csMaxPower')+'/'+$t('chargingStation.intervalTime')" :min-width="3">
                        <template slot-scope="scope">
                            {{ scope.row.intervalMaxPower + "kW" + '/' + scope.row.intervalTime + $t('chargingStation.elecRateUnit')[1]}}
                        </template>
                    </el-table-column>
                    <!-- <el-table-column :label="$t('general.action')" :min-width="2">
                        <el-button class="no-bg edit" @click="openSmartSettingDialog"></el-button>
                    </el-table-column> -->
                </el-table>
            </div>
            <div class="card-8">
                <div class="header">{{ $t('general.detail')}}</div>
                <div class="chargePoint" v-for="(item, idx) in smartChargingConnectorAnalysisInfo" :key="idx" v-loading="isLoading">
                    <div class="title" @click="goChargePointDetail(item.chargeBoxId)">{{ item.chargeBoxName }}</div>
                    <ConnectorDetail v-for="(connector, i) in item.connectorList" :data="connector" :key="i" :class="{'even': (i%2==1)}"></ConnectorDetail>
                </div>
            </div>
            <!-- 功能尚未確定 -->
            <!-- <el-dialog
                :title="$t('general.modify')"
                width="400px"
                :visible.sync="smartSettingDialog.visible"
                :show-close="false"
                v-loading="smartSettingDialog.isLoading"
                @close="closeSmartSettingDialog">
                <div class="vertial formVertical">
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.smartCharging') }}</div>
                        <el-switch v-model="smartSettingDialog.info.onOffStatus" active-color="#0263FF" inactive-color="#D5D4D4"></el-switch>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.onPeakDemandMaxLimit') + '(kw)' }}</div>
                        <el-slider
                            v-model="smartSettingDialog.info.maxDemandPowerLimit"
                            :min="0"
                            :max="smartSettingDialog.info.intervalMaxPower"
                            :step="5">
                        </el-slider>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.csMaxPower')+ '(kw)' }}</div>
                        <el-input v-model="smartSettingDialog.info.intervalMaxPower" disabled></el-input>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.intervalTime') }}</div>
                        <el-select
                            class="select-small"
                            v-model="smartSettingDialog.info.intervalTime">
                            <el-option v-for="item in smartSettingDialog.intervalTimeList" :label="item + ' ' + $t('chargingStation.elecRateUnit')[1]" :key="item" :value="item"></el-option>
                        </el-select>
                    </div>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button size="small" @click="smartSettingDialog.visible = false">{{ $t('general.cancel') }}</el-button>
                    <el-button size="small" type="primary">{{ $t('general.ok') }}</el-button>
                </span>
            </el-dialog> -->
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="closeShowPosDialog" ></ShowPostion>
        </div>
    </div>
</template>

<script>
import { $HTTP_getStationDetail } from "@/api/api";
import { setScrollBar } from "@/utils/function";
import ShowPostion from "@/components/chargingStation/showPostion";
import ConnectorDetail from "@/components/chargingStation/connectorDetail";
export default {
    components: {
        ShowPostion,
        ConnectorDetail
    },
    data() {
        return {
            curRouteParam: {
                stationId: '',
                stationName: ''
            },
            lang: '',
            isLoading: false,
            stationInfo: {
                zipCode: '',
                address: '',
                loc: {
                    lng: '',
                    lon: '',
                    lat: ''
                },
                serviceStartTime: '',
                serviceEndTime: '',
                countryCode: '',
                phone: ''
            },
            summary: {
                chargeBoxCount: 0,
                acChargeBoxInfo: {
                    count: 0,
                    chargeConnectorTypeList: []
                },
                dcChargeBoxInfo: {
                    count: 0,
                    chargeConnectorTypeList: []
                },
                chargeBoxTotalPower: 0,
            },
            smartChargingSettingInfo: {
                onOffStatus: 0,
                maxDemandPowerLimit: 0,
                intervalMaxPower: 0,
                intervalTime: 5
            },
            smartChargingConnectorAnalysisInfo: [],
            mapDialog: {
                visible: false,
                itemId: '',
                position: {
                    lat: '',
                    lng: ''
                }
            },
            smartSettingDialog: {
                visible: false,
                info: {
                    onOffStatus: false,
                    maxDemandPowerLimit: 0,
                    intervalMaxPower: 0,
                    intervalTime: 5
                },
                intervalTimeList: [5, 10, 15, 20, 30, 60]
            }
        }
    },
    created() {
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.stationId) {
            let temp = window.sessionStorage.getItem("fiics-stationInfo") ? JSON.parse(window.sessionStorage.getItem("fiics-stationInfo")) : null;
            if (!(temp && temp.stationId && temp.stationName)) {
                this.$router.go(-1);
            } else {
                this.curRouteParam = Object.assign({}, temp);
            }
        }
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        setScrollBar('.scroll', this);
        this.fetchStationDetail();

    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-stationInfo");
    },
    methods : {
        fetchStationDetail() {
            const that = this;
            let param = {
                stationId: that.curRouteParam.stationId
            };
            this.isLoading = true;
            $HTTP_getStationDetail(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.stationInfo = {
                                            stationId: data.stationInfo.stationId,
                                            stationName: data.stationInfo.stationName,
                                            zipCode: data.stationInfo.zipCode,
                                            address: data.stationInfo.address,
                                            loc: {
                                                lng: data.stationInfo.loc.lon,
                                                lon: data.stationInfo.loc.lon,
                                                lat: data.stationInfo.loc.lat
                                            },
                                            serviceStartTime: data.stationInfo.serviceStartTime,
                                            serviceEndTime: data.stationInfo.serviceEndTime,
                                            countryCode: data.stationInfo.countryCode,
                                            phone: data.stationInfo.phone
                                        };
                    this.summary = {
                                        chargeBoxCount: data.stationInfo.chargeBoxCount,
                                        acChargeBoxInfo: {
                                            count: data.stationInfo.acChargeBoxInfo.count,
                                            chargeConnectorTypeList: data.stationInfo.acChargeBoxInfo.chargeConnectorTypeList.slice()
                                        },
                                        dcChargeBoxInfo: {
                                            count: data.stationInfo.dcChargeBoxInfo.count,
                                            chargeConnectorTypeList: data.stationInfo.dcChargeBoxInfo.chargeConnectorTypeList.slice()
                                        },
                                        chargeBoxTotalPower: data.stationInfo.chargeBoxTotalPower
                                    };
                    this.smartChargingSettingInfo = Object.assign(data.smartChargingSettingInfo);
                    this.smartChargingConnectorAnalysisInfo = data.smartChargingConnectorAnalysisInfo.slice();
                } else {
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        handleShowDialog() {
            this.mapDialog.itemId = this.stationId;
            this.mapDialog.position = this.stationInfo.loc;
            this.mapDialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeShowPosDialog() {
            this.mapDialog.visible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        // openSmartSettingDialog() {
        //     this.smartSettingDialog.info = Object.assign({}, this,this.smartChargingSettingInfo);
        //     this.smartSettingDialog.info.onOffStatus = (this.smartSettingDialog.info.onOffStatus) ? true:false;
        //     this.smartSettingDialog.visible = true;
        //     this.$jQuery(".scroll").mCustomScrollbar("disable");
        // },
        // closeSmartSettingDialog() {
        //     this.$jQuery(".scroll").mCustomScrollbar("update");
        // }
        goChargePointDetail(chargeBoxId) {
            const params = {
                chargeBoxId: chargeBoxId
            }
            this.$router.push({ name: 'chargePointDetail', params: params});
        }
    }
}
</script>
<style lang = "scss" scoped>
.card-8 {
    .header {
        color: #151E25;
        font-size: 1.25rem;
    }
    .chargePoint {
        padding-top: 8px;
        .title {
            font-size: 1.125rem;
            color: #151E25;
            cursor: pointer;
        }
        .connector-obj.detail {
            display: inline-block;
            width: calc(50% - 6px);
            box-sizing: border-box;
            + .connector-obj.detail:not(.even) {
                margin-left: 0;
            }
        }
    }
}
</style>