<template>
    <div class="inputComponent">
        <el-input :placeholder="$t('general.value')" :disabled="rowData.isReadOnly" v-model="value" @change="updateValue">
        </el-input>
        <i :class="{'hide':(rowData.isReadOnly),'fa fa-floppy-o':(!rowData.isReadOnly)}" aria-hidden="true" @click="updateInputValue"></i>
    </div>
</template>

<script>
export default {
    props: {
        rowData: Object
    },
    data() {
        return {
            value: "",
            params: {
                key: "",
                value: ""
            }
        };
    },
    mounted() {
        const that = this;
        that.value = that.rowData.value;
        that.params.key = that.rowData.key;
        that.params.value = that.rowData.value;
    },
    methods: {
        updateValue() {
            this.params.key = this.rowData.key;
            this.params.value = this.value;
        },
        updateInputValue() {
            this.$emit("saveInputClicked", this.params);
        }
    }
};
</script>
<style lang = "scss" scoped>
.inputComponent {
    display: flex;
    margin-right: 5px;
    .fa {
        margin-left: 2px;
        line-height: 28px;
        font-size: 20px;
    }
}
</style>
