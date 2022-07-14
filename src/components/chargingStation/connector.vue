<template>
    <div class="content">
        <div class="connectors" v-if="count.available>0">
            <el-tooltip :content="$t('general.available')" placement="bottom" effect="light" popper-class="custom">
                <p class="circle-status available"></p>
            </el-tooltip>
            <p>{{count.available}}/{{count.total}} available</p>
        </div>
        <div class="connectors" v-if="count.inUse>0">
            <el-tooltip :content="$t('general.inUse')" placement="bottom" effect="light" popper-class="custom">
                <p class="circle-status inUse"></p>
            </el-tooltip>
            <p>{{count.inUse}}/{{count.total}} in use</p>
        </div>
        <div class="connectors" v-if="count.unavailable>0">
            <el-tooltip :content="$t('general.unavailable')" placement="bottom" effect="light" popper-class="custom">
                <p class="circle-status unavailable"></p>
            </el-tooltip>
            <p>{{count.unavailable}}/{{count.total}} unavailable</p>
        </div>
    </div>
</template>

<script>
export default {
    props: { dataObj: Array},
    data() {
        return {
            count: {
                available: 0,
                inUse: 0,
                unavailable: 0,
                total: 0,
            },
        };
    },
    created() {
        console.log(this.dataObj);
        this.dataObj.map((item) => {
            console.log(item);
            if (item.status === "Available") this.count.available += 1;
            else if (item.status === "Unavailable" || item.status === "Faulted") this.count.unavailable += 1;
            else if (
                item.status === "Preparing" ||
                item.status === "Charging" ||
                item.status === "SuspendedEV" ||
                item.status === "SuspendedEVSE" ||
                item.status === "Finishing" ||
                item.status === "Reserved"
            )
                this.count.inUse += 1;
        });
        this.count.total = this.dataObj.length;
    },
    methods: {},
};
</script>

<style lang = "scss" scoped>
.content {
    display: flex;
    flex-direction: column;
    .connectors {
        display: flex;
        p {
            margin-right: 5px;
            margin-block-start:10px;
            margin-block-end:10px;
        }
        .circle-status{
            margin-top: 12px;
        }
    }
}
</style>
