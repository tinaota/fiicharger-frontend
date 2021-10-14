<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item :to="{ path: '/chargePoint' }">{{ $t('menu.chargePoint') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ "#" + curRouteParam.chargeBoxId }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8">
                <div class="charge-point-info">
                <div class="item">
                        <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                        <div class="content">{{ curRouteParam.chargeBoxName }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.chargePointID') }}</div>
                        <div class="content">
                            {{ curRouteParam.chargeBoxId }}
                            <el-tooltip :content="curRouteParam.loc.lon+','+curRouteParam.loc.lat" placement="right" effect="light" popper-class="custom">
                                <el-button class="no-bg loc" @click="handleShowDialog"></el-button>
                            </el-tooltip>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.power') }}</div>
                        <div class="content">{{ curRouteParam.power + "kW" }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.connector') }}</div>
                        <div class="content">
                            <Connector v-for="(item, idx) in curRouteParam.connectorList" :key="idx" :dataObj="item"></Connector>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('general.type') }}</div>
                        <div class="content">{{ curRouteParam.chargeType === 1 ? "AC" : "DC" }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.elecRate') }}</div>
                        <div class="content">{{ $t('chargingStation.onPeak') + ' '+ curRouteParam.currency + curRouteParam.onPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[curRouteParam.onPeakElectricityRateType] }}</div>
                    </div>
                    <div class="item">
                        <div class="label"></div>
                        <div class="content">{{ $t('chargingStation.offPeak') + ' '+ curRouteParam.currency + curRouteParam.offPeakElectricityRate + '/' +  $t("chargingStation.elecRateUnit")[curRouteParam.offPeakElectricityRateType] }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.parkingRate') }}</div>
                        <div class="content">{{ curRouteParam.currency + curRouteParam.parkingRate + '/' +  $t("chargingStation.parkingRateUnit")[curRouteParam.parkingRateType] }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('general.installationDate') }}</div>
                        <div class="content">{{ curRouteParam.installationDate }}</div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('menu.operator') }}</div>
                        <div class="content">{{ curRouteParam.operatorTypeName }}</div>
                    </div>
                </div>
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('menu.chargingSession')" name="chargingSession">
                            <ChargingSession :chargeBoxId="curRouteParam.chargeBoxId"></ChargingSession>
                        </el-tab-pane>
                        <el-tab-pane v-if="permissionShowAlertAble" :label="$t('menu.chargePointAlert')" name="chargePointAlert">
                            <ChargePointAlert :chargeBoxId="curRouteParam.chargeBoxId"></ChargePointAlert>
                        </el-tab-pane>
                        <!-- <el-tab-pane :label="$t('userAccount.reviewSummary')" name="review">
                            <Review :chargeBoxId="curRouteParam.chargeBoxId"></Review>
                        </el-tab-pane> -->
                    </el-tabs>
                </div>
            </div>
            <ShowPostion :itemId="mapDialog.itemId" :show="mapDialog.visible" :position="mapDialog.position" @close="()=> {this.mapDialog.visible=false}" ></ShowPostion>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import Connector from "@/components/chargingStation/connector";
import ShowPostion from "@/components/chargingStation/showPostion";
import ChargingSession from "@/components/chargingStation/chargingSession";
import ChargePointAlert from "@/components/chargingStation/chargingPointAlert";
import Review from "@/components/chargingStation/review";
export default {
    components: {
        Connector,
        ShowPostion,
        ChargingSession,
        ChargePointAlert,
        Review
    },
    data() {
        return {
            lang: '',
            permissionShowAlertAble: true,
            curRouteParam: {},
            active: 'chargingSession',
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
        const userData = JSON.parse(window.sessionStorage.getItem('fiics-user')),
              accPermissionType = userData.accountInfo.accPermissionType;
        if (accPermissionType === 6) {
            this.permissionShowAlertAble = false;
        }
        this.curRouteParam = this.$router.currentRoute.params;
        if (!this.curRouteParam.chargeBoxId) {
            let temp = window.sessionStorage.getItem("fiics-chargePointInfo") ? JSON.parse(window.sessionStorage.getItem("fiics-chargePointInfo")) : null;
            if (temp && temp.chargeBoxId
                // && temp.stationName
                // && temp.loc && temp.loc.lon && temp.loc.lat
                // && temp.address
            ) {
                this.curRouteParam = temp;
            } else {
                this.$router.go(-1);
            }
        }
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        setScrollBar('.scroll', this);
    },
    beforeDestroy() {
        window.sessionStorage.removeItem("fiics-chargePointInfo");
    },
    methods: {
        handleShowDialog() {
            this.mapDialog.itemId = this.curRouteParam.chargeBoxId;
            this.mapDialog.position = this.curRouteParam.loc;
            this.mapDialog.visible = true;
        },
        handleTabClick(tab, event) {}
    }
}
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .charge-point-info {
        margin-bottom: 28px;
        .item {
            margin-bottom: 12px;
            .label {
                display: inline-block;
                width: 180px;
                font-size: 1rem;
                color: #525E69;
                letter-spacing: 0;
            }
            .content {
                display: inline-block;
                width: calc(100% - 206px);
                font-size: 1rem;
                color: #151E25;
                letter-spacing: 0;
            }
        }
    }
}
</style>