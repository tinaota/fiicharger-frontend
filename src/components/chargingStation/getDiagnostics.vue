<template>
    <el-dialog
    :title="$t('chargingStation.diagnostics')"
    :visible.sync="visible"
    @close="closeDialog()">
    <div>
        <el-date-picker
            v-model="logTimeRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            range-separator="-"
            :start-placeholder="$t('general.startDate')"
            :end-placeholder="$t('general.endDate')"
            :picker-options="pickerOptions"
            :clearable="true">
        </el-date-picker>
        <el-button type="primary" class="actionFunction" @click="getDiagnosticsHandler">{{ $t('general.get') }}</el-button>
    </div>
    <p v-if="currentFile.fileName !== '' && currentFile.fileName !== null ">
        {{currentFile.fileName}}
        <el-button v-if="currentFile.downloadStatus == 'Waiting'" icon="el-icon-loading" disabled>
            {{ $t('diagnostic.waitingBtn') }}
        </el-button>
        <el-button v-else-if="currentFile.downloadStatus == 'Uploading'" icon="el-icon-loading" disabled>
            {{ $t('diagnostic.uploadingBtn') }}
        </el-button>
        <span v-else-if="currentFile.downloadStatus == 'Uploaded'">
            <el-button type="success" icon="el-icon-download" @click="downloadHandler"></el-button><br/>
            <span style="color: blue;">{{ $t('diagnostic.uploadedMsg') }}</span>
        </span>
        <span v-else-if="currentFile.downloadStatus == 'Idle'">
            <el-button type="success" icon="el-icon-download" @click="downloadHandler"></el-button><br/>
            <span style="color: blue;">{{ $t('diagnostic.uploadedMsg') }}</span>
        </span>
        <span v-else-if="currentFile.downloadStatus == 'UploadFailed'">
            <el-button type="danger" icon="el-icon-close"></el-button><br/>
            <span style="color: red;">{{ $t('diagnostic.uploadFailedMsg') }}</span>
        </span>
    </p>

    <hr/>
    <div class="content-warp" v-loading="isLoading">
        <div class="result-content">
            <el-table
                :data="diagnosticsFileListData"
                style="width: 100%">
                    <el-table-column
                        prop="fileName"
                        :label="$t('chargingStation.fileName')"
                        width="300">
                    </el-table-column>
                    <el-table-column
                        prop="sizeString"
                        :label="$t('chargingStation.fileSize')">
                    </el-table-column>
                    <el-table-column
                        :label="$t('general.action')">
                        <template slot-scope="scope">
                            <el-button type="primary" class="actionFunction" icon="el-icon-download" @click="downloadHandler(scope.row)"></el-button>
                            <!-- <el-button type="danger" class="actionFunction" icon="el-icon-delete" @click="removeHandler(scope.row)"></el-button> -->
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
            @current-change="changePage">
        </el-pagination>
    </div>
    </el-dialog>
</template>

<script>
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import {
    $HTTP_postDiagnostics,
    $HTTP_getFileList,
    $HTTP_getChargePointById,
    $HTTP_getDownloadFile,
    $HTTP_getDiagnosticsStatus,
    $HTTP_sendTriggerMessage
} from "@/api/api";

