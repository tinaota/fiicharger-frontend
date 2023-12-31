<template>
    <div class="downloadPdf">
        <el-button size="small" type="primary" @click="buttonClicked">{{ $t(`general.downloadPDF`) }}</el-button>
        <!-- add pdf templates -->
        <div v-if="dropdownSelected==='chargePoints' && isDataDownloadComplete">
            <ChargePointsPDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></ChargePointsPDFTemplate>
        </div>
        <div v-if="dropdownSelected==='chargePointUsage' && isDataDownloadComplete">
            <ChargePointsUsagePDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></ChargePointsUsagePDFTemplate>
        </div>
        <div v-if="dropdownSelected==='chargeStationSummary' && isDataDownloadComplete">
            <ChargeStationsSummaryPDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></ChargeStationsSummaryPDFTemplate>
        </div>
        <div v-if="dropdownSelected==='chargeStationOverallSummary' && isDataDownloadComplete">
            <ChargeStationsSummaryOverallPDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></ChargeStationsSummaryOverallPDFTemplate>
        </div>
        <div v-if="dropdownSelected==='transactions' && isDataDownloadComplete">
            <TransactionsPDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></TransactionsPDFTemplate>
        </div>
        <div v-if="dropdownSelected==='idTags' && isDataDownloadComplete">
            <IdTagsPDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></IdTagsPDFTemplate>
        </div>
        <div v-if="dropdownSelected==='reservations' && isDataDownloadComplete">
            <ReservationsPDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></ReservationsPDFTemplate>
        </div>
        <div v-if="dropdownSelected==='chargingProfiles' && isDataDownloadComplete">
            <ChargingProfilesPDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></ChargingProfilesPDFTemplate>
        </div>
    </div>
</template>


<script>
import {
    $HTTP_getAllChargeBoxList,
    $HTTP_getChargePointsUsage,
    $HTTP_getChargeStationsSummary,
    $HTTP_getChargeStationsOverallSummary,
    $HTTP_getAllTransactions,
    $HTTP_getIdTagsList,
    $HTTP_getReservation,
    $HTTP_getChargingProfilesRecord
} from "@/api/api";
import ChargePointsPDFTemplate from "@/components/reports/downloads/pdfTemplates/chargePointPDFTemplate.vue";
import ChargePointsUsagePDFTemplate from "@/components/reports/downloads/pdfTemplates/chargePointsUsagePDFTemplate.vue";
import ChargeStationsSummaryPDFTemplate from "@/components/reports/downloads/pdfTemplates/chargeStationsSummaryPDFTemplate.vue";
import ChargeStationsSummaryOverallPDFTemplate from "@/components/reports/downloads/pdfTemplates/chargeStationsSummaryOverallPDFTemplate.vue";
import TransactionsPDFTemplate from "@/components/reports/downloads/pdfTemplates/transactionsPDFTemplate.vue";
import IdTagsPDFTemplate from "@/components/reports/downloads/pdfTemplates/idTagsPDFTemplate.vue";
import ReservationsPDFTemplate from "@/components/reports/downloads/pdfTemplates/reservationsPDFTemplate.vue";
import ChargingProfilesPDFTemplate from "@/components/reports/downloads/pdfTemplates/chargingProfilesPDFTemplate.vue";
export default {
    components: {
        ChargePointsPDFTemplate,
        ChargePointsUsagePDFTemplate,
        ChargeStationsSummaryPDFTemplate,
        ChargeStationsSummaryOverallPDFTemplate,
        TransactionsPDFTemplate,
        IdTagsPDFTemplate,
        ReservationsPDFTemplate,
        ChargingProfilesPDFTemplate
    },
    props: {
        filterParams: Object,
        dropdownSelected: String,
        total: Number,
        fetchDataComplete: Boolean,
        sortingParams: Object
    },
    emits: ["downloadPDFClicked"],
    data() {
        return {
            downloadPDFClicked: false,
            tableData: [],
            isDataDownloadComplete: false
        };
    },
    computed: {
        selectedOrganization: function () {
            return this.$store.state.selectedOrganization;
        },
        userRole: function () {
            return this.$store.state.role;
        }
    },
    watch: {
        // update after only table data loads and clicking download
        fetchDataComplete: function () {
            if (this.downloadPDFClicked && this.fetchDataComplete) {
                this.downloadPDF();
            }
        }
    },
    methods: {
        buttonClicked() {
            this.downloadPDFClicked = true;
            this.$emit("downloadPDFClicked", true);
        },
        pdfDownloaded() {
            // change back to default after pdf is created and downloaded
            this.isDataDownloadComplete = false;
            // update the pdfclicked to default in parent
            this.$emit("downloadPDFClicked", false);
        },
        downloadPDF() {
            let params = { limit: this.total, ...this.filterParams };
            if (this.sortingParams) {
                params = { ...params, ...this.sortingParams };
            }
            let $API = null;
            if (this.dropdownSelected === "chargePoints") {
                $API = $HTTP_getAllChargeBoxList;
                if ((this.selectedOrganization.length >= 1  && this.userRole!=='Admin')|| (this.userRole==='Admin' && this.selectedOrganization[0]?.name!=='All')) {
                    params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
                }
            } else if (this.dropdownSelected === "chargePointUsage") {
                $API = $HTTP_getChargePointsUsage;
                if ((this.selectedOrganization.length >= 1  && this.userRole!=='Admin')|| (this.userRole==='Admin' && this.selectedOrganization[0]?.name!=='All')) {
                    params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
                }
            } else if (this.dropdownSelected === "chargeStationSummary") {
                $API = $HTTP_getChargeStationsSummary;
                if ((this.selectedOrganization.length >= 1  && this.userRole!=='Admin')|| (this.userRole==='Admin' && this.selectedOrganization[0]?.name!=='All')) {
                    params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
                }
            } else if (this.dropdownSelected === "chargeStationOverallSummary") {
                $API = $HTTP_getChargeStationsOverallSummary;
                if ((this.selectedOrganization.length >= 1  && this.userRole!=='Admin')|| (this.userRole==='Admin' && this.selectedOrganization[0]?.name!=='All')) {
                    params.OperatorIds = this.selectedOrganization.map((organization) => organization.id);
                }
            } else if (this.dropdownSelected === "transactions") {
                $API = $HTTP_getAllTransactions;
            } else if (this.dropdownSelected === "idTags") {
                $API = $HTTP_getIdTagsList;
            } else if (this.dropdownSelected === "reservations") {
                $API = $HTTP_getReservation;
            } else if (this.dropdownSelected === "chargingProfiles") {
                $API = $HTTP_getChargingProfilesRecord;
            }
            $API(params)
                .then((res) => {
                    // check this since the response is an object in this api
                    // other apis returns array of objects
                    if (this.dropdownSelected === "chargeStationOverallSummary") {
                        this.tableData = [res];
                    } else {
                        this.tableData = res.data;
                    }
                    this.isDataDownloadComplete = true;
                })
                .then(() => {
                    this.downloadPDFClicked = false;
                    // this.$emit("downloadPDFClicked", false);
                })
                .catch(() => {
                    this.downloadPDFClicked = false;
                    this.$emit("downloadPDFClicked", false);
                });
        }
    }
};
</script>

<style lang="scss" scoped>
.downloadPdf {
    margin-left: 5px;
    .el-button {
        background: #0263ff !important;
        color: #fff;
        border: unset;
        font-size: 1rem;
        width: 130px !important;
        height: 40px;
        border-radius: 6px;
        text-align: center;
        margin-left: 5px;
        padding: 0;
    }
}
</style>
