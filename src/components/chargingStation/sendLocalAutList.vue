<template>
    <el-dialog
    :title="$t('chargingStation.sendLocalAuthList')"
    :visible.sync="visible"
    @close="closeDialog()">
        <el-form ref="form">
                <el-form-item>
                    <div class="label">
                        {{ $t('sendLocalList.listVersion') }}
                        <span style="color:red">*</span>
                    </div>
                    <el-input v-model="sendListData.listVersion" placeholder="Only Number" type="number"></el-input>
                </el-form-item>
            <el-form-item>
                <div class="label">{{ $t('sendLocalList.updateType') }}</div>
                <el-radio-group v-model="sendListData.updateType" size="medium">
                    <el-radio v-for="item in updateTypeList.data" :label="item.value" :key="item.value">{{item.name}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-show="sendListData.updateType === '0'">
                <div class="label">{{ $t('sendLocalList.addUpdateList') }}</div>
                <el-select v-model="sendListData.idtags" multiple :placeholder="$t('general.select')">
                    <el-option v-for="item in idtagList" :key="item.id" :label="item.id" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-show="sendListData.updateType === '0'">
                <div class="label">{{ $t('sendLocalList.deleteList') }}</div>
                <el-select v-model="sendListData.deletedIdtags" multiple :placeholder="$t('general.select')">
                    <el-option v-for="item in idtagList" :key="item.id" :label="item.id" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-show="sendListData.updateType === '1'">
                <div class="label">{{ $t('sendLocalList.addUpdateList') }}</div>
                <el-select v-model="sendListData.idtags" multiple :placeholder="$t('general.select')">
                    <el-option v-for="item in idtagList" :key="item.id" :label="item.id" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="danger" @click="confirmVisible = true">{{ $t('sendLocalList.clearListBtn') }}</el-button>
            <el-button size="small" @click="closeDialog">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="sendAuthLocalListHandler">{{ $t('general.ok') }}</el-button>
        </div>
        <el-dialog
            width="30%"
            :visible.sync="confirmVisible"
            append-to-body>
            <h4 style="color: red;">
                <i class="el-icon-warning"></i>
                {{ $t('sendLocalList.clearListMsg') }}
            </h4>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="confirmVisible = false">{{ $t('general.cancel') }}</el-button>
                <el-button size="small" type="primary" @click="clearListHandler">{{ $t('general.ok') }}</el-button>
        </div>
        </el-dialog>
    </el-dialog>
</template>

<script>
import {
    $HTTP_getIdTagsList,
    $HTTP_sendAuthLocalList,
    $HTTP_deleteAuthLocalList
} from "@/api/api";
export default {
    props: {
        chargePointId: String,
        show: Boolean
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            logTimeRange: [],
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                }
            },
            diagnosticsData: [],
            sendListData: {
                listVersion: '',
                updateType: '1',
                idtags: [],
                deletedIdtags: [],
                clearList: false
            },
            updateTypeList: {
                isLoading: false,
                data: [
                    {
                        value: "1",
                        name: "Full"
                    },
                    {
                        value: "0",
                        name: "Differential"
                    }
                ]
            },
            idtagList: [],
            confirmVisible: false
        }
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                if (that.visible) {
                    this.getIdtagList();
                    that.$nextTick(() => {});
                }
            }
        },
        chargePointId: function(newVal, oldVal){
            if(newVal == ''){
                return false;
            };
        },
        "sendListData.updateType": {
            handler: function(){
                this.sendListData.idtags = []
                this.sendListData.deletedIdtags = []
                this.sendListData.clearList = ''
            }
        }
    },
    methods: {
        initData() {
            this.sendListData = {
                listVersion: '',
                updateType: '1',
                idtags: [],
                deletedIdtags: [],
                clearList: false
            }
        },
        getIdtagList(){
            $HTTP_getIdTagsList()
                .then(res =>{
                    this.idtagList = res.data;
                })
                .catch(err => {
                    this.$message({ type: "warning", message: i18n.t("sendLocalList.getIdtagFiledMsg") });
                });
        },
        sendAuthLocalListHandler() {
            const that = this;
            this.isLoading = true;
            const param = {
                chargePointId: this.$props.chargePointId,
                param: {
                    listVersion: Number(this.sendListData.listVersion),
                    updateType: this.sendListData.updateType,
                    addedIdTags: JSON.parse(JSON.stringify(this.sendListData.idtags)),
                    deletedIdTags: JSON.parse(JSON.stringify(this.sendListData.deletedIdtags))
                }
            };
            $HTTP_sendAuthLocalList(param)
                .then( res => {
                    that.isLoading = false;
                    switch(res){
                        case "Accepted":
                            that.closeDialog();
                            that.$message({ type: "success", message: i18n.t("sendLocalList.accepted") });
                            break;
                        case "Failed":
                            that.$message({ type: "warning", message: i18n.t("sendLocalList.failed") });
                            break;
                        case "VersionMismatch":
                            that.$message({ type: "warning", message: i18n.t("sendLocalList.versionMismatch") });
                            break;
                        case "NotSupported":
                            that.$message({ type: "warning", message: i18n.t("sendLocalList.notSupported") });
                            break;
                    }
                })
                .catch( err => {
                    that.isLoading = false;
                    that.$message({ type: "warning", message: i18n.t("error_network") });
                })
        },
        clearListHandler(){
            this.confirmVisible = false;
            this.isLoading = true;
            const param = {
                chargePointId: this.$props.chargePointId
            };
            $HTTP_deleteAuthLocalList(param)
                .then( res => {
                    this.isLoading = false;
                    this.$message({ type: "success", message: i18n.t("sendLocalList.clearListSuccessMsg") });
                    this.closeDialog();
                })
                .catch( err => {
                    this.isLoading = false;
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                })
        },
        closeDialog() {
            this.initData();
            this.$emit('close', false);
        }
    }
}
</script>
<style lang = "scss" scoped>
    .el-dialog{
        width: 500px;
    }
    .el-select{
        width: 100%;
    }
</style>
