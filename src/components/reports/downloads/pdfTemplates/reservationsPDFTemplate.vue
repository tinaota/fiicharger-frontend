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
                        text: item.id,
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    // {
                    //     text: item.chargePointName,
                    //     color: "#525E69",
                    //     margin: [0, 10, 0, 0],
                    //     fontSize: 10
                    // },
                    {
                        text: item.connectorId,
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text: item.idTag,
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text: item.transactionId,
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text: item.status,
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
                            item.expiryDate !== null
                                ? this.getLocTime(item.expiryDate)
                                : "",
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text:
                            item.cancelled !== null
                                ? this.getLocTime(item.cancelled)
                                : "",
                        color: "#525E69",
                        margin: [0, 10, 0, 0],
                        fontSize: 10
                    },
                    {
                        text:
                            item.used !== null
                                ? this.getLocTime(item.used)
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
                pageMargins: [40, 60, 40, 40],
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
                                        .t(`reports.reservationReport`)
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
                            widths: [
                                20, 60, 100, 65, 60, 85, 85, 85, 85
                            ],
                            heights: 30,
                            dontBreakRows: true, //fix more spaces in first row in page break
                            body: [
                                [
                                    {
                                        text: "ID",
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    // {
                                    //     text: i18n.t(
                                    //         "chargingStation.chargePointName"
                                    //     ),
                                    //     bold: true,
                                    //     margin: [0, 20, 0, 0]
                                    // },
                                    {
                                        text: i18n.t(
                                            "chargingStation.connectorId"
                                        ),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t("menu.idTag"),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t(
                                            "chargingStation.transactionId"
                                        ),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t("general.status"),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t(
                                            "chargingStation.startDateTime"
                                        ),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t(
                                            "chargingStation.expiryDateTime"
                                        ),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t(
                                            "chargingStation.cancelledDateTime"
                                        ),
                                        bold: true,
                                        margin: [0, 20, 0, 0]
                                    },
                                    {
                                        text: i18n.t(
                                            "chargingStation.usedDateTime"
                                        ),
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
                    .download(i18n.t(`reports.reservationReport`));
                this.$emit("pdfDownloaded", true);
            } catch (e) {
                this.$emit("pdfDownloaded", true);
                console.log("PDF creation error");
            }
        }
    }
};
</script>
