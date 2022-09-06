<template>
    <div>
        <el-select class="select-small" v-model="selected" :placeholder="$t(`${placeHolder}`)" v-loading="list.isLoading" @change="updateSelected" filterable clearable>
            <el-option v-for="item in list.data" :label="item.selectedLabel" :key="item.id" :value="item.id"></el-option>
        </el-select>
    </div>
</template>
<script>
import {
    $HTTP_getIdTagsList,
    $HTTP_getChargingProfilesTemplate
} from "@/api/api";

export default {
    props: {
        listType: String,
        placeHolder: String,
        selectedLabel: String
    },
    emits: ["updateData"],
    data() {
        return {
            selected: "",
            list: {
                isLoading: false,
                data: []
            },
            $API: null
        };
    },
    mounted() {
        if (this.listType === "idTag") {
            this.$API = $HTTP_getIdTagsList;
        } else if (this.listType === "chargingProfile") {
            this.$API = $HTTP_getChargingProfilesTemplate;
        }
        this.fetchList();
    },
    methods: {
        fetchList() {
            this.list.isLoading = true;
            this.$API()
                .then((res) => {
                    this.list.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.list.data = res.data;
                    }
                })
                .catch((err) => {
                    this.list.data = [];
                    console.log("getListError", err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        updateSelected() {
            this.$emit("updateData", this.selected);
        }
    }
};
</script>
