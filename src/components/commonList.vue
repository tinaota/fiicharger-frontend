<template>
    <div style="width:100%">
        <el-select style="width:100%" v-if="selectedLabel==='id'" class="select-small" v-model="selected" :placeholder="$t(`${placeHolder}`)" v-loading="list.isLoading" @change="updateSelected" filterable clearable>
            <el-option v-for="item in list.data" :label="item.id" :key="item.id" :value="item.id"></el-option>
        </el-select>
        <el-select style="width:100%" v-if="selectedLabel==='name'" class="select-small" v-model="selected" :placeholder="$t(`${placeHolder}`)" v-loading="list.isLoading" @change="updateSelected" filterable clearable>
            <el-option v-for="item in list.data" :label="item.name" :key="item.id" :value="item.id"></el-option>
        </el-select>
    </div>
</template>
<script>
import {
    $HTTP_getIdTagsList,
    $HTTP_getChargingProfilesTemplate,
    $HTTP_getReservation,
    $HTTP_getAllTransactions
} from "@/api/api";

export default {
    props: {
        listType: String,
        placeHolder: String,
        selectedLabel: String,
        data: Object
    },
    emits: ["updateData"],
    data() {
        return {
            selected: "",
            list: {
                isLoading: false,
                data: []
            },
            $API: null,
            params: {}
        };
    },
    watch: {
        data: function () {
            this.setApiAndParams();
            this.fetchList();
        }
    },
    mounted() {
        this.setApiAndParams();
        this.fetchList();
    },
    methods: {
        setApiAndParams() {
            if (this.listType === "idTag") {
                this.$API = $HTTP_getIdTagsList;
            } else if (this.listType === "chargingProfile") {
                this.$API = $HTTP_getChargingProfilesTemplate;
            } else if (this.listType === "reservation") {
                this.$API = $HTTP_getReservation;
                this.params = {
                    isActive: true,
                    ChargePointId: this.data.chargePointId,
                    ConnectorId: this.data.connectorId
                };
            } else if (this.listType === "transaction") {
                this.$API = $HTTP_getAllTransactions;
                this.params = {
                    isActive: true,
                    ChargePointId: this.data.chargePointId,
                    ConnectorId: this.data.connectorId
                };
            }
        },
        fetchList() {
            this.list.isLoading = true;
            let params = { ...this.params };
            this.$API(params)
                .then((res) => {
                    this.list.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.list.data = res.data;
                        // set selected to highest id if present
                        let highestId;
                        if (this.selectedLabel === "id") {
                            highestId = Math.max(
                                ...res.data.map((item) => item.id)
                            );
                            if (highestId) {
                                this.selected = highestId;
                                this.$emit("updateData", this.selected);
                            }
                        }
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
