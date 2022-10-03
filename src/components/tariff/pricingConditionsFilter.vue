<template>
    <div class="pricingConditionsFilter">
        <div v-if="tabSelected==='time' || tabSelected==='all'" class="weekDay">
            <div class="item">
                <label>{{ $t('general.days') }}</label>
                <el-select class="autoresizeselect" v-model="daysSelected" clearable multiple filterable @change="updatePricingConditions">
                    <el-option v-for="item in daysList" :label="item" :key="item" :value="item.toUpperCase()"></el-option>
                </el-select>
            </div>
        </div>
        <div v-if="tabSelected==='time' || tabSelected==='all'" class="datePicker">
            <el-date-picker :default-time="['00:00:00', '23:59:59']" v-model="dateRange" type="daterange" format="yyyy-MM-dd" range-separator="-" :start-placeholder="$t('general.startDate')" :end-placeholder="$t('general.endDate')" :picker-options="pickerOptions" :clearable="true" class="datePickerFilter" @change="updatePricingConditions">
            </el-date-picker>
        </div>
        <div v-if="tabSelected==='time' || tabSelected==='all'" class="timePicker">
            <div class="item">
                <label>{{ $t('general.startTime') }}</label>
                <el-time-picker class="timePickerFilter" v-model="startTime" format="HH:mm" value-format="HH:mm" :default-value="defaultDateTime" :picker-options="{ start: '00:00', step: '00:01', end: '23:59' }" :placeholder="$t('general.startTime')" @change="updatePricingConditions">
                </el-time-picker>
            </div>
            <div class="item">
                <label>{{ $t('general.endTime') }}</label>
                <el-time-picker class="timePickerFilter" v-model="endTime" format="HH:mm" value-format="HH:mm" :default-value="defaultDateTime" :picker-options="{ start: '00:00', step: '00:01', end: '23:59' }" :placeholder="$t('general.endTime')" @change="updatePricingConditions">
                </el-time-picker>
            </div>
        </div>
        <div v-if="tabSelected==='time' || tabSelected==='all'" class="duration">
            <div class="item">
                <label>{{ $t('general.minDuration') }}</label>
                <el-input-number class="inputFilter" v-model="minDuration" :controls="false" @change="updatePricingConditions"> </el-input-number>
            </div>
            <div class="item">
                <label>{{ $t('general.maxDuration') }}</label>
                <el-input-number class="inputFilter" v-model="maxDuration" :controls="false" @change="updatePricingConditions"> </el-input-number>
            </div>
        </div>
        <div v-if="tabSelected==='kWh' || tabSelected==='all'" class="kWh">
            <div class="item">
                <label>{{ $t('general.minKwh') }}</label>
                <el-input-number class="inputFilter" v-model="minKwh" :controls="false" @change="updatePricingConditions"> </el-input-number>
            </div>
            <div class="item">
                <label>{{ $t('general.maxKwh') }}</label>
                <el-input-number class="inputFilter" v-model="maxKwh" :controls="false" @change="updatePricingConditions"> </el-input-number>
            </div>
        </div>
        <div v-if="tabSelected==='current' || tabSelected==='all'" class="current">
            <div class="item">
                <label>{{ $t('general.minCurrent') }}</label>
                <el-input-number class="inputFilter" v-model="minCurrent" :controls="false" @change="updatePricingConditions"> </el-input-number>
            </div>
            <div class="item">
                <label>{{ $t('general.maxCurrent') }}</label>
                <el-input-number class="inputFilter" v-model="maxCurrent" :controls="false" @change="updatePricingConditions"> </el-input-number>
            </div>
        </div>
        <div v-if="tabSelected==='power' || tabSelected==='all'" class="power">
            <div class="item">
                <label>{{ $t('general.minPower') }}</label>
                <el-input-number class="inputFilter" v-model="minPower" :controls="false" @change="updatePricingConditions"> </el-input-number>
            </div>
            <div class="item">
                <label>{{ $t('general.maxPower') }}</label>
                <el-input-number class="inputFilter" v-model="maxPower" :controls="false" @change="updatePricingConditions"> </el-input-number>
            </div>
        </div>
        <div v-if="tabSelected==='reservation' || tabSelected==='all'" class="reservation">
            <label>Reservation</label>
            <el-select class="select-small" v-model="reservation" :placeholder="$t(`chargingStation.reservation`)" @change="updatePricingConditions" filterable clearable>
                <el-option v-for="item in reservationList" :label="item.name" :key="item.name" :value="item.name"></el-option>
            </el-select>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: {
        tabSelected: String,
        restrictions: Object
    },
    emits: ["emitPriceConditionsDataFromFilter"],
    data() {
        return {
            startTime: null,
            endTime: null,
            minDuration: null,
            maxDuration: null,
            minKwh: null,
            maxKwh: null,
            minCurrent: null,
            maxCurrent: null,
            minPower: null,
            maxPower: null,
            reservation: null,
            dateRange: [],
            reservationList: [
                { name: "RESERVATION" },
                { name: "RESERVATION_EXPIRES" }
            ],
            pickerOptions: {},
            defaultDateTime: new Date().setHours(0, 0, 0, 0),
            daysSelected: null,
            daysList: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ]
        };
    },
    watch: {
        tabSelected: function () {
            this.populateData();
        }
    },
    watch: {
        restrictions: function () {
            this.populateData();
        }
    },

    mounted() {
        this.populateData();
    },
    methods: {
        populateData() {
            if (
                this.restrictions &&
                Object.keys(this.restrictions).length > 0
            ) {
                if (
                    this.restrictions.dayOfWeek &&
                    (this.tabSelected === "time" || this.tabSelected === "all")
                ) {
                    this.daysSelected = this.restrictions.dayOfWeek;
                }
                if (
                    this.restrictions.startTime &&
                    (this.tabSelected === "time" || this.tabSelected === "all")
                ) {
                    this.startTime = this.restrictions.startTime;
                }
                if (
                    this.restrictions.endTime &&
                    (this.tabSelected === "time" || this.tabSelected === "all")
                ) {
                    this.endTime = this.restrictions.endTime;
                }
                if (
                    this.restrictions.minDuration &&
                    (this.tabSelected === "time" || this.tabSelected === "all")
                ) {
                    this.minDuration = this.restrictions.minDuration;
                }
                if (
                    this.restrictions.maxDuration &&
                    (this.tabSelected === "time" || this.tabSelected === "all")
                ) {
                    this.maxDuration = this.restrictions.maxDuration;
                }
                if (
                    this.restrictions.minKwh &&
                    (this.tabSelected === "kWh" || this.tabSelected === "all")
                ) {
                    this.minKwh = this.restrictions.minKwh;
                }
                if (
                    this.restrictions.maxKwh &&
                    (this.tabSelected === "kWh" || this.tabSelected === "all")
                ) {
                    this.maxKwh = this.restrictions.maxKwh;
                }
                if (
                    this.restrictions.minCurrent &&
                    (this.tabSelected === "current" || this.tabSelected === "all")
                ) {
                    this.minCurrent = this.restrictions.minCurrent;
                }
                if (
                    this.restrictions.maxCurrent &&
                    (this.tabSelected === "current" || this.tabSelected === "all")
                ) {
                    this.maxCurrent = this.restrictions.maxCurrent;
                }
                if (
                    this.restrictions.minPower &&
                    (this.tabSelected === "power" || this.tabSelected === "all")
                ) {
                    this.minPower = this.restrictions.minPower;
                }
                if (
                    this.restrictions.maxPower &&
                    (this.tabSelected === "power" || this.tabSelected === "all")
                ) {
                    this.maxPower = this.restrictions.maxPower;
                }
                if (
                    this.restrictions.reservation &&
                    (this.tabSelected === "reservation" || this.tabSelected === "all")
                ) {
                    this.reservation = this.restrictions.reservation;
                }

                if (
                    this.restrictions.startDate &&
                    this.restrictions.endDate &&
                    (this.tabSelected === "time" || this.tabSelected === "all")
                ) {
                    this.dateRange = [
                        new Date(this.restrictions.startDate),
                        new Date(this.restrictions.endDate)
                    ];
                }
            }
            // update data after population
            this.updatePricingConditions()
        },
        updatePricingConditions() {
            let params = {};
            if (this.daysSelected) {
                params.dayOfWeek = this.daysSelected;
            }
            if (this.dateRange && this.dateRange.length > 0) {
                params.startDate = this.dateRange[0]
                    .toISOString()
                    .substr(0, 10);
                params.endDate = this.dateRange[1].toISOString().substr(0, 10);
            }

            if (this.startTime) {
                params.startTime = this.startTime;
            }
            if (this.endTime) {
                params.endTime = this.endTime;
            }
            if (this.minDuration) {
                params.minDuration = this.minDuration;
            }
            if (this.maxDuration) {
                params.maxDuration = this.maxDuration;
            }

            if (this.minKwh) {
                params.minKwh = this.minKwh;
            }
            if (this.maxKwh) {
                params.maxKwh = this.maxKwh;
            }
            if (this.minCurrent) {
                params.minCurrent = this.minCurrent;
            }
            if (this.maxCurrent) {
                params.maxCurrent = this.maxCurrent;
            }
            if (this.minPower) {
                params.minPower = this.minPower;
            }
            if (this.maxPower) {
                params.maxPower = this.maxPower;
            }
            if (this.reservation) {
                params.reservation = this.reservation;
            }
            this.$emit("emitPriceConditionsDataFromFilter", params);
        }
    }
};
</script>

<style lang="scss" scoped>
.pricingConditionsFilter {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
    .power,
    .current,
    .kWh,
    .duration,
    .timePicker,
    .weekDay {
        display: flex;
        .item {
            display: flex;
            flex-direction: column;
            margin: 0 5px 10px 0;
            label {
                margin-bottom: 2px;
            }
            .inputFilter,
            .timePickerFilter {
                width: 115px;
            }
        }
    }
    .reservation {
        display: flex;
        flex-direction: column;
        label {
            margin-bottom: 2px;
        }
    }
    .datePickerFilter {
        width: 220px;
        margin-top: 18px;
    }
}
</style>
