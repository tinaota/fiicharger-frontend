<template>
    <div :id="id" :ref="id"></div>
</template>
<script>
import { resizeCharts } from "@/utils/function";
export default {
    name: "bar-chart",
    props: {
        id: String,
        chartData: {
            type: Object,
            default: function() {
                return {
                    timeList: [],
                    data: [],
                    unit: ''
                };
            }
        }
    },
    data() {
        return {
            timeList: [],
            seriesData: []
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
            this.timeList = this.chartData.timeList;
            this.seriesData = [{
                type: 'bar',
                // stack: that.id,
                data: this.chartData.data,
                barWidth: this.chartData.timeList.length < 15 ? 25: 10,
                itemStyle: {
                    normal: {
                        barBorderRadius: this.chartData.timeList.length < 15 ? [5, 5, 5, 5]:[2, 2, 2, 2]
                    }
                }
            }];
        },
        //配置
        draw() {
            let options = {
                color: ['#0c83ff'],
                tooltip: {
                    trigger: "axis",
                    formatter: "{b}: {c} "+this.chartData.unit,
                    padding: [12,20],
                    borderColor: "#FFFFFF",
                    borderWidth: 1,
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: "10",
                    right: "20",
                    top: "30",
                    bottom: "0",
                    containLabel: true
                },
                xAxis: {
                    type: "category",
                    data: this.timeList,
                    nameTextStyle: {
                        padding: [0, 0, -50, 2],
                        color: "#B0B0CC"
                    },
                    axisLine: {
                        lineStyle: {
                            color: " #B0B0CC"
                        }
                    },
                    axisLabel: {
                        margin: 16,
                        textStyle: {
                            fontSize: 12
                        }
                    },
                },
                yAxis:  {
                    type: "value",
                    name: this.chartData.unit,
                    axisLabel: {
                        margin: 16,
                        textStyle: {
                            fontSize: 12
                        }
                    },
                    axisLine: {
                        show: false,
                        lineStyle: {
                            color: '#B0B0CC'
                        }
                    },
                    nameTextStyle: {
                        padding: [0, 0, -5, -50],
                        color: "#B0B0CC"
                    },
                    splitLine: {
                        lineStyle: {
                            color: "rgba(255,255,255,0.2)"
                        }
                    },
                },
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