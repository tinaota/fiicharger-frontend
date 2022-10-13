<template>
    <div>
        <vue-html2pdf :show-layout="false" :float-layout="true" :enable-download="false" :preview-modal="false" :filename="$t(`reports.${dropdownSelected}`)" :paginate-elements-by-height="1000" :pdf-quality="2" :manual-pagination="false" pdf-format="a4" pdf-orientation="landscape" pdf-content-width="1150px" @beforeDownload="beforeDownload($event)" ref="html2Pdf">
            <section slot="pdf-content">
                <section class="pdf-item" v-for="n in Math.ceil(tableData.length/dataPerPage)" :key="n">
                    <div class="mainReport">
                        <div class="tableInfo">
                            <el-table header-cell-class-name="pdfTableHeader" :data="tableData.slice((n-1)*dataPerPage, (n-1)*dataPerPage+(dataPerPage))">
                                <el-table-column prop="id" :label="$t('chargingStation.transactionId')" :min-width="2">
                                </el-table-column>
                                <el-table-column prop="chargePointId" :label="$t('chargingStation.chargerId')" :min-width="3"></el-table-column>
                                <!-- <el-table-column prop="connectorId" :label="$t('chargingStation.connector') + ' ID'" :min-width="1"> -->
                                <!-- </el-table-column> -->
                                <el-table-column prop="startIdTag" :label="$t('chargingStation.startIdTag')" :min-width="2"></el-table-column>
                                <el-table-column prop="stopIdTag" :label="$t('chargingStation.stopIdTag')" :min-width="2"></el-table-column>
                                <el-table-column prop="meterStart" :label="$t('chargingStation.meterStart')+' (KWH)'" :min-width="1">
                                    <template slot-scope="scope">
                                        {{ scope.row.meterStart!==null? scope.row.meterStart.toFixed(2) :'' }}
                                    </template>
                                </el-table-column>
                                <!-- <el-table-column prop="startTimestamp" :label="$t('chargingStation.startTimestamp')" :min-width="2">
                                    <template slot-scope="scope">
                                        {{ getLocTime(scope.row.startTimestamp) }}
                                    </template>
                                </el-table-column> -->
                                <el-table-column prop="meterStop" :label="$t('chargingStation.meterStop')+' (KWH)'" :min-width="1">
                                    <template slot-scope="scope">
                                        {{ scope.row.meterStop!==null? scope.row.meterStop.toFixed(2):'' }}
                                    </template>
                                </el-table-column>
                                <!-- <el-table-column prop="stopTimestamp" :label="$t('chargingStation.stopTimestamp')" :min-width="2">
                                    <template slot-scope="scope">
                                        {{ scope.row.stopTimestamp!==null? getLocTime(scope.row.stopTimestamp):'' }}
                                    </template>
                                </el-table-column> -->
                                <el-table-column prop="stopReason" :label="$t('chargingStation.stopReason')" :min-width="2"></el-table-column>
                                <el-table-column prop="meterTotal" :label="$t('chargingStation.meterTotal')+' (KWH)'" :min-width="1">
                                    <template slot-scope="scope">
                                        {{ scope.row.meterTotal!==null? scope.row.meterTotal.toFixed(2) :'' }}
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                </section>
            </section>
        </vue-html2pdf>
    </div>
</template>

<script>
import fiics_logo from "imgs/fiics_logo.png";
import { transformUtcToLocTime } from "@/utils/function";
import VueHtml2pdf from "vue-html2pdf";
export default {
    components: {
        VueHtml2pdf
    },
    props: {
        tableData: Array,
        dropdownSelected: String
    },
    emits: ["pdfDownloaded"],
    data() {
        return {
            fiics_logo: fiics_logo,
            dataPerPage: 15
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    mounted() {
        this.$refs.html2Pdf.generatePdf();
    },
    methods: {
        async beforeDownload({ html2pdf, options, pdfContent }) {
            await html2pdf()
                .set(options)
                .from(pdfContent)
                .toPdf()
                .get("pdf")
                .then((pdf) => {
                    const totalPages = pdf.internal.getNumberOfPages();
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        pdf.setFontSize(10);
                        pdf.setTextColor(150);
                        pdf.text(
                            "Page " + i + " of " + totalPages,
                            pdf.internal.pageSize.getWidth() * 0.88,
                            pdf.internal.pageSize.getHeight() - 0.3
                        );
                        // more documentation here as jspdf
                        // http://raw.githack.com/MrRio/jsPDF/master/docs/module-addImage.html#~addImage
                        // logo at bottom
                        pdf.addImage(
                            fiics_logo,
                            "png",
                            pdf.internal.pageSize.getWidth() - 1.45,
                            pdf.internal.pageSize.getHeight() - 0.25,
                            1,
                            0.2
                        );
                        // logo at top
                        pdf.addImage(fiics_logo, "png", 0.6, 0.35, 1.7, 0.4);
                        pdf.text(" info@fii-usa.com", 5.4, 0.7);
                        pdf.text(
                            `${i18n
                                .t(`reports.${this.dropdownSelected}`)
                                .toUpperCase()} REPORT`,
                            9.5,
                            0.6
                        );
                        pdf.setDrawColor(220, 220, 220);
                        pdf.setLineWidth(0.01);
                        pdf.line(0.5, 0.8, 11.4, 0.8);
                    }
                })
                .then(() => {
                    this.$emit("pdfDownloaded", true);
                })
                .save();
        }
    }
};
</script>


<style lang="scss" scoped>
.mainReport {
    margin: 0px 50px 0 50px;
    display: flex;
    .tableInfo:nth-child(0) {
        margin-top: 40px;
    }
    .tableInfo {
        display: flex;
        margin-top: 20px;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
    }
}
.pdf-item {
    .tableInfo {
        margin-top: 80px;
    }
}
</style>
