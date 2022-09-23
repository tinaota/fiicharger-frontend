<template>
    <div class="downloadPdf">
        <el-button size="small" type="primary" @click="buttonClicked">{{ $t(`general.downloadPDF`) }}</el-button>
        <!-- add pdf templates -->
        <div class="" v-if="dropdownSelected==='chargePoints' && isDataDownloadComplete">
            <ChargePointsPDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></ChargePointsPDFTemplate>
        </div>
        <div class="" v-if="dropdownSelected==='chargePointUsage' && isDataDownloadComplete">
            <ChargePointsUsagePDFTemplate :tableData="tableData" :dropdownSelected="dropdownSelected" @pdfDownloaded="pdfDownloaded"></ChargePointsUsagePDFTemplate>
        </div>
    </div>
</template>


<script>
import {
    $HTTP_getAllChargeBoxList,
    $HTTP_getChargePointsUsage
} from "@/api/api";
import ChargePointsPDFTemplate from "@/components/reports/downloads/pdfTemplates/chargePointPDFTemplate.vue";
import ChargePointsUsagePDFTemplate from "@/components/reports/downloads/pdfTemplates/chargePointsUsagePDFTemplate.vue";
export default {
    components: {
        ChargePointsPDFTemplate,
        ChargePointsUsagePDFTemplate
    },
    props: {
        filterParams: Object,
        dropdownSelected: String,
        total: Number,
        fetchDataComplete: Boolean
    },
    emits: ["downloadPDFClicked"],
    data() {
        return {
            downloadPDFClicked: false,
            tableData: [],
            isDataDownloadComplete: false
        };
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
            let $API = null;
            if (this.dropdownSelected === "chargePoints") {
                $API = $HTTP_getAllChargeBoxList;
            } else if (this.dropdownSelected === "chargePointUsage") {
                $API = $HTTP_getChargePointsUsage;
            }
            $API(params)
                .then((res) => {
                    this.tableData = res.data;
                    this.isDataDownloadComplete = true;
                })
                .then(() => {
                    this.downloadPDFClicked = false;
                    this.$emit("downloadPDFClicked", false);
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
    }
}
</style>
