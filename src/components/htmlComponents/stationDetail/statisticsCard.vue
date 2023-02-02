<template>
    <div class="card-8 stats_area">
        <span class="name">{{ $t(`${name}`) }} {{name==='chargingStation.powerConsumption' ?'(kWh)' :''}}</span>
        <div class="num_stats" v-if="data">
            <span class="num">{{ data.value }}</span>
            <span v-if="data.trend!==0" :class="data.trend>0?'positive num_trend':'negative num_trend'">
                <i v-if="data.trend>0" class="fa fa-arrow-up" aria-hidden="true"></i>
                <i v-else class="fa fa-arrow-down" aria-hidden="true"></i>
                {{ Math.abs(data.trend.toFixed(2)) }} %
            </span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        name: String,
        data: Object
    }
};
</script>
<style lang="scss" scoped>
.stats_area {
    width: calc(20% - 32px);
    margin-right: 12px;
    height: 47px;
    position: relative;
    vertical-align: top;
    padding-bottom: 48px;
    .name {
        color: #525e69;
    }
    .num_stats {
        display: flex;
        flex-direction: column;
        font-size: 1.25rem;
        .num {
            font-weight: bold;
            margin: 10px 0px 5px;
        }
        .num_trend {
            font-size: 1rem;
            font-weight: 700;
            &.positive {
                color: #33c85a;
            }
            &.negative {
                color: #fc2e56;
            }
            /* using webstroke to make the icon thinner  */
            .fa {
                -webkit-text-stroke: 1.5px #e6eef8;
            }
        }
    }
}
.stats_area:nth-child(5) {
    margin-right: 0px;
}

@media (max-width: 1300px) {
    .stats_area {
        flex: 25%;
    }
    .stats_area:nth-child(3) {
        margin-right: 0px;
    }
}

@media screen and (max-width: 800px) {
    .stats_area:nth-child(3) {
        margin-right: 12px;
    }
    .stats_area:nth-child(5) {
        margin-right: 12px;
    }
}
</style>
