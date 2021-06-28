<template>
    <div class="scroll">
        <div class="mainctrl dashboard-statistics">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.dashboard') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.statistics') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <br/>
            <el-select
                class="select-small dark-header"
                v-model="curOperator"
                @change="changeOption">
                <el-option v-for="item in operatorList" :label="item" :key="item" :value="item"></el-option>
            </el-select>
            <br/>
            <div class="card-12 statistics">
                <div class="header">{{ $t('menu.statistics') }}
                    <el-select
                        class="select-small dark right"
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
                            <i v-if="statistics.billing[1]>0" class="el-icon-top"> {{ statistics.billing[1] }}%</i>
                            <i v-else class="el-icon-bottom"> {{ statistics.billing[1] }}%</i>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.energyUsedUnit') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.energyUsedUnit[0]) }}</span>
                            <i v-if="statistics.energyUsedUnit[1]>0" class="el-icon-top"> {{ statistics.energyUsedUnit[1] }}%</i>
                            <i v-else class="el-icon-bottom"> {{ statistics.energyUsedUnit[1] }}%</i>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.nAccount') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.nAccount) }}</span>
                        </div>
                    </div>
                    <div class="item">
                        <div class="label">{{ $t('dashboard.nStation') }}</div>
                        <div class="content">
                            <span>{{ new Intl.NumberFormat('en-IN').format(statistics.nStation) }}</span>
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
            <div class="card-12 rank-area">
                <div class="header">{{ $t('dashboard.powerUsedTop10') }}
                    <el-select
                        class="select-small dark right"
                        v-model="powerUsedTop10Day"
                        @change="handleSelected('p10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select>
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in powerUsedTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.id }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(powerUsedTop10.data[idx].val) }}</span>
                        </div>
                        <el-progress :class="{'spec': item.id==powerUsedTop10.most.id}" :percentage="item.val" :show-text="false" :stroke-width="12"></el-progress>
                    </li>
                </ul>
            </div>
            <div class="card-12 rank-area">
                <div class="header">{{ $t('dashboard.revenueTop10') }}
                    <el-select
                        class="select-small dark right"
                        v-model="revenueTop10Day"
                        @change="handleSelected('r10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select>
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in revenueTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.id }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(revenueTop10.data[idx].val) }}</span>
                        </div>
                        <el-progress :class="{'spec': item.id==revenueTop10.most.id}" :percentage="item.val" :show-text="false" :stroke-width="12"></el-progress>
                    </li>
                </ul>
            </div>
            <div class="card-12 rank-area">
                <div class="header">{{ $t('dashboard.sessionTop10') }}
                    <el-select
                        class="select-small dark right"
                        v-model="sessionTop10Day"
                        @change="handleSelected('s10')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select>
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in sessionTop10.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.id }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(sessionTop10.data[idx].val) }}</span>
                        </div>
                        <el-progress :class="{'spec': item.id==sessionTop10.most.id}" :percentage="item.val" :show-text="false" :stroke-width="12"></el-progress>
                    </li>
                </ul>
            </div>
            <div class="card-12 rank-area">
                <div class="header">{{ $t('dashboard.faultsTypeTop5') }}
                    <el-select
                        class="select-small dark right"
                        v-model="faultsTypeTop5Day"
                        @change="handleSelected('f5')">
                        <el-option v-for="(item, key) in daySelectList" :label="item" :key="key" :value="key"></el-option>
                    </el-select>
                </div>
                <ul class="rank">
                    <li v-for="(item, idx) in faultsTypeTop5.pData" :key="idx">
                        <div class="label">
                            <span class="name">{{ item.id }}</span>
                            <span class="num">{{ new Intl.NumberFormat('en-IN').format(faultsTypeTop5.data[idx].val) }}</span>
                        </div>
                        <el-progress :class="{'spec': item.id==faultsTypeTop5.most.id}" :percentage="item.val" :show-text="false" :stroke-width="12"></el-progress>
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
            curOperator: '',
            operatorList: [],
            daySelectList: i18n.t('dashboard.daySelectList'),
            statisticsDay: '7',
            statistics: {
                billing: [0,0],
                energyUsedUnit: [0,0],
                nAccount: 0,
                nStation: 0,
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
    },
    mounted() {
        this.fetchData();
    },
    methods : {
        fetchData() {
            this.$jQuery(".scroll").length > 0 && this.$jQuery(".scroll").mCustomScrollbar('destroy');
            this.statistics = Object.assign({}, DashboardData.statistics);
            this.operatorList = DashboardData.operatorList.slice();
            this.curOperator = this.operatorList[0];
            this.powerUsedTop10 = this.addPercentage(DashboardData.powerUsedTop10);
            this.revenueTop10 = this.addPercentage(DashboardData.revenueTop10);
            this.sessionTop10 = this.addPercentage(DashboardData.sessionTop10);
            this.faultsTypeTop5 = this.addPercentage(DashboardData.faultsTypeTop5);
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
    .s-contain {
        width: calc(100% - 32px);
        padding: 0 0 0 32px;
        .item {
            padding: 16px 0 8px 0;
            display: inline-block;
            width: calc(50% - 16px);
            float: left;
            .label {
                font-size: 1rem;
                color: #929292;
                letter-spacing: 0;
                margin-bottom: 6px;
            }
            .content {
                font-size: 1.875rem;
                color: #FCFCFC;
                letter-spacing: 0;
                i {
                    margin-left: 12px;
                    font-size: 1.5rem;
                    &.el-icon-top {
                        color: #FD2D55;
                    }
                    &.el-icon-bottom {
                        color: #32D850;
                    }
                }
            }
        }
    }
}
.rank-area {
    width: calc(100% - 40px);
    height: 70vh;
    min-height: 620px;
    position: relative;
    vertical-align: top;
    padding-bottom: 48px;
    ul.rank {
        margin-top: 24px;
        li {
            margin-bottom: 32px;
            &:last-child {
                margin-bottom: 0;
            }
            .label {
                margin-bottom: 6px;
                line-height: 20px;
                font-size: 0.875rem;
                .name {
                    display: inline-block;
                    color: #9EA7AC;
                }
                .num {
                    display: inline-block;
                    float: right;
                    color: #FFFFFF;
                }
            }
        }
    }
}

@media only screen and (max-width: 1600px) and (min-width: 1201px) {
    .statistics .s-contain .item {
        width: calc(33.33% - 11px);
    }
}
@media (min-width: 1601px) {
    .statistics .s-contain .item {
        width: calc(16.67% - 5.34px);
    }
}
@media only screen and (max-width: 1850px) and (min-width: 1201px) {
    .rank-area {
        width: calc(50% - 40px - 12px);
        margin-right: 24px;
        &:nth-child(2n+1) {
            margin-right: 0px;
        }
    }
}
@media (min-width: 1851px) {
    .rank-area {
        width: calc(25% - 40px - 18px);
        margin-right: 24px;
        &:nth-child(4n+1) {
            margin-right: 0px;
        }
    }
}
</style>