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
                    unit: '',
                    xUnit: '',
                    xList: [],
                    yList: [],
                };
            }
        }
    },
    data() {
        return {
            timeList: [],
            nameList: [],
            seriesData: [],
            legendList: [],
        };
    },
    created() {},
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
            chart.showLoading({
                text: '',
                color: '#409EFF',
                maskColor: 'rgba(0, 0, 0, 0.9)',
                spinnerRadius: 20,
                lineWidth: 2
            });
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
            that.chartData.yList.forEach((item, idx) => {
                const rightOffset = (that.chartData.yList.length - idx) * 76 - 45;
                let info = {
                        name: item.name,
                        type: "line",
                        symbol:'circle',
                        // symbolSize: 8,
                        data: item.value,
                        // itemStyle: {
                        //     color: '#162951',
                        //     borderColor: color[idx],
                        //     borderWidth: 2,
                        //     borderType: 'solid',
                        // },
                        // lineStyle: {
                        //     normal: {
                        //         color: color[idx]
                        //     }
                        // }
                    };
                let legend = {
                        // itemHeight: 10,
                        // symbolSize: 10,
                        data: [{
                            name: item.name,
                            icon: "circle",
                        }],
                        // top: "0",
                        // right: rightOffset.toString(),
                        // textStyle: {
                        //     fontSize: 14,
                        //     color: "#B0B0CC"
                        // },
                        // itemStyle: {
                        //     color: color[idx]
                        // }
                    };
                that.seriesData.push(info);
                that.nameList.push(item.name);
                that.legendList.push(legend);
            });
        },
        draw() {
            const color = ["#1A91F8", "#FF8891", "#01AF6D", "#9B4AEB", "#D842A9", "#71E9D4", "#F6894C"];
            let options = {
                color: color,
                tooltip: {
                    trigger: "axis",
                    // formatter: function(params) {
                    //     let result = params[0].name + '<br/>';
                    //     params.forEach((p, idx) => {
                    //         result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color[idx]};"></span>
                    //                     ${p.seriesName}: ${p.value}<br/>`;
                    //     });
                    //     return result;
                    // },
                    padding: [12,20],
                    borderColor: "#FFFFFF",
                    borderWidth: 1,
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: this.legendList,
                grid: {
                    left: "20",
                    right: "0",
                    top: "40",
                    bottom: "20",
                    containLabel: true
                },
                xAxis: {
                    name: this.chartData.xUnit,
                    type: "category",
                    data: this.timeList,
                    boundaryGap: true,
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
                        fontWeight: 'bold',
                        textStyle: {
                            fontSize: 14,
                            color: "#525E69"
                        }
                    },
                },
                yAxis:  {
                    type: "value",
                    name: this.chartData.unit,
                    axisLabel: {
                        margin: 16,
                        // fontWeight: 'bold',
                        textStyle: {
                            fontSize: 14,
                            color: "#525E69"
                        }
                    },
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: '#525E69'
                        }
                    },
                    nameTextStyle: {
                        padding: [0, 0, 5, -55],
                        color: "#525E69"
                    },
                    splitLine: {
                        lineStyle: {
                            color: "#525E69"
                        }
                    }
                },
                series: this.seriesData
            };
            if (this.timeList.length > 0) {
                this.chartId.hideLoading();
            }
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