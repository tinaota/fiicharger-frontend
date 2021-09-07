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
                    xList: [],
                    yList: [],
                    unit: ''
                };
            }
        }
    },
    data() {
        return {
            timeList: [],
            nameList: [],
            seriesData: []
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
            this.timeList = this.chartData.xList;
            that.nameList = [];
            that.seriesData = [];
            that.chartData.yList && that.chartData.yList.forEach((item, idx) => {
                let info = {
                            name: item.name,
                            type: 'bar',
                            stack: that.id,
                            data: item.value,
                            barWidth: this.chartData.xList.length < 15 ? 25: 10,
                            emphasis: {
                                focus: 'series'
                            }
                        };
                that.seriesData.push(info);
                that.nameList.push(item.name);
            });
        },
        //配置
        draw() {
            let options = {
                color: ['#0C83FF', '#FFA10B'],
                tooltip: {
                    trigger: "axis",
                    // formatter: "{b}: {c} "+this.chartData.unit,
                    padding: [12,20],
                    borderColor: "#FFFFFF",
                    borderWidth: 1,
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: this.nameList,
                    right: "20",
                    top: '5',
                    textStyle: {
                        fontSize: 14,
                        color: "#525E69"
                    },
                    itemGap: 24
                },
                grid: {
                    left: "25",
                    right: "20",
                    top: "60",
                    bottom: "0",
                    containLabel: true
                },
                xAxis: {
                    type: "category",
                    data: this.timeList,
                    nameTextStyle: {
                        padding: [0, 0, -50, 2],
                        color: "#525E69"
                    },
                    axisLine: {
                        lineStyle: {
                            color: "#525E69"
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
                yAxis: [{
                    type: "value",
                    name: this.chartData.unit,
                    min: 0,
                    max: 100,
                    axisLabel: {
                        margin: 16,
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
                        padding: [0, 0, 0, -50],
                        color: "#525E69",
                        fontWeight: 'bold',
                                fontSize: 14
                    },
                    splitLine: {
                        lineStyle: {
                            color: "#E5E9F2"
                        }
                    },
                }],
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