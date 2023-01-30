<template>
    <el-dialog style="overflow:hidden" :title="dialogType==='create'?$t('general.create'):dialogType==='edit'?$t('general.modify'):$t('general.delete')" width="400px" height="400px" :visible.sync="visible" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="vertical formVertical">
            <div class="organization" v-if="dialogType==='create' || dialogType==='edit'">
                <el-form ref="updateOrganizationForm" :rules="rules" :model="dialogInfo">
                    <div class="form-item">
                        <el-form-item prop="name" style="margin-bottom:0">
                            <div class="label">{{ $t('general.name') }}<span style="color:red"><strong>* </strong></span></div>
                            <el-input class="inputLabel" v-model="dialogInfo.name" @change="updateStatus('baseApi')"></el-input>
                        </el-form-item>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.station') }}</div>
                        <el-select class="organizationSelect" v-model="dialogInfo.selectedStationList" v-loading="stationListIsLoading" multiple :placeholder="$t('general.select')" filterable @change="updateStatus('stationApi')">
                            <el-option v-for="item in stationList" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('menu.tariff') }}</div>
                        <el-select class="organizationSelect" v-model="dialogInfo.selectedTariffList" v-loading="tariffListIsLoading" multiple :placeholder="$t('general.select')" filterable @change="updateStatus('tariffApi')">
                            <el-option v-for="item in tariffList" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('chargingStation.charger') }}</div>
                        <el-select class="organizationSelect" v-model="dialogInfo.selectedChargerList" v-loading="chargerListIsLoading" multiple :placeholder="$t('general.select')" filterable @change="updateStatus('chargerApi')">
                            <el-option v-for="item in chargerList" :key="item.id" :label="item.name" :value="item.id">
                            </el-option>
                        </el-select>
                    </div>
                    <div class="form-item">
                        <el-form-item prop="website" style="margin-bottom:0">
                            <div class="label">{{$t('general.website')}}</div>
                            <el-input class="inputLabel" v-model="dialogInfo.website" @change="updateStatus('baseApi')"></el-input>
                        </el-form-item>
                    </div>
                    <div class="form-item">
                        <el-form-item prop="logo" style="margin-bottom:0">
                            <div class="label">{{ $t('userAccount.realLogo') }} URL</div>
                            <el-input class="inputLabel" v-model="dialogInfo.logo" @change="updateStatus('baseApi')"></el-input>
                        </el-form-item>
                    </div>
                    <div class="form-item">
                        <div class="label">{{ $t('general.user') }}</div>
                        <el-select class="organizationSelect" v-model="dialogInfo.selectedUserList" v-loading="userListIsLoading" multiple :placeholder="$t('general.select')" filterable @change="updateStatus('userApi')">
                            <el-option v-for="item in userList" :key="item.id" :label="item.email" :value="item.id">
                            </el-option>
                        </el-select>
                    </div>
                </el-form>
            </div>
            <div v-else>
                <!-- just for form validation -->
                <el-form ref="updateOrganizationForm" :rules="rules" :model="dialogInfo">
                    <div class="form-item">
                        {{ $t('general.deleteThis') }} {{ $t('menu.organization').toLowerCase() }}?
                    </div>
                </el-form>
            </div>
        </div>
        <span slot="footer" class="dialog-footer" style="position:absolute;bottom:10px;right:15px;">
            <el-button size="small" style="margin-bottom:5px" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" style="margin-bottom:5px" type="primary" @click="updateOrganization">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { setScrollBar, getNewlyAddedItems,getNewlyRemovedItems } from "@/utils/function";
