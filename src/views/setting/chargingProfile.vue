<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('chargingStation.chargingProfile') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-date-picker
                        v-model="filter.dateRange"
                        type="daterange"
                        value-format="yyyy-MM-dd"
                        format="yyyy-MM-dd"
                        range-separator="-"
                        :start-placeholder="$t('general.startDate')"
                        :end-placeholder="$t('general.endDate')"
                        @change="fetchData('filter')"
                        clearable>
                    </el-date-picker>
                    <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus" @click="openDialog('create')"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol enable-row-click" v-loading="isLoading">
                    <el-table-column prop="chargingProfileId" :label="$t('chargingProfile.id')" :min-width="2"></el-table-column>
                    <el-table-column prop="chargingProfileName" :label="$t('chargingProfile.name')"  :min-width="2"></el-table-column>
                    <el-table-column prop="maxPower_kW" :label="$t('chargingProfile.maxPower')"  :min-width="2"></el-table-column>
                    <el-table-column :label="$t('chargingProfile.validFrom')"  :min-width="3">
                        <template slot-scope="scope">
                            {{ scope.row.validFrom ? getLocTime(scope.row.validFrom) : '' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingProfile.validTo')"  :min-width="3">
                        <template slot-scope="scope">
                            {{ scope.row.validTo ? getLocTime(scope.row.validTo) : '' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="startTime" :label="$t('general.startTime')"  :min-width="2"></el-table-column>
                    <el-table-column prop="description" :label="$t('general.description')" :min-width="2"></el-table-column>
                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" :width="100">
                        <template slot-scope="scope">
                            <el-button class="no-bg edit" @click="openDialog('edit',scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="openDialog('delete',scope.row)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total}) }}</div>
                <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
                </el-pagination>
            </div>
            <UpdateChargingProfile
                :show="updateDialog.visible"
                :data="updateDialog.data"
                :profileKindList="profileKindList"
                :profilePurposeList="profilePurposeList"
                @close="(isUpdate) => closeDialog(isUpdate, 'update')">
            </UpdateChargingProfile>
            <DeleteChargingProfile :show="deleteDialog.visible" :data="deleteDialog.data" @close="(isUpdate) => closeDialog(isUpdate, 'delete')"></DeleteChargingProfile>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime, transformLocTimeToUtc } from "@/utils/function";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import {
    $HTTP_getChargingProfiles,
    $HTTP_getChargingProfilekind,
    $HTTP_getChargingProfilPurpose
} from "@/api/api";
import UpdateChargingProfile from "@/views/setting/updateChargingProfile";
import DeleteChargingProfile from "@/views/setting/deleteChargingProfile";
import moment from "moment";
const dateFormat = "YYYY-MM-DD HH:mm:ss";
export default {
    components: {
        UpdateChargingProfile,
        DeleteChargingProfile
    },
    data() {
        return {
            permissionEditAble: this.$store.state.permissionEditable,
            filter: {
                profilePurpose: "",
                dateRange: []
            },
            tableData: [],
            isLoading: false,
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT,
            total: 1,
            profileKindList: {
                isLoading: false,
                data: []
            },
            profilePurposeList: {
                isLoading: false,
                data: []
            },
            updateDialog: {
                visible: false,
                data: {},
            },
            deleteDialog: {
                visible: false,
                data: {},
            },
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item, "YYYY-MM-DD HH:mm");
        },
        getTime() {
            return (second, format) => {
                const millisecond = second * 1000;
                const hours = moment.duration(millisecond).hours();
                const minutes =  moment.duration(millisecond).minutes();
                const seconds =  moment.duration(millisecond).seconds();
                return moment().set({ "hour": hours, "minute": minutes, "second": seconds }).format(format)
            };
        }
    },
    mounted() {
        setScrollBar(".scroll", this);
        this.fetchProfileKindList();
        this.fetchProfilePurposeList();
        this.fetchData();
    },
    methods: {
        // get charging profile kind list
        fetchProfileKindList() {
            this.profileKindList.isLoading = true;
            $HTTP_getChargingProfilekind()
                .then((res) => {
                    this.profileKindList.isLoading = false;
                    this.profileKindList.data = res;
                })
                .catch((err) => {
                    console.log("profileKindList error", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        // get charging profile purpose list
        fetchProfilePurposeList() {
            this.profilePurposeList.isLoading = true;
            $HTTP_getChargingProfilPurpose()
                .then((res) => {
                    this.profilePurposeList.isLoading = false;
                    this.profilePurposeList.data = res;
                })
                .catch((err) => {
                    console.log("profilePurposeList error", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        // get table data
        fetchData(type) {
            let params = {
                page: this.page,
                limit: this.limit,
            };

            if (this.filter.dateRange?.length === 2) {
                params.validFrom = transformLocTimeToUtc(this.filter.dateRange[0], dateFormat);
                params.validTo = transformLocTimeToUtc(this.filter.dateRange[1], dateFormat);
            }

            if (type === "filter") {
                this.page = 1;
                params.page = 1;
            }
            this.isLoading = true;
            $HTTP_getChargingProfiles(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data.map(item => {
                            item.maxPower_kW = parseFloat((item.maxPower/1000).toFixed(1)) || 0;
                            item.startTime =  item.durationInSeconds === null ? "" : this.getTime(item.durationInSeconds, "HH:mm");
                            return item;
                        });
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        this.$message({
                            type: "warning",
                            message: i18n.t("emptyMessage")
                        });
                    }
                })
                .catch((err) => {
                    this.isLoading = false;
                    this.tableData = [];
                    this.total = 0;
                    console.log("ChargingProfiles Err", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        openDialog(type, data) {
            if (type === "delete") {
                this.deleteDialog.visible = true;
                this.deleteDialog.data = {...data};
            } else {
                this.updateDialog.data = {
                    type: type
                };
                this.updateDialog.visible = true;
                if (type === "edit") {
                    this.updateDialog.data.info = {...data};
                }
            }
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeDialog(isUpdate, dialog) {
            if (dialog === "delete") {
                this.deleteDialog.visible = false;
                // if final item is deleted take to previous page if present
                if (isUpdate && (this.tableData.length -1) % $GLOBAL_PAGE_LIMIT === 0) {
                    if (this.page >= 2) {
                        this.page = this.page - 1;
                    }
                }
            } else if (dialog === "update") {
                this.updateDialog.data = {};
                this.updateDialog.visible = false;
            }
            if (isUpdate) {
                this.fetchData();
            }
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
    },
};
</script>
<style lang = "scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .total {
        position: absolute;
        right: 28px;
        bottom: 28px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5a607f;
        letter-spacing: 0;
    }
}
</style>
