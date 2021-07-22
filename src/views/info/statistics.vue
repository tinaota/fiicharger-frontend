<template>
    <div class="scroll">
        <div class="mainctrl dashboard-statistics">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.information') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.statistics') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <br/>
            <el-select
                class="select-small large"
                v-model="filter.operatorTypeId"
                :placeholder="$t('general.operator')"
                @change="fetchData"
                clearable>
                <el-option v-for="(item, key) in operatorList" :label="item" :key="key" :value="parseInt(key)"></el-option>
            </el-select>
            <br/>
            <div class="card-8 statistics">
                <div class="header">{{ $t('menu.statistics') }}
                    <el-select
                        class="select-small right"
                        v-model="statisticsDay"
                        @change="handleSelected('s')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select>
                </div>
                <div class="s-contain">
                    <div class="item">
                        <div class="label">{{ $t('general.billing') }}</div>
                        <div class="content">
                            <span>{{ "$" + new Intl.NumberFormat('en-IN').format(statistics.billing[0]) }}</span>
                            <i v-if="statistics.billing[1]>0" class="el-icon-top"><span> {{ statistics.billing[1] }}% </span></i>
                            <i v-else class="el-icon-bottom"><span>{{ statistics.billing[1] }}% </span></i>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.energyUsedUnit') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.energyUsedUnit[0]) }}</span>
                            <i v-if="statistics.energyUsedUnit[1]>0" class="el-icon-top"><span>{{ statistics.energyUsedUnit[1] }}%</span></i>
                            <i v-else class="el-icon-bottom"><span>{{ statistics.energyUsedUnit[1] }}%</span></i>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.nAccount') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.nAccount) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('chargingStation.nChargePoint') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.nChargePoint) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.nSession') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.nSession) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.nConnector') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.nConnector) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('dashboard.powerUsedTop10') }}</div>
                    <!-- <el-select
                        class="select-small right"
                        v-model="powerUsedTop10Day"
                        @change="handleSelected('p10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select> -->
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in powerUsedTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.id }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(powerUsedTop10.data[idx].val) }}</span>
                        </div>
                        <el-progress :class="{'spec': item.id==powerUsedTop10.most.id}" :percentage="item.val" :show-text="false" :stroke-width="8"></el-progress>
                    </li>
                </ul>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('dashboard.revenueTop10') }}</div>
                    <!-- <el-select
                        class="select-small right"
                        v-model="revenueTop10Day"
                        @change="handleSelected('r10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select> -->
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in revenueTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.id }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(revenueTop10.data[idx].val) }}</span>
                        </div>
                        <el-progress :class="{'spec': item.id==revenueTop10.most.id}" :percentage="item.val" :show-text="false" :stroke-width="8"></el-progress>
                    </li>
                </ul>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('dashboard.sessionTop10') }}</div>
                    <!-- <el-select
                        class="select-small right"
                        v-model="sessionTop10Day"
                        @change="handleSelected('s10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select> -->
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in sessionTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.id }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(sessionTop10.data[idx].val) }}</span>
                        </div>
                        <el-progress :class="{'spec': item.id==sessionTop10.most.id}" :percentage="item.val" :show-text="false" :stroke-width="8"></el-progress>
                    </li>
                </ul>
            </div>
            <div class="card-8 rank-area">
                <div class="header">
                    <div class="title">{{ $t('dashboard.faultsTypeTop5') }}</div>
                    <!-- <el-select
                        class="select-small right"
                        v-model="faultsTypeTop5Day"
                        @change="handleSelected('f5')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select> -->
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in faultsTypeTop5.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.id }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(faultsTypeTop5.data[idx].val) }}</span>
                        </div>
                        <el-progress :class="{'spec': item.id==faultsTypeTop5.most.id}" :percentage="item.val" :show-text="false" :stroke-width="8"></el-progress>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
