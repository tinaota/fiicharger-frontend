<template>
    <div class="downloadCsv">
        <el-button size="small" type="primary" @click="buttonClicked">{{ $t(`general.downloadCSV`) }}</el-button>
    </div>
</template>

<script>
import {
    $HTTP_getAllChargeBoxList,
    $HTTP_getChargePointsUsage,
    $HTTP_getChargeStationsSummary,
    $HTTP_getChargeStationsOverallSummary
} from "@/api/api";
import Papa from "papaparse";
export default {
    props: {
        filterParams: Object,
        dropdownSelected: String,
        total: Number,
        fetchDataComplete: Boolean,
        sortingParams: Object
    },
    emits: ["downloadCSVClicked"],
    data() {
        return {
            downloadCSVClicked: false
        };
    },
    watch: {
        // update after only table data loads and clicking download
        fetchDataComplete: function () {
            if (this.downloadCSVClicked && this.fetchDataComplete) {
                this.downloadCSV();
            }
        }
    },
    methods: {
        buttonClicked() {
            this.downloadCSVClicked = true;
            this.$emit("downloadCSVClicked", true);
        },
        downloadCSV() {
            let params = { limit: this.total, ...this.filterParams };
            if (this.sortingParams) {
                params = { ...params, ...this.sortingParams };
            }
            let $API = null;
            if (this.dropdownSelected === "chargePoints") {
                $API = $HTTP_getAllChargeBoxList;
            } else if (this.dropdownSelected === "chargePointUsage") {
                $API = $HTTP_getChargePointsUsage;
            } else if (this.dropdownSelected === "chargeStationSummary") {
                $API = $HTTP_getChargeStationsSummary;
            } else if (
                this.dropdownSelected === "chargeStationOverallSummary"
            ) {
                $API = $HTTP_getChargeStationsOverallSummary;
            }
            $API(params)
                .then((res) => {
                    let response;
                    // check this since the response is an object in this api
                    // other apis returns array of objects
                    if (
                        this.dropdownSelected === "chargeStationOverallSummary"
                    ) {
                        response = [res];
                    } else {
                        response = res.data;
                    }
                    // get fields
                    // can localize fields from here
                    let fields = Object.keys(response[0]).map((item) => item);
                    let data = [];
                    response.map((item) => {
                        data.push(Object.values(item));
                    });
                    let csv = Papa.unparse({
                        fields: fields,
                        data: data
                    });
                    // download csv
                    var blob = new Blob([csv]);
                    if (window.navigator.msSaveOrOpenBlob)
                        // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
                        window.navigator.msSaveBlob(
                            blob,
                            `${i18n.t(`reports.${this.dropdownSelected}`)}.csv`
                        );
                    else {
                        var a = window.document.createElement("a");
                        a.href = window.URL.createObjectURL(blob, {
                            type: "text/plain"
                        });
                        a.download = `${i18n.t(
                            `reports.${this.dropdownSelected}`
                        )}.csv`;

                        document.body.appendChild(a);
                        a.click(); // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
                        document.body.removeChild(a);
                    }
                })
                .then(() => {
                    this.downloadCSVClicked = false;
                    this.$emit("downloadCSVClicked", false);
                })
                .catch(() => {
                    this.downloadCSVClicked = false;
                    this.$emit("downloadCSVClicked", false);
                });
        }
    }
};
</script>

<style lang="scss" scoped>
.downloadCsv {
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
