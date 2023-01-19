<template>
    <el-dialog :title="getTitle(dialogType)" width="50%" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div v-if="dialogType===`userCount`" class="users eachDialogBody">
            <el-table :data="selectedUserList" class="moreCol">
                <el-table-column :label="$t('general.name')" width="250">
                    <template slot-scope="scope">
                        {{ clientName(scope.row) }}
                    </template>
                </el-table-column>
                <el-table-column prop="email" :label="$t('userAccount.email')" width="350"></el-table-column>
                <el-table-column :label="$t('userAccount.mobile')" width="280">
                    <template slot-scope="scope">
                        {{ scope.row.phoneNumber ? scope.row.phoneNumber : '' }}
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="dialogType==='chargerCount'" class="chargers eachDialogBody">
            <el-table :data="selectedChargerList" class="moreCol">
                <el-table-column :label="$t('chargingStation.chargerId')" width="320">
                    <template slot-scope="scope">
                        <el-link type="primary" underline @click="()=>handleRowClick(scope.row,'charger')">#{{ scope.row.ocppId }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="name" :label="$t('general.name')" width="320"></el-table-column>
                <el-table-column :label="$t('general.type')" width="200" class-name="center">
                    <template slot-scope="scope">
                        {{ scope.row.powerType? getPowerType(scope.row.powerType):'' }}
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="dialogType==='stationCount'" class="stations eachDialogBody">
            <el-table :data="selectedStationList" class="moreCol">
                <el-table-column :label="$t('chargingStation.stationName')" width="200">
                    <template slot-scope="scope">
                        <el-link type="primary" underline @click="()=>handleRowClick(scope.row,'station')">#{{ scope.row.name }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="address.zipCode" :label="$t('general.zipCode')" width="200"></el-table-column>
                <el-table-column :label="$t('general.address')" width="500">
                    <template slot-scope="scope">
                        <div class="address">{{ scope.row.address.street +', '+ scope.row.address.city +', '+ scope.row.address.state }}</div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="dialogType==='tariffCount'" class="tariffs eachDialogBody">
            <el-table :data="selectedTariffList" class="moreCol">
                <el-table-column prop="name" :label="$t('general.name')" width="300"></el-table-column>
                <el-table-column prop="currency" :label="$t('general.currency')" width="250"></el-table-column>
                <el-table-column :label="$t('userAccount.createdDate')" width="300">
                    <template slot-scope="scope">
                        {{ scope.row.created?getLocTime(scope.row.created):'' }}
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-dialog>
</template>

<script>
import {
    $HTTP_getBoundedChargersByOrganizationId,
    $HTTP_getBoundedUsersByOrganizationId,
    $HTTP_getOperatorList,
    $HTTP_getBoundedStationsByOrganizationId,
    $HTTP_getBoundedTariffsByOrganizationId
} from "@/api/api";
import { $ALL_DATA_COUNT, $POWER_TYPE_LIST } from "@/utils/global";
import { transformUtcToLocTime } from "@/utils/function";

export default {
    props: { show: Boolean, dialogType: String, data: Object },
    emits: ["close"],
    data() {
        return {
            isLoading: false,
            visible: false,
            selectedChargerList: [],
            selectedUserList: [],
            userList: [],
            selectedStationList: [],
            selectedTariffList: [],
            powerTypeList: $POWER_TYPE_LIST
        };
    },
    computed: {
        getTitle() {
            return (item) => {
                if (item === "userCount") {
                    return i18n.t("general.user");
                } else if (item === "chargerCount") {
                    return i18n.t("chargingStation.charger");
                } else if (item === "stationCount") {
                    return i18n.t("chargingStation.station");
                } else if (item === "tariffCount") {
                    return i18n.t("menu.tariff");
                }
            };
        },
        getPowerType() {
            return (item) => {
                let convertedValue = this.powerTypeList.filter(
                    (powerType) => powerType.value === item
                );
                return convertedValue[0].name;
            };
        },
        clientName() {
            return (customer) => customer.firstName + " " + customer.lastName;
        },
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    mounted() {
        this.visible = this.show;
        if (this.dialogType === "userCount") {
            this.getBoundedUsersByOrganizationId(this.data.id);
        } else if (this.dialogType === "chargerCount") {
            this.getBoundedChargersByOrganizationId(this.data.id);
        } else if (this.dialogType === "stationCount") {
            this.getBoundedStationsByOrganizationid(this.data.id);
        } else if (this.dialogType === "tariffCount") {
            this.getBoundedTariffsByOrganizationid(this.data.id);
        }
    },
    methods: {
        handleRowClick(row, type) {
            if (row && type === "station") {
                const stationData = {
                    stationId: row.id,
                    stationName: row.name
                };
                window.sessionStorage.setItem(
                    "fiics-stationInfo",
                    JSON.stringify(stationData)
                );
                this.$router
                    .push({ name: "Station Detail", params: stationData })
                    .catch();
            } else if (row && type === "charger") {
                const data = Object.assign({}, row);
                window.sessionStorage.setItem(
                    "fiics-chargePointInfo",
                    JSON.stringify(data)
                );
                this.$router
                    .push({ name: "ChargePoint Detail", params: data })
                    .catch();
            }
        },
        getUsersList() {
            let params = {
                page: 1,
                limit: $ALL_DATA_COUNT,
                // get all users
                role: "*"
            };
            return $HTTP_getOperatorList(params)
                .then((res) => {
                    if (res?.data?.length > 0) {
                        this.userList = res.data;
                    } else {
                        this.userList = [];
                    }
                })
                .catch((err) => {
                    this.userList = [];
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        getBoundedStationsByOrganizationid(id) {
            let params = {
                operatorId: id
            };
            $HTTP_getBoundedStationsByOrganizationId(params)
                .then((res) => {
                    if (res?.length > 0) {
                        this.selectedStationList = res;
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        getBoundedTariffsByOrganizationid(id) {
            let params = {
                operatorId: id
            };
            $HTTP_getBoundedTariffsByOrganizationId(params)
                .then((res) => {
                    if (res?.length > 0) {
                        this.selectedTariffList = res;
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        getBoundedUsersByOrganizationId(id) {
            let params = {
                operatorId: id
            };
            this.getUsersList().then(() => {
                $HTTP_getBoundedUsersByOrganizationId(params)
                    .then((res) => {
                        if (res?.length > 0) {
                            let selected = res;
                            let selectedUserListName = selected.map(
                                (eachSelectedUser) => {
                                    return this.userList.find(
                                        (obj) => obj.id === eachSelectedUser
                                    );
                                }
                            );
                            this.selectedUserList = selectedUserListName;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$message({
                            type: "warning",
                            message: i18n.t("error_network")
                        });
                    });
            });
        },
        getBoundedChargersByOrganizationId(id) {
            let params = {
                operatorId: id
            };
            $HTTP_getBoundedChargersByOrganizationId(params)
                .then((res) => {
                    if (res?.length > 0) {
                        this.selectedChargerList = res;
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        closeDialog() {
            this.$emit("close", true);
        }
    }
};
</script>
<style lang="scss" scoped>
.eachDialogBody {
    display: flex;
    flex-wrap: wrap;
    &.users,
    &.tariffs {
        word-break: break-all;
        p {
            margin-right: 10px;
            min-width: 150px;
        }
    }
    &.chargers,
    &.stations {
        max-height: 60vh;
        overflow: scroll;
        p {
            width: 100%;
        }
    }

    .el-link {
        text-decoration: underline;
        color: #0056ff;
    }

    .el-link:hover {
        text-decoration: none;
        color: #0056ff;
    }
}
</style>
