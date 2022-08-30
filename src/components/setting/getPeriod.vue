<template>
    <div class="profilePeriods">
        <el-divider></el-divider>
        <div class="label">{{ $t('chargingProfile.daily') }}</div>
        <div class="time" v-if="tableSize>0"><span>00:00</span><span style="float:right">23:59</span></div>
        <BarTimeChart class="barChart" v-if="tableSize>0" :id="'profilePeriods'" :chartData="profilePeriods.data"></BarTimeChart>
        <el-button v-if="editable && tableSize<5" class="right add" icon="el-icon-plus" style="color: #1e5eff;font-weight: bold;" @click="openPeriodDialog('create')"></el-button>
        <el-table v-if="tableSize>0 && !data" :data="profilePeriods.data" class="moreCol" v-loading="profilePeriods.isLoading">
            <el-table-column v-if="!isCreate" prop="id" label="ID"></el-table-column>
            <el-table-column prop="powerLimit" :label="$t('chargingProfile.maxPower')"></el-table-column>
            <el-table-column prop="time" :label="$t('chargingProfile.startPeriodInSeconds')"></el-table-column>
            <el-table-column v-if="editable" :label="$t('general.action')" :width="100">
                <template slot-scope="scope">
                    <!-- <el-button class="no-bg edit" @click="openPeriodDialog('edit',scope.row)"></el-button> -->
                    <el-button v-if="scope.$index === (tableSize-1)" class="no-bg delete" @click="openPeriodDialog('delete',scope.row.id)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <UpdatePeriod
            :show="updatePeriodDialog.visible"
            :data="updatePeriodDialog.data"
            @close="(isUpdate, data) => closePeriodDialog('update', isUpdate, data)">
        </UpdatePeriod>
        <DeletePeriod :show="deletePeriodDialog.visible" :data="deletePeriodDialog.data" @close="(isUpdate) => closePeriodDialog('delete', isUpdate)"></DeletePeriod>
    </div>
</template>

