<template>
    <div>
        <div class="filter">
            <el-select class="select-small" v-model="filter.stopReason" placeholder="Stop Reason" v-loading="allTransactionsReasonList.isLoading" @change="getAllTransactions()" clearable>
                <el-option v-for="item in allTransactionsReasonList.data" :label="item" :key="item" :value="item"></el-option>
            </el-select>
        </div>
        <el-table :data="allTransactions" v-loading="isLoading">
            <el-table-column prop="chargePointId" label="Charge Point Id" :min-width="2"></el-table-column>
            <el-table-column prop="connectorId" label="Connector Id" :min-width="2"></el-table-column>
            <el-table-column prop="startIdTag" label="Start Id Tag" :min-width="2"></el-table-column>
            <el-table-column prop="meterStart" label="Meter Start" :min-width="2"></el-table-column>
            <!-- <el-table-column prop="reservationId" label="Reservation Id" :min-width="2"></el-table-column> -->
            <el-table-column label="Start Time Stamp" :min-width="2">
                <template slot-scope="scope">
                    {{getLocTime(scope.row.startTimestamp)}}
                </template>
            </el-table-column>
            <el-table-column prop="meterStop" label="Meter Stop" :min-width="2"></el-table-column>
            <el-table-column label="Stop Time Stamp" :min-width="2">
                <template slot-scope="scope">
                    {{getLocTime(scope.row.stopTimestamp)}}
                </template>
            </el-table-column>
            <el-table-column prop="stopReason" label="Stop Reason" :min-width="2"></el-table-column>
            <el-table-column prop="meterTotal" label="Meter Total" :min-width="2"></el-table-column>

        </el-table>
    </div>
</template>
    
    <script>
import { transformUtcToLocTime } from "@/utils/function";
import { $HTTP_getAllTransactionsReasonList, $HTTP_getAllTransactions } from "@/api/api";

export default {
    props: {
        chargerId: String,
    },
    data() {
        return {
            allTransactions: [],
            filter: {
                stopReason: "",
            },
            isLoading: false,
            allTransactionsReasonList: {
                data: [],
                isLoading: false,
            },
        };
    },
    computed: {
        getLocTime() {
            return (item) => transformUtcToLocTime(item);
        },
    },
    mounted() {
        this.getAllTransactions();
        this.getTransactionsReasonList();
    },
    methods: {
        getAllTransactions() {
            this.isLoading = true;
            let params = {};
            if (this.filter.stopReason) {
                params.StopReason = this.filter.stopReason;
            }
            if (this.chargerId) {
                params.ChargePointId = this.chargerId;
            }
            $HTTP_getAllTransactions(params)
                .then((res) => {
                    this.allTransactions = res.data;
                    this.isLoading = false;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
        getTransactionsReasonList() {
            this.allTransactionsReasonList.isLoading = true;
            $HTTP_getAllTransactionsReasonList()
                .then((res) => {
                    console.log(res);
                    this.allTransactionsReasonList.data = res;
                    this.allTransactionsReasonList.isLoading = false;
                })
                .catch((err) => {
                    console.log(err);
                });
        },
    },
};
</script>
    
