<template>
    <el-dialog :title="$t(`general.status`)" width="80%" :visible.sync="visible" custom-class="" :show-close="false" @close="closeDialog()">
        <div style="width:100%;height:350px">
            <CommonChart v-if="chartData" :chartData="chartData"></CommonChart>
        </div>
    </el-dialog>
</template>

<script>
import { $HTTP_getSessionStatusGraphDataById } from "@/api/api";
import CommonChart from "@/components/charts/CommonChart";
import {
    transformUtcToLocTimeForGraphs,
    transformSecondsToReadableForm
} from "@/utils/function";

export default {
    props: {
        show: Boolean,
        data: Object
    },
    emits: ["close"],
    components: {
        CommonChart
    },
    computed: {
        isDark() {
            return this.$store.state.darkTheme;
        }
    },
    data() {
        return {
            visible: false,
            chartData: {},
            responseData: []
        };
    },
    mounted() {
        this.visible = this.show;
        this.fetchSessionStatusGraphData(this.data.id);
    },
    methods: {
        fetchSessionStatusGraphData(id) {
            let params = {};
            params.sessionId = id;

            $HTTP_getSessionStatusGraphDataById(params)
                .then((res) => {
                    if (res.length > 0) {
                        // convert to chart data
                        // add last data to graph until session close
                        let response = res;
                        let finalData = {
                            x: this.data.stopTimestamp
                                ? this.data.stopTimestamp
                                : new Date(),
                            y: "final"
                        };
                        response.push(finalData);
                        this.responseData = response;
                        this.convertChartOptions(response);
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
        renderItem(params, api) {
            var categoryIndex = api.value(0);
            var start = api.coord([api.value(1), categoryIndex]);
            var end = api.coord([api.value(2), categoryIndex]);
            var height = api.size([0, 1])[1] * 0.6;
            var rectShape = this.$echarts.graphic.clipRectByRect(
                {
                    x: start[0],
                    y: start[1] - height / 2,
                    width: end[0] - start[0],
                    height: height
                },
                {
                    x: params.coordSys.x,
                    y: params.coordSys.y,
                    width: params.coordSys.width,
                    height: params.coordSys.height
                }
            );
            return (
                rectShape && {
                    type: "rect",
                    transition: ["shape"],
                    shape: rectShape,
                    style: { fill: api.visual("color") }
                }
            );
        },
        getColor(status) {
            if (status === "Available") {
                return "rgba(51, 200, 90,1)";
            } else if (status === "Faulted") {
                return "rgba(252, 46, 86,1)";
            } else if (status === "Unavailable") {
                return "rgba(252, 46, 86,0.5)";
            } else if (
                status === "SuspendedEVSE" ||
                status === "SuspendedEV" ||
                status === "Finishing"
            ) {
                return "rgba(64, 158, 255,0.15)";
            } else if (status === "Reserved") {
                return "rgba(64, 158, 255,0.5)";
            } else if (status === "Preparing") {
                return "rgba(64, 158, 255,0.5)";
            } else if (status === "Charging") {
                return "rgba(64, 158, 255,1)";
            }
        },
        convertChartOptions(data) {
            let timeStampData = data.map((item) =>
                parseFloat(transformUtcToLocTimeForGraphs(item.x, "x"))
            );
            let chargerStatus = data.map((item) => item.y);
            let timeStampDataDuration = timeStampData
                .slice(1)
                .map((e, i) => timeStampData[i + 1] - timeStampData[i]);
            let categories = ["Status"];
            let _data = [];
            let startTime = timeStampData[0];
            categories.forEach((category, index) => {
                var baseTime = startTime;
                for (var i = 0; i < timeStampData.length; i++) {
                    var duration = timeStampDataDuration[i] || 0;
                    _data.push({
                        name: chargerStatus[i],
                        value: [
                            index,
                            baseTime,
                            (baseTime += duration),
                            duration
                        ],
                        itemStyle: {
                            color: this.getColor(chargerStatus[i])
                        }
                    });
                }
            });

            // create option
            let option = {
                tooltip: {
                    formatter: function (params) {
                        let formatterHtml = `<div style=" width:fit-content;">
                                                <span style="font-size:18px;font-weight:600">${
                                                    params.name
                                                }</span>
                                                <div style="display:flex;margin-top:6px">
                                                    <span style="margin-right:6px;">Start Date</span>
                                                    <span><b>${
                                                        params.value[1]
                                                            ? transformUtcToLocTimeForGraphs(
                                                                  params
                                                                      .value[1],
                                                                  "MMM Do HH:mm:ss"
                                                              )
                                                            : ""
                                                    }</b></span>
                                                </div>
                                                <div style="display:flex;margin-top:6px">
                                                    <span style="margin-right:6px;">End Date</span>
                                                    <span><b>${
                                                        params.value[2]
                                                            ? transformUtcToLocTimeForGraphs(
                                                                  params
                                                                      .value[2],
                                                                  "MMM Do HH:mm:ss"
                                                              )
                                                            : ""
                                                    }</b></span>
                                                </div>
                                                <div style="display:flex;margin-top:6px">
                                                    <span style="margin-right:6px;">Duration</span>
                                                    <span><b>${
                                                        params.value[3]
                                                            ? transformSecondsToReadableForm(
                                                                  params
                                                                      .value[3] /
                                                                      1000
                                                              )
                                                            : ""
                                                    }</b></span>
                                                </div>
                                            </div>`;
                        return formatterHtml;
                    }
                },
                dataZoom: [
                    {
                        type: "slider",
                        filterMode: "weakFilter",
                        showDataShadow: false,
                        top: 250,
                        labelFormatter: ""
                    },
                    {
                        type: "inside",
                        filterMode: "weakFilter"
                    }
                ],
                grid: {
                    height: 100,
                    top: 100
                },
                xAxis: {
                    min: startTime,
                    scale: true,
                    axisLabel: {
                        formatter: function (val) {
                            return transformUtcToLocTimeForGraphs(val);
                        },
                        color: this.isDark ? "#ffffff" : "#808080"
                    }
                },
                yAxis: {
                    data: categories,
                    axisLabel: {
                        color: this.isDark ? "#ffffff" : "#808080"
                    }
                },
                // add custom legends using graphic
                graphic: [
                    {
                        type: "group",
                        right: "10%",
                        top: "0%",
                        children: [
                            // available legend
                            {
                                type: "circle",
                                shape: {
                                    cx: 1,
                                    cy: 1,
                                    r: 10
                                },
                                right: 230,
                                top: 0,
                                style: {
                                    fill: this.getColor("Available")
                                }
                            },
                            {
                                type: "text",
                                z: 100,
                                left: -220,
                                top: 5,
                                style: {
                                    fill: this.isDark ? "#ffffff" : "#808080",
                                    width: 400,
                                    overflow: "break",
                                    text: "Available"
                                }
                            },
                            {
                                type: "circle",
                                shape: {
                                    cx: 1,
                                    cy: 1,
                                    r: 10
                                },
                                right: 230,
                                top: 30,
                                style: {
                                    fill: this.getColor("Charging")
                                }
                            },
                            {
                                type: "text",
                                z: 100,
                                left: -220,
                                top: 35,
                                style: {
                                    fill: this.isDark ? "#ffffff" : "#808080",
                                    width: 400,
                                    overflow: "break",
                                    text: "Charging"
                                }
                            },
                            {
                                type: "circle",
                                shape: {
                                    cx: 1,
                                    cy: 1,
                                    r: 10
                                },
                                right: 230,
                                top: 60,
                                style: {
                                    fill: this.getColor("Faulted")
                                }
                            },
                            {
                                type: "text",
                                z: 100,
                                left: -222,
                                top: 65,
                                style: {
                                    fill: this.isDark ? "#ffffff" : "#808080",
                                    width: 400,
                                    overflow: "break",
                                    text: "Faulted"
                                }
                            },
                            {
                                type: "circle",
                                shape: {
                                    cx: 1,
                                    cy: 1,
                                    r: 10
                                },
                                right: 130,
                                top: 30,
                                style: {
                                    fill: this.getColor("Reserved")
                                }
                            },
                            {
                                type: "text",
                                z: 100,
                                left: -120,
                                top: 28,
                                style: {
                                    fill: this.isDark ? "#ffffff" : "#808080",
                                    width: 400,
                                    overflow: "break",
                                    text: "Reserved"
                                }
                            },
                            {
                                type: "text",
                                z: 100,
                                left: -120,
                                top: 40,
                                style: {
                                    fill: this.isDark ? "#ffffff" : "#808080",
                                    width: 400,
                                    overflow: "break",
                                    text: "Preparing"
                                }
                            },
                            {
                                type: "circle",
                                shape: {
                                    cx: 1,
                                    cy: 1,
                                    r: 10
                                },
                                right: 130,
                                top: 60,
                                style: {
                                    fill: this.getColor("Unavailable")
                                }
                            },
                            {
                                type: "text",
                                z: 100,
                                left: -120,
                                top: 65,
                                style: {
                                    fill: this.isDark ? "#ffffff" : "#808080",
                                    width: 400,
                                    overflow: "break",
                                    text: "Unavailable"
                                }
                            },
                            // same color for SuspendedEV/SuspendedEVSE/Finishing
                            {
                                type: "circle",
                                shape: {
                                    cx: 1,
                                    cy: 1,
                                    r: 10
                                },
                                right: 20,
                                top: 30,
                                style: {
                                    fill: this.getColor("Finishing")
                                }
                            },
                            {
                                type: "text",
                                z: 100,
                                left: -10,
                                top: 35,
                                style: {
                                    fill: this.isDark ? "#ffffff" : "#808080",
                                    width: 400,
                                    overflow: "break",
                                    text: "Idle"
                                }
                            }
                        ]
                    }
                ],
                series: [
                    {
                        type: "custom",
                        renderItem: this.renderItem,
                        itemStyle: {
                            opacity: 0.8
                        },
                        encode: {
                            x: [1, 2],
                            y: 0
                        },
                        data: _data
                    }
                ]
            };
            this.chartData = option;
        },
        closeDialog() {
            this.$emit("close", true);
        }
    }
};
</script>
