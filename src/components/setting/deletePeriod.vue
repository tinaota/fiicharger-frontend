<template>
    <el-dialog :title="$t('general.delete')" width="420px" :visible.sync="visible" custom-class="inner" :show-close="false" v-loading="isLoading" @close="closeDialog()" append-to-body>
        <div class="formVertical">
            <p>{{ $t('general.deleteThis') }} <b>{{ data.id ? data.id : '' }}</b>?</p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="handleDel">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    props: {
        show: Boolean,
        data: Object
    },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false
        };
    },
    watch: {
        show: {
            deep: true,
            handler() {
                const that = this;
                that.visible = that.show;
                that.isUpdate = false;
            },
        },
    },
    beforeDestroy() {},
    methods: {
        handleDel() {
            this.isUpdate = true;
            this.visible = false;
        },
        closeDialog() {
            this.$emit("close", this.isUpdate, this.isCreate ? this.data.id : null);
        },
    },
};
</script>
<style lang = "scss" scoped>
.formVertical {
    min-height: 50px;
    div {
        min-height: 50px;
    }
    p {
        margin-bottom: 5px;
    }
}
</style>
