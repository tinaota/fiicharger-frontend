<template>
    <div>
        <el-select class="select-small" v-model="chargingProfile" :placeholder="$t('chargingStation.chargingProfile')" v-loading="chargingProfileList.isLoading" @change="updatechargingProfile" filterable clearable>
            <el-option v-for="item in chargingProfileList.data" :label="item.name" :key="item.id" :value="item.id"></el-option>
        </el-select>
    </div>
</template>
<script>
import { $HTTP_getChargingProfilesTemplate } from "@/api/api";

export default {
    emits: ["chargingProfile"],
    data() {
        return {
            chargingProfile: "",
            chargingProfileList: {
                isLoading: false,
                data: []
            }
        };
    },
    mounted() {
        this.fetchChargingProfile();
    },
    methods: {
        fetchChargingProfile() {
            this.chargingProfileList.isLoading = true;
            $HTTP_getChargingProfilesTemplate()
                .then((res) => {
                    this.chargingProfileList.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.chargingProfileList.data = res.data;
                    }
                })
                .catch((err) => {
                    this.chargingProfileList.data = [];
                    console.log("idTagListError", err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        updatechargingProfile() {
            this.$emit("chargingProfile", this.chargingProfile);
        }
    }
};
</script>
