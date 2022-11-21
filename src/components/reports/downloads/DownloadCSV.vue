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
    $HTTP_getChargeStationsOverallSummary,
    $HTTP_getAllTransactions,
    $HTTP_getIdTagsList,
    $HTTP_getReservation
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
            downloadCSVClicked: false,
            removeKeys: []
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
                this.removeKeys = ["id", "connectors", "coordinates"];
            } else if (this.dropdownSelected === "chargePointUsage") {
                $API = $HTTP_getChargePointsUsage;
                this.removeKeys = ["id"];
            } else if (this.dropdownSelected === "chargeStationSummary") {
                $API = $HTTP_getChargeStationsSummary;
                this.removeKeys = ["id"];
            } else if (
                this.dropdownSelected === "chargeStationOverallSummary"
            ) {
                $API = $HTTP_getChargeStationsOverallSummary;
                this.removeKeys = [];
            } else if (this.dropdownSelected === "transactions") {
                $API = $HTTP_getAllTransactions;
                this.removeKeys = ["chargePointId"];
            } else if (this.dropdownSelected === "idTags") {
                $API = $HTTP_getIdTagsList;
                this.removeKeys = [];
            } else if (this.dropdownSelected === "reservations") {
                $API = $HTTP_getReservation;
                this.removeKeys = ["chargePointId"];
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
                    // remove keys with objects
                    let removeKeysAtIndex = [];
                    this.removeKeys.map((eachKey) => {
                        fields = fields.filter((item, index) => {
                            if (item != eachKey) {
                                return item;
                            } else {
                                removeKeysAtIndex.push(index);
                            }
                        });
                    });
                    let data = [];
                    response.map((item) => {
                        let values = Object.values(item);
                        // remove values at removekeys index
                        removeKeysAtIndex.map((eachKeyIndex) => {
                            values.splice(eachKeyIndex, 1);
                        });
                        data.push(values);
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
        padding: 0;
    }
}
</style>
