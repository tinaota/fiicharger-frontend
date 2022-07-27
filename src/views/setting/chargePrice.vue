<template>
    <div class="chargePrice">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.price') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-input :placeholder="$t('general.name')" v-model="filter.name" @change="fetchData('filter')" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus" @click="openDialog('create')"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol" v-loading="isLoading">
                    <el-table-column prop="name" :label="$t('general.name')" :min-width="2"></el-table-column>
                    <el-table-column :label="$t('chargingStation.elecRate')">
                        <el-table-column :label="$t('chargingStation.onPeak')" :min-width="3" :render-header="(h, {column}) => renderTipsHeader(h, {column}, true)">
                            <template slot-scope="scope">
                                {{ getSymbols(scope.row.currencyType) + getSymbols(scope.row.onPeak.rate) + '/' + getSymbols(scope.row.onPeak.type) }}
                            </template>
                        </el-table-column>
                        <el-table-column :label="$t('chargingStation.offPeak')" :min-width="3" :render-header="(h, {column}) => renderTipsHeader(h, {column}, false)">
                            <template slot-scope="scope">
                                {{ getSymbols(scope.row.currencyType) + getSymbols(scope.row.offPeak.rate) + '/' + getSymbols(scope.row.offPeak.type) }}
                            </template>
                        </el-table-column>
                    </el-table-column>
                    <el-table-column :label="$t('chargingStation.parkingRate')" :min-width="2">
                        <template slot-scope="scope">
                            {{ getSymbols(scope.row.currencyType) + getSymbols(scope.row.occupancy.rate) + '/' + getSymbols(scope.row.occupancy.type) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="modified" :label="$t('general.latestModification')" :min-width="2">
                        <template slot-scope="scope">
                            {{ getLocTime(scope.row.modified) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('general.action')" :width="130" v-if="permissionEditAble">
                        <template slot-scope="scope">
                            <el-button class="no-bg edit" @click="openDialog('edit', scope.row)"></el-button>
                            <el-button class="no-bg delete" @click="openDialog('delete',scope.row)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="total">{{ $t("general.result", {item:total}) }}</div>
                <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
                </el-pagination>
                <UpdateChargePrice v-if="createDialog.show" :show="createDialog.show" :dialogType="'create'" @close="closeDialog(null,'create')"></UpdateChargePrice>
                <UpdateChargePrice v-if="editDialog.show" :show="editDialog.show" :dialogType="'edit'" :data="editDialog.data" @close="closeDialog(null,'edit')"></UpdateChargePrice>
                <DeleteChargePrice v-if="deleteDialog.show" :show="deleteDialog.show" :data="deleteDialog.data" :dialogType="'delete'" @close="(e)=>closeDialog(e,'delete')"></DeleteChargePrice>

            </div>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime, transformToSymbols } from "@/utils/function";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import { $HTTP_getPriceStatusList} from "@/api/api";
import UpdateChargePrice from "@/views/setting/updateChargePrice";
import DeleteChargePrice from "@/views/setting/deleteChargePrice";

export default {
    components: {
        UpdateChargePrice,
        DeleteChargePrice,
    },
    data() {
        return {
            permissionEditAble: this.$store.state.permissionEditable,
            priceStatusList: {
                isLoading: false,
                data: {},
            },
            filter: {
                priceStatus: "",
                name: "",
            },
            tableData: [],
            isLoading: false,
            page: 1,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            dialog: {
                visible: false,
                isLoading: false,
                info: {
                    name: "",
                    onPeak: {
                        rate: 0,
                        type: "",
                    },
                    offPeak: {
                        rate: 0,
                        type: "",
                    },
                    occupancyRate: 0,
                    occupancyPeriodMinutes: 1,
                    currencyType: "",
                },
            },
            createDialog: {
                show: false,
                isLoading: false,
            },
            editDialog: {
                show: false,
                isLoading: false,
                data: {},
            },
            deleteDialog: {
                isLoading: false,
                show: false,
                data: {},
            },
        };
    },
    computed: {
        getSymbols() {
            return (item) => transformToSymbols(item);
        },
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        },
    },
    mounted() {
        setScrollBar(".scroll", this);
        this.fetchData();
    },
    methods: {
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        fetchData(type) {
            this.isLoading = true;
            let params = {
                page: this.page,
                limit: this.limit,
            };
            if (this.filter.name) {
                params.Name = this.filter.name;
            }
            // reset page to 1
            if (type === "filter") {
                this.page = 1;
                params.page = 1;
            }
            $HTTP_getPriceStatusList(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        if(this.filter.name){
                            this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                        }
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    console.log(err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        openDialog(type, data) {
            if (type === "create") {
                this.createDialog.show = true;
            } else if (type === "edit") {
                this.editDialog.show = true;
                this.editDialog.data = data;
            } else if (type === "delete") {
                this.deleteDialog.show = true;
                this.deleteDialog.data = data;
            }
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeDialog(e, dialog) {
            if (dialog === "create") {
                this.createDialog.show = false;
            } else if (dialog === "delete") {
                this.deleteDialog.show = false;

                // if final item is deleted take to previous page if present
                if (e && this.tableData.length === 1) {
                    if (this.page >= 2) {
                        this.page = this.page - 1;
                    } else {
                        this.page = 1;
                    }
                }
            } else if (dialog === "edit") {
                this.editDialog.show = false;
            }
            this.fetchData();

            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        renderTipsHeader(h, { column }, isOnPeak) {
            return h("div", [
                h("span", column.label),
                h(
                    "el-tooltip",
                    {
                        props: {
                            effect: "light",
                            content: isOnPeak
                                ? i18n.t("chargingStation.onPeakHint")
                                : i18n.t("chargingStation.offPeakHint"),
                            placement: "bottom",
                            "popper-class": "custom",
                        },
                    },
                    [
                        h("i", {
                            class: "el-icon-warning-outline",
                            style: "color:#0C83FF; margin-left:4px; font-weight: bold;",
                        }),
                    ]
                ),
            ]);
        },
    },
};
</script>

<style lang="scss" scoped>
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
