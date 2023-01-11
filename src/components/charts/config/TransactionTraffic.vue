<template>
    <div style="width:100%;height:100%">
        <CommonChart v-if="chartData" :chartData="chartData"></CommonChart>
    </div>
</template>

<script>
import CommonChart from "@/components/charts/CommonChart";
import { $HTTP_getTransactionTrafficGraphData } from "@/api/api";
import { transformUtcToLocTimeForGraphs } from "@/utils/function";
import i18n from "../../../lang/lang";
import moment from "moment";
export default {
    components: {
        CommonChart
    },
    props: {
        dateRange: Array,
        // props can be both number and string
        id: [Number, String],
        type: String
    },
    data() {
        return {
            chartData: {},
            lang: moment.locale(),
            responseData: []
        };
    },
    watch: {
        dateRange: function () {
            // check the length of the dates to verify
            // it has both start/end dates
            this.fetchTransactionTrafficGraphData(this.dateRange, this.id);
        },
        isDark: function () {
            this.convertChartOptions(this.responseData);
        }
    },
    computed: {
        isDark() {
            return this.$store.state.darkTheme;
        }
    },
    mounted() {
        this.fetchTransactionTrafficGraphData(this.dateRange, this.id);
    },
    beforeDestroy() {},
    methods: {
        fetchTransactionTrafficGraphData(dateRange, id) {
            let params = {};
            params.StartedAfter = dateRange[0];
            params.StartedBefore = dateRange[1];
            if (this.type === "station") {
                params.ChargeStationId = id;
            } else if (this.type === "charger") {
                params.ChargePointId = id;
            }
            $HTTP_getTransactionTrafficGraphData(params)
                .then((res) => {
                    if (res.length > 0) {
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
        convertChartOptions(data) {
            let XAxisLabels = data.map((item) =>
                //format differently if lang is chinese
                this.lang === "zh-tw" || this.lang === "zh-cn"
                    ? transformUtcToLocTimeForGraphs(item.x, "MMM Do HH:mm")
                    : transformUtcToLocTimeForGraphs(item.x)
            );
            let transactionsData = data.map((item) => item.y.transactions);
            let repeatedUsersData = data.map((item) => item.y.repeatUsers);
            let newUsersData = data.map((item) => item.y.newUsers);
            let legendData = Object.keys(data[0].y).map((item) =>
                i18n.t(`graphs.${item}`)
            );
            let option = {
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        crossStyle: {
                            color: this.isDark ? "#ffffff" : "#525e69"
                        },
                        label: {
                            width: 136
                        }
                    },
                    backgroundColor: this.isDark ? "#ffffff" : "#e6eef8"
                },
                legend: {
                    data: legendData,
                    icon: "circle",
                    itemGap: 20,
                    right: "left",
                    padding: [0, 50, 0, 0],
                    textStyle: {
                        color: this.isDark ? "#ffffff" : "#525e69"
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
                            color: this.isDark ? "#ffffff" : "#525e69"
                        }
                    }
                ],
                yAxis: [
                    {
                        type: "value",
                        name: i18n.t("graphs.totalUsers"),
                        min: 0,
                        axisLabel: {
                            formatter: "{value}",
                            color: this.isDark ? "#ffffff" : "#525e69"
                        },
                        nameTextStyle: {
                            color: this.isDark ? "#ffffff" : "#525e69"
                        }
                    },
                    {
                        type: "value",
                        name: i18n.t("graphs.transactions"),
                        min: 0,
                        axisLabel: {
                            formatter: "{value}",
                            color: this.isDark ? "#ffffff" : "#525e69"
                        },
                        nameTextStyle: {
                            color: this.isDark ? "#ffffff" : "#525e69"
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
                        name: i18n.t("graphs.transactions"),
                        type: "line",
                        yAxisIndex: 1,
                        symbol: "circle",
                        symbolSize: 7,
                        tooltip: {
                            valueFormatter: function (value) {
                                return value;
                            }
                        },
                        data: transactionsData,
                        itemStyle: {
                            color: "#FF6601"
                        }
                    },
                    {
                        name: i18n.t("graphs.newUsers"),
                        type: "bar",
                        stack: "add",
                        data: newUsersData,
                        itemStyle: {
                            color: "#00B8DC"
                        }
                    },
                    {
                        name: i18n.t("graphs.repeatUsers"),
                        type: "bar",
                        stack: "add",
                        data: repeatedUsersData,
                        itemStyle: {
                            color: "#00667A"
                        }
                    }
                ]
            };
            this.chartData = option;
        }
    }
};
</script>
