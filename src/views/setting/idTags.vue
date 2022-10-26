<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.management') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.idTag') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <el-input placeholder="ID" v-model="filter.id" @change="fetchData('filter')" clearable>
                        <i slot="prefix" class="el-input__icon el-icon-search"></i>
                    </el-input>
                    <el-select class="select-small long" :placeholder="$t('idTags.expired')" v-model="filter.isExpired" @change="fetchData('filter')" clearable>
                        <el-option :label="$t('general.all')" value="all"></el-option>
                        <el-option label="True" value="true"></el-option>
                        <el-option label="False" value="false"></el-option>
                    </el-select>
                    <el-select class="select-small long" :placeholder="$t('idTags.blocked')" v-model="filter.isBlocked" @change="fetchData('filter')" clearable>
                        <el-option :label="$t('general.all')" value="all"></el-option>
                        <el-option label="True" value="true"></el-option>
                        <el-option label="False" value="false"></el-option>
                    </el-select>
                    <el-select class="select-small long" :placeholder="$t('idTags.parentIdTagId')" v-model="filter.parentIdTagId" v-loading="isLoading" @change="fetchData('filter')" filterable clearable>
                        <el-option v-for="(item, idx) in parentIdTagIdList" :label="item.value" :key="idx" :value="item.id"></el-option>
                    </el-select>
                    <el-button v-if="permissionEditAble" class="right" icon="el-icon-plus" @click="openDialog('create', tableData)"></el-button>
                </div>
                <el-table :data="tableData" class="moreCol enable-row-click" v-loading="isLoading">
                    <el-table-column prop="value" label="ID" :min-width="2"></el-table-column>
                    <el-table-column prop="parentIdTagValue" :label="$t('idTags.parentIdTagId')" :min-width="2"></el-table-column>
                    <el-table-column prop="isBlocked" :label="$t('idTags.blocked')" :min-width="2">
                        <template slot-scope="scope">
                            {{ scope.row.isBlocked.toString() }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="expiryDate" :label="$t('idTags.expiryDate')" :min-width="2">
                        <template slot-scope="scope">
                            {{ getLocTime(scope.row.expiryDate) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="created" :label="$t('idTags.created')" :min-width="2">
                        <template slot-scope="scope">
                            {{ getLocTime(scope.row.created) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="modified" :label="$t('idTags.modified')" :min-width="2">
                        <template slot-scope="scope">
                            {{ getLocTime(scope.row.modified) }}
                        </template>
                    </el-table-column>

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
            <UpdateIdTags v-if="createDialog.visible" :show="createDialog.visible" :dialogType="'create'" @close="closeDialog(null,'create')"></UpdateIdTags>
            <UpdateIdTags v-if="editDialog.visible" :show="editDialog.visible" :data="editDialog.data" :dialogType="'edit'" @close="closeDialog(null,'edit')"></UpdateIdTags>
            <DeleteIdTags v-if="deleteDialog.visible" :show="deleteDialog.visible" :data="deleteDialog.data" @close="(e)=>closeDialog(e,'delete')"></DeleteIdTags>
        </div>
    </div>
</template>

<script>
import { setScrollBar, transformUtcToLocTime } from "@/utils/function";
import { $GLOBAL_PAGE_LIMIT, $ALL_DATA_COUNT } from "@/utils/global";
import { $HTTP_getIdTagsList } from "@/api/api";
import UpdateIdTags from "@/views/setting/updateIdTags";
import DeleteIdTags from "@/views/setting/deleteIdTags";
export default {
    components: { UpdateIdTags, DeleteIdTags },
    data() {
        return {
            permissionEditAble: this.$store.state.permissionEditable,
            filter: {
                parentIdTagId: "",
                id: "",
                isExpired: null,
                isBlocked: null,
            },
            tableData: [],
            isLoading: false,
            page: 1,
            limit: $GLOBAL_PAGE_LIMIT,
            filterLimit: $ALL_DATA_COUNT,
            parentIdTagIdList:[],
            total: 0,
            dialog: {
                id: "",
                expiryDate: "",
                isBlocked: "",
                created: "",
                modified: "",
                parentIdTagId: "",
            },
            createDialog: {
                visible: false,
                isLoading: false,
            },
            editDialog: {
                visible: false,
                isLoading: false,
                data: [],
            },
            deleteDialog: {
                visible: false,
                isLoading: false,
                data: [],
            },
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        },
    },
    mounted() {
        setScrollBar(".scroll", this);
        // get parent Id Tag List
        this.getParentIdTagList();
        // get table data
        this.fetchData();
    },
    methods: {
        // get parent Id Tag List
        getParentIdTagList() {
            let params = {
                page: 1,
                limit: this.filterLimit,
            };
            $HTTP_getIdTagsList(params)
                .then((res) => {
                    if (res?.data?.length > 0) {
                        this.parentIdTagIdList = res.data;
                    }
                })
                .catch((err) => {
                    console.log("idTagListError", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },

        // get table data
        fetchData(type) {
            this.isLoading = true;
            let params = {
                page: this.page,
                limit: this.limit,
            };
            if (this.filter.id) {
                params.Value = this.filter.id;
            }

            if (this.filter.parentIdTagId) {
                params.ParentIdTagId = this.filter.parentIdTagId;
            }

            if (this.filter.isExpired && this.filter.isExpired!=="all") {
                params.IsExpired = this.filter.isExpired;
            }

            if (this.filter.isBlocked && this.filter.isBlocked!=="all") {
                params.IsBlocked = this.filter.isBlocked;
            }

            if (type === "filter") {
                this.page = 1;
                params.page = 1;
            }

            $HTTP_getIdTagsList(params)
                .then((res) => {
                    this.isLoading = false;

                    if (res?.data?.length > 0) {
                        this.tableData = res.data;
                        this.total = res.metadata.totalRows;
                    } else {
                        this.tableData = [];
                        this.total = 0;
                        if(this.filter.id ||this.filter.isExpired || this.filter.isBlocked || this.filter.parentIdTagId){
                            this.$message({ type: "warning", message: i18n.t("emptyMessage") });
                        }
                    }
                })
                .catch((err) => {
                    this.tableData = [];
                    this.total = 0;
                    console.log("idTagListError", err);
                    this.$message({ type: "warning", message: i18n.t("error_network") });
                });
        },
        changePage(page) {
            this.page = page;
            this.fetchData();
        },
        openDialog(type, data) {
            if (type === "create") {
                this.createDialog.visible = true;
            } else if (type === "edit") {
                this.editDialog.visible = true;
                this.editDialog.data = [data];
            } else if (type === "delete") {
                this.deleteDialog.visible = true;
                this.deleteDialog.data = [data];
            }
            this.$jQuery(".scroll").mCustomScrollbar("disable");
        },
        closeDialog(e, dialog) {
            if (dialog === "create") {
                this.createDialog.visible = false;
            } else if (dialog === "delete") {
                this.deleteDialog.visible = false;

                // if final item is deleted take to previous page if present
                if (e && this.tableData.length === 1) {
                    if (this.page >= 2) {
                        this.page = this.page - 1;
                    } else {
                        this.page = 1;
                    }
                }
            } else if (dialog === "edit") {
                this.editDialog.visible = false;
            }
            this.fetchData();
            this.getParentIdTagList();
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
