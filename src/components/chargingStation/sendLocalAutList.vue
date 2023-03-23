<template>
<div>
  
       


    <el-dialog
    
    :title="$t('chargingStation.getLocalAuthListVersion')"
    :visible.sync="visible"
    @close="closeDialog()">
           <div class="result-content" v-loading="isLoading">
            <div class="firmware"> <h3>{{ $t('sendLocalList.localAuthListVersion') }}:</h3> <span>{{ versionData }}</span></div>
        </div>
            <hr/>
            <div class="el-dialog__header2">
              <span class="el-dialog__title2">
                        {{ $t('chargingStation.sendLocalAuthList') }}
                    </span>
                    </div>

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
                    <el-radio v-for="item in updateTypeList.data" :label="item.value" :key="item.value">{{ item.name }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item v-show="sendListData.updateType === 'Differential'">
                <div class="label">{{ $t('sendLocalList.addUpdateList') }}</div>
                <el-select v-model="sendListData.idtags" multiple :placeholder="$t('general.select')">
                    <el-option v-for="item in idtagList" :key="item.id" :label="item.value" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-show="sendListData.updateType === 'Differential'">
                <div class="label">{{ $t('sendLocalList.deleteList') }}</div>
                <el-select v-model="sendListData.deletedIdtags" multiple :placeholder="$t('general.select')">
                    <el-option v-for="item in idtagList" :key="item.id" :label="item.value" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-show="sendListData.updateType === 'Full'">
                <div class="label">{{ $t('sendLocalList.addUpdateList') }}</div>
                <el-select v-model="sendListData.idtags" multiple :placeholder="$t('general.select')">
                    <el-option v-for="item in idtagList" :key="item.id" :label="item.value" :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button class="btn-left" size="small" type="danger" @click="clearListHandler('clearList')">{{ $t('actions.clearList') }}</el-button>
            <el-button size="small" @click="closeDialog">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="sendAuthLocalListHandler">{{ $t('general.ok') }}</el-button>
        </div>
    </el-dialog>
    <CommonPopup :show="commonpopup.show" v-if="commonpopup.show" :chargePointId="commonpopup.chargePointId" :action="commonpopup.action" @close="closeCommonPopup()"></CommonPopup>
    </div>
</template>

<script>
import {$HTTP_getIdTagsList,$HTTP_sendAuthLocalList} from "@/api/api";
import { $HTTP_getLocalAuthListVersion } from "@/api/api";
import i18n from '../../lang/lang';
import CommonPopup from "@/components/commonPopup";
import { catchErrors } from "@/utils/function";
export default {
    components: {
        CommonPopup
    },
    props: {
        chargePointId: String,
        show: Boolean
    },
    data() {
        return {
            versionData: "",
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
                updateType: 'Full',
                idtags: [],
                deletedIdtags: [],
                clearList: false
            },
            updateTypeList: {
                isLoading: false,
                data: [
                    {
                        value: "Full",
                        name: i18n.t("general.full")
                    },
                    {
                        value: "Differential",
                        name: i18n.t("general.differential")
                    }
                ]
            },
            idtagList: [],
            confirmVisible: false,
            commonpopup: {
                show: false,
                chargePointId: null,
                action: ""
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
                    this.getIdtagList();
                      that.$nextTick(() => {
                        this.getVersion(this.$props.chargePointId)
                    });
                }
            }
        },
        chargePointId: function(newVal){
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
                updateType: 'Full',
                idtags: [],
                deletedIdtags: [],
                clearList: false
            }
        },
               getVersion(id){
            this.isLoading = true;
            const that = this;
            const param = {
                chargePointId: id
            }
            $HTTP_getLocalAuthListVersion(param)
                .then( res => {
                    this.isLoading = false;
                    this.versionData = res;
                })
                .catch( err => {
                    this.isLoading = false;
                    let errorMessage = catchErrors("get local auth list", err);
                    this.$message({ type: "warning", message: errorMessage });
                })
            },
        getIdtagList(){
            $HTTP_getIdTagsList()
                .then(res =>{
                    this.idtagList = res.data;
                })
                .catch(() => {
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
                .catch( (err) => {
                    that.isLoading = false;
                    let errorMessage = catchErrors("getCompositeSchedule", err);
                    that.$message({ type: "warning", message: errorMessage });
                    })
        },
        closeDialog() {
            this.initData();
            this.$emit('close', false);
        },
        closeCommonPopup() {
            this.commonpopup.show = false;
            this.commonpopup.chargePointId = null;
            this.commonpopup.action = "";
        },
        clearListHandler(action) {
            this.commonpopup.show = true;
            this.commonpopup.chargePointId = this.$props.chargePointId;
            this.commonpopup.action = action;
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

    .dialog-footer{
        clear: both;
        .btn-left{
            float: left;
        }
    }
    @media only screen and (max-width: 1280px) {
        button{
            margin-bottom: 5px;
        }
    }
</style>
