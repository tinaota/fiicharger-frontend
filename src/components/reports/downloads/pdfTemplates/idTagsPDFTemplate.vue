<template>
    <div style="visibility:hidden">
    </div>
</template>

<script>
import fiics_logo from "imgs/fiics_logo.png";
import { transformUtcToLocTime, getDefaultFont } from "@/utils/function";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import additionalPdfFonts from "@/assets/fonts/vfs_fonts";
export default {
    props: {
        tableData: Array,
        dropdownSelected: String
    },
    emits: ["pdfDownloaded"],
    data() {
        return { defaultFont: null };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        }
    },
    created() {
        this.defaultFont = getDefaultFont();
    },
    mounted() {
        this.generatePdf();
    },
    methods: {
        generatePdf() {
            let data = this.tableData.map((item) => {
                return [
                    {
                        text: item.value,
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text: item.parentIdTagValue,
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text: item.isBlocked,
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },

                    {
                        text:
                            item.expiryDate !== null
                                ? this.getLocTime(item.expiryDate)
                                : "",
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text:
                            item.created !== null
                                ? this.getLocTime(item.created)
                                : "",
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text:
                            item.modified !== null
                                ? this.getLocTime(item.modified)
                                : "",
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    }
                ];
            });
            var docDefinition = {
                pageOrientation: "landscape",
                pageSize: "A4",
                pageMargins: [40, 45, 40, 40],
                header: function () {
                    return [
                        {
                            columns: [
                                {
                                    image: fiics_logo,
                                    width: 120,
                                    margin: [38, 10, 0, 0]
                                },
                                {
                                    text: "info@fii-usa.com",
                                    color: "#525E69",
                                    margin: [250, 25, 0, 0]
                                },
                                {
                                    text: `${i18n
                                        .t(`reports.idTagsReport`)
                                        .toUpperCase()}`,
                                    alignment: "right",
                                    color: "#525E69",
                                    margin: [35, 25, 30, 0]
                                }
                            ]
                        },
                        {
                            canvas: [
                                {
                                    type: "line",
                                    x1: 40,
                                    y1: 5,
                                    x2: 815,
                                    y2: 5,
                                    lineColor: "#525E69",
                                    lineWidth: 0.1
                                }
                            ]
                        }
                    ];
                },
                footer: function (currentPage, pageCount) {
                    return [
                        {
                            text:
                                "Page" +
                                currentPage.toString() +
                                " of " +
                                pageCount,
                            alignment: "right",
                            margin: [0, 10, 35, 0],
                            color: "#525E69"
                        }
                    ];
                },
                content: [
                    {
                        layout: "lightHorizontalLines",
                        table: {
                            // headers are automatically repeated if the table spans over multiple pages
                            // you can declare how many rows should be treated as headers
                            headerRows: 1,
                            widths: [155, 125, 45, 120, 120, 120],
                            heights: 30,
                            dontBreakRows: true, //fix more spaces in first row in page break
                            body: [
                                [
                                    {
                                        text: "ID",
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t("idTags.parentIdTagId"),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t("idTags.blocked"),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t("idTags.expiryDate"),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t("idTags.created"),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t("idTags.modified"),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    }
                                ],
                                ...data
                            ]
                        }
                    }
                ],
                defaultStyle: {
                    font: this.defaultFont
                }
            };
            // download the PDF
            try {
                //open in a new tab
                //pdfMake.createPdf(docDefinition).open();
                pdfMake.vfs = {
                    ...pdfFonts.pdfMake.vfs,
                    ...additionalPdfFonts
                };
                pdfMake.fonts = {
                    NotoSansSC: {
                        normal: "NotoSansSC.ttf",
                        bold: "NotoSansSC.ttf"
                    },
                    NotoSansTC: {
                        normal: "NotoSansTC.ttf",
                        bold: "NotoSansTC.ttf"
                    },
                    Roboto: {
                        normal: "Roboto-Regular.ttf",
                        bold: "Roboto-Medium.ttf"
                    }
                };
                pdfMake
                    .createPdf(docDefinition)
                    .download(i18n.t(`reports.${this.dropdownSelected}Report`));
                this.$emit("pdfDownloaded", true);
            } catch (e) {
                this.$emit("pdfDownloaded", true);
                console.log("PDF creation error");
            }
        }
    }
};
</script>
