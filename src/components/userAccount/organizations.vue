<template>
    <div>
        <div class="card-8 table-result">
            <div class="filter">
                <el-input :placeholder="$t('general.name')" v-model="filter.organizationName" @change="fetchData('filter')" clearable>
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <el-button v-if="permissionEditAble" aria-label="plus icon" class="right" icon="el-icon-plus" @click="openDialog('create')"></el-button>
            </div>
            <el-table :data="tableData" class="" v-loading="isLoading">
                <el-table-column prop="name" :label="$t('general.name')" width="150"></el-table-column>
                <el-table-column prop="stationCount" :label="$t('dashboard.nStation')" width="145">
                    <template slot-scope="scope">
                        <el-link type="primary" underline @click="openDialog('stationCount',scope.row,scope.row.stationCount)">{{scope.row.stationCount}}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="chargerCount" :label="$t('chargingStation.nChargers')" width="180">
                    <template slot-scope="scope">
                        <el-link type="primary" underline @click="openDialog('chargerCount',scope.row,scope.row.chargerCount)">{{scope.row.chargerCount}}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="tariffCount" :label="$t('general.nTariffs')" width="140">
                    <template slot-scope="scope">
                        <el-link type="primary" underline @click="openDialog('tariffCount',scope.row, scope.row.tariffCount)">{{scope.row.tariffCount}}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="userCount" :label="$t('chargingStation.totalUsers')" width="140">
                    <template slot-scope="scope">
                        <el-link type="primary" underline @click="openDialog('userCount',scope.row,scope.row.userCount)">{{scope.row.userCount}}</el-link>
                    </template>
                </el-table-column>
                <el-table-column prop="website" :label="$t('general.website')" width="250">
                    <template slot-scope="scope">
                        <a :href="scope.row.website" target="_blank">{{scope.row.website}}</a>
                    </template>
                </el-table-column>
                <el-table-column prop="logo" :label="$t('userAccount.realLogo')" width="150">
                    <template slot-scope="scope">
                        <img v-if="scope.row.logo" :src="scope.row.logo" style="width:50px;height:50px" :alt="$t('userAccount.logo')" />
                    </template>
                </el-table-column>
                <el-table-column prop="created" :label="$t('general.created')" width="220">
                    <template slot-scope="scope">
                        {{ getLocTime(scope.row.created) }}
                    </template>
                </el-table-column>
                <el-table-column prop="modified" :label="$t('general.modified')" width="220">
                    <template slot-scope="scope">
                        {{ getLocTime(scope.row.modified) }}
                    </template>
                </el-table-column>
                <el-table-column v-if="permissionEditAble" :label="$t('general.action')" width="200">
                    <template slot-scope="scope">
                        <el-button class="no-bg edit" aria-label="edit icon" @click="openDialog('edit',scope.row)"></el-button>
                        <el-button class="no-bg delete" aria-label="delete icon" @click="openDialog('delete',scope.row)"></el-button>
                        <el-button class="no-bg fa fa-user-plus" style="color:#0263ff;margin-left:0" aria-label="invite icon" @click="openDialog('invite',scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="total">{{ $t("general.result", {item:total}) }}</div>
            <el-pagination background layout="prev, pager, next" :total="total" :pager-count="5" :page-size="limit" :current-page.sync="page" @current-change="changePage">
            </el-pagination>
        </div>
        <UpdateOrganizations v-if="dialog.isVisible && (dialog.type==='edit' || dialog.type=='create' || dialog.type==='delete')" :show="dialog.isVisible" :dialogType="dialog.type" :data="dialog.data" @close="closeDialog()"></UpdateOrganizations>
        <ShowOrganizationData v-if="dialog.isVisible && (dialog.type!=='edit' && dialog.type!=='create' && dialog.type!=='delete') && dialog.type!=='invite'" :show="dialog.isVisible" :dialogType="dialog.type" :data="dialog.data" @close="closeDialog()"></ShowOrganizationData>
        <InviteDialog v-if="dialog.isVisible && dialog.type==='invite'" :show="dialog.isVisible" :data="dialog.data" @close="closeDialog()"></InviteDialog>
    </div>
</template>

<script>
import { $GLOBAL_PAGE_LIMIT } from "@/utils/global";
import UpdateOrganizations from "@/components/userAccount/updateOrganizations";
import ShowOrganizationData from "@/components/userAccount/showOrganizationData";
import InviteDialog from "@/components/userAccount/inviteDialog";
import { $HTTP_getOrganizations } from "@/api/api";
import { setScrollBar, transformUtcToLocTime, catchErrors } from "@/utils/function";
export default {
    components: {
        UpdateOrganizations,
        ShowOrganizationData,
        InviteDialog
    },
    data() {
        return {
            permissionEditAble: this.$store.state.permissionEditable,
            filter: {
                organizationName: ""
            },
            isLoading: false,
            page: 1,
            total: 0,
            limit: $GLOBAL_PAGE_LIMIT,
            tableData: [],
            dialog: {
                data: {},
                isLoading: false,
                isVisible: false,
                type: ""
            },
            userId: this.$store.state.userInfo.id,
            userRole: this.$store.state.role
        };
    },
    created() {},
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    mounted() {
        setScrollBar(".scroll", this);
        this.fetchData();
    },
    methods: {
        fetchData(type) {
            let params = {
                page: this.page,
                limit: this.limit
            };

            if (this.filter.organizationName) {
                params.Name = this.filter.organizationName;
            }
            if (type === "filter") {
                this.page = 1;
                params.page = 1;
            }

            if (this.userRole !== "Admin") {
                params.UserId = this.userId;
            }
            $HTTP_getOrganizations(params)
                .then((res) => {
                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    let errorMessage = catchErrors("organizationListErr", err);
                    this.$message({ type: "warning", message: errorMessage });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        openDialog(action, data = null, value = null) {
            this.dialog.type = action;
            // do not open the dialog if the value is 0
            if (value === 0) {
                this.dialog.isVisible = false;
            } else {
                this.dialog.isVisible = true;
            }
            this.dialog.data = { ...data };
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeDialog() {
            // if final item is deleted take to previous page if present
            if (this.tableData.length === 1 && this.dialog.type === "delete") {
                if (this.page >= 2) {
                    this.page = this.page - 1;
                } else {
                    this.page = 1;
                }
            }
            this.dialog.type = "";
            this.dialog.isVisible = false;
            this.$jQuery(".scroll").mCustomScrollbar("update");
            // delay for 2 seconds before fetching
            setTimeout(() => {
                this.fetchData();
            }, 2000);
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
        right: 60px;
        bottom: 60px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5a607f;
        letter-spacing: 0;
    }
    .el-link {
        text-decoration: underline;
        color: #0056ff;
    }

    .el-link:hover {
        text-decoration: none;
        color: #0056ff;
    }
}
</style>
