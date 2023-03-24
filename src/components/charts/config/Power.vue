<template>
    <div style="width:100%;height:350px">
        <div v-if="Object.keys(chartData).length>0" class="statusBox">
            <CommonChart :chartData="chartData"></CommonChart>
        </div>
        <div v-else class="statusBox">
            <span>{{$t('noData')}}</span>
        </div>
    </div>
</template>
<script>
import { $HTTP_getPowerGraphDataByTransactionId } from "@/api/api";
import CommonChart from "@/components/charts/CommonChart";
import { transformUtcToLocTimeForGraphs } from "@/utils/function";
import i18n from "../../../lang/lang";
import moment from "moment";
import { catchErrors } from "@/utils/function";

export default {
    props: { data: Object },
    components: { CommonChart },
    computed: {
        isDark() {
            return this.$store.state.darkTheme;
        }
    },
    data() {
        return {
            visible: false,
            chartData: {},
            responseData: [],
            lang: moment.locale()
        };
    },
    mounted() {
        if (this.data.transactionId) {
            this.getPowerGraphDataByTransactionId(this.data.transactionId);
        }
    },
    methods: {
        getPowerGraphDataByTransactionId(id) {
            $HTTP_getPowerGraphDataByTransactionId({ transactionId: id })
                .then((res) => {
                    if (res.length > 0) {
                        this.responseData = res;
                        this.convertChartOptions(res);
                    }
                })
                .catch((err) => {
                    this.responseData = [];
                    let errorMessage = catchErrors("get powerGraphData", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        convertChartOptions(data) {
            let XAxisLabels = data.map((item) =>
                //format differently if lang is chinese
                this.lang === "zh-tw" || this.lang === "zh-cn"
                    ? transformUtcToLocTimeForGraphs(item.x, "MMM Do HH:mm")
                    : transformUtcToLocTimeForGraphs(item.x)
            );
            let powerActiveImport = data.map((item) => item.y.powerActiveImport);
            let powerOffered = data.map((item) => item.y.powerOffered);
            let soC = data.map((item) => item.y.soC);
            let legendData = Object.keys(data[0].y).map((item) => {
                console.log(item);
                if (item === "soC") {
                    return i18n.t("general.batteryLevel");
                } else if (item === "powerOffered") {
                    return i18n.t("general.maxPower");
                } else if (item === "powerActiveImport") {
                    return i18n.t("general.power");
                }
            });

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
                        name: i18n.t("general.power") + " (kW)",
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
                        name: i18n.t("general.batteryLevel") + " (%)",
                        min: 0,
                        axisLabel: {
                            formatter: "{value}",
                            color: this.isDark ? "#ffffff" : "#525e69"
                        },
                        nameTextStyle: {
                            color: this.isDark ? "#ffffff" : "#525e69",
                            padding: [0, 50, 0, 0]
                        }
                    }
                ], // add grid to align within the canvas
                grid: {
                    top: 50,
                    left: 50,
                    right: 50,
                    bottom: 50
                },
                series: [
                    {
                        name: i18n.t("general.power"),
                        type: "line",
                        yAxisIndex: 0,
                        symbol: "circle",
                        symbolSize: 7,
                        tooltip: {
                            valueFormatter: function (value) {
                                return value + " kW";
                            }
                        },
                        data: powerActiveImport,
                        itemStyle: {
                            color: "#00008B"
                        }
                    },
                    {
                        name: i18n.t("general.maxPower"),
                        type: "line",
                        yAxisIndex: 0,
                        symbol: "circle",
                        symbolSize: 7,
                        tooltip: {
                            valueFormatter: function (value) {
                                return value + " kW";
                            }
                        },
                        data: powerOffered,
                        itemStyle: {
                            color: "#FFA500"
                        }
                    },
                    {
                        name: i18n.t("general.batteryLevel"),
                        type: "line",
                        yAxisIndex: 1,
                        symbol: "circle",
                        symbolSize: 7,
                        tooltip: {
                            valueFormatter: function (value) {
                                return value + " %";
                            }
                        },
                        data: soC,
                        itemStyle: {
                            color: "#808080"
                        }
                    }
                ]
            };
            this.chartData = option;
        }
    }
};
</script>
<style lang="scss" scoped>
.statusBox {
    display: flex;
    width: inherit;
    height: inherit;
    justify-content: center;
    align-items: center;
}
</style>