import moment from "moment";
export default {
    props: {
        chargePointId: String,
        show: Boolean
    },
    data() {
        return {
            msgTriggerType: "DiagnosticsStatusNotification",
            diagnosticsFileParam: {
                category: "Diagnostics",
                orderBy: "modified",
                isDescending: true,
            },
            visible: false,
            isLoading: false,
            logTimeRange: [],
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT,
            total: 0,
            loopingStatus: '',
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                }
            },
            diagnosticsFileListData: [],
            currentFile: {
                fileName: '',
                downloadStatus: '',
                fileUrl: ''
            }
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
                        that.initData();
                        that.getDiagnosticsList();
                        (!!that.$props.chargePointId)? that.checkChargePointStatus(that.$props.chargePointId): '';
                    });
                }
            }
        }
    },
    methods: {
        initData() {
            this.logTimeRange = [];
        },
        getDiagnosticsList() {
            this.isLoading = false;
            const that = this;
            const params = {
                category: this.diagnosticsFileParam.category,
                chargePointId : this.$props.chargePointId,
                param: {
                    isDescending: this.diagnosticsFileParam.isDescending,
                    OrderBy: this.diagnosticsFileParam.orderBy
                }
            }
            $HTTP_getFileList(params)
                .then( res => {
                    that.isLoading = false;
                    that.diagnosticsFileListData = res.data;
                    that.total = res.metadata.totalRows;
                })
                .catch( err => {
                    that.isLoading = false;
                    that.$message({ type: "warning", message: i18n.t("diagnostic.fileListErrorMsg") });
                })
        },
        getDiagnosticsHandler() {
            if(this.$props.chargePointId === '' || this.logTimeRange.length == 0){
                return false;
            }
            const that = this;
            const param = {
                chargePointId: this.$props.chargePointId,
                param: {
                    startTime: moment(this.logTimeRange[0]).startOf('day').format(),
                    stopTime: moment(this.logTimeRange[1]).endOf('day').format()
                }
            };
            $HTTP_postDiagnostics(param)
                .then( res => {
                    if(res === ''){
                        that.$message({ type: "warning", message: i18n.t("diagnostic.emptyFileName") });
                        return false;
                    }
                    that.currentFile.fileUrl = res;
                    that.currentFile.fileName = res.split("/").pop();
                    that.currentFile.downloadStatus = "";
                    that.loopingStatus = setInterval( () => {that.getStatus(that.$props.chargePointId)}, 5000); // Call every 5 seconds
                    setTimeout(function(){  // Stop Loop for 0.5 hour
                        that.currentFile.downloadStatus = "Idle";
                        that.stopLooping(that.loopingStatus);
                    }, 1800000);
                })
                .catch( err => {
                    that.isLoading = false;
                    that.$message({ type: "warning", message: i18n.t("diagnostic.err_catch") });
                });
        },
        getStatus(id) {
            const that = this;
            const params = {
                chargePointId: id
            };
            $HTTP_getDiagnosticsStatus(params)
                .then( res => {
                    let _status = res;
                    console.log("getStatus: " , _status);
                    that.currentFile.downloadStatus = _status;
                    switch (_status){
                        case "Uploaded":
                            that.stopLooping(that.loopingStatus);
                            break;
                        case "Idle":
                            that.stopLooping(that.loopingStatus);
                            break;
                        case "UploadFailed":
                            that.stopLooping(that.loopingStatus);
                            break;
                    };
                })
                .catch( err => {
                    that.stopLooping(that.loopingStatus);
                    that.isLoading = false;
                    that.currentFile.downloadStatus = "UploadFailed";
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                })
        },
        stopLooping(time){
            clearInterval(time);
        },
        checkChargePointStatus(id){
            const that = this;
            const params = {
                chargePointId: id
            };
            $HTTP_getChargePointById(params)
                .then( res => {
                    let data = res;
                    if(data.lastDiagnosticsFileName == '' || data.lastDiagnosticsFileName == null){
                        return false;
                    }
                    that.currentFile.downloadStatus = data.diagnosticsStatus;
                    that.currentFile.fileName = data.lastDiagnosticsFileName;
                    if(data.diagnosticsStatus === "Uploading" || data.diagnosticsStatus === "Waiting") {
                        that.loopingStatus = setInterval( () => {that.getStatus(that.$props.chargePointId)}, 5000);
                        setTimeout(function(){  // Stop Loop for 0.5 hour
                            that.currentFile.downloadStatus = "UploadFailed";
                            that.stopLooping(that.loopingStatus);
                        }, 1800000)
                    }
                });
        },
        downloadHandler(data){
            this.isLoading = true;
            const that = this;
            const params = {
                category: this.diagnosticsFileParam.category,
                chargePointId : this.$props.chargePointId,
                filename: (!!data.fileName)? data.fileName:this.currentFile.fileName
            }
            $HTTP_getDownloadFile(params)
                .then( res => {
                    let blob = new Blob([res], { type: "text/plain"});
                    let _href = URL.createObjectURL(blob);
                    let _link = document.createElement("a");
                    document.body.appendChild(_link);
                    _link.href = _href;
                    _link.download = data.fileName;
                    _link.click();
                    document.body.removeChild(_link);
                    URL.revokeObjectURL(_href);
                    that.isLoading = false;
                })
                .catch( err => {
                    that.isLoading = false;
                    that.$message({ type: "warning", message: i18n.t("diagnostic.downloadFileFiled") });
                });
        },
        removeHandler(data){
            console.log("downloadHandler: ", data)
        },
        closeDialog() {
            this.initData();
            clearInterval(this.loopingStatus);
            this.$emit('close', 'diagnosticsDialog');
        },
        changePage(page) {
            this.page = page;
        },
        getTriggerMsg(){
            const that = this;
            const params = {
                chargePointId: this.$props.chargePointId,
                requestedMessage: this.msgTriggerType
            };
            $HTTP_sendTriggerMessage(params)
                .then((res) => {
                    switch(res) {
                        case "Accepted":
                            this.$message({ type: "success", message: i18n.t(`actions.triggerMessageAccepted`, {message: that.msgTriggerType}) });
                            that.loopingStatus = setInterval( () => {that.getStatus(that.$props.chargePointId)}, 5000);
                            that.currentFile.downloadStatus = "Waiting";
                            break;
                        case "Rejected":
                            this.$message.error(i18n.t(`actions.triggerMessageRejected`, {message: that.msgTriggerType}));
                            break;
                        case "NotImplemented":
                            this.$message({ type: "warning", message: i18n.t(`actions.triggerMessageNotImplemented`, {message: that.msgTriggerType}) });
                            break;
                        default:
                            this.$message({ type: "warning", message: res });
                    }
                })
                .catch((err) => {
                    console.log('remoteTrigger err:', err)
                    let _errors = err?.data?.errors ? Object.values(err?.data?.errors) : err?.data;
                    that.$message({type: "warning", message: _errors.toString()});
                })
        }
    }
}
</script>
<style lang = "scss" scoped>
.el-dialog{
    width: 600px;
}
.result-content{
    height: 400px;
    overflow-y: auto;
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
