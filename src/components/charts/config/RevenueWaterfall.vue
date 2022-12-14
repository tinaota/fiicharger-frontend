<template>
    <div style="width: 100%; height: 100%">
        <span style="margin-left:16px">{{$t('general.maxBreakdowns')}}</span>
        <el-select style="width:200px;margin-left:16px" class="select-small" v-model="noofChargers" :placeholder="$t('general.maxBreakdowns')" filterable>
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
                        this.noofChargersList = Array.from(
                            { length: dataLength },
                            (_, i) => i + 1
                        );
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
            // remove undefined labels
            XAxisLabels.splice(
                this.noofChargers,
                data.length - this.noofChargers
            );
            // insert total label
            XAxisLabels.splice(0, 0, "Total");
            // insert others label
            if (this.noofChargers < this.responseData.data.length) {
                XAxisLabels.splice(XAxisLabels.length, 0, "Others");
            }
            let remainingWaterFallData = 0;
            let waterFallData = data.map((item, index) => {
                if (index < this.noofChargers) {
                    return item.y;
                } else {
                    remainingWaterFallData += item.y;
                }
            });
            // remove undefined waterfall data
            waterFallData.splice(
                this.noofChargers,
                data.length - this.noofChargers
            );
            // add total to waterfall data
            waterFallData.splice(0, 0, res.total);
            //insert others value
            waterFallData.splice(
                waterFallData.length,
                0,
                remainingWaterFallData
            );
            let sum = 0;
            let othersSum = 0;
            let total = res.total;
            let transparentPlaceholderData = data.map((item, index) => {
                if (index < this.noofChargers) {
                    sum += item.y;
                    othersSum += item.y;
                    return total - sum;
                } else {
                    othersSum += item.y;
                }
            });
            // remove undefined transparentPlaceholderData data
            transparentPlaceholderData.splice(
                this.noofChargers,
                data.length - this.noofChargers
            );
            // add 0 at index 0 for total
            transparentPlaceholderData.splice(0, 0, 0);
            // insert others value
            if (this.noofChargers < this.responseData.data.length) {
                transparentPlaceholderData.splice(
                    transparentPlaceholderData.length,
                    0,
                    total - othersSum
                );
            }

            let noofChargers = this.noofChargers;

            let option = {
                tooltip: {
                    formatter: function (params) {
                        let formatterHtml;
                        // if is total or if it is others
                        if (
                            params.dataIndex === 0 ||
                            params.dataIndex === noofChargers + 1
                        ) {
                            formatterHtml = `<div style=" width:fit-content;">
                                                <span style="font-size:16px">Revenue</span>
                                                <div style="display:flex;margin-top:6px">
                                                    <span style="margin-right:6px;">${
                                                        params.name
                                                    }</span>
                                                    <span><b>${params?.value?.toFixed(
                                                        2
                                                    )}</b></span>
                                                </div>
                                            </div>`;
                        }
                        // remaining is chargers
                        else {
                            // subtract one as one item "Total" is added at beginning
                            let indexInData = params.dataIndex - 1;
                            let data = res.data;
                            let hoveredData = data[indexInData];
                            formatterHtml = `<div style=" width:fit-content;">
                                                <span style="font-size:16px">Revenue</span>
                                                <div style="display:flex;margin-top:6px">
                                                    <span style="margin-right:6px;">${
                                                        hoveredData.x.name
                                                    }</span>
                                                    <span><b>${hoveredData?.y?.toFixed(
                                                        2
                                                    )}</b></span>
                                                </div>
                                                <div style="display:flex;margin-top:6px">
                                                    <span style="margin-right:6px;">Power Type</span>
                                                    <span><b>${
                                                        hoveredData.x.powerType
                                                    }</b></span>
                                                </div>
                                                <div style="display:flex;margin-top:6px">
                                                    <span style="margin-right:6px;">Power Kw</span>
                                                    <span><b>${
                                                        hoveredData.x.powerKw
                                                    }</b></span>
                                                </div>
                                            </div>`;
                        }
                        return formatterHtml;
                    }
                },
                legend: {
                    right: "left",
                    padding: [0, 50, 0, 0],
                    textStyle: {
                        color: this.isDark ? "#ffffff" : "#808080"
                    }
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
                        axisLabel: {
                            color: this.isDark ? "#ffffff" : "#808080"
                        }
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
                        name: "",
                        type: "bar",
                        stack: "Total",
                        itemStyle: {
                            borderColor: "transparent",
                            color: "transparent"
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: "transparent",
                                color: "transparent"
                            }
                        },
                        data: transparentPlaceholderData
                    },
                    {
                        name: "Revenue",
                        type: "bar",
                        stack: "Total",
                        itemStyle: {
                            color: "#33c85a"
                        },
                        label: {
                            show: true,
                            position: "top",
                            color: this.isDark ? "#ffffff" : "#808080",
                            formatter: function (val) {
                                return val?.data?.toFixed(2);
                            }
                        },
                        data: waterFallData
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
