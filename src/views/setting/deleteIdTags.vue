<template>
    <el-dialog :title="$t('general.delete')" width="420px" :visible.sync="visible" custom-class="" :show-close="false" v-loading="isLoading" @close="closeDialog()">
        <div class="formVertical">
            <div class="form-item">
                {{ $t('general.deleteThis') }} {{ $t('menu.idTag').toLowerCase() }}?
                <h3>{{ $t('menu.information') }}</h3>
                <p>ID: {{ data[0].value }}</p>
                <p>{{ $t('idTags.parentIdTagId') }} :{{ data[0].parentIdTagValue }} </p>
                <p>{{ $t('idTags.expired') }} :{{ getLocTime(data[0].expired) }}</p>
                <p>{{ $t('idTags.blocked') }} :{{ data[0].blocked }}</p>
                <p>{{ $t('idTags.created') }} :{{ getLocTime(data[0].created) }}</p>
                <p>{{ $t('idTags.modified') }} :{{ getLocTime(data[0].modified) }} </p>

            </div>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="isUpdate = false; visible = false;">{{ $t('general.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="deleteIdTag">{{ $t('general.ok') }}</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { $HTTP_deleteIdTags } from "@/api/api";
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
export default {
    props: { show: Boolean, data: Array },
    data() {
        return {
            visible: false,
            isLoading: false,
            isUpdate: false
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    mounted() {
        const that = this;
        that.visible = that.show;
        that.$jQuery(".formVertical").length > 0 &&
            this.$jQuery(".formVertical").mCustomScrollbar("destroy");
        that.$nextTick(() => {
            setScrollBar(".formVertical", that);
        });
    },
    methods: {
        deleteIdTag() {
            const that = this;
            let params = {
                id: that.data[0].id
            };
            that.isLoading = true;

            $HTTP_deleteIdTags(params)
                .then((res) => {
                    that.isLoading = false;
                    if (res.status === 204) {
                        that.$message({
                            type: "success",
                            message: i18n.t("general.sucUpdateMsg")
                        });
                        that.isUpdate = true;
                        that.visible = false;
                    }
                })
                .catch((err) => {
                    if (err.status === 500) {
                        that.$message({
                            type: "warning",
                            message: i18n.t("cannotDelete")
                        });
                        that.visible = false;
                        that.isLoading = false;
                    }
                });
        },
        closeDialog() {
            this.$emit("close", this.isUpdate);
        }
    }
};
</script>

<style lang = "scss" scoped>
.formVertical {
    min-height: 250px;
    div {
        min-height: 250px;
    }
}
</style>
