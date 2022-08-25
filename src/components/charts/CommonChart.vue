<template>
    <div class="commonChart" id="commonChart" ref="commonChart">
    </div>
</template>

<script>
export default {
    name: "CommonChart",
    props: {
        chartData: Object
    },
    computed: {
        myChart: function () {
            //Initialize the echarts instance based on the prepared dom
            let chart = this.$echarts.init(this.$refs["commonChart"]);
            return chart;
        }
    },
    watch: {
        chartData: function () {
            this.drawChart();
            window.addEventListener("resize", this.resizeCharts);
        }
    },
    mounted() {
        this.drawChart();
        window.addEventListener("resize", this.resizeCharts);
    },
    beforeDestroy() {
        if (this.myChart) {
            this.myChart.clear();
        }
        window.removeEventListener("resize", this.resizeCharts, false);
    },
    methods: {
        drawChart() {
            //Specify configuration items and data for the chart
            let option = this.chartData;

            //Use the configuration items and data just specified to display the chart.
            this.myChart.setOption(option);
        },
        resizeCharts: function () {
            this.myChart.resize();
        }
    }
};
</script>

<style scoped>
.commonChart {
    height: 100%;
    width: 100%;
}
</style>