import DashboardData from "@/tmpData/dashboardData";
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            lang: '',
            filter: {
                operatorTypeId: 1
            },
            operatorList: {
                1: i18n.t('general.all'),
                2: "MidwestFiber",
                3: "APT"
            },
            daySelectList: i18n.t('dashboard.daySelectList'),
            statisticsDay: '7',
            statistics: {
                billing: [0,0],
                energyUsedUnit: [0,0],
                nAccount: 0,
                nChargePoint: 0,
                nSession: 0,
                nConnector: 0
            },
            powerUsedTop10Day: '7',
            powerUsedTop10: {
                most: "",
                data: {}
            },
            revenueTop10Day: '7',
            revenueTop10: {
                most: "",
                data: {}
            },
            sessionTop10Day: '7',
            sessionTop10: {
                most: "",
                data: {}
            },
            faultsTypeTop5Day: '7',
            faultsTypeTop5: {
                most: "",
                data: {}
            },
        }
    },
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchData();
    },
    methods : {
        fetchData() {
            const data = Object.assign({},DashboardData[this.filter.operatorTypeId || 1]);
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.statistics = data.statistics;
            this.powerUsedTop10 = this.addPercentage(data.powerUsedTop10);
            this.revenueTop10 = this.addPercentage(data.revenueTop10);
            this.sessionTop10 = this.addPercentage(data.sessionTop10);
            this.faultsTypeTop5 = this.addPercentage(data.faultsTypeTop5);
            setScrollBar('.scroll', this);
        },
        changeOption() {
            // console.log(this.curOperator);
        },
        addPercentage(item) {
            let tmp = Object.assign({}, item);
            tmp.pData = [];
            const basicP = Math.round(tmp.most.val/0.9);
            tmp.data.forEach(info => {
                tmp.pData.push({
                    id: info.id,
                    val: Math.round(info.val * 100 / basicP)
                })
            });
            return tmp;
        },
        handleSelected(type) {
            switch(type) {
                case 's':
                    break;
                case 'p10':
                    break;
                case 'r10':
                    break;
                case 's10':
                    break;
                case 'f5':
                    break;
            }
        }
    }
}
</script>
<style lang = "scss" scoped>
.statistics {
    width: calc(100% - 40px);
    .header {
        height: 28px;
        line-height: 28px;
    }
    .s-contain {
        width: calc(100% - 18px);
        padding: 0 0 0 18px;
        .item {
            padding: 16px 0 8px 0;
            display: inline-block;
            width: calc(33.33% - 6px);
            float: left;
            .label {
                font-size: 1rem;
                color: #525E69;
                letter-spacing: 0;
                margin-bottom: 4px;
            }
            .content {
                font-size: 1.875rem;
                color: #151E25;
                letter-spacing: 0;
                i {
                    /* margin-left: 12px; */
                    font-size: 1rem;
                    &.el-icon-top {
                        color: #FD2D55;
                    }
                    &.el-icon-bottom {
                        color: #33C85A;
                    }
                }
            }
        }
    }
}
.rank-area {
    /* width: calc(100% - 40px); */
    width: calc(25% - 40px - 9px);
    margin-right: 12px;
    height: 580px;
    position: relative;
    vertical-align: top;
    padding-bottom: 48px;
    &:nth-child(4n+1) {
        margin-right: 0px;
    }
    ul.rank {
        margin-top: 24px;
        padding-left: 0;
        margin: 28px 0 0 0;
        li {
            height: 26px;
            list-style: none;
            margin-bottom: 28px;
            &:last-child {
                margin-bottom: 0;
            }
            .label {
                margin-bottom: 6px;
                height: 20px;
                line-height: 20px;
                font-size: 1rem;
                .name {
                    display: inline-block;
                    color: #525E69;
                }
                .num {
                    display: inline-block;
                    float: right;
                    color: #525E69;
                }
            }
        }
    }
}

/* @media only screen and (max-width: 1600px) and (min-width: 1201px) {
    .statistics .s-contain .item {
        width: calc(33.33% - 11px);
    }
}
@media (min-width: 1601px) {
    .statistics .s-contain .item {
        width: calc(16.667% - 5.34px);
    }
} */
@media (min-width: 1251px) {
    .statistics .s-contain .item {
        width: calc(16.667% - 3px);
    }
}
/* @media only screen and (max-width: 1850px) and (min-width: 1201px) {
    .rank-area {
        width: calc(50% - 40px - 12px);
        margin-right: 24px;
        &:nth-child(2n+1) {
            margin-right: 0px;
        }
    }
} */
/* @media (min-width: 1851px) {
    .rank-area {
        width: calc(25% - 40px - 18px);
        margin-right: 24px;
        &:nth-child(4n+1) {
            margin-right: 0px;
        }
    }
} */
</style>