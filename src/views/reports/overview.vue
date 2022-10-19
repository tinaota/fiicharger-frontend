<template>
    <div class="scroll">
        <div class="mainctrl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>{{ $t('menu.report') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('menu.overview') }}</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="card-8 table-result">
                <div class="filter">
                    <CommonFilter @updateDropdown="updateDropdownSelected" @updateParams="updateParams"></CommonFilter>
                </div>
                <div v-if="dropdownSelected ==='chargePoints'">
                    <ChargePointsReport :filterParams="filterParams" dropdownSelected="chargePoints" :downloadClicked="downloadCSVClicked || downloadPDFClicked" @emitFetchedData="updateReportsData" :sortingParams="sortingParams" @tableSorting="updateSortingParams"></ChargePointsReport>
                </div>
                <div v-if="dropdownSelected ==='chargePointUsage'">
                    <ChargePointsUsageReport :filterParams="filterParams" dropdownSelected="chargePointUsage" :downloadClicked="downloadCSVClicked || downloadPDFClicked" @emitFetchedData="updateReportsData" :sortingParams="sortingParams" @tableSorting="updateSortingParams"></ChargePointsUsageReport>
                </div>
                <div v-if="dropdownSelected ==='chargeStationSummary'">
                    <ChargeStationsSummaryReport :filterParams="filterParams" dropdownSelected="chargeStationSummary" :downloadClicked="downloadCSVClicked || downloadPDFClicked" @emitFetchedData="updateReportsData" :sortingParams="sortingParams" @tableSorting="updateSortingParams"></ChargeStationsSummaryReport>
                </div>
                <div v-if="dropdownSelected ==='chargeStationOverallSummary'">
                    <ChargeStationsOverallSummaryReport :filterParams="filterParams" dropdownSelected="chargeStationOverallSummary" :downloadClicked="downloadCSVClicked || downloadPDFClicked" @emitFetchedData="updateReportsData" :sortingParams="sortingParams" @tableSorting="updateSortingParams"></ChargeStationsOverallSummaryReport>
                </div>
                <div v-if="dropdownSelected ==='transactions'">
                    <TransactionsReport :filterParams="filterParams" dropdownSelected="transactions" :downloadClicked="downloadCSVClicked || downloadPDFClicked" @emitFetchedData="updateReportsData" :sortingParams="sortingParams" @tableSorting="updateSortingParams"></TransactionsReport>
                </div>
                <div v-if="dropdownSelected ==='idTags'">
                    <IdTagsReport :filterParams="filterParams" dropdownSelected="idTags" :downloadClicked="downloadCSVClicked || downloadPDFClicked" @emitFetchedData="updateReportsData" :sortingParams="sortingParams" @tableSorting="updateSortingParams"></IdTagsReport>
                </div>
                <!-- add remaining reports -->

                <!-- add downloads option -->
                <div class="downloads" style="display:flex" v-loading="loading" :element-loading-text="$t('general.preparingDocument')" element-loading-spinner="el-icon-loading">
                    <DownloadCSV :filterParams="filterParams" :dropdownSelected="dropdownSelected" :sortingParams="sortingParams" :total="tableDataLength" :fetchDataComplete="fetchDataComplete" @downloadCSVClicked="updateDownloadCSVClicked"></DownloadCSV>
                    <DownloadPDF :filterParams="filterParams" :dropdownSelected="dropdownSelected" :sortingParams="sortingParams" :total="tableDataLength" :fetchDataComplete="fetchDataComplete" @downloadPDFClicked="updateDownloadPDFClicked"></DownloadPDF>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ChargePointsReport from "@/components/reports/chargePointsReport.vue";
import ChargePointsUsageReport from "@/components/reports/chargePointsUsageReport.vue";
import ChargeStationsSummaryReport from "@/components/reports/chargeStationsSummaryReport.vue";
import ChargeStationsOverallSummaryReport from "@/components/reports/chargeStationsOverallSummaryReport.vue";
import TransactionsReport from "@/components/reports/transactionsReport.vue";
import IdTagsReport from "@/components/reports/idTagsReport.vue";
import CommonFilter from "@/components/reports/filters/commonFilter.vue";
import DownloadCSV from "@/components/reports/downloads/DownloadCSV.vue";
import DownloadPDF from "@/components/reports/downloads/DownloadPDF.vue";
import { setScrollBar } from "@/utils/function";
export default {
    components: {
        ChargePointsReport,
        ChargePointsUsageReport,
        ChargeStationsSummaryReport,
        ChargeStationsOverallSummaryReport,
        TransactionsReport,
        IdTagsReport,
        CommonFilter,
        DownloadCSV,
        DownloadPDF
    },
    data() {
        return {
            dropdownSelected: "",
            filterParams: {},
            tableDataLength: null,
            downloadCSVClicked: false,
            fetchDataComplete: false,
            downloadPDFClicked: false,
            sortingParams: {},
            loading: false
        };
    },
    mounted() {
        setScrollBar(".scroll", this);
    },
    methods: {
        updateDropdownSelected(val) {
            this.dropdownSelected = val;
        },
        updateParams(val) {
            this.filterParams = val;
        },
        updateDownloadCSVClicked(val) {
            this.downloadCSVClicked = val;
            // update to false as download will happen after fetching all data
            this.fetchDataComplete = false;
            // only set loading true if csv is not clicked but data is fetched
            if (val) {
                this.loading = true;
            } else {
                this.loading = false;
            }
        },
        updateDownloadPDFClicked(val) {
            this.downloadPDFClicked = val;
            this.fetchDataComplete = false;
            // only set loading true if pdf is not clicked but data is fetched
            if (val) {
                this.loading = true;
            } else {
                this.loading = false;
            }
        },
        updateReportsData({ total, complete }) {
            // update only when downloads is clicked
            this.tableDataLength = total;
            this.fetchDataComplete = complete;
        },
        updateSortingParams(data) {
            this.sortingParams = { ...data };
        }
    }
};
</script>

<style lang="scss" scoped>
.mainctrl .card-8 {
    padding: 28px;
    width: calc(100% - 56px);
    position: relative;
    .filter {
        display: flex;
    }
}
</style>
