<template>
    <div class="tab">
        <div class="filter">
            <el-input
                :placeholder="$t('userAccount.idTag')+' / '+$t('userAccount.company')+' / '+$t('userAccount.userId')"
                class="dark"
                v-model="filter.tmpSearch"
                @change="fetchData('s')"
                clearable>
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <el-button class="right" icon="el-icon-plus" @click="openDialog(0)"></el-button>
        </div>
        <el-table
            :data="tableData.slice((page - 1) * 10, page * 10)"
            v-loading="isLoading"
            class="moreCol enable-row-click"
            @row-click="handleRowClick">
            <el-table-column prop="idTagCode" :label="$t('userAccount.idTag')" :min-width="2"></el-table-column>
            <el-table-column prop="company" :label="$t('userAccount.company')" :min-width="2"></el-table-column>
            <el-table-column prop="staffId" :label="$t('userAccount.userId')" :min-width="2"></el-table-column>
            <el-table-column prop="staffNameMask" :label="$t('userAccount.userName')" :min-width="2"></el-table-column>
            <el-table-column prop="emailMask" :label="$t('userAccount.email')" :min-width="3"></el-table-column>
            <el-table-column prop="fDate" :label="$t('userAccount.createdDate')" :min-width="2"></el-table-column>
            <el-table-column :label="$t('general.action')" :width="96">
                <template slot-scope="scope">
                    <el-button class="no-bg edit" @click="openDialog(1, scope.row)"></el-button>
                    <el-button class="no-bg delete" @click="deleteIdTag(scope.row.idTagCode)"></el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="total">{{ $t("general.result", {item:total})}}</div>
        <el-pagination background layout="prev, pager, next"
            :total="total"
            :pager-count="5"
            :page-size="10"
            :current-page.sync="page"
            @current-change="changePage">
        </el-pagination>
        <el-dialog
            :title="(dialog.type === 0) ? $t('general.create'): $t('general.modify')"
            width="600px"
            :visible.sync="dialog.visible"
            :show-close="false"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            v-loading="dialog.isLoading"
            @close="closeDialog()">
            <div class="vertial formVertical">
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.idTag') }}</div>
                    <el-input v-model="dialog.info.idTagCode"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.company') }}</div>
                    <el-input v-model="dialog.info.company"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.userId') }}</div>
                    <el-input v-model="dialog.info.staffId"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.userName') }}</div>
                    <el-input v-model="dialog.info.staffName"></el-input>
                </div>
                <div class="form-item">
                    <div class="label">{{ $t('userAccount.email') }}</div>
                    <el-input v-model="dialog.info.email"></el-input>
                </div>
                <div class="form-item" v-if="dialog.type">
                    <div class="label">{{ $t('userAccount.createdDate') }}</div>
                    <el-input v-model="dialog.info.fDate" disabled></el-input>
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="dialog.visible = false">{{ $t('general.cancel') }}</el-button>
                <el-button size="small" type="primary" @click="updateIdTagData">{{ $t('general.ok') }}</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { $HTTP_getIdTagList, $HTTP_addIdTag, $HTTP_updateIdTag, $HTTP_deleteIdTag } from "@/api/api";
import { setScrollBar } from "@/utils/function";
export default {
    data() {
        return {
            lang: '',
            filter: {
                tmpSearch: '',
                search: ''
            },
            isLoading: false,
            tableData: [],
            page: 1,
            total: 0,
            dialog: {
                visible: false,
                isLoading: false,
                type: 0,
                info: {
                    idTagCode: '',
                    company: '',
                    staffId: '',
                    staffName: '',
                    email: '',
                    // fDate: ''
                }
            },
        }
    },
    created() {
        this.lang = window.sessionStorage.getItem('fiics-lang');
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData(type) {
            const that = this;
            this.page = 1;
            this.isLoading = true;
            let param = {};
            if (type) {
                this.filter.search = this.filter.tmpSearch;
            }
            param.search = this.filter.search;
            $HTTP_getIdTagList(param).then((data) => {
                this.isLoading = false;
                if (!!data.success) {
                    this.tableData = data.idTagList.slice();
                    this.total = this.tableData.length;
                } else {
                    this.tableData = [];
                    this.total = 0;
                    this.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                this.tableData = [];
                this.total = 0;
                console.log(err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        changePage(page) {
            this.page = page;
        },
        handleRowClick(row, column, event) {
            if ($(event.path[0]).attr('class')!==undefined && $(event.path[0]).attr('class').includes('cell')) {
                const data = {
                    idTagCode: row.idTagCode,
                    memberCode: row.memberCode,
                    company: row.company,
                    staffId: row.staffId,
                    staffNameMask: row.staffNameMask,
                    emailMask: row.emailMask,
                    fDate: row.fDate
                }
                window.sessionStorage.setItem('fiics-idTagInfo', JSON.stringify(data));
                this.$router.push({ name: "idTagDetail", params: data }).catch();
            }
        },
        openDialog(type, data) {
            const that = this;
            this.dialog.type = type;
            if (!type) {
                this.dialog.info.fDate = '';
            } else {
                this.dialog.info = Object.assign({}, data);
            }
            this.dialog.visible = true;
            this.$jQuery(".scroll").mCustomScrollbar("disable");
            that.$jQuery(".formVertical").length > 0 && this.$jQuery(".formVertical").mCustomScrollbar('destroy');
            that.$nextTick(() => {
                setScrollBar('.formVertical', this);
            });
        },
        updateIdTagData() {
            const that = this;
            let   $API,
                  params = {
                            idTagCode: that.dialog.info.idTagCode,
                            company: that.dialog.info.company,
                            staffId: that.dialog.info.staffId,
                            staffName: that.dialog.info.staffName,
                            email: that.dialog.info.email
                  },
                  sucMsg = "";
            if (!that.dialog.type) {
                $API = $HTTP_addIdTag;
                sucMsg = i18n.t('general.sucAddMsg');
            } else {
                $API = $HTTP_updateIdTag;
                sucMsg = i18n.t('general.sucUpdateMsg');
            }
            that.dialog.isLoading = true;
            $API(params).then(data => {
                that.dialog.isLoading = false;
                if (!!data.success) {
                    that.$message({ type: "success", message: sucMsg });
                    that.fetchData();
                    that.dialog.visible = false;
                } else {
                    that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                }
            }).catch((err) => {
                console.log('updateIdTagData', err)
                this.$message({ type: "warning", message: i18n.t("error_network") });
            });
        },
        closeDialog() {
            this.$jQuery(".scroll").mCustomScrollbar("update");
        },
        deleteIdTag(id) {
            const that = this;
            this.$confirm(i18n.t('general.deleteItem', { item: id }), i18n.t('general.hint'), {
                showClose: false,
                customClass: 'custom'
            }).then(() => {
                $HTTP_deleteIdTag({idTagCode: id}).then(data => {
                    if (!!data.success) {
                        that.$message({ type: "success", message: i18n.t('general.sucDelMsg')});
                        that.fetchData();
                    } else {
                        that.$message({ type: "warning", message: that.lang === 'en' ? data.message : data.reason });
                    }
                });
            });
        },
    }
}
</script>
<style lang = "scss" scoped>
.card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .total {
        position: absolute;
        right: 48px;
        bottom: 58px;
        height: 36px;
        line-height: 36px;
        vertical-align: middle;
        font-size: 1rem;
        color: #5A607F;
        letter-spacing: 0;
    }
}
</style>