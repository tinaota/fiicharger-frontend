<template>
    <div class="connectors">
        <el-tooltip :content="$t(`${contentName}`)" placement="bottom" effect="light" popper-class="custom">
            <span :class="`circle-status ${className}`"></span>
        </el-tooltip>
        <span class="name">{{ value }} {{ $t('chargingStation.connector').toLowerCase() }} {{ lang==='en'? 's' : '' }} {{ $t(`${contentName}`).toLowerCase() }}</span>
    </div>
</template>

<script>
export default {
    props: {
        contentName: String,
        className: String,
        value: Number
    },
    data() {
        return {
            lang: this.$store.state.lang
        };
    },
};
</script>
<style lang="scss" scoped>
.connectors {
    display: flex;
    text-align: center;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
}
</style>
