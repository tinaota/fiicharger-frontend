<template>
    <el-dialog :title="$t('chargingStation.startReservation')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="dialogForm">
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                <div class="info">{{ data.name }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                <div class="info">{{ data.chargePointId }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.connector') }}</div>
                <div class="info">{{ data.connectorId + ' ' + data.connectorType }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('menu.idTag') }}</div>
                <el-select class="select-small info" v-model="param.idTag" filterable v-loading="idTagList.isLoading">
                    <el-option v-for="item in idTagList.data" :label="item.id" :key="item.id" :value="item.id"></el-option>
                </el-select>
            </div>
        </div>
        <p style="text-align:center;">
            <el-button size="small" type="primary" @click="reserveNow">{{ $t('general.perform') }}</el-button>
        </p>
    </el-dialog>
</template>

<script>
import {
    $HTTP_getIdTagsList,
    $HTTP_reserveNow
} from "@/api/api";

export default {
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false,
            param: {
                idTag: "",
            },
            idTagList: {
                isLoading: false,
                data: []
            },
            isUpdateReservation: false
        };
    },
    watch: {
        show: {
            handler() {
                this.visible = this.show;
            }
        },
    },
    mounted() {
        this.fetchIdTags();
    },
    methods: {
        fetchIdTags() {
            this.idTagList.isLoading = true;
            $HTTP_getIdTagsList()
                .then((res) => {
                    this.idTagList.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.idTagList.data = res.data;
                    }
                })
                .catch((err) => {
                    this.idTagList.data = [];
                    console.log("idTagListError", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        reserveNow() {
            const that = this;
            let params = {
                chargePointId: that.data.chargePointId,
                connectorId: parseInt(that.data.connectorId),
                idTag: that.param.idTag
            };
            that.isLoading = true;
            $HTTP_reserveNow(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res === "Accepted") {
                        that.$message(res);
                        that.visible = false;
                        this.isUpdateReservation = true;
                        this.$message({
                            type: "success",
                            message: res
                        });
                    }
                })
                .catch((err) => {
                    console.log('reserveNow', err)
                    that.visible = false;
                    that.isLoading = false;
                    that.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        closeDialog() {
            this.param = {
                connectorId: "",
                idTag: "",
                expiryDate: ""
            };
            this.$emit("close", this.isUpdateReservation);
        }
    }
};
</script>

<style lang = "scss" scoped>
.el-button {
    background: #0263ff;
    color: #fff;
    border: unset;
    font-size: 1rem;
    width: 130px;
    height: 50px;
    border-radius: 6px;
    text-align: center;
}
</style>
