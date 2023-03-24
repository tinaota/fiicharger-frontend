<template>
    <div style="width: 100%; height: 100%">
        <span style="margin-left: 16px">{{ $t("general.maxBreakdowns") }}</span>
        <el-select style="width: 200px; margin-left: 16px" class="select-small" v-model="noofChargers" :placeholder="$t('general.maxBreakdowns')" filterable>
            <label></label>
            <el-option v-for="item in noofChargersList" :label="item" :key="item" :value="item"></el-option>
        </el-select>
        <CommonChart v-if="chartData" :chartData="chartData"></CommonChart>
    </div>
</template>
<script>
import CommonChart from "@/components/charts/CommonChart";
import { $HTTP_getRevenueWaterfallGraphData } from "@/api/api";

export default {
    props: {
        dateRange: Array,
        id: String,
        type: String
    },
    components: {
        CommonChart
    },
    data() {
        return {
            chartData: {},
            // this.noofChargers is the number of chargers to be shown at top
            noofChargers: 0,
            noofChargersList: [],
            responseData: {}
        };
    },
    computed: {
        isDark() {
            return this.$store.state.darkTheme;
        },
        selectedOrganization: function () {
            return this.$store.state.selectedOrganization;
        },
        userRole: function () {
            return this.$store.state.role;
        }
    },
    watch: {
        dateRange: function () {
            // check the length of the dates to verify
            // it has both start/end dates
            this.fetchRevenueWaterfallGraphData(this.dateRange, this.id);
        },
        noofChargers: function () {
            this.convertChartOptions(this.responseData);
        },
        isDark: function () {
            this.convertChartOptions(this.responseData);
        },
        selectedOrganization: function () {
            this.fetchRevenueWaterfallGraphData(this.dateRange, this.id);
        }
    },
    methods: {
        fetchRevenueWaterfallGraphData(dateRange, id) {
            let params = {};
            params.After = dateRange[0];
            params.Before = dateRange[1];
            if (this.type === "station") {
                params.StationId = id;
            }
            if ((this.selectedOrganization.length >= 1  && this.userRole!=='Admin')|| (this.userRole==='Admin' && this.selectedOrganization[0]?.name!=='All')) {
                params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
            }
            $HTTP_getRevenueWaterfallGraphData(params)
                .then((res) => {
                    if (res) {
                        let dataLength;
                        // max number of chargers is 16
                        if (res.data.length < 17) {
                            dataLength = res.data.length;
                        } else {
                            dataLength = 16;
                        }
                        this.noofChargers = dataLength;
                        this.noofChargersList = Array.from({ length: dataLength }, (_, i) => i + 1);
                        // convert to chart data
                        this.responseData = res;
                        this.convertChartOptions(res);
                    } else {
                        this.$message({
                            type: "warning",
                            message: i18n.t("noData")
                        });
                    }
                })
                .catch(() => {
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        convertChartOptions(res) {
            let data = res.data;
            let XAxisLabels = data.map((item, index) => {
                if (index < this.noofChargers) {
                    return item.x.name;
                }
            });
            // first data.length and after XAxisLabels.length as the value is changed
            // remove undefined labels
            XAxisLabels.splice(this.noofChargers, data.length - this.noofChargers);

            // insert others label in last posiiton
            if (this.noofChargers < this.responseData.data.length) {
                XAxisLabels.splice(XAxisLabels.length, 0, "Others");
            }
            let remainingGraphData = 0;
            let graphData = data.map((item, index) => {
                if (index < this.noofChargers) {
                    return item.y;
                } else {
                    remainingGraphData += item.y;
                }
            });
            // remove undefined waterfall data
            graphData.splice(this.noofChargers, data.length - this.noofChargers);

            //insert others value in last position
            if (this.noofChargers < this.responseData.data.length) {
                graphData.splice(graphData.length, 0, remainingGraphData);
            }
            // line graph data
            let lineChartData = graphData;
            let total = res.total;
            let sum = 0;
            let convertedLineChartData = lineChartData.map((item) => parseFloat((((sum += item) / total) * 100).toFixed(2)));
            let noofChargers = this.noofChargers;

            let option = {
                tooltip: {
                    formatter: function (params) {
                        let formatterHtml;
                        // return separate tooltip for bar and line
                        // if is total or if it is others
                        if (
                            // has to be noOfChargers-1 if cost is included
                            params.dataIndex === noofChargers ||
                            params.dataIndex === noofChargers + 1
                        ) {
                            if (params?.seriesType === "bar") {
                                formatterHtml = `<div style=" width:fit-content;">
                                                    <div style="display:flex;margin-top:6px">
                                                        <span style="font-size:16px">${params.name}</span>
                                                    </div>
                                                    <div style="display:flex;margin-top:6px">
                                                        <span style="margin-right:6px;min-width:80px;">${i18n.t("dashboard.revenue")}</span>
                                                        <span><b>$${params?.value?.toFixed(2)}</b></span>
                                                    </div>
                                                </div>`;
                            } else {
                                return `<div style="display:flex;margin-top:6px">
                                            <span style="margin-right:6px;min-width:160px;">${i18n.t("general.accumulatedRevenue")}</span>
                                            <span><b>$${((total * params?.data) / 100).toFixed(2)}</b></span>
                                        </div>`;
                            }
                        }
                        // remaining is chargers
                        else {
                            let indexInData = params.dataIndex;
                            let data = res.data;
                            let hoveredData = data[indexInData];
                            if (params?.seriesType === "bar") {
                                formatterHtml = `<div style=" width:fit-content;">
                                                    <div style="display:flex;margin-top:6px">
                                                            <span style="margin-right:6px;min-width:120px">${i18n.t(
                                                                "chargingStation.chargePointName"
                                                            )}</span>
                                                            <span style="font-size:16px"><b>
                                                            ${hoveredData.x.name}</span></b>
                                                    </div>
                                                    <div style="display:flex;margin-top:6px">
                                                        <span style="margin-right:6px;min-width:120px;">${i18n.t("dashboard.revenue")}</span>
                                                        <span><b>$${hoveredData?.y?.toFixed(2)}</b></span>
                                                    </div>
                                                    <div style="display:flex;margin-top:6px">
                                                        <span style="margin-right:6px;min-width:120px;">${i18n.t("general.type")}</span>
                                                        <span><b>${hoveredData.x.powerType}</b></span>
                                                    </div>
                                                    <div style="display:flex;margin-top:6px">
                                                        <span style="margin-right:6px;min-width:120px;">${i18n.t("general.power")} </span>
                                                        <span><b>${hoveredData.x.powerKw + " kW"}</b></span>
                                                    </div>
                                                </div>`;
                            } else {
                                return `<div style="display:flex;margin-top:6px">
                                            <span style="margin-right:6px;min-width:160px;">${i18n.t("general.accumulatedRevenue")}</span>
                                            <span><b>$${((total * params?.data) / 100).toFixed(2)}</b></span>
                                        </div>`;
                            }
                        }
                        return formatterHtml;
                    }
                },
                legend: {
                    show: true,
                    data: [i18n.t("general.chargerRevenue"), i18n.t("general.cumulative")],
                    right: 70,
                    icon: "roundRect",
                    itemGap: 20
                },
                xAxis: [
                    {
                        type: "category",
                        data: XAxisLabels,
                        axisPointer: {
                            type: "shadow"
                        },
                        axisLabel: {
                            color: this.isDark ? "#ffffff" : "#808080"
                        }
                    }
                ],
                yAxis: [
                    {
                        type: "value",
                        name: i18n.t("dashboard.revenue"),
                        axisLabel: {
                            color: this.isDark ? "#ffffff" : "#808080"
                        }
                    },
                    {
                        type: "value",
                        name: i18n.t("general.cumulative"),
                        axisLabel: {
                            color: this.isDark ? "#ffffff" : "#808080",
                            formatter: "{value} %"
                        },
                        show: false,
                        min: 0,
                        max: 100
                    }
                ],
                // add grid to align within the canvas
                grid: {
                    top: 50,
                    left: 50,
                    right: 50,
                    bottom: 50
                },
                series: [
                    {
                        name: i18n.t("general.cumulative"),
                        type: "line",
                        yAxisIndex: 1,
                        smooth: true,
                        itemStyle: {
                            color: "#33c85a"
                        },
                        label: {
                            show: true,
                            position: "top",
                            color: this.isDark ? "#ffffff" : "#33c85a",
                            formatter: function (val) {
                                return val.data + "%";
                            }
                        },

                        data: convertedLineChartData
                    },
                    {
                        name: i18n.t("general.chargerRevenue"),
                        type: "bar",
                        stack: "Total",
                        itemStyle: {
                            color: "#0068d4"
                        },
                        label: {
                            show: true,
                            position: "top",
                            color: this.isDark ? "#ffffff" : "#808080",
                            formatter: function (val) {
                                // for simple values and objects used for styling eg:total
                                return "$" + val?.data?.toFixed(2);
                            }
                        },
                        data: graphData
                    }
                ]
            };
            this.chartData = option;
        }
    },
    mounted() {
        this.fetchRevenueWaterfallGraphData(this.dateRange, this.id);
    }
};
</script>
