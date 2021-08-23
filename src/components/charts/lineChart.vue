<template>
    <div :id="id" :ref="id"> </div>
</template>
<script>
import { resizeCharts } from "@/utils/function";
export default {
    name: "line-chart",
    props: {
        id: String,
        chartData: {
            type: Object,
            default: function() {
                return {
                    xList: [],
                    yList: [],
                };
            }
        }
    },
    data() {
        return {
            lang: '',
            timeList: [],
            nameList: [],
            seriesData: [],
            legendList: [],
            yAxisData: []
        };
    },
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.prePareData();
        this.draw();
        window.addEventListener("resize", this.resizeCharts, false);
    },
    watch: {
        chartData: {
            deep: true,
            handler() {
                this.prePareData();
                this.draw();
            }
        }
    },
    computed: {
        chartId: function() {
            let chart = this.$echarts.init(this.$refs[this.id]);
            return chart;
        }
    },
    beforeDestroy() {
        if (this.chartId) {
            this.chartId.clear();
        }
        window.removeEventListener("resize", this.resizeCharts, false);
    },
    methods: {
        prePareData() {
            const that = this;
            this.timeList = that.chartData.xList;
            that.seriesData = [];
            that.nameList = [];
            that.legendList = [];
            const rightOffset = (this.lang === 'en') ? ['345', '245', '20'] : ['250', '170', '20']
            that.chartData.yList && that.chartData.yList.forEach((item, idx) => {
                let info = {
                        name: item.name,
                        type: "line",
                        symbol:'circle',
                        symbolSize: 10,
                        data: item.value,
                        areaStyle: {},
                        yAxisIndex: idx
                    };
                let legend = {
                        data: [{
                            name: item.name,
                            icon: "circle",
                        }],
                        top: "0",
                        right: rightOffset[idx],
                        textStyle: {
                            fontSize: 14,
                            color: "#525E69"
                        }
                    };
                that.seriesData.push(info);
                that.nameList.push(item.name);
                that.legendList.push(legend);
            });
            that.yAxisData = [
                        {
                            type: "value",
                            name: "(kWh)",
                            position: 'left',
                            axisLabel: {
                                margin: 10,
                                textStyle: {
                                    fontSize: 14,
                                    color: "#0c83ff"
                                }
                            },
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: '#525E69'
                                }
                            },
                            nameTextStyle: {
                                padding: [0, 0, 5, -45],
                                color: "#0c83ff",
                                fontWeight: 'bold',
                                fontSize: 14
                            },
                            splitLine: {
                                lineStyle: {
                                    color: "#525E69"
                                }
                            }
                        },
                        {
                            type: "value",
                            name: "(%)",
                            min: 0,
                            max: 100,
                            position: 'right',
                            axisLabel: {
                                margin: 10,
                                textStyle: {
                                    fontSize: 14,
                                    color: "#3ADB65"
                                }
                            },
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: '#525E69'
                                }
                            },
                            nameTextStyle: {
                                padding: [0, 0, 5, 45],
                                color: "#3ADB65",
                                fontWeight: 'bold',
                                fontSize: 14
                            },
                            splitLine: {
                                lineStyle: {
                                    color: "#525E69"
                                }
                            }
                        },
                        {
                            type: "value",
                            name: "(kW)",
                            position: 'right',
                            axisLabel: {
                                margin: 55,
                                textStyle: {
                                    fontSize: 14,
                                    color: "#FC2E56"
                                }
                            },
                            axisLine: {
                                show: false,
                                lineStyle: {
                                    color: '#525E69'
                                }
                            },
                            nameTextStyle: {
                                padding: [0, 0, 5, 130],
                                color: "#FC2E56",
                                fontWeight: 'bold',
                                fontSize: 14
                            },
                            splitLine: {
                                lineStyle: {
                                    color: "#525E69"
                                }
                            }
                        }
                    ];
            if (that.chartData.yList && !that.chartData.yList[0].value.length) {
                that.yAxisData[0].min = 0;
                that.yAxisData[0].max = 100;
            }
            if (that.chartData.yList && !that.chartData.yList[2].value.length) {
                that.yAxisData[2].min = 0;
                that.yAxisData[2].max = 100;
            }
        },
        draw() {
            const color = ["#0c83ff", "#3ADB65", "#FC2E56"];
            let options = {
                color: color,
                tooltip: {
                    trigger: "axis",
                    formatter: function(params) {
                        let result = params[0].name + '<br/>';
                        params.forEach((p, idx) => {
                            result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color[idx]};"></span>
                                        ${p.seriesName} : ${p.value} ${(idx)? '%':'kWh'} <br/>`;
                        });
                        return result;
                    },
                    padding: [12,20],
                    borderColor: "#FFFFFF",
                    borderWidth: 1,
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: this.legendList,
                grid: {
                    left: "25",
                    right: "20",
                    top: "70",
                    bottom: "20",
                    containLabel: true
                },
                xAxis: {
                    type: "category",
                    data: this.timeList,
                    boundaryGap: false,
                    nameTextStyle: {
                        padding: [0, 0, -50, 2],
                        color: "#525E69"
                    },
                    axisLine: {
                        lineStyle: {
                            color: " #525E69"
                        }
                    },
                    axisLabel: {
                        margin: 16,
                        textStyle: {
                            fontSize: 14,
                            color: "#525E69"
                        }
                    },
                },
                yAxis:  this.yAxisData,
                series: this.seriesData
            };
            this.chartId.setOption(options);
        },
        resizeCharts: function() {
            resizeCharts([this.id], this.$echarts);
        },
    }
};
</script>
<style>
</style>