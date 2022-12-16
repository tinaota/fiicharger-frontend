<template>
    <el-dialog
        :title="$t('chargingStation.updates')"
        :visible.sync="visible"
        width="600px"
        @close="closeDialog()">
        <!-- <h3 class="title">
            {{ $t('chargingStation.currentFirmwareVersion') }}:
            <span v-if="currentVersion"> {{ currentVersion }} </span>
        </h3> -->
        <p v-show="lastFirmwareFileName">
            <span class="title">{{ $t('chargingStation.fileName') }}: </span>
            {{ lastFirmwareFileName }}
        </p>
        <p v-show="lastFirmwareFileName != '' && updateStatus">
            <span class="title">{{ $t('general.status') }}: </span>
            <span v-if="updateStatus == 'Downloading' || updateStatus == 'Installing' || updateStatus == 'Downloaded' || updateStatus == 'Waiting'" class="updateWaiting"><i class="el-icon-loading"></i>{{ updateStatus }}</span>
            <span v-else-if="updateStatus == 'Installed' || updateStatus == 'Idle' " class="updateSuccess"><i class="el-icon-check"></i>{{ updateStatus }}</span>
            <span v-else-if="updateStatus == 'DownloadFailed' || updateStatus == 'InstallationFailed'" class="updateFailed"><i class="el-icon-close"></i>{{ updateStatus }}</span>
        </p>
        <br/>
        <div class="content-warp" v-loading="isLoading">
            <div class="result-content">
                <el-table class="updatesTable"
                    :data="firmwareList"
                    style="width: 100%">
                    <el-table-column
                        prop="fileName"
                        :label="$t('chargingStation.fileName')"
                        width="200">
                    </el-table-column>
                    <el-table-column
                        prop="modified"
                        :label="$t('general.time')">
                    </el-table-column>
                    <el-table-column
                        prop="sizeString"
                        :label="$t('chargingStation.fileSize')">
                    </el-table-column>
                    <el-table-column
                        :label="$t('general.action')">
                        <template slot-scope="scope">
                            <el-button type="primary" class="actionFunction" @click="installHandler(scope.row)">{{ $t('general.install') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="total">{{ $t("general.result", {item:total}) }}</div>
            <el-pagination
                background
                layout="prev, pager, next"
                :total="total"
                :pager-count="5"
                :page-size="limit"
                :current-page.sync="page"
                :hide-on-single-page="false"
                @current-change="changePage"
                v-show="total > 0">
            </el-pagination>
        </div>

    </el-dialog>
</template>

<script>
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import {
    $HTTP_getFileList,
    $HTTP_getChargePointById,
    $HTTP_postUpdateFirmware,
    $HTTP_getUpdateFirmwareStatus
} from "@/api/api";
import { transformUtcToLocTime } from "@/utils/function";
import moment from "moment";
export default {
    props: {
        chargePointId: String,
        show: Boolean
    },
    data() {
        return {
            visible: false,
            isLoading: true,
            currentVersion: '',
            lastFirmwareFileName: '',
            updateStatus: '',
            firmwareList: [],
            firmwareFileParam: {
                category: "Firmware",
                orderBy: "Modified",
                isDescending: true
            },
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT,
            total: 0,
            loopingStatus: ''
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
                        if(!!that.$props.chargePointId){
                            that.getFirmwareList(that.$props.chargePointId);
                            that.getChargePoint(that.$props.chargePointId);
                        }

                    });
                }
            }
        }
    },
    methods: {
        getFirmwareList(id){
            if(!id){ return false;}
            this.isLoading = true;
            const that = this;
            const params = {
                category: this.firmwareFileParam.category,
                chargePointId : this.$props.chargePointId,
                param: {
                    OrderBy: this.firmwareFileParam.orderBy,
                    isDescending: this.firmwareFileParam.isDescending
                }
            };
            $HTTP_getFileList(params)
                .then(res => {
                    that.isLoading = false;
                    res.data.forEach( item => {
                        item.modified = transformUtcToLocTime(item.modified)
                    });
                    that.firmwareList = res.data;
                    that.total = res.metadata.totalRows;
                })
                .catch(err => {
                    that.isLoading = false;
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        getChargePoint(id){
            if(!id){ return false;}
            this.isLoading = true;
            const that = this;
            const param = {
                chargePointId: id
            };
            $HTTP_getChargePointById(param)
                .then( res => {
                    that.lastFirmwareFileName = (!!res.lastFirmwareFileName)? res.lastFirmwareFileName: "";
                    that.updateStatus = res.firmwareStatus;
                    if(res.firmwareStatus == "Downloaded" || res.firmwareStatus == "Downloading" || res.firmwareStatus == "Installing"){
                        that.loopingStatus = setInterval( () => {that.getStatus(that.$props.chargePointId)}, 5000);
                        setTimeout(function(){  // Stop Loop for 0.5 hour
                            that.updateStatus = "Idle";
                            that.stopLooping(that.loopingStatus);
                        }, 1800000);
                    }
                })
                .catch( err => {
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        installHandler(data){
            const that = this;
            this.isLoading = true;
            const param = {
                chargePointId: this.$props.chargePointId,
                param: {
                    firmwareName: data.fileName,
                    retrieveDate: moment().format()
                }
            }
            $HTTP_postUpdateFirmware(param)
                .then( res => {
                    that.isLoading = false;
                    if(res === "Accepted"){
                        that.updateStatus = "Waiting";
                        that.lastFirmwareFileName = data.fileName;
                        that.loopingStatus = setInterval( () => {that.getStatus(that.$props.chargePointId)}, 5000);
                        setTimeout(function(){  // Stop Loop for 0.5 hour
                            that.updateStatus = "Idle";
                            that.stopLooping(that.loopingStatus);
                        }, 1800000);
                    }
                })
                .catch( err => {
                    that.isLoading = false;
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                })
        },
        getStatus(id){
            const that = this;
            const params = {
                chargePointId: id
            };
            $HTTP_getUpdateFirmwareStatus(params)
                .then( res => {
                    console.log("🚀 getStatus ~ res", res)
                    // Downloaded, DownloadFailed, Downloading, Idle, InstallationFailed, Installing, Installed
                    let _status = res;
                    that.updateStatus = _status;
                    switch (_status){
                        case "Installed":
                            that.stopLooping(that.loopingStatus);
                            break;
                        case "InstallationFailed" :
                            that.stopLooping(that.loopingStatus);
                            break;
                        case "DownloadFailed":
                            that.stopLooping(that.loopingStatus);
                            break;
                        case "Idle":
                            that.stopLooping(that.loopingStatus);
                            break;
                    }
                })
                .catch( err => {
                    that.stopLooping(that.loopingStatus);
                    that.updateStatus = "InstallationFailed";
                    console.log("HTTP_getUpdateFirmwareStatus err: " , err)
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        stopLooping(time){
            clearInterval(time);
        },
        changePage(page) {
            this.page = page;
        },
        closeDialog() {
            this.$emit('close', false);
        }
    }
}
</script>
<style lang = "scss" scoped>
.title{
    font-weight: bold;
    font-size: 1.17rem;
}
.updateWaiting{
    color: gray;
}
.updateSuccess{
    color: green;
}
.updateFailed{
    color: red;
}
.result-content{
    min-height: 300px;
}
.content-warp{
    position: relative;
    .total{
        position: absolute;
        bottom: 0;
        right: 0;
    }
}
</style>
