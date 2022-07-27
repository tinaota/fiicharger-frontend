<template>
    <div>
        <el-select class="select-small" v-model="idTag" :placeholder="$t('menu.idTag')" v-loading="idTagList.isLoading" @change="updateIdTag" filterable clearable>
            <el-option v-for="item in idTagList.data" :label="item.id" :key="item.id" :value="item.id"></el-option>
        </el-select>
    </div>
</template>
<script>
import { $HTTP_getIdTagsList } from "@/api/api";

export default {
    data() {
        return {
            idTag: "",
            idTagList: {
                isLoading: false,
                data: []
            }
        };
    },
    mounted() {
        this.fetchIdTags();
    },
    methods: {
        fetchIdTags() {
            this.idTagList.isLoading = true;
            $HTTP_getIdTagsList()
                .then((res) => {
                    this.idTagList.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.idTagList.data = res.data;
                    }
                })
                .catch((err) => {
                    this.idTagList.data = [];
                    console.log("idTagListError", err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        updateIdTag(){
            this.$emit("idTag",this.idTag)
        }
    }
};
</script>
