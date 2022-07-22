<template>
    <el-switch v-model="defaultVal" @change="changeSwitch">
    </el-switch>
</template>

<script>
export default {
    props: {
        rowData: Object
    },
    data() {
        return {
            defaultVal: true
        };
    },
    mounted() {
        const that = this;
        that.defaultVal = that.rowData.value === "TRUE";
    },
    methods: {
        changeSwitch() {
            let params = {};
            if (this.rowData.value === "TRUE") {
                params.value = "FALSE";
            } else {
                params.value = "TRUE";
            }
            params.key = this.rowData.key;
            this.$emit("switchClicked", params);
        }
    }
};
</script>
