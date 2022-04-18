<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.report') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 report">
                <div class="tabs-contain">
                    <el-tabs v-model="active" @tab-click="handleTabClick">
                        <el-tab-pane :label="$t('menu.usagePatterns')" name="usagePatterns">
                        </el-tab-pane>
                        <el-tab-pane :label="$t('menu.pluggedNotCharging')" name="pluggedNotCharging">
                        </el-tab-pane>
                    </el-tabs>
                    <!-- <UsagePatterns v-if="active === 'usagePatterns'"></UsagePatterns>
                    <PluggedNotCharging v-else></PluggedNotCharging> -->

                    <div class="filter">
                        <el-date-picker v-model="filter.dateRange" type="daterange" value-format="yyyy-MM-dd" format="yyyy-MM-dd" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="pickerOptions" :clearable="true" @change="updateApi()">
                        </el-date-picker>
                    </div>
                    <div v-if="active === 'usagePatterns'">
                        <FMCSTemplate :url="usagePatternsUrl"></FMCSTemplate>
                    </div>
                    <div v-else>
                        <FMCSTemplate :url="pluggedAndNotChargingUrl"></FMCSTemplate>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar } from "@/utils/function";
import FMCSTemplate from "@/components/info/fmcsTemplate";
import moment from "moment";
import { parse } from 'qs';
// import UsagePatterns from "@/components/info/usagePatterns";
// import PluggedNotCharging from "@/components/info/pluggedNotCharging";
const baseGrafanaUrl = process.env.VUE_APP_GRAFANA_BASE_URL;
var usagePatternsUrl = `${baseGrafanaUrl}/LtfWzay7k/usage-patterns?orgId=1&kiosk&refresh=1m&theme=light`;
var pluggedAndNotChargingUrl = `${baseGrafanaUrl}/hDOm5fUnk/plugged-and-not-charging?orgId=1&kiosk&refresh=1m&theme=light`;

export default {
    components: {
        // UsagePatterns,
        // PluggedNotCharging
        FMCSTemplate,
    },
    data() {
        return {
            active: "usagePatterns",
            usagePatternsUrl: usagePatternsUrl,
            pluggedAndNotChargingUrl: pluggedAndNotChargingUrl,
            filter: {
                dateRange: [],
            },
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now();
                },
            },
        };
    },
    created() {
        const todaySplit = moment().format("YYYY-MM-DD").split("-");
        const thisMonth1st = todaySplit[0] + "-" + todaySplit[1] + "-01";
        let dayWeekBefore = parseInt(todaySplit[2])-7;
        if((dayWeekBefore)<10){
            dayWeekBefore = '0' + dayWeekBefore
        }else{
            dayWeekBefore = `${dayWeekBefore}`
        }
        const thisWeekBefore =  todaySplit[0] + "-" + todaySplit[1] + "-" + dayWeekBefore

        if (todaySplit[2] === "01") {
            this.filter.dateRange = [thisMonth1st, thisMonth1st];
        } else {
            const today = moment().format("YYYY-MM-DD");
            this.filter.dateRange = [thisWeekBefore, today];
        }
        this.updateGrafanaUrl();
    },
    mounted() {
        setScrollBar(".scroll", this);
    },
    methods: {
        handleTabClick(tab, event) {},
        updateApi() {
            this.updateGrafanaUrl();
        },
        updateGrafanaUrl() {
            let startDate = this.filter.dateRange[0];
            let endDate = moment(this.filter.dateRange[1]).endOf('day');
            startDate = moment(startDate).format("x");
            endDate = moment(endDate).format("x");
            this.usagePatternsUrl = usagePatternsUrl + `&from=` + startDate + `&to=` + endDate;
            this.pluggedAndNotChargingUrl = pluggedAndNotChargingUrl + `&from=` + startDate + `&to=` + endDate;
        },
    },
};
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
}
</style>