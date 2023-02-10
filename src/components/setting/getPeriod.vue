<template>
    <div class="profilePeriods">
        <el-divider></el-divider>
        <div class="label" v-if="chargingProfileKind==='Recurring'">{{ $t('chargingProfile.daily') }}</div>
        <div class="time" v-if="tableSize>0 && chargingProfileKind==='Recurring'"><span>00:00 AM</span><span style="float:right">11:59 PM</span></div>
        <BarTimeChart class="barChart" v-if="tableSize>0 && chargingProfileKind==='Recurring'" :id="'profilePeriods'" :chartData="profilePeriods.data" :chargingRateUnit="chargingRateUnit"></BarTimeChart>
        <!-- if is not recurring, allow for one value for limit and number phases -->
        <el-button v-if="editable && ((tableSize<1 && chargingProfileKind!=='Recurring')|| chargingProfileKind==='Recurring')" class="right add" icon="el-icon-plus" style="color: #1e5eff;font-weight: bold;" :disabled="startSchedule===''" @click="openPeriodDialog('create')"></el-button>
        <el-table v-if="tableSize>0" :data="profilePeriods.data" class="moreCol" v-loading="profilePeriods.isLoading">
            <el-table-column prop="limit" :label="$t('chargingProfile.limit')">
                <template slot-scope="scope">
                    {{scope.row.limit ? scope.row.limit + `${chargingRateUnit}` :''}}
                </template>
            </el-table-column>
            <!-- <el-table-column prop="powerLimit" :label="$t('chargingProfile.maxPower')"></el-table-column> -->
            <el-table-column :label="$t('chargingProfile.startPeriodInSeconds')">
                <template slot-scope="scope">
                    {{ scope.row.time ? scope.row.time:'' }}
                </template>
            </el-table-column>
            <el-table-column v-if="editable" :label="$t('general.action')" :width="100">
                <template slot-scope="scope">
                    <!-- <el-button class="no-bg edit" @click="openPeriodDialog('edit',scope.row)"></el-button> -->
                    <el-button v-if="scope.$index === (tableSize-1)" class="no-bg delete" @click="openPeriodDialog('delete',scope.row.id)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <UpdatePeriod :startSchedule="startSchedule" :show="updatePeriodDialog.visible" :data="updatePeriodDialog.data" @close="(isUpdate, data) => closePeriodDialog('update', isUpdate, data)">
        </UpdatePeriod>
        <DeletePeriod :show="deletePeriodDialog.visible" :data="deletePeriodDialog.data" @close="(isUpdate) => closePeriodDialog('delete', isUpdate)"></DeletePeriod>
    </div>
</template>

<script>
import BarTimeChart from "@/components/charts/barTimeChart";
import UpdatePeriod from "@/components/setting/updatePeriod";
import DeletePeriod from "@/components/setting/deletePeriod";
import { convertSecondsToTime } from "@/utils/function";
const DEFAULT_MAXSECONDS = 24 * 60 * 60;
export default {
    components: {
        BarTimeChart,
        UpdatePeriod,
        DeletePeriod
    },
    props: {
        show: Boolean,
        chargingProfileId: Number,
        editable: Boolean,
        data: Array,
        isCreate: Boolean,
        startSchedule: String,
        chargingSchedulePeriods: Array,
        chargingProfileKind: String,
        chargingRateUnit: String
    },
    data() {
        return {
            profilePeriods: {
                isLoading: false,
                data: []
            },
            updatePeriodDialog: {
                visible: false,
                data: {}
            },
            deletePeriodDialog: {
                visible: false,
                data: {}
            }
        };
    },
    computed: {
        getTimeFromSeconds() {
            return (seconds, format) => convertSecondsToTime(seconds, format);
        },
        tableSize() {
            return this.profilePeriods.data.length;
        }
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
            this.profilePeriods.isLoading = true;
            this.profilePeriods.data = [];
            let res = this.chargingSchedulePeriods;
            const periodLength = res?.length;
            this.profilePeriods.isLoading = false;
            if (periodLength) {
                // sort from smaller to bigger
                res.sort((first, second) => {
                    return first.startPeriod - second.startPeriod;
                });

                this.profilePeriods.data = res.map((item, idx) => {
                    item.time = this.getTimeFromSeconds(item.startPeriod, "hh:mm A");
                    if (periodLength === idx + 1) {
                        item.endPeriodInSeconds = DEFAULT_MAXSECONDS;
                        item.endTime = "11:59:59 PM";
                    } else {
                        item.endPeriodInSeconds = res[idx + 1].startPeriod - 1;
                        item.endTime = this.getTimeFromSeconds(item.endPeriodInSeconds, "hh:mm:ss A");
                    }
                    item.duration = item.endPeriodInSeconds - item.startPeriod;
                    return item;
                });
            }
        },
        openPeriodDialog(type, data) {
            if (type === "delete") {
                this.deletePeriodDialog.visible = true;
                this.deletePeriodDialog.data = {
                    id: data,
                    isCreate: this.isCreate
                };
            } else {
                this.updatePeriodDialog.data = {
                    type: type,
                    isCreate: this.isCreate
                };
                if (type === "create") {
                    if (this.profilePeriods.data.length === 0) {
                        this.updatePeriodDialog.data.isFirst = true;
                    } else {
                        this.updatePeriodDialog.data.isFirst = false;
                        this.updatePeriodDialog.data.startTime = this.profilePeriods.data[this.profilePeriods.data.length - 1].time;
                    }
                    this.updatePeriodDialog.data.chargingProfileId = this.chargingProfileId;
                } else if (type === "edit") {
                    this.updatePeriodDialog.data = { ...data };
                    this.updatePeriodDialog.data.startTime = this.profilePeriods.data[this.profilePeriods.data.length - 1].time;
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
                if (dialog === "delete") {
                    let table = this.profilePeriods.data.slice(0, -1),
                        tableLength = table.length;
                    if (tableLength) {
                        table[tableLength - 1].endPeriodInSeconds = DEFAULT_MAXSECONDS;
                        table[tableLength - 1].endTime = "11:59:59 PM";
                        table[tableLength - 1].duration = table[tableLength - 1].endPeriodInSeconds - table[tableLength - 1].startPeriod || 86400;
                    }
                    this.profilePeriods.data = table;
                    this.$emit("handleData", this.profilePeriods.data);
                } else if (dialog === "update") {
                    let table = this.profilePeriods.data.slice(),
                        tableLength = table.length;
                    if (tableLength) {
                        table[tableLength - 1].endPeriodInSeconds = data.startPeriod - 1;
                        table[tableLength - 1].endTime = this.getTimeFromSeconds(data.startPeriod - 1, "hh:mm:ss A");
                        table[tableLength - 1].duration = table[tableLength - 1].endPeriodInSeconds - table[tableLength - 1].startPeriod;
                    }
                    data.endPeriodInSeconds = DEFAULT_MAXSECONDS;
                    data.endTime = "11:59:59 PM";
                    data.duration = data.endPeriodInSeconds - data.startPeriod;
                    table.push(data);
                    this.profilePeriods.data = table;
                    this.$emit("handleData", this.profilePeriods.data);
                } else {
                    this.fetchProfilePeriods();
                }
            }
            this.$jQuery(".formVertical").mCustomScrollbar("update");
        }
    }
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
        &:hover,
        &:focus {
            color: #409eff;
            border-color: #c6e2ff;
            background-color: #ecf5ff;
        }
    }
}
</style>
