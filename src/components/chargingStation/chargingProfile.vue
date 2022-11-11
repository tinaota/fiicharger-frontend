<template>
    <div class="table-result">
        <el-table :data="tableData" class="moreCol enable-row-click" v-loading="isLoading">
            <el-table-column prop="id" :label="$t('chargingProfile.id')" width="200"></el-table-column>
            <el-table-column prop="name" :label="$t('chargingProfile.name')" width="200"></el-table-column>
            <el-table-column prop="connectorId" :label="$t('chargingStation.connectorId')" width="200">
                <template slot-scope="scope">
                    {{ scope.row.connectorId === 0 ? $t('general.all'): scope.row.connectorId }}
                </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('general.status')" width="200"></el-table-column>
            <el-table-column prop="chargingProfilePurpose" :label="$t('chargingProfile.chargingProfilePurpose')" width="200"></el-table-column>\
            <el-table-column prop="isActive" :label="$t('general.active')" width="200">
                <template slot-scope="scope">
                    {{ scope.row.isActive? 'true': 'false' }}
                </template>
            </el-table-column>

            <!-- <el-table-column prop="chargingProfileInfo.maxPower" :label="$t('chargingProfile.maxPower')" width="200"></el-table-column> -->
            <!-- <el-table-column :label="$t('chargingProfile.validFrom')" :min-width="3">
                <template slot-scope="scope">
                    {{ scope.row.chargingProfileInfo.validFrom ? getLocTime(scope.row.chargingProfileInfo.validFrom) : '' }}
                </template>
            </el-table-column>
            <el-table-column :label="$t('chargingProfile.validTo')" :min-width="3">
                <template slot-scope="scope">
                    {{ scope.row.chargingProfileInfo.validTo ? getLocTime(scope.row.chargingProfileInfo.validTo) : '' }}
                </template>
            </el-table-column> -->
        </el-table>
        <div class="total">{{ $t("general.result", {item:total}) }}</div>
        <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
        </el-pagination>
    </div>
</template>

<script>
import { transformUtcToLocTime } from "@/utils/function";
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import { $HTTP_getChargingProfilesRecord } from "@/api/api";
export default {
    props: {
        chargerId: String,
        isUpdateData: Boolean
    },
    emits: ["updated"],
    data() {
        return {
            isLoading: false,
            tableData: [],
            total: 0,
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item, "YYYY-MM-DD HH:mm");
        }
    },
    watch: {
        isUpdateData: {
            handler() {
                if (this.isUpdateData) {
                    // delay for 5 seconds before fetching
                    setTimeout(() => {
                        this.fetchSpecProfileData();
                    }, 5000);
                }
            }
        }
    },
    mounted() {
        this.fetchSpecProfileData();
    },
    methods: {
        fetchSpecProfileData() {
            let params = {
                ChargePointId: this.chargerId,
                page: this.page,
                limit: this.limit
            };
            this.isLoading = true;
            $HTTP_getChargingProfilesRecord(params)
                .then((res) => {
                    this.isLoading = false;
                    if (res?.data.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                    }
                    this.$emit("updated");
                })
                .catch((err) => {
                    this.isLoading = false;
                    this.tableData = [];
                    this.total = 0;
                    this.$emit("updated");
                    console.log("ChargingProfiles Err", err);
                    this.$message({
                        type: "warning",
                        message: i18n.t("error_network")
                    });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchSpecProfileData();
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
        right: 54px;
        bottom: 66px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5a607f;
        letter-spacing: 0;
    }
}
</style>
