<template>
    <el-dialog :title="$t('chargingStation.getCompositeSchedule')" width="50%" :visible.sync="visible" custom-class="inner" :show-close="false" @close="closeDialog()" append-to-body>
        <div class="dialogForm compositeSchedule">
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargePointName') }}</div>
                <div class="info">{{ data.name }}</div>
            </div>
            <div class="item">
                <div class="label">{{ $t('chargingStation.chargerId') }}</div>
                <div class="info">{{ data.ocppId }}</div>
            </div>
            <div class="item" v-if="startSchedule">
                <div class="label">{{ $t('chargingProfile.startSchedule') }}</div>
                <div class="info">{{ startSchedule }}</div>
            </div>
        </div>
        <GetPeriod :show="show" :editable="false" :data="periodData"></GetPeriod>
    </el-dialog>
</template>

<script>
import { setScrollBar, transformUtcToLocTime, convertSecondsToTime } from "@/utils/function";
import GetPeriod from "@/components/setting/getPeriod";
const DEFAULT_MAXSECONDS = 24 * 60 * 60;
export default {
    components: {
        GetPeriod
    },
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            visible: false,
            pickerOptions: {
                start: "00:00",
                step: "00:30",
                end: "24:00",
                minTime: "",
                maxTime: "24:00"
            },
            startSchedule: "",
            periodData: {}
        };
    },
    computed: {
        getTimeFromSeconds() {
            return (seconds, format) => convertSecondsToTime(seconds, format);
        }
    },
    watch: {
        show: {
            handler() {
                const that = this;
                this.visible = this.show;
                if (this.visible) {
                    this.startSchedule = this.data?.scheduleStart ? transformUtcToLocTime(this.data?.scheduleStart, "YYYY-MM-DD HH:mm") : "";
                    this.periodData = this.data?.chargingSchedule?.chargingSchedulePeriods
                        ? this.prepareData(this.data.chargingSchedule.chargingSchedulePeriods)
                        : {};
                }
                that.$jQuery(".compositeSchedule").length > 0 && that.$jQuery(".compositeSchedule").mCustomScrollbar("destroy");
                that.$nextTick(() => {
                    setScrollBar(".compositeSchedule", that);
                });
            }
        }
    },
    methods: {
        prepareData(data) {
            const periodLength = data.length;
            return data.map((item, idx) => {
                item.id = idx + 1;
                // item.powerLimit = item.limit / 1000 || 0;
                item.startPeriodInSeconds = item.startPeriod;
                item.time = this.getTimeFromSeconds(item.startPeriodInSeconds, "HH:mm:ss");
                if (periodLength === idx + 1) {
                    item.endPeriodInSeconds = DEFAULT_MAXSECONDS;
                    item.endTime = "23:59:59";
                } else {
                    item.endPeriodInSeconds = data[idx + 1].startPeriod - 1;
                    item.endTime = this.getTimeFromSeconds(item.endPeriodInSeconds, "HH:mm:ss");
                }
                item.duration = item.endPeriodInSeconds - item.startPeriodInSeconds;
                return item;
            });
        },
        closeDialog() {
            this.startSchedule = "";
            this.$emit("close");
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
