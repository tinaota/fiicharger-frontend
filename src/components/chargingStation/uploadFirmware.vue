<template>
    <el-dialog
        :title="$t('chargingStation.uploadFirmware')"
        :visible.sync="visible"
        width="600px"
        v-loading="isLoading"
        @close="closeDialog()"
        >
        <el-upload
            ref="uploadFile"
            class="upload-demo"
            :action="apiUrl"
            :data="uploadParams"
            accept="application/octet-stream, application/x-zip-compressed, application/x-rar-compressed, text/plain"
            :limit="1"
            :auto-upload="false"
            :on-exceed="handleExceed"
            :before-upload="onBeforeUploadFile"
            :on-error="handleError"
            :on-change="handleFileChange"
            :file-list="fileList">
            <el-button size="small" type="primary">{{ $t('general.upload') }}</el-button>
        </el-upload>
        <div slot="footer" class="dialog-footer">
            <el-button @click="closeDialog()">{{ $t('general.cancel') }}</el-button>
            <el-button type="primary" @click="uploadFileData">{{ $t('general.ok') }}</el-button>
        </div>
    </el-dialog>
</template>

<script>
import { $HTTP_uploadFirmwareFile } from "@/api/api";
export default {
    props: {
        chargePointId: String,
        show: Boolean
    },
    data() {
        return {
            visible: false,
            isLoading: true,
            apiUrl: "",
            uploadParams: {},
            fileList: []
        };
    },
    watch: {
        show: {
            deep: true,
            handler(){
                this.visible = this.show;
                if (this.visible) {
                    this.$nextTick()
                }
            }
        }
    },
    methods: {
        onBeforeUploadFile(file){
            const fileTypes = ["rar", "zip", "txt"];
            const fileExt = file.name.substring(file.name.lastIndexOf(".") + 1),
                flag = fileTypes.find((fileItem) => fileItem === fileExt);

            flag == undefined && this.$message.error(i18n.t("general.errFile"));
            if (flag) {
                this.isLoading = true;
            }
            return flag;
        },
        handleExceed() {
            this.$message.warning(i18n.t("general.onlyOneFile"));
        },
        handleError() {
            this.isLoading = false;
            this.$refs.uploadFile.clearFiles();
            this.$message({ type: "error", message: i18n.t("error_network") });
        },
        handleFileChange(file, fileList) {
            this.fileList = fileList;
        },
        uploadFileData(){
            this.isLoading = true;
            const formData = new FormData();
            formData.append('file', this.fileList[0]?.raw)
            const params = {
                category: "Firmware",
                chargePointId: this.$props.chargePointId,
                formData: formData,
                config: this.fileList[0]?.raw?.type
            };
            $HTTP_uploadFirmwareFile(params)
                .then( res => {
                    this.isLoading = false;
                    this.$message({type: "success", message: i18n.t("general.sucAddMsg")})
                    this.fileList = [];
                    this.$refs.uploadFile.clearFiles();
                    this.closeDialog();
                })
                .catch( err => {
                    this.isLoading = false;
                    this.$message({ type: "warning", message: this.lang === "en" ? response.message : response.reason });
                    this.fileList = [];
                })
        },
        closeDialog(){
            this.fileList = [];
            this.$emit('close', false);
        }
    }
}
</script>