import { $ALL_DATA_COUNT } from "@/utils/global";
import {
    $HTTP_addOrganizations,
    $HTTP_modifyOrganizationsById,
    $HTTP_deleteOrganizationsById,
    $HTTP_getAllChargeBoxList,
    $HTTP_bindChargersByOrganizationId,
    $HTTP_getBoundedChargersByOrganizationId,
    $HTTP_getOperatorList,
    $HTTP_bindUsersByOrganizationId,
    $HTTP_getBoundedUsersByOrganizationId,
    $HTTP_getStationList,
    $HTTP_getTarrifs,
    $HTTP_getBoundedStationsByOrganizationId,
    $HTTP_getBoundedTariffsByOrganizationId,
    $HTTP_bindStationsByOrganizationId,
    $HTTP_bindTariffsByOrganizationId
} from "@/api/api";
import { validateIsEmpty, validateNonEmptyImageUrl, validateNonEmptyWebUrl } from "@/utils/validation";
export default {
    props: { show: Boolean, dialogType: String, data: Object },
    emits: ["close"],
    data() {
        return {
            // default these values on dialog close
            visible: false,
            isLoading: false,
            isUpdate: false,
            $API: null,
            dialogInfo: {
                name: "",
                website: "",
                logo: "",
                selectedChargerList: [],
                originalSelectedChargerList: [],
                selectedUserList: [],
                originalSelectedUserList: [],
                selectedTariffList: [],
                originalSelectedTariffList: [],
                selectedStationList: [],
                originalSelectedStationList: []
            },
            // track which api needs to be hit
            changedApiList: [],
            chargerList: [],
            chargerListIsLoading: false,
            userList: [],
            userListIsLoading: false,
            stationList: [],
            stationListIsLoading: false,
            tariffList: [],
            tariffListIsLoading: false,
            rules: {
                name: [{ validator: validateIsEmpty }],
                logo: [{ validator: validateNonEmptyImageUrl }],
                website: [{ validator: validateNonEmptyWebUrl }]
            }
        };
    },
    mounted() {
        this.visible = this.show;
        const that = this;
        if (this.dialogType === "create") {
            this.$Api = $HTTP_addOrganizations;
        } else if (this.dialogType === "edit") {
            this.$Api = $HTTP_modifyOrganizationsById;
            this.dialogInfo = {
                name: this.data.name,
                website: this.data.website ? this.data.website : "",
                logo: this.data.logo ? this.data.logo : ""
            };
        } else if (this.dialogType === "delete") {
            this.$Api = $HTTP_deleteOrganizationsById;
        }
        this.$nextTick(() => {
            setScrollBar(".vertical.formVertical", that);
        });
        // get all charger list
        this.getChargerList();
        // get all user list
        this.getUsersList();
        //get all station list
        this.getStationList();
        //get all tariff list
        this.getTariffList();
        // get bounded chargers, users only for edit
        if (this.dialogType === "edit") {
            this.getBoundedChargersByOrganizationId(this.data.id);
            this.getBoundedUsersByOrganizationId(this.data.id);
            this.getBoundedStationsByOrganizationid(this.data.id);
            this.getBoundedTariffsByOrganizationid(this.data.id);
        }
    },
    methods: {
        updateStatus(api) {
            if (this.changedApiList.length === 0) {
                this.changedApiList.push(api);
            } else if (!this.changedApiList.includes(api)) {
                this.changedApiList.push(api);
            }
        },
        printRequestError(err) {
            console.log(err);
            this.$message({
                type: "warning",
                message: i18n.t("error_network")
            });
            this.isUpdate = true;
            this.visible = false;
        },
        getBoundedStationsByOrganizationid(id) {
            let params = {
                operatorId: id
            };
            $HTTP_getBoundedStationsByOrganizationId(params)
                .then((res) => {
                    if (res?.length > 0) {
                        let selected = res.map((item) => item.id);
                        this.dialogInfo.selectedStationList = selected;
                        this.dialogInfo.originalSelectedStationList = selected;
                    }
                })
                .catch((err) => {
                    this.printRequestError(err);
                });
        },
        getBoundedTariffsByOrganizationid(id) {
            let params = {
                operatorId: id
            };
            $HTTP_getBoundedTariffsByOrganizationId(params)
                .then((res) => {
                    if (res?.length > 0) {
                        let selected = res.map((item) => item.id);
                        this.dialogInfo.selectedTariffList = selected;
                        this.dialogInfo.originalSelectedTariffList = selected;
                    }
                })
                .catch((err) => {
                    this.printRequestError(err);
                });
        },
        getBoundedUsersByOrganizationId(id) {
            let params = {
                operatorId: id
            };
            $HTTP_getBoundedUsersByOrganizationId(params)
                .then((res) => {
                    if (res?.length > 0) {
                        let selected = res;
                        this.dialogInfo.selectedUserList = selected;
                        this.dialogInfo.originalSelectedUserList = selected;
                    }
                })
                .catch((err) => {
                    this.printRequestError(err);
                });
        },
        getBoundedChargersByOrganizationId(id) {
            let params = {
                operatorId: id
            };
            $HTTP_getBoundedChargersByOrganizationId(params)
                .then((res) => {
                    if (res?.length > 0) {
                        let selected = res.map((item) => item.id);
                        this.dialogInfo.selectedChargerList = selected;
                        this.dialogInfo.originalSelectedChargerList = selected;
                    }
                })
                .catch((err) => {
                    this.printRequestError(err);
                });
        },
        getStationList() {
            let params = {
                page: 1,
                limit: $ALL_DATA_COUNT
            };
            this.stationListIsLoading = true;
            $HTTP_getStationList(params)
                .then((res) => {
                    this.stationListIsLoading = false;
                    if (res?.data?.length > 0) {
                        this.stationList = res.data;
                    }
                })
                .catch((err) => {
                    this.stationListIsLoading = false;
                    this.stationList = [];
                    this.printRequestError(err);
                });
        },
        getTariffList() {
            let params = {
                page: 1,
                limit: $ALL_DATA_COUNT
            };
            this.tariffListIsLoading = true;
            $HTTP_getTarrifs(params)
                .then((res) => {
                    this.tariffListIsLoading = false;
                    if (res?.data?.length > 0) {
                        this.tariffList = res.data;
                    }
                })
                .catch((err) => {
                    this.tariffListIsLoading = false;
                    this.tariffList = [];
                    this.printRequestError(err);
                });
        },
        getUsersList() {
            let params = {
                page: 1,
                limit: $ALL_DATA_COUNT,
                role: '*'
            };
            this.userListIsLoading = true;
            $HTTP_getOperatorList(params)
                .then((res) => {
                    this.userListIsLoading = false;
                    if (res?.data?.length > 0) {
                        this.userList = res.data;
                    } else {
                        this.userList = [];
                    }
                })
                .catch((err) => {
                    this.userListIsLoading = false;
                    this.userList = [];
                    this.printRequestError(err);
                });
        },
        getChargerList() {
            let params = {
                page: 1,
                limit: $ALL_DATA_COUNT
            };
            this.chargerListIsLoading = true;
            $HTTP_getAllChargeBoxList(params)
                .then((res) => {
                    this.chargerListIsLoading = false;
                    if (res?.data?.length > 0) {
                        this.chargerList = res.data;
                    }
                })
                .catch((err) => {
                    this.chargerListIsLoading = false;
                    this.chargerList = [];
                    this.printRequestError(err);
                });
        },
        checkStatusMessage(changedApiListStatusLength, changedApiListLength) {
            if (changedApiListStatusLength === changedApiListLength) {
                this.isUpdate = true;
                this.visible = false;
                this.$message({
                    type: "success",
                    message: i18n.t("general.sucUpdateMsg")
                });
            }
        },
        updateOrganization() {
            this.$refs.updateOrganizationForm.validate((valid) => {
                // [addOrganizationApi, bindChargers, addUsers,addStations,addTarifs]
                // track api completion status
                let changedApiListStatus = [false, false, false, false, false];
                if (valid) {
                    let params = {};
                    if (this.dialogInfo.name) {
                        params.name = this.dialogInfo.name;
                    }
                    if (this.dialogInfo.website) {
                        params.website = this.dialogInfo.website;
                    }
                    if (this.dialogInfo.logo) {
                        params.logo = this.dialogInfo.logo;
                    }
                    if (this.dialogType === "edit" || this.dialogType === "delete") {
                        params.operatorId = this.data.id;
                    }
                    this.isLoading = true;
                    if (this.dialogType === "create") {
                        this.$Api(params).then((data) => {
                            this.isLoading = false;
                            if (data) {
                                let params = {};
                                changedApiListStatus[0] = true;
                                // return only true values
                                let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                if (changedApiListStatus[0] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                    this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                }
                                params.operatorId = data.id;
                                params.chargerData = getNewlyAddedItems(
                                    this.dialogInfo.selectedChargerList,
                                    this.dialogInfo.originalSelectedChargerList
                                );
                                if (params.chargerData.length > 0) {
                                    $HTTP_bindChargersByOrganizationId(params)
                                        .then((res) => {
                                            if (res.status === 204) {
                                                changedApiListStatus[1] = true;
                                                // return only true values
                                                let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                                if (changedApiListStatus[1] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                                    this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                                }
                                            }
                                        })
                                        .catch((err) => {
                                            this.printRequestError(err);
                                        });
                                }

                                params.userData = getNewlyAddedItems(this.dialogInfo.selectedUserList, this.dialogInfo.originalSelectedUserList);
                                if (params.userData.length > 0) {
                                    $HTTP_bindUsersByOrganizationId(params)
                                        .then((res) => {
                                            if (res.status === 204) {
                                                changedApiListStatus[2] = true;
                                                // return only true values
                                                let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                                if (changedApiListStatus[2] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                                    this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                                }
                                            }
                                        })
                                        .catch((err) => {
                                            this.printRequestError(err);
                                        });
                                }

                                params.stationData = getNewlyAddedItems(
                                    this.dialogInfo.selectedStationList,
                                    this.dialogInfo.originalSelectedStationList
                                );
                                if (params.stationData.length > 0) {
                                    $HTTP_bindStationsByOrganizationId(params)
                                        .then((res) => {
                                            if (res.status === 204) {
                                                changedApiListStatus[3] = true;
                                                // return only true values
                                                let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                                if (changedApiListStatus[3] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                                    this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                                }
                                            }
                                        })
                                        .catch((err) => {
                                            this.printRequestError(err);
                                        });
                                }

                                params.tariffData = getNewlyAddedItems(
                                    this.dialogInfo.selectedTariffList,
                                    this.dialogInfo.originalSelectedTariffList
                                );
                                if (params.tariffData.length > 0) {
                                    $HTTP_bindTariffsByOrganizationId(params)
                                        .then((res) => {
                                            if (res.status === 204) {
                                                changedApiListStatus[4] = true;
                                                // return only true values
                                                let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                                if (changedApiListStatus[4] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                                    this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                                }
                                            }
                                        })
                                        .catch((err) => {
                                            this.printRequestError(err);
                                        });
                                }
                            }
                        });
                    } else if (this.dialogType === "edit") {
                        if (this.changedApiList.includes("baseApi")) {
                            this.$Api(params)
                                .then((data) => {
                                    if (data) {
                                        changedApiListStatus[0] = true;
                                        // return only true values
                                        let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                        if (changedApiListStatus[0] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                            this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                        }
                                    }
                                })
                                .catch((err) => {
                                    this.printRequestError(err);
                                });
                        }

                        if (this.changedApiList.includes("chargerApi")) {
                            params.chargerData = [
                                ...getNewlyAddedItems(this.dialogInfo.selectedChargerList, this.dialogInfo.originalSelectedChargerList),
                                ...getNewlyRemovedItems(this.dialogInfo.selectedChargerList, this.dialogInfo.originalSelectedChargerList)
                            ];
                            $HTTP_bindChargersByOrganizationId(params)
                                .then((res) => {
                                    if (res.status === 204) {
                                        changedApiListStatus[1] = true;
                                        // return only true values
                                        let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                        if (changedApiListStatus[1] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                            this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                        }
                                    }
                                })
                                .catch((err) => {
                                    this.printRequestError(err);
                                });
                        }

                        if (this.changedApiList.includes("userApi")) {
                            params.userData = [
                                ...getNewlyAddedItems(this.dialogInfo.selectedUserList, this.dialogInfo.originalSelectedUserList),
                                ...getNewlyRemovedItems(this.dialogInfo.selectedUserList, this.dialogInfo.originalSelectedUserList)
                            ];
                            $HTTP_bindUsersByOrganizationId(params)
                                .then((res) => {
                                    if (res.status === 204) {
                                        changedApiListStatus[2] = true;
                                        // return only true values
                                        let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                        if (changedApiListStatus[2] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                            this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                        }
                                    }
                                })
                                .catch((err) => {
                                    this.printRequestError(err);
                                });
                        }

                        if (this.changedApiList.includes("stationApi")) {
                            params.stationData = [
                                ...getNewlyAddedItems(this.dialogInfo.selectedStationList, this.dialogInfo.originalSelectedStationList),
                                ...getNewlyRemovedItems(this.dialogInfo.selectedStationList, this.dialogInfo.originalSelectedStationList)
                            ];
                            $HTTP_bindStationsByOrganizationId(params)
                                .then((res) => {
                                    if (res.status === 204) {
                                        changedApiListStatus[3] = true;
                                        // return only true values
                                        let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                        if (changedApiListStatus[3] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                            this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                        }
                                    }
                                })
                                .catch((err) => {
                                    this.printRequestError(err);
                                });
                        }
                        if (this.changedApiList.includes("tariffApi")) {
                            params.tariffData = [
                                ...getNewlyAddedItems(this.dialogInfo.selectedTariffList, this.dialogInfo.originalSelectedTariffList),
                                ...getNewlyRemovedItems(this.dialogInfo.selectedTariffList, this.dialogInfo.originalSelectedTariffList)
                            ];
                            $HTTP_bindTariffsByOrganizationId(params)
                                .then((res) => {
                                    if (res.status === 204) {
                                        changedApiListStatus[4] = true;
                                        // return only true values
                                        let changedApiListStatusTrue = changedApiListStatus.filter((item) => !!item);
                                        if (changedApiListStatus[4] && changedApiListStatusTrue.length === this.changedApiList.length) {
                                            this.checkStatusMessage(this.changedApiList.length, changedApiListStatusTrue.length);
                                        }
                                    }
                                })
                                .catch((err) => {
                                    this.printRequestError(err);
                                });
                        }
                    } else if (this.dialogType === "delete") {
                        this.$Api(params)
                            .then((data) => {
                                this.isLoading = false;
                                if (data.status === 204) {
                                    this.$message({
                                        type: "success",
                                        message: i18n.t("general.sucUpdateMsg")
                                    });
                                    this.isUpdate = true;
                                    this.visible = false;
                                }
                            })
                            .catch((err) => {
                                this.printRequestError(err);
                            });
                    }
                } else {
                    console.log("error submit!!");
                    return false;
                }
            });
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
            this.$jQuery(".vertical.formVertical").mCustomScrollbar("destroy");
        }
    }
};
</script>

<style lang = "scss">
.formVertical {
    .organization {
        .form-item {
            width: 96%;
            display: flex;
            flex-direction: column;
            .label {
                width: 100%;
            }
            .inputLabel {
                width: 100%;
            }
            .organizationSelect {
                input {
                    border: none;
                }
            }
        }
    }
}
</style>