<script>
import {
    $HTTP_getChargingProfilePeriods
} from "@/api/api";
import BarTimeChart from "@/components/charts/barTimeChart";
import UpdatePeriod from "@/components/setting/updatePeriod";
import DeletePeriod from "@/components/setting/deletePeriod";
import moment from "moment";
const DEFAULT_MAXSECONDS = 24 * 60 * 60;
export default {
    props: {
        show: Boolean,
        chargingProfileId: Number,
        editable: Boolean,
        maxPower_kW: Number,
        data: Array,
        isCreate: Boolean
    },
    components: {
        BarTimeChart,
        UpdatePeriod,
        DeletePeriod
    },
    data() {
        return {
            profilePeriods: {
                isLoading: false,
                data: []
            },
            updatePeriodDialog: {
                visible: false,
                data: {},
            },
            deletePeriodDialog: {
                visible: false,
                data: {},
            },
        };
    },
    watch: {
        show: {
            handler() {
                if (this.show) {
                    if (this.data && this.data.length > 0) {
                        this.profilePeriods.data = this.data.slice();
                    } else if (!this.isCreate) {
                        this.fetchProfilePeriods();
                    } else {
                        this.profilePeriods.data = [];
                    }
                }
            }
        }
    },
    computed: {
        getTime() {
            return (second, format) => {
                const millisecond = second * 1000;
                const hours = moment.duration(millisecond).hours();
                const minutes =  moment.duration(millisecond).minutes();
                const seconds =  moment.duration(millisecond).seconds();
                return moment().set({ "hour": hours, "minute": minutes, "second": seconds }).format(format)
            };
        },
        tableSize() {
            return this.profilePeriods.data.length;
        }
    },
    mounted() {
        if (this.data && this.data.length > 0) {
            this.profilePeriods.data = this.data.slice();
        } else if (!this.isCreate) {
            this.fetchProfilePeriods();
        } else {
            this.profilePeriods.data = [];
        }
    },
    methods: {
        fetchProfilePeriods() {
            const param = {
                chargingProfileId: this.chargingProfileId
            }
            this.profilePeriods.isLoading = true;
            this.profilePeriods.data = [];
            $HTTP_getChargingProfilePeriods(param)
                .then((res) => {
                    const periodLength = res.length;
                    this.profilePeriods.isLoading = false;
                    this.profilePeriods.data = res.map((item, idx) => {
                        item.powerLimit = parseFloat((item.powerLimit/1000).toFixed(1)) || 0;
                        item.time = this.getTime(item.startPeriodInSeconds, "HH:mm");
                        if (periodLength === idx+1) {
                            item.endPeriodInSeconds = DEFAULT_MAXSECONDS;
                            item.endTime = "23:59:59";
                        } else {
                            item.endPeriodInSeconds = res[idx+1].startPeriodInSeconds-1;
                            item.endTime = this.getTime(item.endPeriodInSeconds, "HH:mm:ss");
                        }
                        item.duration = item.endPeriodInSeconds - item.startPeriodInSeconds;
                        return item;
                    });
                })
                .catch((err) => {
                    console.log("profilePeriod list error", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        openPeriodDialog(type, data) {
            if (type === "delete") {
                this.deletePeriodDialog.visible = true;
                this.deletePeriodDialog.data = {
                    id: data,
                    isCreate: this.isCreate
                }
            } else {
                this.updatePeriodDialog.data = {
                    type: type,
                    maxPower_kW: this.maxPower_kW,
                    isCreate: this.isCreate
                };
                if (type === "create") {
                    if (this.profilePeriods.data.length === 0) {
                        this.updatePeriodDialog.data.isFirst = true;
                    } else {
                        this.updatePeriodDialog.data.isFirst = false;
                        this.updatePeriodDialog.data.startTime = this.profilePeriods.data[this.profilePeriods.data.length-1].time;
                    }
                    this.updatePeriodDialog.data.chargingProfileId = this.chargingProfileId;
                } else if (type === "edit") {
                    this.updatePeriodDialog.data = {...data};
                    this.updatePeriodDialog.data.startTime = this.profilePeriods.data[this.profilePeriods.data.length-1].time;
                }
                this.updatePeriodDialog.visible = true;
            }
            this.$jQuery(".formVertical").mCustomScrollbar("disable");
        },
        closePeriodDialog(dialog, isUpdate, data) {
            if (dialog === "delete") {
                this.deletePeriodDialog.visible = false;
            } else if (dialog === "update") {
                this.updatePeriodDialog.visible = false;
                this.updatePeriodDialog.data = {};
            }
            if (isUpdate) {
                if (!this.isCreate) {
                    this.fetchProfilePeriods();
                } else if (dialog === "delete") {
                    let table = this.profilePeriods.data.slice(0, -1),
                        tableLength = table.length;
                    if (tableLength) {
                        table[tableLength-1].endPeriodInSeconds = DEFAULT_MAXSECONDS;
                        table[tableLength-1].endTime = "23:59:59";
                        table[tableLength-1].duration = table[tableLength-1].endPeriodInSeconds - table[tableLength-1].startPeriodInSeconds;
                    }
                    this.profilePeriods.data = table;
                    this.$emit('handleData', this.profilePeriods.data);
                } else if (dialog === "update") {
                    let table = this.profilePeriods.data.slice(),
                        tableLength = table.length;
                    if (tableLength) {
                        table[tableLength-1].endPeriodInSeconds = data.startPeriodInSeconds-1;
                        table[tableLength-1].endTime = this.getTime(data.startPeriodInSeconds-1, "HH:mm:ss");
                        table[tableLength-1].duration = table[tableLength-1].endPeriodInSeconds - table[tableLength-1].startPeriodInSeconds;
                    }
                    data.endPeriodInSeconds = DEFAULT_MAXSECONDS;
                    data.endTime = "23:59:59";
                    data.duration = data.endPeriodInSeconds - data.startPeriodInSeconds;
                    table.push(data);
                    this.profilePeriods.data = table;
                    this.$emit('handleData', this.profilePeriods.data)
                }
            }
            this.$jQuery(".formVertical").mCustomScrollbar("update");
        },
    },
};
</script>

<style lang = "scss" scoped>
    .profilePeriods {
        width: 96%;
        .label {
            font-size: 1rem;
            color: #525e69;
            letter-spacing: 0;
            margin-bottom: 20px;
        }
        .time {
            font-size: 0.875rem;
            color: #151e25;
            padding-right: 10px;
        }
        .barChart {
            width: 100%;
            height: 40px;
            position: relative;
            margin-bottom: 12px;
        }
        .el-button.add {
            padding: 0;
            background: transparent;
            border: unset;
            font-size: 1.5rem;
            margin-bottom: 8px;
            &:hover, &:focus {
                color: #409EFF;
                border-color: #c6e2ff;
                background-color: #ecf5ff;
            }
        }
    }
</style>