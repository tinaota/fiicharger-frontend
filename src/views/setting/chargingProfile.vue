<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('chargingStation.chargingProfile') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-button v-if="permissionEditAble" aria-label="plus icon" class="right" icon="el-icon-plus" @click="openDialog('create')"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol enable-row-click" v-loading="isLoading">
                    <el-table-column type="expand">
                        <template slot-scope="scope">
                            <el-table :data="scope.row.chargingSchedulePeriods">
                                <el-table-column :label="$t('chargingProfile.chargingSchedulePeriods')">
                                    <el-table-column prop="limit" :label="$t('chargingProfile.limit')" width="250">
                                        <template slot-scope="scope">
                                            {{scope.row.limit>=0 ? scope.row.limit + ' W':''}}
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="numberPhases" :label="$t('chargingProfile.numberPhases')" width="250"></el-table-column>
                                    <el-table-column prop="startPeriod" :label="$t('chargingProfile.startPeriod')" width="250">
                                        <template slot-scope="scope">
                                            {{getTimeFromSeconds(scope.row.startPeriod,'hh:mm A')}}
                                        </template>
                                    </el-table-column>
                                </el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>
                    <el-table-column prop="name" :label="$t('general.name')" width="200"></el-table-column>
                    <!-- <el-table-column prop="scheduleDuration" :label="$t('chargingProfile.scheduleDuration')" width="200"></el-table-column> -->
                    <el-table-column prop="chargingProfileKind" :label="$t('chargingProfile.chargingProfileKind')" width="200"></el-table-column>
                    <!-- <el-table-column prop="recurrencyKind" :label="$t('chargingProfile.recurrencyKind')" width="200"></el-table-column> -->
                    <el-table-column :label="$t('chargingProfile.startSchedule')" width="200">
                        <template slot-scope="scope">
                            {{ scope.row.startSchedule ? getLocTime(scope.row.startSchedule) : '' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.elecRateMin')" width="250">
                        <template slot-scope="scope">
                            {{ scope.row.minChargingRate ? scope.row.minChargingRate + scope.row.chargingRateUnit : '' }}
                        </template>
                    </el-table-column>
                    <el-table-column v-if="permissionEditAble" :label="$t('general.action')" width="200">
                        <template slot-scope="scope">
                            <el-button class="no-bg edit" aria-label="edit icon" @click="openDialog('edit',scope.row)"></el-button>
                            <el-button class="no-bg delete" aria-label="delete icon" @click="openDialog('delete',scope.row)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total}) }}</div>
                <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
                </el-pagination>
            </div>
            <UpdateChargingProfile :show="updateDialog.visible" :data="updateDialog.data" :profileKindList="profileKindList" :profilePurposeList="profilePurposeList" :chargingRateUnitList="chargingRateUnitList" @close="(isUpdate) => closeDialog(isUpdate, 'update')">
            </UpdateChargingProfile>
            <DeleteChargingProfile :show="deleteDialog.visible" :data="deleteDialog.data" @close="(isUpdate) => closeDialog(isUpdate, 'delete')"></DeleteChargingProfile>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime, convertSecondsToTime, catchErrors } from "@/utils/function";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import { $HTTP_getChargingProfilesTemplate } from "@/api/api";
import UpdateChargingProfile from "@/views/setting/updateChargingProfile";
import DeleteChargingProfile from "@/views/setting/deleteChargingProfile";
export default {
    components: {
        UpdateChargingProfile,
        DeleteChargingProfile
    },
    data() {
        return {
            permissionEditAble: this.$store.state.permissionEditable,
            filter: {
                profilePurpose: ""
            },
            tableData: [],
            isLoading: false,
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT,
            total: 1,
            profileKindList: {
                isLoading: false,
                data: ["Absolute", "Recurring", "Relative"]
            },
            profilePurposeList: {
                isLoading: false,
                data: ["ChargePointMaxProfile", "TxDefaultProfile", "TxProfile"]
            },
            chargingRateUnitList: {
                data: [
                    { name: "Watt", label: "W" },
                    { name: "Ampere", label: "A" }
                ]
            },
            updateDialog: {
                visible: false,
                data: {}
            },
            deleteDialog: {
                visible: false,
                data: {}
            }
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item, "lll");
        },
        getTimeFromSeconds() {
            return (seconds, format) => convertSecondsToTime(seconds, format);
        }
    },
    mounted() {
        setScrollBar(".scroll", this);
        this.fetchData();
    },
    methods: {
        // get table data
        fetchData(type) {
            let params = {
                page: this.page,
                limit: this.limit
            };

            if (type === "filter") {
                this.page = 1;
                params.page = 1;
            }
            this.isLoading = true;
            $HTTP_getChargingProfilesTemplate(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        this.$message({
                            type: "warning",
                            message: i18n.t("noData")
                        });
                    }
                })
                .catch((err) => {
                    this.isLoading = false;
                    this.tableData = [];
                    this.total = 0;
                    let errorMessage = catchErrors("ChargingProfiles Err", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        openDialog(type, data) {
            if (type === "delete") {
                this.deleteDialog.visible = true;
                this.deleteDialog.data = { ...data };
            } else {
                this.updateDialog.data = {
                    type: type
                };
                this.updateDialog.visible = true;
                if (type === "edit") {
                    this.updateDialog.data.info = { ...data };
                }
            }
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeDialog(isUpdate, dialog) {
            if (dialog === "delete") {
                this.deleteDialog.visible = false;
                // if final item is deleted take to previous page if present
                if (isUpdate && (this.tableData.length - 1) % $GLOBAL_PAGE_LIMIT === 0) {
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
        }
    }
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
