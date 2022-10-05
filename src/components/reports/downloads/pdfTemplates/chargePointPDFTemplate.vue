<template>
    <div>
        <vue-html2pdf :show-layout="false" :float-layout="true" :enable-download="false" :preview-modal="false" :filename="$t(`reports.${dropdownSelected}`)" :paginate-elements-by-height="1000" :pdf-quality="2" :manual-pagination="false" pdf-format="a4" pdf-orientation="landscape" pdf-content-width="1150px" @beforeDownload="beforeDownload($event)" ref="html2Pdf">
            <section slot="pdf-content">
                <section class="pdf-item" v-for="n in Math.ceil(tableData.length/dataPerPage)" :key="n">
                    <div class="mainReport">
                        <div class="tableInfo">
                            <el-table header-cell-class-name="pdfTableHeader" :data="tableData.slice((n-1)*dataPerPage, (n-1)*dataPerPage+(dataPerPage-1))">
                                <el-table-column prop="id" label="ID" :min-width="4"></el-table-column>
                                <el-table-column prop="name" :label="$t('general.name')" :min-width="4"></el-table-column>
                                <el-table-column prop="powerKw" :label="$t('chargingStation.power') + ' (kW)'" :min-width="1"></el-table-column>
                                <el-table-column :label="$t('general.type')" :min-width="1" class-name="center">
                                    <template slot-scope="scope">
                                        {{ scope.row.currentType }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="$t('chargingStation.lastHeartbeat')" :min-width="3">
                                    <template slot-scope="scope">
                                        {{ scope.row.lastHeartbeat!==null? getLocTime(scope.row.lastHeartbeat):'' }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="$t('userAccount.createdDate')" :min-width="3">
                                    <template slot-scope="scope">
                                        {{ scope.row.created!==null? getLocTime(scope.row.created):'' }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="$t('general.latestModification')" :min-width="3">
                                    <template slot-scope="scope">
                                        {{ scope.row.modified!==null? getLocTime(scope.row.modified):'' }}
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
            dataPerPage: 18
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
        th {
            color: red;
        }
    }
}
.pdf-item {
    .tableInfo {
        margin-top: 80px;
    }
}
</style>